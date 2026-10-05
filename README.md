<p align="center">
  <img src="docs/assets/exchanger-readme-banner.png" alt="Exchanger" width="100%">
</p>

<p align="center">
  <strong>Currency exchange rates from Yahoo Finance for JavaScript and TypeScript.</strong>
</p>

<p align="center">
  <a href="https://nodejs.org/"><img alt="Node.js 20+" src="https://img.shields.io/badge/Node.js-20%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white"></a>
  <a href="https://www.npmjs.com/package/@tamtamchik/exchanger"><img alt="Latest version on npm" src="https://img.shields.io/npm/v/@tamtamchik/exchanger?style=flat-square&logo=npm&logoColor=white"></a>
  <a href="https://www.npmjs.com/package/@tamtamchik/exchanger"><img alt="Total downloads" src="https://img.shields.io/npm/dt/@tamtamchik/exchanger?style=flat-square"></a>
  <a href="https://github.com/tamtamchik/exchanger/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/tamtamchik/exchanger/ci.yml?branch=main&style=flat-square&label=CI"></a>
  <a href="https://scrutinizer-ci.com/g/tamtamchik/exchanger/"><img alt="Scrutinizer build" src="https://img.shields.io/scrutinizer/build/g/tamtamchik/exchanger/main?style=flat-square"></a>
  <a href="https://scrutinizer-ci.com/g/tamtamchik/exchanger/"><img alt="Scrutinizer quality" src="https://img.shields.io/scrutinizer/quality/g/tamtamchik/exchanger/main?style=flat-square"></a>
  <a href="https://scrutinizer-ci.com/g/tamtamchik/exchanger/"><img alt="Code coverage" src="https://img.shields.io/scrutinizer/coverage/g/tamtamchik/exchanger/main?style=flat-square"></a>
  <a href="LICENSE"><img alt="License MIT" src="https://img.shields.io/badge/license-MIT-22c55e?style=flat-square"></a>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> ·
  <a href="#usage">Usage</a> ·
  <a href="#development-setup">Development Setup</a> ·
  <a href="#documentation">Documentation</a> ·
  <a href="#security-notes">Security Notes</a>
</p>

Exchanger fetches currency exchange rates from Yahoo Finance without an API key.
It supports ES modules and CommonJS, includes TypeScript types, and provides optional
in-memory caching and typed errors. Node.js 20 or later is required.

## Quick Start

Install with npm:

```shell
npm install @tamtamchik/exchanger
```

Or with yarn:

```shell
yarn add @tamtamchik/exchanger
```

Fetch a rate:

```typescript
import { getExchangeRate } from "@tamtamchik/exchanger";

const rate = await getExchangeRate("USD", "EUR");
console.log(`1 USD = ${rate} EUR`);
```

## Usage

Pass the source and target currency codes to `getExchangeRate`. It returns a
`Promise<number>` containing the rate for the pair. The Yahoo Finance request uses
uppercase currency codes.

### ES Modules

```typescript
import { getExchangeRate } from "@tamtamchik/exchanger";

const rate = await getExchangeRate("USD", "EUR");
console.log(`1 USD = ${rate} EUR`);
```

### CommonJS

```javascript
const { getExchangeRate } = require("@tamtamchik/exchanger");

getExchangeRate("USD", "EUR")
  .then((rate) => console.log(`1 USD = ${rate} EUR`))
  .catch((error) => console.error(error));
```

### Caching

Caching is disabled by default. Set `cacheDurationMs` to reuse a fetched rate for
the same currency pair:

```typescript
const rate = await getExchangeRate("USD", "EUR", {
  cacheDurationMs: 3_600_000, // One hour, in milliseconds.
});
```

The cache lives in memory and is lost when the process exits. Calls must enable
caching to read cached rates. Use consistent letter case for currency codes;
cache keys preserve the case you pass.

### Error Handling

Exchanger exports three error classes, each extending `Error`:

| Error          | Cause                                                              |
| -------------- | ------------------------------------------------------------------ |
| `NetworkError` | The request fails or the response cannot be parsed as JSON.        |
| `ServerError`  | Yahoo Finance returns an unsuccessful HTTP status.                 |
| `DataError`    | The parsed response has a missing or invalid `regularMarketPrice`. |

```typescript
import {
  DataError,
  NetworkError,
  ServerError,
  getExchangeRate,
} from "@tamtamchik/exchanger";

try {
  const rate = await getExchangeRate("USD", "EUR");
  console.log(`1 USD = ${rate} EUR`);
} catch (error) {
  if (error instanceof NetworkError) {
    console.error("Network or JSON parsing problem:", error.message);
  } else if (error instanceof ServerError) {
    console.error("Yahoo Finance HTTP error:", error.message);
  } else if (error instanceof DataError) {
    console.error("Unexpected response data:", error.message);
  } else {
    console.error("Unknown error:", error);
  }
}
```

## Development Setup

Prerequisite: Node.js 24.11 LTS or later and its bundled npm. CI tests Node.js 24 and 26.
The `.nvmrc` file selects Node.js 24; npm enforces the development runtime through
`devEngines`. The published library retains its Node.js 20+ runtime requirement.

Install dependencies:

```shell
npm ci
```

Run the checks used in CI:

```shell
npm run check
npm run build
npm test
```

Biome checks and formats TypeScript and JSON files. Markdown and YAML files are
not formatted by these commands. Coverage uses unit tests; `npm test` also runs
acceptance tests against Yahoo Finance.

Useful focused commands:

```shell
npm run fix      # Format, organize imports, and apply safe lint fixes.
npm run dev      # Rebuild when source files change.
npm run coverage # Run unit tests and generate coverage reports.
```

## Documentation

- [npm package](https://www.npmjs.com/package/@tamtamchik/exchanger): published versions and installation details.
- [Source](src/index.ts): exchange-rate requests and cache behavior.
- [Tests](test/): rate retrieval, caching, errors, and package acceptance checks.
- [Security policy](SECURITY.md): vulnerability reporting.
- [CI](https://github.com/tamtamchik/exchanger/actions/workflows/ci.yml): formatting, lint, build, and test results.

## Security Notes

Rates depend on Yahoo Finance availability and data. Exchanger returns a numeric
rate; it does not execute currency exchanges.

Report vulnerabilities through [GitHub's private vulnerability reporting](https://github.com/tamtamchik/exchanger/security/advisories/new).
See [SECURITY.md](SECURITY.md) for the reporting policy.

## Contributing

Pull requests are welcome. For major changes, [open an issue](https://github.com/tamtamchik/exchanger/issues)
first to discuss the proposal.

## Support

<p>
  <a href="https://www.buymeacoffee.com/tamtamchik"><img alt="Buy me a coffee" src="https://img.shields.io/badge/Buy%20Me%20A-Coffee-6F4E37?style=flat-square&logo=buymeacoffee&logoColor=white"></a>
</p>

## License

[MIT](LICENSE).
