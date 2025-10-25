'use client'

import Link from 'next/link'
import GradientBlinds from '@/components/GradientBlinds'
import WalletButton from '@/components/WalletButton'
import SplitText from '@/components/ui/SplitText'
import { MorphingText } from '@/components/ui/morphing-text'

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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-lg font-semibold text-white tracking-wide">SP</span>
            </div>
            <span className="text-2xl font-semibold text-white tracking-tight">StreamPay</span>
          </div>
          <WalletButton />
        </header>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Main Heading */}
            <div className="space-y-6">
              <SplitText
                text="StreamPay"
                tag="h1"
                className="text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight"
                delay={80}
                duration={0.7}
                from={{ opacity: 0, y: 60 }}
                to={{ opacity: 1, y: 0 }}
                textAlign="center"
              />
              <MorphingText
                texts={['Get Paid for the Work You Do', 'The Second You Do It']}
                className="text-white"
              />
              <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
                Real-time wage streaming powered by blockchain technology. Work, earn, withdraw—instantly.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                <p className="text-xs uppercase tracking-[0.3em] text-blue-200 mb-3">Instant</p>
                <h3 className="text-xl font-semibold text-white mb-2">Streaming Payroll</h3>
                <p className="text-gray-300 text-sm">Income releases the moment work is completed, eliminating payroll delays.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                <p className="text-xs uppercase tracking-[0.3em] text-blue-200 mb-3">Accountability</p>
                <h3 className="text-xl font-semibold text-white mb-2">Escrow-backed Assurance</h3>
                <p className="text-gray-300 text-sm">Automated escrow enforces quality, releasing funds as milestones are approved.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                <p className="text-xs uppercase tracking-[0.3em] text-blue-200 mb-3">Global</p>
                <h3 className="text-xl font-semibold text-white mb-2">Multi-currency Ready</h3>
                <p className="text-gray-300 text-sm">PYUSD settlement with live FX ensures teams can work and withdraw anywhere.</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
              <Link 
                href="/employee"
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg overflow-hidden hover:scale-105 transition-transform"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Employee App
                  <span className="group-hover:translate-x-1 transition-transform" aria-hidden>-&gt;</span>
                </span>
              </Link>
              
              <Link 
                href="/employer"
                className="group relative px-8 py-4 bg-white/10 backdrop-blur-lg text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  Employer Dashboard
                  <span className="group-hover:translate-x-1 transition-transform" aria-hidden>-&gt;</span>
                </span>
              </Link>
              
              <Link 
                href="/manager"
                className="group relative px-8 py-4 bg-white/10 backdrop-blur-lg text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  Manager Panel
                  <span className="group-hover:translate-x-1 transition-transform" aria-hidden>-&gt;</span>
                </span>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 pt-12 border-t border-white/20 max-w-3xl mx-auto">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-blue-200 mb-2">Network</p>
                <div className="text-lg font-semibold text-white">Powered by Pyth</div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-blue-200 mb-2">Security</p>
                <div className="text-lg font-semibold text-white">Auditable Smart Contracts</div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-blue-200 mb-2">Settlement</p>
                <div className="text-lg font-semibold text-white">Backed by PYUSD Stablecoin</div>
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
