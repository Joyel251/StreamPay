'use client'

import { useState, useEffect } from 'react'
import type { EmployeeProfile } from '@/lib/profiles'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  address: string
  initialProfile?: EmployeeProfile | null
  onSave?: (profile: EmployeeProfile) => void
}

export default function ProfileModal({
  isOpen,
  onClose,
  address,
  initialProfile,
  onSave,
}: ProfileModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    currency: 'PYUSD' as 'PYUSD' | 'USD' | 'PHP',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialProfile) {
      setFormData({
        name: initialProfile.name || '',
        email: initialProfile.email || '',
        phone: initialProfile.phone || '',
        department: initialProfile.department || '',
        position: initialProfile.position || '',
        currency: initialProfile.preferences?.currency || 'PYUSD',
      })
    }
  }, [initialProfile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          ...formData,
          preferences: {
            currency: formData.currency,
            notifications: true,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save profile')
      }

      const result = await response.json()
      onSave?.(result.profile)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500/30 to-blue-500/30 px-6 py-4 border-b border-white/20 flex items-center justify-between sticky top-0">
          <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 focus:outline-none"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 focus:outline-none"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 focus:outline-none"
              placeholder="+1 234 567 8900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 focus:outline-none"
                placeholder="Engineering"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Position
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 focus:outline-none"
                placeholder="Developer"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Preferred Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value as 'PYUSD' | 'USD' | 'PHP' })}
              className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 focus:outline-none"
            >
              <option value="PYUSD" className="bg-gray-900">PYUSD</option>
              <option value="USD" className="bg-gray-900">USD</option>
              <option value="PHP" className="bg-gray-900">PHP</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/10 text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all font-semibold"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
