import { ethers } from "hardhat";

/**
 * Full E2E Test Flow:
 * 1. Check vault balance
 * 2. Add employee
 * 3. Check employee details
 * 4. Clock in
 * 5. Wait 10 seconds
 * 6. Clock out
 * 7. Check balances (available + escrow)
 * 8. Approve escrow
 * 9. Withdraw
 */

async function main() {
  console.log("\n🚀 StreamPay Full Flow Test\n");
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

  // ========== STEP 1: Check Vault Balance ==========
  console.log("\n📊 Step 1: Checking vault balance...");
  const vaultBalance = await vault.getContractBalance();
  console.log(`   Vault Balance: ${ethers.formatUnits(vaultBalance, 6)} PYUSD`);

  if (vaultBalance === 0n) {
    console.log("\n⚠️  WARNING: Vault is empty!");
    console.log("   You need to deposit PYUSD first:");
    console.log(`   1. Get PYUSD: https://sepolia.etherscan.io/token/${PYUSD_ADDRESS}`);
    console.log(`   2. Approve vault: pyusd.approve("${VAULT_ADDRESS}", amount)`);
    console.log(`   3. Deposit: vault.deposit(amount)`);
    return;
  }

  // ========== STEP 2: Add Employee ==========
  console.log("\n👤 Step 2: Adding employee...");
  const employeeAddress = deployer.address; // Using deployer as employee for testing
  const managerAddress = deployer.address;  // Using deployer as manager
  const annualSalary = ethers.parseUnits("50000", 6); // 50,000 PYUSD/year

  try {
    const tx = await vault.addEmployee(employeeAddress, annualSalary, managerAddress);
    await tx.wait();
    console.log("   ✅ Employee added!");
    console.log(`   Address: ${employeeAddress}`);
    console.log(`   Annual Salary: ${ethers.formatUnits(annualSalary, 6)} PYUSD`);
    console.log(`   Manager: ${managerAddress}`);
  } catch (err: any) {
    if (err.message.includes("Employee already exists")) {
      console.log("   ℹ️  Employee already exists, continuing...");
    } else {
      throw err;
    }
  }

  // ========== STEP 3: Check Employee Details ==========
  console.log("\n🔍 Step 3: Checking employee details...");
  const details = await vault.getEmployeeDetails(employeeAddress);
  console.log(`   Salary per second: ${ethers.formatUnits(details.salaryPerSecond, 6)} PYUSD`);
  console.log(`   Available Balance: ${ethers.formatUnits(details.availableBalance, 6)} PYUSD`);
  console.log(`   Escrow Balance: ${ethers.formatUnits(details.escrowBalance, 6)} PYUSD`);
  console.log(`   Is Active: ${details.isActive}`);
  console.log(`   Is Clocked In: ${details.isClockedIn}`);

  // ========== STEP 4: Clock In ==========
  console.log("\n⏰ Step 4: Clocking in...");
  if (!details.isClockedIn) {
    const tx = await vault.clockIn();
    await tx.wait();
    console.log("   ✅ Clocked in!");
  } else {
    console.log("   ℹ️  Already clocked in");
  }

  // ========== STEP 5: Wait for wages to accumulate ==========
  console.log("\n⏳ Step 5: Waiting 10 seconds for wages to stream...");
  console.log("   (In production, employees would work for hours/days)");
  
  for (let i = 10; i > 0; i--) {
    process.stdout.write(`\r   ⏱️  ${i} seconds remaining...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log("\n   ⏱️  Done waiting!");

  // ========== STEP 6: Clock Out ==========
  console.log("\n⏰ Step 6: Clocking out...");
  const tx2 = await vault.clockOut();
  await tx2.wait();
  console.log("   ✅ Clocked out!");

  // ========== STEP 7: Check Balances ==========
  console.log("\n💰 Step 7: Checking earned wages...");
  const newDetails = await vault.getEmployeeDetails(employeeAddress);
  const available = ethers.formatUnits(newDetails.availableBalance, 6);
  const escrow = ethers.formatUnits(newDetails.escrowBalance, 6);
  const total = parseFloat(available) + parseFloat(escrow);

  console.log(`   Available (70%): ${available} PYUSD`);
  console.log(`   Escrow (30%): ${escrow} PYUSD`);
  console.log(`   Total Earned: ${total.toFixed(6)} PYUSD`);

  // ========== STEP 8: Withdraw Available Balance First ==========
  const finalDetails = await vault.getEmployeeDetails(employeeAddress);
  const availableAmount = finalDetails.availableBalance;

  if (availableAmount > 0n) {
    console.log("\n💸 Step 8: Withdrawing available balance (70%) to wallet...");
    console.log(`   Withdrawing: ${ethers.formatUnits(availableAmount, 6)} PYUSD`);
    
    const balanceBefore = await pyusd.balanceOf(employeeAddress);
    const tx4 = await vault.withdraw(availableAmount);
    await tx4.wait();
    const balanceAfter = await pyusd.balanceOf(employeeAddress);
    
    console.log("   ✅ Withdrawal successful!");
    console.log(`   Wallet balance increased by: ${ethers.formatUnits(balanceAfter - balanceBefore, 6)} PYUSD`);
  }

  // ========== STEP 9: Approve Escrow ==========
  const afterWithdraw = await vault.getEmployeeDetails(employeeAddress);
  const escrowAmount = afterWithdraw.escrowBalance;

  if (escrowAmount > 0n) {
    console.log("\n✅ Step 9: Approving escrow (as manager)...");
    console.log(`   Escrow to release: ${ethers.formatUnits(escrowAmount, 6)} PYUSD`);
    
    const balanceBefore = await pyusd.balanceOf(employeeAddress);
    const tx3 = await vault.approveEscrow(employeeAddress);
    await tx3.wait();
    const balanceAfter = await pyusd.balanceOf(employeeAddress);
    
    console.log("   ✅ Escrow approved and transferred to employee!");
    console.log(`   Wallet balance increased by: ${ethers.formatUnits(balanceAfter - balanceBefore, 6)} PYUSD`);

    // Check final state
    const afterApproval = await vault.getEmployeeDetails(employeeAddress);
    console.log(`   Final Available: ${ethers.formatUnits(afterApproval.availableBalance, 6)} PYUSD`);
    console.log(`   Final Escrow: ${ethers.formatUnits(afterApproval.escrowBalance, 6)} PYUSD`);
  }

  // ========== COMPLETE ==========
  console.log("\n" + "═".repeat(60));
  console.log("🎉 FULL FLOW TEST COMPLETE!");
  console.log("═".repeat(60));
  console.log("\n📋 Summary:");
  console.log("   ✅ Employee added");
  console.log("   ✅ Clocked in");
  console.log("   ✅ Wages streamed for 10 seconds");
  console.log("   ✅ Clocked out");
  console.log("   ✅ Available balance (70%) withdrawn");
  console.log("   ✅ Escrow (30%) approved and transferred");
  console.log("\n💡 Key Learning: Escrow is auto-transferred to employee on approval!");
  console.log("   No need for separate withdrawal after approval.");
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
