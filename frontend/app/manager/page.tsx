'use client'

import WalletButton from '@/components/WalletButton'

/**
 * Person B: Manager Panel
 * TODO:
 * 1. List all employees with pending escrow
 * 2. Show hours worked this week
 * 3. Approve/reject individual or batch
 */

export default function ManagerPanel() {
  // Mock data - replace with contract calls
  const employees = [
    { address: '0x1234...5678', name: 'Alice', hours: 40, escrow: 137.04 },
    { address: '0x8765...4321', name: 'Bob', hours: 40, escrow: 82.26 },
  ]

  const handleApprove = async (address: string) => {
    // TODO: Call contract approveEscrow() function
    console.log('Approving escrow for:', address)
  }

  const handleApproveAll = async () => {
    // TODO: Batch approve all employees
    console.log('Approving all')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Manager Panel</h1>
          <WalletButton />
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Weekly Approvals</h2>
            <button
              onClick={handleApproveAll}
              className="bg-white text-blue-600 px-6 py-2 rounded font-semibold hover:bg-gray-100"
            >
              Approve All
            </button>
          </div>

          <div className="divide-y">
            {employees.map((emp, idx) => (
              <div key={idx} className="p-6 flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-lg">{emp.name}</p>
                  <p className="text-gray-600">{emp.address}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Hours this week: {emp.hours} hours
                  </p>
                </div>
                
                <div className="text-right mr-8">
                  <p className="text-sm text-gray-600">Escrow Amount</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {emp.escrow} PYUSD
                  </p>
                </div>

                <button
                  onClick={() => handleApprove(emp.address)}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
