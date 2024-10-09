import { getExchangeRate, NetworkError, ServerError } from "../src";

describe("getExchangeRate acceptance tests", () => {
  jest.setTimeout(30 * 1000);

  it("should return a valid exchange rate for USD to EUR", async () => {
    const rate = await getExchangeRate("USD", "EUR");
    expect(rate).toBeGreaterThan(0);
    expect(rate).toBeLessThan(2); // Assuming 1 USD is unlikely to be worth more than 2 EUR
    console.log(`1 USD = ${rate} EUR`);
  });

  it("should handle requests for multiple currency pairs", async () => {
    const currencyPairs = [
      { from: "USD", to: "EUR" },
      { from: "USD", to: "GBP" },
      { from: "USD", to: "JPY" },
      { from: "EUR", to: "GBP" },
    ];

    const rates = await Promise.all(
      currencyPairs.map((pair) => getExchangeRate(pair.from, pair.to)),
    );

    rates.forEach((rate, index) => {
      const { from, to } = currencyPairs[index];
      expect(rate).toBeGreaterThan(0);
      console.log(`1 ${from} = ${rate} ${to}`);
    });
  });

  it("should throw a BackendError for unknown currency codes", async () => {
    await expect(getExchangeRate("USD", "ZZZ")).rejects.toThrow(ServerError);
  });

  it("should use cache for repeated requests within cache duration", async () => {
    const cacheDurationMs = 5000;
    const start = Date.now();

    const rate1 = await getExchangeRate("USD", "EUR", { cacheDurationMs });
    const rate2 = await getExchangeRate("USD", "EUR", { cacheDurationMs });

    expect(rate1).toBe(rate2);
    expect(Date.now() - start).toBeLessThan(cacheDurationMs);
  });

  it("should throw a NetworkError when network is unavailable", async () => {
    jest.spyOn(global, "fetch").mockRejectedValue(new Error("Network failure"));

    await expect(getExchangeRate("USD", "EUR")).rejects.toThrow(NetworkError);

    await expect(getExchangeRate("USD", "EUR")).rejects.toThrow(
      "Failed to fetch exchange rate: Network failure",
    );

    jest.spyOn(global, "fetch").mockRejectedValue("Error");

    await expect(getExchangeRate("USD", "EUR")).rejects.toThrow(
      "Failed to fetch exchange rate: Error",
    );

    jest.restoreAllMocks();
  });
});
