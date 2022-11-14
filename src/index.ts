import fetch from 'node-fetch'

import { BackendError, FetchError, MalformedError } from './errors.js'

export type CurrencyCode = string // TODO: update

const YF_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart/'
const YF_PARAMS = '=X?region=US&lang=en-US&includePrePost=false&interval=2m&useYfid=true&range=1d&corsDomain=finance.yahoo.com&.tsrc=finance'

interface YFResponse {
  chart: { result: { meta: { regularMarketPrice: number } }[] }
}

export async function getExchangeRate (from: CurrencyCode, to: CurrencyCode): Promise<number> {
  let response
  try {
    const rateUrl = YF_BASE + from.toUpperCase() + to.toUpperCase() + YF_PARAMS
    response = await fetch(rateUrl)
  } catch (error: unknown) {
    throw new FetchError('Request failed.')
  }

  if (!response.ok) {
    throw new BackendError('Service did not return HTTP 200 response.')
  }

  const result = await response.json() as YFResponse
  const rate = result.chart?.result[0]?.meta?.regularMarketPrice

  if (!rate) {
    throw new MalformedError('Service did not return correct data structure.')
  }

  return rate
}
