import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * Person A: Smart contract tests
 * TODO:
 * 1. Test deposit functionality
 * 2. Test employee addition
 * 3. Test clock in/out
 * 4. Test balance calculation
 * 5. Test withdrawal with validation
 * 6. Test escrow approval
 */

describe("StreamingVault", function () {
  it("Should deploy successfully", async function () {
    const StreamingVault = await ethers.getContractFactory("StreamingVault");
    const vault = await StreamingVault.deploy();
    await vault.waitForDeployment();
    
    expect(await vault.owner()).to.be.properAddress;
  });

  // Person A: Add more tests here
});
