import BadgeGenerator from '@/components/badge-generator'

export const metadata = {
  title: 'githubvisitcounter',
  description: 'Generate a custom GitHub-compatible profile views counter badge',
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <BadgeGenerator />
    </main>
  )
}
