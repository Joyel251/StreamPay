'use client'

import { useState } from 'react'
import { ConnectKitButton } from 'connectkit'

/**
 * Person B: Employer Dashboard
 * TODO:
 * 1. Deposit PYUSD form
 * 2. Add employee form (address, annual salary)
 * 3. View current balance in contract
 * 4. List all employees
 */

export default function EmployerDashboard() {
  const [depositAmount, setDepositAmount] = useState('')
  const [employeeAddress, setEmployeeAddress] = useState('')
  const [annualSalary, setAnnualSalary] = useState('')

  const handleDeposit = async () => {
    // TODO: Call contract deposit() function
    console.log('Depositing:', depositAmount, 'PYUSD')
  }

  const handleAddEmployee = async () => {
    // TODO: Call contract addEmployee() function
    console.log('Adding employee:', employeeAddress, annualSalary)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Employer Dashboard</h1>
          <ConnectKitButton />
        </div>

        {/* Deposit Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Deposit PYUSD</h2>
          <div className="flex gap-4">
            <input
              type="number"
              placeholder="Amount (PYUSD)"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="flex-1 border rounded px-4 py-2"
            />
            <button
              onClick={handleDeposit}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Deposit
            </button>
          </div>
        </div>

        {/* Add Employee Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Add Employee</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Employee Wallet Address"
              value={employeeAddress}
              onChange={(e) => setEmployeeAddress(e.target.value)}
              className="w-full border rounded px-4 py-2"
            />
            <input
              type="number"
              placeholder="Annual Salary (PYUSD)"
              value={annualSalary}
              onChange={(e) => setAnnualSalary(e.target.value)}
              className="w-full border rounded px-4 py-2"
            />
            <button
              onClick={handleAddEmployee}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Add Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
