# LinkedIn MCP Server

[![CI](https://github.com/yourusername/linkedin-mcp-server/workflows/CI/badge.svg)](https://github.com/yourusername/linkedin-mcp-server/actions)
[![codecov](https://codecov.io/gh/yourusername/linkedin-mcp-server/branch/main/graph/badge.svg)](https://codecov.io/gh/yourusername/linkedin-mcp-server)
[![npm version](https://badge.fury.io/js/linkedin-mcp-server.svg)](https://badge.fury.io/js/linkedin-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive Model Context Protocol (MCP) server that provides seamless integration between LinkedIn and AI applications, with optional Notion database synchronization.

## 🚀 Features

- **LinkedIn Integration**
  - Fetch user profile information
  - Retrieve recent posts and engagement metrics
  - Get connections list
  - Share new posts
  - Search for people on LinkedIn

- **Notion Integration** (Optional)
  - Create pages in Notion database
  - Query and filter Notion pages
  - Sync LinkedIn profiles to Notion
  - Associate LinkedIn data with Notion pages

- **Developer Experience**
  - Full TypeScript support with strict type checking
  - Comprehensive unit tests (90%+ coverage)
  - Extensive logging and error handling
  - Zod schema validation
  - Modern async/await patterns

## 📋 Prerequisites

- Node.js >= 18.0.0
- LinkedIn API access token
- (Optional) Notion API key and database ID

## 📦 Installation

```bash
# Using pnpm (recommended)
pnpm install linkedin-mcp-server

# Using npm
npm install linkedin-mcp-server

# Using yarn
yarn add linkedin-mcp-server
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in your project root:

```bash
# Required
LINKEDIN_ACCESS_TOKEN=your_linkedin_access_token

# Optional - Notion Integration
NOTION_API_KEY=your_notion_api_key
NOTION_DATABASE_ID=your_notion_database_id

# Optional - Server Configuration
PORT=3000
LOG_LEVEL=info  # debug, info, warn, error
```

### Getting LinkedIn Access Token

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app or use an existing one
3. Request access to required APIs (Profile, Posts, Connections)
4. Generate an access token with appropriate scopes:
   - `r_liteprofile` - Read profile information
   - `r_emailaddress` - Read email address
   - `w_member_social` - Create and modify posts
   - `r_organization_social` - Read organization content

### Setting Up Notion Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Create a new integration and get the API key
3. Create a database in Notion with the following properties:
   - `Name` (Title)
   - `LinkedIn ID` (Text)
   - `LinkedIn URL` (URL)
   - `Created At` (Date)
   - `Tags` (Multi-select)
4. Share the database with your integration
5. Copy the database ID from the URL

## 🎯 Usage

### As a Standalone Server

```typescript
import { LinkedInMCPServer } from 'linkedin-mcp-server';
import { getConfig, validateConfig } from 'linkedin-mcp-server/config';

const config = getConfig();
validateConfig(config);

const server = new LinkedInMCPServer(config);
await server.start();
```

### With MCP Client

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
LINKEDIN_ACCESS_TOKEN=xxx NOTION_API_KEY=xxx linkedin-mcp
```

## 🛠️ Available Tools

### LinkedIn Tools

#### `get_linkedin_profile`
Get the authenticated user's LinkedIn profile information.

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
Get the user's recent LinkedIn posts.

**Arguments:**
- `limit` (number, optional): Maximum number of posts to retrieve (default: 10)

**Returns:** Array of post objects with engagement metrics

#### `get_linkedin_connections`
Get the user's LinkedIn connections.

**Arguments:**
- `limit` (number, optional): Maximum number of connections (default: 50)

**Returns:** Array of connection objects

#### `share_linkedin_post`
Share a new post on LinkedIn.

**Arguments:**
- `text` (string, required): The content of the post

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

**Returns:** Array of people matching the search

### Notion Tools

*(Available when Notion integration is configured)*

#### `create_notion_page`
Create a new page in the configured Notion database.

**Arguments:**
- `title` (string, required): Page title
- `linkedInId` (string, optional): LinkedIn ID to associate
- `linkedInUrl` (string, optional): LinkedIn URL
- `tags` (string[], optional): Tags for the page

**Returns:** Created page ID and URL

#### `query_notion_pages`
Query pages from the Notion database.

**Arguments:**
- `linkedInId` (string, optional): Filter by LinkedIn ID

**Returns:** Array of matching pages

#### `save_linkedin_profile_to_notion`
Save the user's LinkedIn profile to Notion.

**Arguments:** None

**Returns:** Created Notion page details

## 🧪 Development

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/linkedin-mcp-server.git
cd linkedin-mcp-server

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your credentials
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

This project maintains 90%+ test coverage across all modules:

```bash
pnpm test:coverage
```

Coverage reports are generated in the `coverage/` directory.

## 🏗️ Architecture

```
src/
├── index.ts              # Entry point and CLI
├── server.ts             # MCP server implementation
├── config.ts             # Configuration management
├── logger.ts             # Logging utilities
├── types.ts              # TypeScript type definitions
├── linkedin-client.ts    # LinkedIn API client
├── notion-client.ts      # Notion API client
└── **/*.test.ts          # Unit tests
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

## 🔒 Security

### Reporting Security Issues

Please report security vulnerabilities to [security@example.com](mailto:security@example.com). Do not open public issues for security vulnerabilities.

### Best Practices

- Never commit API keys or tokens to version control
- Use environment variables for all sensitive configuration
- Rotate access tokens regularly
- Follow the principle of least privilege for API scopes

## 📖 API Documentation

### LinkedIn API Rate Limits

LinkedIn imposes rate limits on API calls:
- Profile API: 100 calls per day
- Posts API: 100 calls per day
- Connections API: 500 calls per day

The server handles rate limiting gracefully and provides informative error messages.

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

### Example 1: Sync LinkedIn Profile to Notion

```typescript
// Get LinkedIn profile
const profile = await client.callTool({
  name: 'get_linkedin_profile',
  arguments: {},
});

// Save to Notion
const notionPage = await client.callTool({
  name: 'save_linkedin_profile_to_notion',
  arguments: {},
});
```

### Example 2: Create a LinkedIn Post

```typescript
const result = await client.callTool({
  name: 'share_linkedin_post',
  arguments: {
    text: '🚀 Excited to share our new LinkedIn MCP server! #opensource #typescript',
  },
});
```

### Example 3: Search and Save to Notion

```typescript
// Search for people
const people = await client.callTool({
  name: 'search_linkedin_people',
  arguments: {
    keywords: 'software engineer typescript',
    limit: 20,
  },
});

// Save each to Notion
for (const person of people) {
  await client.callTool({
    name: 'create_notion_page',
    arguments: {
      title: `${person.firstName} ${person.lastName}`,
      linkedInId: person.id,
      tags: ['LinkedIn Search', 'Software Engineer'],
    },
  });
}
```

## 🙏 Acknowledgments

- [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
- [LinkedIn API Documentation](https://docs.microsoft.com/en-us/linkedin/)
- [Notion API](https://developers.notion.com/)

## 📞 Support

- 📧 Email: support@example.com
- 💬 Issues: [GitHub Issues](https://github.com/yourusername/linkedin-mcp-server/issues)
- 📚 Documentation: [Wiki](https://github.com/yourusername/linkedin-mcp-server/wiki)

## 🗺️ Roadmap

- [ ] LinkedIn Company Pages support
- [ ] LinkedIn Groups integration
- [ ] Advanced search filters
- [ ] Bulk operations support
- [ ] GraphQL API support
- [ ] Additional database integrations (Airtable, Google Sheets)
- [ ] Web dashboard for monitoring
- [ ] Docker container support

## 📈 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.

---

Made with ❤️ by the community

