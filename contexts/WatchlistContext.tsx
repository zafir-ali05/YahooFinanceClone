"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type WatchlistContextType = {
  watchlist: Set<string>
  toggleWatchlist: (symbol: string) => void
  isInWatchlist: (symbol: string) => boolean
  portfolio: { [symbol: string]: number }
  addToPortfolio: (symbol: string, shares: number) => void
  removeFromPortfolio: (symbol: string, shares: number) => void
  getPortfolioShares: (symbol: string) => number
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined)

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set())
  const [portfolio, setPortfolio] = useState<{ [symbol: string]: number }>({})

  useEffect(() => {
    const savedWatchlist = localStorage.getItem("watchlist")
    const savedPortfolio = localStorage.getItem("portfolio")
    if (savedWatchlist) {
      setWatchlist(new Set(JSON.parse(savedWatchlist)))
    }
    if (savedPortfolio) {
      setPortfolio(JSON.parse(savedPortfolio))
    }
  }, [])

  const toggleWatchlist = (symbol: string) => {
    setWatchlist((prev) => {
      const newWatchlist = new Set(prev)
      if (newWatchlist.has(symbol)) {
        newWatchlist.delete(symbol)
      } else {
        newWatchlist.add(symbol)
      }
      localStorage.setItem("watchlist", JSON.stringify(Array.from(newWatchlist)))
      return newWatchlist
    })
  }

  const isInWatchlist = (symbol: string) => watchlist.has(symbol)

  const addToPortfolio = (symbol: string, shares: number) => {
    setPortfolio((prev) => {
      const newPortfolio = { ...prev }
      newPortfolio[symbol] = (newPortfolio[symbol] || 0) + shares
      localStorage.setItem("portfolio", JSON.stringify(newPortfolio))
      return newPortfolio
    })
  }

  const removeFromPortfolio = (symbol: string, shares: number) => {
    setPortfolio((prev) => {
      const newPortfolio = { ...prev }
      if (newPortfolio[symbol]) {
        newPortfolio[symbol] = Math.max(0, newPortfolio[symbol] - shares)
        if (newPortfolio[symbol] === 0) {
          delete newPortfolio[symbol]
        }
      }
      localStorage.setItem("portfolio", JSON.stringify(newPortfolio))
      return newPortfolio
    })
  }

  const getPortfolioShares = (symbol: string) => portfolio[symbol] || 0

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        toggleWatchlist,
        isInWatchlist,
        portfolio,
        addToPortfolio,
        removeFromPortfolio,
        getPortfolioShares,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  )
}

export function useWatchlist() {
  const context = useContext(WatchlistContext)
  if (context === undefined) {
    throw new Error("useWatchlist must be used within a WatchlistProvider")
  }
  return context
}

