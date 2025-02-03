// Simulated API base URL (replace with your actual backend URL when deployed)
const API_BASE_URL = "/api"

export interface StockQuote {
  symbol: string
  companyName: string
  price: number
  change: number
  changePercent: number
  volume: number
}

export interface IndexQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

export async function getStockQuote(symbol: string): Promise<StockQuote> {
  const response = await fetch(`${API_BASE_URL}/quote/${symbol}`)
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`)
  }
  return await response.json()
}

export async function searchStocks(query: string): Promise<StockQuote[]> {
  const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`)
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`)
  }
  return await response.json()
}

export async function getWatchlistStocks(symbols: string[]): Promise<StockQuote[]> {
  const response = await fetch(`${API_BASE_URL}/quotes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ symbols }),
  })
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`)
  }
  return await response.json()
}

export async function getTopIndices(): Promise<IndexQuote[]> {
  const response = await fetch(`${API_BASE_URL}/indices/top`)
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`)
  }
  return await response.json()
}

export function formatLargeNumber(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T"
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B"
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M"
  return num.toLocaleString()
}

