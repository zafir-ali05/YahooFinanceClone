"use client"

import { useState, useCallback } from "react"

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set())

  const toggleWatchlist = useCallback((symbol: string) => {
    setWatchlist((prev) => {
      const newWatchlist = new Set(prev)
      if (newWatchlist.has(symbol)) {
        newWatchlist.delete(symbol)
      } else {
        newWatchlist.add(symbol)
      }
      return newWatchlist
    })
  }, [])

  const isInWatchlist = useCallback(
    (symbol: string) => {
      return watchlist.has(symbol)
    },
    [watchlist],
  )

  return { watchlist, toggleWatchlist, isInWatchlist }
}

