import { NextRequest, NextResponse } from 'next/server'
import { profileService } from '@/lib/profiles'

/**
 * GET /api/profiles - Get all profiles
 * GET /api/profiles?address=0x... - Get specific profile
 * GET /api/profiles?search=query - Search profiles
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    const search = searchParams.get('search')

    if (address) {
      const profile = await profileService.getProfile(address)
      if (!profile) {
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ profile })
    }

    if (search) {
      const profiles = await profileService.searchProfiles(search)
      return NextResponse.json({ profiles, count: profiles.length })
    }

    const profiles = await profileService.getAllProfiles()
    const stats = await profileService.getStats()
    
    return NextResponse.json({ profiles, stats, count: profiles.length })
  } catch (error) {
    console.error('Error fetching profiles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/profiles - Create or update profile
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, ...data } = body

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Basic validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      )
    }

    const profile = await profileService.upsertProfile(address, data)
    
    return NextResponse.json({ 
      profile,
      message: 'Profile saved successfully'
    })
  } catch (error) {
    console.error('Error saving profile:', error)
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/profiles?address=0x... - Delete profile
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    const deleted = await profileService.deleteProfile(address)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      message: 'Profile deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting profile:', error)
    return NextResponse.json(
      { error: 'Failed to delete profile' },
      { status: 500 }
    )
  }
}
