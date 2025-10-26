import { ethers } from "hardhat";

/**
 * Person A: StreamPay Deployment Script (Testnet)
 * Uses actual PYUSD testnet contract instead of mock
 * Run: npm run deploy
 */

async function main() {
  console.log("\n🚀 StreamPay Deployment Starting...\n");
  console.log("═".repeat(60));

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying from account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  console.log("═".repeat(60));

  // ========== PYUSD Testnet Configuration ==========
  console.log("\n📝 PYUSD Configuration:");
  console.log("   Using real PYUSD testnet contract");
  
  // IMPORTANT: Replace with actual PYUSD testnet address
  // Check PayPal's documentation for the official testnet contract
  const PYUSD_TESTNET_ADDRESS = process.env.PYUSD_ADDRESS || "";
  
  if (!PYUSD_TESTNET_ADDRESS) {
    throw new Error(
      "\n❌ ERROR: PYUSD testnet address not found!" +
      "\n\nPlease add to your .env file:" +
      "\nPYUSD_ADDRESS=0x..." +
      "\n\nGet the address from:" +
      "\n- PayPal PYUSD documentation" +
      "\n- Sepolia testnet faucet/documentation" +
      "\n- PayPal developer portal\n"
    );
  }
  
  console.log("✅ PYUSD Testnet Address:", PYUSD_TESTNET_ADDRESS);
  
  // Connect to existing PYUSD contract
  const pyusd = await ethers.getContractAt("IERC20", PYUSD_TESTNET_ADDRESS);
  const pyusdAddress = PYUSD_TESTNET_ADDRESS;
  
  // Check deployer's PYUSD balance
  const pyusdBalance = await pyusd.balanceOf(deployer.address);
  console.log("💰 Your PYUSD balance:", ethers.formatUnits(pyusdBalance, 6), "PYUSD");
  
  if (pyusdBalance === 0n) {
    console.log("\n⚠️  WARNING: You have 0 PYUSD!");
    console.log("   Get testnet PYUSD from:");
    console.log("   - PayPal testnet faucet");
    console.log("   - Request from PayPal for hackathon");
    console.log("   - Community faucets\n");
  }

  // ========== Step 2: Deploy StreamingVault ==========
  console.log("\n📦 Step 2: Deploying StreamingVault...");
  
  const StreamingVault = await ethers.getContractFactory("StreamingVault");
  const vault = await StreamingVault.deploy(pyusdAddress);
  await vault.waitForDeployment();

  const vaultAddress = await vault.getAddress();
  console.log("✅ StreamingVault deployed to:", vaultAddress);

  // ========== Step 3: Initial Setup ==========
  console.log("\n⚙️  Step 3: Initial Setup...");
  
  // Approve vault to spend PYUSD
  const depositAmount = ethers.parseUnits("500000", 6); // 500k PYUSD
  console.log("   Approving vault to spend PYUSD...");
  await pyusd.approve(vaultAddress, depositAmount);
  
  // Deposit into vault
  console.log("   Depositing 500,000 PYUSD into vault...");
  await vault.deposit(depositAmount);
  console.log("✅ Vault funded with 500,000 PYUSD");

  // ========== Step 4: Add Demo Employee ==========
  console.log("\n👥 Step 4: Setting Up Demo Employee (Hackathon)...");
  
  // Add deployer as demo employee for easy testing
  const demoSalary = ethers.parseUnits("50000", 6); // $50k/year
  await vault.addEmployee(deployer.address, demoSalary, deployer.address);
  
  console.log(`   ✅ Added Demo Employee: ${deployer.address}`);
  console.log(`      Salary: $50,000/year`);
  console.log(`      Per Second: $${ethers.formatUnits(demoSalary / BigInt(365 * 24 * 60 * 60), 6)}/sec`);
  console.log("   💡 You can now demo clock in/out on Etherscan!");

  // ========== Step 5: Verification Info ==========
  console.log("\n" + "═".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("═".repeat(60));
  
  console.log("\n📋 Contract Addresses:");
  console.log("─".repeat(60));
  console.log("PYUSD Token:       ", pyusdAddress);
  console.log("                    (Real PYUSD Testnet Contract)");
  console.log("StreamingVault:    ", vaultAddress);
  
  console.log("\n📝 Next Steps for Hackathon Demo:");
  console.log("─".repeat(60));
  console.log("1. Verify StreamingVault on Etherscan:");
  console.log(`   npx hardhat verify --network sepolia ${vaultAddress} ${pyusdAddress}`);
  
  console.log("\n2. Demo on Etherscan (Write Contract tab):");
  console.log("   a) clockIn() - Start wage streaming");
  console.log("   b) Wait 10 seconds");
  console.log("   c) Check getAvailableBalance(your_address)");
  console.log("   d) withdraw(amount) - Get your PYUSD");
  console.log("   e) approveEscrow(your_address) - Release escrow");
  
  console.log("\n3. Update frontend .env.local:");
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${vaultAddress}`);
  console.log(`   NEXT_PUBLIC_PYUSD_ADDRESS=${pyusdAddress}`);
  console.log("   NEXT_PUBLIC_CHAIN_ID=11155111");
  
  console.log("\n4. Copy ABI for Person B:");
  console.log("   artifacts/contracts/StreamingVault.sol/StreamingVault.json");
  
  console.log("\n5. Visit Sepolia Etherscan:");
  console.log(`   https://sepolia.etherscan.io/address/${vaultAddress}`);
  
  console.log("\n" + "═".repeat(60));
  console.log("🎬 READY FOR HACKATHON DEMO!");
  console.log("═".repeat(60));
  console.log("\n💡 Using Real PYUSD Testnet Contract");
  console.log("   For Production: Use PYUSD Mainnet");
  console.log("   Mainnet: 0x6c3ea9036406852006290770BEdFcAbA0e23A0e8");
  console.log("═".repeat(60) + "\n");
  
  // ========== Step 6: Save Deployment Info ==========
  const fs = require("fs");
  const deploymentInfo = {
    network: "sepolia",
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      PYUSD: pyusdAddress,
      note: "Real PYUSD testnet contract",
      StreamingVault: vaultAddress
    },
    demoEmployee: {
      address: deployer.address,
      salary: "50000 PYUSD/year",
      manager: deployer.address
    },
    initialDeposit: "500000 PYUSD",
    verification: {
      vault: `npx hardhat verify --network sepolia ${vaultAddress} ${pyusdAddress}`
    },
    production: {
      note: "For mainnet production",
      pyusdMainnet: "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8"
    }
  };

  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n💾 Deployment info saved to: deployment-info.json\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
