import { ethers } from "hardhat";

const CONTRACT_ADDRESS = "0xc63d7425d5f3960EdAB8A28AdF2468c89d3BBE3c";
const EMPLOYEE_ADDRESS = "0xC712EE2208B441e30614F8e7Ba93B0382C6460dd";
const DEPLOYER_ADDRESS = "0x921243C20Cef1b31594e7a3AdcCAB005Ee0BDB20";

async function main() {
  console.log("🔍 Checking employee registration...\n");

  const StreamingVault = await ethers.getContractFactory("StreamingVault");
  const vault = StreamingVault.attach(CONTRACT_ADDRESS);

  try {
    // Check deployer
    console.log("📋 Checking DEPLOYER (0x921243...BDB20):");
    try {
      const deployerDetails = await vault.getEmployeeDetails(DEPLOYER_ADDRESS);
      console.log("  ✅ Registered:", deployerDetails.isActive);
      console.log("  📊 Annual Salary:", ethers.formatUnits(deployerDetails.annualSalary, 6), "PYUSD");
      console.log("  👤 Manager:", deployerDetails.manager);
      console.log("  ⏰ Clocked In:", deployerDetails.isClockedIn);
      console.log("  💰 Available:", ethers.formatUnits(deployerDetails.availableBalance, 6), "PYUSD");
      console.log("  🔒 Escrow:", ethers.formatUnits(deployerDetails.escrowBalance, 6), "PYUSD\n");
    } catch (err: any) {
      console.log("  ❌ Not registered:", err.message, "\n");
    }

    // Check employee
    console.log("📋 Checking EMPLOYEE (0xC712EE...6460dd):");
    try {
      const empDetails = await vault.getEmployeeDetails(EMPLOYEE_ADDRESS);
      console.log("  ✅ Registered:", empDetails.isActive);
      console.log("  📊 Annual Salary:", ethers.formatUnits(empDetails.annualSalary, 6), "PYUSD");
      console.log("  👤 Manager:", empDetails.manager);
      console.log("  ⏰ Clocked In:", empDetails.isClockedIn);
      console.log("  💰 Available:", ethers.formatUnits(empDetails.availableBalance, 6), "PYUSD");
      console.log("  🔒 Escrow:", ethers.formatUnits(empDetails.escrowBalance, 6), "PYUSD\n");
    } catch (err: any) {
      console.log("  ❌ Not registered or error:", err.message, "\n");
    }

    // Get all employees
    console.log("📋 All registered employees:");
    const allEmployees = await vault.getAllEmployees();
    console.log("  Total:", allEmployees.length);
    allEmployees.forEach((emp: string, idx: number) => {
      console.log(`  ${idx + 1}. ${emp}`);
    });

  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
