/**
 * Person B: Contract interaction utilities
 * Import ABI from artifacts after Person A deploys
 */

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ''

// Person A: Copy ABI here after deployment
export const CONTRACT_ABI = [
  // Paste ABI from artifacts/contracts/StreamingVault.sol/StreamingVault.json
]

export const SEPOLIA_CHAIN_ID = 11155111
