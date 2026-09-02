/**
 * playground-parity.ts — TASK-N2-D3.
 *
 * The sandbox contract is stated once, in
 * `packages/tooling/src/playground/playground-contract.ts`. Three other files
 * have to agree with it:
 *
 *   - `apps/storybook/stories/_blocks/playground.config.ts` — the original
 *     implementation, which this packet deliberately did **not** re-point at the
 *     shared module (owner decision **D3-D1**: it would need a new workspace
 *     dependency and a Vite alias on a shipping app, on a worktree carrying four
 *     uncommitted programs, with a multi-minute build and a browser-driven
 *     verification script this packet cannot run).
 *   - `apps/storybook/scripts/build-playground.mjs` — the producer, which must
 *     write exactly the filenames the contract names.
 *   - `apps/docs/scripts/sync-playground-assets.mjs` — the copy step, which also
 *     restates the two `@vue/repl` editor stylesheet paths because it is a plain
 *     `.mjs` and cannot import the contract module.
 *
 * A drift between them is not cosmetic. The Storybook copy's own header records
 * what happened last time: a third asset name (`dzup-core.css`) sat in the
 * sandbox `<head>` for a stylesheet that was never written, and **every sandbox
 * load 404'd**. This gate is that defect, made unrepeatable.
 *
 * It reads the four files as text rather than importing them — two are `.mjs`
 * with top-level side effects, and one belongs to an app `packages/tooling` may
 * not depend on (README §3 `<packages>`).
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'
import {
  PLAYGROUND_ASSETS,
  PLAYGROUND_IMPORT_SPECIFIER,
  PLAYGROUND_REPL_STYLESHEETS,
  TAILWIND_BROWSER_CDN,
} from '../playground/playground-contract.ts'

export interface ParityViolation {
  file: string
  rule: string
  message: string
}

/** Every file that restates part of the contract, and what it must contain. */
export const PARITY_TARGETS = [
  'apps/storybook/stories/_blocks/playground.config.ts',
  'apps/storybook/scripts/build-playground.mjs',
  'apps/docs/scripts/sync-playground-assets.mjs',
] as const

/**
 * True when `name` appears in `text` as a whole asset name.
 *
 * The boundary is `(?<![\w.-])` and a following quote, backtick, whitespace or
 * end-of-line, for two reasons found by *running* the first draft of this gate:
 *
 *   1. A quoted-literal match (`'core.css'`) reported all three assets missing
 *      from `playground.config.ts`, which is **correct about the bytes and wrong
 *      about the meaning** — that file builds the URLs by interpolation
 *      (`` `${base}tokens.css` ``), so the name is never adjacent to a quote.
 *      The gate would have failed a file that agrees with the contract, which is
 *      the worst kind of gate: one whose owner learns to ignore it.
 *   2. A bare `includes('core.css')` would be satisfied by `dzup-core.css` —
 *      the exact name that once 404'd on every sandbox load, and therefore the
 *      one string this gate most needs to distinguish. Hence the leading
 *      `[\w.-]` exclusion.
 *
 * This is the third time in this lane that only an observed failure revealed
 * which of two nearby things a clause was actually asserting (N2-A2 F-4, N2-S1
 * F1's first draft). Both directions are covered by unit tests.
 */
export function mentionsAsset(text: string, name: string): boolean {
  return new RegExp(`(?<![\\w.-])${name.replace(/\./g, '\\.')}(?=["'\`\\s,)]|$)`, 'm').test(text)
}

/** A literal or asset name that must appear in a file. */
function mustContain(
  file: string,
  text: string,
  needles: readonly { rule: string, value: string, why: string, asset?: boolean }[],
): ParityViolation[] {
  return needles
    .filter(n => (n.asset === true ? !mentionsAsset(text, n.value) : !text.includes(n.value)))
    .map(n => ({
      file,
      rule: n.rule,
      message: `does not reference ${JSON.stringify(n.value)} — ${n.why}`,
    }))
}

export function checkPlaygroundParity(root: string = ROOT): ParityViolation[] {
  const violations: ParityViolation[] = []

  for (const rel of PARITY_TARGETS) {
    const abs = join(root, rel)
    if (!existsSync(abs)) {
      violations.push({
        file: rel,
        rule: 'exists',
        message:
          'is missing. It is one of the surfaces that restates the playground sandbox contract; '
          + 'if it was deleted on purpose, remove it from PARITY_TARGETS in the same change.',
      })
      continue
    }
    const text = readFileSync(abs, 'utf8')

    violations.push(...mustContain(rel, text, PLAYGROUND_ASSETS.map(asset => ({
      rule: 'asset-name',
      value: asset,
      asset: true,
      why: `the contract names ${asset} as a playground asset; a file that references a `
        + 'different name links or writes something the other end does not have',
    }))))

    // The producer writes the bundle; it does not resolve a bare specifier, and
    // it does not load Tailwind. Only the two sandbox-host files do.
    if (rel.endsWith('build-playground.mjs'))
      continue

    // The copy step is the ONE surface that still restates the @vue/repl
    // stylesheet paths, because it is a plain `.mjs` and cannot import the
    // contract module. `apps/docs/.vitepress/theme/playground.ts` imports them,
    // so it cannot drift and is deliberately not a target here.
    //
    // Added after a seeded rename of one of those paths passed every gate in
    // the repository green while the site linked a stylesheet nothing writes
    // (D3-F7) — the `dzup-core.css` 404 again, one directory down.
    if (rel.endsWith('sync-playground-assets.mjs')) {
      violations.push(...mustContain(rel, text, PLAYGROUND_REPL_STYLESHEETS.map(sheet => ({
        rule: 'repl-stylesheet',
        value: sheet,
        asset: true,
        why: `the contract names ${sheet} as the path a sandbox host links; a copy step that `
          + 'writes a different one leaves the editor requesting a file nobody produced, and '
          + 'the editor renders unstyled with no gate able to see it',
      }))))
    }

    if (rel.endsWith('playground.config.ts')) {
      violations.push(...mustContain(rel, text, [
        {
          rule: 'import-specifier',
          value: `'${PLAYGROUND_IMPORT_SPECIFIER}'`,
          why: 'the import map must bind exactly the specifier the contract names, or a '
            + 'playground\'s `import … from \'@dzup-ui/core\'` resolves to nothing',
        },
        {
          rule: 'tailwind-cdn',
          value: TAILWIND_BROWSER_CDN,
          why: 'components carry no stylesheet of their own (ADR-04: tv() + Tailwind over '
            + '--dz-* tokens), so a sandbox without the browser JIT renders them unstyled — '
            + 'which looks like a component defect and is not one',
        },
      ]))
    }
  }

  return violations
}

/* c8 ignore start -- CLI entry point. */
const isMain = process.argv[1] !== undefined && process.argv[1].includes('playground-parity')

if (isMain) {
  const violations = checkPlaygroundParity()
  for (const v of violations)
    console.error(`  ✗ [${v.rule}] ${v.file} ${v.message}`)
  if (violations.length > 0) {
    console.error(
      `\n${violations.length} playground-parity violation(s). The sandbox contract is stated in\n`
      + 'packages/tooling/src/playground/playground-contract.ts; every surface above must agree\n'
      + 'with it. A disagreement ships a sandbox that 404s or renders unstyled, and nothing else\n'
      + 'in the repository can see it.',
    )
    process.exit(1)
  }
  console.warn(
    `  ✓ playground parity — ${PARITY_TARGETS.length} surfaces agree with the contract `
    + `(${PLAYGROUND_ASSETS.length} assets, ${PLAYGROUND_REPL_STYLESHEETS.length} editor `
    + `stylesheets, specifier ${PLAYGROUND_IMPORT_SPECIFIER}, Tailwind JIT pinned)`,
  )
}
/* c8 ignore stop */
