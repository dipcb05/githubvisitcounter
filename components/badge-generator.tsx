'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, Loader } from 'lucide-react'
import { motion } from 'framer-motion'
import { generateBadgeUrl, generateMarkdownCode } from '@/lib/badge-utils'
import { getGitHubStats, formatNumber, type GitHubStats } from '@/lib/github-stats'

const STYLES = ['flat', 'flat-square', 'plastic']

export default function BadgeGenerator() {
  const [username, setUsername] = useState('dipcb05')
  const [label, setLabel] = useState('Profile views')
  const [color, setColor] = useState('#0e75b6')
  const [style, setStyle] = useState('flat')
  const [badgeUrl, setBadgeUrl] = useState('')
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [baseUrl, setBaseUrl] = useState('')
  const [githubStats, setGithubStats] = useState<GitHubStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)

  // Set base URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(`${window.location.protocol}//${window.location.host}`)
    }
  }, [])

  // Generate badge URL when params change
  useEffect(() => {
    if (baseUrl) {
      const url = generateBadgeUrl(baseUrl, username, label, color, style)
      setBadgeUrl(url)
    }
  }, [username, label, color, style, baseUrl])

  // Fetch GitHub stats when username changes
  useEffect(() => {
    const fetchStats = async () => {
      if (!username) return
      setLoadingStats(true)
      const stats = await getGitHubStats(username)
      setGithubStats(stats)
      setLoadingStats(false)
    }

    const timer = setTimeout(fetchStats, 500)
    return () => clearTimeout(timer)
  }, [username])

  const markdownCode = generateMarkdownCode(badgeUrl, username)

  const copyCode = async () => {
    await navigator.clipboard.writeText(markdownCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const copyUrl = async () => {
    await navigator.clipboard.writeText(badgeUrl)
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Animated Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300 bg-clip-text text-transparent mb-4">
            Profile Views Badge
          </h1>
          <p className="text-slate-300 text-lg">
            Generate a stunning GitHub-compatible profile views counter with real GitHub stats
          </p>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor Panel */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">⚙️</span>
                Configuration
              </h2>

              {/* Username Input */}
              <div className="mb-8">
                <label htmlFor="username" className="block text-sm font-semibold text-slate-200 mb-3">
                  GitHub Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="dipcb05"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                />
                <p className="text-xs text-slate-400 mt-2">
                  Used as unique counter identifier
                </p>
              </div>

              {/* Label Input */}
              <div className="mb-8">
                <label htmlFor="label" className="block text-sm font-semibold text-slate-200 mb-3">
                  Label Text
                </label>
                <input
                  id="label"
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Profile views"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                />
              </div>

              {/* Color Input */}
              <div className="mb-8">
                <label htmlFor="color" className="block text-sm font-semibold text-slate-200 mb-3">
                  Badge Color
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    id="color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-12 w-20 border border-slate-600/50 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#0e75b6"
                    className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent font-mono transition-all"
                  />
                </div>
              </div>

              {/* Style Selector */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-200 mb-3">
                  Badge Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {STYLES.map((s) => (
                    <motion.button
                      key={s}
                      onClick={() => setStyle(s)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`py-3 px-3 rounded-lg text-sm font-medium transition-all ${
                        style === s
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/50'
                          : 'bg-slate-700/30 text-slate-300 border border-slate-600/50 hover:bg-slate-700/50'
                      }`}
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* URL Display */}
            <motion.div
              className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-lg"
              whileHover={{ y: -2 }}
            >
              <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <span className="text-blue-400">🔗</span>
                Badge URL
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={badgeUrl}
                  readOnly
                  className="flex-1 px-4 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white font-mono text-xs overflow-x-auto focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <motion.button
                  onClick={copyUrl}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                    copiedUrl
                      ? 'bg-green-600 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:shadow-lg hover:shadow-blue-500/30'
                  }`}
                >
                  {copiedUrl ? (
                    <>
                      <Check size={16} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* Markdown Code */}
            <motion.div
              className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-lg"
              whileHover={{ y: -2 }}
            >
              <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <span className="text-blue-400">📝</span>
                README Code
              </h3>
              <div className="flex gap-2">
                <code className="flex-1 px-4 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white font-mono text-xs overflow-x-auto whitespace-pre-wrap break-words">
                  {markdownCode}
                </code>
                <motion.button
                  onClick={copyCode}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                    copiedCode
                      ? 'bg-green-600 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:shadow-lg hover:shadow-blue-500/30'
                  }`}
                >
                  {copiedCode ? (
                    <>
                      <Check size={16} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy
                    </>
                  )}
                </motion.button>
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Paste this code into your GitHub README
              </p>
            </motion.div>
          </motion.div>

          {/* Right Sidebar: Preview + Stats */}
          <motion.div
            className="lg:col-span-1 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Live Preview */}
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-cyan-400">👀</span>
                Live Preview
              </h2>

              {/* Badge Preview */}
              <div className="bg-slate-900/80 rounded-xl p-6 flex items-center justify-center min-h-40 border border-slate-700/50">
                {badgeUrl ? (
                  <motion.img
                    src={badgeUrl}
                    alt="Profile views badge"
                    className="max-w-full h-auto"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                ) : (
                  <p className="text-slate-500">Loading badge...</p>
                )}
              </div>
            </div>

            {/* GitHub Stats Card */}
            {loadingStats ? (
              <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 flex items-center justify-center min-h-48">
                <div className="flex items-center gap-2 text-slate-300">
                  <Loader size={20} className="animate-spin" />
                  <span>Loading GitHub stats...</span>
                </div>
              </div>
            ) : githubStats ? (
              <motion.div
                className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-purple-400">📊</span>
                  GitHub Stats
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <motion.div
                    className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50"
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(30, 41, 59, 0.7)' }}
                  >
                    <p className="text-xs text-slate-400">Followers</p>
                    <p className="text-lg font-bold text-blue-400">{formatNumber(githubStats.followers)}</p>
                  </motion.div>
                  <motion.div
                    className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50"
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(30, 41, 59, 0.7)' }}
                  >
                    <p className="text-xs text-slate-400">Following</p>
                    <p className="text-lg font-bold text-cyan-400">{formatNumber(githubStats.following)}</p>
                  </motion.div>
                  <motion.div
                    className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50"
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(30, 41, 59, 0.7)' }}
                  >
                    <p className="text-xs text-slate-400">Public Repos</p>
                    <p className="text-lg font-bold text-purple-400">{formatNumber(githubStats.publicRepos)}</p>
                  </motion.div>
                  <motion.div
                    className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50"
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(30, 41, 59, 0.7)' }}
                  >
                    <p className="text-xs text-slate-400">Total Stars</p>
                    <p className="text-lg font-bold text-yellow-400">{formatNumber(githubStats.totalStars)}</p>
                  </motion.div>
                </div>
              </motion.div>
            ) : null}

            {/* Usage Instructions */}
            <motion.div
              className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-lg"
              whileHover={{ y: -2 }}
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-green-400">🚀</span>
                Quick Start
              </h3>
              <ol className="space-y-2 text-sm text-slate-300">
                <li className="flex gap-2">
                  <span className="font-bold text-blue-400">1</span>
                  <span>Copy README Code</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-400">2</span>
                  <span>Paste in GitHub README</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-400">3</span>
                  <span>Share your profile link</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-400">4</span>
                  <span>Watch counters increment!</span>
                </li>
              </ol>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

