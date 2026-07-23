# githubvisitcounter

A self-hosted GitHub profile view counter and customizable README badge generator built with Next.js, Upstash Redis, and TypeScript.

githubvisitcounter lets you run your own profile view badge service instead of depending on a third-party counter. It exposes a lightweight SVG badge endpoint, stores counts in Redis, and includes a polished web UI for generating badge URLs and copy-ready HTML.

## Features

- Generate GitHub-compatible SVG profile view badges
- Increment and store profile views with Upstash Redis
- Count unique views with TTL-based deduplication to avoid refresh spam
- Customize badge label, color, username, style, count mode, and unique-view TTL
- Preview badges in the browser before copying them
- Copy ready-to-use HTML for a GitHub profile README
- Optional GitHub profile stats for followers, following, public repos, and total stars
- Lightweight API endpoint designed for README image embeds
- Works with any deployment platform that supports Next.js and environment variables

## How It Works

The app has two main parts:

1. A web interface where you enter a GitHub username and customize the badge.
2. An API route at `/api/profile-views` that increments a Redis counter and returns an SVG badge.

When a badge is loaded in a README, GitHub requests the SVG image URL. That request hits the API, increments the stored count for the selected username, and returns the latest count as a badge image.

## Tech Stack

- Next.js
- Upstash Redis
- GitHub REST API

## Requirements

- Node.js compatible with Next.js 16
- pnpm
- Upstash Redis database
- Optional GitHub personal access token for GitHub stats
- Optional admin token for resetting or setting counters

## Getting Started

Install dependencies:

```bash
pnpm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Add your Upstash Redis credentials:

```env
KV_REST_API_URL=https://your-project.upstash.io
KV_REST_API_TOKEN=your_upstash_token_here
```

Optionally add a GitHub token if you want the UI to show GitHub profile stats:

```env
GITHUB_API_TOKEN=ghp_your_github_personal_access_token_here
```

Start the development server:

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `KV_REST_API_URL` | Yes | Upstash Redis REST API URL |
| `KV_REST_API_TOKEN` | Yes | Upstash Redis REST API token |
| `GITHUB_API_TOKEN` | No | GitHub token used for optional profile stats |
| `ADMIN_API_TOKEN` | No | Bearer token for the counter admin endpoint |
| `NEXT_PUBLIC_APP_URL` | No | Public app URL used by the badge generator UI |

## Badge Usage

Use the app UI to generate a badge, or build the URL manually:

```text
https://yourdomain.com/api/profile-views?username=yourname&label=Profile%20views&color=0e75b6&style=flat&mode=unique&ttl=21600
```

Add it to a GitHub README:

```html
<img src="https://yourdomain.com/api/profile-views?username=yourname&label=Profile%20views&color=0e75b6&style=flat&mode=unique&ttl=21600" alt="profile views" />
```

Markdown also works:

```md
![Profile views](https://yourdomain.com/api/profile-views?username=yourname&label=Profile%20views&color=0e75b6&style=flat&mode=unique&ttl=21600)
```

Replace `yourdomain.com` with the domain where you deploy the app, and replace `yourname` with the GitHub username or counter key you want to track.

## API Reference

### `GET /api/profile-views`

Returns an SVG badge and increments the counter for the provided `username`. By default, it counts a viewer once per TTL window instead of counting every refresh.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `username` | string | `guest` | GitHub username or custom counter key |
| `label` | string | `Profile views` | Text shown on the left side of the badge |
| `color` | string | `0e75b6` | Hex color for the right side of the badge |
| `style` | string | `flat` | Badge style: `flat`, `flat-square`, `plastic`, `rounded`, `for-the-badge`, or `social` |
| `mode` | string | `unique` | Counting mode: `unique` deduplicates repeat viewers during the TTL window, while `total` increments on every request |
| `ttl` | number | `21600` | Unique-view deduplication window in seconds, clamped from `60` to `86400` |
| `preview` | boolean | `false` | When `true`, returns a sample badge without reading or writing Redis |

Example:

```text
/api/profile-views?username=dipcb05&label=Profile%20views&color=0e75b6&style=flat&mode=unique&ttl=21600
```

The API response uses:

- `Content-Type: image/svg+xml`
- `Cache-Control: no-cache, no-store, must-revalidate`

The no-cache headers help keep the displayed counter fresh when the badge is requested. Use `mode=total` only when you intentionally want every request, refresh, and image reload to increment the badge.


## Additional API Endpoints

### `GET /api/profile-views/stats`

Returns the stored counter value as JSON without incrementing it.

```text
/api/profile-views/stats?username=dipcb05
```

Example response:

```json
{ "username": "dipcb05", "views": 1234 }
```

### `POST /api/profile-views/admin`

Resets or sets a counter. This endpoint requires `ADMIN_API_TOKEN` and an `Authorization` header.

Reset a counter:

```bash
curl -X POST https://yourdomain.com/api/profile-views/admin \
  -H "Authorization: Bearer $ADMIN_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"dipcb05","action":"reset"}'
```

Set a counter:

```bash
curl -X POST https://yourdomain.com/api/profile-views/admin \
  -H "Authorization: Bearer $ADMIN_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"dipcb05","action":"set","count":1000}'
```

### `GET /api/github-stats`

Returns optional GitHub profile stats as JSON for the badge generator UI. It uses `GITHUB_API_TOKEN` on the server so the token is not exposed to browser code.

```text
/api/github-stats?username=dipcb05
```

## GitHub Stats

The badge counter itself only needs Upstash Redis. GitHub stats are optional and are used by the web UI to show extra profile information.

With `GITHUB_API_TOKEN` configured, the app can fetch:

- Followers
- Following
- Public repositories
- Total stars across public repositories

If the token is missing or the GitHub API request fails, the badge generator still works.

## Scripts

```bash
pnpm dev
```

Start the local development server.

```bash
pnpm build
```

Create a production build.

```bash
pnpm start
```

Run the production build.

```bash
pnpm lint
```

Run linting.

## Deployment

Deploy githubvisitcounter anywhere that can run a Next.js app and provide environment variables. The only required backing service is Upstash Redis.

For production, make sure these values are configured in your hosting provider:

```env
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

Add `GITHUB_API_TOKEN` only if you want profile stats in the generator UI.

After deployment, use your production domain in the badge URL:

```text
https://yourdomain.com/api/profile-views?username=yourname
```

## Project Structure

```text
app/
  api/profile-views/route.ts        SVG badge API route
  api/profile-views/stats/route.ts  JSON count endpoint
  api/profile-views/admin/route.ts  authenticated counter admin endpoint
  api/github-stats/route.ts         server-side GitHub stats endpoint
  layout.tsx                  Root metadata and layout
  page.tsx                    Home page
components/
  badge-generator.tsx         Main badge generator UI
components/ui/
  button.tsx                  Shared button component
lib/
  badge-utils.ts              Badge URL, number formatting, and embed helpers
  github-stats.ts             Optional GitHub API helpers
public/
  icons and public assets
```

## Troubleshooting

If the badge returns an error, check that `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set correctly.

If the badge works locally but not in a GitHub README, make sure the deployed URL is public and returns an SVG when opened directly in the browser.

If GitHub stats do not show in the UI, confirm that `GITHUB_API_TOKEN` is configured and has access to public user and repository data.

If the counter appears stale on GitHub, wait a few minutes. GitHub may cache external images even when the API response asks clients not to cache them.

## License

MIT. See [LICENSE](./LICENSE).
