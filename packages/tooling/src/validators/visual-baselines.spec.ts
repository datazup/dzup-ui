import type { VisualCeilings, VisualLane, VisualLedger } from './visual-baselines.ts'
import { describe, expect, it } from 'vitest'
import {
  checkDeveloperLocalRatchet,
  checkLaneAuthority,
  checkVisualBaselines,
  platformSuffixOf,
  readLedger,
  readVisualCeilings,
} from './visual-baselines.ts'

/**
 * The platform-authority gates (TASK-S1-O3).
 *
 * These tests are the proof that a wrong-platform or empty visual lane cannot
 * pass silently, and they are unit tests rather than a one-off run because the
 * property has to survive the next person. Every case below is a way for the
 * visual lane to be **green while proving nothing**, which is the one outcome
 * worse than a red:
 *
 *   - a lane declared as a gate for a platform no runner has;
 *   - a lane whose images are for a platform its declaration does not claim
 *     (a half-finished migration, or an accept run on the wrong host);
 *   - a lane with no images at all, which exits 0 having compared nothing;
 *   - a second developer-local lane, added quietly.
 *
 * The last case in this file asserts the **committed** ledger is clean, so the
 * gates are exercised against the real repository state and not only fixtures.
 */

function lane(over: Partial<VisualLane> = {}): VisualLane {
  return {
    id: 'gallery',
    spec: 'e2e/visual/gallery.spec.ts',
    snapshotDir: 'e2e/visual/gallery.spec.ts-snapshots',
    capturedOn: 'linux',
    role: 'gate',
    scope: '8 demo screens × light/dark.',
    excludes: 'Says nothing about which component moved.',
    ...over,
  }
}

function ledger(over: Partial<VisualLedger> = {}): VisualLedger {
  return {
    schemaVersion: '1.2.0',
    scope: {
      families: ['buttons'],
      engine: 'chromium',
      themes: ['light', 'dark'],
      direction: 'ltr',
      viewport: { width: 1280, height: 720 },
      platform: 'linux',
      ciPlatform: 'linux',
      authoritativePlatform: 'linux',
      note: '',
    },
    snapshotDirs: ['e2e/visual/gallery.spec.ts-snapshots'],
    lanes: [lane()],
    baselines: [{
      file: 'e2e/visual/gallery.spec.ts-snapshots/gallery-dashboard-light-chromium-linux.png',
      sha256: 'a'.repeat(64),
      component: 'gallery:dashboard',
      theme: 'light',
      story: 'visual-refresh-dashboard--dzup-ui',
      engine: 'chromium',
      platform: 'linux',
      sourceCommit: 'abc1234',
      worktreeDirty: false,
      acceptedBy: 'someone',
      acceptedAt: '2026-09-23',
      reason: 'A first screen-level baseline captured on the authoritative platform.',
      replaces: null,
    }],
    ...over,
  }
}

const files = ['e2e/visual/gallery.spec.ts-snapshots/gallery-dashboard-light-chromium-linux.png']

function ceilings(ceiling: number): VisualCeilings {
  return { developerLocalLanes: { ceiling, lanes: [] } }
}

describe('platformSuffixOf', () => {
  it('reads the engine and platform Playwright encoded into the file name', () => {
    expect(platformSuffixOf('a/component-DzButton-dark-chromium-win32.png'))
      .toEqual({ engine: 'chromium', platform: 'win32' })
    expect(platformSuffixOf('a/theme-recipe-form-mobile-system-cozy-ltr-normal-os-light-chromium-linux.png'))
      .toEqual({ engine: 'chromium', platform: 'linux' })
  })

  it('returns undefined for a file Playwright did not write', () => {
    expect(platformSuffixOf('a/hand-made.png')).toBeUndefined()
  })
})

describe('checkLaneAuthority', () => {
  it('passes a lane captured on the authoritative platform', () => {
    expect(checkLaneAuthority(ledger(), files)).toEqual([])
  })

  it('refuses a ledger with no declared authoritative platform', () => {
    const l = ledger()
    const scope = { ...l.scope }
    delete scope.authoritativePlatform
    const violations = checkLaneAuthority({ ...l, scope }, files)
    expect(violations).toHaveLength(1)
    expect(violations[0]!.rule).toBe('authority')
    expect(violations[0]!.level).toBe('error')
  })

  it('refuses a ledger with no lanes at all', () => {
    const violations = checkLaneAuthority({ ...ledger(), lanes: [] }, files)
    expect(violations).toHaveLength(1)
    expect(violations[0]!.rule).toBe('lane')
  })

  it('fAILS a gate lane captured on a platform that is not the authoritative one', () => {
    const violations = checkLaneAuthority(
      { ...ledger(), lanes: [lane({ capturedOn: 'win32', role: 'gate' })] },
      files,
    )
    const gate = violations.filter(v => v.message.includes('can never pass'))
    expect(gate).toHaveLength(1)
    expect(gate[0]!.level).toBe('error')
    expect(gate[0]!.message).toContain('win32')
    expect(gate[0]!.message).toContain('linux')
  })

  it('does NOT fail a developer-local lane off the authoritative platform — it is an honest state', () => {
    const l = ledger({
      lanes: [lane({ capturedOn: 'linux', role: 'developer-local' })],
    })
    expect(checkLaneAuthority(l, files)).toEqual([])
  })

  it('fAILS a lane with zero baselines — the silent-green case', () => {
    const violations = checkLaneAuthority({ ...ledger(), baselines: [] }, [])
    const empty = violations.filter(v => v.message.includes('0 accepted baselines'))
    expect(empty).toHaveLength(1)
    expect(empty[0]!.level).toBe('error')
    expect(empty[0]!.message).toContain('worse than a red')
  })

  it('fAILS an image whose file-name platform disagrees with the lane', () => {
    const rogue = 'e2e/visual/gallery.spec.ts-snapshots/gallery-dashboard-light-chromium-win32.png'
    const violations = checkLaneAuthority(ledger(), [...files, rogue])
    expect(violations.some(v => v.message.includes(rogue) && v.level === 'error')).toBe(true)
  })

  it('fAILS a ledger entry whose recorded platform disagrees with its file name', () => {
    const l = ledger()
    const violations = checkLaneAuthority(
      { ...l, baselines: [{ ...l.baselines[0]!, platform: 'win32' }] },
      files,
    )
    expect(violations.some(v => v.message.includes('the ledger entry is the one that is wrong')))
      .toBe(true)
  })

  it('fAILS a snapshot directory that no lane declares', () => {
    const l = ledger()
    const violations = checkLaneAuthority(
      { ...l, snapshotDirs: [...l.snapshotDirs, 'e2e/visual/undeclared.spec.ts-snapshots'] },
      files,
    )
    expect(violations.some(v => v.message.includes('runs unguarded'))).toBe(true)
  })

  it('fAILS a lane that declares no `excludes` — an unwritten scope', () => {
    const violations = checkLaneAuthority(
      { ...ledger(), lanes: [lane({ excludes: '  ' })] },
      files,
    )
    expect(violations.some(v => v.message.includes('no stated gap'))).toBe(true)
  })
})

describe('checkDeveloperLocalRatchet', () => {
  it('passes when the count equals the ceiling', () => {
    const l = ledger({ lanes: [lane({ role: 'developer-local' })] })
    expect(checkDeveloperLocalRatchet(l, ceilings(1))).toEqual([])
  })

  it('fAILS when a developer-local lane is added above the ceiling', () => {
    const l = ledger({
      lanes: [lane({ role: 'developer-local' }), lane({ id: 'second', role: 'developer-local' })],
    })
    const violations = checkDeveloperLocalRatchet(l, ceilings(1))
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('ceiling 1')
  })

  it('fAILS when the count falls and the ceiling is not lowered with it', () => {
    const violations = checkDeveloperLocalRatchet(ledger(), ceilings(1))
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('Progress is recorded, not absorbed')
  })
})

describe('the committed ledger', () => {
  it('declares exactly one authoritative platform, and every gate lane is on it', () => {
    const committed = readLedger()
    expect(committed.scope.authoritativePlatform).toBe('linux')
    for (const l of committed.lanes ?? []) {
      if (l.role === 'gate')
        expect(l.capturedOn).toBe(committed.scope.authoritativePlatform)
    }
  })

  it('passes every hard gate, including the platform-authority gates', () => {
    const errors = checkVisualBaselines(readLedger(), () => 'abc1234', readVisualCeilings())
      .filter(v => v.level === 'error')
    expect(errors.map(v => `[${v.rule}] ${v.message}`)).toEqual([])
  })
})
