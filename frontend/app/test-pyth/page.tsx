'use client'

import { useState } from 'react'

interface PythPriceData {
  price: {
    price: string
    expo: number
    conf: string
    publish_time: number
  }
}

interface PriceResult {
  success: boolean
  price?: number
  raw?: PythPriceData
  timestamp?: string
  error?: string
}

export default function TestPythPage() {
  const [pyusdUsdResult, setPyusdUsdResult] = useState<PriceResult | null>(null)
  const [usdPhpResult, setUsdPhpResult] = useState<PriceResult | null>(null)
  const [loading, setLoading] = useState(false)

  const testPyth = async () => {
    setLoading(true)
    
    // Test PYUSD/USD
    try {
      const pyusdUrl = 'https://hermes.pyth.network/v2/updates/price/latest?ids[]=c1da1b73d7f01e7ddd54b3766cf7fcd644395ad14f70aa706ec5384c59e76692'
      const pyusdResponse = await fetch(pyusdUrl)
      const pyusdData = await pyusdResponse.json()
      
      if (pyusdData.parsed && pyusdData.parsed.length > 0) {
        const price = Number(pyusdData.parsed[0].price.price) * Math.pow(10, pyusdData.parsed[0].price.expo)
        setPyusdUsdResult({
          success: true,
          price: price,
          raw: pyusdData.parsed[0],
          timestamp: new Date(pyusdData.parsed[0].price.publish_time * 1000).toLocaleString()
        })
      } else {
        setPyusdUsdResult({ success: false, error: 'No data' })
      }
    } catch (error) {
      setPyusdUsdResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' })
    }

    // Test USD/PHP
    try {
      const phpUrl = 'https://hermes.pyth.network/v2/updates/price/latest?ids[]=2bda7f268b52bfbc3f2e124c31445247647350db313caadc6771e6299e0a68c9'
      const phpResponse = await fetch(phpUrl)
      const phpData = await phpResponse.json()
      
      if (phpData.parsed && phpData.parsed.length > 0) {
        const price = Number(phpData.parsed[0].price.price) * Math.pow(10, phpData.parsed[0].price.expo)
        setUsdPhpResult({
          success: true,
          price: price,
          raw: phpData.parsed[0],
          timestamp: new Date(phpData.parsed[0].price.publish_time * 1000).toLocaleString()
        })
      } else {
        setUsdPhpResult({ success: false, error: 'No data' })
      }
    } catch (error) {
      setUsdPhpResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
  <h1 className="text-4xl font-bold mb-8">Pyth API Test</h1>

        <button
          onClick={testPyth}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 mb-8"
        >
          {loading ? 'Testing...' : 'Test Pyth API'}
        </button>

        {/* PYUSD/USD Result */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">PYUSD/USD (Crypto.PYUSD/USD)</h2>
          {pyusdUsdResult ? (
            pyusdUsdResult.success ? (
              <div>
                <div className="text-4xl font-bold text-green-600 mb-4">
                  ${pyusdUsdResult.price?.toFixed(4) ?? 'N/A'}
                </div>
                <div className="bg-green-50 p-4 rounded text-sm">
                  <p><strong>Fetch Successful</strong></p>
                  <p className="mt-2"><strong>Timestamp:</strong> {pyusdUsdResult.timestamp}</p>
                  {pyusdUsdResult.raw && (
                    <>
                      <p className="mt-2"><strong>Raw Price:</strong> {pyusdUsdResult.raw.price.price}</p>
                      <p><strong>Exponent:</strong> {pyusdUsdResult.raw.price.expo}</p>
                      <p><strong>Confidence:</strong> {pyusdUsdResult.raw.price.conf}</p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-red-50 p-4 rounded text-red-700">
                <p><strong>Request Failed:</strong> {pyusdUsdResult.error}</p>
              </div>
            )
          ) : (
            <p className="text-gray-500">Click &quot;Test Pyth API&quot; to fetch</p>
          )}
        </div>

        {/* USD/PHP Result */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">USD/PHP (FX.USD/PHP)</h2>
          {usdPhpResult ? (
            usdPhpResult.success ? (
              <div>
                <div className="text-4xl font-bold text-green-600 mb-4">
                  ₱{usdPhpResult.price?.toFixed(2) ?? 'N/A'}
                </div>
                <div className="bg-green-50 p-4 rounded text-sm">
                  <p><strong>Fetch Successful</strong></p>
                  <p className="mt-2"><strong>Timestamp:</strong> {usdPhpResult.timestamp}</p>
                  {usdPhpResult.raw && (
                    <>
                      <p className="mt-2"><strong>Raw Price:</strong> {usdPhpResult.raw.price.price}</p>
                      <p><strong>Exponent:</strong> {usdPhpResult.raw.price.expo}</p>
                      <p><strong>Confidence:</strong> {usdPhpResult.raw.price.conf}</p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-red-50 p-4 rounded text-red-700">
                <p><strong>Request Failed:</strong> {usdPhpResult.error}</p>
              </div>
            )
          ) : (
            <p className="text-gray-500">Click &quot;Test Pyth API&quot; to fetch</p>
          )}
        </div>

        {/* Cross Rate */}
        {pyusdUsdResult?.success && usdPhpResult?.success && pyusdUsdResult.price && usdPhpResult.price && (
          <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Calculated Cross-Rate</h2>
            <div className="text-4xl font-bold text-purple-600 mb-2">
              ₱{(pyusdUsdResult.price * usdPhpResult.price).toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">
              PYUSD/PHP = {pyusdUsdResult.price.toFixed(4)} × {usdPhpResult.price.toFixed(2)} = {(pyusdUsdResult.price * usdPhpResult.price).toFixed(2)}
            </p>
            <p className="text-xs text-green-600 mt-2">Live calculation, not hardcoded.</p>
          </div>
        )}
      </div>
    </div>
  )
}
