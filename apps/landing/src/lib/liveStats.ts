/**
 * liveStats — the single source of truth for the two *live* social-proof metrics
 * (GitHub stars, npm weekly downloads).
 *
 * Imported by BOTH sides so the endpoints and response parsing never drift:
 *   • build time — `scripts/build-stats.ts` bakes the numbers into
 *     `src/generated/liveStats.ts` ahead of `vite build`, so the static site
 *     carries them and visitors pay no per-page API cost.
 *   • runtime — the small refresh in `useLiveStats` re-fetches best-effort in the
 *     browser to keep a long-lived deployment from going stale.
 *
 * Every fetch here is best-effort: a slow or down API resolves to `null`, never a
 * throw. Both callers treat `null` as "keep the last known value", so a network
 * failure degrades gracefully instead of breaking a build or blanking the UI.
 */

/** Live metrics fetched from public APIs. `null` = currently unknown. */
export interface LiveStats {
  /** GitHub repository star count. */
  githubStars: number | null
  /** npm downloads over the last 7 days for the primary package. */
  npmDownloads: number | null
}

/** `owner/repo` for the GitHub stars endpoint (mirrors config `LINKS.github`). */
export const GITHUB_REPO = 'dzup-ui/dzup-ui'

/** npm package whose weekly downloads stand in for adoption (`LINKS.npm`). */
export const NPM_PACKAGE = '@dzup-ui/core'

/** Per-request network timeout — a slow API must never hang a build or a page. */
const REQUEST_TIMEOUT_MS = 8000

/** Best-effort JSON GET that resolves to `null` on any failure (never throws). */
async function fetchJson(url: string): Promise<unknown> {
  try {
    const res = await fetch(url, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
    if (!res.ok) return null
    return (await res.json()) as unknown
  }
  catch {
    return null
  }
}

/** Coerce an API field to a finite, non-negative integer, or `null`. */
function toCount(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.round(value)
    : null
}

/** GitHub stargazers for {@link GITHUB_REPO}, or `null` if unavailable. */
export async function fetchGithubStars(): Promise<number | null> {
  const data = await fetchJson(`https://api.github.com/repos/${GITHUB_REPO}`)
  return toCount((data as { stargazers_count?: unknown } | null)?.stargazers_count)
}

/** npm downloads over the last 7 days for {@link NPM_PACKAGE}, or `null`. */
export async function fetchNpmWeeklyDownloads(): Promise<number | null> {
  const pkg = encodeURIComponent(NPM_PACKAGE)
  const data = await fetchJson(`https://api.npmjs.org/downloads/point/last-week/${pkg}`)
  return toCount((data as { downloads?: unknown } | null)?.downloads)
}

/**
 * Fetch both metrics concurrently, best-effort. Never throws and never blocks on
 * a single slow endpoint — either field is `null` when its API is unreachable.
 */
export async function fetchLiveStats(): Promise<LiveStats> {
  const [githubStars, npmDownloads] = await Promise.all([
    fetchGithubStars(),
    fetchNpmWeeklyDownloads(),
  ])
  return { githubStars, npmDownloads }
}
