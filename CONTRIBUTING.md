# Contributing to LinkedIn MCP Server

Thank you for your interest in contributing to the LinkedIn MCP Server! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and considerate in all interactions.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/linkedin-mcp-server.git`
3. Install dependencies: `pnpm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Workflow

### Setup Development Environment

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Add your API credentials to .env
```

### Running the Project

```bash
# Development mode with auto-reload
pnpm run dev

# Build the project
pnpm run build

# Run built version
pnpm start
```

### Testing

We maintain 90%+ test coverage. All new features must include tests.

```bash
# Run all tests
pnpm test

# Watch mode for development
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

### Code Quality

```bash
# Type checking
pnpm run type-check

# Linting
pnpm run lint

# Run all checks before committing
pnpm run type-check && pnpm run lint && pnpm test
```

## Contribution Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing code formatting (enforced by ESLint)
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Commit Messages

Follow conventional commits format:

```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test additions or modifications
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `chore`: Build process or auxiliary tool changes

Examples:
```
feat(linkedin): add support for company pages

Add new tools for fetching and managing LinkedIn company pages,
including posts, followers, and analytics.

Closes #123
```

```
fix(notion): handle null values in page properties

Fixes an issue where null values in Notion page properties
caused the server to crash.

Fixes #456
```

### Pull Request Process

1. **Update Documentation**: Ensure README and other docs reflect your changes
2. **Add Tests**: New features must have test coverage
3. **Pass CI**: All tests, linting, and type checks must pass
4. **Update Changelog**: Add your changes to CHANGELOG.md
5. **Request Review**: Tag maintainers for review

### Pull Request Template

When creating a PR, include:

- Clear description of changes
- Motivation and context
- Type of change (bug fix, feature, etc.)
- Testing performed
- Screenshots (if applicable)
- Related issues

## Testing Guidelines

### Unit Tests

- Test all public methods and functions
- Test error cases and edge cases
- Use descriptive test names
- Mock external dependencies (APIs, databases)
- Aim for 90%+ coverage

Example:
```typescript
describe('LinkedInClient', () => {
  describe('getProfile', () => {
    it('should fetch and return LinkedIn profile', async () => {
      // Test implementation
    });

    it('should handle API errors gracefully', async () => {
      // Test error handling
    });
  });
});
```

### Integration Tests

While we primarily use unit tests, consider adding integration tests for:
- End-to-end workflows
- API interactions
- Database operations

## Adding New Features

### Adding a New LinkedIn Tool

1. Add the tool definition in `src/server.ts` (in `ListToolsRequestSchema` handler)
2. Implement the handler method in `LinkedInMCPServer` class
3. Add corresponding method to `LinkedInClient` if needed
4. Write comprehensive unit tests
5. Update README with tool documentation

Example:
```typescript
// In server.ts
{
  name: 'new_tool_name',
  description: 'Description of what the tool does',
  inputSchema: {
    type: 'object',
    properties: {
      param1: {
        type: 'string',
        description: 'Parameter description',
      },
    },
    required: ['param1'],
  },
}

// Add handler
case 'new_tool_name':
  return await this.handleNewTool(args);

// Implement handler method
private async handleNewTool(args: ToolArguments): Promise<ToolResult> {
  // Implementation
}
```

### Adding a New Notion Feature

Follow similar pattern to LinkedIn tools, working with `NotionClient` class.

## Documentation

### Code Documentation

- Add JSDoc comments for all exported functions and classes
- Document complex algorithms or logic
- Include usage examples where helpful

Example:
```typescript
/**
 * Fetches the authenticated user's LinkedIn profile.
 *
 * @returns Promise resolving to the user's profile information
 * @throws {Error} If the API request fails or returns invalid data
 *
 * @example
 * ```typescript
 * const client = new LinkedInClient(token);
 * const profile = await client.getProfile();
 * console.log(`${profile.firstName} ${profile.lastName}`);
 * ```
 */
async getProfile(): Promise<LinkedInProfile> {
  // Implementation
}
```

### README Updates

When adding features:
- Update the Features section
- Add tool documentation to Available Tools section
- Add usage examples if applicable
- Update the Roadmap if completing planned features

## Issue Reporting

### Bug Reports

Include:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Relevant logs or error messages

### Feature Requests

Include:
- Clear description of the feature
- Use case and motivation
- Proposed implementation (optional)
- Examples of how it would be used

## Release Process

Maintainers handle releases:

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create git tag: `git tag -a v1.0.0 -m "Release v1.0.0"`
4. Push tag: `git push origin v1.0.0`
5. GitHub Actions will automatically publish to npm

## Getting Help

- Check existing issues and documentation
- Ask questions in GitHub Discussions
- Reach out to maintainers

## Recognition

Contributors are recognized in:
- CHANGELOG.md for specific contributions
- README.md acknowledgments section
- GitHub contributors page

Thank you for contributing! 🎉

