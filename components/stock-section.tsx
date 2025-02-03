import { StockCard } from "./stock-card"
import type { StockQuote } from "@/services/stockService"

interface StockSectionProps {
  title: string
  stocks: StockQuote[]
  toggleWatchlist: (symbol: string) => void
  isInWatchlist: (symbol: string) => boolean
}

export default function StockSection({ title, stocks, toggleWatchlist, isInWatchlist }: StockSectionProps) {
  return (
    <section className="rounded-3xl bg-[#E85D4C] p-8">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stocks.map((stock, index) => (
          <StockCard
            key={stock.symbol}
            stock={stock}
            onWatchlistToggle={toggleWatchlist}
            isInWatchlist={isInWatchlist(stock.symbol)}
            index={index}
          />
        ))}
      </div>
    </section>
  )
}

