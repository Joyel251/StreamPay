import { ethers } from "hardhat";

/**
 * Interact with deployed StreamingVault on Sepolia
 */

async function main() {
  console.log("\n🎮 StreamPay Interaction Script\n");
  console.log("═".repeat(60));

  const VAULT_ADDRESS = "0xc63d7425d5f3960EdAB8A28AdF2468c89d3BBE3c";
  const PYUSD_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";

  const [signer] = await ethers.getSigners();
  console.log("👤 Your Address:", signer.address);

  // Connect to contracts
  const vault = await ethers.getContractAt("StreamingVault", VAULT_ADDRESS);
  const pyusd = await ethers.getContractAt("IERC20", PYUSD_ADDRESS);

  // Check balances
  console.log("\n💰 Current Balances:");
  console.log("─".repeat(60));
  const ethBalance = await ethers.provider.getBalance(signer.address);
  const pyusdBalance = await pyusd.balanceOf(signer.address);
  const vaultBalance = await vault.totalDeposited();
  console.log("Your ETH:     ", ethers.formatEther(ethBalance), "ETH");
  console.log("Your PYUSD:   ", ethers.formatUnits(pyusdBalance, 6), "PYUSD");
  console.log("Vault PYUSD:  ", ethers.formatUnits(vaultBalance, 6), "PYUSD");

  console.log("\n" + "═".repeat(60));
  console.log("🎯 Choose an action:");
  console.log("═".repeat(60));
  console.log("1. Approve & Deposit PYUSD to Vault");
  console.log("2. Add Employee (Yourself)");
  console.log("3. Clock In");
  console.log("4. Check Streaming Balance");
  console.log("5. Withdraw Earnings");
  console.log("6. Clock Out");
  console.log("7. View Employee Details");
  console.log("═".repeat(60));

  // Uncomment the action you want to perform:

  // ===== ACTION 1: Deposit PYUSD =====
  // const depositAmount = ethers.parseUnits("100", 6); // 100 PYUSD
  // console.log("\n📥 Approving PYUSD...");
  // let tx = await pyusd.approve(VAULT_ADDRESS, depositAmount);
  // await tx.wait();
  // console.log("✅ Approved!");
  // console.log("\n📥 Depositing to vault...");
  // tx = await vault.deposit(depositAmount);
  // await tx.wait();
  // console.log("✅ Deposited 100 PYUSD!");

  // ===== ACTION 2: Add Employee =====
  // const annualSalary = ethers.parseUnits("50000", 6); // $50k/year
  // console.log("\n👤 Adding employee...");
  // const tx = await vault.addEmployee(signer.address, annualSalary, signer.address);
  // await tx.wait();
  // console.log("✅ Employee added!");

  // ===== ACTION 3: Clock In =====
  // console.log("\n⏰ Clocking in...");
  // const tx = await vault.clockIn(signer.address);
  // await tx.wait();
  // console.log("✅ Clocked in! Wages now streaming...");

  // ===== ACTION 4: Check Balance =====
  console.log("\n💵 Checking streaming balance...");
  const available = await vault.getAvailableBalance(signer.address);
  console.log("Available to withdraw:", ethers.formatUnits(available, 6), "PYUSD");

  // ===== ACTION 5: Withdraw =====
  // const withdrawAmount = ethers.parseUnits("10", 6); // 10 PYUSD
  // console.log("\n💸 Withdrawing...");
  // const tx = await vault.withdraw(withdrawAmount);
  // await tx.wait();
  // console.log("✅ Withdrawn 10 PYUSD!");

  // ===== ACTION 6: Clock Out =====
  // console.log("\n⏰ Clocking out...");
  // const tx = await vault.clockOut(signer.address);
  // await tx.wait();
  // console.log("✅ Clocked out! Wages paused.");

  // ===== ACTION 7: View Employee Details =====
  console.log("\n👤 Employee Details:");
  console.log("─".repeat(60));
  const employee = await vault.employees(signer.address);
  console.log("Address:        ", signer.address);
  console.log("Annual Salary:  ", ethers.formatUnits(employee.annualSalary, 6), "PYUSD");
  console.log("Is Active:      ", employee.isActive);
  console.log("Is Clocked In:  ", employee.isClockedIn);
  console.log("Total Withdrawn:", ethers.formatUnits(employee.totalWithdrawn, 6), "PYUSD");
  console.log("Manager:        ", employee.manager);

  console.log("\n" + "═".repeat(60));
  console.log("✅ Done!");
  console.log("═".repeat(60) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:");
    console.error(error);
    process.exit(1);
  });
