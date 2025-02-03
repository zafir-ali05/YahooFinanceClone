import { motion } from "framer-motion"
import { StockCard } from "./stock-card"
import type { StockQuote, IndexQuote } from "@/services/stockService"

interface AnimatedStockSectionProps {
  title: string
  stocks: (StockQuote | IndexQuote)[]
  toggleWatchlist: (symbol: string) => void
  isInWatchlist: (symbol: string) => boolean
  index: number
}

export function AnimatedStockSection({
  title,
  stocks,
  toggleWatchlist,
  isInWatchlist,
  index,
}: AnimatedStockSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.3 }}
      className="rounded-3xl bg-slate-100 p-8"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        {stocks.map((stock, idx) => (
          <StockCard
            key={stock.symbol}
            stock={stock}
            onWatchlistToggle={toggleWatchlist}
            isInWatchlist={isInWatchlist(stock.symbol)}
            index={idx}
          />
        ))}
      </motion.div>
    </motion.section>
  )
}

