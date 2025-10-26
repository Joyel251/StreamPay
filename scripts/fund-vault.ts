import { ethers } from "hardhat";

/**
 * Deposit PYUSD to vault to fund employee wages
 */

async function main() {
  console.log("\n💰 Funding Vault with PYUSD\n");
  console.log("═".repeat(60));

  const VAULT_ADDRESS = "0xc63d7425d5f3960EdAB8A28AdF2468c89d3BBE3c";
  const PYUSD_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";

  const [deployer] = await ethers.getSigners();
  console.log("📍 Depositing from:", deployer.address);

  const vault = await ethers.getContractAt("StreamingVault", VAULT_ADDRESS);
  const pyusd = await ethers.getContractAt(
    ["function balanceOf(address) view returns (uint256)", 
     "function approve(address spender, uint256 amount) returns (bool)",
     "function transfer(address to, uint256 amount) returns (bool)"],
    PYUSD_ADDRESS
  );

  // Check balances
  const walletBalance = await pyusd.balanceOf(deployer.address);
  const vaultBalance = await vault.getContractBalance();
  
  console.log(`\n📊 Current Balances:`);
  console.log(`   Your wallet: ${ethers.formatUnits(walletBalance, 6)} PYUSD`);
  console.log(`   Vault: ${ethers.formatUnits(vaultBalance, 6)} PYUSD`);

  if (walletBalance === 0n) {
    console.log("\n⚠️  You don't have any PYUSD!");
    console.log("   Get test PYUSD from: https://sepolia.etherscan.io/token/" + PYUSD_ADDRESS);
    return;
  }

  // Deposit 50 PYUSD
  const depositAmount = ethers.parseUnits("50", 6);
  
  if (walletBalance < depositAmount) {
    console.log(`\n⚠️  Insufficient balance! Need ${ethers.formatUnits(depositAmount, 6)} PYUSD`);
    return;
  }

  console.log(`\n💸 Depositing ${ethers.formatUnits(depositAmount, 6)} PYUSD...`);

  // Step 1: Approve
  console.log("   Step 1: Approving vault...");
  const approveTx = await pyusd.approve(VAULT_ADDRESS, depositAmount);
  await approveTx.wait();
  console.log("   ✅ Approved!");

  // Step 2: Deposit
  console.log("   Step 2: Depositing...");
  const depositTx = await vault.deposit(depositAmount);
  await depositTx.wait();
  console.log("   ✅ Deposited!");

  // Check new balance
  const newVaultBalance = await vault.getContractBalance();
  console.log(`\n✅ New vault balance: ${ethers.formatUnits(newVaultBalance, 6)} PYUSD`);
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:");
    console.error(error);
    process.exit(1);
  });
