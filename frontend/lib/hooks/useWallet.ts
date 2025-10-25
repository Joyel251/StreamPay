'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Listen for account/chain changes when MetaMask exists
  useEffect(() => {
    if (typeof window === 'undefined') return

    const ethProvider = window.ethereum
    if (!ethProvider?.isMetaMask) return

    ethProvider.on('accountsChanged', handleAccountsChanged)
    ethProvider.on('chainChanged', handleChainChanged)

    return () => {
      ethProvider.removeListener('accountsChanged', handleAccountsChanged)
      ethProvider.removeListener('chainChanged', handleChainChanged)
    }
  }, [])

  const connectWallet = async () => {
    if (typeof window === 'undefined') {
      setError('Wallets are only available in the browser')
      return
    }

    const ethProvider = window.ethereum

    if (!ethProvider) {
      setError('MetaMask not detected. Install the extension to continue.')
      return
    }

    if (!ethProvider.isMetaMask) {
      setError('Detected wallet is not MetaMask. Please use MetaMask for this demo.')
      return
    }

    try {
      setIsConnecting(true)
      setError(null)

      const accounts: string[] = await ethProvider.request({
        method: 'eth_requestAccounts',
      })

      if (!accounts || accounts.length === 0) {
        setError('No accounts returned from MetaMask.')
        return
      }

      const provider = new ethers.BrowserProvider(ethProvider)
      
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()

      setAccount(address)
      setProvider(provider)
      setSigner(signer)
      setChainId(Number(network.chainId))
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
      console.error('Error connecting wallet:', err)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setProvider(null)
    setSigner(null)
    setChainId(null)
    setError(null)
  }

  const switchToSepolia = async () => {
    if (typeof window === 'undefined') return

    const ethProvider = window.ethereum
    if (!ethProvider?.isMetaMask) return

    try {
      await ethProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chainId in hex
      })
    } catch (err: any) {
      // Chain not added, add it
      if (err.code === 4902) {
        try {
          await ethProvider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia Testnet',
              nativeCurrency: {
                name: 'Sepolia ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io/'],
            }],
          })
        } catch (addError) {
          console.error('Error adding Sepolia:', addError)
        }
      }
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet()
    } else {
      setAccount(accounts[0])
    }
  }

  const handleChainChanged = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return {
    account,
    provider,
    signer,
    chainId,
    isConnecting,
    error,
    isConnected: !!account,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
  }
}
