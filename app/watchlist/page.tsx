"use client"

import { StockCard } from "@/components/stock-card"
import { useWatchlist } from "@/contexts/WatchlistContext"
import { useState, useEffect } from "react"
import { getStockQuote, subscribeToRealtimeUpdates, unsubscribeFromRealtimeUpdates } from "@/services/stockService"

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

export default function WatchlistPage() {
  const { toggleWatchlist, isInWatchlist, watchlist } = useWatchlist()
  const [stocks, setStocks] = useState<StockData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    const watchlistSymbols = Array.from(watchlist)
    if (watchlistSymbols.length === 0) {
      setIsLoading(false)
      return
    }

    const fetchStockData = async () => {
      try {
        const stockData = await Promise.all(
          watchlistSymbols.map(async (symbol) => {
            const quote = await getStockQuote(symbol)
            return {
              symbol,
              name: symbol,
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

    const unsubscribe = subscribeToRealtimeUpdates(watchlistSymbols, (data) => {
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
  }, [watchlist])

  if (isLoading) {
    return (
      <div className="container px-4 py-8">
        <div className="text-black text-2xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8">
      {lastUpdated && <div className="text-black text-sm mb-4">Last updated: {lastUpdated.toLocaleString()}</div>}

      <section className="rounded-3xl bg-[#E85D4C] p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Watchlist</h2>
        {stocks.length === 0 ? (
          <p className="text-white/80">No stocks in your watchlist yet. Add some stocks by clicking the star icon.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stocks.map((stock) => (
              <StockCard key={stock.symbol} {...stock} onWatchlistToggle={toggleWatchlist} isInWatchlist={true} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

