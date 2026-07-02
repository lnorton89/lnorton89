import type { Config, Context } from '@netlify/functions'

type RepoEvidence = {
  name: string
  codeType: string
  sessions: string
  owner: string
  repo: string
  fallbackMeta: string
  fallbackRecent: string
}

type GitHubRepo = {
  default_branch: string
  description: string | null
  forks_count: number
  full_name: string
  html_url: string
  language: string | null
  name: string
  open_issues_count: number
  pushed_at: string
  stargazers_count: number
  updated_at: string
}

type GitHubCommit = {
  html_url: string
  commit: {
    author: {
      date: string
    } | null
    message: string
  }
  sha: string
}

type RepoSnapshot = {
  config: RepoEvidence
  repo?: GitHubRepo
  latestCommit?: GitHubCommit
  languages?: string[]
  error?: string
}

const repos: RepoEvidence[] = [
  {
    name: 'bluetti-monitor',
    codeType: 'Telemetry UI',
    sessions: '41 sessions',
    owner: 'lnorton89',
    repo: 'bluetti-monitor',
    fallbackMeta: 'github.com/lnorton89/bluetti-monitor | master | 226 commits | clean tree',
    fallbackRecent: 'Recent: cap overview solar peak by generated energy; use sustained solar peak; prefer aggregate solar input.',
  },
  {
    name: 'devctl',
    codeType: 'Dev Tooling',
    sessions: '22 sessions',
    owner: 'lnorton89',
    repo: 'devctl',
    fallbackMeta: 'github.com/lnorton89/devctl | master | 90 commits | 8 dirty files',
    fallbackRecent: 'Recent: restart stale host executor; Docker hot reload; host metrics; operational dashboard redesign.',
  },
  {
    name: 'juce-plugin-example',
    codeType: 'Native Audio',
    sessions: '21 sessions',
    owner: 'lnorton89',
    repo: 'juce-plugin-example',
    fallbackMeta: 'github.com/lnorton89/juce-plugin-example | master | 116 commits | clean tree',
    fallbackRecent: 'Recent: health checks, deployment guide, config centralization, C++/TypeScript extraction.',
  },
  {
    name: 'bluetti-mqtt-node',
    codeType: 'BLE / MQTT',
    sessions: 'public repo',
    owner: 'lnorton89',
    repo: 'bluetti-mqtt-node',
    fallbackMeta: 'github.com/lnorton89/bluetti-mqtt-node | main | 8 commits | 1 dirty file',
    fallbackRecent: 'Windows-first TypeScript BLE-to-MQTT bridge with .NET helper, MODBUS framing, CRC, typed device registry, and CLI tools.',
  },
  {
    name: 'reolink / rl-web-viewer',
    codeType: 'Camera / Streaming',
    sessions: '15 sessions',
    owner: 'lnorton89',
    repo: 'rl-web-viewer',
    fallbackMeta: 'github.com/lnorton89/rl-web-viewer | master | 134 commits | 12 dirty files',
    fallbackRecent: 'Recent: live view auth failures; YouTube token writes; plugin dashboard UI; OAuth client attachment.',
  },
  {
    name: 'touchdesigner',
    codeType: 'Creative Tooling',
    sessions: '9 sessions',
    owner: 'lnorton89',
    repo: 'touchdesigner',
    fallbackMeta: 'github.com/lnorton89/touchdesigner | master | 41 commits | clean tree',
    fallbackRecent: 'Recent: project drift assessment; agent tool demo; MCP bridge server-thread execution fixes.',
  },
]

function topLanguages(languages: Record<string, number>) {
  return Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name)
}

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, {
    ...init,
    headers: {
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
      ...init?.headers,
    },
  })
}

async function fetchGitHub<T>(url: string, signal: AbortSignal): Promise<T> {
  const token = Netlify.env.get('GITHUB_TOKEN')
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'X-GitHub-Api-Version': '2022-11-28',
    },
    signal,
  })

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

async function fetchSnapshot(config: RepoEvidence, signal: AbortSignal): Promise<RepoSnapshot> {
  const base = `https://api.github.com/repos/${config.owner}/${config.repo}`

  try {
    const [repo, commits, languages] = await Promise.all([
      fetchGitHub<GitHubRepo>(base, signal),
      fetchGitHub<GitHubCommit[]>(`${base}/commits?per_page=1`, signal),
      fetchGitHub<Record<string, number>>(`${base}/languages`, signal),
    ])

    return {
      config,
      repo,
      latestCommit: commits[0],
      languages: topLanguages(languages),
    }
  } catch (error) {
    return {
      config,
      error: error instanceof Error ? error.message : 'GitHub fetch failed',
    }
  }
}

export default async function handler(request: Request, _context: Context) {
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, { status: 405 })
  }

  const snapshots = await Promise.all(repos.map((repo) => fetchSnapshot(repo, request.signal)))
  const liveCount = snapshots.filter((snapshot) => snapshot.repo).length
  const status = liveCount === repos.length ? 'live' : liveCount > 0 ? 'partial' : 'fallback'

  return json({ snapshots, status })
}

export const config: Config = {
  path: '/api/github-repos',
  method: 'GET',
}
