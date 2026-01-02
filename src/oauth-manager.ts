import * as http from 'http';
import * as https from 'https';
import * as url from 'url';
import * as crypto from 'crypto';
import { Logger } from './logger.js';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface OAuthTokens {
  accessToken: string;
  expiresIn?: number;
  refreshToken?: string;
  obtainedAt: number;
}

const AUTHORIZATION_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const SCOPES = [
  'openid',
  'profile',
  'email',
  'w_member_social',
].join(' ');

export class OAuthManager {
  private logger: Logger;
  private config: OAuthConfig;
  private tokenCache: OAuthTokens | null = null;
  private server?: http.Server;

  constructor(config: OAuthConfig, logger: Logger = new Logger()) {
    this.logger = logger;
    this.config = config;
  }

  /**
   * Get a valid access token, triggering OAuth flow if needed
   */
  async getAccessToken(): Promise<string> {
    // Try to use cached token
    if (this.tokenCache && this.isTokenValid(this.tokenCache)) {
      this.logger.debug('Using in-memory cached access token');
      return this.tokenCache.accessToken;
    }

    // If we have a refresh token, try to refresh
    if (this.tokenCache?.refreshToken) {
      try {
        this.logger.info('Attempting to refresh access token');
        const newTokens = await this.refreshAccessToken(this.tokenCache.refreshToken);
        return newTokens.accessToken;
      } catch (error) {
        this.logger.warn('Failed to refresh token, will start OAuth flow', error);
      }
    }

    // Start OAuth flow
    this.logger.info('Starting OAuth authorization flow');
    const tokens = await this.startOAuthFlow();
    return tokens.accessToken;
  }

  /**
   * Save tokens to memory
   */
  private saveCachedTokens(tokens: OAuthTokens): void {
    this.tokenCache = tokens;
    this.logger.debug('Tokens cached in memory');
  }

  /**
   * Check if token is still valid (not expired)
   */
  private isTokenValid(tokens: OAuthTokens): boolean {
    if (!tokens.expiresIn) {
      // If no expiry info, assume it's valid (some tokens don't expire)
      return true;
    }
    const expiresAt = tokens.obtainedAt + (tokens.expiresIn * 1000);
    const now = Date.now();
    // Consider token invalid 5 minutes before actual expiry for safety
    return expiresAt > (now + 5 * 60 * 1000);
  }

  /**
   * Generate a random state parameter for CSRF protection
   */
  private generateState(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Build the authorization URL
   */
  private buildAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      state: state,
      scope: SCOPES,
    });

    return `${AUTHORIZATION_URL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  private async exchangeCodeForToken(code: string): Promise<OAuthTokens> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: this.config.redirectUri,
    });

    const response = await this.makeTokenRequest(params);

    const tokens: OAuthTokens = {
      accessToken: response.access_token,
      expiresIn: response.expires_in,
      refreshToken: response.refresh_token,
      obtainedAt: Date.now(),
    };

    this.saveCachedTokens(tokens);
    return tokens;
  }

  /**
   * Refresh an expired access token
   */
  private async refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    const response = await this.makeTokenRequest(params);

    const tokens: OAuthTokens = {
      accessToken: response.access_token,
      expiresIn: response.expires_in,
      refreshToken: response.refresh_token || refreshToken, // Use new or keep old
      obtainedAt: Date.now(),
    };

    this.saveCachedTokens(tokens);
    return tokens;
  }

  /**
   * Make a token request to LinkedIn
   */
  private makeTokenRequest(params: URLSearchParams): Promise<any> {
    return new Promise((resolve, reject) => {
      const postData = params.toString();

      const options: https.RequestOptions = {
        hostname: 'www.linkedin.com',
        path: '/oauth/v2/accessToken',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);

            if (response.error) {
              reject(new Error(`LinkedIn API Error: ${response.error_description || response.error}`));
            } else {
              resolve(response);
            }
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error instanceof Error ? error.message : 'Unknown error'}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Request failed: ${error.message}`));
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Start the OAuth authorization flow with HTTP server
   */
  private async startOAuthFlow(): Promise<OAuthTokens> {
    const state = this.generateState();
    const authUrl = this.buildAuthorizationUrl(state);
    const port = new URL(this.config.redirectUri).port || '50001';

    this.logger.info('━'.repeat(60));
    this.logger.info('LinkedIn OAuth Authorization Required');
    this.logger.info('━'.repeat(60));
    this.logger.info('');
    this.logger.info('Please authorize this application by visiting:');
    this.logger.info('');
    this.logger.info(`  ${authUrl}`);
    this.logger.info('');
    this.logger.info('A local HTTP server is running to receive the authorization.');
    this.logger.info(`Listening on ${this.config.redirectUri}`);
    this.logger.info('');
    this.logger.info('━'.repeat(60));

    // Try to open browser automatically
    try {
      const open = await import('open');
      await open.default(authUrl);
      this.logger.info('Opened authorization page in your default browser');
    } catch (error) {
      this.logger.debug('Could not auto-open browser', error);
    }

    return new Promise((resolve, reject) => {
      this.server = http.createServer(async (req, res) => {
        const parsedUrl = url.parse(req.url || '', true);

        if (parsedUrl.pathname === '/callback' || parsedUrl.pathname === new URL(this.config.redirectUri).pathname) {
          const { code, state: returnedState, error, error_description } = parsedUrl.query;

          // Handle errors
          if (error) {
            const errorMsg = error_description || error;
            this.sendErrorPage(res, 'Authorization Failed', errorMsg as string);
            this.stopServer();
            reject(new Error(`Authorization failed: ${errorMsg}`));
            return;
          }

          // Validate state
          if (returnedState !== state) {
            this.sendErrorPage(res, 'Security Error', 'State parameter mismatch. Possible CSRF attack.');
            this.stopServer();
            reject(new Error('State parameter mismatch'));
            return;
          }

          // Exchange code for token
          if (typeof code === 'string') {
            try {
              this.logger.info('Authorization code received, exchanging for access token...');
              const tokens = await this.exchangeCodeForToken(code);

              this.sendSuccessPage(res);
              this.stopServer();

              this.logger.info('━'.repeat(60));
              this.logger.info('✓ OAuth Authorization Successful!');
              this.logger.info('━'.repeat(60));
              this.logger.info('Access token obtained and cached.');
              this.logger.info('Starting LinkedIn MCP Server...');
              this.logger.info('');

              resolve(tokens);
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : 'Unknown error';
              this.sendErrorPage(res, 'Token Exchange Failed', errorMsg);
              this.stopServer();
              reject(error);
            }
          } else {
            this.sendErrorPage(res, 'Missing Code', 'No authorization code received from LinkedIn.');
            this.stopServer();
            reject(new Error('No authorization code received'));
          }
        } else {
          // Show waiting page for any other path
          this.sendWaitingPage(res);
        }
      });

      this.server.listen(parseInt(port), () => {
        this.logger.debug(`OAuth callback server listening on port ${port}`);
      });

      this.server.on('error', (error) => {
        reject(new Error(`OAuth server error: ${error.message}`));
      });
    });
  }

  /**
   * Send HTML success page
   */
  private sendSuccessPage(res: http.ServerResponse): void {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authorization Successful</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                   display: flex; align-items: center; justify-content: center; height: 100vh;
                   margin: 0; background: linear-gradient(135deg, #0077B5 0%, #00669C 100%); }
            .container { background: white; padding: 60px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                        text-align: center; max-width: 500px; }
            .icon { font-size: 72px; margin-bottom: 20px; }
            h1 { color: #2c3e50; margin: 0 0 16px 0; font-size: 32px; }
            p { color: #7f8c8d; font-size: 18px; line-height: 1.6; margin: 0; }
            .note { margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;
                   font-size: 14px; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">✅</div>
            <h1>Authorization Successful!</h1>
            <p>Your LinkedIn MCP Server is now authenticated and starting up.</p>
            <div class="note">
              <strong>You can close this window</strong><br>
              The server is ready to use in your MCP client.
            </div>
          </div>
        </body>
      </html>
    `);
  }

  /**
   * Send HTML error page
   */
  private sendErrorPage(res: http.ServerResponse, title: string, message: string): void {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                   display: flex; align-items: center; justify-content: center; height: 100vh;
                   margin: 0; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); }
            .container { background: white; padding: 60px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                        text-align: center; max-width: 500px; }
            .icon { font-size: 72px; margin-bottom: 20px; }
            h1 { color: #2c3e50; margin: 0 0 16px 0; font-size: 32px; }
            p { color: #7f8c8d; font-size: 18px; line-height: 1.6; margin: 0; }
            .note { margin-top: 30px; padding: 20px; background: #fff3cd; border-radius: 8px;
                   font-size: 14px; color: #856404; border: 1px solid #ffeeba; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">❌</div>
            <h1>${title}</h1>
            <p>${message}</p>
            <div class="note">
              <strong>Please restart the server and try again</strong><br>
              Check your LinkedIn app configuration if the problem persists.
            </div>
          </div>
        </body>
      </html>
    `);
  }

  /**
   * Send HTML waiting page
   */
  private sendWaitingPage(res: http.ServerResponse): void {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Waiting for Authorization</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                   display: flex; align-items: center; justify-content: center; height: 100vh;
                   margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .container { background: white; padding: 60px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                        text-align: center; max-width: 500px; }
            .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #0077B5;
                      border-radius: 50%; width: 60px; height: 60px;
                      animation: spin 1s linear infinite; margin: 0 auto 30px; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            h1 { color: #2c3e50; margin: 0 0 16px 0; font-size: 32px; }
            p { color: #7f8c8d; font-size: 18px; line-height: 1.6; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="spinner"></div>
            <h1>Waiting for Authorization</h1>
            <p>Please complete the authorization in your LinkedIn window.</p>
          </div>
        </body>
      </html>
    `);
  }

  /**
   * Stop the OAuth callback server
   */
  private stopServer(): void {
    if (this.server) {
      this.server.close(() => {
        this.logger.debug('OAuth callback server stopped');
      });
      this.server = undefined;
    }
  }

  /**
   * Clear cached tokens (for logout/reset)
   */
  clearTokens(): void {
    this.tokenCache = null;
    this.logger.info('In-memory tokens cleared');
  }
}

