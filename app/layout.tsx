import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"
import { WatchlistProvider } from "@/contexts/WatchlistContext"
import { LayoutContent } from "./components/layout-content"
import type React from "react" // Import React

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-montserrat",
})

export const metadata: Metadata = {
  title: "Stoxly - Stock Market Made Simple",
  description: "Track and analyze stocks with Stoxly",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} font-montserrat min-h-screen flex flex-col`}>
        <WatchlistProvider>
          <LayoutContent>{children}</LayoutContent>
        </WatchlistProvider>
      </body>
    </html>
  )
}

