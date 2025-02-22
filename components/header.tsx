"use client"

import Link from "next/link"
import { Search, Home, Eye, Folder } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useRef } from "react"
import { StockDetailsModal } from "./stock-details-modal"
import { getStockQuote, searchStocks } from "@/services/stockService"

interface SearchResult {
  symbol: string
  name: string
}

export function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isDropdownVisible, setIsDropdownVisible] = useState(false)
  const [selectedStock, setSelectedStock] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const filterStocks = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([])
        return
      }
      try {
        const results = await searchStocks(searchQuery)
        setSearchResults(
          results.map((stock) => ({
            symbol: stock.symbol,
            name: stock.companyName,
          })),
        )
      } catch (error) {
        console.error("Error searching stocks:", error)
        setSearchResults([])
      }
    }

    filterStocks()
  }, [searchQuery])

  const handleSearchItemClick = async (symbol: string) => {
    try {
      const stockData = await getStockQuote(symbol)
      setSelectedStock(stockData)
      setIsModalOpen(true)
      setIsDropdownVisible(false)
      setSearchQuery("")
    } catch (error) {
      console.error("Error fetching stock data:", error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-[#f7f5f5] text-black border-b border-black/20">
      <div className="container flex h-20 items-center justify-between px-4">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2 transition-transform hover:scale-105 active:scale-95">
            <span className="text-2xl font-extrabold italic text-shadow text-black">Stoxly</span>
          </Link>

          <nav className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-black/80 hover:underline underline-offset-4 flex items-center"
            >
              <Home className="mr-1 h-4 w-4" />
              Home
            </Link>
            <Link
              href="/watchlist"
              className="text-sm font-medium transition-colors hover:text-black/80 hover:underline underline-offset-4 flex items-center"
            >
              <Eye className="mr-1 h-4 w-4" />
              Watchlist
            </Link>
            <Link
              href="/portfolio"
              className="text-sm font-medium transition-colors hover:text-black/80 hover:underline underline-offset-4 flex items-center"
            >
              <Folder className="mr-1 h-4 w-4" />
              Portfolio
            </Link>
          </nav>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="relative w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              ref={inputRef}
              type="search"
              placeholder="Search symbol or company..."
              className="pl-8 bg-white text-black rounded-md w-full border-0 focus:outline-none focus:ring-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsDropdownVisible(true)}
            />
            {isDropdownVisible && (
              <div
                ref={dropdownRef}
                className="absolute top-full left-0 w-full mt-1 bg-white rounded-md shadow-lg overflow-hidden z-50 max-h-60 overflow-y-auto"
              >
                {searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <div
                      key={result.symbol}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-black"
                      onClick={() => handleSearchItemClick(result.symbol)}
                    >
                      <div className="font-semibold">{result.symbol}</div>
                      <div className="text-sm text-gray-600">{result.name}</div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">No results found</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <Link href="/signin">
            <Button
              variant="secondary"
              className="bg-slate-200 text-gray-800 hover:bg-slate-300 transition-colors active:scale-95"
            >
              Sign in
            </Button>
          </Link>
        </div>
      </div>
      {selectedStock && (
        <StockDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} stock={selectedStock} portfolioShares={0} />
      )}
    </header>
  )
}

const textShadowStyle = `
  .text-shadow {
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }
`

export const headerStyles = textShadowStyle


