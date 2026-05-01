# @lovebowls/leagueElements

A modern TypeScript package for managing league elements in LoveBowls.

## Installation

```bash
npm install @lovebowls/leagueElements
```

## Features

- Modern TypeScript implementation
- ESM and CommonJS support
- Tree-shaking friendly
- Comprehensive type definitions
- Built-in testing with Jest
- Full documentation with TypeDoc

## Usage

```typescript
import { BaseLeagueElement } from '@lovebowls/leagueElements';

// Create a new league element
const element = new BaseLeagueElement({
  type: 'match',
  // Add additional properties as needed
});

// Update element data
element.update({
  type: 'updated-match'
});
```

## Development

### Prerequisites

- Node.js >= 18
- npm >= 8

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Available Scripts

- `npm run build` - Build the package
- `npm run test` - Run tests
- `npm run docs` - Generate documentation
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Building

The package builds to both ESM and CommonJS formats:

- ESM: `dist/esm/`
- CommonJS: `dist/cjs/`
- Type definitions: `dist/types/`

## License

MIT 


## DEV GUIDE

Set-Location "C:\lb\dev\leagueJS"
npm whoami
git status
npm test
npm run build
npm version patch
npm publish
git push
git push --tags

npm view @lovebowls/leaguejs version

Set-Location "C:\lb\dev\leagueElements"
git status
npm pkg set "dependencies.@lovebowls/leaguejs=^0.2.29"
npm install
npm test
npm run build
npm version patch
npm publish
git push
git push --tags

npm view @lovebowls/leagueelements version