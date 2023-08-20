import { BackendError, FetchError, getExchangeRate, MalformedError } from '../src'

describe('getExchangeRate', () => {
  const validRateUrl = 'https://query1.finance.yahoo.com/v8/finance/chart/USDEUR=X?...' // Your complete valid URL
  const validResponse = {
    chart: {
      result: [{
        meta: {
          regularMarketPrice: 1.23
        }
      }]
    }
  }

  beforeEach(() => {
    jest.resetAllMocks()
    jest.useFakeTimers()

    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should return exchange rate for valid response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(validResponse)
    })

    const rate = await getExchangeRate('USD', 'EUR')
    expect(rate).toBe(1.23)
  })

  it('should throw BackendError for non-200 HTTP status', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    })

    await expect(getExchangeRate('USD', 'EUR')).rejects.toThrow(BackendError)
  })

  it('should throw FetchError for fetch failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Fetch failed'))

    await expect(getExchangeRate('USD', 'EUR')).rejects.toThrow(FetchError)
  })

  it('should throw MalformedError for unexpected response structure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}) // An empty response
    })

    await expect(getExchangeRate('USD', 'EUR')).rejects.toThrow(MalformedError)
  })

  it('should use cache for subsequent requests within cache duration', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(validResponse)
    })

    await getExchangeRate('USD', 'EUR', { cacheDurationMs: 60000 })
    const rate = await getExchangeRate('USD', 'EUR', { cacheDurationMs: 60000 })

    expect(global.fetch).toHaveBeenCalledTimes(1) // Fetch was called only once, second time used cache.
    expect(rate).toBe(1.23)
  })

  it('should fetch new data after cache duration expires', async () => {
    // Mock fetch to always return the valid response.
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(validResponse)
    })

    await getExchangeRate('USD', 'EUR', { cacheDurationMs: 1 })

    // Advance timers
    jest.advanceTimersByTime(100)

    await getExchangeRate('USD', 'EUR', { cacheDurationMs: 1 })

    expect(global.fetch).toHaveBeenCalledTimes(2) // Fetch was called twice.
  })

  it('should call the correct URL based on currency pair', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(validResponse)
    })

    await getExchangeRate('USD', 'EUR')
    expect(global.fetch).toHaveBeenCalledWith('https://query1.finance.yahoo.com/v8/finance/chart/USDEUR=X?region=US&lang=en-US&includePrePost=false&interval=2m&useYfid=true&range=1d&corsDomain=finance.yahoo.com&.tsrc=finance')
  })
})
