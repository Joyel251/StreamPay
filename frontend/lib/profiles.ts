/**
 * Employee Profile Management
 * Store off-chain data like names, photos, preferences
 */

export interface EmployeeProfile {
  address: string
  name?: string
  email?: string
  phone?: string
  avatar?: string
  department?: string
  position?: string
  startDate?: string
  preferences?: {
    currency?: 'PYUSD' | 'USD' | 'PHP'
    notifications?: boolean
  }
  metadata?: Record<string, string | number | boolean>
  createdAt: string
  updatedAt: string
}

// In-memory storage (replace with database later)
const profiles: Map<string, EmployeeProfile> = new Map()

export const profileService = {
  /**
   * Get employee profile by wallet address
   */
  getProfile: async (address: string): Promise<EmployeeProfile | null> => {
    const normalized = address.toLowerCase()
    return profiles.get(normalized) || null
  },

  /**
   * Create or update employee profile
   */
  upsertProfile: async (
    address: string,
    data: Partial<Omit<EmployeeProfile, 'address' | 'createdAt' | 'updatedAt'>>
  ): Promise<EmployeeProfile> => {
    const normalized = address.toLowerCase()
    const existing = profiles.get(normalized)
    const now = new Date().toISOString()

    const profile: EmployeeProfile = {
      address: normalized,
      ...existing,
      ...data,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    }

    profiles.set(normalized, profile)
    return profile
  },

  /**
   * Get all profiles (for employer/manager view)
   */
  getAllProfiles: async (): Promise<EmployeeProfile[]> => {
    return Array.from(profiles.values())
  },

  /**
   * Delete profile
   */
  deleteProfile: async (address: string): Promise<boolean> => {
    const normalized = address.toLowerCase()
    return profiles.delete(normalized)
  },

  /**
   * Search profiles by name or email
   */
  searchProfiles: async (query: string): Promise<EmployeeProfile[]> => {
    const lowerQuery = query.toLowerCase()
    return Array.from(profiles.values()).filter(
      profile =>
        profile.name?.toLowerCase().includes(lowerQuery) ||
        profile.email?.toLowerCase().includes(lowerQuery) ||
        profile.address.toLowerCase().includes(lowerQuery)
    )
  },

  /**
   * Get profile stats
   */
  getStats: async (): Promise<{
    total: number
    withNames: number
    withEmails: number
  }> => {
    const all = Array.from(profiles.values())
    return {
      total: all.length,
      withNames: all.filter(p => p.name).length,
      withEmails: all.filter(p => p.email).length,
    }
  },
}
