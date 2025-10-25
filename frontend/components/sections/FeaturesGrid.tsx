'use client'

const features = [
  {
    label: 'Instant',
    title: 'Streaming Payroll',
    copy: 'Income releases the moment work is completed, eliminating payroll delays.',
  },
  {
    label: 'Accountability',
    title: 'Escrow-backed Assurance',
    copy: 'Automated escrow enforces quality, releasing funds as milestones are approved.',
  },
  {
    label: 'Global',
    title: 'Multi-currency Ready',
    copy: 'PYUSD settlement with live FX ensures teams can work and withdraw anywhere.',
  },
]

const FeaturesGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-blue-200 mb-3">{feature.label}</p>
          <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
          <p className="text-gray-300 text-sm">{feature.copy}</p>
        </div>
      ))}
    </div>
  )
}

export default FeaturesGrid
