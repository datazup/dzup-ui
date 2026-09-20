import type { DzUrlPolicyContext } from '@dzup-ui/contracts'
import { DZ_ALLOWED_URL_SCHEMES, DZ_PROVIDER_DEFAULTS } from '@dzup-ui/contracts'
import { fixturesForSink, payloadOf } from '@dzup-ui/testing/security-corpus'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectiveScheme } from '../../security/boundary-suites.ts'
import {
  applyUrlPolicy,
  DZ_DEFAULT_URL_POLICY,
  effectiveUrlScheme,
  isAllowedUrl,
  resetUrlPolicyWarnings,
  resolveUrlPolicy,
} from './url-policy.ts'

/**
 * The URL policy, unit level (TASK-R2-O4).
 *
 * The *component* level is `packages/core/security/url-boundary.url-policy.spec.ts`,
 * which is corpus-driven and measures the rendered DOM. This file covers the
 * three things a corpus run cannot see: the normalizer's edge cases, the
 * provider fold, and the dev-warning contract.
 */

const NAV: DzUrlPolicyContext = { component: 'DzTest', prop: 'href', sink: 'navigation' }

describe('effectiveUrlScheme — WHATWG URL §4.4, all three steps', () => {
  it.each([
    ['https://example.test/', 'https'],
    ['HTTPS://example.test/', 'https'],
    ['JaVaScRiPt:alert(1)', 'javascript'],
    ['  javascript:alert(1)  ', 'javascript'],
    ['\u0001javascript:alert(1)', 'javascript'],
    ['java\tscript:alert(1)', 'javascript'],
    ['java\nscript:alert(1)', 'javascript'],
    ['java\rscript:alert(1)', 'javascript'],
    ['mailto:a@b.test', 'mailto'],
    ['a+b-c.d:x', 'a+b-c.d'],
  ])('reads %o as scheme %o', (raw, scheme) => {
    expect(effectiveUrlScheme(raw)).toBe(scheme)
  })

  it.each([
    '/products',
    './sibling',
    '../parent',
    '#intro',
    '?page=2',
    '//cdn.example.test/logo.png',
    '',
    '   ',
    '1nvalid:x',
    '-leading-hyphen:x',
  ])('reads %o as carrying no scheme', (raw) => {
    expect(effectiveUrlScheme(raw)).toBeNull()
  })

  it('does not treat a colon inside a path as a scheme', () => {
    expect(effectiveUrlScheme('/a:b/c')).toBeNull()
  })

  it('agrees with the corpus oracle on every url-scheme fixture', () => {
    // `boundary-suites.ts` keeps its OWN normalizer on purpose: it models what a
    // browser would do with a value that is already in the DOM, and the policy
    // models what the library will admit. Two implementations of one
    // specification is the independence that makes the corpus a measurement
    // rather than a tautology — so this asserts they agree rather than deleting
    // one of them (the failure mode TASK-R3-O2 recorded as D7 in Pro).
    const fixtures = fixturesForSink('navigation', ['url-scheme'])
    expect(fixtures.length).toBeGreaterThan(0)
    for (const fixture of fixtures) {
      const payload = payloadOf(fixture)
      expect(effectiveUrlScheme(payload), fixture.id).toBe(effectiveScheme(payload))
    }
  })
})

describe('isAllowedUrl — allowlist, not denylist', () => {
  it.each(['http', 'https', 'mailto', 'tel', 'sms'])('admits %s:', (scheme) => {
    expect(isAllowedUrl(`${scheme}:whatever`, DZ_ALLOWED_URL_SCHEMES)).toBe(true)
  })

  it.each([
    'javascript:alert(1)',
    'vbscript:msgbox(1)',
    'data:text/html,<script>alert(1)</script>',
    'file:///etc/passwd',
    'blob:https://evil.test/1234',
    'filesystem:https://evil.test/temporary/x',
    'ws://evil.test/',
    'intent://x#Intent;end',
  ])('refuses %s', (raw) => {
    expect(isAllowedUrl(raw, DZ_ALLOWED_URL_SCHEMES)).toBe(false)
  })

  it('refuses a scheme nobody has thought of yet — that is the direction an allowlist is wrong in', () => {
    expect(isAllowedUrl('newscheme2030:do-something', DZ_ALLOWED_URL_SCHEMES)).toBe(false)
  })

  it.each(['/products', '#intro', '?q=1', './x', '//cdn.example.test/a.png'])(
    'admits the relative form %s, which resolves against the document the host chose',
    (raw) => {
      expect(isAllowedUrl(raw, DZ_ALLOWED_URL_SCHEMES)).toBe(true)
    },
  )

  it('closes all four javascript: evasions, not one of them', () => {
    const evasions = [
      'javascript:alert(1)',
      'JavaScript:alert(1)',
      '\u0001javascript:alert(1)',
      'java\tscript:alert(1)',
    ]
    // The check a reviewer reaches for first would pass three of these.
    expect(evasions.filter(e => e.startsWith('javascript:'))).toHaveLength(1)
    for (const raw of evasions)
      expect(isAllowedUrl(raw, DZ_ALLOWED_URL_SCHEMES), raw).toBe(false)
  })
})

describe('the documented default', () => {
  it('is the contract\'s published list, so Pro resolves to the same value', () => {
    expect(DZ_DEFAULT_URL_POLICY.allowedSchemes).toEqual(DZ_ALLOWED_URL_SCHEMES)
    expect(DZ_PROVIDER_DEFAULTS.urlPolicy.allowedSchemes).toEqual(DZ_ALLOWED_URL_SCHEMES)
  })

  it('is frozen — a policy a consumer can mutate in place is not a policy', () => {
    expect(Object.isFrozen(DZ_DEFAULT_URL_POLICY)).toBe(true)
  })
})

describe('resolveUrlPolicy — the provider fold', () => {
  it('returns the inherited verdict when nothing is configured', () => {
    const policy = resolveUrlPolicy(() => undefined)
    expect(policy.isAllowed('javascript:alert(1)', NAV)).toBe(false)
    expect(policy.isAllowed('https://example.test/', NAV)).toBe(true)
  })

  it('narrows when a host replaces the scheme list', () => {
    const policy = resolveUrlPolicy(() => ({ allowedSchemes: ['https'] }))
    expect(policy.isAllowed('https://example.test/', NAV)).toBe(true)
    expect(policy.isAllowed('http://example.test/', NAV)).toBe(false)
    expect(policy.allowedSchemes).toEqual(['https'])
  })

  it('widens through `allow`, which sees the default verdict', () => {
    const seen: boolean[] = []
    const policy = resolveUrlPolicy(() => ({
      allow: (url, context) => {
        seen.push(context.allowedByDefault)
        return context.allowedByDefault || url.startsWith('slack:')
      },
    }))
    expect(policy.isAllowed('slack://channel/x', NAV)).toBe(true)
    expect(policy.isAllowed('javascript:alert(1)', NAV)).toBe(false)
    expect(policy.isAllowed('https://example.test/', NAV)).toBe(true)
    expect(seen).toEqual([false, false, true])
  })

  it('lets `allow` narrow as well as widen', () => {
    const policy = resolveUrlPolicy(() => ({
      allow: (url, context) => context.allowedByDefault && !url.startsWith('http://'),
    }))
    expect(policy.isAllowed('http://example.test/', NAV)).toBe(false)
    expect(policy.isAllowed('https://example.test/', NAV)).toBe(true)
  })

  it('folds per field: a nested list keeps the ancestor\'s allow function', () => {
    const ancestor = resolveUrlPolicy(() => ({
      allow: (url, context) => context.allowedByDefault || url.startsWith('slack:'),
    }))
    const nested = resolveUrlPolicy(() => ({ allowedSchemes: ['https'] }), ancestor)
    expect(nested.isAllowed('slack://channel/x', NAV)).toBe(true)
    expect(nested.isAllowed('http://example.test/', NAV)).toBe(false)
    expect(nested.isAllowed('https://example.test/', NAV)).toBe(true)
  })

  it('reads its options at call time, so a live prop change changes the verdict', () => {
    let schemes: readonly string[] = ['https']
    const policy = resolveUrlPolicy(() => ({ allowedSchemes: schemes }))
    expect(policy.isAllowed('mailto:a@b.test', NAV)).toBe(false)
    schemes = ['https', 'mailto']
    expect(policy.isAllowed('mailto:a@b.test', NAV)).toBe(true)
  })

  it('hands the full context to a host\'s allow function', () => {
    const contexts: DzUrlPolicyContext[] = []
    const policy = resolveUrlPolicy(() => ({
      allow: (_url, context) => {
        contexts.push(context)
        return true
      },
    }))
    policy.isAllowed('x:y', { component: 'DzMenuItem', prop: 'href', sink: 'navigation' })
    expect(contexts[0]).toMatchObject({ component: 'DzMenuItem', prop: 'href', sink: 'navigation' })
  })
})

describe('applyUrlPolicy — rejection is omission, never a rewrite', () => {
  beforeEach(() => {
    resetUrlPolicyWarnings()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it.each([undefined, null, ''])('treats %o as "no URL", not as a rejection', (raw) => {
    const decision = applyUrlPolicy(DZ_DEFAULT_URL_POLICY, raw, NAV)
    expect(decision).toEqual({ href: undefined, rejected: false })
  })

  it('returns the value unchanged when it is allowed', () => {
    expect(applyUrlPolicy(DZ_DEFAULT_URL_POLICY, '/products', NAV))
      .toEqual({ href: '/products', rejected: false })
  })

  it('returns NO substitute for a refused value', () => {
    const decision = applyUrlPolicy(DZ_DEFAULT_URL_POLICY, 'javascript:alert(1)', NAV)
    expect(decision.href).toBeUndefined()
    expect(decision.rejected).toBe(true)
    // The two rewrites a reviewer might expect, asserted absent: `#` produces a
    // control that looks operable and is not, and `javascript:void(0)` is the
    // very idiom this policy exists to stop rendering.
    expect(decision.href).not.toBe('#')
    expect(decision.href).not.toBe('javascript:void(0)')
  })

  it('warns once per component, prop and scheme — a menu of 500 hostile rows is one line', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    for (let i = 0; i < 500; i += 1)
      applyUrlPolicy(DZ_DEFAULT_URL_POLICY, `javascript:alert(${i})`, NAV)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]?.[0]).toContain('DzTest')
    expect(warn.mock.calls[0]?.[0]).toContain('javascript:')
    expect(warn.mock.calls[0]?.[0]).toContain('url-policy')
  })

  it('still warns for a second, different scheme on the same prop', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    applyUrlPolicy(DZ_DEFAULT_URL_POLICY, 'javascript:alert(1)', NAV)
    applyUrlPolicy(DZ_DEFAULT_URL_POLICY, 'vbscript:msgbox(1)', NAV)
    expect(warn).toHaveBeenCalledTimes(2)
  })

  it('does not warn for an allowed URL', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    applyUrlPolicy(DZ_DEFAULT_URL_POLICY, 'https://example.test/', NAV)
    expect(warn).not.toHaveBeenCalled()
  })
})
