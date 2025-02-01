import { StockCard } from "./stock-card"
import { useWatchlist } from "@/contexts/WatchlistContext"

interface SearchResultsProps {
  results: Array<{
    symbol: string
    name: string
    price: number
    change: number
  }>
}

export function SearchResults({ results }: SearchResultsProps) {
  const { toggleWatchlist, isInWatchlist } = useWatchlist()

  if (results.length === 0) {
    return <p className="text-white text-center mt-4">No results found.</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {results.map((stock) => (
        <StockCard
          key={stock.symbol}
          {...stock}
          onWatchlistToggle={toggleWatchlist}
          isInWatchlist={isInWatchlist(stock.symbol)}
        />
      ))}
    </div>
  )
}

