'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { useAccount } from 'wagmi'
import WalletButton from '@/components/WalletButton'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { usePYUSDtoPHP, usePythPrice, formatPrice } from '@/lib/pyth'
import { useContract } from '@/lib/hooks/useContract' // ✅ NOW USING REAL CONTRACT

// Lazy load heavy components
const GradientBlinds = lazy(() => import('@/components/GradientBlinds'))

/**
 * Employee Dashboard - REAL CONTRACT INTEGRATION ✅
 * - Real-time balance from deployed StreamingVault
 * - Clock in/out with actual contract calls
 * - Withdraw with proper validation
 * - Live Pyth price feeds
 */

export default function EmployeeApp() {
  const { address, isConnected } = useAccount()
  const { write, read, isInitialized } = useContract() // ✅ CONNECTED TO REAL CONTRACT
  
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
    if (!isConnected || !address || !isInitialized) {
      setBalance(0)
      setAvailableBalance(0)
      setEscrowBalance(0)
      setIsClockedIn(false)
      return
    }

    const fetchBalance = async () => {
      // Only show loading on first fetch
      if (balance === 0) {
        setBalanceLoading(true)
      }
      
      try {
        // Check if read function is available
        if (!read.getEmployeeDetails) {
          console.log('Contract methods not ready yet')
          return
        }

        // ✅ FETCH FROM REAL CONTRACT
        const details = await read.getEmployeeDetails(address)
        
        if (details) {
          const available = parseFloat(details.availableBalance)
          const escrow = parseFloat(details.escrowBalance)
          const totalBalance = available + escrow
          
          setBalance(totalBalance)
          setAvailableBalance(available)
          setEscrowBalance(escrow)
          setIsClockedIn(details.isClockedIn)
        } else {
          // Employee not registered yet
          setBalance(0)
          setAvailableBalance(0)
          setEscrowBalance(0)
          setIsClockedIn(false)
        }
      } catch (err) {
        console.error('Failed to fetch balance:', err)
        // Only show error if it's not a "not initialized" error
        if (err instanceof Error && !err.message.includes('not initialized')) {
          setError('Failed to load employee data from contract')
        }
      } finally {
        if (balance === 0) {
          setBalanceLoading(false)
        }
      }
    }

    // Fetch immediately
    fetchBalance()

    // Update every 5 seconds when clocked in, every 10 seconds otherwise  
    const interval = setInterval(fetchBalance, isClockedIn ? 5000 : 10000)
    return () => clearInterval(interval)
  }, [isConnected, address, isClockedIn, read, isInitialized])

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

    // Check if contract is initialized
    if (!isInitialized || !write.clockIn) {
      setError('Contract not initialized. Please refresh the page and try again.')
      return
    }

    setActionLoading(true)
    setError(null)
    try {
      // ✅ REAL CONTRACT CALL
      const tx = await write.clockIn()
      setSuccess('Transaction submitted! Waiting for confirmation...')
      
      // Wait for confirmation
      await tx.wait()
      
      setIsClockedIn(true)
      setSuccess(`✅ Clocked in successfully! Tx: ${tx.hash.slice(0, 10)}...`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clock in. Please try again.'
      console.error('Clock in failed:', err)
      setError(errorMessage)
    } finally {
      setActionLoading(false)
    }
  }

  const handleClockOut = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first')
      return
    }

    // Check if contract is initialized
    if (!isInitialized || !write.clockOut) {
      setError('Contract not initialized. Please refresh the page and try again.')
      return
    }

    setActionLoading(true)
    setError(null)
    try {
      // ✅ REAL CONTRACT CALL
      const tx = await write.clockOut()
      setSuccess('Transaction submitted! Waiting for confirmation...')
      
      // Wait for confirmation
      await tx.wait()
      
      setIsClockedIn(false)
      setSuccess(`✅ Clocked out successfully! Tx: ${tx.hash.slice(0, 10)}...`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clock out. Please try again.'
      console.error('Clock out failed:', err)
      setError(errorMessage)
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

    // Check if contract is initialized
    if (!isInitialized || !write.withdraw) {
      setError('Contract not initialized. Please refresh the page and try again.')
      return
    }

    setActionLoading(true)
    setError(null)
    try {
      // ✅ REAL CONTRACT CALL
      const tx = await write.withdraw(withdrawAmount)
      setSuccess('Transaction submitted! Waiting for confirmation...')
      
      // Wait for confirmation
      await tx.wait()
      
      setSuccess(`✅ Withdrawal successful! Tx: ${tx.hash.slice(0, 10)}...`)
      setWithdrawAmount('')
      
      // Refresh balance after withdrawal
      if (address) {
        const details = await read.getEmployeeDetails(address)
        if (details) {
          setAvailableBalance(parseFloat(details.availableBalance))
          setBalance(parseFloat(details.availableBalance) + parseFloat(details.escrowBalance))
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Withdrawal failed. Please try again.'
      console.error('Withdrawal failed:', err)
      setError(errorMessage)
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
        <div className="max-w-7xl mx-auto p-6 md:p-8">
          {/* Header with Glassmorphism */}
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 mb-8 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Employee Dashboard
                </h1>
                <p className="text-gray-300 mt-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Real-time wage streaming powered by blockchain
                </p>
              </div>
              <div className="flex items-center gap-4">
                {isConnected && address && (
                  <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-gray-300 font-mono">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                  </div>
                )}
                <WalletButton />
              </div>
            </div>
          </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-500/20 backdrop-blur-xl border border-red-400/30 p-5 mb-6 rounded-2xl shadow-lg animate-in fade-in slide-in-from-top-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-100 font-medium">{error}</p>
            </div>
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 backdrop-blur-xl border border-green-400/30 p-5 mb-6 rounded-2xl shadow-lg animate-in fade-in slide-in-from-top-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-100 font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Wallet Connection Required */}
        {!isConnected && (
          <div className="bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-red-500/20 backdrop-blur-xl border border-yellow-400/30 rounded-2xl p-8 mb-6 text-center shadow-2xl">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-yellow-100 font-bold text-xl mb-2">Wallet Connection Required</p>
                <p className="text-yellow-200">Connect your wallet above to access your employee dashboard</p>
              </div>
            </div>
          </div>
        )}

        {/* Contract Initialization Status */}
        {isConnected && !isInitialized && (
          <div className="bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 backdrop-blur-xl border border-blue-400/30 rounded-2xl p-6 mb-6 shadow-2xl animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-400/20 rounded-full flex items-center justify-center">
                <svg className="animate-spin h-6 w-6 text-blue-300" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-blue-100 font-bold text-lg mb-1">Initializing Smart Contract...</p>
                <p className="text-blue-200 text-sm">Connecting to StreamingVault on Sepolia network. This may take a few seconds.</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Live Exchange Rates - Spans 2 columns */}
          <div className="lg:col-span-2 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-white text-xl flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                Live Exchange Rates
              </h3>
              <span className="text-xs bg-blue-500/30 text-blue-200 px-3 py-1.5 rounded-full font-semibold border border-blue-400/30">
                Pyth Network
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-gray-400 text-sm font-medium">PYUSD/USD</span>
                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">Live</span>
                </div>
                <span className="font-mono font-bold text-3xl text-white block">
                  {pyusdLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : pyusdUsdData ? (
                    `$${formatPrice(pyusdUsdData.price, 4)}`
                  ) : (
                    'N/A'
                  )}
                </span>
                <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  Real-time
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-gray-400 text-sm font-medium">PYUSD/PHP</span>
                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">Live</span>
                </div>
                <span className="font-mono font-bold text-3xl text-white block">
                  {phpLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    `₱${formatPrice(pyusdPhpRate, 2)}`
                  )}
                </span>
                <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  Real-time
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 bg-white/5 rounded-lg px-3 py-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Updates every 5 seconds
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-red-500/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
            <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Work Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  isClockedIn 
                    ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
                    : 'bg-gray-500/20 text-gray-400 border border-gray-600/30'
                }`}>
                  {isClockedIn ? 'Clocked In' : 'Clocked Out'}
                </span>
              </div>
              {isClockedIn && (
                <div className="bg-green-500/10 backdrop-blur-sm border border-green-400/30 rounded-lg p-3 mt-4 animate-in fade-in">
                  <p className="text-green-100 text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Wages streaming...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Clock In/Out */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-teal-500/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 mb-6 border border-white/20 hover:border-white/30 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Time Clock</h2>
              <p className="text-gray-400 text-sm">Track your working hours</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleClockIn}
              disabled={isClockedIn || actionLoading || !isConnected}
              className={`group relative overflow-hidden py-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                isClockedIn 
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed border-2 border-white/10' 
                  : isConnected
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:shadow-2xl hover:shadow-green-500/50 transform hover:scale-105 border-2 border-green-400/50'
                  : 'bg-white/5 text-gray-500 cursor-not-allowed border-2 border-white/10'
              }`}
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {!isClockedIn && isConnected && !actionLoading && (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {actionLoading ? 'Processing...' : isClockedIn ? 'Already Clocked In' : 'Clock In'}
              </div>
            </button>
            
            <button
              onClick={handleClockOut}
              disabled={!isClockedIn || actionLoading || !isConnected}
              className={`group relative overflow-hidden py-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                !isClockedIn 
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed border-2 border-white/10' 
                  : 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 hover:shadow-2xl hover:shadow-red-500/50 transform hover:scale-105 border-2 border-red-400/50'
              }`}
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {isClockedIn && !actionLoading && (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {actionLoading ? 'Processing...' : 'Clock Out'}
              </div>
            </button>
          </div>
          
          {isClockedIn && (
            <div className="mt-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-xl p-4 text-center animate-in fade-in slide-in-from-bottom-4">
              <p className="text-green-100 font-bold text-lg flex items-center justify-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                Streaming wages in real-time...
              </p>
            </div>
          )}
        </div>

        {/* Balance Display */}
        <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 mb-6 border border-white/20 hover:border-white/30 transition-all duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Current Balance</h2>
                <p className="text-gray-400 text-sm">Your earned wages</p>
              </div>
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as 'PYUSD' | 'USD' | 'PHP')}
              className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl px-4 py-2.5 font-bold focus:border-indigo-400 focus:outline-none hover:bg-white/20 transition-colors cursor-pointer"
            >
              <option value="PYUSD" className="bg-gray-900">PYUSD</option>
              <option value="USD" className="bg-gray-900">USD ($)</option>
              <option value="PHP" className="bg-gray-900">PHP (₱)</option>
            </select>
          </div>
          
          {balanceLoading && !balance ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-400/30 border-t-indigo-400 mx-auto"></div>
              <p className="text-gray-300 mt-6 font-medium">Loading balance...</p>
            </div>
          ) : (
            <>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/10">
                <div className="text-6xl font-black text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text mb-2">
                  {getCurrencySymbol()}
                  {formatPrice(getDisplayAmount(balance), currency === 'PYUSD' ? 4 : 2)}
                  {getCurrencySuffix()}
                </div>
                <div className="text-gray-400 text-sm flex items-center gap-2 mt-2">
                  {isClockedIn && (
                    <>
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span>Updating in real-time</span>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm p-6 rounded-xl border border-green-400/30 hover:border-green-400/50 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-sm text-gray-300 font-semibold">Available Now</p>
                    <span className="bg-green-500/30 text-green-200 px-2 py-1 rounded-lg text-xs font-bold">70%</span>
                  </div>
                  <p className="text-3xl font-black text-green-300 mb-2">
                    {formatPrice(availableBalance, 4)} PYUSD
                  </p>
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    ₱{formatPrice(availableBalance * pyusdPhpRate, 2)} PHP
                  </p>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm p-6 rounded-xl border border-yellow-400/30 hover:border-yellow-400/50 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-sm text-gray-300 font-semibold">Escrow</p>
                    <span className="bg-yellow-500/30 text-yellow-200 px-2 py-1 rounded-lg text-xs font-bold">30%</span>
                  </div>
                  <p className="text-3xl font-black text-yellow-300 mb-2">
                    {formatPrice(escrowBalance, 4)} PYUSD
                  </p>
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    ₱{formatPrice(escrowBalance * pyusdPhpRate, 2)} PHP
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Withdrawal */}
        <div className="bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 hover:border-white/30 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Withdraw Funds</h2>
              <p className="text-gray-400 text-sm">Transfer to your wallet</p>
            </div>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Amount (PYUSD)
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    disabled={!isConnected || actionLoading}
                    className="w-full bg-white/10 border-2 border-white/30 text-white text-lg font-bold rounded-xl px-5 py-4 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 disabled:bg-white/5 placeholder-gray-500 transition-all"
                  />
                  {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      ≈ ₱{formatPrice(parseFloat(withdrawAmount) * pyusdPhpRate, 2)}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setWithdrawAmount(availableBalance.toString())}
                  disabled={!isConnected || actionLoading}
                  className="bg-white/10 hover:bg-white/20 border-2 border-white/30 hover:border-violet-400 text-white px-6 py-4 rounded-xl font-bold transition-all disabled:bg-white/5 disabled:border-white/10 disabled:cursor-not-allowed"
                >
                  MAX
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Available: {formatPrice(availableBalance, 4)} PYUSD
              </p>
              
              {/* Escrow Split Preview */}
              {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
                <div className="mt-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-400/30 rounded-xl p-4">
                  <p className="text-xs text-gray-300 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold">Withdrawal Breakdown:</span>
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-green-500/20 border border-green-400/30 rounded-lg p-3">
                      <span className="text-sm text-gray-300 flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        To Your Wallet (70%)
                      </span>
                      <span className="font-bold text-green-300 font-mono">
                        {formatPrice(parseFloat(withdrawAmount) * 0.7, 4)} PYUSD
                        <span className="text-xs text-gray-400 ml-2">
                          (≈ ₱{formatPrice(parseFloat(withdrawAmount) * 0.7 * pyusdPhpRate, 2)})
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-3">
                      <span className="text-sm text-gray-300 flex items-center gap-2">
                        <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        To Escrow (30%)
                      </span>
                      <span className="font-bold text-yellow-300 font-mono">
                        {formatPrice(parseFloat(withdrawAmount) * 0.3, 4)} PYUSD
                        <span className="text-xs text-gray-400 ml-2">
                          (≈ ₱{formatPrice(parseFloat(withdrawAmount) * 0.3 * pyusdPhpRate, 2)})
                        </span>
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-3 italic">
                    💡 Note: 30% of withdrawn amount goes to escrow for manager approval
                  </p>
                </div>
              )}
            </div>
            
            <button
              onClick={handleWithdraw}
              disabled={!isConnected || actionLoading || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
              className="group w-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-600 text-white px-6 py-5 rounded-xl font-black text-lg hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/50 border-2 border-violet-400/50 disabled:border-gray-600"
            >
              <span className="flex items-center justify-center gap-3">
                {actionLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Withdrawal...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    Withdraw to Wallet
                  </>
                )}
              </span>
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
