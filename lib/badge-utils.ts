export function generateBadgeUrl(
  baseUrl: string,
  username: string,
  label: string,
  color: string,
  style: string
): string {
  const params = new URLSearchParams({
    username,
    label,
    color: color.replace('#', ''),
    style,
  })
  return `${baseUrl}/api/profile-views?${params.toString()}`
}

export function generateMarkdownCode(badgeUrl: string, username: string): string {
  return `<img src="${badgeUrl}" alt="profile views" />`
}

export function generateHTMLCode(badgeUrl: string, username: string): string {
  return generateMarkdownCode(badgeUrl, username)
}
