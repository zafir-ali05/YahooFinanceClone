"use client"

import { useState, useEffect } from "react"
import { useWatchlist } from "@/contexts/WatchlistContext"
import { getWatchlistStocks, type StockQuote } from "@/services/stockService"
import { PageTransition } from "@/components/page-transition"
import { AnimatedStockSection } from "@/components/animated-stock-section"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import type React from "react"

interface PortfolioStock extends StockQuote {
  shares: number
  value: number
}

export default function PortfolioPage() {
  const { portfolio, toggleWatchlist, isInWatchlist } = useWatchlist()
  const [stocks, setStocks] = useState<PortfolioStock[]>([])
  const [filteredStocks, setFilteredStocks] = useState<PortfolioStock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [totalValue, setTotalValue] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const portfolioSymbols = Object.keys(portfolio)

    const fetchStockData = async () => {
      try {
        const stockData = await getWatchlistStocks(portfolioSymbols)
        const portfolioStocks = stockData.map((stock) => ({
          ...stock,
          shares: portfolio[stock.symbol],
          value: stock.price * portfolio[stock.symbol],
        }))
        setStocks(portfolioStocks)
        setFilteredStocks(portfolioStocks)
        setTotalValue(portfolioStocks.reduce((acc, stock) => acc + stock.value, 0))
        setLastUpdated(new Date())
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching stock data:", error)
        setIsLoading(false)
      }
    }

    fetchStockData()
  }, [portfolio])

  useEffect(() => {
    const filtered = stocks.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.companyName.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredStocks(filtered)
  }, [searchQuery, stocks])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <PageTransition>
      <AnimatePresence>
        <motion.div
          key="portfolio-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="container px-4 py-8"
        >
          {lastUpdated && (
            <div className="text-gray-700 text-sm mb-4">Last updated: {lastUpdated.toLocaleString()}</div>
          )}

          <motion.section
            className="rounded-3xl bg-gray-100 p-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div
              className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-gray-800">Portfolio</h2>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-grow md:flex-grow-0">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search portfolio..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="pl-8 bg-white text-gray-800 w-full md:w-64 border-gray-300"
                  />
                </div>
                <div className="text-gray-800 whitespace-nowrap">
                  <span className="text-gray-600 mr-2">Total Value:</span>
                  <span className="text-xl font-bold">${totalValue.toFixed(2)}</span>
                </div>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {[...Array(6)].map((_, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      className="h-16 bg-white rounded border border-gray-200"
                    ></motion.div>
                  ))}
                </motion.div>
              ) : filteredStocks.length === 0 ? (
                <motion.p
                  key="empty"
                  className="text-gray-600"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {stocks.length === 0 ? (
                    <>
                      <p className="mb-2">Your portfolio is empty.</p>
                      <p>Start building your portfolio by trading stocks!</p>
                    </>
                  ) : (
                    <p>No stocks found matching your search.</p>
                  )}
                </motion.p>
              ) : (
                <motion.div
                  key="stocks"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <AnimatedStockSection
                    title=""
                    stocks={filteredStocks}
                    toggleWatchlist={toggleWatchlist}
                    isInWatchlist={isInWatchlist}
                    index={0}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        </motion.div>
      </AnimatePresence>
    </PageTransition>
  )
}

