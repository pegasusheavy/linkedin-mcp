# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-15

### Added
- Initial release of LinkedIn MCP Server
- LinkedIn API integration with the following tools:
  - `get_linkedin_profile` - Fetch user profile information
  - `get_linkedin_posts` - Retrieve recent posts with engagement metrics
  - `get_linkedin_connections` - Get user connections
  - `share_linkedin_post` - Create and share new posts
  - `search_linkedin_people` - Search for people on LinkedIn
- Notion API integration with the following tools:
  - `create_notion_page` - Create pages in Notion database
  - `query_notion_pages` - Query and filter Notion pages
  - `save_linkedin_profile_to_notion` - Sync LinkedIn profile to Notion
- Comprehensive TypeScript support with strict type checking
- Full unit test suite with 90%+ coverage using Vitest
- Zod schema validation for all data structures
- Configurable logging with multiple log levels
- GitHub Actions CI/CD workflows
- GitHub issue and PR templates
- Comprehensive documentation (README, CONTRIBUTING, LICENSE)

### Security
- Environment variable-based configuration for sensitive data
- No hardcoded credentials in source code
- Secure API token handling

[1.0.0]: https://github.com/yourusername/linkedin-mcp-server/releases/tag/v1.0.0

