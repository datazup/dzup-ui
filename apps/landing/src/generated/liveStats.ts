/**
 * GENERATED FILE — do not edit by hand.
 *
 * Written by `apps/landing/scripts/build-stats.ts`, which runs from the landing
 * `build` script ahead of `vite build`. It holds the last successfully-fetched
 * live social-proof metrics, baked into the static site so visitors trigger no
 * API calls of their own.
 *
 * `null` means the metric has never been fetched successfully. When an API is
 * down the build keeps the previous non-null value, so a network failure never
 * regresses a real number back to `null`.
 *
 * @see ../lib/liveStats.ts for the shared endpoints + fetch logic.
 */
import type { LiveStats } from '../lib/liveStats.ts'

export interface BakedLiveStats extends LiveStats {
  /**
   * ISO timestamp of the last build at which a metric above actually CHANGED —
   * not of the last build that ran. A build whose fetch matches the committed
   * numbers rewrites this file byte-identically, so it stops producing an
   * information-free diff on every run. Surfaced to visitors as the "as of"
   * date, which is the honest reading: it is how fresh the DATA is.
   */
  generatedAt: string
}

export const LIVE_STATS: BakedLiveStats = {
  githubStars: 0,
  npmDownloads: null,
  generatedAt: '2026-07-20T12:45:25.209Z',
}
