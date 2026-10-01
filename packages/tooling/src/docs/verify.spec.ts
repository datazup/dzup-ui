/**
 * Specs for the `docs:verify` lane (TASK-S2-O3).
 *
 * The lane is data plus a spawn, so what is worth asserting is the **shape of
 * the lane** — that it covers the five checks the deploy pipeline needs, in an
 * order where nothing depends on a step that has not run, and that each flag
 * changes exactly what it claims to.
 */

import { describe, expect, it } from 'vitest'
import { parseVerifyOptions, verifySteps } from './verify.ts'

describe('docs:verify — the lane', () => {
  it('covers all five checks by default', () => {
    const checks = new Set(verifySteps().map(s => s.check))
    expect([...checks].sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('builds first — every later step asks about the artifact the build produces', () => {
    expect(verifySteps()[0]!.name).toBe('build')
  })

  it('asks the freshness question last', () => {
    const steps = verifySteps()
    expect(steps.at(-1)!.check).toBe(5)
  })

  it('passes --require-dist to the size gate, so an absent dist is an error not a skip', () => {
    const size = verifySteps().find(s => s.name === 'size')!
    expect(size.argv).toContain('--require-dist')
  })

  it('passes --require-dist to the freshness gate for the same reason', () => {
    const fresh = verifySteps().find(s => s.name === 'freshness')!
    expect(fresh.argv).toContain('--require-dist')
  })

  it('adds no second link checker — internal links are the build, step 4 is external only', () => {
    const linkSteps = verifySteps().filter(s => s.argv.some(a => a.includes('link')))
    expect(linkSteps.map(s => s.argv[0])).toEqual(['check:links'])
  })

  it('contains no deploy, upload, DNS or credential step', () => {
    const flat = verifySteps({ requireInstallable: true }).flatMap(s => s.argv).join(' ')
    for (const forbidden of ['deploy', 'publish', 'upload', 'dns', 'token', 'secret', 'login'])
      expect(flat.toLowerCase()).not.toContain(forbidden)
  })

  describe('--skip-build', () => {
    it('drops the build and keeps the other four checks', () => {
      const steps = verifySteps({ skipBuild: true })
      expect(steps.some(s => s.name === 'build')).toBe(false)
      expect([...new Set(steps.map(s => s.check))].sort()).toEqual([2, 3, 4, 5])
    })

    it('still runs the freshness gate, which is what catches the reused stale dist', () => {
      expect(verifySteps({ skipBuild: true }).some(s => s.name === 'freshness')).toBe(true)
    })
  })

  describe('--require-installable', () => {
    it('is NOT passed to the registry gate by default', () => {
      const reg = verifySteps().find(s => s.name === 'registry')!
      expect(reg.argv).not.toContain('--require-installable')
    })

    it('is passed when asked, which is how the deploy lane fails closed on tier 3', () => {
      const reg = verifySteps({ requireInstallable: true }).find(s => s.name === 'registry')!
      expect(reg.argv).toContain('--require-installable')
    })
  })

  describe('--offline', () => {
    it('drops only the external link check', () => {
      const steps = verifySteps({ offline: true })
      expect(steps.some(s => s.check === 4)).toBe(false)
      expect(steps.some(s => s.check === 1)).toBe(true)
      expect(steps.some(s => s.check === 5)).toBe(true)
    })
  })

  it('gives every step a reason, so a failing log says why the step was there', () => {
    for (const s of verifySteps())
      expect(s.why.length).toBeGreaterThan(20)
  })
})

describe('parseVerifyOptions', () => {
  it('defaults every flag to false', () => {
    expect(parseVerifyOptions([])).toEqual({
      skipBuild: false,
      requireInstallable: false,
      offline: false,
    })
  })

  it('reads each flag independently', () => {
    expect(parseVerifyOptions(['--offline'])).toMatchObject({ offline: true, skipBuild: false })
    expect(parseVerifyOptions(['--skip-build'])).toMatchObject({ skipBuild: true, offline: false })
    expect(parseVerifyOptions(['--require-installable'])).toMatchObject({ requireInstallable: true })
  })

  it('ignores an unknown flag rather than guessing at it', () => {
    expect(parseVerifyOptions(['--nope'])).toEqual({
      skipBuild: false,
      requireInstallable: false,
      offline: false,
    })
  })
})
