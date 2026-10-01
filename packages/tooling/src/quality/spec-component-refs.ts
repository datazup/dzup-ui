/**
 * Which components a spec file actually **loads** — the structural half of an
 * evidence citation.
 *
 * ## The defect this exists to close (`D-RES02-2`)
 *
 * `generate-capability-matrix.ts` attributed the `axe`, `ssr-sample` and
 * `portal-hydration` evidence cells with a helper called `filesMentioning`: a
 * word-boundary **substring match over the whole file text**. So any file that
 * contained the characters `DzFoo` anywhere — in a header comment, in a
 * cross-reference to another spec, in a sentence explaining why `DzFoo` is
 * deliberately *not* tested here — granted `DzFoo` a citation in the published
 * capability matrix, and nothing could tell the difference afterwards.
 *
 * RESIDUAL-02 found this **by accident**: an explanatory comment it had written
 * named a component, and that component's SSR evidence list silently acquired a
 * file that does not test it. The totals did not move, so no gate fired. The
 * comment was reworded to make the artifacts byte-identical again, and the rule
 * was filed instead of fixed.
 *
 * ## What a citation requires now
 *
 * The component must be **loaded** by the file, which a comment cannot do:
 *
 * 1. **Its module is imported** — a static or dynamic import whose specifier's
 *    basename is the component (`…/DzButton.vue`). This is how all eleven
 *    `tests/a11y/*.a11y.spec.ts` files and three of the six `tests/ssr/*.spec.ts`
 *    files reference their subjects.
 * 2. **It is an import binding** — a named or default import from a components
 *    barrel (`import { DzButton } from '…/components/buttons'`).
 * 3. **It is named to a dynamic loader** — `form-controls-ssr.spec.ts` and
 *    `form-layouts-ssr.spec.ts` import through a template literal
 *    (`import(\`…/${family}/${name}.vue\`)`), so the component name arrives as a
 *    string-literal argument. Those are real loads and must keep their citations,
 *    so a file that contains a **template-literal dynamic import** also admits
 *    bare `'DzFoo'` string literals. This is the loosest of the three rules and it
 *    is gated on the file actually having such a loader.
 *
 * All three run against a **comment-stripped** source. That is what makes the rule
 * structural rather than textual: prose cannot produce an import, and prose that
 * quotes one is not read.
 *
 * ## What this deliberately does not do
 *
 * It does not prove the spec *asserts* anything about the component — only that the
 * component is loaded rather than mentioned. Proving assertion needs the test
 * outcome per component, which is the `gate` shape the matrix uses elsewhere and a
 * larger change than closing the citation hole. An import is the floor, not the
 * ceiling, and it is a floor a comment cannot reach.
 *
 * @module @dzup-ui/tooling/quality/spec-component-refs
 */

/** `DzFoo` — a component identifier, and nothing else. */
const COMPONENT_NAME = /^Dz[A-Za-z0-9]+$/

/**
 * Remove line and block comments, leaving string, template and regex contents
 * untouched.
 *
 * Hand-scanned rather than regexed, because every regex that "strips comments"
 * eventually eats a `//` inside a URL or a `/*` inside a string. The states are
 * the five JavaScript lexical contexts a `/` can appear in; a regex literal is
 * recognised by what precedes it, which is the standard heuristic and is exact for
 * the spec files this reads.
 */
export function stripComments(source: string, options: { preserveLines?: boolean } = {}): string {
  let out = ''
  let i = 0
  /** The last significant character emitted — what decides `/` is a regex. */
  let prev = ''

  const regexMayStart = (): boolean =>
    prev === '' || '(,=:[!&|?{};+-*%^~<>\n'.includes(prev)

  while (i < source.length) {
    const c = source[i]!
    const next = source[i + 1]

    // Comments.
    if (c === '/' && next === '/') {
      while (i < source.length && source[i] !== '\n')
        i++
      continue
    }
    if (c === '/' && next === '*') {
      const from = i
      i += 2
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/'))
        i++
      i += 2
      // A block comment can span lines. `preserveLines` is what actually keeps the
      // line count stable — RESIDUAL-14 measured that this branch emitted a single
      // space and therefore did NOT, and its caller reports line numbers against
      // the stripped text, so a docblock above a handler would have shifted every
      // citation below it. The default stays a single space, because
      // `componentsLoadedBy` reads the stripped text as one string and three
      // published artifacts are derived from it.
      out += options.preserveLines === true
        ? source.slice(from, i).replaceAll(/[^\n]/g, ' ')
        : ' '
      continue
    }

    // Quoted forms: copied through verbatim, escapes respected.
    if (c === '\'' || c === '"' || c === '`') {
      const quote = c
      out += c
      i++
      while (i < source.length) {
        const q = source[i]!
        out += q
        i++
        if (q === '\\') {
          if (i < source.length) {
            out += source[i]
            i++
          }
          continue
        }
        if (q === quote)
          break
      }
      prev = quote
      continue
    }

    // A regex literal, only where one can legally begin.
    if (c === '/' && regexMayStart()) {
      out += c
      i++
      let inClass = false
      while (i < source.length) {
        const r = source[i]!
        out += r
        i++
        if (r === '\\') {
          if (i < source.length) {
            out += source[i]
            i++
          }
          continue
        }
        if (r === '[')
          inClass = true
        else if (r === ']')
          inClass = false
        else if (r === '/' && !inClass)
          break
        else if (r === '\n')
          break
      }
      prev = '/'
      continue
    }

    out += c
    i++
    if (c.trim() !== '')
      prev = c
  }

  return out
}

/** The basename of a module specifier, without its extension. */
function specifierBase(specifier: string): string {
  const last = specifier.split('/').pop() ?? ''
  return last.replace(/\.(vue|ts|tsx|js|mjs)$/, '')
}

/**
 * Every component the source **loads**, by the three rules in the module header.
 *
 * @param source The spec file's text, comments included — they are stripped here.
 */
export function componentsLoadedBy(source: string): ReadonlySet<string> {
  const code = stripComments(source)
  const loaded = new Set<string>()

  // Rule 1 — a module specifier naming the component's own file.
  //
  // `[\s(]*` rather than `\s*\(?\s*`: two optional whitespace runs around an
  // optional paren is quadratic-backtracking bait, and one character class that
  // admits both spaces and the paren says the same thing in linear time.
  for (const match of code.matchAll(/(?:from|import|require)[\s(]*(['"])([^'"]+)\1/g)) {
    const base = specifierBase(match[2]!)
    if (COMPONENT_NAME.test(base))
      loaded.add(base)
  }

  // Rule 2 — an import binding from a components module.
  //
  // The clause between `import` and `from` excludes quotes, which is what keeps a
  // bare side-effect import (`import './register-matchers.ts'`) from letting the
  // lazy match run on to a *later* statement's `from`: that specifier's own quotes
  // are a wall the class cannot cross.
  // `+?` and not `*?`: an empty clause would make `import` and `from` adjacent, and
  // `importfrom` has no word boundary between them — a minimum of 0 that can never
  // be taken is a contradiction, not a convenience.
  for (const match of code.matchAll(/import\b([^'"]+?)\bfrom\b[^'"]*(['"])([^'"]+)\2/g)) {
    if (!match[3]!.includes('/components/') && !match[3]!.includes('/providers/'))
      continue
    for (const ident of match[1]!.matchAll(/[a-z_$][\w$]*/gi)) {
      if (COMPONENT_NAME.test(ident[0]))
        loaded.add(ident[0])
    }
  }

  // Rule 3 — a template-literal dynamic import means names arrive as arguments.
  if (/import\s*\(\s*`[^`]*\$\{/.test(code)) {
    for (const match of code.matchAll(/(['"])(Dz[A-Za-z0-9]+)\1/g))
      loaded.add(match[2]!)
  }

  return loaded
}

/**
 * The paths of the files that load `component`.
 *
 * The replacement for `filesMentioning`. Same signature, so the call sites in
 * `generate-capability-matrix.ts` read the same — only the meaning of a hit
 * changed, from "the characters appear somewhere" to "the module is loaded".
 */
export function filesLoading(
  files: readonly { path: string, source: string }[],
  component: string,
  rel: (path: string) => string,
): string[] {
  return files
    .filter(f => componentsLoadedBy(f.source).has(component))
    .map(f => rel(f.path))
}
