'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { useAccount } from 'wagmi'
import WalletButton from '@/components/WalletButton'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useContract } from '@/lib/hooks/useContract' // ✅ NOW USING REAL CONTRACT

// Lazy load heavy components
const GradientBlinds = lazy(() => import('@/components/GradientBlinds'))

interface EmployeeData {
  address: string
  name: string
  escrowBalance: number
  isActive: boolean
  isClockedIn: boolean
}

/**
 * Manager Panel - REAL CONTRACT INTEGRATION ✅
 * - List all employees with pending escrow
 * - Show real escrow balances from contract
 * - Approve individual or batch escrow releases
 */

export default function ManagerPanel() {
  const { address, isConnected } = useAccount()
  const { write, read } = useContract() // ✅ CONNECTED TO REAL CONTRACT
  
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [employees, setEmployees] = useState<EmployeeData[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Simulate page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

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

  // Fetch all employees from contract
  useEffect(() => {
    if (!isConnected || !address) {
      setEmployees([])
      setInitialLoad(false)
      return
    }

    const fetchEmployees = async () => {
      // Only show loading spinner on initial load
      if (initialLoad) {
        setLoadingEmployees(true)
      }
      
      try {
        // Check if read functions are available
        if (!read.getAllEmployees || !read.getEmployeeDetails) {
          console.log('Contract methods not ready yet')
          return
        }

        // ✅ FETCH FROM REAL CONTRACT
        const employeeAddresses = await read.getAllEmployees()
        
        // Fetch details for each employee
        const employeePromises = employeeAddresses.map(async (empAddress: string) => {
          const details = await read.getEmployeeDetails(empAddress)
          if (details) {
            return {
              address: empAddress,
              name: `${empAddress.slice(0, 6)}...${empAddress.slice(-4)}`,
              escrowBalance: parseFloat(details.escrowBalance),
              isActive: details.isActive,
              isClockedIn: details.isClockedIn,
            }
          }
          return null
        })

        const employeeData = (await Promise.all(employeePromises)).filter(Boolean) as EmployeeData[]
        setEmployees(employeeData)
        
        if (initialLoad) {
          setInitialLoad(false)
        }
      } catch (err) {
        console.error('Failed to fetch employees:', err)
        // Only show error if it's not a "not initialized" error
        if (err instanceof Error && !err.message.includes('not initialized')) {
          setError('Failed to load employee data from contract')
        }
      } finally {
        if (initialLoad) {
          setLoadingEmployees(false)
        }
      }
    }

    fetchEmployees()
    
    // Refresh every 10 seconds
    const interval = setInterval(fetchEmployees, 10000)
    return () => clearInterval(interval)
  }, [isConnected, address, read, initialLoad])

  const handleApprove = async (employeeAddress: string) => {
    if (!isConnected) {
      setError('Please connect your wallet first')
      return
    }

    // Check if contract is initialized
    if (!write.approveEscrow) {
      setError('Contract not initialized. Please wait and try again.')
      return
    }

    setActionLoading(true)
    setError(null)
    try {
      // ✅ REAL CONTRACT CALL
      await write.approveEscrow(employeeAddress)
      setSuccess(`Successfully approved escrow for ${employeeAddress.slice(0, 6)}...${employeeAddress.slice(-4)}`)
      
      // Refresh employee list
      const employeeAddresses = await read.getAllEmployees()
      const employeePromises = employeeAddresses.map(async (empAddress: string) => {
        const details = await read.getEmployeeDetails(empAddress)
        if (details) {
          return {
            address: empAddress,
            name: `${empAddress.slice(0, 6)}...${empAddress.slice(-4)}`,
            escrowBalance: parseFloat(details.escrowBalance),
            isActive: details.isActive,
            isClockedIn: details.isClockedIn,
          }
        }
        return null
      })
      const employeeData = (await Promise.all(employeePromises)).filter(Boolean) as EmployeeData[]
      setEmployees(employeeData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve escrow'
      console.error('Approve failed:', err)
      setError(errorMessage)
    } finally {
      setActionLoading(false)
    }
  }

  const handleApproveAll = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first')
      return
    }

    const employeesWithEscrow = employees.filter(emp => emp.escrowBalance > 0)
    
    if (employeesWithEscrow.length === 0) {
      setError('No employees with pending escrow')
      return
    }

    // Check if contract is initialized
    if (!write.batchApproveEscrow) {
      setError('Contract not initialized. Please wait and try again.')
      return
    }

    setActionLoading(true)
    setError(null)
    try {
      // ✅ REAL CONTRACT CALL - Batch approve
      const addresses = employeesWithEscrow.map(emp => emp.address)
      await write.batchApproveEscrow(addresses)
      setSuccess(`Successfully approved escrow for ${employeesWithEscrow.length} employees!`)
      
      // Refresh employee list
      const employeeAddresses = await read.getAllEmployees()
      const employeePromises = employeeAddresses.map(async (empAddress: string) => {
        const details = await read.getEmployeeDetails(empAddress)
        if (details) {
          return {
            address: empAddress,
            name: `${empAddress.slice(0, 6)}...${empAddress.slice(-4)}`,
            escrowBalance: parseFloat(details.escrowBalance),
            isActive: details.isActive,
            isClockedIn: details.isClockedIn,
          }
        }
        return null
      })
      const employeeData = (await Promise.all(employeePromises)).filter(Boolean) as EmployeeData[]
      setEmployees(employeeData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve all escrow'
      console.error('Batch approve failed:', err)
      setError(errorMessage)
    } finally {
      setActionLoading(false)
    }
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
                  <p className="text-yellow-200">Connect your wallet above to manage employee approvals</p>
                </div>
              </div>
            </div>
          )}

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
                  <p className="text-sm text-gray-400">Active Employees</p>
                  <p className="text-3xl font-bold text-white">
                    {loadingEmployees ? '...' : employees.filter(emp => emp.isActive).length}
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
                    {loadingEmployees ? '...' : employees.reduce((sum, emp) => sum + emp.escrowBalance, 0).toFixed(2)}
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
                      
                      {/* Status Badge */}
                      <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 rounded-lg px-3 py-2">
                        <svg className="w-4 h-4 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {emp.isClockedIn ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          )}
                        </svg>
                        <span className="text-sm font-semibold text-green-300">
                          {emp.isClockedIn ? 'Clocked In' : 'Clocked Out'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Escrow Amount Card */}
                    <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-400/30 min-w-[200px]">
                      <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Escrow Amount</p>
                      <p className="text-3xl font-bold text-yellow-300 font-mono">
                        {emp.escrowBalance.toFixed(4)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">PYUSD</p>
                    </div>

                    {/* Approve Button */}
                    <button
                      onClick={() => handleApprove(emp.address)}
                      disabled={actionLoading || emp.escrowBalance <= 0}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-green-500/50 disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2 min-w-[140px]"
                    >
                      {emp.escrowBalance <= 0 ? (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Approved
                        </>
                      ) : actionLoading ? (
                        'Processing...'
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Approve
                        </>
                      )}
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
