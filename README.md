# StreamPay

## Real-Time Wage Streaming Protocol

StreamPay is a blockchain-based payroll system that enables per-second wage streaming, allowing employees to access their earned wages in real-time rather than waiting for traditional pay cycles. Built on Ethereum using PYUSD stablecoin, the platform provides instant withdrawals, automated escrow management, and batch pre-approval capabilities through EVVM's async nonce system.

**Live Demo:** https://streampay-kappa.vercel.app/

## The Problem

Traditional payroll systems operate on fixed schedules—biweekly or monthly payment cycles that create significant cash flow challenges for workers. When employees have already worked multiple days but need money before the scheduled payday, they have no recourse. This structural delay particularly impacts the 78% of workers who live paycheck to paycheck, forcing them to rely on expensive payday loans or overdraft fees. For global workers, especially in regions like the Philippines where hourly wages are common, the inability to access earned money creates unnecessary financial stress.

## Our Solution

StreamPay fundamentally reimagines payroll by streaming wages per second. From the moment an employee clocks in, their balance begins accruing in real-time at their calculated per-second rate. Rather than accumulating wages in a company's accounting system, earnings flow continuously into a smart contract where employees maintain complete visibility and control.

The system implements a 70/30 split mechanism: 70% of accrued wages become immediately withdrawable, while 30% enters an escrow that requires manager approval. This balance protects both parties—employees get rapid access to most earnings while employers maintain oversight for fraud prevention and dispute resolution.

Through integration with EVVM's async nonce technology, employees can pre-sign up to 52 withdrawal transactions (representing weekly withdrawals for an entire year) in a single session. This eliminates the need for repeated wallet signatures and enables truly automated, gasless payroll operations.

## Key Features

### Real-Time Wage Accrual
Salaries are calculated per-second based on annual compensation. A $50,000 annual salary translates to approximately $1.59 per second. The smart contract continuously tracks time worked and updates balances in real-time, visible through the dashboard.

### Instant Withdrawals
Employees can withdraw their available balance (70% of accrued wages) at any time without waiting for approval or scheduled payment dates. Transactions complete in seconds, transferring PYUSD stablecoins directly to employee wallets.

### Escrow System
The remaining 30% of wages enters an escrow account tied to each employee. Managers can batch-approve escrow releases, providing a reconciliation layer for payroll verification while maintaining employee access to the majority of earnings.

### EVVM Async Nonces
Leveraging EVVM's async nonce framework, employees pre-authorize multiple future withdrawals with a single signature. The system supports up to 52 nonces per batch, enabling weekly withdrawals for an entire year without additional signing. Each nonce is single-use and tracked on-chain to prevent replay attacks.

### Multi-Currency Display
Integration with Pyth Network price feeds provides real-time exchange rates for PYUSD/USD and USD/PHP pairs. Employees can view their earnings in PYUSD, US Dollars, or Philippine Pesos with live conversion rates updating every five seconds.

### Clock In/Out Tracking
A time-tracking interface allows employees to start and stop their wage streams. Only time between clock-in and clock-out events generates earnings, providing accurate per-second calculation of work performed.

## Technical Architecture

### Smart Contract Layer
The core protocol is implemented in Solidity 0.8.20 and deployed on Ethereum Sepolia testnet. The StreamingVault contract manages employee records, salary calculations, balance tracking, and withdrawal processing. All wage transfers use the official PYUSD ERC-20 token contract deployed by PayPal on Sepolia.

The contract maintains two primary data structures: a mapping of employee addresses to their complete employment records (salary rate, accrued balance, escrow balance, clock-in status), and an array tracking all registered employees for enumeration. Time-based calculations use block timestamps to compute per-second accrual with precision.

EVVM async nonces are stored in a nested mapping structure that tracks both used nonces and pre-signed transaction hashes for each employee. The withdrawal function checks nonce validity before processing transfers, marking used nonces to prevent reuse.

### Frontend Application
Built with Next.js 14 and TypeScript, the frontend provides separate dashboards for employees, employers, and managers. Real-time balance updates occur through polling intervals that query the smart contract every 5-10 seconds depending on clock-in status.

The application uses wagmi and viem for Web3 interactions, ConnectKit for wallet connection management, and custom React hooks that abstract contract read/write operations. The pyth.ts module handles direct HTTP calls to Hermes API endpoints for price feed data.

### Price Feed Integration
Pyth Network integration occurs entirely client-side through REST API calls to the Hermes endpoint. The system fetches two price feeds: PYUSD/USD and USD/PHP. Cross-rate calculation multiplies these values to derive PYUSD/PHP rates. Custom React hooks manage automatic refresh intervals and error handling for price data.

## Technology Stack

### Blockchain & Smart Contracts
- Solidity 0.8.20 for contract development
- Hardhat for compilation, testing, and deployment
- OpenZeppelin libraries for security patterns
- Ethers.js v6 for contract interactions

### Stablecoin Integration
- PYUSD official Sepolia testnet contract
- ERC-20 standard interface implementation
- 6-decimal precision handling

### EVVM Async Nonces
- Pre-signature batching system
- On-chain nonce tracking and validation
- Single-use enforcement with mapping-based storage

### Price Feeds
- Pyth Network Hermes HTTP API
- Real-time price data for PYUSD/USD and USD/PHP
- 5-second refresh intervals

### Frontend Framework
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- React hooks for state management

### Web3 Libraries
- wagmi v2 for React hooks
- viem v2 for Ethereum interactions
- ConnectKit for wallet connection
- MetaMask for transaction signing

## Deployed Contracts

### Ethereum Sepolia Testnet

StreamingVault Contract
- Address: 0xc63d7425d5f3960EdAB8A28AdF2468c89d3BBE3c
- Network: Sepolia (Chain ID: 11155111)
- Verification: Verified on Etherscan
- View Contract: https://sepolia.etherscan.io/address/0xc63d7425d5f3960EdAB8A28AdF2468c89d3BBE3c

PYUSD Token
- Address: 0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9
- Type: Official PayPal USD Testnet Token
- Decimals: 6
- View Token: https://sepolia.etherscan.io/token/0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9

## Testing & Validation

The smart contract includes a comprehensive test suite with 45 test cases covering deployment verification, deposit operations, employee management, clock tracking, real-time balance calculations, withdrawal mechanics, async nonce functionality, escrow approvals, security controls, and edge case handling. All tests execute in approximately 2 seconds on a local Hardhat network.

Manual testing was performed on Sepolia testnet using both Etherscan's contract interface and custom Hardhat scripts. Test scenarios included depositing PYUSD, adding employees, clocking in/out, observing real-time balance increases, executing withdrawals, pre-signing nonces, and approving escrow releases. All core functionality operated as designed with successful on-chain transactions.

## Use Cases

### Hourly Workers in Emerging Markets
Workers in the Philippines, India, and other regions who earn hourly wages can access daily earnings instead of waiting weeks for payment. This immediate liquidity eliminates the need for expensive short-term loans or borrowing from family members.

### Gig Economy Platforms
Freelance marketplaces and gig platforms can integrate StreamPay to provide instant payment to workers upon task completion. Rather than holding funds for 7-14 days, platforms can enable per-second streaming during active work periods.

### Remote Work Arrangements
Companies employing international remote workers benefit from transparent, automated payroll that handles multi-currency considerations through real-time exchange rates. Employees worldwide receive PYUSD that they can convert to local currency as needed.

### Payroll Automation
Businesses reduce administrative overhead by eliminating manual payroll runs. Once employees are configured with annual salaries, the system handles all calculations, accruals, and transfers automatically based on time worked.

## Project Team

Person A: Smart Contract Development
Responsible for Solidity contract implementation, EVVM async nonce integration, PYUSD token handling, testing infrastructure, and Sepolia deployment.

Person B: Frontend Development  
Responsible for Next.js application, Web3 wallet integration, Pyth price feed implementation, user interface design, and dashboard functionality.

## Prize Track Eligibility

### EVVM Integration
StreamPay implements EVVM's async nonce system to enable batch pre-approval of withdrawals. Employees can pre-sign up to 52 nonces in a single transaction, representing weekly withdrawals for an entire year. The smart contract validates nonce uniqueness and marks each as used upon withdrawal execution. This eliminates repeated wallet signatures and enables gasless, automated payroll operations. Implementation includes on-chain nonce tracking, pre-signed hash storage, and withdrawal validation logic.

### PYUSD Integration
The protocol uses the official PYUSD Sepolia testnet contract as its payment token. All wage transfers occur in PYUSD, providing stable value pegged to the US Dollar. The smart contract interacts with PYUSD through standard ERC-20 functions including transferFrom for employer deposits and transfer for employee withdrawals. Proper decimal handling accounts for PYUSD's 6-decimal precision. Integration demonstrates real-world stablecoin usage for payroll applications.

### Pyth Network Integration
Multi-currency wage display leverages Pyth Network price feeds for PYUSD/USD and USD/PHP exchange rates. The frontend queries Hermes HTTP API endpoints every 5 seconds to fetch latest price data with confidence intervals and publish timestamps. Cross-rate calculations combine both feeds to derive PYUSD/PHP rates. Implementation includes custom React hooks for automatic price refresh, error handling, and formatted display across employee dashboards.

## Future Development

### Mainnet Deployment
Migration to Ethereum mainnet with production PYUSD contract integration. Security audit by professional firm before handling real funds.

### Multi-Token Support
Expand beyond PYUSD to support USDC, USDT, and other stablecoins. Enable employers to choose their preferred payment token.

### Direct Fiat Off-Ramps
Partner with payment processors to enable direct conversion from PYUSD to bank deposits in local currencies, eliminating the need for employees to understand cryptocurrency.

### Mobile Application
Native iOS and Android applications for on-the-go clock-in/out, balance checking, and withdrawals.

### Advanced Analytics
Employer dashboards showing labor cost analytics, wage trends, department-level spending, and cash flow forecasting based on streaming payroll data.

### Tax Reporting
Automated generation of W-2, 1099, and equivalent international tax forms based on on-chain payment records.

## Local Development Setup

Clone the repository and install dependencies using npm install in the root directory. Copy .env.example to .env and configure your Sepolia RPC URL, private key, and Etherscan API key.

Compile smart contracts using npx hardhat compile. Run the test suite with npx hardhat test. Deploy to Sepolia using npx hardhat run scripts/deploy-sepolia.ts --network sepolia.

For frontend development, navigate to the frontend directory and install dependencies. Create a .env.local file with contract addresses and Pyth price feed IDs. Start the development server with npm run dev.

## Security Considerations

The smart contract implements multiple security layers including owner-only functions for critical operations, whenNotPaused modifier for emergency stops, onlyActiveEmployee restrictions on withdrawals and clock operations, and nonce validation to prevent replay attacks.

Private keys and API credentials must never be committed to version control. The .env file is explicitly gitignored and should only contain test credentials for Sepolia deployments. Production deployments require hardware wallet integration and multi-signature schemes for contract ownership.

All PYUSD transfers include require statements that revert on failure. Balance calculations prevent integer overflow through Solidity 0.8's built-in checks. The escrow system provides a reconciliation layer for fraud detection before releasing held funds.

## License

This project is developed for ETHGlobal Online 2025 hackathon. All rights reserved by the project team. Commercial usage requires explicit permission.

## Documentation

Additional technical documentation is available in the repository:
- TECHNOLOGY_INTEGRATION.md - Detailed integration guides for EVVM, PYUSD, and Pyth
- DEMO_VIDEO_SCRIPT_SHORT.md - Video demonstration script for hackathon submission
- deployment-sepolia.json - Complete deployment information and contract addresses

## Contact

For questions, collaboration opportunities, or technical support, please open an issue on the GitHub repository or contact the project team through ETHGlobal channels.

Built for ETHGlobal Online 2025.
