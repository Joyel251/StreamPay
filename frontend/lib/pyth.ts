'use client'

import { useState, useEffect } from 'react'

const PYTH_ENDPOINT = process.env.NEXT_PUBLIC_PYTH_ENDPOINT || 'https://hermes.pyth.network'

// Pyth price feed IDs from .env
export const PRICE_FEEDS = {
  'PYUSD/USD': process.env.NEXT_PUBLIC_PYTH_PYUSD_USD || '',
  'USD/PHP': process.env.NEXT_PUBLIC_PYTH_USD_PHP || '',
} as const

// Debug: Log feed IDs on initialization (client-side only)
if (typeof window !== 'undefined') {
  console.log('Pyth Feed IDs loaded:', PRICE_FEEDS)
}

export type PriceFeedPair = keyof typeof PRICE_FEEDS

interface PriceData {
  price: number
  expo: number
  conf: number
  publishTime: number
}

/**
 * Fetch latest price from Pyth Network using direct HTTP calls
 * Returns the price as a number with proper decimal adjustment
 */
export async function getPythPrice(pair: PriceFeedPair): Promise<PriceData | null> {
  try {
    const feedId = PRICE_FEEDS[pair]
    if (!feedId) {
      console.error(`No feed ID configured for ${pair}`)
      return null
    }

    // Remove 0x prefix if present
    const cleanFeedId = feedId.startsWith('0x') ? feedId.slice(2) : feedId

    console.log(`Fetching ${pair} with feed ID:`, cleanFeedId)

    // Use Hermes HTTP API directly
    const url = `${PYTH_ENDPOINT}/v2/updates/price/latest?ids[]=${cleanFeedId}`
    console.log(`Fetching URL:`, url)

    const response = await fetch(url)
    
    if (!response.ok) {
      console.error(`HTTP error for ${pair}:`, response.status, response.statusText)
      return null
    }

    const data = await response.json()
    console.log(`Response for ${pair}:`, data)
    
    if (!data?.parsed || data.parsed.length === 0) {
      console.error(`No price data returned for ${pair}`)
      return null
    }

    const priceFeed = data.parsed[0]
    const priceRaw = Number(priceFeed.price.price)
    const expo = priceFeed.price.expo
    const conf = Number(priceFeed.price.conf)
    const publishTime = priceFeed.price.publish_time

    // Calculate actual price: price * 10^expo
    const price = priceRaw * Math.pow(10, expo)

    console.log(`${pair} price calculated:`, price)

    return {
      price,
      expo,
      conf: conf * Math.pow(10, expo),
      publishTime,
    }
  } catch (error) {
    console.error(`Error fetching Pyth price for ${pair}:`, error)
    return null
  }
}

/**
 * Calculate PYUSD/PHP exchange rate using cross-rate
 * PYUSD/PHP = PYUSD/USD * USD/PHP
 */
export async function getPYUSDtoPHP(): Promise<number> {
  try {
    const [pyusdUsd, usdPhp] = await Promise.all([
      getPythPrice('PYUSD/USD'),
      getPythPrice('USD/PHP'),
    ])

    if (!pyusdUsd || !usdPhp) {
      console.error('Failed to fetch required price feeds for PYUSD/PHP')
      return 56.0 // Fallback rate
    }

    const rate = pyusdUsd.price * usdPhp.price
    return rate
  } catch (error) {
    console.error('Error calculating PYUSD/PHP rate:', error)
    return 56.0 // Fallback rate
  }
}

/**
 * React hook for real-time price updates
 * Refreshes every 5 seconds
 */
export function usePythPrice(pair: PriceFeedPair, refreshIntervalMs = 5000) {
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchPrice = async () => {
      try {
        const data = await getPythPrice(pair)
        if (isMounted) {
          setPriceData(data)
          setLoading(false)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch price')
          setLoading(false)
        }
      }
    }

    // Initial fetch
    fetchPrice()

    // Set up interval for updates
    const interval = setInterval(fetchPrice, refreshIntervalMs)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [pair, refreshIntervalMs])

  return { priceData, loading, error }
}

/**
 * React hook for PYUSD/PHP cross rate with real-time updates
 */
export function usePYUSDtoPHP(refreshIntervalMs = 5000) {
  const [rate, setRate] = useState<number>(56.0) // Default fallback
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchRate = async () => {
      try {
        const calculatedRate = await getPYUSDtoPHP()
        if (isMounted) {
          setRate(calculatedRate)
          setLoading(false)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch rate')
          setLoading(false)
        }
      }
    }

    // Initial fetch
    fetchRate()

    // Set up interval for updates
    const interval = setInterval(fetchRate, refreshIntervalMs)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [refreshIntervalMs])

  return { rate, loading, error }
}

/**
 * Format price for display with proper decimals
 */
export function formatPrice(price: number, decimals = 4): string {
  return price.toFixed(decimals)
}
