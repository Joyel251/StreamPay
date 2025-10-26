import { useState, useEffect } from 'react'
import type { EmployeeProfile } from '@/lib/profiles'

/**
 * Hook to manage employee profiles
 */
export function useProfile(address: string | null | undefined) {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address) {
      setProfile(null)
      return
    }

    fetchProfile(address)
  }, [address])

  const fetchProfile = async (addr: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/profiles?address=${addr}`)
      
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
      } else if (response.status === 404) {
        setProfile(null)
      } else {
        throw new Error('Failed to fetch profile')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (data: Partial<EmployeeProfile>) => {
    if (!address) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, ...data }),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const result = await response.json()
      setProfile(result.profile)
      return result.profile
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteProfile = async () => {
    if (!address) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/profiles?address=${address}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete profile')
      }

      setProfile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    profile,
    loading,
    error,
    updateProfile,
    deleteProfile,
    refetch: () => address && fetchProfile(address),
  }
}

/**
 * Hook to get all profiles (for employer/manager)
 */
export function useProfiles() {
  const [profiles, setProfiles] = useState<EmployeeProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({ total: 0, withNames: 0, withEmails: 0 })

  const fetchProfiles = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/profiles')
      
      if (!response.ok) {
        throw new Error('Failed to fetch profiles')
      }

      const data = await response.json()
      setProfiles(data.profiles)
      setStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const searchProfiles = async (query: string) => {
    if (!query.trim()) {
      fetchProfiles()
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/profiles?search=${encodeURIComponent(query)}`)
      
      if (!response.ok) {
        throw new Error('Failed to search profiles')
      }

      const data = await response.json()
      setProfiles(data.profiles)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  return {
    profiles,
    loading,
    error,
    stats,
    refetch: fetchProfiles,
    search: searchProfiles,
  }
}
