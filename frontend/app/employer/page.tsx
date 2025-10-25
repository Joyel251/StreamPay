'use client'

import { useState } from 'react'
import WalletButton from '@/components/WalletButton'
import { usePYUSDtoPHP, usePythPrice, formatPrice } from '@/lib/pyth'

/**
 * Person B: Employer Dashboard
 * Shows live Pyth exchange rates when depositing PYUSD and adding employees
 */

export default function EmployerDashboard() {
  const [depositAmount, setDepositAmount] = useState('')
  const [employeeAddress, setEmployeeAddress] = useState('')
  const [annualSalary, setAnnualSalary] = useState('')

  // Fetch live Pyth price feeds (updates every 5 seconds)
  const { priceData: pyusdUsdData, loading: pyusdLoading } = usePythPrice('PYUSD/USD')
  const { rate: pyusdPhpRate, loading: phpLoading } = usePYUSDtoPHP()

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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Employer Dashboard</h1>
          <WalletButton />
        </div>

        {/* Live Exchange Rates */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Live Exchange Rates (Pyth Network)</h3>
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
          <p className="text-xs text-gray-500 mt-2">Updates every 5 seconds • Powered by Pyth</p>
        </div>

        {/* Deposit Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Deposit PYUSD</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="Amount (PYUSD)"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="flex-1 border rounded px-4 py-2"
              />
              <button
                onClick={handleDeposit}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Deposit
              </button>
            </div>
            {depositAmount && parseFloat(depositAmount) > 0 && (
              <div className="bg-gray-50 p-3 rounded text-sm">
                <p className="text-gray-600">Equivalent amounts:</p>
                <p className="font-mono">≈ ${formatPrice(depositEquiv.usd, 2)} USD</p>
                <p className="font-mono">≈ ₱{formatPrice(depositEquiv.php, 2)} PHP</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Employee Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Add Employee</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Employee Wallet Address (0x...)"
              value={employeeAddress}
              onChange={(e) => setEmployeeAddress(e.target.value)}
              className="w-full border rounded px-4 py-2 font-mono text-sm"
            />
            <div>
              <input
                type="number"
                placeholder="Annual Salary (PYUSD)"
                value={annualSalary}
                onChange={(e) => setAnnualSalary(e.target.value)}
                className="w-full border rounded px-4 py-2"
              />
              {annualSalary && parseFloat(annualSalary) > 0 && (
                <div className="bg-gray-50 p-3 rounded text-sm mt-2">
                  <p className="text-gray-600 mb-1">Annual salary equivalent:</p>
                  <p className="font-mono">≈ ${formatPrice(salaryEquiv.usd, 2)} USD/year</p>
                  <p className="font-mono">≈ ₱{formatPrice(salaryEquiv.php, 2)} PHP/year</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Hourly rate: ~{formatPrice(parseFloat(annualSalary) / 2080, 4)} PYUSD/hour
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleAddEmployee}
              disabled={!employeeAddress || !annualSalary}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Add Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

