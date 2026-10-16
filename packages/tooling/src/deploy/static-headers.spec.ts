/**
 * The static deploy image sends browser security headers on every response
 * (UI-DZUP-UI-SEC-L-08).
 *
 * deploy/nginx.static.conf is the only config deploy/Dockerfile.static ships.
 * nginx does not inherit `add_header` into a location that declares its own,
 * so the headers must be set at server level AND repeated, value for value, in
 * every location that sets a header of its own — otherwise HTML and assets
 * (the responses that matter) silently go out without them.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT_DIR = resolve(import.meta.dirname, '..', '..', '..', '..')
const CONF = resolve(ROOT_DIR, 'deploy', 'nginx.static.conf')

const REQUIRED = [
  'Content-Security-Policy',
  'X-Frame-Options',
  'X-Content-Type-Options',
  'Referrer-Policy',
  'Cross-Origin-Opener-Policy',
] as const

interface Block {
  name: string
  headers: Map<string, string>
}

/** Server-level and per-location `add_header` directives, by brace depth. */
function parseHeaderBlocks(source: string): Block[] {
  const server: Block = { name: 'server', headers: new Map() }
  const blocks: Block[] = [server]
  let current: Block | undefined
  let depth = 0
  for (const raw of source.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim()
    if (line === '')
      continue
    if (line.endsWith('{')) {
      depth++
      if (depth === 2) {
        current = { name: line.slice(0, -1).trim(), headers: new Map() }
        blocks.push(current)
      }
      continue
    }
    if (line === '}') {
      if (depth === 2)
        current = undefined
      depth--
      continue
    }
    const header = /^add_header\s+(\S+)\s+("[^"]*"|\S+)(\s+always)?\s*;$/.exec(line)
    if (header) {
      const target = depth === 1 ? server : current
      target?.headers.set(header[1]!, `${header[2]}${header[3] ? ' always' : ''}`)
    }
  }
  return blocks
}

describe('deploy/nginx.static.conf security headers (UI-DZUP-UI-SEC-L-08)', () => {
  const blocks = parseHeaderBlocks(readFileSync(CONF, 'utf-8'))
  const server = blocks[0]!
  const overriding = blocks.slice(1).filter(block => block.headers.size > 0)

  it('sets every required header at server level, with always', () => {
    for (const name of REQUIRED)
      expect(server.headers.get(name), name).toMatch(/ always$/)
  })

  it('finds the locations that override headers, so the next check is not vacuous', () => {
    expect(overriding.map(block => block.name)).toEqual(
      expect.arrayContaining([expect.stringContaining('\\.html$')]),
    )
  })

  it.each(REQUIRED)('repeats %s, value for value, in every location that declares add_header', (name) => {
    for (const block of overriding)
      expect(block.headers.get(name), `${block.name} → ${name}`).toBe(server.headers.get(name))
  })

  it('refuses framing by other origins', () => {
    expect(server.headers.get('Content-Security-Policy')).toContain(`frame-ancestors 'self'`)
    expect(server.headers.get('X-Frame-Options')).toContain('SAMEORIGIN')
  })
})

describe('parseHeaderBlocks', () => {
  it('detects a location that drops an inherited header', () => {
    const blocks = parseHeaderBlocks([
      'server {',
      '  add_header X-Frame-Options "SAMEORIGIN" always;',
      '  location / {',
      '    add_header Cache-Control "no-store" always;',
      '  }',
      '}',
    ].join('\n'))
    expect(blocks[0]!.headers.get('X-Frame-Options')).toBe('"SAMEORIGIN" always')
    expect(blocks[1]!.headers.has('X-Frame-Options')).toBe(false)
  })
})
