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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
            <div>
              <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
                Manager Panel
              </h1>
              <p className="text-gray-300 text-lg">
                Review & approve weekly escrow releases for your team
              </p>
            </div>
            <WalletButton />
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-500/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Employees</p>
                  <p className="text-3xl font-bold text-white">{employees.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-teal-500/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-500/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Hours</p>
                  <p className="text-3xl font-bold text-white">
                    {employees.reduce((sum, emp) => sum + emp.hours, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-red-500/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Escrow</p>
                  <p className="text-3xl font-bold text-white">
                    {employees.reduce((sum, emp) => sum + emp.escrow, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Approval Section */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20">
            <div className="bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-red-500/30 px-6 py-5 border-b border-white/20">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Weekly Approvals</h2>
                  <p className="text-sm text-gray-300">Review and approve employee escrow releases</p>
                </div>
                <button
                  onClick={handleApproveAll}
                  className="bg-white text-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transform hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-white/50 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Approve All ({employees.length})
                </button>
              </div>
            </div>

            <div className="divide-y divide-white/10">
              {employees.map((emp, idx) => (
                <div 
                  key={idx} 
                  className="p-6 hover:bg-white/5 transition-all duration-200 group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Employee Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          {emp.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-xl text-white group-hover:text-blue-300 transition-colors">
                            {emp.name}
                          </p>
                          <p className="text-sm text-gray-400 font-mono">{emp.address}</p>
                        </div>
                      </div>
                      
                      {/* Hours Badge */}
                      <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 rounded-lg px-3 py-2">
                        <svg className="w-4 h-4 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-semibold text-green-300">
                          {emp.hours} hours this week
                        </span>
                      </div>
                    </div>
                    
                    {/* Escrow Amount Card */}
                    <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-400/30 min-w-[200px]">
                      <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Escrow Amount</p>
                      <p className="text-3xl font-bold text-yellow-300 font-mono">
                        {emp.escrow.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">PYUSD</p>
                    </div>

                    {/* Approve Button */}
                    <button
                      onClick={() => handleApprove(emp.address)}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transform hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-green-500/50 flex items-center justify-center gap-2 min-w-[140px]"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State (if no employees) */}
            {employees.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-lg">No employees pending approval</p>
                <p className="text-gray-500 text-sm mt-2">Check back later for weekly escrow approvals</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
