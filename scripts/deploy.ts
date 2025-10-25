import { ethers } from "hardhat";

/**
 * Person A: Deployment script
 * Run: npm run deploy
 */

async function main() {
  console.log("🚀 Deploying StreamingVault...");

  const StreamingVault = await ethers.getContractFactory("StreamingVault");
  const vault = await StreamingVault.deploy();

  await vault.waitForDeployment();

  const address = await vault.getAddress();

  console.log("✅ StreamingVault deployed to:", address);
  console.log("\n📋 Next steps:");
  console.log("1. Copy this address");
  console.log("2. Add to .env: NEXT_PUBLIC_CONTRACT_ADDRESS=" + address);
  console.log("3. Share ABI from artifacts/ with Person B");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
