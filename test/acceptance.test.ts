import { describe, it, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import { getExchangeRate, NetworkError, ServerError } from "../src";

describe("getExchangeRate acceptance tests", () => {
  afterEach(() => {
    mock.restoreAll();
  });

  it(
    "should return a valid exchange rate for USD to EUR",
    { timeout: 30000 },
    async () => {
      const rate = await getExchangeRate("USD", "EUR");
      assert.ok(rate > 0);
      assert.ok(rate < 2);
      console.log(`1 USD = ${rate} EUR`);
    },
  );

  it(
    "should handle requests for multiple currency pairs",
    { timeout: 30000 },
    async () => {
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
        assert.ok(rate > 0);
        console.log(`1 ${from} = ${rate} ${to}`);
      });
    },
  );

  it(
    "should throw a ServerError for unknown currency codes",
    { timeout: 30000 },
    async () => {
      await assert.rejects(() => getExchangeRate("USD", "ZZZ"), ServerError);
    },
  );

  it(
    "should use cache for repeated requests within cache duration",
    { timeout: 30000 },
    async () => {
      const cacheDurationMs = 5000;
      const start = Date.now();

      const rate1 = await getExchangeRate("USD", "EUR", { cacheDurationMs });
      const rate2 = await getExchangeRate("USD", "EUR", { cacheDurationMs });

      assert.strictEqual(rate1, rate2);
      assert.ok(Date.now() - start < cacheDurationMs);
    },
  );

  it(
    "should throw a NetworkError when network is unavailable",
    { timeout: 30000 },
    async () => {
      mock.method(globalThis, "fetch", () =>
        Promise.reject(new Error("Network failure")),
      );

      await assert.rejects(() => getExchangeRate("USD", "EUR"), NetworkError);

      await assert.rejects(() => getExchangeRate("USD", "EUR"), {
        message: "Failed to fetch exchange rate: Network failure",
      });

      mock.restoreAll();
      mock.method(globalThis, "fetch", () => Promise.reject("Error"));

      await assert.rejects(() => getExchangeRate("USD", "EUR"), {
        message: "Failed to fetch exchange rate: Error",
      });

      mock.restoreAll();
    },
  );
});
