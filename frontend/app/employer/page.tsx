'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import WalletButton from '@/components/WalletButton'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { usePYUSDtoPHP, usePythPrice, formatPrice } from '@/lib/pyth'

// Lazy load heavy components
const GradientBlinds = lazy(() => import('@/components/GradientBlinds'))

/**
 * Person B: Employer Dashboard
 * Shows live Pyth exchange rates when depositing PYUSD and adding employees
 */

export default function EmployerDashboard() {
  const [depositAmount, setDepositAmount] = useState('')
  const [employeeAddress, setEmployeeAddress] = useState('')
  const [annualSalary, setAnnualSalary] = useState('')
  const [isPageLoading, setIsPageLoading] = useState(true)

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

  const handleDeposit = async () => {
    // TODO: Call contract deposit() function with PYUSD approval
    console.log('Depositing:', depositAmount, 'PYUSD')
  }

  const handleAddEmployee = async () => {
    // TODO: Call contract addEmployee() function
    // Annual salary in PYUSD -> convert to per-second rate on-chain
    console.log('Adding employee:', employeeAddress, annualSalary)
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
        <div className="max-w-6xl mx-auto p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white">Employer Dashboard</h1>
            <WalletButton />
          </div>

          {/* Live Exchange Rates */}
          <div className="bg-blue-500/20 backdrop-blur-lg border border-blue-400/30 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-100 mb-2">Live Exchange Rates (Pyth Network)</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-300">PYUSD/USD:</span>{' '}
                <span className="font-mono font-semibold text-white">
                  {pyusdLoading ? 'Loading...' : pyusdUsdData ? formatPrice(pyusdUsdData.price, 4) : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-300">PYUSD/PHP:</span>{' '}
                <span className="font-mono font-semibold text-white">
                  {phpLoading ? 'Loading...' : formatPrice(pyusdPhpRate, 2)}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Updates every 5 seconds • Powered by Pyth</p>
          </div>

          {/* Deposit Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-lg p-6 mb-6 border border-white/20">
            <h2 className="text-2xl font-semibold mb-4 text-white">Deposit PYUSD</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="number"
                  placeholder="Amount (PYUSD)"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="flex-1 bg-white/10 border-2 border-white/30 text-white rounded-lg px-4 py-2 focus:border-blue-400 focus:outline-none placeholder-gray-400"
                />
                <button
                  onClick={handleDeposit}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all"
                >
                  Deposit
                </button>
              </div>
              {depositAmount && parseFloat(depositAmount) > 0 && (
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg text-sm border border-white/20">
                  <p className="text-gray-300">Equivalent amounts:</p>
                  <p className="font-mono text-white">≈ ${formatPrice(depositEquiv.usd, 2)} USD</p>
                  <p className="font-mono text-white">≈ ₱{formatPrice(depositEquiv.php, 2)} PHP</p>
                </div>
              )}
            </div>
          </div>

          {/* Add Employee Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-lg p-6 border border-white/20">
            <h2 className="text-2xl font-semibold mb-4 text-white">Add Employee</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Employee Wallet Address (0x...)"
                value={employeeAddress}
                onChange={(e) => setEmployeeAddress(e.target.value)}
                className="w-full bg-white/10 border-2 border-white/30 text-white rounded-lg px-4 py-2 font-mono text-sm focus:border-blue-400 focus:outline-none placeholder-gray-400"
              />
              <div>
                <input
                  type="number"
                  placeholder="Annual Salary (PYUSD)"
                  value={annualSalary}
                  onChange={(e) => setAnnualSalary(e.target.value)}
                  className="w-full bg-white/10 border-2 border-white/30 text-white rounded-lg px-4 py-2 focus:border-blue-400 focus:outline-none placeholder-gray-400"
                />
                {annualSalary && parseFloat(annualSalary) > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg text-sm mt-2 border border-white/20">
                    <p className="text-gray-300 mb-1">Annual salary equivalent:</p>
                    <p className="font-mono text-white">≈ ${formatPrice(salaryEquiv.usd, 2)} USD/year</p>
                    <p className="font-mono text-white">≈ ₱{formatPrice(salaryEquiv.php, 2)} PHP/year</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Hourly rate: ~{formatPrice(parseFloat(annualSalary) / 2080, 4)} PYUSD/hour
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={handleAddEmployee}
                disabled={!employeeAddress || !annualSalary}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transform hover:scale-105 transition-all"
              >
                Add Employee
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

