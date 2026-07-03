/**
 * build-stats — bake the live social-proof metrics (GitHub stars, npm weekly
 * downloads) into `src/generated/liveStats.ts` at build time.
 *
 * Wired ahead of `vite build` in the landing `build` script (see scripts/README.md).
 * Fetching once at build time and shipping the numbers in the static bundle means
 * visitors never trigger a per-page API call or contend for a rate limit.
 *
 * FAIL-SAFE, not FAIL-LOUD (unlike the registry generators): a down API must
 * NEVER break the build. Each metric degrades independently —
 *
 *     fresh value  →  last baked non-null value  →  null
 *
 * — and the file is always rewritten with whatever we could resolve, so an
 * offline build still succeeds by keeping the previously-committed numbers.
 */

import type { BakedLiveStats } from '../src/generated/liveStats.ts'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fetchLiveStats } from '../src/lib/liveStats.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_FILE = resolve(__dirname, '..', 'src', 'generated', 'liveStats.ts')

/** Read the currently-committed baked values so we can fall back to them. */
async function loadPrevious(): Promise<Partial<BakedLiveStats>> {
  try {
    const mod = (await import('../src/generated/liveStats.ts')) as { LIVE_STATS: BakedLiveStats }
    return mod.LIVE_STATS
  }
  catch {
    return {}
  }
}

/** A number literal or the `null` keyword, for the generated source. */
function numberOrNull(value: number | null | undefined): string {
  return typeof value === 'number' ? String(value) : 'null'
}

/** Render the generated module — kept byte-identical in shape to the seed file. */
function render(stats: BakedLiveStats): string {
  return `/**
 * GENERATED FILE — do not edit by hand.
 *
 * Written by \`apps/landing/scripts/build-stats.ts\`, which runs from the landing
 * \`build\` script ahead of \`vite build\`. It holds the last successfully-fetched
 * live social-proof metrics, baked into the static site so visitors trigger no
 * API calls of their own.
 *
 * \`null\` means the metric has never been fetched successfully. When an API is
 * down the build keeps the previous non-null value, so a network failure never
 * regresses a real number back to \`null\`.
 *
 * @see ../lib/liveStats.ts for the shared endpoints + fetch logic.
 */
import type { LiveStats } from '../lib/liveStats.ts'

export interface BakedLiveStats extends LiveStats {
  /** ISO timestamp of the build that last wrote this file. */
  generatedAt: string
}

export const LIVE_STATS: BakedLiveStats = {
  githubStars: ${numberOrNull(stats.githubStars)},
  npmDownloads: ${numberOrNull(stats.npmDownloads)},
  generatedAt: '${stats.generatedAt}',
}
`
}

/** Short console note describing where each metric came from. */
function source(fresh: number | null, previous: number | null | undefined): string {
  if (fresh !== null) return `${fresh} (fresh)`
  if (typeof previous === 'number') return `${previous} (kept — API unavailable)`
  return 'null (unavailable)'
}

async function main(): Promise<void> {
  const previous = await loadPrevious()
  const fresh = await fetchLiveStats()

  const stats: BakedLiveStats = {
    githubStars: fresh.githubStars ?? previous.githubStars ?? null,
    npmDownloads: fresh.npmDownloads ?? previous.npmDownloads ?? null,
    generatedAt: new Date().toISOString(),
  }

  await mkdir(dirname(OUT_FILE), { recursive: true })
  await writeFile(OUT_FILE, render(stats))

  console.log('▸ Live stats baked into src/generated/liveStats.ts')
  console.log(`    GitHub stars     : ${source(fresh.githubStars, previous.githubStars)}`)
  console.log(`    npm downloads/wk : ${source(fresh.npmDownloads, previous.npmDownloads)}`)
}

main().catch((error: unknown) => {
  // Never break the build: keep the committed values and carry on.
  console.warn(
    `⚠ build-stats: keeping committed live stats — ${(error as Error).message}`,
  )
})
