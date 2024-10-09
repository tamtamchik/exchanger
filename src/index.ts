import { DataError, NetworkError, ServerError } from "./errors";

interface ExchangeRateResponse {
  chart: {
    result: [
      {
        meta: {
          regularMarketPrice: number;
        };
      },
    ];
  };
}

interface CachedRate {
  value: number;
  timestamp: number;
}

interface ExchangeRateOptions {
  cacheDurationMs?: number;
}

const YAHOO_FINANCE_BASE_URL =
  "https://query1.finance.yahoo.com/v8/finance/chart/";
const YAHOO_FINANCE_QUERY_PARAMS =
  "=X?region=US&lang=en-US&includePrePost=false&interval=2m&useYfid=true&range=1d&corsDomain=finance.yahoo.com&.tsrc=finance";

const rateCache = new Map<string, CachedRate>();

function buildRateUrl(fromCurrency: string, toCurrency: string): string {
  return `${YAHOO_FINANCE_BASE_URL}${fromCurrency.toUpperCase()}${toCurrency.toUpperCase()}${YAHOO_FINANCE_QUERY_PARAMS}`;
}

function isCacheValid(
  cachedRate: CachedRate,
  cacheDurationMs: number,
): boolean {
  return Date.now() - cachedRate.timestamp < cacheDurationMs;
}

function getCachedRate(
  fromCurrency: string,
  toCurrency: string,
  cacheDurationMs?: number,
): number | null {
  if (!cacheDurationMs) return null;
  const cacheKey = `${fromCurrency}-${toCurrency}`;
  const cachedRate = rateCache.get(cacheKey);
  return cachedRate && isCacheValid(cachedRate, cacheDurationMs)
    ? cachedRate.value
    : null;
}

async function fetchExchangeRateResponse(rateUrl: string): Promise<Response> {
  const response = await fetch(rateUrl);
  if (!response.ok) {
    throw new ServerError(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response;
}

function extractRateFromResponse(response: ExchangeRateResponse): number {
  const rate = response.chart?.result[0]?.meta?.regularMarketPrice;
  if (typeof rate !== "number" || isNaN(rate)) {
    throw new DataError('Invalid or missing "regularMarketPrice" in response.');
  }
  return rate;
}

async function fetchExchangeRate(rateUrl: string): Promise<number> {
  try {
    const response = await fetchExchangeRateResponse(rateUrl);
    const responseData: ExchangeRateResponse = await response.json();
    return extractRateFromResponse(responseData);
  } catch (error) {
    if (error instanceof ServerError || error instanceof DataError) {
      throw error;
    }
    throw new NetworkError(
      `Failed to fetch exchange rate: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string,
  options: ExchangeRateOptions = {},
): Promise<number> {
  const { cacheDurationMs } = options;
  const cachedRate = getCachedRate(fromCurrency, toCurrency, cacheDurationMs);
  if (cachedRate !== null) {
    return cachedRate;
  }

  const rateUrl = buildRateUrl(fromCurrency, toCurrency);
  const rate = await fetchExchangeRate(rateUrl);

  if (cacheDurationMs) {
    const cacheKey = `${fromCurrency}-${toCurrency}`;
    rateCache.set(cacheKey, { value: rate, timestamp: Date.now() });
  }

  return rate;
}

export * from "./errors";
