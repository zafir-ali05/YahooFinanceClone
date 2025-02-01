import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatLargeNumber, subscribeToRealtimeUpdates } from "@/services/stockService"
import { Star, Plus, Minus } from "lucide-react"
import { useWatchlist } from "@/contexts/WatchlistContext"
import { getCompanyName } from "@/components/header" // Updated import statement

interface StockDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  stock: {
    symbol: string
    name: string
    price: number
    change: number
    ask: number
    askSize: number
    bid: number
    bidSize: number
    volume: number
    updated: number
  }
  portfolioShares: number
}

export function StockDetailsModal({ isOpen, onClose, stock: initialStock }: StockDetailsModalProps) {
  const [timeFilter, setTimeFilter] = useState<"1D" | "7D" | "1M" | "1Y" | "ALL">("1M")
  const { toggleWatchlist, isInWatchlist, addToPortfolio, removeFromPortfolio, getPortfolioShares } = useWatchlist()
  const [stock, setStock] = useState(initialStock)
  const [shares, setShares] = useState(1)
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = subscribeToRealtimeUpdates([stock.symbol], (data) => {
      setStock((prevStock) => ({
        ...prevStock,
        price: data.last[0],
        change: ((data.last[0] - data.mid[0]) / data.mid[0]) * 100,
        ask: data.ask[0],
        askSize: data.askSize[0],
        bid: data.bid[0],
        bidSize: data.bidSize[0],
        volume: data.volume[0],
        updated: data.updated[0],
      }))
    })

    return () => {
      unsubscribe()
    }
  }, [stock.symbol])

  const handleSharesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value, 10)
    setShares(isNaN(value) ? 0 : Math.max(0, value))
  }

  const handleBuySell = (isBuying: boolean) => {
    if (isBuying) {
      addToPortfolio(stock.symbol, shares)
      setConfirmationMessage(`Successfully added ${shares} share(s) of ${stock.symbol} to your portfolio.`)
    } else {
      if (shares <= portfolioShares) {
        removeFromPortfolio(stock.symbol, shares)
        setConfirmationMessage(`Successfully sold ${shares} share(s) of ${stock.symbol} from your portfolio.`)
      } else {
        setConfirmationMessage(`Error: You can't sell more shares than you own.`)
      }
    }
    setShares(1)
    setTimeout(() => setConfirmationMessage(null), 3000) // Clear message after 3 seconds
  }

  // Mock data for the chart
  const generateMockData = (days: number) => {
    const data = []
    const now = new Date()
    for (let i = days; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      data.push({
        name: date.toLocaleDateString(),
        price: stock.price * (1 + (Math.random() - 0.5) * 0.1),
      })
    }
    return data
  }

  const getTrendColor = (data: { price: number }[]) => {
    if (data.length < 2) return "#FFFFFF"
    return data[data.length - 1].price >= data[0].price ? "#4CAF50" : "#FF4136"
  }

  const getChartData = () => {
    const data = (() => {
      switch (timeFilter) {
        case "1D":
          return generateMockData(1)
        case "7D":
          return generateMockData(7)
        case "1M":
          return generateMockData(30)
        case "1Y":
          return generateMockData(365)
        case "ALL":
          return generateMockData(1825) // 5 years
        default:
          return generateMockData(30)
      }
    })()
    return { data, color: getTrendColor(data) }
  }

  const lastUpdated = new Date(stock.updated).toLocaleString()
  const portfolioShares = getPortfolioShares(stock.symbol)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] bg-[#c96357] text-white border-none overflow-hidden rounded-[40px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-white text-2xl">{stock.symbol}</DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 p-0 hover:bg-white/10"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleWatchlist(stock.symbol)
                  }}
                >
                  <Star
                    className={`h-5 w-5 ${isInWatchlist(stock.symbol) ? "fill-yellow-400 text-yellow-400" : "text-white"}`}
                  />
                  <span className="sr-only">
                    {isInWatchlist(stock.symbol) ? "Remove from watchlist" : "Add to watchlist"}
                  </span>
                </Button>
              </div>
              <DialogDescription className="text-white mt-1">{getCompanyName(stock.symbol)}</DialogDescription>
            </div>
          </div>
          <DialogDescription className="text-white/80 text-sm mt-2">Last Updated: {lastUpdated}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="font-medium">Last Price:</span>
              <span>${stock.price.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="font-medium">Change:</span>
              <span className={stock.change >= 0 ? "text-green-300" : "text-[#FF4136]"}>
                {stock.change >= 0 ? "+" : ""}
                {stock.change.toFixed(2)}%
              </span>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="font-medium">Ask:</span>
              <span>
                ${stock.ask.toFixed(2)} × {formatLargeNumber(stock.askSize)}
              </span>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="font-medium">Bid:</span>
              <span>
                ${stock.bid.toFixed(2)} × {formatLargeNumber(stock.bidSize)}
              </span>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="font-medium">Volume:</span>
              <span>{formatLargeNumber(stock.volume)}</span>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="font-medium">Shares Held:</span>
              <span>{portfolioShares}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleBuySell(true)}
                className="bg-green-500 text-white"
              >
                <Plus className="w-4 h-4 mr-1" /> Buy
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleBuySell(false)}
                className="bg-red-500 text-white"
                disabled={portfolioShares === 0}
              >
                <Minus className="w-4 h-4 mr-1" /> Sell
              </Button>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Input
                type="number"
                min="1"
                value={shares}
                onChange={handleSharesChange}
                className="w-20 bg-white text-black"
              />
              <span>shares</span>
              <span className="text-sm">Total: ${(shares * stock.price).toFixed(2)}</span>
            </div>
            {confirmationMessage && (
              <div className="mt-2 text-sm font-medium text-green-400">{confirmationMessage}</div>
            )}
          </div>
          <div className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getChartData().data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF40" />
                  <XAxis dataKey="name" stroke="#FFFFFF" />
                  <YAxis stroke="#FFFFFF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      border: "1px solid #FFFFFF",
                      borderRadius: "4px",
                      color: "#000000",
                    }}
                    labelStyle={{ color: "#000000" }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
                    labelFormatter={(label: string) => `Date: ${label}`}
                  />
                  <Line type="monotone" dataKey="price" stroke={getChartData().color} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-1">
              {(["1D", "7D", "1M", "1Y", "ALL"] as const).map((filter) => (
                <Button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  variant={timeFilter === filter ? "secondary" : "ghost"}
                  className={`px-3 py-1 text-xs ${
                    timeFilter === filter ? "bg-white text-[#c96357]" : "text-white hover:bg-white/10"
                  }`}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

