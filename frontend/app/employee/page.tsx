'use client'

import { useState, useEffect } from 'react'
import WalletButton from '@/components/WalletButton'
import { usePYUSDtoPHP, usePythPrice, formatPrice } from '@/lib/pyth'

/**
 * Person B: Employee App
 * Real-time balance display with Pyth price feeds
 * Shows PYUSD balance in USD and PHP using live Pyth rates
 */

export default function EmployeeApp() {
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [balance, setBalance] = useState(0)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [currency, setCurrency] = useState<'PYUSD' | 'USD' | 'PHP'>('PYUSD')

  // Fetch live Pyth price feeds (updates every 5 seconds)
  const { priceData: pyusdUsdData, loading: pyusdLoading } = usePythPrice('PYUSD/USD')
  const { rate: pyusdPhpRate, loading: phpLoading } = usePYUSDtoPHP()

  // Real-time balance updates (simulated streaming - replace with contract reads)
  useEffect(() => {
    if (isClockedIn) {
      const interval = setInterval(() => {
        // Simulate balance increase (replace with actual contract call)
        // ~$5.70/hour = 0.00158 PYUSD per second
        setBalance(prev => prev + 0.00158)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isClockedIn])

  const handleClockIn = async () => {
    // TODO: Call contract clockIn() function
    setIsClockedIn(true)
    console.log('Clocked in')
  }

  const handleClockOut = async () => {
    // TODO: Call contract clockOut() function
    setIsClockedIn(false)
    console.log('Clocked out')
  }

  const handleWithdraw = async () => {
    // TODO: Call contract withdraw() function with async nonce signature
    console.log('Withdrawing:', withdrawAmount)
  }

  const availableBalance = balance * 0.7
  const escrowBalance = balance * 0.3

  // Calculate displayed amount based on currency selection
  const getDisplayAmount = (amount: number) => {
    if (currency === 'PYUSD') return amount
    if (currency === 'USD' && pyusdUsdData) {
      return amount * pyusdUsdData.price
    }
    if (currency === 'PHP') {
      return amount * pyusdPhpRate
    }
    return amount
  }

  const getCurrencySymbol = () => {
    if (currency === 'USD') return '$'
    if (currency === 'PHP') return '₱'
    return ''
  }

  const getCurrencySuffix = () => {
    if (currency === 'PYUSD') return ' PYUSD'
    return ''
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Employee App</h1>
          <WalletButton />
        </div>

        {/* Live Exchange Rates */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">📊 Live Exchange Rates (Pyth Network)</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">PYUSD/USD:</span>{' '}
              <span className="font-mono font-semibold">
                {pyusdLoading ? 'Loading...' : pyusdUsdData ? formatPrice(pyusdUsdData.price, 4) : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">PYUSD/PHP:</span>{' '}
              <span className="font-mono font-semibold">
                {phpLoading ? 'Loading...' : formatPrice(pyusdPhpRate, 2)}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Updates every 5 seconds</p>
        </div>

        {/* Clock In/Out */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Time Clock</h2>
          <div className="flex gap-4">
            <button
              onClick={handleClockIn}
              disabled={isClockedIn}
              className={`flex-1 py-4 rounded font-semibold ${
                isClockedIn 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isClockedIn ? '✅ Clocked In' : 'Clock In'}
            </button>
            <button
              onClick={handleClockOut}
              disabled={!isClockedIn}
              className={`flex-1 py-4 rounded font-semibold ${
                !isClockedIn 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              Clock Out
            </button>
          </div>
          {isClockedIn && (
            <p className="mt-4 text-green-600 text-center font-semibold">
              🟢 Streaming wages in real-time...
            </p>
          )}
        </div>

        {/* Balance Display */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Current Balance</h2>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="border rounded px-4 py-2"
            >
              <option value="PYUSD">PYUSD</option>
              <option value="USD">USD</option>
              <option value="PHP">PHP</option>
            </select>
          </div>
          
          <div className="text-5xl font-bold text-blue-600 mb-4">
            {getCurrencySymbol()}
            {formatPrice(getDisplayAmount(balance), currency === 'PYUSD' ? 4 : 2)}
            {getCurrencySuffix()}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-gray-600">Available Now (70%)</p>
              <p className="text-2xl font-semibold text-green-600">
                {formatPrice(availableBalance, 4)} PYUSD
              </p>
              <p className="text-sm text-gray-500 mt-1">
                ≈ ₱{formatPrice(availableBalance * pyusdPhpRate, 2)}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded">
              <p className="text-sm text-gray-600">Escrow (30%)</p>
              <p className="text-2xl font-semibold text-yellow-600">
                {formatPrice(escrowBalance, 4)} PYUSD
              </p>
              <p className="text-sm text-gray-500 mt-1">
                ≈ ₱{formatPrice(escrowBalance * pyusdPhpRate, 2)}
              </p>
            </div>
          </div>
        </div>

        {/* Withdrawal */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Withdraw</h2>
          <div className="flex gap-4">
            <input
              type="number"
              placeholder="Amount (PYUSD)"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="flex-1 border rounded px-4 py-2"
            />
            <button
              onClick={handleWithdraw}
              className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
            >
              Withdraw to Wallet
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Max available: {formatPrice(availableBalance, 4)} PYUSD (≈ ₱{formatPrice(availableBalance * pyusdPhpRate, 2)})
          </p>
        </div>
      </div>
    </div>
  )
}

