"use client"

import Link from "next/link"
import { Search, Home, Eye, Folder } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useRef } from "react"
import { StockDetailsModal } from "./stock-details-modal"
import { getStockQuote } from "@/services/stockService"

interface SearchResult {
  symbol: string
  name: string
}

const STOCK_SYMBOLS = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "NVDA",
  "META",
  "TSLA",
  "JPM",
  "V",
  "PG",
  "JNJ",
  "UNH",
  "MA",
  "HD",
  "ADBE",
  "CRM",
  "NFLX",
  "DIS",
  "CSCO",
  "VZ",
]

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
    const filterStocks = () => {
      const filtered = STOCK_SYMBOLS.filter(
        (symbol) =>
          symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          getCompanyName(symbol).toLowerCase().includes(searchQuery.toLowerCase()),
      ).map((symbol) => ({
        symbol,
        name: getCompanyName(symbol),
      }))
      setSearchResults(filtered)
    }

    filterStocks()
  }, [searchQuery])

  const handleSearchItemClick = async (symbol: string) => {
    try {
      const quoteData = await getStockQuote(symbol)
      const stockData = {
        symbol,
        name: getCompanyName(symbol),
        price: quoteData.last[0],
        change: ((quoteData.last[0] - quoteData.mid[0]) / quoteData.mid[0]) * 100,
        ask: quoteData.ask[0],
        askSize: quoteData.askSize[0],
        bid: quoteData.bid[0],
        bidSize: quoteData.bidSize[0],
        volume: quoteData.volume[0],
        updated: quoteData.updated[0],
      }
      setSelectedStock(stockData)
      setIsModalOpen(true)
      setIsDropdownVisible(false)
      setSearchQuery("")
    } catch (error) {
      console.error("Error fetching stock data:", error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-[#E85D4C] text-white">
      <div className="container flex h-16 items-center px-4">
        <Link
          href="/"
          className="mr-6 flex items-center space-x-2 transition-transform hover:scale-105 active:scale-95"
        >
          <span className="text-2xl font-extrabold italic text-shadow">Stoxly</span>
        </Link>

        <div className="relative flex w-full max-w-sm items-center space-x-2 mx-4">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              ref={inputRef}
              type="search"
              placeholder="Search symbol or company..."
              className="pl-8 bg-white text-black"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsDropdownVisible(true)}
            />
          </div>
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

        <nav className="flex items-center space-x-6 ml-auto">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-white/80 hover:underline underline-offset-4 flex items-center"
          >
            <Home className="mr-1 h-4 w-4" />
            Home
          </Link>
          <Link
            href="/watchlist"
            className="text-sm font-medium transition-colors hover:text-white/80 hover:underline underline-offset-4 flex items-center"
          >
            <Eye className="mr-1 h-4 w-4" />
            Watchlist
          </Link>
          <Link
            href="/portfolio"
            className="text-sm font-medium transition-colors hover:text-white/80 hover:underline underline-offset-4 flex items-center"
          >
            <Folder className="mr-1 h-4 w-4" />
            Portfolio
          </Link>
          <Button
            variant="secondary"
            className="bg-[#943024] text-white hover:bg-[#7A271E] transition-colors active:scale-95"
          >
            Sign in
          </Button>
        </nav>
      </div>
      {selectedStock && (
        <StockDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} stock={selectedStock} />
      )}
    </header>
  )
}

export function getCompanyName(symbol: string): string {
  const companies: { [key: string]: string } = {
    AAPL: "Apple Inc.",
    MSFT: "Microsoft Corporation",
    GOOGL: "Alphabet Inc.",
    AMZN: "Amazon.com Inc.",
    NVDA: "NVIDIA Corporation",
    META: "Meta Platforms Inc.",
    TSLA: "Tesla Inc.",
    JPM: "JPMorgan Chase & Co.",
    V: "Visa Inc.",
    PG: "Procter & Gamble Co.",
    JNJ: "Johnson & Johnson",
    UNH: "UnitedHealth Group Inc.",
    MA: "Mastercard Inc.",
    HD: "The Home Depot Inc.",
    ADBE: "Adobe Inc.",
    CRM: "Salesforce Inc.",
    NFLX: "Netflix Inc.",
    DIS: "The Walt Disney Company",
    CSCO: "Cisco Systems Inc.",
    VZ: "Verizon Communications Inc.",
  }
  return companies[symbol] || symbol
}

const textShadowStyle = `
  .text-shadow {
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }
`

export const headerStyles = textShadowStyle

export { Header, getCompanyName }

