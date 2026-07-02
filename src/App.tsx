import { useEffect, useMemo, useState } from 'react'
import './App.css'

type HireCard = {
  title: string
  body: string
}

type CaseStudy = {
  title: string
  tag: string
  repoKey: string
  intro: string
  technical: string[]
  signal: string[]
}

type ProofBlock = {
  title: string
  items: string[]
}

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

type GitHubReposResponse = {
  snapshots: RepoSnapshot[]
  status: 'live' | 'partial' | 'fallback'
}

const hireCards: HireCard[] = [
  {
    title: 'Product-minded systems engineering',
    body: 'Turns half-broken local tools, desktop shells, dashboards, and device workflows into usable software instead of stopping at "works on my machine."',
  },
  {
    title: 'Debugging ugly integration failures',
    body: 'Comfortable with lifecycle bugs, auth failures, process boundaries, Bluetooth/GATT, MQTT, browser scripts, and Windows-specific weirdness.',
  },
  {
    title: 'Full-stack UI plus real-world data',
    body: 'Builds React/TypeScript interfaces around actual telemetry, controls, reports, previews, and operational workflows.',
  },
  {
    title: 'Developer tooling and delivery discipline',
    body: 'Creates planning/execution systems, docs, health checks, commit hygiene, and repeatable workflows around the code.',
  },
]

const caseStudies: CaseStudy[] = [
  {
    title: 'Device Telemetry Product',
    tag: 'bluetti-monitor',
    repoKey: 'bluetti-monitor',
    intro:
      'A TypeScript/React desktop-adjacent app for power monitoring, battery/runtime analytics, solar input, and BLUETTI device integration.',
    technical: [
      'Battery runtime math, spec comparison, and generated reports',
      'Solar input graphing, AC/DC outputs, and peak wattage windows',
      'BLUETTI MQTT exits and GATT enumeration failures',
      'Electrobun build, relaunch, bridge cleanup, and disposed-object fixes',
    ],
    signal: [
      'Can turn hardware telemetry into understandable product UI',
      'Can debug both the data layer and the app shell',
      'Recent commits show narrow, concrete production fixes',
    ],
  },
  {
    title: 'Developer Control Plane',
    tag: 'devctl',
    repoKey: 'devctl',
    intro:
      'A local developer-control project with host execution, operational dashboard work, telemetry, project registry research, and GSD-backed delivery plans.',
    technical: [
      'Windows host executor runtime and stale executor restarts',
      'Docker bind mounts and dashboard hot reload',
      'Always-on host metrics and operational dashboard redesign',
      'MCP server checks and registry-oriented planning',
    ],
    signal: [
      'Can build internal tools that coordinate local systems',
      'Knows when developer experience needs observability',
      'Works through phases, verification, and follow-through',
    ],
  },
  {
    title: 'BLE to MQTT Device Bridge',
    tag: 'bluetti-mqtt-node',
    repoKey: 'bluetti-mqtt-node',
    intro:
      'A Windows-first TypeScript port of the Python bluetti_mqtt library that connects to Bluetti power stations over BLE, parses MODBUS-over-BLE state, and publishes it to MQTT.',
    technical: [
      'Windows-native BLE helper implemented with .NET / WinRT APIs',
      'TypeScript MODBUS command framing, CRC handling, and typed field parsing',
      'MQTT state publishing plus command-topic ingestion for writable fields',
      'Polling, discovery, logger, probe, and package CLI entrypoints',
    ],
    signal: [
      'Can bridge hardware protocols into reliable Node/TypeScript tooling',
      'Separates fragile transport concerns from protocol and application logic',
      'Designs for Windows reality instead of pretending cross-platform BLE is easy',
    ],
  },
  {
    title: 'Camera / Streaming Platform',
    tag: 'reolink',
    repoKey: 'rl-web-viewer',
    intro:
      'A Reolink/web-viewer codebase with live-view fixes, auth surfacing, plugin streaming plans, YouTube Live egress, and dashboard UI work.',
    technical: [
      'Live-view missing-file fixes and auth error handling',
      'Focus and iris controls',
      'Plugin streaming dashboard and privacy validation',
      'OAuth client attachment for YouTube Live API',
    ],
    signal: [
      'Can work across UI, media streaming, auth, and plugins',
      'Can plan multi-step feature phases without losing integration details',
      'Writes tests/docs around plugin behavior',
    ],
  },
  {
    title: 'Native / Audio Engineering',
    tag: 'JUCE',
    repoKey: 'juce-plugin-example',
    intro:
      'A JUCE spectrum-analyzer project spanning C++, CMake, TypeScript extraction, config centralization, deployment docs, and project health checks.',
    technical: [
      'C++/JUCE plugin code and CMake integration',
      'Central config schema shared across C++ and TypeScript',
      'Health-check documentation reconciled against code reality',
      'Checkpoint-driven execution workflow',
    ],
    signal: [
      'Can cross from web tooling into native/audio territory',
      'Understands build configuration as product infrastructure',
      'Documents systems in ways future maintainers can use',
    ],
  },
  {
    title: 'Creative Tool Integration',
    tag: 'TouchDesigner',
    repoKey: 'touchdesigner',
    intro:
      'TouchDesigner bridge work with Python, companion MCP server design, thread-safe execution, demo nodes, and project-drift analysis.',
    technical: [
      'TD-side MCP bridge extension and companion server',
      'Server-thread execution fixes and captured op() handling',
      'Demo node/control documentation',
      'Project drift assessment against intent',
    ],
    signal: [
      'Can integrate AI/dev tooling into creative software',
      'Can debug concurrency and host-app execution constraints',
      'Comfortable building bridges where official paths are thin',
    ],
  },
]

const proofBlocks: ProofBlock[] = [
  {
    title: 'Languages / surfaces',
    items: ['TypeScript, TSX, React, Node', 'C++ and CMake in JUCE/plugin work', 'Python in TouchDesigner integration', 'PowerShell and Windows automation'],
  },
  {
    title: 'Problem domains',
    items: ['Device telemetry, MQTT, GATT, BLE, runtime estimates', 'Desktop shells: Electrobun, CEF/WebView, process lifecycle', 'MODBUS-over-BLE, helper processes, native Windows integration', 'MCP bridges, local control planes, internal dashboards'],
  },
  {
    title: 'Delivery habits',
    items: ['Small targeted fixes with descriptive commits', 'Docs and health checks after implementation', 'Planning and verification loops for larger phases', 'Git hygiene: commit, push, merge, PR prep'],
  },
]

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

const interviewBlocks: ProofBlock[] = [
  {
    title: 'Ask about',
    items: ['How battery runtime estimates changed from rough to trustworthy', 'Why CEF/WebView/Electrobun lifecycle bugs are hard on Windows', 'How to design a local control plane for developer tools'],
  },
  {
    title: 'Look for',
    items: ['Evidence of debugging from symptoms to root cause', 'Ability to explain tradeoffs between quick scripts and productized tools', 'Comfort moving across frontend, backend, native, and OS boundaries'],
  },
  {
    title: 'Bottom line',
    items: ['This is a builder profile, not a narrow ticket-taker profile', 'Strong fit for internal tooling, applied AI tooling, dashboards, integrations, and product engineering in messy real-world systems'],
  },
]

function BulletList({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

const formatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

function shortDate(value?: string) {
  if (!value) return 'unknown'
  return formatter.format(new Date(value))
}

function cleanCommitMessage(message?: string) {
  return message?.split('\n')[0] ?? 'No commit data available'
}

function repoDisplayName(snapshot: RepoSnapshot) {
  return snapshot.repo?.name ?? snapshot.config.name
}

function aggregateLanguages(snapshots: RepoSnapshot[]) {
  const counts = new Map<string, number>()

  for (const snapshot of snapshots) {
    for (const language of snapshot.languages ?? []) {
      counts.set(language, (counts.get(language) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
}

function useGitHubRepos(configs: RepoEvidence[]) {
  const [snapshots, setSnapshots] = useState<RepoSnapshot[]>(() => configs.map((config) => ({ config })))
  const [status, setStatus] = useState<'loading' | 'live' | 'partial' | 'fallback'>('loading')

  useEffect(() => {
    const controller = new AbortController()

    async function fetchRepoFeed(): Promise<GitHubReposResponse> {
      const response = await fetch('/api/github-repos', {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error('Repo feed unavailable')
      }

      return response.json() as Promise<GitHubReposResponse>
    }

    fetchRepoFeed()
      .then((repoFeed) => {
        if (controller.signal.aborted) return
        setSnapshots(repoFeed.snapshots)
        setStatus(repoFeed.status)
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setStatus('fallback')
      })

    return () => controller.abort()
  }, [configs])

  return { snapshots, status }
}

function App() {
  const { snapshots, status } = useGitHubRepos(repos)
  const repoByName = useMemo(
    () => new Map(snapshots.map((snapshot) => [snapshot.config.repo, snapshot])),
    [snapshots],
  )
  const liveSnapshots = snapshots.filter((snapshot) => snapshot.repo)
  const latestRepoUpdate = liveSnapshots
    .map((snapshot) => snapshot.repo?.pushed_at)
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
  const githubTotals = liveSnapshots.reduce(
    (totals, snapshot) => ({
      forks: totals.forks + (snapshot.repo?.forks_count ?? 0),
      issues: totals.issues + (snapshot.repo?.open_issues_count ?? 0),
      stars: totals.stars + (snapshot.repo?.stargazers_count ?? 0),
    }),
    { forks: 0, issues: 0, stars: 0 },
  )
  const languagePulse = aggregateLanguages(liveSnapshots)
  const freshestCommit = liveSnapshots
    .filter((snapshot) => snapshot.latestCommit?.commit.author?.date)
    .sort((a, b) => (
      new Date(b.latestCommit?.commit.author?.date ?? 0).getTime()
      - new Date(a.latestCommit?.commit.author?.date ?? 0).getTime()
    ))[0]

  return (
    <main>
      <header className="hero-panel">
        <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
        <div className="hero-orbit hero-orbit-two" aria-hidden="true" />
        <div className="hero-scanline" aria-hidden="true" />
        <div>
          <div className="eyebrow">Hiring-facing technical brief</div>
          <h1 className="glitch-title" data-text="Lawrence Norton Builds Useful Software Across Messy Boundaries">
            Lawrence Norton Builds Useful Software Across Messy Boundaries
          </h1>
          <p className="lead">
            The signal in this Codex history is not "lots of tasks." It is repeated work at the edges where products
            usually break: desktop runtimes, device telemetry, BLE/MQTT bridges, developer tools, UI dashboards, and
            integration glue.
          </p>
        </div>
        <aside className="stats" aria-label="Evidence snapshot">
          <div className="stat"><strong>152</strong><span>Codex session files reviewed</span></div>
          <div className="stat"><strong>130</strong><span>named work threads indexed</span></div>
          <div className="stat"><strong>{status === 'loading' ? '...' : `${liveSnapshots.length}/${repos.length}`}</strong><span>GitHub repos loaded live</span></div>
          <div className="stat"><strong>{latestRepoUpdate ? shortDate(latestRepoUpdate).replace(', 2026', '') : 'Apr-Jul'}</strong><span>latest GitHub activity</span></div>
        </aside>
      </header>

      <section className="band">
        <h2>What I Would Hire Him For</h2>
        <div className="hire-grid">
          {hireCards.map((card) => (
            <article className="hire-card" key={card.title}>
              <strong>{card.title}</strong>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="case-grid" aria-label="Case studies">
        {caseStudies.map((study) => (
          <article className="case" key={study.title}>
            <h2>{study.title}<span className="tag">{study.tag}</span></h2>
            <p className="case-intro">{study.intro}</p>
            {repoByName.get(study.repoKey)?.repo?.description ? (
              <p className="github-note">GitHub: {repoByName.get(study.repoKey)?.repo?.description}</p>
            ) : null}
            <div className="split">
              <section>
                <h3>Technical work</h3>
                <BulletList items={study.technical} />
              </section>
              <section>
                <h3>Hiring signal</h3>
                <BulletList items={study.signal} />
              </section>
            </div>
          </article>
        ))}
      </section>

      <section className="band">
        <h2>Engineering Range, With Evidence</h2>
        <div className="proof-grid">
          {proofBlocks.map((block) => (
            <article className="proof" key={block.title}>
              <h3>{block.title}</h3>
              <BulletList items={block.items} />
            </article>
          ))}
        </div>
      </section>

      <section className="band pulse-band">
        <h2>Live GitHub Pulse <span className={`sync-state sync-${status}`}>{status === 'loading' ? 'syncing GitHub' : `${status} feed`}</span></h2>
        <div className="pulse-grid">
          <article className="pulse-card pulse-total">
            <span className="pulse-kicker">Selected public repos</span>
            <strong>{status === 'loading' ? '...' : liveSnapshots.length}</strong>
            <p>{status === 'fallback' ? 'Using local fallback copy' : 'Loaded through the GitHub REST API at runtime'}</p>
          </article>
          <article className="pulse-card">
            <span className="pulse-kicker">Stars / forks / issues</span>
            <strong>{githubTotals.stars} / {githubTotals.forks} / {githubTotals.issues}</strong>
            <p>Not vanity metrics. Just enough live surface area to prove these are real repos, not resume vapor.</p>
          </article>
          <article className="pulse-card pulse-commit">
            <span className="pulse-kicker">Freshest commit</span>
            <strong>{freshestCommit ? freshestCommit.config.name : 'Waiting...'}</strong>
            <p>{freshestCommit?.latestCommit ? cleanCommitMessage(freshestCommit.latestCommit.commit.message) : 'Commit data hydrates after GitHub responds.'}</p>
            <small>{freshestCommit?.latestCommit ? shortDate(freshestCommit.latestCommit.commit.author?.date) : 'live data'}</small>
          </article>
          <article className="pulse-card pulse-languages">
            <span className="pulse-kicker">Language pressure</span>
            <div className="pulse-language-stack">
              {languagePulse.length ? languagePulse.map(([language, count]) => (
                <span key={language}>{language}<em>{count}</em></span>
              )) : <span>Loading<em>...</em></span>}
            </div>
          </article>
        </div>
      </section>

      <section className="band">
        <h2>Repo Evidence Trail <span className={`sync-state sync-${status}`}>{status === 'loading' ? 'syncing GitHub' : status === 'live' ? 'live GitHub feed' : 'indexed snapshot'}</span></h2>
        <div className="repo-grid">
          {snapshots.map((snapshot) => {
            const repo = snapshot.repo
            const latestCommit = snapshot.latestCommit
            const config = snapshot.config

            return (
            <article className="repo" key={config.name}>
              <div className="repo-topline">
                <span className="repo-owner">{config.codeType}</span>
                <span className="tag">{config.sessions}</span>
              </div>
              <a className="repo-name" href={repo?.html_url ?? `https://github.com/${config.owner}/${config.repo}`} target="_blank" rel="noreferrer">{repoDisplayName(snapshot)}</a>
              <p className="repo-description">{repo?.description ?? config.fallbackRecent}</p>
              {repo ? (
                <>
                  <div className="repo-stat-grid" aria-label={`${config.name} live GitHub stats`}>
                    <span><strong>{repo.default_branch}</strong><small>branch</small></span>
                    <span><strong>{repo.language ?? 'mixed'}</strong><small>primary</small></span>
                    <span><strong>{repo.stargazers_count}</strong><small>stars</small></span>
                    <span><strong>{repo.forks_count}</strong><small>forks</small></span>
                  </div>
                  {snapshot.languages?.length ? (
                    <div className="language-row">
                      {snapshot.languages.map((language) => (
                        <span key={language}>{language}</span>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : (
                <p className="repo-meta">{config.fallbackMeta}</p>
              )}
              <div className="commit-strip">
                <span className="commit-label">Latest</span>
                <span className="commit-message">
                  {latestCommit
                    ? cleanCommitMessage(latestCommit.commit.message)
                    : config.fallbackRecent}
                </span>
                <span className="commit-date">
                  {latestCommit
                    ? `${latestCommit.sha.slice(0, 7)} - ${shortDate(latestCommit.commit.author?.date)}`
                    : repo
                      ? `updated ${shortDate(repo.pushed_at)}`
                      : 'Indexed snapshot'}
                </span>
              </div>
            </article>
            )
          })}
        </div>
      </section>

      <section className="band interview-band">
        <h2>Interview Talking Points</h2>
        <div className="proof-grid interview-grid">
          {interviewBlocks.map((block) => (
            <article className="proof interview-proof" key={block.title}>
              <h3>{block.title}</h3>
              <BulletList items={block.items} />
            </article>
          ))}
        </div>
      </section>

      <p className="source">
        Source basis: live public GitHub API data for selected repos, plus local Codex session_index.jsonl and session
        metadata under .codex/sessions. Static copy carries the hiring narrative; GitHub supplies the volatile evidence.
      </p>
    </main>
  )
}

export default App
