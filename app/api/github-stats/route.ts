import { NextRequest, NextResponse } from 'next/server'
import { getGitHubStats } from '@/lib/github-stats'

function sanitizeUsername(value: string | null): string | null {
  const username = value?.trim()
  if (!username || !/^[a-zA-Z0-9-]{1,39}$/.test(username)) return null
  return username
}

export async function GET(request: NextRequest) {
  const username = sanitizeUsername(request.nextUrl.searchParams.get('username'))

  if (!username) {
    return NextResponse.json({ error: 'A valid username is required.' }, { status: 400 })
  }

  const stats = await getGitHubStats(username)
  if (!stats) {
    return NextResponse.json({ error: 'GitHub stats are unavailable.' }, { status: 404 })
  }

  return NextResponse.json(stats, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
  })
}
