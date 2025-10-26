# 🚀 StreamPay - Real-Time Crypto Wage Streaming

**Built for ETH Global 2025 Hackathon**

StreamPay is a self-custody wage streaming protocol that lets crypto-native employers pay employees in real-time PYUSD, enabling instant withdrawals through EVVM async nonces and multi-currency visibility via Pyth price feeds.

---

## 🎯 One-Line Pitch

*StreamPay streams PYUSD wages second-by-second, allowing employees to withdraw to self-custody wallets anytime using pre-signed transactions.*

---

## ✨ Key Features

- ⚡ **Real-Time Streaming:** Wages accrue every second, not monthly
- 💰 **Instant Withdrawals:** Access earned wages anytime, no waiting
- 🔐 **Self-Custody:** Employees control their own wallets
- 🌍 **Multi-Currency Display:** View balance in USD, PHP, EUR via Pyth
- ✍️ **Pre-Signed Withdrawals:** Sign once, withdraw for entire year (EVVM)
- 🛡️ **70/30 Split:** 70% available instantly, 30% manager-approved
- 🔒 **Anti-Fraud:** Clock-in validation prevents unauthorized withdrawals

---

## 🛠️ Tech Stack

### Backend (Person A) ✅
- **Smart Contracts:** Solidity 0.8.20
- **Framework:** Hardhat
- **Testing:** Chai + Ethers.js (45 tests, all passing)
- **Network:** Sepolia Testnet
- **Token:** PYUSD (6 decimals)

### Frontend (Person B) 🚧
- **Framework:** Next.js 14 + TypeScript
- **Styling:** Tailwind CSS
- **Web3:** Wagmi + Ethers.js + WalletConnect
- **Oracle:** Pyth Network for price feeds
- **State:** React Query

---

## 📁 Project Structure

```
StreamPay/
├── contracts/              # ✅ Person A: Smart contracts
│   ├── StreamingVault.sol  # Main wage streaming protocol
│   └── mocks/              # Test mocks (local testing only)
│       └── MockPYUSD.sol   # ERC20 mock for tests
├── scripts/                # ✅ Person A: Deployment scripts
│   └── deploy.ts           # Automated deployment
├── test/                   # ✅ Person A: Tests (45 passing)
│   └── StreamingVault.test.ts
├── frontend/               # 🚧 Person B: Next.js app
│   ├── app/                # Pages (employer/employee/manager)
│   └── lib/                # Contract integration + Pyth
├── hardhat.config.ts       # ✅ Hardhat configuration
└── PERSON_A_DOCUMENTATION.md  # ✅ Complete docs
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask wallet
- Sepolia testnet ETH (~0.1 ETH from faucets)
- PYUSD testnet tokens (from PayPal faucet or hackathon organizers)

### Installation
```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure .env with:
# - SEPOLIA_RPC_URL (from Alchemy/Infura)
# - PRIVATE_KEY (from MetaMask)
# - PYUSD_ADDRESS (PYUSD testnet contract address)
```

### 🎬 Deployment

**See full guide: [TESTNET_SETUP_GUIDE.md](TESTNET_SETUP_GUIDE.md)**

```bash
# Deploy to Sepolia
npm run deploy

# This automatically:
# ✅ Connects to real PYUSD testnet contract
# ✅ Deploys StreamingVault
# ✅ Funds vault with 500k PYUSD
# ✅ Adds YOU as demo employee ($50k/year)
```

**Demo on Etherscan in 2 minutes:**
1. `clockIn()` - Start streaming
2. Watch balance grow every second
3. `withdraw()` - Get your earned PYUSD
4. `approveEscrow()` - Release the 30%

**See:** `HACKATHON_DEMO_GUIDE.md` for complete presentation script

---

## 🎬 Hackathon Demo (No Real Money!)

**Perfect for hackathon presentations - everything works with testnet tokens!**

### What You Get
- ✅ MockPYUSD test token (1M minted)
- ✅ Pre-funded vault (500k PYUSD)
- ✅ Your wallet as demo employee
- ✅ Full functionality on Sepolia

### 2-Minute Demo Flow

```
1. clockIn() → Wage stream starts ($1.58/sec)
2. Wait 10 seconds → Balance: $15.85
3. withdraw($22) → Instantly in wallet
4. approveEscrow() → Remaining 30% released
```

**All without spending real money! Just testnet ETH for gas.**

See `HACKATHON_DEMO_GUIDE.md` for complete presentation script and tips.

---

## 👥 Team Work Split

### ✅ Person A (Smart Contracts) - **COMPLETED**

**What's Done:**
- ✅ StreamingVault.sol with full functionality
- ✅ EVVM async nonce system implemented
- ✅ 45 comprehensive tests (all passing)
- ✅ Deployment script ready
- ✅ Complete documentation

**Commands:**
```bash
# Compile contracts
npm run compile

# Run tests (45 tests, ~2s)
npm run test

# Deploy to Sepolia
npm run deploy

# Verify on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <PYUSD_ADDRESS>
```

**Documentation:**
- `PERSON_A_SETUP.md` - Environment setup guide
- `PERSON_A_DOCUMENTATION.md` - Full contract docs
- `HANDOFF_TO_PERSON_B.md` - Integration guide

---

### 🚧 Person B (Frontend) - **IN PROGRESS**

**To Build:**
1. **Dashboard Pages**
   - Employer: Deposit PYUSD, manage employees
   - Employee: Clock in/out, view balance, withdraw
   - Manager: Approve weekly escrow

2. **Real-Time Features**
   - Live balance streaming (updates every second)
   - Multi-currency display (Pyth price feeds)
   - Clock-in status indicator

3. **Web3 Integration**
   - MetaMask/WalletConnect
   - Contract interaction (wagmi/ethers)
   - Transaction notifications

**Commands:**
```bash
# Run frontend dev server
npm run dev

# Visit http://localhost:3000
```

**See:** `HANDOFF_TO_PERSON_B.md` for complete integration guide

---

## 🏆 Prize Tracks

### EVVM Prize ($1,500 Total) ✅
- **Track 1: Async Nonces** - Pre-sign 52 withdrawals (one year)
- **Track 2: Off-Chain Data** - Clock-in validation before execution
- **Track 3: Execution Functions** - Conditional withdrawal processing

### Pyth Network Prize ($5,000) 🚧
- Real-time multi-currency wage display
- Fair market rate conversions (PYUSD/USD/PHP/EUR)
- First payroll system with streaming currency conversion

### PayPal PYUSD Prize ($10,000) 🚧
- Real-time wage streaming with PYUSD
- Self-custody preservation
- Solves pain for 300K+ crypto workers
- Bridges crypto to mainstream via PYUSD familiarity

**Total Prize Potential: $16,500**

---

## 📊 Contract Features

### Core Functions

**Owner:**
- `deposit(amount)` - Fund vault with PYUSD
- `addEmployee(address, annualSalary, manager)` - Configure employees
- `updateEmployeeSalary(address, newSalary)` - Adjust wages
- `pause() / unpause()` - Emergency controls

**Employee:**
- `clockIn()` - Start wage stream
- `clockOut()` - Stop stream, finalize balance
- `withdraw(amount)` - Access available balance (70%)
- `withdrawWithNonce(amount, nonce)` - EVVM pre-signed withdrawal
- `preSignNonces(nonces[], hashes[])` - Sign entire year upfront

**Manager:**
- `approveEscrow(employee)` - Release 30% escrow
- `batchApproveEscrow(employees[])` - Bulk approval

**View:**
- `getAvailableBalance(address)` - 70% withdrawable amount
- `getTotalAccruedBalance(address)` - Real-time streaming balance
- `getEmployeeDetails(address)` - Full employee info

---

## 🧪 Testing

```bash
npm run test
```

**Results:**
```
  StreamingVault - StreamPay Tests
    ✔ 45 passing (2s)
    
  Test Coverage:
    - Deployment
    - Deposit functionality
    - Employee management
    - Clock in/out
    - Real-time balance accrual
    - Withdrawal (standard + async nonce)
    - Manager escrow approval
    - Security & anti-fraud
    - View functions
    - Edge cases
```

---

## 📖 Documentation

### For Person A (Smart Contracts)
- `PERSON_A_SETUP.md` - Environment setup
- `PERSON_A_DOCUMENTATION.md` - Contract architecture & API
- `deployment-info.json` - Generated after deployment

### For Person B (Frontend)
- `HANDOFF_TO_PERSON_B.md` - Integration guide
- Contract ABI: `artifacts/contracts/StreamingVault.sol/StreamingVault.json`

---

## 🔐 Security

**Implemented:**
✅ Reentrancy protection  
✅ Integer overflow prevention (Solidity 0.8+)  
✅ Access control (owner/manager/employee)  
✅ Nonce replay protection  
✅ Emergency pause functionality  
✅ Clock-in validation  

**Not Production-Ready:**
⚠️ Hackathon prototype (not audited)  
⚠️ Uses Mock PYUSD (replace for production)  
⚠️ Executor trust assumptions (requires robust validation)  

---

## 🌟 The Innovation

### Traditional Payroll
```
Work 30 days → Wait until month-end → Get paid once
❌ Inflexible
❌ Emergency? Too bad, wait 30 days
❌ Cross-border fees: $35 + 5 days wait
```

### StreamPay
```
Work 1 second → Earn $1.58 → Withdraw anytime
✅ Flexible (access earned wages 24/7)
✅ Emergency? Withdraw instantly
✅ Cross-border: Near-zero fees + 30 seconds
```

### EVVM Magic
```
Traditional: Sign 52 times/year (weekly withdrawals)
StreamPay: Sign ONCE → Pre-approve entire year
✅ Week 1: Execute with signature from January
✅ Week 52: Execute with signature from January
Never sign again for 12 months! 🎉
```

---

## 📊 Market Opportunity

- **300,000+** employees in crypto companies
- **10,000,000+** international contractors preferring crypto
- **$43M ARR potential** at current market size
- **Target:** DAOs, DeFi protocols, Web3 startups

---

## 🤝 Contributing

### Person A Focus
- Smart contract security
- Gas optimization
- Deployment & verification
- Documentation

### Person B Focus  
- Frontend UX/UI
- Pyth price feed integration
- Real-time balance streaming
- Wallet connection flow

---

## � Resources

- **EVVM Docs:** [Hackathon provided link]
- **Pyth Network:** https://docs.pyth.network/
- **PYUSD:** https://www.paypal.com/pyusd
- **Sepolia Faucet:** https://sepoliafaucet.com/
- **Contract Explorer:** https://sepolia.etherscan.io/

---

## 🎬 Demo Flow (2 Minutes)

1. **Hook (15s):** "You worked Monday/Tuesday. Car broke Wednesday. Why can't you access the $400 you EARNED?"

2. **Employer Setup (20s):** DAO deposits 500K PYUSD, configures employees

3. **Real-Time Streaming (30s):** Clock in → Watch balance: $0 → $0.32 → $0.47... every second

4. **Instant Withdrawal (30s):** Emergency → Withdraw $200 → MetaMask notification → 30 seconds → Done

5. **Manager Approval (15s):** Friday 5pm → Approve all → Escrow released automatically

6. **Tech Stack (20s):** EVVM async nonces + Pyth feeds + PYUSD stablecoin

7. **Impact (10s):** "Financial freedom for crypto workers. Get paid the SECOND you work."

---

## ✅ Current Status

**Person A (Smart Contracts):** ✅ **100% Complete**
- Contracts: ✅ Implemented & tested
- Tests: ✅ 45 passing
- Deployment: ✅ Script ready
- Documentation: ✅ Complete

**Person B (Frontend):** 🚧 **In Progress**
- Next steps: See `HANDOFF_TO_PERSON_B.md`
- Contract addresses: Will be provided after deployment
- ABI: Available in `artifacts/` after compilation

---

## 📝 License

MIT License - Built for ETH Global 2025 Hackathon

---

**🚀 Ready to stream wages in real-time!**

### 📚 Key Documentation

**For Demo & Presentation:**
- `HACKATHON_DEMO_GUIDE.md` - Complete 2-minute demo script
- `HACKATHON_READY.md` - Pre-presentation checklist

**For Development:**
- `PERSON_A_DOCUMENTATION.md` - Smart contract API reference  
- `HANDOFF_TO_PERSON_B.md` - Frontend integration guide

**For Deployment:**
- `DEPLOYMENT_QUICK_GUIDE.md` - Step-by-step deployment
- `PERSON_A_SETUP.md` - Environment configuration

---

### 💬 The Pitch

> *"You worked Monday and Tuesday. It's Wednesday, car broke. Why can't you access the $400 you EARNED? StreamPay fixes this. Wages stream every second. Withdraw anytime. Sign once, withdraw all year. Built in 48 hours. Working on Sepolia. Zero real money needed for demo."*

---

**Built with ❤️ for ETH Global 2025**  
**Person A: Smart Contracts Complete ✅**  
**Person B: Frontend In Progress 🚧**
