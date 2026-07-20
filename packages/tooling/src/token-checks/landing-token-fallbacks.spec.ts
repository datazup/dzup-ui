/**
 * Every `var(--dz-*, #hex)` fallback in the landing app must equal what its token
 * actually resolves to (TASK-FREE3-08).
 *
 * **Why a guard at all.** A fallback is invisible until the day it isn't. It
 * renders only when the token stylesheet is missing or late — and that is
 * precisely the moment the site most needs to look like itself. The landing app
 * had drifted wholesale: `--dz-primary` fell back to `#4f46e5` and
 * `--dz-colors-primary-500` to `#6366f1`, both generic template indigos, while
 * the brand primary-500 is `#0766ee` (the value `favicon.svg`,
 * `site.webmanifest` and the `theme-color` metas all agree on). Blocking the
 * stylesheet painted a page in a colour the product has never used.
 *
 * **Why recompute instead of listing expected hexes.** A hand-written table of
 * "correct" values is the same class of bug one level up — it drifts as soon as
 * the ramp moves and nothing tells you. This resolves each token through
 * `packages/tokens/dist/tokens.css`, following `var()` indirection into the
 * primitive ramp, and converts the resulting `oklch()` to sRGB with the same
 * `oklchToHex` the Storybook manager palette guard uses. Move a shade and this
 * fails; nobody has to remember.
 *
 * This is the "extend the colour-lint approach" option from the task's `<guard>`
 * clause rather than the narrower "targeted test over the known fallback sites"
 * one. Stated reason: the known-sites list was wrong. The review named six chrome
 * files; the real footprint was 86 files and 464 sites, because the indigo
 * fallback convention had spread through `pages/`, `gallery/demos/` and
 * `motion/components/` as well. A guard scoped to a hand-listed set would have
 * certified the site brand-correct while most of it still degraded to indigo.
 *
 * ── Light values, not dark ──
 * A fallback is ONE static value with no theme awareness — there is no
 * `var(--x, light, dark)`. Light is the default rendering, so light is what the
 * fallback must match. Semantic tokens redeclared under `[data-theme="dark"]`
 * are read from the light block only.
 *
 * ── Scope ──
 * `apps/landing/src`, minus:
 *   • `blocks/` and `templates/` — copy-paste source a visitor lifts into their
 *     own app, out of scope by the task's own `<motivation>`. Counted and
 *     reported below rather than silently skipped, so the exemption stays a
 *     visible decision with a number attached.
 *   • `*.spec.ts` — hexes there are test INPUT (`theme.brand.value = '#4f46e5'`),
 *     not brand claims.
 * Bare literals (`color: #fff`) are also out of scope: they are not fallbacks and
 * have no token to diverge from. The white-over-scrim cases are the documented
 * exception the task calls out.
 */

import { globSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { oklchToHex } from './oklch-contrast.ts'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..')
const TOKENS_CSS = resolve(REPO_ROOT, 'packages', 'tokens', 'dist', 'tokens.css')
const LANDING_SRC = 'apps/landing/src'

/** `var(--dz-token, #hex)` — the fallback form this guard governs. */
const FALLBACK = /var\(\s*(--dz-[\w-]+)\s*,\s*(#[0-9a-fA-F]{3,8})\s*\)/g

// ── Token resolution ────────────────────────────────────────────────────────

const css = readFileSync(TOKENS_CSS, 'utf8')

/**
 * Primitive ramp + LIGHT semantic layer. Sliced before the first
 * `[data-theme="dark"]` block so a dark redeclaration can never shadow the light
 * value a fallback is supposed to mirror.
 */
const lightOnly = css.slice(0, css.indexOf('[data-theme="dark"]'))

const tokens = new Map<string, string>()
// `:([^;]+);` with no `\s*` after the colon — a trailing `\s*` there could swap
// characters with `[^;]+` (both match whitespace), which is polynomial
// backtracking. The value is trimmed below instead.
for (const match of lightOnly.matchAll(/(--dz-[\w-]+)\s*:([^;]+);/g)) {
  // First declaration wins — `:root` primitives precede the light semantic block.
  if (!tokens.has(match[1]!))
    tokens.set(match[1]!, match[2]!.trim())
}

/** Follow `var()` indirection to a concrete colour, then to `#rrggbb`. */
function resolveHex(name: string, depth = 0): string | null {
  if (depth > 10)
    return null
  const value = tokens.get(name)
  if (value === undefined)
    return null
  const indirect = value.match(/^var\(\s*(--[\w-]+)\s*\)$/)
  if (indirect)
    return resolveHex(indirect[1]!, depth + 1)
  if (value.startsWith('oklch('))
    return oklchToHex(value)
  if (/^#[0-9a-f]{6}$/i.test(value))
    return value.toLowerCase()
  return null
}

// ── Collect the fallback sites ──────────────────────────────────────────────

interface Site {
  readonly file: string
  readonly line: number
  readonly token: string
  readonly hex: string
}

function collect(includeCopyPaste: boolean): Site[] {
  const files = globSync(`${LANDING_SRC}/**/*.{vue,ts,css}`, { cwd: REPO_ROOT })
    .map(f => f.replace(/\\/g, '/'))
    .filter(f => !f.endsWith('.spec.ts'))
    .filter((f) => {
      const isCopyPaste
        = f.startsWith(`${LANDING_SRC}/blocks/`) || f.startsWith(`${LANDING_SRC}/templates/`)
      return includeCopyPaste ? isCopyPaste : !isCopyPaste
    })

  const sites: Site[] = []
  for (const file of files) {
    const lines = readFileSync(resolve(REPO_ROOT, file), 'utf8').split(/\r?\n/)
    lines.forEach((text, index) => {
      for (const match of text.matchAll(FALLBACK))
        sites.push({ file, line: index + 1, token: match[1]!, hex: match[2]!.toLowerCase() })
    })
  }
  return sites
}

const sites = collect(false)

describe('landing token fallbacks', () => {
  it('reads the generated token stylesheet', () => {
    expect(css).toContain('--dz-colors-primary-500')
    expect(resolveHex('--dz-colors-primary-500')).toBe('#0766ee')
  })

  it('finds fallback sites to check', () => {
    // A refactor that moved every fallback out would make the assertions below
    // vacuously green. Fail loudly instead of passing on an empty set.
    expect(sites.length).toBeGreaterThan(50)
  })

  /**
   * The main assertion. One case per divergent site, so a failure names the file,
   * the line, the token, what is written and what the token actually is.
   */
  it('every fallback matches the value its token resolves to', () => {
    const divergent = sites
      .map((site) => {
        const want = resolveHex(site.token)
        return want !== null && want !== expand(site.hex) ? { ...site, want } : null
      })
      .filter((entry): entry is Site & { want: string } => entry !== null)

    expect(
      divergent.map(d => `${d.file}:${d.line}  var(${d.token}, ${d.hex})  should be ${d.want}`),
      'A fallback disagrees with its token. It only renders when the token stylesheet is '
      + 'missing — the one moment the site must still look like itself.',
    ).toEqual([])
  })

  /**
   * Fallbacks whose token does not exist in `tokens.css` at all.
   *
   * These are the opposite failure and the reason this test does not simply skip
   * what it cannot resolve: an undefined token means the fallback is not a
   * degradation path but the ONLY value that ever renders, permanently
   * unguardable and invisible to the assertion above. Listed explicitly, with
   * their sites, so adding a new one is a decision someone makes on purpose.
   *
   * The three below are pre-existing (TASK-FREE3-08 found them; fixing them means
   * choosing a real token for each, which is a design call, not a sweep):
   *   • `--dz-colors-base-white` / `--dz-colors-base-black` — white/black scrim
   *     overlays. The effective `#fff`/`#000` is the documented scrim exception,
   *     so the rendering is right; the var() wrapper around it is dead.
   *   • `--dz-border-strong` — falls back to `#d1d5db`, a Tailwind grey that is
   *     not on the dz ramp. `--dz-border-hover` is the likely intended token.
   */
  it('declares every phantom token — fallbacks that always render', () => {
    const KNOWN_PHANTOMS = ['--dz-border-strong', '--dz-colors-base-black', '--dz-colors-base-white']

    const phantoms = [...new Set(sites.filter(s => resolveHex(s.token) === null).map(s => s.token))]

    expect(
      phantoms.sort(),
      'A fallback references a token that tokens.css does not define, so the fallback is the '
      + 'only value that will ever render. Either point it at a real token or add it to '
      + 'KNOWN_PHANTOMS with a reason.',
    ).toEqual(KNOWN_PHANTOMS)
  })

  it('keeps every fallback a lowercase literal, so comparison is textual', () => {
    for (const site of sites)
      expect(site.hex, `${site.file}:${site.line} is not a lowercase hex`).toMatch(/^#[0-9a-f]{3,8}$/)
  })

  /**
   * The copy-paste surface is EXEMPT, not clean — recorded with a count so the
   * exemption cannot quietly become "we checked everything".
   */
  it('reports the exempt copy-paste surface rather than implying it was checked', () => {
    const exempt = collect(true)
    expect(exempt.length).toBeGreaterThan(0)
    // `warn`, not `info`: the message is a caveat, not a status line — it names
    // a surface this guard did NOT check, which is exactly the thing a silent
    // skip would let read as "we checked everything".
    console.warn(
      `[landing-token-fallbacks] ${sites.length} fallback(s) checked in landing chrome; `
      + `${exempt.length} in blocks/ + templates/ deliberately NOT checked (visitor copy-paste `
      + 'source, out of scope per TASK-FREE3-08).',
    )
  })
})

/**
 * Brand literals that cannot be a `var()` at all — a shields.io query string and
 * the `theme-color` metas are read by servers and browser chrome, outside any
 * stylesheet. They are copies of the ramp with no CSS fallback mechanism behind
 * them, so they get the same recompute treatment.
 */
describe('landing brand literals outside CSS', () => {
  it('index.html theme-color metas mirror the primary ramp', () => {
    const html = readFileSync(resolve(REPO_ROOT, 'apps/landing/index.html'), 'utf8')

    const metas = [...html.matchAll(/<meta\s+name="theme-color"[^>]*>/g)].map(m => m[0])
    expect(metas.length, 'expected paired light/dark theme-color metas').toBe(2)

    const light = metas.find(m => m.includes('prefers-color-scheme: light'))
    const dark = metas.find(m => m.includes('prefers-color-scheme: dark'))
    expect(light, 'no light theme-color meta').toBeTruthy()
    expect(dark, 'no dark theme-color meta').toBeTruthy()

    expect(light).toContain(`content="${resolveHex('--dz-colors-primary-500')}"`)
    expect(dark).toContain(`content="${resolveHex('--dz-colors-primary-600')}"`)

    // The runtime override in useTheme.ts targets these by data-scheme.
    expect(light).toContain('data-scheme="light"')
    expect(dark).toContain('data-scheme="dark"')
  })

  it('the manifest and favicon still agree with the light theme-color', () => {
    const brand = resolveHex('--dz-colors-primary-500')!
    const manifest = readFileSync(resolve(REPO_ROOT, 'apps/landing/public/site.webmanifest'), 'utf8')
    const favicon = readFileSync(resolve(REPO_ROOT, 'apps/landing/public/favicon.svg'), 'utf8')

    expect(manifest).toContain(brand)
    expect(favicon).toContain(brand)
  })

  it('footer badge URLs use the brand blue', () => {
    const footer = readFileSync(resolve(REPO_ROOT, 'apps/landing/src/components/Footer.vue'), 'utf8')
    const brandNoHash = resolveHex('--dz-colors-primary-500')!.slice(1)

    const badgeUrls = [...footer.matchAll(/https:\/\/img\.shields\.io\/[^'"]+/g)].map(m => m[0])
    expect(badgeUrls.length).toBeGreaterThan(0)

    for (const url of badgeUrls) {
      expect(
        url.toLowerCase(),
        `shields.io badge does not use the brand colour (${brandNoHash}): ${url}`,
      ).toContain(brandNoHash)
    }
  })
})

/** `#abc` -> `#aabbcc`, so a shorthand fallback compares against a 6-digit token. */
function expand(hex: string): string {
  if (hex.length !== 4)
    return hex
  const [, r, g, b] = hex
  return `#${r}${r}${g}${g}${b}${b}`
}
