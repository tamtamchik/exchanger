# Exchanger

[![Buy Me A Coffee][ico-coffee]][link-coffee]
[![Latest Version on NPM][ico-version]][link-npm]
[![Scrutinizer build][ico-scrutinizer-build]][link-scrutinizer]
[![Scrutinizer quality][ico-scrutinizer-quality]][link-scrutinizer]
[![Scrutinizer coverage][ico-scrutinizer-coverage]][link-scrutinizer]
[![Software License][ico-license]](LICENSE)
[![Total Downloads][ico-downloads]][link-downloads]

This package provides functionality to fetch the exchange rates of different currencies using Yahoo Finance APIs.

## Installation

Using npm:

```shell
npm install @tamtamchik/exchanger
```

Using yarn:

```shell
yarn add @tamtamchik/exchanger
```

## Usage

Import Exchanger in your TypeScript file:

```typescript
import { getExchangeRate } from "@tamtamchik/exchanger";

async function fetchRate() {
  try {
    const rate = await getExchangeRate("USD", "EUR");
    console.log(`Exchange rate from USD to EUR: ${rate}`);
  } catch (error) {
    console.error(`Failed to fetch the exchange rate: ${error.message}`);
  }
}

fetchRate();
```

## Caching

To improve performance and reduce the number of requests made to the API, you can use the built-in caching feature.
By default, caching is **_disabled_**. You can enable and customize caching by passing an options object to the `getExchangeRate` function:

```javascript
// Cache for 1 hour (3600000 milliseconds)
const rate = await getExchangeRate("USD", "EUR", { cacheDurationMs: 3600000 });
```

Once a rate is fetched, it's stored in an in-memory cache.
If you fetch the same rate within the specified caching duration, the cached rate is returned instead ofmaking a new API call.

## Error Handling

This package defines the following error classes for better error handling:

- `NetworkError`: Thrown when there is a network problem and the request cannot be made.
- `ServerError`: Thrown when the service does not return a HTTP 200 response.
- `DataError`: Thrown when the service does not return the expected data structure.

Each error class extends the built-in Error class, so you can use instanceof to check the error type.

```typescript
import {
  ServerError,
  NetworkError,
  DataError,
  getExchangeRate,
} from "@tamtamchik/exchanger";

async function fetchRate() {
  try {
    const rate = await getExchangeRate("USD", "EUR");
    console.log(`Exchange rate from USD to EUR: ${rate}`);
  } catch (error) {
    if (error instanceof NetworkError) {
      console.error("Network problem:", error.message);
    } else if (error instanceof ServerError) {
      console.error("Backend problem:", error.message);
    } else if (error instanceof DataError) {
      console.error("Unexpected response data:", error.message);
    } else {
      console.error("Unknown error:", error.message);
    }
  }
}

fetchRate();
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

Exchanger is [MIT licensed](./LICENSE).

[ico-coffee]: https://img.shields.io/badge/Buy%20Me%20A-Coffee-%236F4E37.svg?style=flat-square
[ico-version]: https://img.shields.io/npm/v/@tamtamchik/exchanger.svg?style=flat-square
[ico-license]: https://img.shields.io/npm/l/@tamtamchik/exchanger.svg?style=flat-square
[ico-downloads]: https://img.shields.io/npm/dt/@tamtamchik/exchanger.svg?style=flat-square
[ico-scrutinizer-build]: https://img.shields.io/scrutinizer/build/g/tamtamchik/exchanger/main.svg?style=flat-square
[ico-scrutinizer-quality]: https://img.shields.io/scrutinizer/quality/g/tamtamchik/exchanger/main.svg?style=flat-square
[ico-scrutinizer-coverage]: https://img.shields.io/scrutinizer/coverage/g/tamtamchik/exchanger/main.svg?style=flat-square
[link-coffee]: https://www.buymeacoffee.com/tamtamchik
[link-npm]: https://www.npmjs.com/package/@tamtamchik/exchanger
[link-downloads]: https://www.npmjs.com/package/@tamtamchik/exchanger
[link-scrutinizer]: https://scrutinizer-ci.com/g/tamtamchik/exchanger/
