"use client"

import { motion } from "framer-motion"
import type React from "react"

const variants = {
  hidden: { opacity: 1, y: 0 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 1, y: 0 },
}

export const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    variants={variants}
    initial="hidden"
    animate="enter"
    exit="exit"
    transition={{ type: "linear" }}
    className="h-full"
  >
    {children}
  </motion.div>
)

