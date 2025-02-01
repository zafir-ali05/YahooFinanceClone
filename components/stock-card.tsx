"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { StockDetailsModal } from "./stock-details-modal"
import { getStockQuote, subscribeToRealtimeUpdates } from "@/services/stockService"
import { useWatchlist } from "@/contexts/WatchlistContext"
import { getCompanyName } from "@/components/header"

interface StockCardProps {
  symbol: string
  name: string
  onWatchlistToggle?: (symbol: string) => void
  isInWatchlist?: boolean
  shares?: number
}

export function StockCard({ symbol, name, onWatchlistToggle, isInWatchlist = false, shares = 0 }: StockCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [quoteData, setQuoteData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { getPortfolioShares } = useWatchlist()

  useEffect(() => {
    let isMounted = true

    const fetchQuote = async () => {
      try {
        const data = await getStockQuote(symbol)
        if (isMounted) {
          setQuoteData(data)
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error fetching quote:", error)
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchQuote()

    const unsubscribe = subscribeToRealtimeUpdates([symbol], (data) => {
      if (isMounted) {
        setQuoteData(data)
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [symbol])

  const handleCardClick = () => {
    setIsModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white/20 p-4 animate-pulse">
        <div className="h-16"></div>
      </div>
    )
  }

  const price = quoteData?.last?.[0] || 0
  const previousPrice = quoteData?.mid?.[0] || 0
  const change = ((price - previousPrice) / previousPrice) * 100
  const portfolioShares = getPortfolioShares(symbol)

  return (
    <>
      <div
        className="rounded-lg border bg-white/20 p-4 hover:bg-white/30 transition-colors cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white">{symbol}</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-white/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        onWatchlistToggle?.(symbol)
                      }}
                    >
                      <Star className={`h-4 w-4 ${isInWatchlist ? "fill-yellow-400 text-yellow-400" : "text-white"}`} />
                      <span className="sr-only">{isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-white/80">{getCompanyName(symbol)}</p>
            {portfolioShares > 0 && <p className="text-sm text-white/80 mt-1">Shares: {portfolioShares}</p>}
          </div>
          <div className="text-right">
            <p className="font-bold text-white">${price.toFixed(2)}</p>
            <p className={`text-sm ${change >= 0 ? "text-green-400" : "text-red-500"}`}>
              {change >= 0 ? "+" : ""}
              {change.toFixed(2)}%
            </p>
            {portfolioShares > 0 && (
              <p className="text-sm text-white/80 mt-1">Value: ${(price * portfolioShares).toFixed(2)}</p>
            )}
          </div>
        </div>
      </div>
      {quoteData && (
        <StockDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          stock={{
            symbol,
            name,
            price: quoteData.last[0],
            change,
            ask: quoteData.ask[0],
            askSize: quoteData.askSize[0],
            bid: quoteData.bid[0],
            bidSize: quoteData.bidSize[0],
            volume: quoteData.volume[0],
            updated: quoteData.updated[0],
          }}
          portfolioShares={portfolioShares}
        />
      )}
    </>
  )
}

