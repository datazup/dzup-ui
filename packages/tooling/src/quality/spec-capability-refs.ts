/**
 * Whether a spec **exercises a capability** for a component — the outcome half of
 * an evidence citation.
 *
 * ## What this adds to `spec-component-refs.ts` (RESIDUAL-16)
 *
 * RESIDUAL-05 replaced `filesMentioning` — a word-boundary substring match over the
 * whole file — with `filesLoading`, which requires the component's module to be
 * **loaded**. Its own docblock said what it deliberately did not do:
 *
 * > It does not prove the spec *asserts* anything about the component — only that
 * > the component is loaded rather than mentioned.
 *
 * RESIDUAL-16 censused all 1,634 citations the capability matrix publishes and
 * measured what that gap costs. Two mechanisms, 44 citations:
 *
 *  - **`portal-hydration` was `ssr-sample` under another name.** Both cells called
 *    the *same* predicate over the *same* directory, so `portal-hydration` had no
 *    term for a teleport and no term for hydration: any component loaded by any
 *    file under `packages/core/tests/ssr/` got it. Of its 19 citations, **3** took
 *    the portal branch; 8 rendered the component **closed** (so the teleport branch
 *    was never reached — the exact defect RESIDUAL-10 fixed in two tests and left
 *    in eight), 8 had no teleport in the test at all, and **0 hydrated anything**.
 *  - **A skipped test is still a load.** `DzAccordion`'s `ssr-sample` cited
 *    `ssr-smoke.spec.ts:293`, which is `it.skip` — *"blocked by Reka UI
 *    AccordionRoot SSR stall"*. The dynamic import inside a test that never runs
 *    satisfied `filesLoading` exactly as well as one that does.
 *
 * ## What a citation requires now
 *
 * Both halves, and the second one is new:
 *
 * 1. **The file loads the component** — unchanged, `componentsLoadedBy`.
 * 2. **A LIVE test block in that file both names the component and exercises the
 *    capability.** A block is live when it is not `it.skip` / `it.todo` /
 *    `it.fails`. "Exercises" is per kind, and is stated in {@link exercisedBy}.
 *
 * ## What RESIDUAL-17 added, and the measurement that forced it
 *
 * RESIDUAL-16 could not require **hydration** of `portal-hydration`, because
 * nothing in the repository hydrated a teleporting component, and it accepted
 * `open: true` in the call as proof the portal branch had been taken. RESIDUAL-17
 * wrote the harness — `packages/core/tests/ssr/portal-hydration.spec.ts` — and in
 * doing so measured that both of those were wrong in the same place:
 *
 *  - **`open: true` is a hypothesis, not evidence.** `DzCommandPalette` rendered
 *    `open: true` produces `<!--[--><!--v-if--><!--]-->` — 27 bytes with **no
 *    teleport** — because Reka UI's `*Portal` primitives render nothing on the
 *    server. Hydration then *replaces* those 27 bytes with a teleport anchor pair.
 *    The branch was never taken server-side and the cell was credited anyway.
 *  - **Four components DO reach a native `<Teleport>` on the server** and hydrate
 *    without rewriting a byte, so requiring hydration is no longer a requirement
 *    nothing can meet: `DzBlockUI`, `DzPopconfirm`, `DzSidebar`, `DzTour`.
 *
 * So the kind now requires all three of the server render, the **anchor pair in
 * the asserted output**, and a hydration.
 *
 * ## Two scanning hazards this module exists to get right
 *
 * Both were measured while auditing, and both produced *wrong verdicts* first:
 *
 *  - **Comments.** A regex stripper read `accept: 'image/*'`
 *    (`ssr-smoke.spec.ts:527`) as an open block comment and blanked 378 lines. So
 *    this reuses RESIDUAL-05's hand-scanned {@link stripComments}, which is
 *    string-aware, with `preserveLines` so a reported line still means something.
 *  - **Regex literals inside the call being matched.** Paren-matching a test block
 *    must skip them: `/data-state="([^"]*)"/g` reads as a quoted string that
 *    swallows the `(` and leaves the `)` to close the call early, and a regex with
 *    an unbalanced paren runs the block on to end-of-file. Measured on
 *    `ssr-smoke.spec.ts`: two runaway blocks (731→852, 813→1206) that handed every
 *    overlay the DzStepper test's assertions.
 *
 * @module @dzup-ui/tooling/quality/spec-capability-refs
 */

import { componentsLoadedBy, stripComments } from './spec-component-refs.ts'

/** The evidence kinds whose citation is a spec file that must *do* something. */
export type ExercisedKind = 'axe' | 'ssr-sample' | 'portal-hydration'

/** One `it(`/`test(` call in a spec, bounded by paren matching. */
export interface TestBlock {
  /** 1-based line of the `it`/`test` token. */
  readonly line: number
  /** `it.skip` / `it.todo` / `it.fails` — present in the file, never run. */
  readonly skipped: boolean
  /** The literal title, where it is a literal. */
  readonly name: string
  /** The whole call, `(` to matching `)`, comments already stripped. */
  readonly text: string
}

/** Where a `/` may legally begin a regex literal — the standard heuristic. */
function regexMayStart(prev: string): boolean {
  return prev === '' || '(,=:[!&|?{};+-*%^~<>\n'.includes(prev)
}

/**
 * Every `it(`/`test(` call in `code`, which must already be comment-stripped.
 *
 * Exported because the both-directions proof in the spec drives it directly: the
 * runaway-block hazard is invisible from `filesExercising`'s boolean result.
 */
export function testBlocksIn(code: string): TestBlock[] {
  const out: TestBlock[] = []
  // `matchAll` rather than an `exec` loop: the assignment-in-condition form is
  // what `no-cond-assign` rejects, and `spec-component-refs.ts` already reads its
  // source this way. Advancing `lastIndex` past a block would be wrong anyway — a
  // nested `it(` is a block of its own and must be scanned too.
  for (const m of code.matchAll(/\b(?:it|test)((?:\.\w+)*)\s*\(/g)) {
    const open = m.index + m[0].length - 1
    let depth = 0
    let i = open
    let prev = ''
    for (; i < code.length; i++) {
      const c = code[i]!
      if (c === '(') {
        depth++
        prev = c
        continue
      }
      if (c === ')') {
        depth--
        if (depth === 0)
          break
        prev = c
        continue
      }
      if (c === '\'' || c === '"' || c === '`') {
        i = skipQuoted(code, i)
        prev = c
        continue
      }
      if (c === '/' && regexMayStart(prev)) {
        i = skipRegex(code, i)
        prev = '/'
        continue
      }
      if (c.trim() !== '')
        prev = c
    }
    const text = code.slice(open, i + 1)
    const titled = /^\(\s*(['"`])([^'"`]*)\1/.exec(text)
    out.push({
      line: code.slice(0, m.index).split('\n').length,
      skipped: /\.(?:skip|todo|fails)\b/.test(m[1] ?? ''),
      name: titled?.[2] ?? '',
      text,
    })
  }
  return out
}

/** Index of the closing quote of the string starting at `from`. */
function skipQuoted(code: string, from: number): number {
  const quote = code[from]!
  let i = from + 1
  while (i < code.length) {
    if (code[i] === '\\') {
      i += 2
      continue
    }
    if (code[i] === quote)
      return i
    i++
  }
  return i
}

/** Index of the closing `/` of the regex literal starting at `from`. */
function skipRegex(code: string, from: number): number {
  let i = from + 1
  let inClass = false
  while (i < code.length) {
    const r = code[i]!
    if (r === '\\') {
      i += 2
      continue
    }
    if (r === '[')
      inClass = true
    else if (r === ']')
      inClass = false
    else if ((r === '/' && !inClass) || r === '\n')
      return i
    i++
  }
  return i
}

/**
 * File-level helper functions whose body reaches `token`.
 *
 * Every SSR spec in this repository renders through one (`ssrRender`, `ssr`,
 * `ssrRenderWithoutBrowser`, `hydrateAndCollectWarnings`), so a predicate that
 * looked for a literal `renderToString(` inside the test block would reject all
 * 119 genuine `ssr-sample` citations. The parameter list is skipped by paren
 * matching before the body brace is found, because a default value such as
 * `props: Record<string, unknown> = {}` puts a `{` before the body.
 */
export function helpersReaching(code: string, token: RegExp): string[] {
  const names: string[] = []
  for (const m of code.matchAll(/(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g)) {
    let j = m.index + m[0].length - 1
    let parens = 0
    for (; j < code.length; j++) {
      if (code[j] === '(') {
        parens++
      }
      else if (code[j] === ')') {
        parens--
        if (parens === 0)
          break
      }
    }
    const brace = code.indexOf('{', j)
    if (brace === -1)
      continue
    let depth = 0
    let i = brace
    for (; i < code.length; i++) {
      if (code[i] === '{') {
        depth++
      }
      else if (code[i] === '}') {
        depth--
        if (depth === 0)
          break
      }
    }
    if (token.test(code.slice(brace, i)))
      names.push(m[1]!)
  }
  return names
}

/** An axe run: the assertion or the call, either spelling. */
const AXE_RUN = /\baxe\s*\(|toHaveNoViolations/
/** A server render. Helpers that reach it are resolved per file. */
const SSR_RENDER = /renderToString\s*\(/
/**
 * Vue's teleport anchor pair in server output — the proof the branch was taken.
 *
 * `<!--teleport start-->` / `<!--teleport end-->` is what `renderToString` emits
 * for a `<Teleport>` with no DOM to resolve, so a test that asserts it has
 * demonstrably reached the portal. It is matched on the text rather than the
 * comment markers because the assertion is written as a string literal.
 */
const TELEPORT_ANCHOR = /teleport start|teleport end/
/**
 * A client mount over server markup — the hydration half, added by RESIDUAL-17.
 *
 * `.mount(` rather than a bare `mount(`: the bare form is Vue Test Utils, which
 * renders from scratch and hydrates nothing. Paired with the SSR term in the same
 * block, `app.mount(container)` over a container filled from `renderToString` is
 * hydration, and that pairing is what the kind's name claims. Helpers that reach
 * it are resolved per file by {@link helpersReaching}, exactly as the SSR term is,
 * because every SSR spec here renders through one.
 */
const HYDRATE_MOUNT = /\.mount\s*\(/

/** The per-file call shapes a block is judged against. */
export interface CapabilityCalls {
  /** Reaches `renderToString` — directly or through a file-level helper. */
  readonly ssr: RegExp
  /** Reaches `.mount(` — directly or through a file-level helper. */
  readonly hydrate: RegExp
}

/**
 * Does this live test block exercise `kind` for `component`?
 *
 * The component must be **named in the block** — its identifier, its `.vue`
 * specifier or its string argument to a dynamic loader all produce the same
 * word-boundary hit, and the block text has already had comments removed, so a
 * sentence about the component cannot satisfy it.
 */
export function exercisedBy(
  block: TestBlock,
  component: string,
  kind: ExercisedKind,
  calls: CapabilityCalls,
): boolean {
  if (block.skipped)
    return false
  if (!new RegExp(`\\b${component}\\b`).test(block.text))
    return false
  switch (kind) {
    case 'axe':
      return AXE_RUN.test(block.text)
    case 'ssr-sample':
      return calls.ssr.test(block.text)
    case 'portal-hydration':
      // All THREE halves of what the kind's name claims, since RESIDUAL-17:
      // the server render, the portal branch demonstrably taken, and the
      // hydration.
      //
      // RESIDUAL-16 required only the first two and accepted `open: true` as
      // proof of the second, because no citation in the repository hydrated
      // anything. RESIDUAL-17 wrote the harness
      // (`packages/core/tests/ssr/portal-hydration.spec.ts`) and MEASURED that
      // `open: true` is not proof at all: `DzCommandPalette` rendered with
      // `open: true` emits `<!--[--><!--v-if--><!--]-->` — 27 bytes, no
      // teleport — because Reka UI's `*Portal` primitives do not render on the
      // server, and hydration then REPLACES those 27 bytes with an anchor pair.
      // So the only admissible proof that the branch was taken is the anchor
      // pair in the asserted output; a prop value in the call is a hypothesis.
      return calls.ssr.test(block.text)
        && TELEPORT_ANCHOR.test(block.text)
        && calls.hydrate.test(block.text)
  }
}

/** The call shapes that reach a server render and a hydration in this file. */
export function capabilityCallsIn(code: string): CapabilityCalls {
  const ssrNames = ['renderToString', ...helpersReaching(code, SSR_RENDER)]
  const hydrateNames = helpersReaching(code, HYDRATE_MOUNT)
  return {
    ssr: new RegExp(`\\b(?:${ssrNames.join('|')})\\s*\\(`),
    // The direct form is always admissible; helpers are added per file. Written
    // as an alternation rather than a name list because `.mount(` has no
    // identifier to bound with `\b`.
    hydrate: new RegExp([
      '\\.mount\\s*\\(',
      ...hydrateNames.map(n => `\\b${n}\\s*\\(`),
    ].join('|')),
  }
}

/**
 * The paths of the files that **exercise `kind`** for `component`.
 *
 * Same signature as `filesLoading`, which it wraps rather than replaces: loading
 * is still required, and is still the thing a comment cannot do. This adds the
 * second requirement — that a test which actually runs does the thing the cell
 * claims.
 */
export function filesExercising(
  files: readonly { path: string, source: string }[],
  component: string,
  kind: ExercisedKind,
  rel: (path: string) => string,
): string[] {
  const out: string[] = []
  for (const file of files) {
    if (!componentsLoadedBy(file.source).has(component))
      continue
    const code = stripComments(file.source, { preserveLines: true })
    const calls = capabilityCallsIn(code)
    if (testBlocksIn(code).some(block => exercisedBy(block, component, kind, calls)))
      out.push(rel(file.path))
  }
  return out
}
