# GitHub Profile Views Counter - Setup Guide

## Overview

A beautiful, modern GitHub profile views counter badge generator with real GitHub stats integration, glass morphism UI, smooth animations, and zero third-party counter dependencies.

## New Enhancements

### 1. **Modern UI with Framer Motion**
- Smooth entrance animations on page load
- Interactive button animations with scale and tap effects
- Hover effects on cards with transform transitions
- Loading states with animated spinner
- Real-time stat card animations

### 2. **Glass Morphism Design**
- Gradient backgrounds with `backdrop-blur-xl`
- Layered semi-transparent containers
- Modern gradient text on headline
- Soft border colors with high opacity
- Professional dark theme inspired by GitHub

### 3. **GitHub Stats Integration (Optional)**
- Fetch real GitHub user statistics:
  - **Followers** count
  - **Following** count  
  - **Public Repositories** count
  - **Total Stars** across all repos
  - **Total Commits** (using GitHub Search API)
- Formatted numbers (1.2K, 3.5M, etc.)
- Graceful fallback when token not provided
- Non-blocking - doesn't prevent badge generation

### 4. **3D Tilt-Ready Architecture**
- Three.js and React Three Fiber installed for future 3D effects
- Component structure supports 3D transforms
- Ready for advanced interactive features

### 5. **Environment Configuration**
- `.env.example` file with all required/optional variables
- Clearly documented setup instructions
- Easy GitHub API token setup

## Environment Variables

### Required
```
KV_REST_API_URL=https://your-project.upstash.io
KV_REST_API_TOKEN=your_upstash_token_here
```

### Optional (for GitHub Stats)
```
GITHUB_API_TOKEN=ghp_your_github_personal_access_token_here
```

### Application (Optional)
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Getting GitHub API Token

### For Read-Only Stats:
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select **only** these scopes:
   - `public_repo` (for public repos access)
   - `read:user` (for user profile data)
4. Generate and copy the token
5. Add to `.env.local` as `GITHUB_API_TOKEN=ghp_xxxxx`

### Token Security
- Token is used server-side only in `lib/github-stats.ts`
- Never exposed to frontend
- Only reads public data
- Low API rate limits used (not rate-limited for reading public data)

## File Structure

```
/app
  /api/profile-views/route.ts      # SVG badge generation
  /page.tsx                        # Home page
  /layout.tsx                      # Root layout with dark theme
  
/components
  /badge-generator.tsx             # Main UI with animations

/lib
  /badge-utils.ts                  # URL generation utilities
  /github-stats.ts                 # GitHub API integration

/.env.example                      # Environment template
```

## Key Features

### Badge Generation
- **Live Preview**: See badge update in real-time
- **Customizable**: Label, color, style options
- **Multiple Styles**: flat, flat-square, plastic
- **Hex Color Support**: Full color customization with visual picker

### GitHub Stats (Optional)
- Loads automatically when username changes
- Shows after 500ms debounce
- 4 stat cards with formatted numbers:
  - Followers (blue)
  - Following (cyan)
  - Public Repos (purple)
  - Total Stars (yellow)
- Gracefully handles missing token (no error shown)

### UI/UX Enhancements
- **Dark Theme**: Slate-950 to slate-900 gradients
- **Animations**: Framer Motion throughout
- **Glass Cards**: Semi-transparent with backdrop blur
- **Interactive Elements**: Hover effects, button animations
- **Copy Feedback**: Buttons turn green with checkmark on copy
- **Responsive**: Works on mobile, tablet, desktop

### Performance
- Serverless Redis for instant counter increments
- SVG badges are lightweight (~1.2KB)
- No heavy dependencies (besides Framer Motion, Three.js optional)
- Debounced GitHub stat fetches (500ms)

## Deployment

### To Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add enhanced profile views badge"
   git push
   ```

2. **Import to Vercel**
   - Go to vercel.com/new
   - Import your repository
   - Vercel detects Upstash Redis integration automatically
   - Env vars are auto-configured

3. **Add GitHub Token (Optional)**
   - Go to Project Settings > Environment Variables
   - Add `GITHUB_API_TOKEN=ghp_xxxxx`
   - Redeploy

4. **Use Your Badge**
   ```html
   <img src="https://yourdomain.com/api/profile-views?username=yourname&label=Profile%20views&color=0e75b6&style=flat" alt="profile views" />
   ```

## Testing

### Local Development

```bash
# 1. Copy .env.example to .env.local
cp .env.example .env.local

# 2. Add your Upstash Redis credentials
# KV_REST_API_URL and KV_REST_API_TOKEN

# 3. (Optional) Add GitHub API token
# GITHUB_API_TOKEN=ghp_xxxxx

# 4. Start dev server
pnpm dev

# 5. Open http://localhost:3000
```

### Test Counter

```bash
# Increment counter multiple times
for i in 1 2 3; do
  curl "http://localhost:3000/api/profile-views?username=test&label=Views&color=0e75b6&style=flat"
done
```

### Test GitHub Stats

1. Enter a real GitHub username in the input (e.g., "torvalds")
2. If token is set, stats appear in ~500ms
3. Without token, badge still works (stats just won't show)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Storage**: Upstash Redis (serverless)
- **Animations**: Framer Motion v12.40.0
- **3D Ready**: Three.js + React Three Fiber
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **API**: GitHub REST API v3

## Customization

### Change Primary Color
Edit `page.tsx` and update the gradient in the header:
```tsx
bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300
```

### Add More GitHub Stats
Edit `lib/github-stats.ts` and add to `GitHubStats` interface, then update component to display new stats.

### Adjust Animation Timing
In `components/badge-generator.tsx`, modify Framer Motion props:
```tsx
initial={{ opacity: 0, y: -20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}  // Change duration here
```

## Troubleshooting

### Stats Not Showing
- Check if `GITHUB_API_TOKEN` is set in `.env.local`
- Token may not have correct scopes
- GitHub API rate limit reached (wait 1 hour)
- Username doesn't exist on GitHub

### Counter Not Incrementing
- Verify Upstash Redis credentials in `.env.local`
- Check `KV_REST_API_URL` and `KV_REST_API_TOKEN` are correct
- Redis may be down (check Upstash dashboard)
- Network connectivity issue

### Badge Not Loading in README
- Verify domain is public and accessible
- Check URL encoding (spaces should be `%20`)
- Ensure API route is responding (test in browser)
- GitHub cache: may take 5-10 minutes to show new badge

## License

MIT - Feel free to use for personal or commercial projects

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Check Upstash and GitHub dashboards for service status
4. Review server logs in Vercel dashboard
