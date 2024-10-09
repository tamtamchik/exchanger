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

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should return exchange rate for valid response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(validResponse),
    });

    const rate = await getExchangeRate("USD", "EUR");
    expect(rate).toBe(1.23);
  });

  it("should throw BackendError for non-200 HTTP status", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    await expect(getExchangeRate("USD", "EUR")).rejects.toThrow(ServerError);
  });

  it("should throw FetchError for fetch failure", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Fetch failed"));

    await expect(getExchangeRate("USD", "EUR")).rejects.toThrow(NetworkError);
  });

  it("should throw MalformedError for unexpected response structure", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}), // An empty response
    });

    await expect(getExchangeRate("USD", "EUR")).rejects.toThrow(DataError);
  });

  it("should use cache for subsequent requests within cache duration", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(validResponse),
    });

    const cacheDurationMs = 60000;
    await getExchangeRate("USD", "EUR", { cacheDurationMs });
    const rate = await getExchangeRate("USD", "EUR", { cacheDurationMs });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(rate).toBe(1.23);
  });

  it("should fetch new data after cache duration expires", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(validResponse),
    });

    const cacheDurationMs = 1000;
    await getExchangeRate("RSD", "EUR", { cacheDurationMs });

    jest.advanceTimersByTime(cacheDurationMs + 1);

    await getExchangeRate("RSD", "EUR", { cacheDurationMs });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("should call the correct URL based on currency pair", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(validResponse),
    });

    await getExchangeRate("USD", "EUR");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("USDEUR=X"),
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("query1.finance.yahoo.com"),
    );
  });

  it("should handle different currency pairs", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(validResponse),
    });

    await getExchangeRate("GBP", "JPY");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("GBPJPY=X"),
    );
  });
});
