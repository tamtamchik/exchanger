import { getExchangeRate } from '../src'

describe('getExchangeRate acceptance tests', () => {

  jest.setTimeout(30 * 1000)

  it('should return exchange rate for real API call', async () => {
    const rate = await getExchangeRate('USD', 'EUR')

    console.log(`1 USD = ${rate} EUR`)
    expect(rate).toBeGreaterThan(0)  // Basic check, as the actual rate will vary
  })

  it('should handle requests for multiple currency pairs', async () => {
    const rates = await Promise.all([
      getExchangeRate('USD', 'EUR'),
      getExchangeRate('USD', 'GBP'),
      getExchangeRate('USD', 'JPY'),
    ])

    console.log(`1 USD = ${rates[0]} EUR`)
    console.log(`1 USD = ${rates[1]} GBP`)
    console.log(`1 USD = ${rates[2]} JPY`)

    rates.forEach(rate => {
      expect(rate).toBeGreaterThan(0)
    })
  })

  it('should throw an error for unknown currency codes', async () => {
    await expect(getExchangeRate('USD', 'ZZZ')).rejects.toThrow()
  })
})
