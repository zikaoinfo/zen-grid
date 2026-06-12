# zen-grid

Production-grade, signal-native Angular data grid. Virtual scrolling, server-side row models, grouping, pivoting, editing, and exporting — zero runtime dependencies beyond Angular.

## Features

- Built with Angular 19+ signals and zoneless change detection
- Virtual scrolling for large datasets
- Server-side row models
- Grouping and pivoting
- Inline editing
- CSV / Excel export
- Zero runtime dependencies beyond Angular and RxJS

## Installation

```bash
npm install zen-grid
```

## Quick Start

```ts
import { ZenGridModule } from 'zen-grid';

@NgModule({
  imports: [ZenGridModule],
})
export class AppModule {}
```

## Development

```bash
# Install dependencies
npm ci

# Build the library
npm run build:prod

# Run tests
npx jest --ci
```

## License

MIT
