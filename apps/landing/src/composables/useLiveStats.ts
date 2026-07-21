import type { Ref } from 'vue'
import { onMounted, ref } from 'vue'
import { LIVE_STATS } from '../generated/liveStats.ts'
import { fetchLiveStats } from '../lib/liveStats.ts'

/**
 * Human-readable "as of" date for the baked numbers, e.g. `2 Jul 2026`.
 *
 * A build-time number presented with no date reads as live when it is not. The
 * tiles surface this in a `title`, so a stale static figure is honest rather
 * than falsely current.
 */
function formatAsOf(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime()))
    return 'an unknown date'
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

/**
 * useLiveStats — reactive GitHub stars + npm weekly downloads for the social
 * proof strip.
 *
 * Seeds from the build-time baked values in {@link LIVE_STATS} (so the numbers
 * render immediately, even under SSR / with no client network), then fires one
 * best-effort refresh on mount to keep a long-lived deployment fresh. A failed or
 * absent refresh leaves the baked values untouched — {@link fetchLiveStats} never
 * throws, and a `null` field is ignored rather than blanking a real number.
 *
 * Both metrics are `null` until `dzup-ui/dzup-ui` and `@dzup-ui/core` are
 * published — their APIs 404 today. The tiles render a call-to-action in that
 * case; they never invent a number.
 */
export function useLiveStats(): {
  githubStars: Ref<number | null>
  npmDownloads: Ref<number | null>
  /** Formatted date the baked numbers were fetched. */
  asOf: string
} {
  const githubStars = ref<number | null>(LIVE_STATS.githubStars)
  const npmDownloads = ref<number | null>(LIVE_STATS.npmDownloads)
  const asOf = formatAsOf(LIVE_STATS.generatedAt)

  // The browser refresh only makes sense once the GitHub repo + npm package are
  // public — until then both endpoints 404 (logged by the browser itself, which
  // no try/catch can suppress). Opt in via VITE_ENABLE_LIVE_STATS once published;
  // the baked build-time values in LIVE_STATS render regardless.
  onMounted(async () => {
    if (import.meta.env.VITE_ENABLE_LIVE_STATS !== 'true')
      return
    const fresh = await fetchLiveStats()
    if (fresh.githubStars !== null)
      githubStars.value = fresh.githubStars
    if (fresh.npmDownloads !== null)
      npmDownloads.value = fresh.npmDownloads
  })

  return { githubStars, npmDownloads, asOf }
}
