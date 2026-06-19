export interface GitHubStats {
  followers: number
  following: number
  publicRepos: number
  totalStars: number
  totalCommits: number
}

export async function getGitHubStats(username: string): Promise<GitHubStats | null> {
  if (!process.env.GITHUB_API_TOKEN) {
    return null
  }

  try {
    // Fetch user profile data
    const userResponse = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Authorization: `token ${process.env.GITHUB_API_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    if (!userResponse.ok) {
      return null
    }

    const userData = await userResponse.json()

    // Fetch total stars across all repos
    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_API_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    )

    let totalStars = 0
    if (reposResponse.ok) {
      const repos = await reposResponse.json()
      totalStars = repos.reduce((sum: number, repo: any) => sum + (repo.stargazers_count || 0), 0)
    }

    // Fetch total commits (approximate - using user activity)
    let totalCommits = 0
    try {
      const commitsResponse = await fetch(
        `https://api.github.com/search/commits?q=author:${username}`,
        {
          headers: {
            Authorization: `token ${process.env.GITHUB_API_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      )

      if (commitsResponse.ok) {
        const commitsData = await commitsResponse.json()
        totalCommits = commitsData.total_count || 0
      }
    } catch {
      // Commits search might fail, which is fine
      totalCommits = 0
    }

    return {
      followers: userData.followers || 0,
      following: userData.following || 0,
      publicRepos: userData.public_repos || 0,
      totalStars,
      totalCommits,
    }
  } catch (error) {
    console.error('Error fetching GitHub stats:', error)
    return null
  }
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}
