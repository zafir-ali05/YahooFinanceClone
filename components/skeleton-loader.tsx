import { motion } from "framer-motion"

export function SkeletonLoader() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: index * 0.1 }}
          className="rounded-lg border bg-white/20 p-4 h-24"
        >
          <div className="w-1/2 h-4 bg-white/30 rounded mb-2"></div>
          <div className="w-1/3 h-3 bg-white/30 rounded"></div>
        </motion.div>
      ))}
    </div>
  )
}

