# LinkedIn MCP Server

<p align="center">
  <img src="logo.png" alt="LinkedIn MCP Server Logo" width="200" />
</p>

<p align="center">
  <a href="https://github.com/pegasusheavy/linkedin-mcp/actions"><img src="https://github.com/pegasusheavy/linkedin-mcp/workflows/CI/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/@pegasusheavy/linkedin-mcp"><img src="https://badge.fury.io/js/@pegasusheavy%2Flinkedin-mcp.svg" alt="npm version"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
</p>

> 📚 **[View Full Documentation & Installation Guides →](https://pegasusheavy.github.io/linkedin-mcp/)**

A comprehensive Model Context Protocol (MCP) server for LinkedIn API integration. Manage your LinkedIn profile, posts, connections, skills, education, certifications, and more through AI agents like Claude, ChatGPT, and other LLM applications.

## 🚀 Features

### 📱 Social Features
- **Profile Management**: Fetch and view your LinkedIn profile
- **Posts & Engagement**: Retrieve posts with engagement metrics, share new content
- **Connections**: Get and manage your professional network
- **People Search**: Find professionals by keywords

### 📝 Profile Management (18 Tools Total)
- **Skills**: Add and remove skills from your profile
- **Work Experience**: Add, update, and delete positions
- **Education**: Manage educational background
- **Certifications**: Add and remove professional certifications
- **Publications**: Manage your published works
- **Languages**: Add language proficiency to your profile

### 💻 Developer Experience
- **Modern MCP SDK**: Built with latest `McpServer` API (v1.1.0+)
- **OpenID Connect Support**: Works with LinkedIn's modern OAuth 2.0 + OIDC authentication
- **Full TypeScript support** with strict type checking
- **Comprehensive test suite**: 67 test cases, 85%+ server coverage
- **Zod schema validation** for type safety and input validation
- Modern async/await patterns
- Extensive logging and error handling
- Latest dependencies (Vitest 4, Zod 4, MCP SDK 1.24+)

## 📋 Prerequisites

- Node.js >= 18.0.0
- LinkedIn Developer App (Client ID & Secret) or existing access token
- pnpm, npm, or yarn

## 📦 Installation

```bash
# Using pnpm (recommended)
pnpm install @pegasusheavy/linkedin-mcp

# Using npm
npm install @pegasusheavy/linkedin-mcp

# Using yarn
yarn add @pegasusheavy/linkedin-mcp
```

## 🔧 Configuration

### Authentication Setup

This server requires LinkedIn API access. Choose your authentication method:

#### Option 1: Automatic OAuth Flow (Recommended) 🚀

The server automatically handles OAuth authentication when you don't have an access token.

**Step 1: Create a LinkedIn App**
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Click "Create App" and fill in the required information
3. Note your **Client ID** and **Client Secret**

**Step 2: Configure OAuth Settings**
1. In your app settings, go to "Auth" tab
2. Add `http://localhost:50001/callback` to "Authorized redirect URLs for your app"
3. Request the following **Products** (in Products tab):
   - **Sign In with LinkedIn using OpenID Connect** (required for profile access)
   - **Share on LinkedIn** (required for posting)

> **Note**: The server uses OpenID Connect scopes (`openid`, `profile`, `email`, `w_member_social`) which work with the standard "Sign In with LinkedIn" product. No special API access required!

**Step 3: Configure Your MCP Client**

The server receives configuration through environment variables from your MCP client:

**For Claude Desktop:**

Edit your Claude Desktop config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "linkedin": {
      "command": "npx",
      "args": ["-y", "@pegasusheavy/linkedin-mcp"],
      "env": {
        "LINKEDIN_CLIENT_ID": "your_client_id_here",
        "LINKEDIN_CLIENT_SECRET": "your_client_secret_here"
      }
    }
  }
}
```

**For Cursor IDE:**

In `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "linkedin": {
      "command": "npx",
      "args": ["-y", "@pegasusheavy/linkedin-mcp"],
      "env": {
        "LINKEDIN_CLIENT_ID": "your_client_id_here",
        "LINKEDIN_CLIENT_SECRET": "your_client_secret_here"
      }
    }
  }
}
```

**What Happens:**
1. First time the server starts, it detects no access token
2. Automatically opens your browser to LinkedIn's authorization page
3. You authorize the application once
4. Token is cached in memory for the session
5. Token is automatically refreshed when it expires (within the same session)
6. Each new session requires re-authorization (secure, no disk storage)

#### Option 2: Manual Access Token

If you already have an access token:

```json
{
  "mcpServers": {
    "linkedin": {
      "command": "npx",
      "args": ["-y", "@pegasusheavy/linkedin-mcp"],
      "env": {
        "LINKEDIN_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

### Configuration Options

| Environment Variable | Required | Description |
|---------------------|----------|-------------|
| `LINKEDIN_CLIENT_ID` | For OAuth | Your LinkedIn app client ID |
| `LINKEDIN_CLIENT_SECRET` | For OAuth | Your LinkedIn app client secret |
| `LINKEDIN_REDIRECT_URI` | Optional | OAuth callback URL (default: `http://localhost:50001/callback`) |
| `LINKEDIN_ACCESS_TOKEN` | Alternative | Use existing token instead of OAuth |
| `LOG_LEVEL` | Optional | Logging verbosity: `debug`, `info`, `warn`, `error` (default: `info`) |

### Token Management

✨ **Automatic Features:**
- **In-Memory Caching** - Tokens cached in memory during the session
- **Auto-Refresh** - Expired tokens automatically refreshed within session
- **Session-Based** - Authenticate once per MCP client session
- **No Disk Storage** - Tokens never written to disk for maximum security

⚠️ **Security Notes:**
- **Memory only** - Tokens stored in process memory, never on disk
- **Session scoped** - Each new session requires re-authorization
- **CSRF protection** - State parameter validation prevents attacks
- **Secure secrets** - Client secrets never exposed to browser
- **Auto-cleanup** - Tokens cleared when server stops

## 🎯 Usage

### Claude Desktop

The easiest way to use this MCP server is with [Claude Desktop](https://claude.ai/download).

#### Quick Start with OAuth (Recommended)

1. **Create a LinkedIn App** (see [Configuration](#-configuration) above)

2. **Configure Claude Desktop**

   Open your Claude Desktop configuration file:
   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux:** `~/.config/Claude/claude_desktop_config.json`

   Add this configuration with your LinkedIn app credentials:

   ```json
   {
     "mcpServers": {
       "linkedin": {
         "command": "npx",
         "args": ["-y", "@pegasusheavy/linkedin-mcp"],
         "env": {
           "LINKEDIN_CLIENT_ID": "your_client_id_here",
           "LINKEDIN_CLIENT_SECRET": "your_client_secret_here"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop**

   Completely quit and restart Claude Desktop.

4. **Authorize on First Use**

   The first time Claude tries to use LinkedIn tools:
   - A browser window will open to LinkedIn's authorization page
   - Click "Allow" to authorize the application
   - The token is cached and automatically refreshed
   - All future uses work seamlessly without re-authorization

#### Alternative: Use an Existing Token

If you already have a LinkedIn access token:

```json
{
  "mcpServers": {
    "linkedin": {
      "command": "npx",
      "args": ["-y", "@pegasusheavy/linkedin-mcp"],
      "env": {
        "LINKEDIN_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

#### Step 4: Verify Installation

Once Claude Desktop restarts, you should see the LinkedIn MCP server connected. You can verify by asking Claude:

```
"Can you show me my LinkedIn profile?"
"What are my recent LinkedIn posts?"
"Add TypeScript to my LinkedIn skills"
```

Claude will now have access to all 18 LinkedIn tools! 🎉

---

### Other MCP Clients

#### Cursor IDE

Add to your Cursor MCP settings (accessible via Cursor Settings → Features → Model Context Protocol):

```json
{
  "mcpServers": {
    "linkedin": {
      "command": "npx",
      "args": ["-y", "@pegasusheavy/linkedin-mcp"],
      "env": {
        "LINKEDIN_ACCESS_TOKEN": "your_linkedin_access_token_here"
      }
    }
  }
}
```

#### Cline (VS Code Extension)

Add to your Cline MCP settings:

```json
{
  "mcpServers": {
    "linkedin": {
      "command": "npx",
      "args": ["-y", "@pegasusheavy/linkedin-mcp"],
      "env": {
        "LINKEDIN_ACCESS_TOKEN": "your_linkedin_access_token_here"
      }
    }
  }
}
```

#### Continue

Add to `~/.continue/config.json`:

```json
{
  "mcpServers": {
    "linkedin": {
      "command": "npx",
      "args": ["-y", "@pegasusheavy/linkedin-mcp"],
      "env": {
        "LINKEDIN_ACCESS_TOKEN": "your_linkedin_access_token_here"
      }
    }
  }
}
```

---

### As a Standalone Server (Advanced)

```typescript
import { LinkedInMCPServer } from '@pegasusheavy/linkedin-mcp';
import { getConfig, validateConfig } from '@pegasusheavy/linkedin-mcp/config';

const config = getConfig();
validateConfig(config);

const server = new LinkedInMCPServer(config);
await server.start();
```

### With MCP Client (Advanced)

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'linkedin-mcp',
});

const client = new Client({
  name: 'my-app',
  version: '1.0.0',
}, {
  capabilities: {},
});

await client.connect(transport);

// List available tools
const tools = await client.listTools();

// Call a tool
const result = await client.callTool({
  name: 'get_linkedin_profile',
  arguments: {},
});
```

### Using CLI

```bash
# Start the server
linkedin-mcp

# With environment variables
LINKEDIN_ACCESS_TOKEN=xxx linkedin-mcp
```

## 🛠️ Available Tools

### Social & Content Tools

#### `get_linkedin_profile`
Get your LinkedIn profile information.

**Arguments:** None

**Returns:**
```json
{
  "id": "user-id",
  "firstName": "John",
  "lastName": "Doe",
  "headline": "Software Engineer at Tech Corp",
  "vanityName": "johndoe"
}
```

#### `get_linkedin_posts`
Get your recent LinkedIn posts with engagement metrics.

**Arguments:**
- `limit` (number, optional): Maximum number of posts (default: 10)

#### `get_linkedin_connections`
Get your LinkedIn connections.

**Arguments:**
- `limit` (number, optional): Maximum connections (default: 50)

#### `share_linkedin_post`
Share a new post on LinkedIn.

**Arguments:**
- `text` (string, required): The post content

**Returns:**
```json
{
  "id": "post-id",
  "url": "https://www.linkedin.com/feed/update/post-id"
}
```

#### `search_linkedin_people`
Search for people on LinkedIn.

**Arguments:**
- `keywords` (string, required): Search keywords
- `limit` (number, optional): Maximum results (default: 10)

### Profile Management Tools

#### Skills

**`add_linkedin_skill`** - Add a skill to your profile
- `name` (string, required): Skill name

**`delete_linkedin_skill`** - Remove a skill
- `skillId` (string, required): Skill ID to delete

#### Work Experience

**`add_linkedin_position`** - Add a position
- `title` (string, required): Job title
- `company` (string, required): Company name
- `startYear` (number, required): Start year
- `startMonth` (number, optional): Start month (1-12)
- `endYear` (number, optional): End year
- `endMonth` (number, optional): End month
- `description` (string, optional): Job description
- `current` (boolean, optional): Is current position?

**`update_linkedin_position`** - Update an existing position
- `positionId` (string, required): Position ID
- All other fields optional

**`delete_linkedin_position`** - Remove a position
- `positionId` (string, required): Position ID

#### Education

**`add_linkedin_education`** - Add education
- `schoolName` (string, required): School name
- `degree` (string, optional): Degree name
- `fieldOfStudy` (string, optional): Field of study
- `startYear`, `startMonth`, `endYear`, `endMonth` (optional)
- `grade` (string, optional): GPA or grade
- `activities` (string, optional): Activities and societies

**`delete_linkedin_education`** - Remove education
- `educationId` (string, required): Education ID

#### Certifications

**`add_linkedin_certification`** - Add a certification
- `name` (string, required): Certification name
- `authority` (string, required): Issuing organization
- `licenseNumber` (string, optional): License number
- `startYear`, `startMonth`, `endYear`, `endMonth` (optional)
- `url` (string, optional): Certificate URL

**`delete_linkedin_certification`** - Remove a certification
- `certificationId` (string, required): Certification ID

#### Publications

**`add_linkedin_publication`** - Add a publication
- `name` (string, required): Publication name
- `publisher` (string, optional): Publisher name
- `year`, `month`, `day` (optional): Publication date
- `description` (string, optional): Description
- `url` (string, optional): Publication URL

**`delete_linkedin_publication`** - Remove a publication
- `publicationId` (string, required): Publication ID

#### Languages

**`add_linkedin_language`** - Add a language
- `name` (string, required): Language name
- `proficiency` (string, optional): ELEMENTARY, LIMITED_WORKING, PROFESSIONAL_WORKING, FULL_PROFESSIONAL, NATIVE_OR_BILINGUAL

**`delete_linkedin_language`** - Remove a language
- `languageId` (string, required): Language ID

For detailed examples and usage patterns, see [PROFILE_MANAGEMENT.md](PROFILE_MANAGEMENT.md).

## 🧪 Development

### Setup

```bash
# Clone the repository
git clone https://github.com/pegasusheavy/linkedin-mcp.git
cd linkedin-mcp

# Install dependencies
pnpm install

# Set environment variables for testing
export LINKEDIN_CLIENT_ID="your_client_id"
export LINKEDIN_CLIENT_SECRET="your_client_secret"
# Or use an existing access token
export LINKEDIN_ACCESS_TOKEN="your_token"
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Type checking
pnpm run type-check

# Linting
pnpm run lint
```

### Building

```bash
# Build the project
pnpm run build

# Run in development mode
pnpm run dev
```

## 📊 Test Coverage

This project maintains high test coverage:

- **Lines**: 85%+
- **Functions**: 100%
- **Branches**: 72%+
- **Statements**: 85%+
- **Total Tests**: 67

```bash
pnpm test:coverage
```

## 🏗️ Architecture

```
src/
├── index.ts              # Entry point and CLI
├── server.ts             # MCP server implementation (18 tools)
├── config.ts             # Configuration management
├── logger.ts             # Logging utilities
├── types.ts              # TypeScript type definitions
├── linkedin-client.ts    # LinkedIn API client (OpenID Connect + legacy support)
├── oauth-manager.ts      # OAuth 2.0 flow management
├── oauth-service.ts      # OAuth token exchange service
└── *.test.ts             # Unit tests (67 tests)
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure tests pass (`pnpm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and development process.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Copyright (c) 2025-2026 Pegasus Heavy Industries**

## 🔒 Security

### Best Practices

- Never commit API keys or tokens to version control
- Use environment variables for all sensitive configuration
- Rotate access tokens regularly
- Follow the principle of least privilege for API scopes
- Review the [Security Policy](SECURITY.md) for reporting vulnerabilities

## 📖 API Documentation

### OAuth Scopes

The server requests the following OpenID Connect scopes:

| Scope | Purpose |
|-------|---------|
| `openid` | OpenID Connect authentication |
| `profile` | Access to name and profile picture |
| `email` | Access to email address |
| `w_member_social` | Create, modify, and delete posts |

These scopes are available with the standard **"Sign In with LinkedIn using OpenID Connect"** product - no special API access required!

### LinkedIn API Rate Limits

LinkedIn imposes rate limits on API calls. The server handles rate limiting gracefully and provides informative error messages.

### Error Handling

All tools return errors in a consistent format:

```json
{
  "content": [{
    "type": "text",
    "text": "Error: Descriptive error message"
  }],
  "isError": true
}
```

## 🌟 Examples

### Example 1: Building Your Profile

```typescript
// Add education
await client.callTool({
  name: 'add_linkedin_education',
  arguments: {
    schoolName: 'Stanford University',
    degree: 'Master of Science',
    fieldOfStudy: 'Computer Science',
    startYear: 2020,
    endYear: 2022,
  },
});

// Add current position
await client.callTool({
  name: 'add_linkedin_position',
  arguments: {
    title: 'Senior Software Engineer',
    company: 'Pegasus Heavy Industries',
    startYear: 2022,
    startMonth: 6,
    current: true,
    description: 'Building AI-powered solutions',
  },
});

// Add skills
await client.callTool({ name: 'add_linkedin_skill', arguments: { name: 'TypeScript' } });
await client.callTool({ name: 'add_linkedin_skill', arguments: { name: 'AI/ML' } });
```

### Example 2: Share a Post

```typescript
const result = await client.callTool({
  name: 'share_linkedin_post',
  arguments: {
    text: '🚀 Excited to announce our new LinkedIn MCP server! Full profile management through AI agents. #opensource #typescript #ai',
  },
});
```

### Example 3: Search and Analyze

```typescript
// Search for people
const people = await client.callTool({
  name: 'search_linkedin_people',
  arguments: {
    keywords: 'software engineer typescript AI',
    limit: 20,
  },
});

// Get your posts analytics
const posts = await client.callTool({
  name: 'get_linkedin_posts',
  arguments: { limit: 10 },
});
```

## 🙏 Acknowledgments

- [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
- [LinkedIn API Documentation](https://learn.microsoft.com/en-us/linkedin/)
- [Anthropic Claude](https://www.anthropic.com/)

## 📞 Support

- 💬 Issues: [GitHub Issues](https://github.com/pegasusheavy/linkedin-mcp/issues)
- 📚 Documentation: [Wiki](https://github.com/pegasusheavy/linkedin-mcp/wiki)
- 🌐 Website: [Pegasus Heavy Industries](https://github.com/pegasusheavy)

## 🗺️ Roadmap

- [ ] LinkedIn Company Pages support
- [ ] LinkedIn Groups integration
- [ ] Advanced search filters and saved searches
- [ ] Bulk operations support
- [ ] Message management (InMail)
- [ ] Recommendations management
- [ ] Profile views analytics
- [ ] Web dashboard for monitoring
- [ ] Docker container support
- [x] ~~Migration to `McpServer` high-level API~~ ✅ Completed in v1.1.0
- [x] ~~OpenID Connect authentication support~~ ✅ Completed in v1.3.0

## 📈 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.

---

**Made with ❤️ by Pegasus Heavy Industries**

*Empowering AI agents to manage professional networks*
