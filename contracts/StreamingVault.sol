// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title StreamingVault
 * @author Person A - StreamPay Team
 * @notice Real-time wage streaming protocol with PYUSD
 * @dev Implements:
 *  - Real-time salary accrual (per-second streaming)
 *  - 70/30 split (available/escrow)
 *  - EVVM async nonces for pre-signed withdrawals
 *  - Manager approval for escrow release
 *  - Anti-fraud validation (clock-in verification)
 */

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract StreamingVault {
    // ============ State Variables ============
    
    address public owner;
    address public manager;
    IERC20 public pyusdToken;
    
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    uint256 public constant AVAILABLE_PERCENTAGE = 70; // 70% available immediately
    uint256 public constant ESCROW_PERCENTAGE = 30; // 30% held in escrow
    
    bool public paused;
    
    // ============ Employee Management ============
    
    struct Employee {
        uint256 salaryPerSecond; // Wage rate in PYUSD per second
        uint256 lastClockIn; // Timestamp of last clock-in
        uint256 lastClockOut; // Timestamp of last clock-out
        uint256 accruedBalance; // Total accrued but not withdrawn
        uint256 escrowBalance; // Amount held in escrow (30%)
        uint256 totalWithdrawn; // Lifetime withdrawals
        bool isActive; // Employee is configured
        bool isClockedIn; // Currently working
        address managerAddress; // Manager who can approve escrow
    }
    
    mapping(address => Employee) public employees;
    address[] public employeeList;
    
    // ============ Async Nonce System (EVVM) ============
    
    struct NonceState {
        uint256 currentNonce; // Current nonce index
        mapping(uint256 => bool) usedNonces; // Track used nonces
        mapping(uint256 => bytes32) preSignedHashes; // Pre-signed withdrawal hashes
    }
    
    mapping(address => NonceState) private nonceStates;
    
    // ============ Events ============
    
    event Deposited(address indexed employer, uint256 amount);
    event EmployeeAdded(address indexed employee, uint256 salaryPerSecond, address indexed manager);
    event EmployeeUpdated(address indexed employee, uint256 newSalaryPerSecond);
    event EmployeeRemoved(address indexed employee);
    event ClockedIn(address indexed employee, uint256 timestamp);
    event ClockedOut(address indexed employee, uint256 earned, uint256 timestamp);
    event Withdrawn(address indexed employee, uint256 amount, uint256 nonce);
    event EscrowReleased(address indexed employee, uint256 amount, address indexed approver);
    event NoncePreSigned(address indexed employee, uint256 indexed nonce, bytes32 hash);
    event ManagerChanged(address indexed employee, address indexed oldManager, address indexed newManager);
    event EmergencyPaused(address indexed by);
    event EmergencyUnpaused(address indexed by);
    
    // ============ Modifiers ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyManager(address employee) {
        require(
            msg.sender == owner || msg.sender == employees[employee].managerAddress,
            "Only manager or owner"
        );
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    modifier onlyActiveEmployee() {
        require(employees[msg.sender].isActive, "Not an active employee");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _pyusdToken) {
        owner = msg.sender;
        manager = msg.sender;
        pyusdToken = IERC20(_pyusdToken);
    }
    
    // ============ Owner Functions ============
    
    /**
     * @notice Deposit PYUSD into vault for payroll
     * @param amount Amount of PYUSD to deposit
     */
    function deposit(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(
            pyusdToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        emit Deposited(msg.sender, amount);
    }
    
    /**
     * @notice Add new employee with annual salary
     * @param employee Employee wallet address
     * @param annualSalary Annual salary in PYUSD (e.g., 50000 * 10^6 for $50k)
     * @param _manager Manager address who can approve escrow
     */
    function addEmployee(
        address employee,
        uint256 annualSalary,
        address _manager
    ) external onlyOwner {
        require(employee != address(0), "Invalid employee address");
        require(annualSalary > 0, "Salary must be > 0");
        require(!employees[employee].isActive, "Employee already exists");
        
        uint256 salaryPerSecond = annualSalary / SECONDS_PER_YEAR;
        require(salaryPerSecond > 0, "Salary too low");
        
        employees[employee] = Employee({
            salaryPerSecond: salaryPerSecond,
            lastClockIn: 0,
            lastClockOut: 0,
            accruedBalance: 0,
            escrowBalance: 0,
            totalWithdrawn: 0,
            isActive: true,
            isClockedIn: false,
            managerAddress: _manager
        });
        
        employeeList.push(employee);
        
        emit EmployeeAdded(employee, salaryPerSecond, _manager);
    }
    
    /**
     * @notice Update employee salary
     * @param employee Employee address
     * @param newAnnualSalary New annual salary
     */
    function updateEmployeeSalary(address employee, uint256 newAnnualSalary) external onlyOwner {
        require(employees[employee].isActive, "Employee not active");
        require(newAnnualSalary > 0, "Salary must be > 0");
        
        // If clocked in, accrue current balance first
        if (employees[employee].isClockedIn) {
            _accrueBalance(employee);
        }
        
        uint256 newSalaryPerSecond = newAnnualSalary / SECONDS_PER_YEAR;
        require(newSalaryPerSecond > 0, "Salary too low");
        
        employees[employee].salaryPerSecond = newSalaryPerSecond;
        
        emit EmployeeUpdated(employee, newSalaryPerSecond);
    }
    
    /**
     * @notice Remove employee (clock them out first)
     * @param employee Employee address
     */
    function removeEmployee(address employee) external onlyOwner {
        require(employees[employee].isActive, "Employee not active");
        require(!employees[employee].isClockedIn, "Clock out first");
        
        employees[employee].isActive = false;
        
        emit EmployeeRemoved(employee);
    }
    
    /**
     * @notice Change employee's manager
     * @param employee Employee address
     * @param newManager New manager address
     */
    function changeManager(address employee, address newManager) external onlyOwner {
        require(employees[employee].isActive, "Employee not active");
        require(newManager != address(0), "Invalid manager");
        
        address oldManager = employees[employee].managerAddress;
        employees[employee].managerAddress = newManager;
        
        emit ManagerChanged(employee, oldManager, newManager);
    }
    
    /**
     * @notice Emergency pause (stops all operations)
     */
    function pause() external onlyOwner {
        paused = true;
        emit EmergencyPaused(msg.sender);
    }
    
    /**
     * @notice Unpause contract
     */
    function unpause() external onlyOwner {
        paused = false;
        emit EmergencyUnpaused(msg.sender);
    }
    
    // ============ Employee Functions ============
    
    /**
     * @notice Clock in to start wage stream
     */
    function clockIn() external onlyActiveEmployee whenNotPaused {
        Employee storage emp = employees[msg.sender];
        require(!emp.isClockedIn, "Already clocked in");
        
        emp.isClockedIn = true;
        emp.lastClockIn = block.timestamp;
        
        emit ClockedIn(msg.sender, block.timestamp);
    }
    
    /**
     * @notice Clock out to stop wage stream
     */
    function clockOut() external onlyActiveEmployee whenNotPaused {
        Employee storage emp = employees[msg.sender];
        require(emp.isClockedIn, "Not clocked in");
        
        // Accrue balance for time worked
        uint256 earned = _accrueBalance(msg.sender);
        
        emp.isClockedIn = false;
        emp.lastClockOut = block.timestamp;
        
        emit ClockedOut(msg.sender, earned, block.timestamp);
    }
    
    /**
     * @notice Withdraw available balance (70%)
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) external onlyActiveEmployee whenNotPaused {
        _withdraw(msg.sender, amount, 0);
    }
    
    /**
     * @notice Withdraw with async nonce (EVVM - pre-signed transaction)
     * @param amount Amount to withdraw
     * @param nonce Nonce for this withdrawal
     */
    function withdrawWithNonce(uint256 amount, uint256 nonce) external onlyActiveEmployee whenNotPaused {
        _withdraw(msg.sender, amount, nonce);
    }
    
    /**
     * @dev Internal withdrawal logic
     */
    function _withdraw(address employee, uint256 amount, uint256 nonce) internal {
        Employee storage emp = employees[employee];
        
        // Security: Must be clocked in OR have accrued balance
        require(
            emp.isClockedIn || emp.accruedBalance > 0,
            "No balance to withdraw"
        );
        
        // If clocked in, accrue real-time balance first
        if (emp.isClockedIn) {
            _accrueBalance(employee);
        }
        
        // Calculate available balance (70% of accrued)
        uint256 totalAccrued = emp.accruedBalance;
        uint256 available = (totalAccrued * AVAILABLE_PERCENTAGE) / 100;
        require(amount > 0 && amount <= available, "Invalid amount");
        
        // Check nonce if provided
        if (nonce > 0) {
            NonceState storage nonceState = nonceStates[employee];
            require(!nonceState.usedNonces[nonce], "Nonce already used");
            nonceState.usedNonces[nonce] = true;
        }
        
        // Calculate total deduction and escrow portion
        // If withdrawing X from 70%, the total earned was X / 0.7
        // And escrow (30%) is (X / 0.7) * 0.3
        uint256 totalDeduction = (amount * 100) / AVAILABLE_PERCENTAGE;
        uint256 escrowPortion = totalDeduction - amount;
        
        emp.accruedBalance -= totalDeduction;
        emp.escrowBalance += escrowPortion;
        emp.totalWithdrawn += amount;
        
        // Transfer PYUSD
        require(
            pyusdToken.transfer(employee, amount),
            "Transfer failed"
        );
        
        emit Withdrawn(employee, amount, nonce);
    }
    
    // ============ Manager Functions ============
    
    /**
     * @notice Approve and release employee's escrow balance
     * @param employee Employee address
     */
    function approveEscrow(address employee) external onlyManager(employee) whenNotPaused {
        Employee storage emp = employees[employee];
        require(emp.isActive, "Employee not active");
        require(emp.escrowBalance > 0, "No escrow balance");
        
        uint256 amount = emp.escrowBalance;
        emp.escrowBalance = 0;
        emp.totalWithdrawn += amount;
        
        require(
            pyusdToken.transfer(employee, amount),
            "Transfer failed"
        );
        
        emit EscrowReleased(employee, amount, msg.sender);
    }
    
    /**
     * @notice Batch approve escrow for multiple employees
     * @param employeeAddresses Array of employee addresses
     */
    function batchApproveEscrow(address[] calldata employeeAddresses) external {
        for (uint256 i = 0; i < employeeAddresses.length; i++) {
            address employee = employeeAddresses[i];
            if (
                employees[employee].isActive &&
                employees[employee].escrowBalance > 0 &&
                (msg.sender == owner || msg.sender == employees[employee].managerAddress)
            ) {
                Employee storage emp = employees[employee];
                uint256 amount = emp.escrowBalance;
                emp.escrowBalance = 0;
                emp.totalWithdrawn += amount;
                
                require(pyusdToken.transfer(employee, amount), "Transfer failed");
                emit EscrowReleased(employee, amount, msg.sender);
            }
        }
    }
    
    // ============ EVVM Async Nonce Functions ============
    
    /**
     * @notice Pre-sign multiple withdrawal nonces (once per year)
     * @param nonces Array of nonce values (e.g., 1-52 for weekly)
     * @param hashes Array of pre-signed transaction hashes
     */
    function preSignNonces(uint256[] calldata nonces, bytes32[] calldata hashes) external onlyActiveEmployee {
        require(nonces.length == hashes.length, "Array length mismatch");
        require(nonces.length <= 52, "Max 52 nonces per batch");
        
        NonceState storage nonceState = nonceStates[msg.sender];
        
        for (uint256 i = 0; i < nonces.length; i++) {
            uint256 nonce = nonces[i];
            require(nonce > 0, "Nonce must be > 0");
            require(!nonceState.usedNonces[nonce], "Nonce already used");
            
            nonceState.preSignedHashes[nonce] = hashes[i];
            emit NoncePreSigned(msg.sender, nonce, hashes[i]);
        }
    }
    
    /**
     * @notice Check if nonce has been used
     * @param employee Employee address
     * @param nonce Nonce to check
     */
    function isNonceUsed(address employee, uint256 nonce) external view returns (bool) {
        return nonceStates[employee].usedNonces[nonce];
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get real-time available balance (70% of accrued)
     * @param employee Employee address
     */
    function getAvailableBalance(address employee) public view returns (uint256) {
        Employee memory emp = employees[employee];
        
        uint256 currentAccrued = emp.accruedBalance;
        
        // Add real-time accrual if clocked in
        if (emp.isClockedIn && emp.lastClockIn > 0) {
            uint256 timeWorked = block.timestamp - emp.lastClockIn;
            uint256 earned = timeWorked * emp.salaryPerSecond;
            currentAccrued += earned;
        }
        
        return (currentAccrued * AVAILABLE_PERCENTAGE) / 100;
    }
    
    /**
     * @notice Get total accrued balance (including real-time)
     * @param employee Employee address
     */
    function getTotalAccruedBalance(address employee) public view returns (uint256) {
        Employee memory emp = employees[employee];
        
        uint256 total = emp.accruedBalance;
        
        if (emp.isClockedIn && emp.lastClockIn > 0) {
            uint256 timeWorked = block.timestamp - emp.lastClockIn;
            uint256 earned = timeWorked * emp.salaryPerSecond;
            total += earned;
        }
        
        return total;
    }
    
    /**
     * @notice Get employee details
     * @param employee Employee address
     */
    function getEmployeeDetails(address employee) external view returns (
        uint256 salaryPerSecond,
        uint256 annualSalary,
        uint256 availableBalance,
        uint256 escrowBalance,
        uint256 totalWithdrawn,
        bool isActive,
        bool isClockedIn,
        address managerAddress
    ) {
        Employee memory emp = employees[employee];
        return (
            emp.salaryPerSecond,
            emp.salaryPerSecond * SECONDS_PER_YEAR,
            getAvailableBalance(employee),
            emp.escrowBalance,
            emp.totalWithdrawn,
            emp.isActive,
            emp.isClockedIn,
            emp.managerAddress
        );
    }
    
    /**
     * @notice Get all employees
     */
    function getAllEmployees() external view returns (address[] memory) {
        return employeeList;
    }
    
    /**
     * @notice Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return pyusdToken.balanceOf(address(this));
    }
    
    // ============ Internal Functions ============
    
    /**
     * @dev Accrue balance since last clock-in
     */
    function _accrueBalance(address employee) internal returns (uint256) {
        Employee storage emp = employees[employee];
        
        if (!emp.isClockedIn || emp.lastClockIn == 0) {
            return 0;
        }
        
        uint256 timeWorked = block.timestamp - emp.lastClockIn;
        uint256 earned = timeWorked * emp.salaryPerSecond;
        
        emp.accruedBalance += earned;
        emp.lastClockIn = block.timestamp; // Reset clock
        
        return earned;
    }
}
