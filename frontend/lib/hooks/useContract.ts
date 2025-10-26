'use client'

import { useEffect, useState } from 'react'
import { BrowserProvider, Contract, parseUnits, formatUnits } from 'ethers'
import { useAccount } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI, PYUSD_ADDRESS, PYUSD_ABI } from '../contract'

const SEPOLIA_CHAIN_ID = '0xaa36a7'
const DEFAULT_SEPOLIA_RPC = 'https://rpc.sepolia.org'

type ProviderRpcError = {
  message: string
  code: number
  data?: unknown
}

const isProviderRpcError = (error: unknown): error is ProviderRpcError => {
  if (typeof error !== 'object' || error === null) {
    return false
  }
  const candidate = error as { code?: unknown; message?: unknown }
  return typeof candidate.code === 'number' && typeof candidate.message === 'string'
}

/**
 * 🚀 Custom hook for StreamingVault contract interactions
 * NOW CONNECTED TO REAL DEPLOYED CONTRACT!
 * PYUSD uses 6 decimals (not 18)
 */

export function useContract() {
  const { address, isConnected } = useAccount()
  const [contract, setContract] = useState<Contract | null>(null)
  const [pyusdContract, setPyusdContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Reset state when disconnected
    if (!isConnected || !window.ethereum || !CONTRACT_ADDRESS) {
      console.log('⚠️ Resetting contract state - wallet disconnected or missing config')
      setContract(null)
      setPyusdContract(null)
      setIsInitialized(false)
      setError(null)
      return
    }

    // Reset initialization state when address changes
    setIsInitialized(false)
    setError(null)

    const initContract = async () => {
      try {
        console.log('🔄 Initializing contract for address:', address)
        
        // Small delay to ensure wallet is fully ready
        await new Promise(resolve => setTimeout(resolve, 500))

        let provider = new BrowserProvider(window.ethereum)

        const currentChainId = await provider.send('eth_chainId', [])
        console.log('🌐 Current chain:', currentChainId)

        if (currentChainId !== SEPOLIA_CHAIN_ID) {
          console.warn(`⚠️ Wallet on wrong network (${currentChainId}). Requesting Sepolia (${SEPOLIA_CHAIN_ID})`)
          try {
            await provider.send('wallet_switchEthereumChain', [{ chainId: SEPOLIA_CHAIN_ID }])
            console.log('🔁 Switched wallet to Sepolia network')
            await new Promise(resolve => setTimeout(resolve, 500))
            provider = new BrowserProvider(window.ethereum)
          } catch (switchError: unknown) {
            console.error('❌ Failed to switch network:', switchError)
            if (isProviderRpcError(switchError) && switchError.code === 4902) {
              try {
                const rpcUrls: string[] = []
                if (process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL) {
                  rpcUrls.push(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL)
                }
                rpcUrls.push(DEFAULT_SEPOLIA_RPC)

                await provider.send('wallet_addEthereumChain', [{
                  chainId: SEPOLIA_CHAIN_ID,
                  chainName: 'Sepolia Test Network',
                  nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
                  rpcUrls,
                  blockExplorerUrls: ['https://sepolia.etherscan.io'],
                }])

                console.log('🆕 Added Sepolia network to wallet')
                await new Promise(resolve => setTimeout(resolve, 500))
                provider = new BrowserProvider(window.ethereum)
              } catch (addError: unknown) {
                console.error('❌ Failed to add Sepolia network:', addError)
                setContract(null)
                setPyusdContract(null)
                setError('Please add the Sepolia test network to your wallet and try again.')
                return
              }
            } else {
              setContract(null)
              setPyusdContract(null)
              setError('Please switch your wallet to the Sepolia test network to use StreamPay.')
              return
            }
          }
        }

        const signer = await provider.getSigner()
        
        // Verify we got the correct signer address
        const signerAddress = await signer.getAddress()
        console.log('👤 Signer address:', signerAddress)
        
        if (signerAddress.toLowerCase() !== address?.toLowerCase()) {
          console.warn('⚠️ Signer address mismatch, retrying...')
          // Retry once more
          await new Promise(resolve => setTimeout(resolve, 500))
          const newSigner = await provider.getSigner()
          const newSignerAddress = await newSigner.getAddress()
          console.log('👤 Retry signer address:', newSignerAddress)
        }
        
        const contractInstance = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
        const pyusdInstance = new Contract(PYUSD_ADDRESS, PYUSD_ABI, signer)
        
        setContract(contractInstance)
        setPyusdContract(pyusdInstance)
        setIsInitialized(true)
        console.log('✅ Contract initialized successfully for', signerAddress)
      } catch (err) {
        console.error('❌ Failed to initialize contract:', err)
        setError('Failed to connect to contract. Please refresh and try again.')
        setIsInitialized(false)
      }
    }

    initContract()
  }, [isConnected, address])

  // Employer functions
  const approvePYUSD = async (amount: string) => {
    if (!pyusdContract) throw new Error('PYUSD contract not initialized')
    setLoading(true)
    setError(null)
    try {
      const tx = await pyusdContract.approve(CONTRACT_ADDRESS, parseUnits(amount, 6))
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

  const deposit = async (amount: string) => {
    if (!contract) throw new Error('Contract not initialized')
    setLoading(true)
    setError(null)
    try {
      const tx = await contract.deposit(parseUnits(amount, 6)) // PYUSD = 6 decimals
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

  const getPYUSDBalance = async (walletAddress: string) => {
    if (!pyusdContract) throw new Error('PYUSD contract not initialized')
    try {
      const balance = await pyusdContract.balanceOf(walletAddress)
      return formatUnits(balance, 6)
    } catch (err) {
      console.error('Failed to get PYUSD balance:', err)
      return '0'
    }
  }

  const getVaultBalance = async () => {
    if (!contract) throw new Error('Contract not initialized')
    try {
      const balance = await contract.getContractBalance()
      return formatUnits(balance, 6)
    } catch (err) {
      console.error('Failed to get vault balance:', err)
      return '0'
    }
  }

  const addEmployee = async (employeeAddress: string, annualSalary: string, managerAddress: string) => {
    if (!contract) throw new Error('Contract not initialized')
    setLoading(true)
    setError(null)
    try {
      const tx = await contract.addEmployee(employeeAddress, parseUnits(annualSalary, 6), managerAddress)
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

  const withdraw = async (amount: string) => {
    if (!contract) throw new Error('Contract not initialized')
    setLoading(true)
    setError(null)
    try {
      // Simple withdraw (not using EVVM nonces for now)
      const tx = await contract.withdraw(parseUnits(amount, 6)) // PYUSD = 6 decimals
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
  const getAvailableBalance = async (employeeAddress: string): Promise<string> => {
    if (!contract) throw new Error('Contract not initialized')
    try {
      const balance = await contract.getAvailableBalance(employeeAddress)
      return formatUnits(balance, 6) // PYUSD = 6 decimals
    } catch (err) {
      console.error('Failed to get available balance:', err)
      return '0'
    }
  }

  const getEmployeeDetails = async (employeeAddress: string) => {
    if (!contract) throw new Error('Contract not initialized')
    try {
      const details = await contract.getEmployeeDetails(employeeAddress)
      return {
        salaryPerSecond: formatUnits(details.salaryPerSecond, 6),
        annualSalary: formatUnits(details.annualSalary, 6),
        availableBalance: formatUnits(details.availableBalance, 6),
        escrowBalance: formatUnits(details.escrowBalance, 6),
        totalWithdrawn: formatUnits(details.totalWithdrawn, 6),
        isActive: details.isActive,
        isClockedIn: details.isClockedIn,
        managerAddress: details.managerAddress,
      }
    } catch (err) {
      console.error('Failed to get employee details:', err)
      return null
    }
  }

  const getContractBalance = async (): Promise<string> => {
    if (!contract) throw new Error('Contract not initialized')
    try {
      const balance = await contract.getContractBalance()
      return formatUnits(balance, 6) // PYUSD = 6 decimals
    } catch (err) {
      console.error('Failed to get contract balance:', err)
      return '0'
    }
  }

  const getAllEmployees = async (): Promise<string[]> => {
    if (!contract) throw new Error('Contract not initialized')
    try {
      const employees = await contract.getAllEmployees()
      return employees
    } catch (err) {
      console.error('Failed to get all employees:', err)
      return []
    }
  }

  const approveEscrow = async (employeeAddress: string) => {
    if (!contract) throw new Error('Contract not initialized')
    setLoading(true)
    setError(null)
    try {
      const tx = await contract.approveEscrow(employeeAddress)
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

  const batchApproveEscrow = async (employeeAddresses: string[]) => {
    if (!contract) throw new Error('Contract not initialized')
    setLoading(true)
    setError(null)
    try {
      const tx = await contract.batchApproveEscrow(employeeAddresses)
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

  return {
    contract,
    loading,
    error,
    isInitialized,
    // Employer write functions
    write: {
      approvePYUSD,
      deposit,
      addEmployee,
      clockIn,
      clockOut,
      withdraw,
      approveEscrow,
      batchApproveEscrow,
    },
    // Read functions
    read: {
      getAvailableBalance,
      getEmployeeDetails,
      getContractBalance,
      getAllEmployees,
      getPYUSDBalance,
      getVaultBalance,
    },
  }
}

