import { describe, it, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import { getExchangeRate, NetworkError, ServerError, DataError } from "../src";

describe("getExchangeRate", () => {
  const validResponse = {
    chart: {
      result: [
        {
          meta: {
            regularMarketPrice: 1.23,
          },
        },
      ],
    },
  };

  afterEach(() => {
    mock.restoreAll();
  });

  it("should return exchange rate for valid response", async () => {
    mock.method(globalThis, "fetch", () =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(validResponse),
      }),
    );

    const rate = await getExchangeRate("USD", "EUR");
    assert.strictEqual(rate, 1.23);
  });

  it("should throw ServerError for non-200 HTTP status", async () => {
    mock.method(globalThis, "fetch", () =>
      Promise.resolve({
        ok: false,
        status: 404,
        statusText: "Not Found",
      }),
    );

    await assert.rejects(() => getExchangeRate("USD", "EUR"), ServerError);
  });

  it("should throw NetworkError for fetch failure", async () => {
    mock.method(globalThis, "fetch", () =>
      Promise.reject(new Error("Fetch failed")),
    );

    await assert.rejects(() => getExchangeRate("USD", "EUR"), NetworkError);
  });

  it("should throw DataError for unexpected response structure", async () => {
    mock.method(globalThis, "fetch", () =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      }),
    );

    await assert.rejects(() => getExchangeRate("USD", "EUR"), DataError);
  });

  it("should use cache for subsequent requests within cache duration", async () => {
    const fetchCtx = mock.method(globalThis, "fetch", () =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(validResponse),
      }),
    );

    const cacheDurationMs = 60000;
    await getExchangeRate("CHF", "SEK", { cacheDurationMs });
    const rate = await getExchangeRate("CHF", "SEK", { cacheDurationMs });

    assert.strictEqual(fetchCtx.mock.callCount(), 1);
    assert.strictEqual(rate, 1.23);
  });

  it("should fetch new data after cache duration expires", async () => {
    mock.timers.enable({ apis: ["Date"] });

    const fetchCtx = mock.method(globalThis, "fetch", () =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(validResponse),
      }),
    );

    const cacheDurationMs = 1000;
    await getExchangeRate("RSD", "EUR", { cacheDurationMs });

    mock.timers.tick(cacheDurationMs + 1);

    await getExchangeRate("RSD", "EUR", { cacheDurationMs });

    assert.strictEqual(fetchCtx.mock.callCount(), 2);

    mock.timers.reset();
  });

  it("should call the correct URL based on currency pair", async () => {
    const fetchCtx = mock.method(globalThis, "fetch", () =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(validResponse),
      }),
    );

    await getExchangeRate("USD", "EUR");

    const url = fetchCtx.mock.calls[0].arguments[0] as string;
    assert.ok(url.includes("USDEUR=X"));
    assert.ok(url.includes("query1.finance.yahoo.com"));
  });

  it("should handle different currency pairs", async () => {
    const fetchCtx = mock.method(globalThis, "fetch", () =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(validResponse),
      }),
    );

    await getExchangeRate("GBP", "JPY");

    const url = fetchCtx.mock.calls[0].arguments[0] as string;
    assert.ok(url.includes("GBPJPY=X"));
  });
});
