"use client"

import { Home, List } from "lucide-react"
import Link from "next/link"
import { SearchBar } from "@/components/SearchBar"

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">YFinance</span>
            </div>
          </div>
          <div className="flex items-center">
            <Link href="/" className="nav-button">
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link href="/watchlist" className="nav-button">
              <List className="h-5 w-5" />
              <span>Watchlist</span>
            </Link>
            <SearchBar />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

