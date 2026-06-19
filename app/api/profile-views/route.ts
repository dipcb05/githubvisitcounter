import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

// SVG badge styles
const STYLES = {
  flat: {
    leftWidth: 100,
    rightWidth: 75,
    radius: 0,
  },
  'flat-square': {
    leftWidth: 100,
    rightWidth: 75,
    radius: 0,
  },
  plastic: {
    leftWidth: 100,
    rightWidth: 75,
    radius: 3,
  },
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

function generateSVG(
  label: string,
  message: string,
  color: string,
  style: keyof typeof STYLES = 'flat'
): string {
  const styleConfig = STYLES[style] || STYLES.flat
  const leftWidth = styleConfig.leftWidth
  const rightWidth = styleConfig.rightWidth
  const radius = styleConfig.radius

  // Calculate text widths (rough estimates)
  const labelWidth = Math.max(label.length * 7 + 10, 50)
  const messageWidth = Math.max(message.length * 7 + 10, 50)
  const totalWidth = labelWidth + messageWidth
  const leftX = labelWidth

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${totalWidth}" height="20" role="img" aria-label="${label}: ${message}">
    <title>${label}: ${message}</title>
    <linearGradient id="s" x2="0" y2="100%">
      <stop offset="0" stop-color="#bbb"/>
      <stop offset="1" stop-color="#999"/>
    </linearGradient>
    <clipPath id="r">
      <rect width="${totalWidth}" height="20" rx="${radius}" fill="#fff"/>
    </clipPath>
    <g clip-path="url(#r)">
      <rect width="${labelWidth}" height="20" fill="#555"/>
      <rect x="${leftX}" width="${messageWidth}" height="20" fill="#${color}"/>
      <rect width="${totalWidth}" height="20" fill="url(#s)" opacity="0.1"/>
    </g>
    <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110" letter-spacing="-0.05em">
      <text aria-hidden="true" x="${(labelWidth / 2) * 10}" y="150" fill="#010101" fill-opacity="0.3" transform="scale(.1)">${label}</text>
      <text x="${(labelWidth / 2) * 10}" y="140" transform="scale(.1)" fill="#fff">${label}</text>
      <text aria-hidden="true" x="${(leftX + messageWidth / 2) * 10}" y="150" fill="#010101" fill-opacity="0.3" transform="scale(.1)">${message}</text>
      <text x="${(leftX + messageWidth / 2) * 10}" y="140" transform="scale(.1)" fill="#fff">${message}</text>
    </g>
  </svg>`
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const username = searchParams.get('username') || 'guest'
    const label = searchParams.get('label') || 'Profile views'
    let color = searchParams.get('color') || '0e75b6'
    const style = (searchParams.get('style') || 'flat') as keyof typeof STYLES

    // Clean color: remove # if present
    color = color.replace('#', '')

    // Create a unique key for this username
    const counterKey = `views:${username}`

    // Increment the counter
    const views = await redis.incr(counterKey)

    // Set expiration to 1 year to persist data
    await redis.expire(counterKey, 31536000)

    // Format the view count
    const formattedViews = formatNumber(views)

    // Generate SVG
    const svg = generateSVG(label, formattedViews, color, style)

    // Return as SVG with proper headers
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('[v0] Profile views API error:', error)

    // Return a fallback error badge
    const errorSVG = generateSVG('Error', 'Failed', 'dc143c')
    return new NextResponse(errorSVG, {
      status: 500,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
      },
    })
  }
}
