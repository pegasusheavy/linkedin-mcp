# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-15

### 🎉 Initial Release

A comprehensive Model Context Protocol (MCP) server for LinkedIn API integration with full profile management capabilities.

### ✨ Features

#### Social & Content Tools (5 tools)
- **`get_linkedin_profile`** - Fetch authenticated user's profile information
- **`get_linkedin_posts`** - Retrieve recent posts with engagement metrics (likes, comments, shares)
- **`get_linkedin_connections`** - Get user's professional connections
- **`share_linkedin_post`** - Create and share new posts on LinkedIn
- **`search_linkedin_people`** - Search for people by keywords

#### Profile Management Tools (13 tools)

**Skills Management**
- **`add_linkedin_skill`** - Add skills to profile
- **`delete_linkedin_skill`** - Remove skills from profile

**Work Experience**
- **`add_linkedin_position`** - Add job positions with full details
- **`update_linkedin_position`** - Update existing positions
- **`delete_linkedin_position`** - Remove positions

**Education**
- **`add_linkedin_education`** - Add educational background
- **`delete_linkedin_education`** - Remove education entries

**Certifications**
- **`add_linkedin_certification`** - Add professional certifications
- **`delete_linkedin_certification`** - Remove certifications

**Publications**
- **`add_linkedin_publication`** - Add published works
- **`delete_linkedin_publication`** - Remove publications

**Languages**
- **`add_linkedin_language`** - Add language proficiency
- **`delete_linkedin_language`** - Remove languages

### 🔧 Technical Features

#### Core Implementation
- Full TypeScript implementation with strict mode enabled
- Zod schema validation for all API requests and responses
- Comprehensive error handling with descriptive messages
- Modern async/await patterns throughout
- Environment-based configuration with validation

#### Testing & Quality
- **45 unit tests** with comprehensive coverage
- **99%+ line coverage** across all modules
- **100% function coverage**
- **80%+ branch coverage**
- Vitest 4.0.15 for testing framework
- CI/CD pipeline with GitHub Actions

#### Developer Experience
- Full TypeScript type definitions
- ESLint configuration with TypeScript support
- Prettier code formatting
- Husky git hooks for pre-commit checks
- Comprehensive logging with configurable levels (debug, info, warn, error)

### 📦 Dependencies

#### Production
- `@modelcontextprotocol/sdk` ^1.24.3 - MCP protocol implementation
- `axios` ^1.13.2 - HTTP client for LinkedIn API
- `dotenv` ^17.2.3 - Environment variable management
- `zod` ^4.2.0 - Schema validation

#### Development
- `@types/node` ^25.0.2 - Node.js type definitions
- `@typescript-eslint/eslint-plugin` ^8.50.0 - TypeScript linting
- `@typescript-eslint/parser` ^8.50.0 - TypeScript parser
- `@vitest/coverage-v8` ^4.0.15 - Test coverage
- `eslint` ^9.39.2 - Code linting
- `tsx` ^4.21.0 - TypeScript execution
- `typescript` ^5.9.3 - TypeScript compiler
- `vite` ^7.3.0 - Build tool
- `vitest` ^4.0.15 - Testing framework

### 📚 Documentation

- Comprehensive README with all features documented
- CONTRIBUTING.md with development guidelines
- PROFILE_MANAGEMENT.md with detailed profile tools documentation
- GitHub issue templates (bug report, feature request)
- Pull request template
- MIT License under Pegasus Heavy Industries

### 🔄 CI/CD

#### GitHub Actions Workflows
- **CI Pipeline** - Runs on every push and PR
  - Tests on Node.js 18, 20, 22
  - Type checking with TypeScript
  - Linting with ESLint
  - Test coverage reporting
  - Codecov integration
  
- **Release Pipeline** - Automated releases
  - Triggered by version tags (v*)
  - Automated npm publishing
  - GitHub release creation
  - Changelog generation
  
- **CodeQL Security Scanning** - Weekly security analysis
  - Vulnerability detection
  - Code quality checks
  - Automated security alerts

#### Dependabot
- Automated dependency updates
- Weekly checks for npm packages
- Weekly checks for GitHub Actions

### 🏗️ Architecture

```
src/
├── index.ts              # Entry point and CLI
├── server.ts             # MCP server (243 lines, 18 tools)
├── config.ts             # Configuration management
├── logger.ts             # Logging utilities
├── types.ts              # TypeScript definitions
├── linkedin-client.ts    # LinkedIn API client (600+ lines)
└── *.test.ts            # Unit tests (45 tests)
```

### 🚀 Installation

Available on npm as `@pegasusheavy/linkedin-mcp`

```bash
npm install @pegasusheavy/linkedin-mcp
# or
pnpm install @pegasusheavy/linkedin-mcp
# or
yarn add @pegasusheavy/linkedin-mcp
```

### 🔑 Configuration

Requires LinkedIn API access token with scopes:
- `r_liteprofile` - Read profile information
- `r_emailaddress` - Read email address
- `w_member_social` - Create and modify posts
- `r_organization_social` - Read organization content
- Profile Edit API permissions - For profile management features

### 📊 Statistics

- **Total Lines of Code**: ~6,700
- **Source Files**: 6
- **Test Files**: 4
- **Documentation Files**: 7
- **GitHub Workflow Files**: 3
- **Test Coverage**: 99%+ lines, 100% functions
- **Total MCP Tools**: 18
- **Supported Node.js**: >=18.0.0

### 🎯 Package Metadata

- **Package Name**: `@pegasusheavy/linkedin-mcp`
- **Version**: 1.0.0
- **License**: MIT
- **Author**: Pegasus Heavy Industries
- **Repository**: https://github.com/pegasusheavy/linkedin-mcp
- **Keywords**: mcp, model-context-protocol, linkedin, linkedin-api, profile-management, automation, ai, llm, agent, claude, openai, anthropic, skills, education, certifications, typescript, career, professional-network

### 🐛 Known Limitations

- Headline and summary cannot be edited via LinkedIn API (platform limitation)
- Profile picture updates not supported by LinkedIn API
- Contact information modifications not available through API
- Rate limits imposed by LinkedIn on all endpoints
- Profile Edit API access requires LinkedIn approval

### 🔒 Security

- No hardcoded credentials in source code
- Environment variable-based configuration
- Proper .gitignore configuration
- Regular dependency updates via Dependabot
- CodeQL security scanning enabled
- MIT License with clear attribution

### 🙏 Acknowledgments

- Model Context Protocol SDK by Anthropic
- LinkedIn API and documentation
- TypeScript and Node.js communities
- Open source testing tools (Vitest, ESLint)

### 📝 Notes

This is the initial stable release of the LinkedIn MCP Server. The project provides a complete implementation of LinkedIn API integration through the Model Context Protocol, enabling AI agents like Claude to manage LinkedIn profiles programmatically.

Future releases will focus on:
- Additional LinkedIn features (Company Pages, Groups, InMail)
- Migration to `McpServer` high-level API when stable
- Performance optimizations
- Additional profile management capabilities
- Web dashboard for monitoring

---

For upgrade instructions, migration guides, and detailed API changes, see the [README](README.md) and [CONTRIBUTING](CONTRIBUTING.md) files.

## Version History

- **1.0.0** (2024-12-15) - Initial release with 18 MCP tools

---

**Maintained by**: Pegasus Heavy Industries  
**License**: MIT  
**Repository**: https://github.com/pegasusheavy/linkedin-mcp
