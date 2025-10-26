/**
 * 🚀 StreamPay Contract Configuration
 * Connected to Sepolia Testnet with Real PYUSD!
 */

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xc63d7425d5f3960EdAB8A28AdF2468c89d3BBE3c'
export const PYUSD_ADDRESS = process.env.NEXT_PUBLIC_PYUSD_ADDRESS || '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9'
export const SEPOLIA_CHAIN_ID = 11155111

// StreamingVault ABI - Complete contract interface
export const CONTRACT_ABI = [
  { inputs: [{ internalType: 'address', name: '_pyusdToken', type: 'address' }], stateMutability: 'nonpayable', type: 'constructor' },
  { anonymous: false, inputs: [{ indexed: true, internalType: 'address', name: 'employee', type: 'address' }, { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' }], name: 'ClockedIn', type: 'event' },
  { anonymous: false, inputs: [{ indexed: true, internalType: 'address', name: 'employee', type: 'address' }, { indexed: false, internalType: 'uint256', name: 'earned', type: 'uint256' }, { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' }], name: 'ClockedOut', type: 'event' },
  { anonymous: false, inputs: [{ indexed: true, internalType: 'address', name: 'employer', type: 'address' }, { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' }], name: 'Deposited', type: 'event' },
  { anonymous: false, inputs: [{ indexed: true, internalType: 'address', name: 'by', type: 'address' }], name: 'EmergencyPaused', type: 'event' },
  { anonymous: false, inputs: [{ indexed: true, internalType: 'address', name: 'by', type: 'address' }], name: 'EmergencyUnpaused', type: 'event' },
  { anonymous: false, inputs: [{ indexed: true, internalType: 'address', name: 'employee', type: 'address' }, { indexed: false, internalType: 'uint256', name: 'salaryPerSecond', type: 'uint256' }, { indexed: true, internalType: 'address', name: 'manager', type: 'address' }], name: 'EmployeeAdded', type: 'event' },
  { anonymous: false, inputs: [{ indexed: true, internalType: 'address', name: 'employee', type: 'address' }], name: 'EmployeeRemoved', type: 'event' },
  { anonymous: false, inputs: [{ indexed: true, internalType: 'address', name: 'employee', type: 'address' }, { indexed: false, internalType: 'uint256', name: 'newSalaryPerSecond', type: 'uint256' }], name: 'EmployeeUpdated', type: 'event' },
  { anonymous: false, inputs: [{ indexed: true, internalType: 'address', name: 'employee', type: 'address' }, { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' }, { indexed: true, internalType: 'address', name: 'approver', type: 'address' }], name: 'EscrowReleased', type: 'event' },
  { anonymous: false, inputs: [{ indexed: true, internalType: 'address', name: 'employee', type: 'address' }, { indexed: true, internalType: 'address', name: 'oldManager', type: 'address' }, { indexed: true, internalType: 'address', name: 'newManager', type: 'address' }], name: 'ManagerChanged', type: 'event' },
  { anonymous: false, inputs: [{ indexed: true, internalType: 'address', name: 'employee', type: 'address' }, { indexed: true, internalType: 'uint256', name: 'nonce', type: 'uint256' }, { indexed: false, internalType: 'bytes32', name: 'hash', type: 'bytes32' }], name: 'NoncePreSigned', type: 'event' },
  { anonymous: false, inputs: [{ indexed: true, internalType: 'address', name: 'employee', type: 'address' }, { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' }, { indexed: false, internalType: 'uint256', name: 'nonce', type: 'uint256' }], name: 'Withdrawn', type: 'event' },
  { inputs: [], name: 'AVAILABLE_PERCENTAGE', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'ESCROW_PERCENTAGE', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'SECONDS_PER_YEAR', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'address', name: 'employee', type: 'address' }, { internalType: 'uint256', name: 'annualSalary', type: 'uint256' }, { internalType: 'address', name: '_manager', type: 'address' }], name: 'addEmployee', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ internalType: 'address', name: 'employee', type: 'address' }], name: 'approveEscrow', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ internalType: 'address[]', name: 'employeeAddresses', type: 'address[]' }], name: 'batchApproveEscrow', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ internalType: 'address', name: 'employee', type: 'address' }, { internalType: 'address', name: 'newManager', type: 'address' }], name: 'changeManager', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [], name: 'clockIn', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [], name: 'clockOut', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }], name: 'deposit', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], name: 'employeeList', outputs: [{ internalType: 'address', name: '', type: 'address' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'address', name: '', type: 'address' }], name: 'employees', outputs: [{ internalType: 'uint256', name: 'salaryPerSecond', type: 'uint256' }, { internalType: 'uint256', name: 'lastClockIn', type: 'uint256' }, { internalType: 'uint256', name: 'lastClockOut', type: 'uint256' }, { internalType: 'uint256', name: 'accruedBalance', type: 'uint256' }, { internalType: 'uint256', name: 'escrowBalance', type: 'uint256' }, { internalType: 'uint256', name: 'totalWithdrawn', type: 'uint256' }, { internalType: 'bool', name: 'isActive', type: 'bool' }, { internalType: 'bool', name: 'isClockedIn', type: 'bool' }, { internalType: 'address', name: 'managerAddress', type: 'address' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'getAllEmployees', outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'address', name: 'employee', type: 'address' }], name: 'getAvailableBalance', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'getContractBalance', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'address', name: 'employee', type: 'address' }], name: 'getEmployeeDetails', outputs: [{ internalType: 'uint256', name: 'salaryPerSecond', type: 'uint256' }, { internalType: 'uint256', name: 'annualSalary', type: 'uint256' }, { internalType: 'uint256', name: 'availableBalance', type: 'uint256' }, { internalType: 'uint256', name: 'escrowBalance', type: 'uint256' }, { internalType: 'uint256', name: 'totalWithdrawn', type: 'uint256' }, { internalType: 'bool', name: 'isActive', type: 'bool' }, { internalType: 'bool', name: 'isClockedIn', type: 'bool' }, { internalType: 'address', name: 'managerAddress', type: 'address' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'address', name: 'employee', type: 'address' }], name: 'getTotalAccruedBalance', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'address', name: 'employee', type: 'address' }, { internalType: 'uint256', name: 'nonce', type: 'uint256' }], name: 'isNonceUsed', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'manager', outputs: [{ internalType: 'address', name: '', type: 'address' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'owner', outputs: [{ internalType: 'address', name: '', type: 'address' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'pause', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [], name: 'paused', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'uint256[]', name: 'nonces', type: 'uint256[]' }, { internalType: 'bytes32[]', name: 'hashes', type: 'bytes32[]' }], name: 'preSignNonces', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [], name: 'pyusdToken', outputs: [{ internalType: 'contract IERC20', name: '', type: 'address' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'address', name: 'employee', type: 'address' }], name: 'removeEmployee', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [], name: 'unpause', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ internalType: 'address', name: 'employee', type: 'address' }, { internalType: 'uint256', name: 'newAnnualSalary', type: 'uint256' }], name: 'updateEmployeeSalary', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }], name: 'withdraw', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }, { internalType: 'uint256', name: 'nonce', type: 'uint256' }], name: 'withdrawWithNonce', outputs: [], stateMutability: 'nonpayable', type: 'function' },
] as const

// PYUSD Token ABI (ERC20 standard)
export const PYUSD_ABI = [
  { inputs: [{ internalType: 'address', name: 'spender', type: 'address' }, { internalType: 'uint256', name: 'amount', type: 'uint256' }], name: 'approve', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ internalType: 'address', name: 'account', type: 'address' }], name: 'balanceOf', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'decimals', outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'symbol', outputs: [{ internalType: 'string', name: '', type: 'string' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'name', outputs: [{ internalType: 'string', name: '', type: 'string' }], stateMutability: 'view', type: 'function' },
] as const
