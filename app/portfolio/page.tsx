"use client"

import { useState, useEffect } from "react"
import { StockCard } from "@/components/stock-card"
import { getStockQuote, subscribeToRealtimeUpdates, unsubscribeFromRealtimeUpdates } from "@/services/stockService"
import { useWatchlist } from "@/contexts/WatchlistContext"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

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
  shares: number
  value: number
}

export default function PortfolioPage() {
  const { portfolio, toggleWatchlist, isInWatchlist } = useWatchlist()
  const [stocks, setStocks] = useState<StockData[]>([])
  const [filteredStocks, setFilteredStocks] = useState<StockData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [totalValue, setTotalValue] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const portfolioSymbols = Object.keys(portfolio)

    const fetchStockData = async () => {
      try {
        const stockData = await Promise.all(
          portfolioSymbols.map(async (symbol) => {
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
              shares: portfolio[symbol],
              value: quote.last[0] * portfolio[symbol],
            }
          }),
        )
        setStocks(stockData)
        setFilteredStocks(stockData)
        setTotalValue(stockData.reduce((acc, stock) => acc + stock.value, 0))
        setLastUpdated(new Date())
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching stock data:", error)
        setIsLoading(false)
      }
    }

    fetchStockData()

    const unsubscribe = subscribeToRealtimeUpdates(portfolioSymbols, (data) => {
      setStocks((prevStocks) => {
        const updatedStocks = prevStocks.map((stock) => {
          if (stock.symbol === data.symbol[0]) {
            const updatedStock = {
              ...stock,
              price: data.last[0],
              change: ((data.last[0] - data.mid[0]) / data.mid[0]) * 100,
              volume: data.volume[0],
              value: data.last[0] * stock.shares,
            }
            return updatedStock
          }
          return stock
        })
        setTotalValue(updatedStocks.reduce((acc, stock) => acc + stock.value, 0))
        return updatedStocks
      })
      setLastUpdated(new Date())
    })

    return () => {
      unsubscribe()
      unsubscribeFromRealtimeUpdates()
    }
  }, [portfolio])

  useEffect(() => {
    const filtered = stocks.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredStocks(filtered)
  }, [searchQuery, stocks])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-white">Portfolio</h2>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search stocks..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-8 bg-white text-black w-full md:w-64"
              />
            </div>
            <div className="text-white whitespace-nowrap">
              <span className="text-white/80 mr-2">Total Value:</span>
              <span className="text-xl font-bold">${totalValue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {filteredStocks.length === 0 ? (
          <div className="text-white/80">
            {stocks.length === 0 ? (
              <>
                <p className="mb-2">Your portfolio is empty.</p>
                <p>Start building your portfolio by trading stocks!</p>
              </>
            ) : (
              <p>No stocks found matching your search.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStocks.map((stock) => (
              <StockCard
                key={stock.symbol}
                {...stock}
                onWatchlistToggle={toggleWatchlist}
                isInWatchlist={isInWatchlist(stock.symbol)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

