import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

function sanitizeUsername(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const username = value.trim().toLowerCase()
  if (!username || !/^[a-z0-9-]{1,39}$/.test(username)) return null
  return username
}

function isAuthorized(request: NextRequest): boolean {
  const token = process.env.ADMIN_API_TOKEN
  if (!token) return false
  return request.headers.get('authorization') === `Bearer ${token}`
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const username = sanitizeUsername(body?.username)
  const action = body?.action

  if (!username) {
    return NextResponse.json({ error: 'A valid username is required.' }, { status: 400 })
  }

  const counterKey = `views:${username}`

  if (action === 'reset') {
    await redis.set(counterKey, 0)
    return NextResponse.json({ username, views: 0 })
  }

  if (action === 'set') {
    const views = Number(body?.count)
    if (!Number.isSafeInteger(views) || views < 0) {
      return NextResponse.json({ error: 'count must be a non-negative integer.' }, { status: 400 })
    }

    await redis.set(counterKey, views)
    return NextResponse.json({ username, views })
  }

  return NextResponse.json({ error: 'action must be reset or set.' }, { status: 400 })
}
