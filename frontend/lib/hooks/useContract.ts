'use client'

import { useEffect, useState } from 'react'
import { BrowserProvider, Contract, parseUnits, formatUnits } from 'ethers'
import { useAccount } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contract'

/**
 * Custom hook for StreamingVault contract interactions
 * Wire this up after Person A deploys and provides ABI
 */

export function useContract() {
  const { address, isConnected } = useAccount()
  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isConnected || !window.ethereum || !CONTRACT_ADDRESS) {
      setContract(null)
      return
    }

    const initContract = async () => {
      try {
        const provider = new BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contractInstance = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
        setContract(contractInstance)
      } catch (err) {
        console.error('Failed to initialize contract:', err)
        setError('Failed to connect to contract')
      }
    }

    initContract()
  }, [isConnected, address])

  // Employer functions
  const deposit = async (amount: string) => {
    if (!contract) throw new Error('Contract not initialized')
    setLoading(true)
    setError(null)
    try {
      const tx = await contract.deposit(parseUnits(amount, 18))
      await tx.wait()
      return tx
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const addEmployee = async (employeeAddress: string, annualSalary: string) => {
    if (!contract) throw new Error('Contract not initialized')
    setLoading(true)
    setError(null)
    try {
      const tx = await contract.addEmployee(employeeAddress, parseUnits(annualSalary, 18))
      await tx.wait()
      return tx
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Employee functions
  const clockIn = async () => {
    if (!contract) throw new Error('Contract not initialized')
    setLoading(true)
    setError(null)
    try {
      const tx = await contract.clockIn()
      await tx.wait()
      return tx
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const clockOut = async () => {
    if (!contract) throw new Error('Contract not initialized')
    setLoading(true)
    setError(null)
    try {
      const tx = await contract.clockOut()
      await tx.wait()
      return tx
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const withdraw = async (amount: string, nonce: number, signature: string) => {
    if (!contract) throw new Error('Contract not initialized')
    setLoading(true)
    setError(null)
    try {
      // EVVM async nonce withdrawal
      const tx = await contract.withdraw(parseUnits(amount, 18), nonce, signature)
      await tx.wait()
      return tx
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Read functions
  const getEmployeeBalance = async (employeeAddress: string): Promise<string> => {
    if (!contract) throw new Error('Contract not initialized')
    try {
      const balance = await contract.getEmployeeBalance(employeeAddress)
      return formatUnits(balance, 18)
    } catch (err) {
      console.error('Failed to get balance:', err)
      return '0'
    }
  }

  const getEmployeeInfo = async (employeeAddress: string) => {
    if (!contract) throw new Error('Contract not initialized')
    try {
      const info = await contract.employees(employeeAddress)
      return {
        annualSalary: formatUnits(info.annualSalary, 18),
        isClockedIn: info.isClockedIn,
        lastClockIn: info.lastClockIn.toString(),
        totalEarned: formatUnits(info.totalEarned, 18),
      }
    } catch (err) {
      console.error('Failed to get employee info:', err)
      return null
    }
  }

  const getContractBalance = async (): Promise<string> => {
    if (!contract) throw new Error('Contract not initialized')
    try {
      const balance = await contract.getContractBalance()
      return formatUnits(balance, 18)
    } catch (err) {
      console.error('Failed to get contract balance:', err)
      return '0'
    }
  }

  return {
    contract,
    loading,
    error,
    // Employer write functions
    write: {
      deposit,
      addEmployee,
      clockIn,
      clockOut,
      withdraw,
    },
    // Read functions
    read: {
      getEmployeeBalance,
      getEmployeeInfo,
      getContractBalance,
    },
  }
}

