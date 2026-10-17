/**
 * The changeset-timed peer floor in `checkPeerDeps` (UI-DZUP-UI-ARCH-M-07).
 */

import type { PeerPackageJson } from './peer-ranges.ts'
import { describe, expect, it } from 'vitest'
import { checkPeerDeps, satisfiesRange } from './peer-ranges.ts'

function nuxt(range: string): PeerPackageJson {
  return { name: '@dzup-ui/nuxt', version: '0.1.0', peerDependencies: { '@dzup-ui/core': range } }
}
const workspace = new Map([['@dzup-ui/core', '0.2.0']])
function notInstalled(): null {
  return null
}

describe('satisfiesRange: prerelease floors', () => {
  it('>=0.3.0-0 admits 0.3.0 and its prereleases, not 0.2.x', () => {
    expect(satisfiesRange('0.3.0', '>=0.3.0-0')).toBe(true)
    expect(satisfiesRange('0.3.0-rc.1', '>=0.3.0-0')).toBe(true)
    expect(satisfiesRange('0.2.0', '>=0.3.0-0')).toBe(false)
  })
})

describe('checkPeerDeps: changeset-timed floor', () => {
  it('warns (not passes) when only the pending release satisfies the floor', () => {
    const [check] = checkPeerDeps(nuxt('>=0.3.0-0'), workspace, notInstalled, new Map([['@dzup-ui/core', '0.3.0']]))
    expect(check?.status).toBe('WARN')
    expect(check?.message).toMatch(/changeset-timed floor/)
  })

  it('fails when the pending release does not reach the floor either', () => {
    const [check] = checkPeerDeps(nuxt('>=0.4.0'), workspace, notInstalled, new Map([['@dzup-ui/core', '0.3.0']]))
    expect(check?.status).toBe('FAIL')
  })

  it('fails without a release plan, as before', () => {
    const [check] = checkPeerDeps(nuxt('>=0.3.0-0'), workspace, notInstalled)
    expect(check?.status).toBe('FAIL')
  })

  it('applies only to @dzup-ui/* peers', () => {
    const pkg: PeerPackageJson = { name: 'x', version: '1.0.0', peerDependencies: { other: '>=2.0.0' } }
    const [check] = checkPeerDeps(pkg, new Map([['other', '1.0.0']]), notInstalled, new Map([['other', '2.0.0']]))
    expect(check?.status).toBe('FAIL')
  })

  it('passes a satisfied workspace peer regardless of the plan', () => {
    const [check] = checkPeerDeps(nuxt('>=0.2.0'), workspace, notInstalled, new Map([['@dzup-ui/core', '0.3.0']]))
    expect(check?.status).toBe('PASS')
  })
})
