'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import WalletButton from '@/components/WalletButton'
import GradientBlinds from '@/components/GradientBlinds'
import SplitText from '@/components/ui/SplitText'
import SlicedText from '@/components/ui/SlicedText'
import ShinyText from '@/components/ui/ShinyText'
import { MorphingText } from '@/components/ui/morphing-text'
import FeaturesGrid from '@/components/sections/FeaturesGrid'

const heroMorphTexts = [
  'Get paid the second you finish',
  'Skip the wait Secure your pay!!',
]

const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches)
    setPrefersReducedMotion(media.matches)
    if (media.addEventListener) media.addEventListener('change', handleChange)
    else media.addListener(handleChange)
    return () => {
      if (media.removeEventListener) media.removeEventListener('change', handleChange)
      else media.removeListener(handleChange)
    }
  }, [])

  return prefersReducedMotion
}

const HeroHeading = ({ reduceMotion }: { reduceMotion: boolean }) => {
  const [showSplit, setShowSplit] = useState(true)

  return (
    <div className="flex flex-col items-center text-center gap-6">
      {showSplit ? (
        <SplitText
          text="StreamPay"
          tag="h1"
          className="text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight"
          delay={80}
          duration={0.7}
          from={{ opacity: 0, y: 60 }}
          to={{ opacity: 1, y: 0 }}
          textAlign="center"
          onLetterAnimationComplete={() => setShowSplit(false)}
        />
      ) : (
        <SlicedText
          text="StreamPay"
          className="text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight"
          containerClassName="max-w-fit mx-auto"
          splitSpacing={6}
        />
      )}

      <div className="w-full">
        {reduceMotion ? (
          <p className="text-3xl md:text-4xl font-semibold text-white leading-tight">
            Get Paid for the Work You Do
            <br className="hidden md:block" />
            <span className="block md:inline">The Second You Do It</span>
          </p>
        ) : (
          <MorphingText texts={heroMorphTexts} className="text-white" />
        )}
      </div>
    </div>
  )
}

export default function Home() {
  const reduceMotion = usePrefersReducedMotion()

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
          spotlightRadius={0.2}
          spotlightSoftness={1}
          spotlightOpacity={1}
          mouseDampening={0.15}
          distortAmount={50}
          shineDirection="left"
          mixBlendMode="lighten"
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 flex justify-end items-center">
          <WalletButton />
        </header>

        {/* Hero Section */}
  <div className="flex-1 flex flex-col items-center justify-center px-8 text-center pt-40 pb-32">
          <div className="max-w-5xl mx-auto">
            {/* Main Heading */}
            <HeroHeading reduceMotion={reduceMotion} />

            {/* Supporting Copy */}
            <div className="flex flex-col items-center gap-6 mt-48 md:mt-64">
              <ShinyText
                text="Real-time wage streaming powered by blockchain technology."
                speed={3}
                disabled={reduceMotion}
                className="text-base md:text-lg lg:text-xl tracking-wide"
              />

              <p className="text-xl md:text-2xl text-gray-200 max-w-3xl leading-relaxed text-center">
                Work, earn, and withdraw on your schedule with settlement secured on-chain.
              </p>
            </div>

            {/* Features */}
            <div className="mt-24">
              <FeaturesGrid />
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
