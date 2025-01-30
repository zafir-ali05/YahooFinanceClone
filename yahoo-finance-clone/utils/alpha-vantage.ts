import { setCache, getCache } from "./cache"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url)
      if (response.ok) return response
    } catch (error) {
      if (i === retries - 1) throw error
    }
    await delay(1000 * (i + 1)) // Exponential backoff
  }
  throw new Error("Failed to fetch after retries")
}

export async function fetchStockQuote(symbol: string) {
  const cacheKey = `quote_${symbol}`
  const cachedData = getCache(cacheKey)
  if (cachedData) return cachedData

  try {
    const response = await fetchWithRetry(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`,
    )

    const data = await response.json()

    console.log(`Raw API response for ${symbol}:`, JSON.stringify(data, null, 2))

    if (data.Note) {
      console.error(`API limit reached for ${symbol}:`, data.Note)
      throw new Error(data.Note)
    }

    if (data["Error Message"]) {
      console.error(`API error for ${symbol}:`, data["Error Message"])
      throw new Error(data["Error Message"])
    }

    const quote = data["Global Quote"]
    if (!quote || Object.keys(quote).length === 0) {
      console.error(`No data found for symbol ${symbol}`)
      throw new Error(`No data found for symbol ${symbol}`)
    }

    const result = {
      symbol,
      price: quote["05. price"],
      change: quote["09. change"],
      percentChange: quote["10. change percent"],
      isPositive: Number.parseFloat(quote["09. change"]) > 0,
    }

    setCache(cacheKey, result, 60) // Cache for 1 minute
    return result
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error)
    return {
      symbol,
      price: "N/A",
      change: "0",
      percentChange: "0%",
      isPositive: false,
      error: true,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function searchStocks(query: string) {
  const cacheKey = `search_${query}`
  const cachedData = getCache(cacheKey)
  if (cachedData) return cachedData

  try {
    const response = await fetchWithRetry(
      `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`,
    )
    const data = await response.json()

    if (data.Note) {
      throw new Error(data.Note)
    }

    const results = data.bestMatches || []
    setCache(cacheKey, results, 300) // Cache for 5 minutes
    return results
  } catch (error) {
    console.error("Error searching stocks:", error)
    return []
  }
}

