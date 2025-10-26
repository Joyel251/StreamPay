import { ethers } from "hardhat";

/**
 * Get recent transactions for the deployer address
 */

async function main() {
  const DEPLOYER = "0x921243C20Cef1b31594e7a3AdcCAB005Ee0BDB20";
  const VAULT_ADDRESS = "0xc63d7425d5f3960EdAB8A28AdF2468c89d3BBE3c";
  
  console.log("\n🔍 Recent StreamPay Transactions\n");
  console.log("═".repeat(60));
  
  console.log(`\n📍 Deployer Address: ${DEPLOYER}`);
  console.log(`📍 Vault Contract: ${VAULT_ADDRESS}`);
  
  console.log("\n🌐 View on Sepolia Etherscan:\n");
  
  console.log("📊 **Your Wallet Transactions:**");
  console.log(`   https://sepolia.etherscan.io/address/${DEPLOYER}`);
  
  console.log("\n📝 **StreamingVault Contract:**");
  console.log(`   https://sepolia.etherscan.io/address/${VAULT_ADDRESS}`);
  
  console.log("\n💰 **PYUSD Token:**");
  console.log(`   https://sepolia.etherscan.io/token/0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9`);
  
  console.log("\n📋 **Recent Actions (Last Test):**");
  console.log("   1. Withdraw old balance");
  console.log("   2. Clock in");
  console.log("   3. Clock out");
  console.log("   4. Withdraw 70% (0.026628 PYUSD)");
  console.log("   5. Approve escrow (4.42215 PYUSD)");
  
  console.log("\n💡 **Tip:** Click the wallet link above to see all transactions!");
  console.log("   Filter by 'Internal Txns' to see PYUSD transfers.");
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
