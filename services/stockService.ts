//const API_KEY = "a3MwQVg1Q0M0dUtGb3FqUDgxZXIyVDE2a3V0Q3pwYXBKblhoVlhwRVNvbz0"
const API_BASE_URL = "https://api.marketdata.app/v1/stocks/quotes"
const WS_BASE_URL = "wss://api.marketdata.app/v1/stocks/quotes/realtime"

interface StockQuote {
  s: string
  symbol: string[]
  ask: number[]
  askSize: number[]
  bid: number[]
  bidSize: number[]
  mid: number[]
  last: number[]
  volume: number[]
  updated: number[]
}

// Cache structure to store quotes with timestamps
const quoteCache = new Map<
  string,
  {
    data: StockQuote
    timestamp: number
    expires: number
  }
>()

const CACHE_DURATION = 10000 // 10 seconds cache

export async function getStockQuote(symbol: string): Promise<StockQuote> {
  const now = Date.now()
  const cached = quoteCache.get(symbol)

  // Return cached data if it's still valid
  if (cached && now < cached.expires) {
    return cached.data
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${symbol}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const data = await response.json()

    // Cache the new data
    quoteCache.set(symbol, {
      data,
      timestamp: now,
      expires: now + CACHE_DURATION,
    })

    return data
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error)
    throw error
  }
}

// Helper function to format large numbers
export function formatLargeNumber(num: number) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T"
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B"
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M"
  return num.toLocaleString()
}

const STOCK_SYMBOLS = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "NVDA",
  "META",
  "TSLA",
  "JPM",
  "V",
  "PG",
  "JNJ",
  "UNH",
  "MA",
  "HD",
  "ADBE",
  "CRM",
  "NFLX",
  "DIS",
  "CSCO",
  "VZ",
]

export async function searchStocks(query: string): Promise<StockQuote[]> {
  const symbols = STOCK_SYMBOLS.filter(
    (symbol) =>
      symbol.toLowerCase().includes(query.toLowerCase()) ||
      getCompanyName(symbol).toLowerCase().includes(query.toLowerCase()),
  )

  const results = await Promise.all(symbols.map((symbol) => getStockQuote(symbol)))
  return results
}

// Helper function to get company name (replace with actual company names if available)
function getCompanyName(symbol: string): string {
  const companies: { [key: string]: string } = {
    AAPL: "Apple Inc.",
    MSFT: "Microsoft Corporation",
    GOOGL: "Alphabet Inc.",
    AMZN: "Amazon.com Inc.",
    NVDA: "NVIDIA Corporation",
    META: "Meta Platforms Inc.",
    TSLA: "Tesla Inc.",
    JPM: "JPMorgan Chase & Co.",
    V: "Visa Inc.",
    PG: "Procter & Gamble Co.",
    JNJ: "Johnson & Johnson",
    UNH: "UnitedHealth Group Inc.",
    MA: "Mastercard Inc.",
    HD: "The Home Depot Inc.",
    ADBE: "Adobe Inc.",
    CRM: "Salesforce Inc.",
    NFLX: "Netflix Inc.",
    DIS: "The Walt Disney Company",
    CSCO: "Cisco Systems Inc.",
    VZ: "Verizon Communications Inc.",
  }
  return companies[symbol] || symbol
}

// WebSocket connection for real-time updates
let ws: WebSocket | null = null
const listeners = new Map<string, Set<(data: StockQuote) => void>>()

export function subscribeToRealtimeUpdates(symbols: string[], callback: (data: StockQuote) => void) {
  if (!ws) {
    ws = new WebSocket(`${WS_BASE_URL}?token=${API_KEY}`)

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      const symbol = data.symbol[0]
      const listeners = getSymbolListeners(symbol)
      listeners.forEach((listener) => listener(data))
    }

    ws.onopen = () => {
      if (ws) {
        ws.send(JSON.stringify({ action: "subscribe", symbols }))
      }
    }
  }

  symbols.forEach((symbol) => {
    const symbolListeners = getSymbolListeners(symbol)
    symbolListeners.add(callback)
  })

  return () => {
    symbols.forEach((symbol) => {
      const symbolListeners = getSymbolListeners(symbol)
      symbolListeners.delete(callback)
    })
  }
}

function getSymbolListeners(symbol: string): Set<(data: StockQuote) => void> {
  if (!listeners.has(symbol)) {
    listeners.set(symbol, new Set())
  }
  return listeners.get(symbol)!
}

export function unsubscribeFromRealtimeUpdates() {
  if (ws) {
    ws.close()
    ws = null
  }
  listeners.clear()
}

