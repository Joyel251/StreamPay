import { ethers } from "hardhat";

/**
 * Clean E2E Test Flow (works even if previous test left balance)
 * 1. Check initial state
 * 2. Withdraw any existing available balance first (clean slate)
 * 3. Clock in
 * 4. Wait 10 seconds
 * 5. Clock out
 * 6. Withdraw 70% available
 * 7. Manager approves 30% escrow
 */

async function main() {
  console.log("\n🚀 StreamPay Clean E2E Test\n");
  console.log("═".repeat(60));

  // Contract addresses
  const VAULT_ADDRESS = "0xc63d7425d5f3960EdAB8A28AdF2468c89d3BBE3c";
  const PYUSD_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";

  // Get signer (deployer)
  const [deployer] = await ethers.getSigners();
  console.log("📍 Testing with address:", deployer.address);

  // Connect to contracts
  const vault = await ethers.getContractAt("StreamingVault", VAULT_ADDRESS);
  const pyusd = await ethers.getContractAt("IERC20", PYUSD_ADDRESS);

  // ========== Check Initial State ==========
  console.log("\n📊 Step 1: Checking initial state...");
  const vaultBalance = await vault.getContractBalance();
  console.log(`   Vault Balance: ${ethers.formatUnits(vaultBalance, 6)} PYUSD`);

  const details = await vault.getEmployeeDetails(deployer.address);
  console.log(`   Available Balance: ${ethers.formatUnits(details.availableBalance, 6)} PYUSD`);
  console.log(`   Escrow Balance: ${ethers.formatUnits(details.escrowBalance, 6)} PYUSD`);
  console.log(`   Is Clocked In: ${details.isClockedIn}`);

  // ========== Clean Slate: Withdraw Existing Balance ==========
  if (details.availableBalance > 0n) {
    console.log("\n🧹 Step 2: Cleaning up existing balance...");
    console.log(`   Withdrawing old balance: ${ethers.formatUnits(details.availableBalance, 6)} PYUSD`);
    
    const tx = await vault.withdraw(details.availableBalance);
    await tx.wait();
    console.log("   ✅ Old balance withdrawn!");
  }

  // ========== Add Employee if Needed ==========
  console.log("\n👤 Step 3: Ensuring employee is added...");
  const employeeAddress = deployer.address;
  const managerAddress = deployer.address;
  const annualSalary = ethers.parseUnits("50000", 6);

  try {
    const tx = await vault.addEmployee(employeeAddress, annualSalary, managerAddress);
    await tx.wait();
    console.log("   ✅ Employee added!");
  } catch (err: any) {
    if (err.message.includes("Employee already exists")) {
      console.log("   ℹ️  Employee already exists");
    } else {
      throw err;
    }
  }

  // ========== Clock Out if Already Clocked In ==========
  if (details.isClockedIn) {
    console.log("\n⏰ Step 4: Clocking out from previous session...");
    const tx = await vault.clockOut();
    await tx.wait();
    console.log("   ✅ Clocked out!");
    
    // Withdraw the accrued balance from that session
    const newDetails = await vault.getEmployeeDetails(deployer.address);
    if (newDetails.availableBalance > 0n) {
      console.log(`   Withdrawing accrued: ${ethers.formatUnits(newDetails.availableBalance, 6)} PYUSD`);
      const tx2 = await vault.withdraw(newDetails.availableBalance);
      await tx2.wait();
    }
  }

  // ========== START CLEAN TEST ==========
  console.log("\n" + "─".repeat(60));
  console.log("🎬 STARTING CLEAN TEST");
  console.log("─".repeat(60));

  // ========== Clock In ==========
  console.log("\n⏰ Step 5: Clocking in...");
  const tx3 = await vault.clockIn();
  await tx3.wait();
  console.log("   ✅ Clocked in!");
  console.log("   ⏱️  Timer started...");

  // ========== Wait for Wages ==========
  console.log("\n⏳ Step 6: Waiting 10 seconds for wages to stream...");
  for (let i = 10; i > 0; i--) {
    process.stdout.write(`\r   ⏱️  ${i} seconds remaining...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log("\n   ✅ Done waiting!");

  // Check real-time earnings
  const realTime = await vault.getEmployeeDetails(deployer.address);
  console.log(`   Real-time available: ${ethers.formatUnits(realTime.availableBalance, 6)} PYUSD (70%)`);

  // ========== Clock Out ==========
  console.log("\n⏰ Step 7: Clocking out...");
  const tx4 = await vault.clockOut();
  await tx4.wait();
  console.log("   ✅ Clocked out!");

  // ========== Check Balances ==========
  console.log("\n💰 Step 8: Checking earned wages...");
  const afterClockOut = await vault.getEmployeeDetails(deployer.address);
  const available = ethers.formatUnits(afterClockOut.availableBalance, 6);
  const escrow = ethers.formatUnits(afterClockOut.escrowBalance, 6);
  
  console.log(`   Available (70%): ${available} PYUSD`);
  console.log(`   Escrow (30%): ${escrow} PYUSD`);
  console.log(`   💡 Escrow is 0 because it's only created during withdrawal!`);

  // ========== Withdraw Available Balance ==========
  if (afterClockOut.availableBalance > 0n) {
    console.log("\n💸 Step 9: Withdrawing available balance (70%)...");
    const amount = afterClockOut.availableBalance;
    console.log(`   Amount: ${ethers.formatUnits(amount, 6)} PYUSD`);
    
    const balanceBefore = await pyusd.balanceOf(deployer.address);
    const tx5 = await vault.withdraw(amount);
    await tx5.wait();
    const balanceAfter = await pyusd.balanceOf(deployer.address);
    
    console.log("   ✅ Withdrawal successful!");
    console.log(`   Received: ${ethers.formatUnits(balanceAfter - balanceBefore, 6)} PYUSD`);
    
    // Now check escrow
    const afterWithdraw = await vault.getEmployeeDetails(deployer.address);
    console.log(`   Escrow created: ${ethers.formatUnits(afterWithdraw.escrowBalance, 6)} PYUSD (30%)`);
  }

  // ========== Approve Escrow ==========
  const finalCheck = await vault.getEmployeeDetails(deployer.address);
  if (finalCheck.escrowBalance > 0n) {
    console.log("\n✅ Step 10: Approving escrow (as manager)...");
    const escrowAmount = finalCheck.escrowBalance;
    console.log(`   Escrow to release: ${ethers.formatUnits(escrowAmount, 6)} PYUSD`);
    
    const balanceBefore = await pyusd.balanceOf(deployer.address);
    const tx6 = await vault.approveEscrow(deployer.address);
    await tx6.wait();
    const balanceAfter = await pyusd.balanceOf(deployer.address);
    
    console.log("   ✅ Escrow approved and transferred!");
    console.log(`   Received: ${ethers.formatUnits(balanceAfter - balanceBefore, 6)} PYUSD`);
  }

  // ========== Summary ==========
  console.log("\n" + "═".repeat(60));
  console.log("🎉 CLEAN E2E TEST COMPLETE!");
  console.log("═".repeat(60));
  
  const finalDetails = await vault.getEmployeeDetails(deployer.address);
  console.log("\n📊 Final State:");
  console.log(`   Available: ${ethers.formatUnits(finalDetails.availableBalance, 6)} PYUSD`);
  console.log(`   Escrow: ${ethers.formatUnits(finalDetails.escrowBalance, 6)} PYUSD`);
  console.log(`   Total Withdrawn: ${ethers.formatUnits(finalDetails.totalWithdrawn, 6)} PYUSD`);
  
  console.log("\n💡 Key Insights:");
  console.log("   1. Clock in → start timer");
  console.log("   2. Clock out → accrue to accruedBalance");
  console.log("   3. Withdraw → split into 70% (sent) + 30% (escrow)");
  console.log("   4. Manager approves → escrow transferred to employee");
  
  console.log("\n🌐 Now test on the frontend:");
  console.log("   Employee: http://localhost:3000/employee");
  console.log("   Employer: http://localhost:3000/employer");
  console.log("   Manager: http://localhost:3000/manager");
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Test failed:");
    console.error(error);
    process.exit(1);
  });
