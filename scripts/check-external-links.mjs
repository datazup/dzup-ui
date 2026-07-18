/**
 * check-external-links — fetches every external URL the two free-tier apps
 * publish on their identity surfaces and fails on anything that does not
 * resolve (TASK-FREE-11).
 *
 * This is the gate that keeps the link repair done: the footer shipped four
 * broken badge images, a Discord invite and an X handle that 404'd, and two
 * GitHub orgs — because no machine ever fetched what the pages linked. Scope
 * is deliberately the HAND-WRITTEN identity surfaces (config, footer, CTAs,
 * README, MDX guides, manager theme, MCP manifests), NOT the block/template
 * demo content — demo copy legitimately contains placeholder addresses.
 *
 * Allowlist: hosts that rate-limit anonymous CI traffic or are origin-pending
 * are skipped with a note, never silently.
 *
 * Run: `node scripts/check-external-links.mjs` (root: `yarn check:links`).
 * Node ≥ 18 (global fetch).
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'

const REPO_ROOT = resolve(import.meta.dirname, '..')

/** The identity surfaces this audit repaired. */
const FILES = [
  'README.md',
  'apps/landing/index.html',
  'apps/landing/src/config.ts',
  'apps/landing/src/components/Footer.vue',
  'apps/landing/src/components/CommunityCTA.vue',
  'apps/storybook/.storybook/manager.ts',
  'packages/mcp/server.json',
  'packages/mcp/package.json',
  ...readdirSync(resolve(REPO_ROOT, 'apps/storybook/stories'))
    .filter(name => name.endsWith('.mdx'))
    .map(name => join('apps/storybook/stories', name)),
]

/**
 * Hosts skipped, each with its reason (reported, never silent):
 *  - dzup-ui.com     — the canonical origin; serves nothing until the deploy
 *                      (TASK-FREE-07 artifacts are not in this repo yet).
 *  - schema.org / w3.org — namespace identifiers, not fetch targets.
 *  - twitter.com / x.com — blocks anonymous scripted requests regardless of
 *                      whether the handle exists.
 */
const SKIP_HOSTS = new Map([
  ['dzup-ui.com', 'canonical origin, deploy pending'],
  ['schema.org', 'namespace identifier'],
  ['www.w3.org', 'namespace identifier'],
  ['twitter.com', 'blocks anonymous requests'],
  ['x.com', 'blocks anonymous requests'],
  ['www.npmjs.com', 'returns 403 to scripted requests; package pages are live-gated by useLiveStats'],
])

const URL_PATTERN = /https?:\/\/[^\s"'<>()\]`\\]+/g

/** Collect unique URLs with the files they appear in. */
const found = new Map()
for (const file of FILES) {
  const content = readFileSync(resolve(REPO_ROOT, file), 'utf8')
  for (const match of content.matchAll(URL_PATTERN)) {
    const url = match[0].replace(/[.,;:]+$/, '')
    if (!found.has(url))
      found.set(url, new Set())
    found.get(url).add(file)
  }
}

async function check(url) {
  const attempt = async (method) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 15_000)
    try {
      return await fetch(url, {
        method,
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'user-agent': 'dzup-ui-link-check' },
      })
    }
    finally {
      clearTimeout(timer)
    }
  }
  try {
    let response = await attempt('HEAD')
    // Some hosts reject HEAD (405/403) — retry as GET before judging.
    if (response.status >= 400 && response.status !== 429)
      response = await attempt('GET')
    // 429 = rate-limited, not broken.
    return response.status < 400 || response.status === 429 ? null : `HTTP ${response.status}`
  }
  catch (error) {
    return `unreachable (${error.cause?.code ?? error.name})`
  }
}

const urls = [...found.keys()]
const skipped = []
const toCheck = []
for (const url of urls) {
  let host
  try {
    host = new URL(url).hostname
  }
  catch {
    continue // prose placeholder like "https://…" — not a link
  }
  // Placeholders and local addresses are not fetch targets ('…' marks an
  // illustrative URL in prose, e.g. the Figma-link example in Contributing.mdx).
  if (!host.includes('.') || host === 'localhost' || host.endsWith('.example') || url.includes('…'))
    continue
  const reason = SKIP_HOSTS.get(host) ?? SKIP_HOSTS.get(host.replace(/^www\./, ''))
  if (reason)
    skipped.push(`${url} (${reason})`)
  else toCheck.push(url)
}

const failures = []
const CONCURRENCY = 6
for (let i = 0; i < toCheck.length; i += CONCURRENCY) {
  await Promise.all(
    toCheck.slice(i, i + CONCURRENCY).map(async (url) => {
      const problem = await check(url)
      if (problem)
        failures.push(`${url} → ${problem}   (in: ${[...found.get(url)].join(', ')})`)
    }),
  )
}

for (const line of skipped) console.log(`  ↷ skipped ${line}`)
if (failures.length > 0) {
  console.error(
    `\n✗ check-external-links: ${failures.length} of ${toCheck.length} URL(s) broken:\n  - ${failures.join('\n  - ')}\n`,
  )
  process.exit(1)
}
console.log(`✓ check-external-links: ${toCheck.length} external URL(s) resolve (${skipped.length} allowlisted)`)
