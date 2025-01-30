"use client"

import { useState, useRef, useEffect } from "react"
import { Search, X } from "lucide-react"
import { searchStocks } from "@/utils/alpha-vantage"

type SearchResult = {
  "1. symbol": string
  "2. name": string
}

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query) {
        const searchResults = await searchStocks(query)
        setResults(searchResults)
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  const handleSearchClick = () => {
    setIsOpen(true)
  }

  const handleCloseClick = () => {
    setIsOpen(false)
    setQuery("")
    setResults([])
  }

  return (
    <div ref={searchRef} className="relative">
      <button onClick={handleSearchClick} className="nav-button">
        <Search className="h-5 w-5" />
        <span>Search</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-md shadow-lg overflow-hidden z-10 transition-all duration-200 ease-in-out">
          <div className="p-4">
            <div className="flex items-center border-b border-gray-200 pb-2">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search stocks..."
                className="ml-2 flex-1 outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              <button onClick={handleCloseClick} className="ml-2 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          {results.length > 0 && (
            <ul className="max-h-60 overflow-y-auto">
              {results.map((result) => (
                <li
                  key={result["1. symbol"]}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    // Here you can implement what happens when a search result is clicked
                    console.log(`Selected: ${result["1. symbol"]} - ${result["2. name"]}`)
                    setIsOpen(false)
                    setQuery("")
                    setResults([])
                  }}
                >
                  <div className="font-medium">{result["1. symbol"]}</div>
                  <div className="text-sm text-gray-500">{result["2. name"]}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

