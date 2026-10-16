/**
 * Dependency-source policy pins (UI-DZUP-UI-SEC-M-03).
 *
 * `.yarnrc.yml` carried `approvedGitRepositories: ["**"]` and
 * `npmMinimalAgeGate: 0` beside `enableScripts: true`, which switched off both
 * of Yarn's guards against an arbitrary Git dependency and a freshly published
 * malicious version — while yarn.lock needed neither. These pins keep the two
 * guards on, and keep the lockfile honest about what the policy has to admit.
 *
 * The file is read line by line rather than through a YAML parser: the two keys
 * are top-level scalars/lists, and a spec should not need a dependency the
 * tooling package does not declare.
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = resolve(import.meta.dirname, '../../../..')
const yarnrc = readFileSync(resolve(ROOT, '.yarnrc.yml'), 'utf8')
const lockfile = readFileSync(resolve(ROOT, 'yarn.lock'), 'utf8')

/** The raw value of a top-level key, plus any `  - item` lines under it. */
function topLevel(key: string): { value: string, items: string[] } | undefined {
  const lines = yarnrc.split('\n')
  const start = lines.findIndex(line => line.startsWith(`${key}:`))
  if (start === -1)
    return undefined
  const value = lines[start]!.slice(key.length + 1).trim()
  const items: string[] = []
  for (const line of lines.slice(start + 1)) {
    const item = /^\s+-\s(.*)$/.exec(line)
    if (item === null)
      break
    items.push(item[1]!.trim().replace(/^["']|["']$/g, ''))
  }
  return { value, items }
}

/** Minutes, for the units Yarn's DURATION settings accept. Bare numbers are minutes. */
function durationMinutes(raw: string): number {
  const match = /^["']?(\d+(?:\.\d+)?)\s*(ms|[smhdw])?["']?$/.exec(raw)
  if (match === null)
    throw new Error(`unparseable duration: ${raw}`)
  const factors = { ms: 1 / 60000, s: 1 / 60, m: 1, h: 60, d: 1440, w: 10080 }
  const unit = (match[2] ?? 'm') as keyof typeof factors
  return Number(match[1]) * factors[unit]
}

describe('.yarnrc.yml dependency policy', () => {
  it('approves no Git repository by wildcard', () => {
    const approved = topLevel('approvedGitRepositories')
    // Absent is Yarn's default, the empty list.
    if (approved === undefined)
      return
    const listed = approved.value === '[]' || approved.value === '' ? approved.items : [approved.value]
    for (const pattern of listed) {
      expect(pattern, 'a Git approval names its repository').not.toMatch(/^\*+$/)
      expect(pattern).not.toMatch(/^(?:https?:\/\/|git@)?\*/)
    }
  })

  it('keeps a non-zero npm minimal-age gate of at least one day', () => {
    const gate = topLevel('npmMinimalAgeGate')
    // Absent means Yarn's default (1d), which also satisfies the floor.
    if (gate === undefined)
      return
    expect(durationMinutes(gate.value)).toBeGreaterThanOrEqual(1440)
  })

  it('needs no Git resolution in yarn.lock that the policy would refuse', () => {
    const approved = topLevel('approvedGitRepositories')
    const resolutions = [...lockfile.matchAll(/^\s+resolution: "(.*)"$/gm)].map(m => m[1]!)
    const gitSourced = resolutions.filter(r => /@(?:git[+:]|https?:\/\/[^"]*\.git|github:)|#commit=/.test(r))
    if ((approved?.items.length ?? 0) === 0)
      expect(gitSourced).toEqual([])
  })
})
