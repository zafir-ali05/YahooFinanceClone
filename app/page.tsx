"use client"

import { useState, useEffect } from "react"
import { useWatchlist } from "@/contexts/WatchlistContext"
import { getWatchlistStocks, getTopIndices, type StockQuote, type IndexQuote } from "@/services/stockService"
import { PageTransition } from "@/components/page-transition"
import { AnimatedStockSection } from "@/components/animated-stock-section"
import { motion, AnimatePresence } from "framer-motion"

export default function Home() {
  const { toggleWatchlist, isInWatchlist } = useWatchlist()
  const [topIndices, setTopIndices] = useState<IndexQuote[]>([])
  const [mostActive, setMostActive] = useState<StockQuote[]>([])
  const [topGainers, setTopGainers] = useState<StockQuote[]>([])
  const [topLosers, setTopLosers] = useState<StockQuote[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const [indicesData, activeData, gainersData, losersData] = await Promise.all([
          getTopIndices(),
          getWatchlistStocks(["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META"]),
          getWatchlistStocks(["TSLA", "AMD", "INTC"]),
          getWatchlistStocks(["FB", "NFLX", "TWTR"]),
        ])

        setTopIndices(indicesData)
        setMostActive(activeData)
        setTopGainers(gainersData.sort((a, b) => b.changePercent - a.changePercent))
        setTopLosers(losersData.sort((a, b) => a.changePercent - b.changePercent))
        setLastUpdated(new Date())
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching stock data:", error)
        setIsLoading(false)
      }
    }

    fetchStockData()
  }, [])

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
            className="container px-4 py-8 space-y-8"
          >
            {[0, 1, 2, 3].map((index) => (
              <motion.div
                key={index}
                className="rounded-3xl bg-gray-100 p-8 h-64"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.3 }}
              >
                <div className="h-6 w-1/3 bg-gray-200 rounded mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, idx) => (
                    <div key={idx} className="h-16 bg-white rounded border border-gray-200"></div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="container px-4 py-8 space-y-8"
          >
            {lastUpdated && <div className="text-gray-700 text-sm">Last updated: {lastUpdated.toLocaleString()}</div>}

            <AnimatedStockSection
              title="Top Indices"
              stocks={topIndices}
              toggleWatchlist={toggleWatchlist}
              isInWatchlist={isInWatchlist}
              index={0}
            />

            <AnimatedStockSection
              title="Most Active"
              stocks={mostActive}
              toggleWatchlist={toggleWatchlist}
              isInWatchlist={isInWatchlist}
              index={1}
            />

            <AnimatedStockSection
              title="Top Gainers"
              stocks={topGainers}
              toggleWatchlist={toggleWatchlist}
              isInWatchlist={isInWatchlist}
              index={2}
            />

            <AnimatedStockSection
              title="Top Losers"
              stocks={topLosers}
              toggleWatchlist={toggleWatchlist}
              isInWatchlist={isInWatchlist}
              index={3}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}

