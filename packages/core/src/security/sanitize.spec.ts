import type { DzSanitizeContext, DzSanitizerAdapter } from '@dzup-ui/contracts'
import { DZ_PROVIDER_DEFAULTS, DzSanitizeLimitError } from '@dzup-ui/contracts'
import { describe, expect, it, vi } from 'vitest'
import {
  DZ_DEFAULT_SANITIZE_LIMITS,
  DZ_ESCAPING_SANITIZER,
  enforceSanitizeLimits,
  escapeHtml,
  measureHtmlDepth,
  resolveSanitizer,
} from './sanitize.ts'

/**
 * The Core half of the sanitizer seam (TASK-R3-O2, ADR-20 amendment A6).
 *
 * Three properties are load-bearing, and each is tested in both directions:
 *
 *   1. **The default is never a pass-through.** A host that installs nothing
 *      gets markup rendered as text, on the server and in the browser alike.
 *   2. **The ceilings are the seam's, not the adapter's.** A host that supplies
 *      only a `sanitize` function still gets them, and they are applied
 *      before anything parses — which is the whole reason the depth measurement
 *      is a scanner rather than a parse.
 *   3. **Options fold per field.** Tightening a ceiling does not discard the
 *      adapter, which is ADR-20 §3's per-key override one level down.
 */

function ctx(over: Partial<DzSanitizeContext> = {}): DzSanitizeContext {
  return { sink: 'markdown', component: 'DzTest', ...over }
}

describe('escapeHtml', () => {
  it('renders every tag-forming character inert', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;',
    )
  })

  it('escapes the ampersand once, not twice', () => {
    // `&` is matched by the same pass as the rest, so an already-escaped entity
    // becomes `&amp;lt;` — visibly escaped text — rather than surviving as `<`.
    expect(escapeHtml('&lt;b&gt;')).toBe('&amp;lt;b&amp;gt;')
  })

  it('closes the attribute-breakout characters', () => {
    expect(escapeHtml(`" onerror='x'`)).toBe('&quot; onerror=&#39;x&#39;')
  })

  it('leaves ordinary text untouched', () => {
    expect(escapeHtml('a plain sentence, 5 > 4 aside')).toBe('a plain sentence, 5 &gt; 4 aside')
  })
})

describe('measureHtmlDepth', () => {
  it('counts real nesting', () => {
    expect(measureHtmlDepth('<div><p><span>x</span></p></div>')).toBe(3)
  })

  it('counts siblings as siblings', () => {
    // The over-counting failure: `<p>` implicitly closes an open `<p>`, so this
    // is 1,000 siblings at depth 1, not a 1,000-deep document. Getting this
    // wrong rejects ordinary prose.
    expect(measureHtmlDepth('<p>x'.repeat(1000))).toBe(1)
  })

  it('counts a self-closing HTML tag as an open element', () => {
    // The under-counting bypass: `/>` self-closes only in foreign content, so
    // `<span/>` really does nest in HTML.
    expect(measureHtmlDepth('<span/>'.repeat(10))).toBe(10)
  })

  it('honours self-closing inside SVG, where it is real', () => {
    expect(measureHtmlDepth('<svg><path/><path/></svg>')).toBe(2)
  })

  it('counts the sections a table implies', () => {
    // `<table><td>` parses as `<table><tbody><tr><td>`; a scanner blind to the
    // implied sections under-counts this payload by half.
    expect(measureHtmlDepth('<table><td>x</td></table>')).toBe(4)
  })

  it('treats list items as siblings', () => {
    expect(measureHtmlDepth('<ul><li>a<li>b<li>c</ul>')).toBe(2)
  })

  it('opens nothing for comments, doctypes or a bare less-than', () => {
    expect(measureHtmlDepth('<!doctype html><!-- <div><div> -->a < b')).toBe(0)
  })

  it('does not parse markup inside a raw-text element', () => {
    expect(measureHtmlDepth('<style><div><div></style>')).toBe(1)
  })

  it('ignores an end tag that closes nothing', () => {
    expect(measureHtmlDepth('</div><p>x</p>')).toBe(1)
  })

  it('is not fooled by a greater-than inside an attribute value', () => {
    expect(measureHtmlDepth('<div title="a>b"><span>x</span></div>')).toBe(2)
  })

  it('returns early once the limit is passed', () => {
    // The guard's reason for existing: a depth bomb is rejected without the
    // scanner walking the rest of the payload, and without a DOM being built.
    const bomb = '<div>'.repeat(100_000)
    expect(measureHtmlDepth(bomb, 64)).toBeGreaterThan(64)
  })
})

describe('enforceSanitizeLimits', () => {
  const limits = { maxLength: 20, maxDepth: 3 }

  it('passes content inside both ceilings', () => {
    expect(() => enforceSanitizeLimits('<p>ok</p>', limits, ctx())).not.toThrow()
  })

  it('throws DzSanitizeLimitError on length, naming the component', () => {
    try {
      enforceSanitizeLimits('x'.repeat(21), limits, ctx({ component: 'DzMarkdownRenderer' }))
      expect.unreachable('expected a length rejection')
    }
    catch (error) {
      expect(error).toBeInstanceOf(DzSanitizeLimitError)
      const limitError = error as DzSanitizeLimitError
      expect(limitError.limit).toBe('maxLength')
      expect(limitError.actual).toBe(21)
      expect(limitError.allowed).toBe(20)
      expect(limitError.component).toBe('DzMarkdownRenderer')
      expect(limitError.sink).toBe('markdown')
      // Fail-closed: the message carries no markup back to the caller.
      expect(limitError.message).not.toContain('<')
    }
  })

  it('throws on depth', () => {
    try {
      // 13 characters, so it clears `maxLength` and is rejected on depth alone.
      enforceSanitizeLimits('<a><a><a><a>x', limits, ctx())
      expect.unreachable('expected a depth rejection')
    }
    catch (error) {
      expect((error as DzSanitizeLimitError).limit).toBe('maxDepth')
    }
  })

  it('checks length before depth, so an oversized payload is never walked', () => {
    const over = `${'<div>'.repeat(50)}x`
    try {
      enforceSanitizeLimits(over, limits, ctx())
      expect.unreachable('expected a rejection')
    }
    catch (error) {
      expect((error as DzSanitizeLimitError).limit).toBe('maxLength')
    }
  })
})

describe('the default adapter', () => {
  it('is escaping, not pass-through', () => {
    const out = DZ_ESCAPING_SANITIZER.sanitize('<img src=x onerror=alert(1)>', ctx())
    expect(out).not.toContain('<img')
    expect(out).toBe('&lt;img src=x onerror=alert(1)&gt;')
  })

  it('carries the policy name the published CSP recipe allowlists', () => {
    expect(DZ_ESCAPING_SANITIZER.policyName).toBe('dzup-ui')
  })

  it('carries Pro\'s measured ceilings, from one source', () => {
    expect(DZ_DEFAULT_SANITIZE_LIMITS).toEqual({ maxLength: 128 * 1024, maxDepth: 64 })
    expect(DZ_DEFAULT_SANITIZE_LIMITS).toBe(DZ_PROVIDER_DEFAULTS.sanitizer.limits)
  })

  it('cannot be mutated by a consumer that got hold of it', () => {
    expect(Object.isFrozen(DZ_ESCAPING_SANITIZER)).toBe(true)
  })
})

describe('resolveSanitizer', () => {
  const recording = (): DzSanitizerAdapter & { calls: string[] } => {
    const calls: string[] = []
    return {
      calls,
      policyName: 'host-policy',
      limits: { maxLength: 1000, maxDepth: 10 },
      sanitize: (html) => {
        calls.push(html)
        return `[clean]${html}`
      },
    }
  }

  it('falls back to the escaping default with nothing configured', () => {
    const adapter = resolveSanitizer(() => undefined)
    expect(adapter.sanitize('<b>x</b>', ctx())).toBe('&lt;b&gt;x&lt;/b&gt;')
    expect(adapter.policyName).toBe('dzup-ui')
  })

  it('uses a host sanitize function when one is supplied', () => {
    const inner = vi.fn(() => '<b>clean</b>')
    const adapter = resolveSanitizer(() => ({ sanitize: inner }))
    expect(adapter.sanitize('<b>dirty</b>', ctx())).toBe('<b>clean</b>')
    expect(inner).toHaveBeenCalledWith('<b>dirty</b>', ctx())
  })

  it('enforces the ceilings for a host that supplied only a function', () => {
    // The property that stops every consumer re-deriving a bound: the seam
    // owns the ceilings, so an adapter never has to remember them.
    const inner = vi.fn(() => 'clean')
    const adapter = resolveSanitizer(() => ({ sanitize: inner, limits: { maxLength: 5 } }))
    expect(() => adapter.sanitize('far too long', ctx())).toThrow(DzSanitizeLimitError)
    expect(inner).not.toHaveBeenCalled()
  })

  it('folds per field, keeping the inherited adapter when only limits change', () => {
    const host = recording()
    const nested = resolveSanitizer(() => ({ limits: { maxDepth: 2 } }), host)

    expect(nested.sanitize('<p>x</p>', ctx())).toBe('[clean]<p>x</p>')
    expect(nested.policyName).toBe('host-policy')
    expect(nested.limits).toEqual({ maxLength: 1000, maxDepth: 2 })
    expect(() => nested.sanitize('<div><div><div>x', ctx())).toThrow(DzSanitizeLimitError)
  })

  it('lets a per-call context tighten a ceiling further', () => {
    const host = recording()
    const adapter = resolveSanitizer(() => undefined, host)
    expect(() => adapter.sanitize('<p>hello</p>', ctx({ limits: { maxLength: 3 } })))
      .toThrow(DzSanitizeLimitError)
    // …and the adapter's own view of its limits is unchanged by that call.
    expect(adapter.limits).toEqual({ maxLength: 1000, maxDepth: 10 })
  })

  it('reads its options at call time, so a host can change a ceiling live', () => {
    let maxLength = 100
    const adapter = resolveSanitizer(() => ({ limits: { maxLength } }))
    expect(() => adapter.sanitize('<p>hello</p>', ctx())).not.toThrow()
    maxLength = 2
    expect(() => adapter.sanitize('<p>hello</p>', ctx())).toThrow(DzSanitizeLimitError)
  })

  it('passes the context through to the host adapter unchanged', () => {
    const inner = vi.fn(() => 'clean')
    const adapter = resolveSanitizer(() => ({ sanitize: inner }))
    const context = ctx({ sink: 'notebook-output', component: 'DzNotebookCell', trustedTypes: true })
    adapter.sanitize('<p>x</p>', context)
    expect(inner).toHaveBeenCalledWith('<p>x</p>', context)
  })
})
