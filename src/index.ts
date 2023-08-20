import { BackendError, FetchError, MalformedError } from './errors'

export type CurrencyCode = string;

interface YFResponse {
  chart: {
    result: {
      meta: {
        regularMarketPrice: number
      }
    }[]
  }
}

interface CachedRate {
  value: number;
  timestamp: number;
}

interface ExchangeRateOptions {
  cacheDurationMs?: number; // Defaults to undefined (no caching)
}

const YF_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart/'
const YF_PARAMS = '=X?region=US&lang=en-US&includePrePost=false&interval=2m&useYfid=true&range=1d&corsDomain=finance.yahoo.com&.tsrc=finance'

const rateCache: Record<string, CachedRate> = {}

function getRateUrl (from: CurrencyCode, to: CurrencyCode): string {
  return `${YF_BASE}${from.toUpperCase()}${to.toUpperCase()}${YF_PARAMS}`
}

function isCacheValid (cachedRate: CachedRate, cacheDurationMs: number): boolean {
  return Date.now() - cachedRate.timestamp < cacheDurationMs
}

function getCachedRate (from: CurrencyCode, to: CurrencyCode, cacheDurationMs?: number): number | null {
  const cacheKey = `${from}-${to}`
  const cachedRate = rateCache[cacheKey]
  return (cacheDurationMs && cachedRate && isCacheValid(cachedRate, cacheDurationMs)) ? cachedRate.value : null
}

async function fetchRate (rateUrl: string): Promise<number> {
  let response: Response

  try {
    response = await fetch(rateUrl)
    if (!response.ok) {
      throw new BackendError(`Service did not return HTTP 200 response. Status: ${response.status}`)
    }

    const result: YFResponse = await response.json()
    const rate = result.chart?.result[0]?.meta?.regularMarketPrice
    if (!rate) {
      throw new MalformedError('Unexpected response structure. Missing "regularMarketPrice".')
    }

    return rate
  } catch (error) {
    if (error instanceof BackendError || error instanceof MalformedError) {
      throw error
    }
    throw new FetchError(`Failed to fetch data from ${rateUrl}`)
  }
}

export async function getExchangeRate (
  from: CurrencyCode,
  to: CurrencyCode,
  options: ExchangeRateOptions = {}
): Promise<number> {
  const cachedRate = getCachedRate(from, to, options.cacheDurationMs)
  if (cachedRate !== null) {
    return cachedRate
  }

  const rateUrl = getRateUrl(from, to)
  const rate = await fetchRate(rateUrl)

  if (options.cacheDurationMs) {
    const cacheKey = `${from}-${to}`
    rateCache[cacheKey] = { value: rate, timestamp: Date.now() } // Cache the result with a timestamp
  }

  return rate
}


export * from './errors'
