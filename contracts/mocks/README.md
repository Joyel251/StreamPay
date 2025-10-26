# 📝 Note About MockPYUSD

## Location
`contracts/mocks/MockPYUSD.sol`

## Purpose
**ONLY for local testing** - Used by the test suite to run 45 unit tests.

## Important
- ❌ **NOT used in deployment**
- ❌ **NOT deployed to testnet**
- ✅ **ONLY for `npm run test`**
- ✅ Deployment uses **real PYUSD testnet contract**

## Why It's in a Mocks Folder
To make it crystal clear this is for testing only, not for production or deployment.

## Testing vs Deployment

### Testing (Local)
```bash
npm run test
```
- Uses `contracts/mocks/MockPYUSD.sol`
- Creates temporary local blockchain
- No real money
- All 45 tests pass in 2 seconds

### Deployment (Testnet)
```bash
npm run deploy
```
- Uses **real PYUSD testnet contract**
- Requires `PYUSD_ADDRESS` in .env
- Requires actual PYUSD tokens
- Deploys to Sepolia network

## Summary
MockPYUSD = Testing tool only ✅  
Real PYUSD = Deployment ✅
