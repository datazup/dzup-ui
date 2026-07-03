/**
 * liveStats — best-effort fetch of the live social-proof metrics.
 *
 * The whole point of these helpers is that they NEVER throw: a rejected request,
 * a non-2xx response, or a malformed body must all resolve to `null` so the build
 * script and the runtime refresh can fall back to the last known value. These
 * tests pin exactly that by driving `globalThis.fetch` through each failure mode.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchGithubStars, fetchLiveStats, fetchNpmWeeklyDownloads } from './liveStats.ts'

/** Stub `fetch` with a canned Response-like object (or a rejection). */
function stubFetch(impl: () => Promise<unknown>): void {
  vi.stubGlobal('fetch', vi.fn(impl))
}

/** A minimal ok/JSON Response double. */
function jsonResponse(body: unknown, ok = true): { ok: boolean, json: () => Promise<unknown> } {
  return { ok, json: async () => body }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchGithubStars', () => {
  it('parses stargazers_count on success', async () => {
    stubFetch(async () => jsonResponse({ stargazers_count: 4213 }))
    expect(await fetchGithubStars()).toBe(4213)
  })

  it('returns null when the network rejects', async () => {
    stubFetch(async () => {
      throw new Error('ENOTFOUND api.github.com')
    })
    expect(await fetchGithubStars()).toBeNull()
  })

  it('returns null on a non-2xx response (rate limit / 404)', async () => {
    stubFetch(async () => jsonResponse({ message: 'Not Found' }, false))
    expect(await fetchGithubStars()).toBeNull()
  })

  it('returns null when the field is missing or malformed', async () => {
    stubFetch(async () => jsonResponse({ stargazers_count: 'lots' }))
    expect(await fetchGithubStars()).toBeNull()
  })
})

describe('fetchNpmWeeklyDownloads', () => {
  it('parses downloads on success', async () => {
    stubFetch(async () => jsonResponse({ downloads: 91234 }))
    expect(await fetchNpmWeeklyDownloads()).toBe(91234)
  })

  it('returns null when JSON parsing throws', async () => {
    stubFetch(async () => ({
      ok: true,
      json: async () => {
        throw new SyntaxError('Unexpected token')
      },
    }))
    expect(await fetchNpmWeeklyDownloads()).toBeNull()
  })
})

describe('fetchLiveStats', () => {
  it('degrades each metric independently — a total outage yields all-null, never a throw', async () => {
    stubFetch(async () => {
      throw new Error('offline')
    })
    await expect(fetchLiveStats()).resolves.toEqual({ githubStars: null, npmDownloads: null })
  })
})
