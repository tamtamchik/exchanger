import { BackendError, FetchError, MalformedError } from './errors'

export type CurrencyCode = string

interface YFResponse {
  chart: {
    result: {
      meta: {
        regularMarketPrice: number
      }
    }[]
  }
}

function getRateUrl (from: CurrencyCode, to: CurrencyCode): string {
  const YF_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart/'
  const YF_PARAMS = '=X?region=US&lang=en-US&includePrePost=false&interval=2m&useYfid=true&range=1d&corsDomain=finance.yahoo.com&.tsrc=finance'

  return YF_BASE + from.toUpperCase() + to.toUpperCase() + YF_PARAMS
}

async function fetchData (rateUrl: string): Promise<Response> {
  try {
    return await fetch(rateUrl)
  } catch (error: unknown) {
    throw new FetchError(`Request to ${rateUrl} failed.`)
  }
}

export async function getExchangeRate (from: CurrencyCode, to: CurrencyCode): Promise<number> {
  const rateUrl = getRateUrl(from, to)

  const response = await fetchData(rateUrl)
  if (!response.ok) {
    throw new BackendError(`Service did not return HTTP 200 response. Status: ${response.status}`)
  }

  const result = await response.json() as YFResponse

  const rate = result.chart?.result[0]?.meta?.regularMarketPrice
  if (!rate) {
    throw new MalformedError('Service did not return correct data structure.')
  }

  return rate
}
