"use server"

import { fetchStockQuote } from "../utils/alpha-vantage"

export async function getStockQuote(symbol: string) {
  return await fetchStockQuote(symbol)
}

export async function getStockQuotes(symbols: string[]) {
  return await Promise.all(symbols.map((symbol) => fetchStockQuote(symbol)))
}

