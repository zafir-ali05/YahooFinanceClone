"use client"

import { useState, useEffect } from "react"
import { StockCard } from "@/components/stock-card"
import { useWatchlist } from "@/contexts/WatchlistContext"
import { getStockQuote, subscribeToRealtimeUpdates, unsubscribeFromRealtimeUpdates } from "@/services/stockService"

// List of stock symbols to fetch
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

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  marketCap: number
  volume: number
  avgVolume: number
  peRatio: number
  dividend: number
  yield: number
}

export default function Home() {
  const { toggleWatchlist, isInWatchlist } = useWatchlist()
  const [stocks, setStocks] = useState<StockData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    const fetchStockData = async () => {
      setIsLoading(true)
      try {
        const stockData = await Promise.all(
          STOCK_SYMBOLS.map(async (symbol) => {
            const quote = await getStockQuote(symbol)
            return {
              symbol,
              name: symbol, // Replace with actual company name if available
              price: quote.last[0],
              change: ((quote.last[0] - quote.mid[0]) / quote.mid[0]) * 100,
              marketCap: 0,
              volume: quote.volume[0],
              avgVolume: 0,
              peRatio: 0,
              dividend: 0,
              yield: 0,
            }
          }),
        )
        setStocks(stockData)
        setLastUpdated(new Date())
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching stock data:", error)
        setIsLoading(false)
      }
    }

    fetchStockData()

    const unsubscribe = subscribeToRealtimeUpdates(STOCK_SYMBOLS, (data) => {
      setStocks((prevStocks) => {
        const updatedStocks = prevStocks.map((stock) => {
          if (stock.symbol === data.symbol[0]) {
            return {
              ...stock,
              price: data.last[0],
              change: ((data.last[0] - data.mid[0]) / data.mid[0]) * 100,
              volume: data.volume[0],
            }
          }
          return stock
        })
        return updatedStocks
      })
      setLastUpdated(new Date())
    })

    return () => {
      unsubscribe()
      unsubscribeFromRealtimeUpdates()
    }
  }, [])

  const sortedStocks = [...stocks].sort((a, b) => b.change - a.change)
  const topGainers = sortedStocks.slice(0, 3)
  const topLosers = sortedStocks.slice(-3).reverse()

  if (isLoading) {
    return (
      <div className="container px-4 py-8">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 space-y-8">
      {lastUpdated && <div className="text-black text-sm">Last updated: {lastUpdated.toLocaleString()}</div>}

      <section className="rounded-3xl bg-[#E85D4C] p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Most Active</h2>
        <div className="rounded-3x1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stocks.slice(0, 6).map((stock) => (
            <StockCard
              key={stock.symbol}
              {...stock}
              onWatchlistToggle={toggleWatchlist}
              isInWatchlist={isInWatchlist(stock.symbol)}
            />
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-[#E85D4C] p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Top Gainers</h2>
        <div className="rounded-3x1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topGainers.map((stock) => (
            <StockCard
              key={stock.symbol}
              {...stock}
              onWatchlistToggle={toggleWatchlist}
              isInWatchlist={isInWatchlist(stock.symbol)}
            />
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-[#E85D4C] p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Top Losers</h2>
        <div className="rounded-3x1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topLosers.map((stock) => (
            <StockCard
              key={stock.symbol}
              {...stock}
              onWatchlistToggle={toggleWatchlist}
              isInWatchlist={isInWatchlist(stock.symbol)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

