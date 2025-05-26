# Centralized Code Quality Setup

This workspace uses a centralized approach for code formatting and linting across all packages. This ensures consistency and simplifies the development workflow.

## Configuration Files

### Root Level

- `eslint.config.js` - ESLint configuration for all packages
- `.prettierrc` - Prettier formatting configuration
- `.prettierignore` - Files to exclude from formatting

### Package-Specific Rules

The ESLint configuration includes package-specific rules:

- **Core package** (`packages/core/`): Stricter rules for library code
- **Demo package** (`packages/demo/`): More relaxed rules for application code

## Available Scripts

Run these commands from the workspace root:

### Linting

```bash
# Lint all TypeScript files across packages
pnpm lint

# Lint and auto-fix issues where possible
pnpm lint:fix
```

### Formatting

```bash
# Format all code files
pnpm format

# Check if files are properly formatted
pnpm format:check
```

### Type Checking

```bash
# Run TypeScript type checking in all packages
pnpm type-check
```

### Comprehensive Check

```bash
# Run type checking, linting, and format checking
pnpm check
```

### Package-Specific Commands

```bash
# Build core library
pnpm build:core

# Build demo application
pnpm build:demo

# Build both packages
pnpm build

# Start demo development server
pnpm dev

# Preview demo build
pnpm preview
```

## IDE Integration

### VS Code

Add this to your workspace settings (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.workingDirectories": ["."]
}
```

## Benefits of Centralized Setup

1. **Consistency**: Same formatting and linting rules across all packages
2. **Simplified Maintenance**: Single place to update rules and dependencies
3. **Reduced Duplication**: No need to maintain separate config files in each package
4. **Workspace-Wide Operations**: Format and lint all packages with a single command
5. **Better CI/CD**: Easier to run quality checks across the entire codebase

## Package-Specific Rules

### Core Package (`packages/core/`)

- Stricter React component rules for library development
- No console statements (libraries shouldn't have console output)
- Enhanced TypeScript rules for public API

### Demo Package (`packages/demo/`)

- Allows console statements for debugging
- More relaxed display name requirements
- Standard React application rules

## Dependencies

All linting and formatting dependencies are managed at the workspace root level. Individual packages only include their specific runtime dependencies.

## Migration from Package-Level Configs

The setup was migrated from individual package configurations to provide:

- Unified code style across packages
- Simplified dependency management
- Consistent tooling versions
- Easier CI/CD pipeline setup
