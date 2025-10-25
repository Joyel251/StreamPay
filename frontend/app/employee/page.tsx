'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { useAccount } from 'wagmi'
import WalletButton from '@/components/WalletButton'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { usePYUSDtoPHP, usePythPrice, formatPrice } from '@/lib/pyth'
// import { useContract } from '@/lib/hooks/useContract' // TODO: Uncomment when contract is deployed

// Lazy load heavy components
const GradientBlinds = lazy(() => import('@/components/GradientBlinds'))

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
  const [isPageLoading, setIsPageLoading] = useState(true)
  
  // Loading & error states
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Fetch live Pyth price feeds (updates every 5 seconds)
  const { priceData: pyusdUsdData, loading: pyusdLoading } = usePythPrice('PYUSD/USD')
  const { rate: pyusdPhpRate, loading: phpLoading } = usePYUSDtoPHP()

  // Simulate page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

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

  if (isPageLoading) {
    return <LoadingSpinner message="Loading Employee Dashboard..." />
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* GradientBlinds Background */}
      <Suspense fallback={<div className="absolute inset-0 bg-black" />}>
        <div className="absolute inset-0 z-0">
          <GradientBlinds
            gradientColors={['#FF9FFC', '#5227FF']}
            angle={45}
            noise={0.3}
            blindCount={12}
            blindMinWidth={50}
            spotlightRadius={0.3}
            spotlightSoftness={1}
            spotlightOpacity={0.8}
            mouseDampening={0}
            distortAmount={50}
            shineDirection="left"
            mixBlendMode="lighten"
            paused={false}
          />
        </div>
      </Suspense>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen">
        <div className="max-w-6xl mx-auto p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white">
                Employee Dashboard
              </h1>
              <p className="text-gray-300 mt-1">Real-time wage streaming powered by blockchain</p>
            </div>
            <WalletButton />
          </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-500/20 backdrop-blur-sm border-l-4 border-red-500 p-4 mb-6 rounded">
            <p className="text-red-100">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 backdrop-blur-sm border-l-4 border-green-500 p-4 mb-6 rounded">
            <p className="text-green-100">{success}</p>
          </div>
        )}

        {/* Wallet Connection Required */}
        {!isConnected && (
          <div className="bg-yellow-500/20 backdrop-blur-lg border border-yellow-400/30 rounded-lg p-6 mb-6 text-center">
            <p className="text-yellow-100 font-semibold mb-2">Connect your wallet to continue</p>
            <p className="text-yellow-200 text-sm">Click the "Connect Wallet" button above to get started</p>
          </div>
        )}

        {/* Live Exchange Rates */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-4 mb-6 shadow-lg">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            Live Exchange Rates 
            <span className="text-xs bg-blue-500/30 text-blue-200 px-2 py-1 rounded">Pyth Network</span>
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">PYUSD/USD:</span>
              <span className="font-mono font-semibold text-white">
                {pyusdLoading ? '...' : pyusdUsdData ? `$${formatPrice(pyusdUsdData.price, 4)}` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">PYUSD/PHP:</span>
              <span className="font-mono font-semibold text-white">
                {phpLoading ? '...' : `₱${formatPrice(pyusdPhpRate, 2)}`}
              </span>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-300">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Updates every 5 seconds
          </div>
        </div>

        {/* Clock In/Out */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-lg p-6 mb-6 border border-white/20">
          <h2 className="text-2xl font-semibold mb-4 text-white">Time Clock</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleClockIn}
              disabled={isClockedIn || actionLoading || !isConnected}
              className={`py-4 rounded-lg font-semibold transition-all ${
                isClockedIn 
                  ? 'bg-white/10 text-gray-400 cursor-not-allowed' 
                  : isConnected
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:shadow-lg transform hover:scale-105'
                  : 'bg-white/10 text-gray-400 cursor-not-allowed'
              }`}
            >
              {actionLoading ? 'Processing...' : isClockedIn ? 'Clocked In' : 'Clock In'}
            </button>
            <button
              onClick={handleClockOut}
              disabled={!isClockedIn || actionLoading || !isConnected}
              className={`py-4 rounded-lg font-semibold transition-all ${
                !isClockedIn 
                  ? 'bg-white/10 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 hover:shadow-lg transform hover:scale-105'
              }`}
            >
              {actionLoading ? 'Processing...' : 'Clock Out'}
            </button>
          </div>
          {isClockedIn && (
            <div className="mt-4 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg p-3 text-center">
              <p className="text-green-100 font-semibold flex items-center justify-center gap-2">
                <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                Streaming wages in real-time...
              </p>
            </div>
          )}
        </div>

        {/* Balance Display */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-lg p-6 mb-6 border border-white/20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-white">Current Balance</h2>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white rounded-lg px-4 py-2 font-semibold focus:border-blue-400 focus:outline-none"
            >
              <option value="PYUSD" className="text-gray-900">PYUSD</option>
              <option value="USD" className="text-gray-900">USD</option>
              <option value="PHP" className="text-gray-900">PHP (₱)</option>
            </select>
          </div>
          
          {balanceLoading && !balance ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
              <p className="text-gray-300 mt-4">Loading balance...</p>
            </div>
          ) : (
            <>
              <div className="text-5xl font-bold text-white mb-6">
                {getCurrencySymbol()}
                {formatPrice(getDisplayAmount(balance), currency === 'PYUSD' ? 4 : 2)}
                {getCurrencySuffix()}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-500/20 backdrop-blur-sm p-4 rounded-lg border border-green-400/30">
                  <p className="text-sm text-gray-300 font-medium mb-1">Available Now (70%)</p>
                  <p className="text-2xl font-bold text-green-300">
                    {formatPrice(availableBalance, 4)} PYUSD
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    ≈ ₱{formatPrice(availableBalance * pyusdPhpRate, 2)}
                  </p>
                </div>
                <div className="bg-yellow-500/20 backdrop-blur-sm p-4 rounded-lg border border-yellow-400/30">
                  <p className="text-sm text-gray-300 font-medium mb-1">Escrow (30%)</p>
                  <p className="text-2xl font-bold text-yellow-300">
                    {formatPrice(escrowBalance, 4)} PYUSD
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    ≈ ₱{formatPrice(escrowBalance * pyusdPhpRate, 2)}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Withdrawal */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-lg p-6 border border-white/20">
          <h2 className="text-2xl font-semibold mb-4 text-white">Withdraw Funds</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount (PYUSD)
              </label>
              <div className="flex gap-4">
                <input
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  disabled={!isConnected || actionLoading}
                  className="flex-1 bg-white/10 border-2 border-white/30 text-white rounded-lg px-4 py-3 focus:border-blue-400 focus:outline-none disabled:bg-white/5 placeholder-gray-400"
                />
                <button
                  onClick={() => setWithdrawAmount(availableBalance.toString())}
                  disabled={!isConnected || actionLoading}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:bg-white/5"
                >
                  Max
                </button>
              </div>
            </div>
            
            <button
              onClick={handleWithdraw}
              disabled={!isConnected || actionLoading || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-4 rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              {actionLoading ? 'Processing Withdrawal...' : 'Withdraw to Wallet'}
            </button>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Max available:</span>
                <span className="font-semibold text-white">{formatPrice(availableBalance, 4)} PYUSD</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-300">Equivalent:</span>
                <span className="font-semibold text-white">≈ ₱{formatPrice(availableBalance * pyusdPhpRate, 2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </main>
  )
}
