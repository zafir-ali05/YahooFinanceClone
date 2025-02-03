"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { StockDetailsModal } from "./stock-details-modal"
import { useWatchlist } from "@/contexts/WatchlistContext"
import type { StockQuote, IndexQuote } from "@/services/stockService"
import { motion } from "framer-motion"

interface StockCardProps {
  stock: StockQuote | IndexQuote
  onWatchlistToggle?: (symbol: string) => void
  isInWatchlist?: boolean
  shares?: number
  index: number
}

export function StockCard({ stock, onWatchlistToggle, isInWatchlist = false, shares = 0, index }: StockCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { getPortfolioShares } = useWatchlist()

  const handleCardClick = () => {
    setIsModalOpen(true)
  }

  const portfolioShares = "companyName" in stock ? getPortfolioShares(stock.symbol) : 0

  return (
    <>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="rounded-lg border border-gray-200 bg-white p-3 hover:bg-gray-50 transition-colors cursor-pointer overflow-hidden"
          onClick={handleCardClick}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-800 text-sm">{stock.symbol}</h3>
                {"companyName" in stock && onWatchlistToggle && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            onWatchlistToggle(stock.symbol)
                          }}
                        >
                          <Star
                            className={`h-3 w-3 ${isInWatchlist ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
                          />
                          <span className="sr-only">
                            {isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <p className="text-xs text-gray-600">{"companyName" in stock ? stock.companyName : stock.name}</p>
              {portfolioShares > 0 && <p className="text-xs text-gray-600 mt-1">Shares: {portfolioShares}</p>}
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800 text-sm">${stock.price.toFixed(2)}</p>
              <p className={`text-xs ${stock.changePercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                {stock.changePercent >= 0 ? "+" : ""}
                {stock.changePercent.toFixed(2)}%
              </p>
              {portfolioShares > 0 && (
                <p className="text-xs text-gray-600 mt-1">Value: ${(stock.price * portfolioShares).toFixed(2)}</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
      {"companyName" in stock && (
        <StockDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          stock={stock}
          portfolioShares={portfolioShares}
        />
      )}
    </>
  )
}

