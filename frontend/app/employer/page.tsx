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
 * Employer Dashboard - REAL CONTRACT INTEGRATION ✅
 * - Deposit PYUSD to vault
 * - Add employees with annual salary
 * - Live Pyth price feeds
 */

export default function EmployerDashboard() {
  const { address, isConnected } = useAccount()
  const { write, read } = useContract() // ✅ CONNECTED TO REAL CONTRACT
  
  const [depositAmount, setDepositAmount] = useState('')
  const [employeeAddress, setEmployeeAddress] = useState('')
  const [annualSalary, setAnnualSalary] = useState('')
  const [managerAddress, setManagerAddress] = useState('')
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [walletBalance, setWalletBalance] = useState<string>('0')
  const [vaultBalance, setVaultBalance] = useState<string>('0')

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

  // Fetch balances
  useEffect(() => {
    if (!isConnected || !address) {
      setWalletBalance('0')
      setVaultBalance('0')
      return
    }

    const fetchBalances = async () => {
      try {
        // Check if read functions are available
        if (!read.getPYUSDBalance || !read.getVaultBalance) {
          console.log('Contract methods not ready yet')
          return
        }

        const [wallet, vault] = await Promise.all([
          read.getPYUSDBalance(address),
          read.getVaultBalance()
        ])
        setWalletBalance(wallet)
        setVaultBalance(vault)
      } catch (err) {
        console.error('Failed to fetch balances:', err)
      }
    }

    fetchBalances()
    const interval = setInterval(fetchBalances, 10000) // Refresh every 10s
    return () => clearInterval(interval)
  }, [isConnected, address, read])

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

  const handleDeposit = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first')
      return
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setError('Please enter a valid deposit amount')
      return
    }

    const amount = parseFloat(depositAmount)
    const balance = parseFloat(walletBalance)
    
    if (amount > balance) {
      setError(`Insufficient balance. You have ${walletBalance} PYUSD`)
      return
    }

    setActionLoading(true)
    setError(null)
    try {
      // Step 1: Approve PYUSD
      setSuccess('Step 1/2: Approving PYUSD...')
      await write.approvePYUSD(depositAmount)
      
      // Step 2: Deposit to vault
      setSuccess('Step 2/2: Depositing to vault...')
      await write.deposit(depositAmount)
      
      setSuccess(`Successfully deposited ${depositAmount} PYUSD to vault!`)
      setDepositAmount('')
      
      // Refresh balances
      const [wallet, vault] = await Promise.all([
        read.getPYUSDBalance(address!),
        read.getVaultBalance()
      ])
      setWalletBalance(wallet)
      setVaultBalance(vault)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Deposit failed. Please try again.'
      console.error('Deposit failed:', err)
      setError(errorMessage)
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddEmployee = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first')
      return
    }

    if (!employeeAddress || !annualSalary || !managerAddress) {
      setError('Please fill in all fields')
      return
    }

    // Validate Ethereum address
    if (!/^0x[a-fA-F0-9]{40}$/.test(employeeAddress)) {
      setError('Invalid employee wallet address')
      return
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(managerAddress)) {
      setError('Invalid manager wallet address')
      return
    }

    if (parseFloat(annualSalary) <= 0) {
      setError('Annual salary must be greater than 0')
      return
    }

    setActionLoading(true)
    setError(null)
    try {
      // ✅ REAL CONTRACT CALL
      await write.addEmployee(employeeAddress, annualSalary, managerAddress)
      setSuccess(`Successfully added employee ${employeeAddress.slice(0, 6)}...${employeeAddress.slice(-4)} with salary ${annualSalary} PYUSD/year!`)
      setEmployeeAddress('')
      setAnnualSalary('')
      setManagerAddress('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add employee. Please try again.'
      console.error('Add employee failed:', err)
      setError(errorMessage)
    } finally {
      setActionLoading(false)
    }
  }

  // Calculate equivalent amounts in different currencies
  const getEquivalentAmounts = (pyusdAmount: string) => {
    const amount = parseFloat(pyusdAmount) || 0
    const usd = pyusdUsdData ? amount * pyusdUsdData.price : 0
    const php = amount * pyusdPhpRate
    return { usd, php }
  }

  const depositEquiv = getEquivalentAmounts(depositAmount)
  const salaryEquiv = getEquivalentAmounts(annualSalary)

  if (isPageLoading) {
    return <LoadingSpinner message="Loading Employer Dashboard..." />
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
            <div>
              <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
                Employer Portal
              </h1>
              <p className="text-gray-300 text-lg">
                Fund escrow & onboard employees with real-time wage streaming
              </p>
            </div>
            <WalletButton />
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
                  <p className="text-yellow-200">Connect your wallet above to manage employees and deposits</p>
                </div>
              </div>
            </div>
          )}

          {/* Live Exchange Rates Card */}
          <div className="bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6 mb-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Live Exchange Rates</h3>
                <p className="text-xs text-gray-400">Powered by Pyth Network • Updates every 5 seconds</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300 font-medium">PYUSD/USD</span>
                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">Live</span>
                </div>
                <p className="text-3xl font-bold text-white mt-2 font-mono">
                  {pyusdLoading ? (
                    <span className="text-gray-400 animate-pulse">Loading...</span>
                  ) : pyusdUsdData ? (
                    `$${formatPrice(pyusdUsdData.price, 4)}`
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300 font-medium">PYUSD/PHP</span>
                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">Live</span>
                </div>
                <p className="text-3xl font-bold text-white mt-2 font-mono">
                  {phpLoading ? (
                    <span className="text-gray-400 animate-pulse">Loading...</span>
                  ) : (
                    `₱${formatPrice(pyusdPhpRate, 2)}`
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Deposit Section */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500/30 to-purple-500/30 px-6 py-4 border-b border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Deposit PYUSD</h2>
                    <p className="text-sm text-gray-300">Fund the streaming vault</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Balance Display */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-xl p-4">
                    <p className="text-xs text-green-300 mb-1 font-medium">Your Wallet</p>
                    <p className="text-2xl font-bold text-white font-mono">{parseFloat(walletBalance).toFixed(2)}</p>
                    <p className="text-xs text-green-200 mt-1">PYUSD</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-xl p-4">
                    <p className="text-xs text-blue-300 mb-1 font-medium">Vault Balance</p>
                    <p className="text-2xl font-bold text-white font-mono">{parseFloat(vaultBalance).toFixed(2)}</p>
                    <p className="text-xs text-blue-200 mt-1">PYUSD</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount (PYUSD)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full bg-white/10 border-2 border-white/30 text-white text-2xl rounded-xl px-4 py-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 focus:outline-none placeholder-gray-500 font-mono transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                      PYUSD
                    </span>
                  </div>
                </div>

                {depositAmount && parseFloat(depositAmount) > 0 && (
                  <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-400/30 animate-fadeIn">
                    <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Equivalent amounts</p>
                    <div className="space-y-1">
                      <p className="text-lg font-semibold text-white font-mono">
                        ≈ ${formatPrice(depositEquiv.usd, 2)} <span className="text-sm text-gray-400">USD</span>
                      </p>
                      <p className="text-lg font-semibold text-white font-mono">
                        ≈ ₱{formatPrice(depositEquiv.php, 2)} <span className="text-sm text-gray-400">PHP</span>
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleDeposit}
                  disabled={!isConnected || actionLoading || !depositAmount || parseFloat(depositAmount) <= 0}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-bold px-6 py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-blue-500/50 disabled:transform-none disabled:shadow-none"
                >
                  {actionLoading ? 'Processing...' : 'Deposit to Vault'}
                </button>
              </div>
            </div>

            {/* Add Employee Section */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500/30 to-emerald-500/30 px-6 py-4 border-b border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Add Employee</h2>
                    <p className="text-sm text-gray-300">Onboard with annual salary</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Employee Wallet Address
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={employeeAddress}
                    onChange={(e) => setEmployeeAddress(e.target.value)}
                    disabled={!isConnected || actionLoading}
                    className="w-full bg-white/10 border-2 border-white/30 text-white rounded-xl px-4 py-3 font-mono text-sm focus:border-green-400 focus:ring-2 focus:ring-green-400/50 focus:outline-none placeholder-gray-500 transition-all disabled:bg-white/5 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Manager Wallet Address
                  </label>
                  <input
                    type="text"
                    placeholder="0x... (who approves escrow)"
                    value={managerAddress}
                    onChange={(e) => setManagerAddress(e.target.value)}
                    disabled={!isConnected || actionLoading}
                    className="w-full bg-white/10 border-2 border-white/30 text-white rounded-xl px-4 py-3 font-mono text-sm focus:border-green-400 focus:ring-2 focus:ring-green-400/50 focus:outline-none placeholder-gray-500 transition-all disabled:bg-white/5 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Annual Salary (PYUSD)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={annualSalary}
                      onChange={(e) => setAnnualSalary(e.target.value)}
                      className="w-full bg-white/10 border-2 border-white/30 text-white text-2xl rounded-xl px-4 py-4 focus:border-green-400 focus:ring-2 focus:ring-green-400/50 focus:outline-none placeholder-gray-500 font-mono transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                      PYUSD/yr
                    </span>
                  </div>
                </div>

                {annualSalary && parseFloat(annualSalary) > 0 && (
                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-400/30 animate-fadeIn">
                    <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Salary breakdown</p>
                    <div className="space-y-1 mb-3">
                      <p className="text-lg font-semibold text-white font-mono">
                        ≈ ${formatPrice(salaryEquiv.usd, 2)} <span className="text-sm text-gray-400">USD/year</span>
                      </p>
                      <p className="text-lg font-semibold text-white font-mono">
                        ≈ ₱{formatPrice(salaryEquiv.php, 2)} <span className="text-sm text-gray-400">PHP/year</span>
                      </p>
                    </div>
                    <div className="pt-3 border-t border-white/20">
                      <p className="text-xs text-gray-400">Hourly rate (2,080 hrs/year)</p>
                      <p className="text-lg font-semibold text-green-300 font-mono">
                        ~{formatPrice(parseFloat(annualSalary) / 2080, 4)} PYUSD/hr
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAddEmployee}
                  disabled={!isConnected || actionLoading || !employeeAddress || !annualSalary || !managerAddress}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-bold px-6 py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-green-500/50 disabled:transform-none disabled:shadow-none"
                >
                  {actionLoading ? 'Processing...' : (!employeeAddress || !annualSalary || !managerAddress ? 'Fill in all fields' : 'Add Employee')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

