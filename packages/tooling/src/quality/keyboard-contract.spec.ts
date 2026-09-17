import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseAnatomySource } from '../ownership/anatomy-source.ts'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'

/**
 * The keyboard contract, asserted over the whole catalogue (TASK-R5-O5).
 *
 * `<keyboard_contract>`: *"the contract specs assert against it (replace the
 * regex boolean); the AT scripts cite it; the docs render it."* This is the
 * assertion, and it is deliberately **one catalogue-wide spec rather than a
 * clause copied into 102 contract specs**: a rule that has to be pasted into
 * every component's spec is a rule that is absent from the next component
 * somebody writes, which is exactly how 144 pages ended up saying "Not yet
 * derived".
 *
 * Per-component DOM conformance — that something in the tree can receive a key
 * at all, that a `when` names a real part — is `expectKeyboardContract` from
 * `@dzup-ui/testing`, called from the family anatomy specs where the components
 * are already mounted. This file is the half that needs no DOM and therefore
 * cannot be skipped for a component nobody mounted.
 */

/**
 * Both directories that hold a `*.anatomy.ts`.
 *
 * `providers/` is not an afterthought: `DzProvider` and `DzThemeProvider` live
 * outside `components/{family}/` (CLAUDE.md's layout note), and a walk that
 * scanned only `components/` missed their declarations entirely — which is how
 * two public components reached the docs ratchet as "no keyboard contract"
 * while their anatomy files sat one directory away.
 */
const ANATOMY_ROOTS = [
  join(ROOT, 'packages/core/src/components'),
  join(ROOT, 'packages/core/src/providers'),
]

function anatomyFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    if (statSync(path).isDirectory())
      return anatomyFiles(path)
    return path.endsWith('.anatomy.ts') ? [path] : []
  })
}

const DECLARATIONS = ANATOMY_ROOTS.flatMap(anatomyFiles)
  .map(file => ({
    file: file.replace(ROOT, '').replaceAll('\\', '/').replace(/^\//, ''),
    name: file.replaceAll('\\', '/').split('/').pop()!.replace('.anatomy.ts', ''),
    read: parseAnatomySource(readFileSync(file, 'utf8'), file),
  }))
  .sort((a, b) => a.name.localeCompare(b.name, 'en'))

/** Every declaration that carries actual bindings (not `'none'`, not absent). */
const WITH_BINDINGS = DECLARATIONS.flatMap(({ name, file, read }) => {
  const k = read.anatomy?.keyboard
  return k === undefined || k === 'none' ? [] : [{ name, file, bindings: k, anatomy: read.anatomy! }]
})

/** `KeyboardEvent.key` spellings, plus this contract's two placeholder classes. */
const KEY_PATTERN = /^(?:[a-z0-9 ]|[A-Z][A-Za-z]+|<character>|<digit>)$/

/**
 * Legacy key spellings no current browser reports.
 *
 * A closed allowlist of key names is wrong — `KeyboardEvent.key` is an open set
 * (every printable character is a valid value) — so the pattern above can only
 * check *shape*, and `Spacebar` has exactly the shape of a real named key. It
 * is also the single most likely wrong answer: the DOM Level 2 spelling is
 * still in one of this repository's own components (`DzOrderList.vue` tests for
 * it alongside `' '`). A published table saying `Spacebar` describes a key that
 * will never arrive, so the legacy names are named.
 */
const LEGACY_KEY_SPELLINGS = new Set([
  'Spacebar',
  'Space',
  'Esc',
  'Left',
  'Right',
  'Up',
  'Down',
  'Del',
  'Scroll',
  'Win',
])

describe('keyboard contract — the whole catalogue', () => {
  it('parses every declaration without a problem', () => {
    const broken = DECLARATIONS.filter(d => d.read.problems.length > 0)
    expect(broken.map(d => `${d.file}: ${d.read.problems.join(' ')}`)).toEqual([])
  })

  it('every anatomy declares a keyboard contract — `none` counts, absent does not', () => {
    // The ratchet in packages/tooling/src/docs/page-contract-ceilings.json counts
    // the components with NO anatomy at all. A component that has an anatomy and
    // still has not said what its keys do is a different, smaller gap, and this
    // spec is what keeps it at zero.
    const silent = DECLARATIONS.filter(d => d.read.anatomy?.keyboard === undefined)
    expect(silent.map(d => d.file)).toEqual([])
  })

  it('every key is spelled the way KeyboardEvent spells it', () => {
    const wrong: string[] = []
    for (const { name, bindings } of WITH_BINDINGS) {
      for (const b of bindings) {
        if (!KEY_PATTERN.test(b.key))
          wrong.push(`${name}: \`${b.key}\` is not a KeyboardEvent.key spelling`)
        else if (LEGACY_KEY_SPELLINGS.has(b.key))
          wrong.push(`${name}: \`${b.key}\` is the legacy DOM Level 2 spelling; use \`' '\` for the space bar and the Arrow*/Escape/Delete names for the rest`)
      }
    }
    expect(wrong).toEqual([])
  })

  it('every action is a sentence, not a fragment', () => {
    const bad: string[] = []
    for (const { name, bindings } of WITH_BINDINGS) {
      for (const b of bindings) {
        if (!/^[A-Z]/.test(b.action) || !b.action.trim().endsWith('.'))
          bad.push(`${name} \`${b.key}\`: "${b.action}"`)
      }
    }
    expect(bad).toEqual([])
  })

  it('no binding is declared twice with the same modifiers and context', () => {
    const dupes: string[] = []
    for (const { name, bindings } of WITH_BINDINGS) {
      const seen = new Set<string>()
      for (const b of bindings) {
        const id = `${[...(b.modifiers ?? [])].sort().join('+')}|${b.key}|${b.when ?? ''}`
        if (seen.has(id))
          dupes.push(`${name}: ${id}`)
        seen.add(id)
      }
    }
    expect(dupes).toEqual([])
  })

  it('no `rtl: mirrored` row contradicts its own anatomy\'s rtl contract', () => {
    // Also enforced by the parser, which refuses the file outright. Asserted
    // again here because the parser's refusal is only reachable if somebody
    // regenerates, and a spec runs on every `yarn test`.
    const clashes: string[] = []
    for (const { name, bindings, anatomy } of WITH_BINDINGS) {
      if (anatomy.rtl?.keyboard !== 'none')
        continue
      for (const b of bindings) {
        if (b.rtl === 'mirrored')
          clashes.push(`${name}: \`${b.key}\``)
      }
    }
    expect(clashes).toEqual([])
  })

  it('every `wcag` id is a well-formed success-criterion number', () => {
    const bad: string[] = []
    for (const { name, bindings } of WITH_BINDINGS) {
      for (const b of bindings) {
        for (const id of b.wcag ?? []) {
          if (!/^\d\.\d\.\d{1,2}$/.test(id))
            bad.push(`${name} \`${b.key}\`: ${id}`)
        }
      }
    }
    expect(bad).toEqual([])
  })

  it('a component that declares any binding declares at least one WCAG mechanism', () => {
    // Every key that operates a control is a 2.1.1 mechanism. A table with no
    // criterion anywhere on it is a table nobody joined to the WCAG scope list.
    const unlinked = WITH_BINDINGS
      .filter(c => !c.bindings.some(b => (b.wcag ?? []).length > 0))
      .map(c => c.name)
    expect(unlinked).toEqual([])
  })

  it('the catalogue-wide totals are what the documentation ratchet was set from', () => {
    // A guard on the handoff's own numbers: if these move, the ceilings in
    // page-contract-ceilings.json are stale and validate:docs-pages will say so.
    const explicitNone = DECLARATIONS.filter(d => d.read.anatomy?.keyboard === 'none').length
    expect(DECLARATIONS.length).toBe(104)
    expect(explicitNone).toBe(19)
    expect(WITH_BINDINGS.length).toBe(85)
  })
})
