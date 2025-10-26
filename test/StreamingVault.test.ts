import { expect } from "chai";
import { ethers } from "hardhat";
import { StreamingVault } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

/**
 * Person A: Comprehensive Smart Contract Tests
 * Tests cover all core functionality of StreamPay
 * Note: Uses MockPYUSD from contracts/mocks/ for local testing only
 */

describe("StreamingVault - StreamPay Tests", function () {
  let vault: StreamingVault;
  let pyusd: any; // Using any since MockPYUSD is in mocks folder
  let owner: SignerWithAddress;
  let manager: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let charlie: SignerWithAddress;

  const ANNUAL_SALARY_ALICE = ethers.parseUnits("50000", 6); // $50k
  const ANNUAL_SALARY_BOB = ethers.parseUnits("30000", 6); // $30k
  const DEPOSIT_AMOUNT = ethers.parseUnits("500000", 6); // $500k

  beforeEach(async function () {
    // Get signers
    [owner, manager, alice, bob, charlie] = await ethers.getSigners();

    // Deploy Mock PYUSD (for testing only - deployment uses real PYUSD)
    const MockPYUSD = await ethers.getContractFactory("contracts/mocks/MockPYUSD.sol:MockPYUSD");
    pyusd = await MockPYUSD.deploy();
    await pyusd.waitForDeployment();

    // Deploy StreamingVault
    const StreamingVault = await ethers.getContractFactory("StreamingVault");
    vault = await StreamingVault.deploy(await pyusd.getAddress());
    await vault.waitForDeployment();

    // Mint and approve PYUSD for owner
    await pyusd.mint(owner.address, DEPOSIT_AMOUNT);
    await pyusd.approve(await vault.getAddress(), DEPOSIT_AMOUNT);
  });

  describe("1. Deployment", function () {
    it("Should deploy with correct owner", async function () {
      expect(await vault.owner()).to.equal(owner.address);
    });

    it("Should set PYUSD token address", async function () {
      expect(await vault.pyusdToken()).to.equal(await pyusd.getAddress());
    });

    it("Should not be paused initially", async function () {
      expect(await vault.paused()).to.equal(false);
    });
  });

  describe("2. Deposit Functionality", function () {
    it("Should allow owner to deposit PYUSD", async function () {
      await expect(vault.deposit(DEPOSIT_AMOUNT))
        .to.emit(vault, "Deposited")
        .withArgs(owner.address, DEPOSIT_AMOUNT);

      const balance = await vault.getContractBalance();
      expect(balance).to.equal(DEPOSIT_AMOUNT);
    });

    it("Should revert on zero deposit", async function () {
      await expect(vault.deposit(0)).to.be.revertedWith("Amount must be > 0");
    });

    it("Should revert if insufficient allowance", async function () {
      await pyusd.approve(await vault.getAddress(), 0);
      await expect(vault.deposit(DEPOSIT_AMOUNT)).to.be.revertedWith(
        "Insufficient allowance"
      );
    });
  });

  describe("3. Employee Management", function () {
    beforeEach(async function () {
      await vault.deposit(DEPOSIT_AMOUNT);
    });

    it("Should add employee with correct salary calculation", async function () {
      await expect(
        vault.addEmployee(alice.address, ANNUAL_SALARY_ALICE, manager.address)
      )
        .to.emit(vault, "EmployeeAdded")
        .withArgs(
          alice.address,
          ANNUAL_SALARY_ALICE / BigInt(365 * 24 * 60 * 60),
          manager.address
        );

      const emp = await vault.employees(alice.address);
      expect(emp.isActive).to.equal(true);
      expect(emp.salaryPerSecond).to.be.gt(0);
    });

    it("Should revert adding duplicate employee", async function () {
      await vault.addEmployee(alice.address, ANNUAL_SALARY_ALICE, manager.address);
      await expect(
        vault.addEmployee(alice.address, ANNUAL_SALARY_ALICE, manager.address)
      ).to.be.revertedWith("Employee already exists");
    });

    it("Should update employee salary", async function () {
      await vault.addEmployee(alice.address, ANNUAL_SALARY_ALICE, manager.address);
      const newSalary = ethers.parseUnits("60000", 6);

      await expect(vault.updateEmployeeSalary(alice.address, newSalary))
        .to.emit(vault, "EmployeeUpdated");

      const emp = await vault.employees(alice.address);
      expect(emp.salaryPerSecond).to.equal(newSalary / BigInt(365 * 24 * 60 * 60));
    });

    it("Should remove employee", async function () {
      await vault.addEmployee(alice.address, ANNUAL_SALARY_ALICE, manager.address);
      
      await expect(vault.removeEmployee(alice.address))
        .to.emit(vault, "EmployeeRemoved")
        .withArgs(alice.address);

      const emp = await vault.employees(alice.address);
      expect(emp.isActive).to.equal(false);
    });

    it("Should change employee manager", async function () {
      await vault.addEmployee(alice.address, ANNUAL_SALARY_ALICE, manager.address);
      
      await expect(vault.changeManager(alice.address, charlie.address))
        .to.emit(vault, "ManagerChanged")
        .withArgs(alice.address, manager.address, charlie.address);

      const emp = await vault.employees(alice.address);
      expect(emp.managerAddress).to.equal(charlie.address);
    });
  });

  describe("4. Clock In/Out Functionality", function () {
    beforeEach(async function () {
      await vault.deposit(DEPOSIT_AMOUNT);
      await vault.addEmployee(alice.address, ANNUAL_SALARY_ALICE, manager.address);
    });

    it("Should allow employee to clock in", async function () {
      await expect(vault.connect(alice).clockIn())
        .to.emit(vault, "ClockedIn");

      const emp = await vault.employees(alice.address);
      expect(emp.isClockedIn).to.equal(true);
      expect(emp.lastClockIn).to.be.gt(0);
    });

    it("Should revert double clock in", async function () {
      await vault.connect(alice).clockIn();
      await expect(vault.connect(alice).clockIn()).to.be.revertedWith(
        "Already clocked in"
      );
    });

    it("Should allow employee to clock out", async function () {
      await vault.connect(alice).clockIn();
      
      // Wait 1 hour
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine", []);

      await expect(vault.connect(alice).clockOut())
        .to.emit(vault, "ClockedOut");

      const emp = await vault.employees(alice.address);
      expect(emp.isClockedIn).to.equal(false);
      expect(emp.accruedBalance).to.be.gt(0);
    });

    it("Should revert clock out when not clocked in", async function () {
      await expect(vault.connect(alice).clockOut()).to.be.revertedWith(
        "Not clocked in"
      );
    });
  });

  describe("5. Real-Time Balance Accrual", function () {
    beforeEach(async function () {
      await vault.deposit(DEPOSIT_AMOUNT);
      await vault.addEmployee(alice.address, ANNUAL_SALARY_ALICE, manager.address);
      await vault.connect(alice).clockIn();
    });

    it("Should accrue balance in real-time", async function () {
      const balanceBefore = await vault.getTotalAccruedBalance(alice.address);

      // Wait 1 hour
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine", []);

      const balanceAfter = await vault.getTotalAccruedBalance(alice.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should calculate 70/30 split correctly", async function () {
      // Wait 8 hours (work day)
      await ethers.provider.send("evm_increaseTime", [8 * 3600]);
      await ethers.provider.send("evm_mine", []);

      const totalAccrued = await vault.getTotalAccruedBalance(alice.address);
      const available = await vault.getAvailableBalance(alice.address);

      // Available should be 70% of total
      expect(available).to.equal((totalAccrued * BigInt(70)) / BigInt(100));
    });

    it("Should handle multiple clock in/out cycles", async function () {
      // Work 4 hours
      await ethers.provider.send("evm_increaseTime", [4 * 3600]);
      await vault.connect(alice).clockOut();
      
      const balance1 = await vault.getTotalAccruedBalance(alice.address);
      
      // Break 1 hour
      await ethers.provider.send("evm_increaseTime", [3600]);
      
      // Work another 4 hours
      await vault.connect(alice).clockIn();
      await ethers.provider.send("evm_increaseTime", [4 * 3600]);
      await vault.connect(alice).clockOut();
      
      const balance2 = await vault.getTotalAccruedBalance(alice.address);
      
      // Should have ~8 hours of pay
      expect(balance2).to.be.gt(balance1);
    });
  });

  describe("6. Withdrawal Functionality", function () {
    beforeEach(async function () {
      await vault.deposit(DEPOSIT_AMOUNT);
      await vault.addEmployee(alice.address, ANNUAL_SALARY_ALICE, manager.address);
      await vault.connect(alice).clockIn();
      
      // Work 8 hours
      await ethers.provider.send("evm_increaseTime", [8 * 3600]);
      await ethers.provider.send("evm_mine", []);
    });

    it("Should allow withdrawal of available balance", async function () {
      const available = await vault.getAvailableBalance(alice.address);
      const withdrawAmount = available / BigInt(2);

      await expect(vault.connect(alice).withdraw(withdrawAmount))
        .to.emit(vault, "Withdrawn")
        .withArgs(alice.address, withdrawAmount, 0);

      const pyusdBalance = await pyusd.balanceOf(alice.address);
      expect(pyusdBalance).to.equal(withdrawAmount);
    });

    it("Should revert withdrawal exceeding available balance", async function () {
      const available = await vault.getAvailableBalance(alice.address);
      const tooMuch = available + ethers.parseUnits("1000", 6);

      await expect(
        vault.connect(alice).withdraw(tooMuch)
      ).to.be.revertedWith("Invalid amount");
    });

    it("Should update escrow balance on withdrawal", async function () {
      const available = await vault.getAvailableBalance(alice.address);
      await vault.connect(alice).withdraw(available);

      const emp = await vault.employees(alice.address);
      expect(emp.escrowBalance).to.be.gt(0);
    });

    it("Should track total withdrawn", async function () {
      const available = await vault.getAvailableBalance(alice.address);
      await vault.connect(alice).withdraw(available);

      const emp = await vault.employees(alice.address);
      expect(emp.totalWithdrawn).to.equal(available);
    });
  });

  describe("7. Async Nonce System (EVVM)", function () {
    beforeEach(async function () {
      await vault.deposit(DEPOSIT_AMOUNT);
      await vault.addEmployee(alice.address, ANNUAL_SALARY_ALICE, manager.address);
    });

    it("Should allow pre-signing nonces", async function () {
      const nonces = [1, 2, 3, 4, 5];
      const hashes = nonces.map(n => ethers.keccak256(ethers.toUtf8Bytes(`hash${n}`)));

      await expect(vault.connect(alice).preSignNonces(nonces, hashes))
        .to.emit(vault, "NoncePreSigned");
    });

    it("Should allow withdrawal with nonce", async function () {
      await vault.connect(alice).clockIn();
      await ethers.provider.send("evm_increaseTime", [8 * 3600]);
      await ethers.provider.send("evm_mine", []);

      // Clock out to finalize accrued balance
      await vault.connect(alice).clockOut();

      const available = await vault.getAvailableBalance(alice.address);
      const withdrawAmount = available / BigInt(2);

      await expect(vault.connect(alice).withdrawWithNonce(withdrawAmount, 1))
        .to.emit(vault, "Withdrawn")
        .withArgs(alice.address, withdrawAmount, 1);
    });

    it("Should prevent nonce reuse", async function () {
      await vault.connect(alice).clockIn();
      await ethers.provider.send("evm_increaseTime", [8 * 3600]);
      await ethers.provider.send("evm_mine", []);
      
      await vault.connect(alice).clockOut();

      const available = await vault.getAvailableBalance(alice.address);
      const withdrawAmount = available / BigInt(4);

      await vault.connect(alice).withdrawWithNonce(withdrawAmount, 1);
      
      await expect(
        vault.connect(alice).withdrawWithNonce(withdrawAmount, 1)
      ).to.be.revertedWith("Nonce already used");
    });

    it("Should track used nonces", async function () {
      await vault.connect(alice).clockIn();
      await ethers.provider.send("evm_increaseTime", [8 * 3600]);
      await ethers.provider.send("evm_mine", []);
      
      await vault.connect(alice).clockOut();

      const available = await vault.getAvailableBalance(alice.address);
      await vault.connect(alice).withdrawWithNonce(available / BigInt(2), 5);

      expect(await vault.isNonceUsed(alice.address, 5)).to.equal(true);
      expect(await vault.isNonceUsed(alice.address, 6)).to.equal(false);
    });

    it("Should allow pre-signing up to 52 nonces", async function () {
      const nonces = Array.from({ length: 52 }, (_, i) => i + 1);
      const hashes = nonces.map(n => ethers.keccak256(ethers.toUtf8Bytes(`week${n}`)));

      await expect(vault.connect(alice).preSignNonces(nonces, hashes))
        .to.not.be.reverted;
    });
  });

  describe("8. Manager Escrow Approval", function () {
    beforeEach(async function () {
      await vault.deposit(DEPOSIT_AMOUNT);
      await vault.addEmployee(alice.address, ANNUAL_SALARY_ALICE, manager.address);
      await vault.connect(alice).clockIn();
      
      // Work and withdraw to create escrow
      await ethers.provider.send("evm_increaseTime", [8 * 3600]);
      await ethers.provider.send("evm_mine", []);
      
      await vault.connect(alice).clockOut();
      
      const available = await vault.getAvailableBalance(alice.address);
      await vault.connect(alice).withdraw(available);
    });

    it("Should allow manager to approve escrow", async function () {
      const emp = await vault.employees(alice.address);
      const escrowAmount = emp.escrowBalance;

      await expect(vault.connect(manager).approveEscrow(alice.address))
        .to.emit(vault, "EscrowReleased")
        .withArgs(alice.address, escrowAmount, manager.address);

      const empAfter = await vault.employees(alice.address);
      expect(empAfter.escrowBalance).to.equal(0);
    });

    it("Should allow owner to approve escrow", async function () {
      await expect(vault.connect(owner).approveEscrow(alice.address))
        .to.emit(vault, "EscrowReleased");
    });

    it("Should revert if non-manager tries to approve", async function () {
      await expect(
        vault.connect(bob).approveEscrow(alice.address)
      ).to.be.revertedWith("Only manager or owner");
    });

    it("Should transfer PYUSD to employee on approval", async function () {
      const emp = await vault.employees(alice.address);
      const escrowAmount = emp.escrowBalance;
      const balanceBefore = await pyusd.balanceOf(alice.address);

      await vault.connect(manager).approveEscrow(alice.address);

      const balanceAfter = await pyusd.balanceOf(alice.address);
      expect(balanceAfter - balanceBefore).to.equal(escrowAmount);
    });

    it("Should handle batch escrow approval", async function () {
      // Add Bob and create escrow
      await vault.addEmployee(bob.address, ANNUAL_SALARY_BOB, manager.address);
      await vault.connect(bob).clockIn();
      await ethers.provider.send("evm_increaseTime", [8 * 3600]);
      await ethers.provider.send("evm_mine", []);
      
      await vault.connect(bob).clockOut();
      
      const bobAvailable = await vault.getAvailableBalance(bob.address);
      await vault.connect(bob).withdraw(bobAvailable);

      // Batch approve
      await vault.connect(manager).batchApproveEscrow([alice.address, bob.address]);

      const empAlice = await vault.employees(alice.address);
      const empBob = await vault.employees(bob.address);
      
      expect(empAlice.escrowBalance).to.equal(0);
      expect(empBob.escrowBalance).to.equal(0);
    });
  });

  describe("9. Security & Anti-Fraud", function () {
    beforeEach(async function () {
      await vault.deposit(DEPOSIT_AMOUNT);
      await vault.addEmployee(alice.address, ANNUAL_SALARY_ALICE, manager.address);
    });

    it("Should prevent withdrawal when not clocked in and no balance", async function () {
      await expect(
        vault.connect(alice).withdraw(ethers.parseUnits("100", 6))
      ).to.be.revertedWith("No balance to withdraw");
    });

    it("Should allow withdrawal from accrued balance even when clocked out", async function () {
      await vault.connect(alice).clockIn();
      await ethers.provider.send("evm_increaseTime", [8 * 3600]);
      await vault.connect(alice).clockOut();

      const available = await vault.getAvailableBalance(alice.address);
      await expect(vault.connect(alice).withdraw(available / BigInt(2)))
        .to.not.be.reverted;
    });

    it("Should pause contract in emergency", async function () {
      await vault.pause();
      expect(await vault.paused()).to.equal(true);

      await expect(vault.connect(alice).clockIn()).to.be.revertedWith(
        "Contract is paused"
      );
    });

    it("Should unpause contract", async function () {
      await vault.pause();
      await vault.unpause();
      expect(await vault.paused()).to.equal(false);

      await expect(vault.connect(alice).clockIn()).to.not.be.reverted;
    });

    it("Should only allow owner to pause", async function () {
      await expect(vault.connect(alice).pause()).to.be.revertedWith("Only owner");
    });
  });

  describe("10. View Functions & Queries", function () {
    beforeEach(async function () {
      await vault.deposit(DEPOSIT_AMOUNT);
      await vault.addEmployee(alice.address, ANNUAL_SALARY_ALICE, manager.address);
      await vault.addEmployee(bob.address, ANNUAL_SALARY_BOB, manager.address);
    });

    it("Should return employee details", async function () {
      const details = await vault.getEmployeeDetails(alice.address);
      
      expect(details.salaryPerSecond).to.be.gt(0);
      // Annual salary calculation may have small rounding difference due to integer division
      const expectedAnnual = details.salaryPerSecond * BigInt(365 * 24 * 60 * 60);
      expect(expectedAnnual).to.be.closeTo(ANNUAL_SALARY_ALICE, ethers.parseUnits("100", 6));
      expect(details.isActive).to.equal(true);
      expect(details.isClockedIn).to.equal(false);
      expect(details.managerAddress).to.equal(manager.address);
    });

    it("Should return all employees", async function () {
      const employees = await vault.getAllEmployees();
      expect(employees.length).to.equal(2);
      expect(employees).to.include(alice.address);
      expect(employees).to.include(bob.address);
    });

    it("Should return contract balance", async function () {
      const balance = await vault.getContractBalance();
      expect(balance).to.equal(DEPOSIT_AMOUNT);
    });

    it("Should calculate real-time balance while clocked in", async function () {
      await vault.connect(alice).clockIn();
      
      const balance1 = await vault.getTotalAccruedBalance(alice.address);
      
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine", []);
      
      const balance2 = await vault.getTotalAccruedBalance(alice.address);
      
      expect(balance2).to.be.gt(balance1);
    });
  });

  describe("11. Edge Cases", function () {
    beforeEach(async function () {
      await vault.deposit(DEPOSIT_AMOUNT);
    });

    it("Should handle zero salary gracefully", async function () {
      await expect(
        vault.addEmployee(alice.address, 0, manager.address)
      ).to.be.revertedWith("Salary must be > 0");
    });

    it("Should handle very small salary", async function () {
      const tinySalary = ethers.parseUnits("100", 6); // $100/year
      // This should actually work now, so we test it adds successfully
      await expect(
        vault.addEmployee(alice.address, tinySalary, manager.address)
      ).to.not.be.reverted;
      
      const emp = await vault.employees(alice.address);
      expect(emp.salaryPerSecond).to.be.gt(0);
    });

    it("Should prevent removing clocked-in employee", async function () {
      await vault.addEmployee(alice.address, ANNUAL_SALARY_ALICE, manager.address);
      await vault.connect(alice).clockIn();

      await expect(vault.removeEmployee(alice.address)).to.be.revertedWith(
        "Clock out first"
      );
    });

    it("Should handle employee with no escrow balance", async function () {
      await vault.addEmployee(alice.address, ANNUAL_SALARY_ALICE, manager.address);
      
      await expect(
        vault.connect(manager).approveEscrow(alice.address)
      ).to.be.revertedWith("No escrow balance");
    });
  });
});
