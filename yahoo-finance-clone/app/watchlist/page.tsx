import Link from "next/link"
import { StockTicker } from "../../components/StockTicker"

export default function Watchlist() {
  const watchlistStocks = ["AAPL", "GOOGL", "AMZN", "MSFT"]

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Watchlist</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {watchlistStocks.map((symbol) => (
          <StockTicker key={symbol} symbol={symbol} />
        ))}
      </div>
      <div className="mt-8">
        <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}

