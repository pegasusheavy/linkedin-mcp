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

export interface OAuthTokenResponse {
  access_token: string;
  expires_in?: number;
  refresh_token?: string;
}

/**
 * OAuth Service for handling LinkedIn OAuth 2.0 authentication flow
 * Integrated into the MCP server to automatically authenticate users
 */
export class OAuthService {
  private logger: Logger;
  private config: OAuthConfig;
  private server: http.Server | null = null;
  private state: string = '';

  // LinkedIn OAuth endpoints
  private readonly AUTHORIZATION_URL = 'https://www.linkedin.com/oauth/v2/authorization';

  // Required scopes for the MCP server
  private readonly SCOPES = [
    'openid',
    'profile',
    'w_member_social',
  ].join(' ');

  constructor(config: OAuthConfig, logger: Logger = new Logger()) {
    this.config = config;
    this.logger = logger;
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
      scope: this.SCOPES,
    });

    return `${this.AUTHORIZATION_URL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  private async exchangeCodeForToken(code: string): Promise<OAuthTokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: this.config.redirectUri,
    });

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
            } else if (response.access_token) {
              resolve(response);
            } else {
              reject(new Error('No access token in response'));
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
   * Start the OAuth authentication flow
   * Returns a promise that resolves with the access token
   */
  async authenticate(): Promise<string> {
    this.state = this.generateState();
    const authUrl = this.buildAuthorizationUrl(this.state);
    const port = new URL(this.config.redirectUri).port || '3000';

    this.logger.info('🔐 LinkedIn OAuth 2.0 Authentication Required');
    this.logger.info('━'.repeat(60));
    this.logger.info('');
    this.logger.info('Please authorize this application by visiting:');
    this.logger.info('');
    this.logger.info(`  ${authUrl}`);
    this.logger.info('');
    this.logger.info('━'.repeat(60));
    this.logger.info('⏳ Waiting for authorization...');
    this.logger.info('');

    return new Promise((resolve, reject) => {
      this.server = http.createServer(async (req, res) => {
        const parsedUrl = url.parse(req.url || '', true);

        if (parsedUrl.pathname === '/callback') {
          const { code, state: returnedState, error, error_description } = parsedUrl.query;

          // Check for errors
          if (error) {
            const errorMsg = error_description || error;
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end(this.generateErrorPage('Authorization Failed', errorMsg as string));
            this.cleanup();
            reject(new Error(`Authorization failed: ${errorMsg}`));
            return;
          }

          // Validate state
          if (returnedState !== this.state) {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end(this.generateErrorPage('Security Error', 'State parameter mismatch. Possible CSRF attack.'));
            this.cleanup();
            reject(new Error('State parameter mismatch'));
            return;
          }

          // Exchange code for token
          if (typeof code === 'string') {
            try {
              this.logger.info('✓ Authorization code received');
              this.logger.info('📋 Exchanging code for access token...');

              const tokenResponse = await this.exchangeCodeForToken(code);

              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(this.generateSuccessPage());

              this.cleanup();

              this.logger.info('');
              this.logger.info('━'.repeat(60));
              this.logger.info('✅ Authentication Successful!');
              this.logger.info('━'.repeat(60));
              this.logger.info('');
              this.logger.info('🔐 Access token obtained and will be used for API requests');
              this.logger.info('💡 The server will now continue starting up...');
              this.logger.info('');
              this.logger.info('━'.repeat(60));
              this.logger.info('');

              resolve(tokenResponse.access_token);
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : 'Unknown error';
              res.writeHead(500, { 'Content-Type': 'text/html' });
              res.end(this.generateErrorPage('Token Exchange Failed', errorMsg));
              this.cleanup();
              reject(error);
            }
          } else {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end(this.generateErrorPage('Missing Code', 'No authorization code received from LinkedIn.'));
            this.cleanup();
            reject(new Error('No authorization code received'));
          }
        } else {
          // Handle root path - show instructions
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(this.generateInstructionsPage(authUrl));
        }
      });

      this.server.listen(parseInt(port), () => {
        this.logger.info(`OAuth server listening on ${this.config.redirectUri}`);
      });

      this.server.on('error', (error) => {
        this.cleanup();
        reject(new Error(`OAuth server error: ${error.message}`));
      });
    });
  }

  /**
   * Clean up the OAuth server
   */
  private cleanup(): void {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }

  /**
   * Generate success HTML page
   */
  private generateSuccessPage(): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Successful</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 3rem;
              border-radius: 12px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 500px;
            }
            .icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            h1 {
              color: #10b981;
              margin: 0 0 1rem 0;
            }
            p {
              color: #6b7280;
              line-height: 1.6;
            }
            .note {
              background: #f3f4f6;
              padding: 1rem;
              border-radius: 8px;
              margin-top: 1.5rem;
              font-size: 0.875rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">✅</div>
            <h1>Authentication Successful!</h1>
            <p>Your LinkedIn account has been connected to the MCP server.</p>
            <p>The server is now continuing its startup process.</p>
            <div class="note">
              <strong>You can close this window</strong><br>
              Check your terminal for the server status.
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate error HTML page
   */
  private generateErrorPage(title: string, message: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            }
            .container {
              background: white;
              padding: 3rem;
              border-radius: 12px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 500px;
            }
            .icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            h1 {
              color: #dc2626;
              margin: 0 0 1rem 0;
            }
            p {
              color: #6b7280;
              line-height: 1.6;
            }
            .note {
              background: #fef2f2;
              border: 1px solid #fecaca;
              padding: 1rem;
              border-radius: 8px;
              margin-top: 1.5rem;
              font-size: 0.875rem;
              color: #991b1b;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">❌</div>
            <h1>${title}</h1>
            <p>${message}</p>
            <div class="note">
              <strong>You can close this window</strong><br>
              Check your terminal for details and try again.
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate instructions HTML page
   */
  private generateInstructionsPage(authUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>LinkedIn MCP Server - OAuth Authentication</title>
          <meta http-equiv="refresh" content="0;url=${authUrl}">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #0077B5 0%, #00669C 100%);
            }
            .container {
              background: white;
              padding: 3rem;
              border-radius: 12px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 500px;
            }
            .icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            h1 {
              color: #0077B5;
              margin: 0 0 1rem 0;
            }
            p {
              color: #6b7280;
              line-height: 1.6;
            }
            .note {
              background: #eff6ff;
              border: 1px solid #bfdbfe;
              padding: 1rem;
              border-radius: 8px;
              margin-top: 1.5rem;
              font-size: 0.875rem;
              color: #1e40af;
            }
            .btn {
              display: inline-block;
              background: #0077B5;
              color: white;
              padding: 0.75rem 2rem;
              border-radius: 6px;
              text-decoration: none;
              margin-top: 1.5rem;
              transition: background 0.2s;
            }
            .btn:hover {
              background: #00669C;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">🔐</div>
            <h1>LinkedIn Authentication Required</h1>
            <p>Redirecting you to LinkedIn to authorize this application...</p>
            <p>If you are not redirected automatically, click the button below:</p>
            <a href="${authUrl}" class="btn">Authorize with LinkedIn</a>
            <div class="note">
              <strong>What happens next?</strong><br>
              You'll be asked to log in to LinkedIn and grant permissions to this application.
              After authorization, you'll be redirected back here.
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

