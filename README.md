# LinkedIn MCP Server

[![CI](https://github.com/pegasusheavy/linkedin-mcp/workflows/CI/badge.svg)](https://github.com/pegasusheavy/linkedin-mcp/actions)
[![npm version](https://badge.fury.io/js/@pegasusheavy%2Flinkedin-mcp.svg)](https://www.npmjs.com/package/@pegasusheavy/linkedin-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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
- **Full TypeScript support** with strict type checking
- **Comprehensive test suite**: 65 test cases, 85%+ server coverage
- **Zod schema validation** for type safety and input validation
- Modern async/await patterns
- Extensive logging and error handling
- Latest dependencies (Vitest 4, Zod 4, MCP SDK 1.24+)

## 📋 Prerequisites

- Node.js >= 18.0.0
- LinkedIn API access token
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

### Environment Variables

Create a `.env` file in your project root:

```bash
# Required
LINKEDIN_ACCESS_TOKEN=your_linkedin_access_token

# Optional - Server Configuration
PORT=3000
LOG_LEVEL=info  # debug, info, warn, error
```

### Getting LinkedIn Access Token

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app or use an existing one
3. Request access to required APIs
4. Generate an access token with appropriate scopes:
   - `r_liteprofile` - Read profile information
   - `r_emailaddress` - Read email address
   - `w_member_social` - Create and modify posts
   - `r_organization_social` - Read organization content
   - **Profile Edit Permissions** - Required for profile management features

## 🎯 Usage

### As a Standalone Server

```typescript
import { LinkedInMCPServer } from '@pegasusheavy/linkedin-mcp';
import { getConfig, validateConfig } from '@pegasusheavy/linkedin-mcp/config';

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

This project maintains 99%+ test coverage:

- **Lines**: 99%+
- **Functions**: 100%
- **Branches**: 80%+
- **Statements**: 99%+
- **Total Tests**: 45

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
├── linkedin-client.ts    # LinkedIn API client (all methods)
└── **/*.test.ts          # Unit tests (45 tests)
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

**Copyright (c) 2025 Pegasus Heavy Industries**

## 🔒 Security

### Best Practices

- Never commit API keys or tokens to version control
- Use environment variables for all sensitive configuration
- Rotate access tokens regularly
- Follow the principle of least privilege for API scopes
- Review the [Security Policy](SECURITY.md) for reporting vulnerabilities

## 📖 API Documentation

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
- [ ] Migration to `McpServer` high-level API

## 📈 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.

---

**Made with ❤️ by Pegasus Heavy Industries**

*Empowering AI agents to manage professional networks*
