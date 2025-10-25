'use client'

import Link from 'next/link'
import GradientBlinds from '@/components/GradientBlinds'
import WalletButton from '@/components/WalletButton'

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* GradientBlinds Background */}
      <div className="absolute inset-0 z-0">
        <GradientBlinds
          gradientColors={['#FF9FFC', '#5227FF']}
          angle={45}
          noise={0.3}
          blindCount={12}
          blindMinWidth={50}
          spotlightRadius={0.5}
          spotlightSoftness={1}
          spotlightOpacity={1}
          mouseDampening={0.15}
          distortAmount={0}
          shineDirection="left"
          mixBlendMode="lighten"
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <span className="text-2xl font-bold text-white">StreamPay</span>
          </div>
          <WalletButton />
        </header>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-tight">
                Get Paid for the Work You Do,
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  The Second You Do It
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
                Real-time wage streaming powered by blockchain technology. 
                Work, earn, withdraw—instantly.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                <div className="text-4xl mb-3">⚡</div>
                <h3 className="text-xl font-semibold text-white mb-2">Instant Payments</h3>
                <p className="text-gray-300 text-sm">Wages stream in real-time as you work. No more waiting for payday.</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                <div className="text-4xl mb-3">🔒</div>
                <h3 className="text-xl font-semibold text-white mb-2">Secure Escrow</h3>
                <p className="text-gray-300 text-sm">30% held in escrow for quality assurance. Protected by smart contracts.</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                <div className="text-4xl mb-3">🌐</div>
                <h3 className="text-xl font-semibold text-white mb-2">Global Access</h3>
                <p className="text-gray-300 text-sm">PYUSD stablecoin with live exchange rates. Work from anywhere.</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
              <Link 
                href="/employee"
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg overflow-hidden hover:scale-105 transition-transform"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  👨‍💼 Employee App
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Link>
              
              <Link 
                href="/employer"
                className="group relative px-8 py-4 bg-white/10 backdrop-blur-lg text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  🏢 Employer Dashboard
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Link>
              
              <Link 
                href="/manager"
                className="group relative px-8 py-4 bg-white/10 backdrop-blur-lg text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  👔 Manager Panel
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 pt-12 border-t border-white/20 max-w-3xl mx-auto">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">⚡</div>
                <div className="text-sm text-gray-400">Powered by Pyth Network</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">🔐</div>
                <div className="text-sm text-gray-400">Smart Contract Security</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">💎</div>
                <div className="text-sm text-gray-400">PYUSD Stablecoin</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-6 text-center text-gray-400 text-sm">
          <p>Built for the future of work • Powered by blockchain technology</p>
        </footer>
      </div>
    </main>
  )
}
