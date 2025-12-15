# Contributing to LinkedIn MCP Server

Thank you for your interest in contributing to the LinkedIn MCP Server! This document provides guidelines and instructions for contributing to this comprehensive Model Context Protocol server for LinkedIn API integration.

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and considerate in all interactions.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/yourusername/linkedin-mcp.git
   cd linkedin-mcp
   ```
3. **Install dependencies**:
   ```bash
   pnpm install
   ```
4. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 💻 Development Workflow

### Setup Development Environment

```bash
# Install dependencies
pnpm install

# Create environment file
cp .env.example .env

# Add your LinkedIn API credentials to .env
LINKEDIN_ACCESS_TOKEN=your_token_here
```

### Running the Project

```bash
# Development mode with auto-reload
pnpm run dev

# Build the project
pnpm run build

# Run built version
pnpm start

# Run tests
pnpm test
```

### Testing

We maintain 99%+ test coverage. **All new features must include tests.**

```bash
# Run all tests
pnpm test

# Watch mode for development
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Current coverage targets:
# - Lines: 99%+
# - Functions: 100%
# - Branches: 80%+
# - Statements: 99%+
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

## 📝 Contribution Guidelines

### Code Style

- **TypeScript Only**: Use TypeScript for all new code
- **Formatting**: Follow existing code formatting (enforced by ESLint)
- **Naming**: Use meaningful variable and function names
- **Documentation**: Add JSDoc comments for public APIs
- **Functions**: Keep functions small and focused (single responsibility)
- **Async/Await**: Use modern async/await patterns, avoid callbacks
- **Error Handling**: Always handle errors with descriptive messages

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test additions or modifications
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `chore`: Build process or auxiliary tool changes
- `ci`: CI/CD changes
- `style`: Code style changes (formatting, etc.)

**Examples:**
```bash
feat(profile): add support for updating certifications

fix(client): handle rate limiting errors correctly

docs(readme): update installation instructions

test(server): add tests for language management tools
```

### Pull Request Process

1. **Update Documentation**: Update README.md, CHANGELOG.md if needed
2. **Add Tests**: Ensure all new code has tests
3. **Run Tests**: Verify all tests pass locally
4. **Update Types**: Add/update TypeScript types as needed
5. **Run Linting**: Ensure no linting errors
6. **Write Clear Description**: Explain what and why in your PR
7. **Link Issues**: Reference any related issues

### PR Checklist

Before submitting your PR, ensure:

- [ ] Code follows the project's style guidelines
- [ ] All tests pass (`pnpm test`)
- [ ] Test coverage remains above 99% for lines
- [ ] TypeScript compilation succeeds (`pnpm run type-check`)
- [ ] No linting errors (`pnpm run lint`)
- [ ] Documentation is updated
- [ ] Commit messages follow conventional commits
- [ ] CHANGELOG.md is updated (for significant changes)

## 🏗️ Project Structure

```
linkedin-mcp/
├── .github/              # GitHub workflows and templates
│   ├── workflows/        # CI/CD workflows
│   └── ISSUE_TEMPLATE/   # Issue templates
├── src/
│   ├── index.ts          # Entry point and CLI
│   ├── server.ts         # MCP server (18 tools)
│   ├── config.ts         # Configuration management
│   ├── logger.ts         # Logging utilities
│   ├── types.ts          # TypeScript definitions
│   ├── linkedin-client.ts # LinkedIn API client
│   └── *.test.ts         # Unit tests
├── dist/                 # Build output (gitignored)
├── coverage/             # Test coverage (gitignored)
├── README.md             # Main documentation
├── CONTRIBUTING.md       # This file
├── CHANGELOG.md          # Version history
├── LICENSE               # MIT License
├── package.json          # Package metadata
├── tsconfig.json         # TypeScript config
└── vitest.config.ts      # Test configuration
```

## 🛠️ Adding New Features

### Adding a New LinkedIn Tool

1. **Update Types** (`src/types.ts`):
   ```typescript
   export const NewFeatureSchema = z.object({
     field: z.string(),
   });
   export type NewFeature = z.infer<typeof NewFeatureSchema>;
   ```

2. **Add Client Method** (`src/linkedin-client.ts`):
   ```typescript
   async newFeature(param: string): Promise<NewFeature> {
     try {
       this.logger.debug('Calling new feature');
       const response = await this.client.get('/endpoint');
       return NewFeatureSchema.parse(response.data);
     } catch (error) {
       this.logger.error('Error in new feature', error);
       throw new Error(`Failed: ${error.message}`);
     }
   }
   ```

3. **Register Tool** (`src/server.ts`):
   ```typescript
   // In listToolsHandler
   {
     name: 'new_linkedin_feature',
     description: 'Description of what it does',
     inputSchema: {
       type: 'object',
       properties: {
         param: { type: 'string', description: 'Parameter desc' },
       },
       required: ['param'],
     },
   }

   // In callToolHandler switch
   case 'new_linkedin_feature':
     result = await this.handleNewFeature(args);
     break;

   // Add handler method
   private async handleNewFeature(args: ToolArguments): Promise<ToolResult> {
     const param = args.param as string;
     if (!param) throw new Error('Param required');
     const data = await this.linkedInClient.newFeature(param);
     return {
       content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
     };
   }
   ```

4. **Write Tests**:
   ```typescript
   // In src/linkedin-client.test.ts
   describe('newFeature', () => {
     it('should call new feature endpoint', async () => {
       // Test implementation
     });
   });

   // In src/server.test.ts
   it('should handle new_linkedin_feature tool', async () => {
     // Test tool handler
   });
   ```

5. **Update Documentation**:
   - Add to README.md in "Available Tools" section
   - Update tool count
   - Add usage examples

### Test Requirements

Every new feature must include:

1. **Unit Tests**: Test the client method
2. **Integration Tests**: Test the MCP tool handler
3. **Error Cases**: Test error handling
4. **Edge Cases**: Test boundary conditions

Example test structure:
```typescript
describe('NewFeature', () => {
  it('should successfully call feature', async () => {
    // Arrange
    const mockResponse = { data: { field: 'value' } };
    mockAxios.get.mockResolvedValue(mockResponse);

    // Act
    const result = await client.newFeature('param');

    // Assert
    expect(result.field).toBe('value');
  });

  it('should handle errors', async () => {
    // Test error handling
  });
});
```

## 📚 Documentation

### Documentation Standards

- **README.md**: Keep up to date with all features
- **CHANGELOG.md**: Document all changes by version
- **JSDoc**: Add to all public methods and complex functions
- **Examples**: Provide practical usage examples
- **Types**: Export and document all TypeScript types

### Writing Good Documentation

```typescript
/**
 * Adds a skill to the user's LinkedIn profile.
 *
 * @param skill - The skill object containing the skill name
 * @returns Promise with the created skill ID
 * @throws {Error} When the API request fails or skill name is invalid
 *
 * @example
 * ```typescript
 * const result = await client.addSkill({ name: 'TypeScript' });
 * console.log(result.id); // Outputs: skill-id-123
 * ```
 */
async addSkill(skill: LinkedInSkill): Promise<{ id: string }> {
  // Implementation
}
```

## 🐛 Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Detailed steps
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**:
   - Node.js version
   - OS and version
   - Package version
6. **Logs**: Relevant error messages or logs
7. **Code Sample**: Minimal reproducible example

Use the bug report template in `.github/ISSUE_TEMPLATE/bug_report.md`

### Feature Requests

For feature requests, include:

1. **Problem Statement**: What problem does this solve?
2. **Proposed Solution**: Your suggested implementation
3. **Alternatives**: Other solutions you've considered
4. **Use Cases**: How would this be used?
5. **LinkedIn API**: Does LinkedIn's API support this?

Use the feature request template in `.github/ISSUE_TEMPLATE/feature_request.md`

## 🔍 Code Review Process

### What We Look For

- **Correctness**: Does the code work as intended?
- **Tests**: Are there adequate tests?
- **Style**: Does it follow project conventions?
- **Performance**: Are there any performance concerns?
- **Security**: Are there any security issues?
- **Documentation**: Is it well documented?

### Review Timeline

- Initial review: Within 2-3 days
- Follow-up reviews: Within 1-2 days
- Approval requires: 1+ maintainer approval

## 🎯 Areas for Contribution

### High Priority

- Additional LinkedIn API endpoints (Company Pages, Groups)
- Performance optimizations
- Error handling improvements
- Additional test coverage for edge cases

### Good First Issues

Look for issues tagged with `good-first-issue`:
- Documentation improvements
- Test additions
- Small bug fixes
- Code cleanup

### Feature Ideas

- Message management (InMail)
- LinkedIn Groups integration
- Company Page management
- Analytics and insights
- Bulk operations
- Caching layer for API responses
- Rate limit handling improvements

## 🔐 Security

### Reporting Security Vulnerabilities

**DO NOT** open public issues for security vulnerabilities.

Please report security issues by:
1. Creating a private security advisory on GitHub
2. Or emailing security@pegasusheavy.com (if configured)

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Security Best Practices

When contributing:
- Never commit API keys or tokens
- Use environment variables for secrets
- Validate all user inputs
- Sanitize data from external APIs
- Follow OWASP guidelines

## 📦 Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

### Release Checklist

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Run full test suite
4. Create git tag: `git tag v1.x.x`
5. Push tag: `git push origin v1.x.x`
6. GitHub Actions will handle npm publish

## 💡 Tips for Contributors

### Development Tips

1. **Use TypeScript Strictly**: Enable strict mode in your editor
2. **Test Early**: Write tests as you code, not after
3. **Small PRs**: Keep PRs focused and manageable
4. **Ask Questions**: Use discussions for questions
5. **Read Existing Code**: Understand patterns before adding new code

### Common Pitfalls

- Forgetting to update tests
- Not handling errors properly
- Hardcoding values that should be configurable
- Breaking changes in minor versions
- Missing TypeScript types

### Useful Resources

- [LinkedIn API Documentation](https://learn.microsoft.com/en-us/linkedin/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 🙏 Recognition

Contributors will be:
- Listed in release notes
- Credited in CHANGELOG.md
- Added to Contributors section (if significant contributions)

## 📞 Getting Help

- **Questions**: Use [GitHub Discussions](https://github.com/pegasusheavy/linkedin-mcp/discussions)
- **Issues**: Use [GitHub Issues](https://github.com/pegasusheavy/linkedin-mcp/issues)
- **Chat**: Join our Discord (if available)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to LinkedIn MCP Server!**

Made with ❤️ by Pegasus Heavy Industries and contributors
