import { ethers } from "hardhat";

const CONTRACT_ADDRESS = "0xc63d7425d5f3960EdAB8A28AdF2468c89d3BBE3c";

async function main() {
  console.log("🧪 Testing employee clock-in capability...\n");

  // Get the signer (should be the employee account when you run this)
  const [signer] = await ethers.getSigners();
  const signerAddress = await signer.getAddress();
  
  console.log("📝 Current wallet:", signerAddress);
  console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(signerAddress)), "ETH\n");

  const StreamingVault = await ethers.getContractFactory("StreamingVault");
  const vault = StreamingVault.attach(CONTRACT_ADDRESS);

  try {
    // Check if this wallet is registered
    console.log("🔍 Checking registration...");
    const details = await vault.getEmployeeDetails(signerAddress);
    console.log("  ✅ Registered:", details.isActive);
    console.log("  📊 Annual Salary:", ethers.formatUnits(details.annualSalary, 6), "PYUSD");
    console.log("  ⏰ Currently Clocked In:", details.isClockedIn);
    console.log("");

    if (!details.isActive) {
      console.log("❌ This wallet is not registered as an employee!");
      console.log("💡 Please add this wallet address using the employer page first.\n");
      return;
    }

    if (details.isClockedIn) {
      console.log("⚠️  Already clocked in! Trying to clock out instead...");
      console.log("🔄 Calling clockOut()...");
      const tx = await vault.clockOut();
      console.log("⏳ Waiting for confirmation...");
      await tx.wait();
      console.log("✅ Successfully clocked out!");
      console.log("🔗 Transaction:", `https://sepolia.etherscan.io/tx/${tx.hash}\n`);
    } else {
      console.log("✅ Ready to clock in!");
      console.log("🔄 Calling clockIn()...");
      const tx = await vault.clockIn();
      console.log("⏳ Waiting for confirmation...");
      await tx.wait();
      console.log("✅ Successfully clocked in!");
      console.log("🔗 Transaction:", `https://sepolia.etherscan.io/tx/${tx.hash}\n`);
    }

    // Check updated status
    const updatedDetails = await vault.getEmployeeDetails(signerAddress);
    console.log("📊 Updated Status:");
    console.log("  ⏰ Clocked In:", updatedDetails.isClockedIn);
    console.log("  💰 Available Balance:", ethers.formatUnits(updatedDetails.availableBalance, 6), "PYUSD");
    console.log("  🔒 Escrow Balance:", ethers.formatUnits(updatedDetails.escrowBalance, 6), "PYUSD");

  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    if (error.message.includes("Only active employees")) {
      console.log("\n💡 Tip: Make sure this wallet address is added as an employee in the contract.");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
