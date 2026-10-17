/**
 * Motion durations come from the token scale (RF-11, deferred part closed by
 * AUDIT-FOLLOWUPS-20261017-R1).
 *
 * `--dz-duration-*` (fast 150ms, normal 200ms, slow 300ms, slower 500ms) is the
 * one place a theme or a reduced-motion override can retime the library. A raw
 * Tailwind `duration-200` bypasses it, so a component keeps its own timing
 * whatever the theme says. Every such site in Core was re-pointed; this keeps
 * the count at zero.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = resolve(__dirname, '../../../..')
const SRC = join(ROOT, 'packages/core/src')
const RAW_DURATION = /(?<![\w-])duration-\d+(?![\w-])/g

function sources(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory())
      sources(p, acc)
    else if (/\.(?:ts|vue)$/.test(entry.name) && !entry.name.endsWith('.spec.ts'))
      acc.push(p)
  }
  return acc
}

describe('raw Tailwind durations in @dzup-ui/core', () => {
  it('the scan reads the component tree', () => {
    expect(sources(SRC).length).toBeGreaterThan(200)
  })

  it('none remain — use duration-[var(--dz-duration-*)]', () => {
    const found = sources(SRC).flatMap(file =>
      (readFileSync(file, 'utf8').match(RAW_DURATION) ?? []).map(m => `${relative(ROOT, file)}: ${m}`))
    expect(found).toEqual([])
  })

  it('the pattern catches the forms it exists for', () => {
    expect('transition-all duration-200'.match(RAW_DURATION)).toEqual(['duration-200'])
    expect('before:duration-150'.match(RAW_DURATION)).toEqual(['duration-150'])
    expect('duration-[var(--dz-duration-fast)]'.match(RAW_DURATION)).toBeNull()
  })
})
