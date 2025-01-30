"use client"
import React, { useState, useEffect } from 'react';
import { getStockQuote } from '@/app/actions'; // Adjust the import based on your project structure

interface ApiData {
  symbol: string;
  price?: number;
  change?: number;
  percentChange?: number;
}

interface Stock {
  symbol: string;
  price: string;
  change: string;
  percentChange: string;
  isPositive: boolean;
  error: boolean;
}

export function StockTicker({ symbol }: { symbol: string }) {
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getStockQuote(symbol) as ApiData;
        const apiData: ApiData = {
          symbol: response.symbol || symbol,
          price: response.price,
          change: response.change,
          percentChange: response.percentChange,
        };

        const transformedData: Stock = {
          symbol: apiData.symbol || symbol,
          price: apiData.price?.toString() || "N/A",
          change: apiData.change?.toString() || "0",
          percentChange: apiData.percentChange?.toString() || "0%",
          isPositive: parseFloat(apiData.change?.toString() || "0") >= 0,
          error: false
        };

        setStock(transformedData);
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        setStock({
          symbol,
          price: "N/A",
          change: "0",
          percentChange: "0%",
          isPositive: false,
          error: true
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (stock?.error) {
    return <div>Error loading stock data.</div>;
  }

  return (
    <div>
      <h1>{stock?.symbol}</h1>
      <p>Price: {stock?.price}</p>
      <p>Change: {stock?.change}</p>
      <p>Percent Change: {stock?.percentChange}</p>
    </div>
  );
}