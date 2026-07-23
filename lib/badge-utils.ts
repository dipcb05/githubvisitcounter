export type CountMode = 'unique' | 'total'

export interface BadgeUrlOptions {
  mode?: CountMode
  ttl?: number
  preview?: boolean
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

export function generateBadgeUrl(
  baseUrl: string,
  username: string,
  label: string,
  color: string,
  style: string,
  options: BadgeUrlOptions = {}
): string {
  const params = new URLSearchParams({
    username,
    label,
    color: color.replace('#', ''),
    style,
    mode: options.mode || 'unique',
  })

  if (options.ttl) {
    params.set('ttl', options.ttl.toString())
  }

  if (options.preview) {
    params.set('preview', 'true')
  }

  return `${baseUrl}/api/profile-views?${params.toString()}`
}

export function generateMarkdownCode(badgeUrl: string, username: string): string {
  return `<img src="${badgeUrl}" alt="${username} profile views" />`
}

export function generateHTMLCode(badgeUrl: string, username: string): string {
  return generateMarkdownCode(badgeUrl, username)
}
