import { ethers } from "hardhat";

/**
 * StreamPay Sepolia Deployment Script
 * Uses OFFICIAL PYUSD Sepolia Testnet Contract
 * Run: npx hardhat run scripts/deploy-sepolia.ts --network sepolia
 */

async function main() {
  console.log("\n🚀 StreamPay Sepolia Deployment\n");
  console.log("═".repeat(60));

  // Official PYUSD Sepolia Testnet Address
  const PYUSD_SEPOLIA = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying from:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 ETH Balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.05")) {
    console.log("\n⚠️  WARNING: Low balance! You need at least 0.05 ETH");
    console.log("   Get Sepolia ETH from: https://www.alchemy.com/faucets/ethereum-sepolia\n");
  }
  
  console.log("═".repeat(60));

  // ========== Step 1: Connect to Official PYUSD ==========
  console.log("\n📝 Step 1: Using Official PYUSD Sepolia...");
  console.log("   PYUSD Address:", PYUSD_SEPOLIA);
  console.log("   Network: Sepolia Testnet");
  console.log("   Etherscan:", `https://sepolia.etherscan.io/token/${PYUSD_SEPOLIA}`);
  
  const pyusd = await ethers.getContractAt("IERC20", PYUSD_SEPOLIA);
  const pyusdAddress = PYUSD_SEPOLIA;
  
  // Check deployer's PYUSD balance
  const pyusdBalance = await pyusd.balanceOf(deployer.address);
  console.log("💰 Your PYUSD Balance:", ethers.formatUnits(pyusdBalance, 6), "PYUSD");
  
  if (pyusdBalance === 0n) {
    console.log("\n⚠️  WARNING: You have 0 PYUSD!");
    console.log("   Get testnet PYUSD from:");
    console.log("   - PayPal developer portal");
    console.log("   - PYUSD faucet (if available)");
    console.log("   - Request from hackathon organizers");
    console.log("\n   Note: Contract will deploy, but you'll need PYUSD to test\n");
  }
  
  console.log("✅ Connected to official PYUSD contract");

  // ========== Step 2: Deploy StreamingVault ==========
  console.log("\n📦 Step 2: Deploying StreamingVault...");
  const StreamingVault = await ethers.getContractFactory("StreamingVault");
  console.log("   Deploying...");
  const vault = await StreamingVault.deploy(pyusdAddress);
  await vault.waitForDeployment();

  const vaultAddress = await vault.getAddress();
  console.log("✅ StreamingVault deployed to:", vaultAddress);

  // ========== Step 3: Optional Setup (if you have PYUSD) ==========
  console.log("\n⚙️  Step 3: Optional Setup...");
  
  const currentPYUSDBalance = await pyusd.balanceOf(deployer.address);
  
  if (currentPYUSDBalance > 0n) {
    console.log("   You have PYUSD! Setting up demo...");
    
    // Only proceed if user has enough PYUSD
    const depositAmount = ethers.parseUnits("100000", 6); // 100k PYUSD
    
    if (currentPYUSDBalance >= depositAmount) {
      console.log("   Approving vault to spend PYUSD...");
      const tx2 = await pyusd.approve(vaultAddress, depositAmount);
      await tx2.wait();
      
      console.log("   Depositing 100,000 PYUSD into vault...");
      const tx3 = await vault.deposit(depositAmount);
      await tx3.wait();
      console.log("✅ Vault funded with 100,000 PYUSD");
      
      // Add demo employee
      console.log("   Adding demo employee...");
      const annualSalary = ethers.parseUnits("50000", 6);
      const tx4 = await vault.addEmployee(deployer.address, annualSalary, deployer.address);
      await tx4.wait();
      console.log("✅ Demo employee added (you!)");
    } else {
      console.log("   ⚠️  Not enough PYUSD for full setup");
      console.log("   Have:", ethers.formatUnits(currentPYUSDBalance, 6), "PYUSD");
      console.log("   Need: 100,000 PYUSD for demo");
    }
  } else {
    console.log("   ⏭️  Skipping setup (no PYUSD in wallet)");
    console.log("   You can add employees and fund vault later");
  }

  // ========== Deployment Complete ==========
  console.log("\n" + "═".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("═".repeat(60));
  
  console.log("\n📋 Contract Addresses:");
  console.log("─".repeat(60));
  console.log("PYUSD (Official):  ", pyusdAddress);
  console.log("StreamingVault:    ", vaultAddress);
  console.log("Deployer:          ", deployer.address);

  console.log("\n🔍 Verify StreamingVault on Etherscan:");
  console.log("─".repeat(60));
  console.log(`npx hardhat verify --network sepolia ${vaultAddress} ${pyusdAddress}`);

  console.log("\n🎬 View on Etherscan:");
  console.log("─".repeat(60));
  console.log(`PYUSD:     https://sepolia.etherscan.io/token/${pyusdAddress}`);
  console.log(`Vault:     https://sepolia.etherscan.io/address/${vaultAddress}`);

  console.log("\n🏆 Prize Tracks:");
  console.log("─".repeat(60));
  console.log("✅ EVVM - Async nonce system for pre-signed withdrawals");
  console.log("✅ Pyth - Multi-currency price feeds (Person B)");
  console.log("✅ PYUSD - Using official PYUSD Sepolia testnet");

  console.log("\n💡 Next Steps:");
  console.log("─".repeat(60));
  console.log("1. Get testnet PYUSD from PayPal faucet/dev portal");
  console.log("2. Verify contract on Etherscan (command above)");
  console.log("3. Fund vault and add employees");
  console.log("4. Test on Etherscan Write Contract tab");
  console.log("5. Share addresses with Person B for frontend");
  console.log("6. Prepare 2-minute demo for judges");

  console.log("\n" + "═".repeat(60) + "\n");

  // ========== Save Deployment Info ==========
  const fs = require("fs");
  const deploymentInfo = {
    network: "sepolia",
    chainId: 11155111,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      PYUSD: {
        address: pyusdAddress,
        note: "Official PYUSD Sepolia Testnet Contract",
        type: "Official",
        decimals: 6,
        explorerUrl: `https://sepolia.etherscan.io/token/${pyusdAddress}`
      },
      StreamingVault: {
        address: vaultAddress,
        note: "Main wage streaming contract",
        verifyCommand: `npx hardhat verify --network sepolia ${vaultAddress} ${pyusdAddress}`,
        explorerUrl: `https://sepolia.etherscan.io/address/${vaultAddress}`
      }
    },
    setup: {
      pyusdBalance: ethers.formatUnits(currentPYUSDBalance, 6),
      vaultFunded: currentPYUSDBalance > 0n,
      demoEmployeeAdded: currentPYUSDBalance >= ethers.parseUnits("100000", 6)
    },
    frontend: {
      NEXT_PUBLIC_CONTRACT_ADDRESS: vaultAddress,
      NEXT_PUBLIC_PYUSD_ADDRESS: pyusdAddress,
      NEXT_PUBLIC_CHAIN_ID: "11155111"
    },
    instructions: {
      getPYUSD: "Get testnet PYUSD from PayPal developer portal or faucet",
      fundVault: "Use deposit() function to add PYUSD to vault",
      addEmployee: "Use addEmployee() to add workers with annual salary"
    }
  };

  fs.writeFileSync(
    "deployment-sepolia.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("💾 Deployment info saved to: deployment-sepolia.json\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
