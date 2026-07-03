import type { Ref } from 'vue'
import { onMounted, ref } from 'vue'
import { LIVE_STATS } from '../generated/liveStats.ts'
import { fetchLiveStats } from '../lib/liveStats.ts'

/**
 * useLiveStats — reactive GitHub stars + npm weekly downloads for the social
 * proof strip.
 *
 * Seeds from the build-time baked values in {@link LIVE_STATS} (so the numbers
 * render immediately, even under SSR / with no client network), then fires one
 * best-effort refresh on mount to keep a long-lived deployment fresh. A failed or
 * absent refresh leaves the baked values untouched — {@link fetchLiveStats} never
 * throws, and a `null` field is ignored rather than blanking a real number.
 */
export function useLiveStats(): {
  githubStars: Ref<number | null>
  npmDownloads: Ref<number | null>
} {
  const githubStars = ref<number | null>(LIVE_STATS.githubStars)
  const npmDownloads = ref<number | null>(LIVE_STATS.npmDownloads)

  onMounted(async () => {
    const fresh = await fetchLiveStats()
    if (fresh.githubStars !== null) githubStars.value = fresh.githubStars
    if (fresh.npmDownloads !== null) npmDownloads.value = fresh.npmDownloads
  })

  return { githubStars, npmDownloads }
}
