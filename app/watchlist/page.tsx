"use client"

import { useState, useEffect } from "react"
import { useWatchlist } from "@/contexts/WatchlistContext"
import { getWatchlistStocks, type StockQuote } from "@/services/stockService"
import { PageTransition } from "@/components/page-transition"
import { AnimatedStockSection } from "@/components/animated-stock-section"
import { motion, AnimatePresence } from "framer-motion"

export default function WatchlistPage() {
  const { toggleWatchlist, isInWatchlist, watchlist } = useWatchlist()
  const [stocks, setStocks] = useState<StockQuote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    const watchlistSymbols = Array.from(watchlist)
    if (watchlistSymbols.length === 0) {
      setIsLoading(false)
      setIsInitialLoad(false)
      return
    }

    const fetchStockData = async () => {
      try {
        const stockData = await getWatchlistStocks(watchlistSymbols)
        setStocks(stockData)
        setLastUpdated(new Date())
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching stock data:", error)
        setIsLoading(false)
      }
    }

    fetchStockData()
  }, [watchlist])

  useEffect(() => {
    if (!isLoading) {
      setIsInitialLoad(false)
    }
  }, [isLoading])

  return (
    <PageTransition>
      <AnimatePresence mode="wait">
        {isInitialLoad ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="container px-4 py-8"
          >
            <motion.div
              className="rounded-3xl bg-gray-100 p-8 h-64"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="h-6 w-1/3 bg-gray-200 rounded mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="h-16 bg-white rounded border border-gray-200"></div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="container px-4 py-8"
          >
            {lastUpdated && (
              <div className="text-gray-700 text-sm mb-4">Last updated: {lastUpdated.toLocaleString()}</div>
            )}

            {stocks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="rounded-3xl bg-gray-100 p-8"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Watchlist</h2>
                <p className="text-gray-600">
                  Your watchlist is empty. Add some stocks by clicking the star icon on any stock card.
                </p>
              </motion.div>
            ) : (
              <AnimatedStockSection
                title="Watchlist"
                stocks={stocks}
                toggleWatchlist={toggleWatchlist}
                isInWatchlist={isInWatchlist}
                index={0}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}

