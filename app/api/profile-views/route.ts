import { Redis } from '@upstash/redis'
import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

const STYLES = {
  flat: { radius: 0, height: 20, fontSize: 110, yShadow: 150, yText: 140, fontFamily: 'Verdana,Geneva,DejaVu Sans,sans-serif' },
  'flat-square': { radius: 0, height: 20, fontSize: 110, yShadow: 150, yText: 140, fontFamily: 'Verdana,Geneva,DejaVu Sans,sans-serif' },
  plastic: { radius: 3, height: 20, fontSize: 110, yShadow: 150, yText: 140, fontFamily: 'Verdana,Geneva,DejaVu Sans,sans-serif' },
  rounded: { radius: 10, height: 20, fontSize: 110, yShadow: 150, yText: 140, fontFamily: 'Verdana,Geneva,DejaVu Sans,sans-serif' },
  'for-the-badge': { radius: 4, height: 28, fontSize: 120, yShadow: 190, yText: 180, fontFamily: 'Arial,Helvetica,sans-serif' },
  social: { radius: 3, height: 20, fontSize: 110, yShadow: 150, yText: 140, fontFamily: 'Verdana,Geneva,DejaVu Sans,sans-serif', social: true },
}

type BadgeStyle = keyof typeof STYLES
type CountMode = 'unique' | 'total'

const DEFAULT_COLOR = '0e75b6'
const DEFAULT_TTL_SECONDS = 21600
const MIN_TTL_SECONDS = 60
const MAX_TTL_SECONDS = 86400
const COUNTER_EXPIRY_SECONDS = 31536000

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function sanitizeText(value: string, fallback: string, maxLength = 48): string {
  const trimmed = value.trim().slice(0, maxLength)
  return trimmed || fallback
}

function sanitizeColor(value: string): string {
  const color = value.replace('#', '').trim()
  return /^[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(color) ? color : DEFAULT_COLOR
}

function sanitizeStyle(value: string | null): BadgeStyle {
  return value && value in STYLES ? (value as BadgeStyle) : 'flat'
}

function sanitizeMode(value: string | null): CountMode {
  return value === 'total' ? 'total' : 'unique'
}

function sanitizeTtl(value: string | null): number {
  const ttl = Number(value)
  if (!Number.isFinite(ttl)) return DEFAULT_TTL_SECONDS
  return Math.min(Math.max(Math.floor(ttl), MIN_TTL_SECONDS), MAX_TTL_SECONDS)
}

function getClientFingerprint(request: NextRequest, username: string): string {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const ip = forwardedFor || request.headers.get('x-real-ip') || request.headers.get('cf-connecting-ip') || 'unknown-ip'
  const userAgent = request.headers.get('user-agent') || 'unknown-agent'
  return createHash('sha256').update(`${username}:${ip}:${userAgent}`).digest('hex')
}

async function getCurrentViews(counterKey: string): Promise<number> {
  const views = await redis.get<number | string>(counterKey)
  return Number(views || 0)
}

async function getViews(request: NextRequest, username: string, mode: CountMode, ttlSeconds: number): Promise<number> {
  const counterKey = `views:${username}`

  if (mode === 'total') {
    const views = await redis.incr(counterKey)
    await redis.expire(counterKey, COUNTER_EXPIRY_SECONDS)
    return views
  }

  const fingerprint = getClientFingerprint(request, username)
  const visitorKey = `views:${username}:visitor:${fingerprint}`
  const wasNewVisitor = await redis.set(visitorKey, '1', { nx: true, ex: ttlSeconds })

  if (wasNewVisitor) {
    const views = await redis.incr(counterKey)
    await redis.expire(counterKey, COUNTER_EXPIRY_SECONDS)
    return views
  }

  return getCurrentViews(counterKey)
}

function generateSVG(label: string, message: string, color: string, style: BadgeStyle = 'flat'): string {
  const styleConfig = STYLES[style] || STYLES.flat
  const height = styleConfig.height
  const safeLabel = escapeXml(label)
  const safeMessage = escapeXml(message)
  const labelWidth = Math.max(label.length * (style === 'for-the-badge' ? 8 : 7) + 14, 56)
  const messageWidth = Math.max(message.length * (style === 'for-the-badge' ? 8 : 7) + 14, 50)
  const totalWidth = labelWidth + messageWidth
  const leftX = labelWidth
  const rightFill = styleConfig.social ? '#fafafa' : `#${color}`
  const rightTextFill = styleConfig.social ? '#333' : '#fff'
  const leftFill = styleConfig.social ? '#f5f5f5' : '#555'
  const leftTextFill = styleConfig.social ? '#333' : '#fff'

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}" role="img" aria-label="${safeLabel}: ${safeMessage}">
    <title>${safeLabel}: ${safeMessage}</title>
    <linearGradient id="s" x2="0" y2="100%">
      <stop offset="0" stop-color="#bbb"/>
      <stop offset="1" stop-color="#999"/>
    </linearGradient>
    <clipPath id="r">
      <rect width="${totalWidth}" height="${height}" rx="${styleConfig.radius}" fill="#fff"/>
    </clipPath>
    <g clip-path="url(#r)">
      <rect width="${labelWidth}" height="${height}" fill="${leftFill}"/>
      <rect x="${leftX}" width="${messageWidth}" height="${height}" fill="${rightFill}"/>
      <rect width="${totalWidth}" height="${height}" fill="url(#s)" opacity="${styleConfig.social ? '0.05' : '0.1'}"/>
    </g>
    <g text-anchor="middle" font-family="${styleConfig.fontFamily}" text-rendering="geometricPrecision" font-size="${styleConfig.fontSize}" letter-spacing="-0.05em">
      <text aria-hidden="true" x="${(labelWidth / 2) * 10}" y="${styleConfig.yShadow}" fill="#010101" fill-opacity="0.3" transform="scale(.1)">${safeLabel}</text>
      <text x="${(labelWidth / 2) * 10}" y="${styleConfig.yText}" transform="scale(.1)" fill="${leftTextFill}">${safeLabel}</text>
      <text aria-hidden="true" x="${(leftX + messageWidth / 2) * 10}" y="${styleConfig.yShadow}" fill="#010101" fill-opacity="0.3" transform="scale(.1)">${safeMessage}</text>
      <text x="${(leftX + messageWidth / 2) * 10}" y="${styleConfig.yText}" transform="scale(.1)" fill="${rightTextFill}">${safeMessage}</text>
    </g>
  </svg>`
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const username = sanitizeText(searchParams.get('username') || 'guest', 'guest', 39).toLowerCase()
    const label = sanitizeText(searchParams.get('label') || 'Profile views', 'Profile views')
    const color = sanitizeColor(searchParams.get('color') || DEFAULT_COLOR)
    const style = sanitizeStyle(searchParams.get('style'))
    const mode = sanitizeMode(searchParams.get('mode'))
    const ttlSeconds = sanitizeTtl(searchParams.get('ttl'))
    const isPreview = searchParams.get('preview') === 'true'

    const views = isPreview ? 1234 : await getViews(request, username, mode, ttlSeconds)
    const svg = generateSVG(label, formatNumber(views), color, style)

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('[githubvisitcounter] Profile views API error:', error)
    const errorSVG = generateSVG('Error', 'Failed', 'dc143c')
    return new NextResponse(errorSVG, {
      status: 500,
      headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
    })
  }
}
