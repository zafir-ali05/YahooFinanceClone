"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnimatePresence } from "framer-motion"
import { AIChatInterface } from "@/components/ai-chat-interface"
import { ScrollToTop } from "@/components/scroll-to-top"
import type React from "react" // Added import for React

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isSignInPage = pathname === "/signin"

  return (
    <>
      {!isSignInPage && <Header />}
      <ScrollToTop />
      <AnimatePresence mode="wait" initial={false}>
        <main className="flex-grow bg-[#f7f5f5]">{children}</main>
      </AnimatePresence>
      {!isSignInPage && (
        <>
          <Footer />
          <AIChatInterface />
        </>
      )}
    </>
  )
}

