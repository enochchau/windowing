# Windowing

A React virtualization library with demo applications, built as a pnpm workspace.

## Packages

### `@windowing/core`
The core virtualization library containing:
- `VirtualList` - Efficient virtual list component with sticky items support
- `VirtualGrid` - Virtual grid component with sticky rows/columns
- `AutoSizer` - Automatic sizing component
- Hooks: `useVirtualList`, `useVirtualGrid`, `useAutoSizer`

### `@windowing/demo`
Demo application showcasing the core library features:
- CSV viewer with virtual grid
- List and grid examples
- Interactive demos with controls

## Development

```bash
# Install dependencies
pnpm install

# Build core library
pnpm build:core

# Start demo development server
pnpm dev

# Build everything
pnpm build
```

## Workspace Structure

```
packages/
├── core/          # @windowing/core - Core virtualization library
│   ├── src/       # TypeScript source files
│   └── dist/      # Built files
└── demo/          # @windowing/demo - Demo application
    ├── src/       # Demo app source files
    └── dist/      # Built demo app
```

## Features

- Sticky leading rows and columns
- Variable sized items/cells
- Grid row & column hover effects
- Scroll to item/cell functionality
- TypeScript support
- Performance optimized for large datasets

## Live Demo

https://enochchau.github.io/windowing/
