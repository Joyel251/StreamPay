import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">💰 StreamPay</h1>
        <p className="text-2xl mb-8">Get paid for the work you do, the second you do it</p>
        
        <div className="flex gap-4 justify-center">
          <Link 
            href="/employer"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Employer Dashboard
          </Link>
          
          <Link 
            href="/employee"
            className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Employee App
          </Link>
          
          <Link 
            href="/manager"
            className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Manager Panel
          </Link>
        </div>
      </div>
    </main>
  )
}
