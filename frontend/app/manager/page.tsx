'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import WalletButton from '@/components/WalletButton'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Lazy load heavy components
const GradientBlinds = lazy(() => import('@/components/GradientBlinds'))

/**
 * Person B: Manager Panel
 * TODO:
 * 1. List all employees with pending escrow
 * 2. Show hours worked this week
 * 3. Approve/reject individual or batch
 */

export default function ManagerPanel() {
  const [isPageLoading, setIsPageLoading] = useState(true)

  // Simulate page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // Mock data - replace with contract calls
  const employees = [
    { address: '0x1234...5678', name: 'Alice', hours: 40, escrow: 137.04 },
    { address: '0x8765...4321', name: 'Bob', hours: 40, escrow: 82.26 },
  ]

  const handleApprove = async (address: string) => {
    // TODO: Call contract approveEscrow() function
    console.log('Approving escrow for:', address)
  }

  const handleApproveAll = async () => {
    // TODO: Batch approve all employees
    console.log('Approving all')
  }

  if (isPageLoading) {
    return <LoadingSpinner message="Loading Manager Panel..." />
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
            <h1 className="text-4xl font-bold text-white">Manager Panel</h1>
            <WalletButton />
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-lg overflow-hidden border border-white/20">
            <div className="p-6 bg-gradient-to-r from-blue-500/50 to-purple-600/50 backdrop-blur-sm text-white flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Weekly Approvals</h2>
              <button
                onClick={handleApproveAll}
                className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all"
              >
                Approve All
              </button>
            </div>

            <div className="divide-y divide-white/10">
              {employees.map((emp, idx) => (
                <div key={idx} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex-1">
                    <p className="font-semibold text-lg text-white">{emp.name}</p>
                    <p className="text-gray-300">{emp.address}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Hours this week: {emp.hours} hours
                    </p>
                  </div>
                  
                  <div className="text-right mr-8">
                    <p className="text-sm text-gray-300">Escrow Amount</p>
                    <p className="text-2xl font-bold text-yellow-300">
                      {emp.escrow} PYUSD
                    </p>
                  </div>

                  <button
                    onClick={() => handleApprove(emp.address)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all"
                  >
                    Approve
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
