import { getExchangeRate, MalformedError, FetchError, BackendError } from '../src'

describe('Exchange Rate Service', () => {

  beforeEach(() => global.fetch = jest.fn())

  it('should correctly fetch the exchange rate', async () => {
    const mockedResponse: any = {
      chart: {
        result: [{
          meta: {
            regularMarketPrice: 100
          }
        }]
      }
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockedResponse)
    })

    const rate = await getExchangeRate('USD', 'EUR')
    expect(rate).toBe(100)
  })

  it('should throw FetchError if fetch fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed fetch'))

    await expect(getExchangeRate('USD', 'EUR')).rejects.toThrow(FetchError)
  })

  it('should throw BackendError for non-200 HTTP responses', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 404 })

    await expect(getExchangeRate('USD', 'EUR')).rejects.toThrow(BackendError)
  })

  it('should throw MalformedError if data structure is not correct', async () => {
    const mockedResponse: any = {
      incorrectField: {}
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockedResponse)
    })

    await expect(getExchangeRate('USD', 'EUR')).rejects.toThrow(MalformedError)
  })

})
