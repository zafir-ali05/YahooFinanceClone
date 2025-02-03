"use client"

import { useEffect } from "react"

export function ScrollToTop() {
  // const pathname = usePathname() // Removed unnecessary dependency

  useEffect(() => {
    const handleRouteChange = () => {
      window.scrollTo(0, 0)
    }

    handleRouteChange() // Call on initial load

    // Listen for route changes
    window.addEventListener("popstate", handleRouteChange)

    return () => {
      window.removeEventListener("popstate", handleRouteChange)
    }
  }, []) // Empty dependency array

  return null
}

