import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

function sanitizeUsername(value: string | null): string | null {
  const username = value?.trim().toLowerCase()
  if (!username || !/^[a-z0-9-]{1,39}$/.test(username)) return null
  return username
}

export async function GET(request: NextRequest) {
  const username = sanitizeUsername(request.nextUrl.searchParams.get('username'))

  if (!username) {
    return NextResponse.json({ error: 'A valid username is required.' }, { status: 400 })
  }

  const views = Number((await redis.get<number | string>(`views:${username}`)) || 0)
  return NextResponse.json({ username, views })
}
