'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import WalletButton from '@/components/WalletButton'
import { usePYUSDtoPHP, usePythPrice, formatPrice } from '@/lib/pyth'
// import { useContract } from '@/lib/hooks/useContract' // TODO: Uncomment when contract is deployed

/**
 * Employee Dashboard - Complete Implementation
 * - Real-time balance from contract
 * - Clock in/out with contract calls
 * - Withdraw with proper validation
 * - Live Pyth price feeds
 */

export default function EmployeeApp() {
  const { address, isConnected } = useAccount()
  // const { write, read, loading: contractLoading } = useContract() // TODO: Uncomment when contract is deployed
  
  // State
  const [balance, setBalance] = useState(0)
  const [availableBalance, setAvailableBalance] = useState(0)
  const [escrowBalance, setEscrowBalance] = useState(0)
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [currency, setCurrency] = useState<'PYUSD' | 'USD' | 'PHP'>('PYUSD')
  
  // Loading & error states
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Fetch live Pyth price feeds (updates every 5 seconds)
  const { priceData: pyusdUsdData, loading: pyusdLoading } = usePythPrice('PYUSD/USD')
  const { rate: pyusdPhpRate, loading: phpLoading } = usePYUSDtoPHP()

  // Fetch employee balance from contract (real-time updates)
  useEffect(() => {
    if (!isConnected || !address) return

    const fetchBalance = async () => {
      setBalanceLoading(true)
      try {
        // TODO: Uncomment when contract is deployed
        // const balanceStr = await read.getEmployeeBalance(address)
        // const totalBalance = parseFloat(balanceStr)
        
        // TEMPORARY: Simulate balance for testing Pyth rates
        const totalBalance = 10.5 // Simulated balance
        setBalance(totalBalance)
        setAvailableBalance(totalBalance * 0.7) // 70% available
        setEscrowBalance(totalBalance * 0.3) // 30% escrow
        
        // TODO: Uncomment when contract is deployed
        // Check if employee is clocked in
        // const info = await read.getEmployeeInfo(address)
        // if (info) {
        //   setIsClockedIn(info.isClockedIn)
        // }
      } catch (err: any) {
        console.error('Failed to fetch balance:', err)
      } finally {
        setBalanceLoading(false)
      }
    }

    // Fetch immediately
    fetchBalance()

    // TODO: Re-enable interval when contract is deployed
    // Update every 2 seconds when clocked in, every 5 seconds otherwise
    // const interval = setInterval(fetchBalance, isClockedIn ? 2000 : 5000)
    // return () => clearInterval(interval)
  }, [isConnected, address, isClockedIn])

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccess(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  const handleClockIn = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first')
      return
    }

    setActionLoading(true)
    setError(null)
    try {
      // TODO: Uncomment when contract is deployed
      // await write.clockIn()
      
      // TEMPORARY: Simulate for testing Pyth rates
  setIsClockedIn(true)
  setSuccess('Clocked in successfully. (Simulated - waiting for contract deployment)')
    } catch (err: any) {
      console.error('Clock in failed:', err)
      setError(err.message || 'Failed to clock in. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleClockOut = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first')
      return
    }

    setActionLoading(true)
    setError(null)
    try {
      // TODO: Uncomment when contract is deployed
      // await write.clockOut()
      
      // TEMPORARY: Simulate for testing Pyth rates
  setIsClockedIn(false)
  setSuccess('Clocked out successfully. (Simulated - waiting for contract deployment)')
    } catch (err: any) {
      console.error('Clock out failed:', err)
      setError(err.message || 'Failed to clock out. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first')
      return
    }

    const amount = parseFloat(withdrawAmount)
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (amount > availableBalance) {
      setError(`Insufficient balance. Max available: ${formatPrice(availableBalance, 4)} PYUSD`)
      return
    }

    setActionLoading(true)
    setError(null)
    try {
      // TODO: Uncomment when contract is deployed
      // For now, use simple withdrawal (nonce=0, empty signature)
      // Person A will implement EVVM async nonce executor
      // await write.withdraw(withdrawAmount, 0, '0x')
      
      // TEMPORARY: Simulate for testing Pyth rates
  setSuccess(`Withdrew ${withdrawAmount} PYUSD successfully. (Simulated - waiting for contract deployment)`)
      setWithdrawAmount('')
    } catch (err: any) {
      console.error('Withdrawal failed:', err)
      setError(err.message || 'Withdrawal failed. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Employee Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Real-time wage streaming powered by blockchain</p>
          </div>
          <WalletButton />
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Wallet Connection Required */}
        {!isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6 text-center">
            <p className="text-yellow-800 font-semibold mb-2">Connect your wallet to continue</p>
            <p className="text-yellow-600 text-sm">Click the "Connect Wallet" button above to get started</p>
          </div>
        )}

        {/* Live Exchange Rates */}
        <div className="bg-white border border-blue-200 rounded-lg p-4 mb-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            Live Exchange Rates 
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Pyth Network</span>
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">PYUSD/USD:</span>
              <span className="font-mono font-semibold">
                {pyusdLoading ? '...' : pyusdUsdData ? `$${formatPrice(pyusdUsdData.price, 4)}` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">PYUSD/PHP:</span>
              <span className="font-mono font-semibold">
                {phpLoading ? '...' : `₱${formatPrice(pyusdPhpRate, 2)}`}
              </span>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Updates every 5 seconds
          </div>
        </div>

        {/* Clock In/Out */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Time Clock</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleClockIn}
              disabled={isClockedIn || actionLoading || !isConnected}
              className={`py-4 rounded-lg font-semibold transition-all ${
                isClockedIn 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : isConnected
                  ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {actionLoading ? 'Processing...' : isClockedIn ? 'Clocked In' : 'Clock In'}
            </button>
            <button
              onClick={handleClockOut}
              disabled={!isClockedIn || actionLoading || !isConnected}
              className={`py-4 rounded-lg font-semibold transition-all ${
                !isClockedIn 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg transform hover:scale-105'
              }`}
            >
              {actionLoading ? 'Processing...' : 'Clock Out'}
            </button>
          </div>
          {isClockedIn && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <p className="text-green-700 font-semibold flex items-center justify-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                Streaming wages in real-time...
              </p>
            </div>
          )}
        </div>

        {/* Balance Display */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Current Balance</h2>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="border-2 border-gray-300 rounded-lg px-4 py-2 font-semibold focus:border-blue-500 focus:outline-none"
            >
              <option value="PYUSD">PYUSD</option>
              <option value="USD">USD</option>
              <option value="PHP">PHP (₱)</option>
            </select>
          </div>
          
          {balanceLoading && !balance ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading balance...</p>
            </div>
          ) : (
            <>
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                {getCurrencySymbol()}
                {formatPrice(getDisplayAmount(balance), currency === 'PYUSD' ? 4 : 2)}
                {getCurrencySuffix()}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 font-medium mb-1">Available Now (70%)</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPrice(availableBalance, 4)} PYUSD
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    ≈ ₱{formatPrice(availableBalance * pyusdPhpRate, 2)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm text-gray-600 font-medium mb-1">Escrow (30%)</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatPrice(escrowBalance, 4)} PYUSD
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    ≈ ₱{formatPrice(escrowBalance * pyusdPhpRate, 2)}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Withdrawal */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Withdraw Funds</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (PYUSD)
              </label>
              <div className="flex gap-4">
                <input
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  disabled={!isConnected || actionLoading}
                  className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
                />
                <button
                  onClick={() => setWithdrawAmount(availableBalance.toString())}
                  disabled={!isConnected || actionLoading}
                  className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg font-medium transition-colors disabled:bg-gray-100"
                >
                  Max
                </button>
              </div>
            </div>
            
            <button
              onClick={handleWithdraw}
              disabled={!isConnected || actionLoading || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              {actionLoading ? 'Processing Withdrawal...' : 'Withdraw to Wallet'}
            </button>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Max available:</span>
                <span className="font-semibold">{formatPrice(availableBalance, 4)} PYUSD</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">Equivalent:</span>
                <span className="font-semibold">≈ ₱{formatPrice(availableBalance * pyusdPhpRate, 2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
