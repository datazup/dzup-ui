/**
 * Composition conformance (TASK-R5-O6, ADR-19 §5 · finding R-021).
 *
 * The fourth member of the same family as `expectAnatomy`, `expectRtl` and
 * `expectKeyboardContract`, and written to the same rule: a declaration is only
 * a contract if something re-reads it against the thing it describes.
 *
 * Three claims live here, and they need different kinds of evidence, so the
 * split that `./rtl.ts` introduced applies again:
 *
 *   - **Source-level** — the `cn()` argument order. Which class source a
 *     component passes last *is* the merge order; there is nothing to render to
 *     find it out, and reading it from source is what lets one assertion cover
 *     every component in the catalogue rather than the ones somebody wrote a
 *     mount for.
 *   - **Rendered** — where `$attrs` landed, and whether a consumer's listener
 *     fired once. Both are facts about a DOM tree and neither is visible in
 *     source, because Vue's fallthrough is a runtime rule.
 *   - **Behavioural over time** — the controlled/uncontrolled claim, which
 *     needs a *sequence*: render, let the user edit, write from outside, look
 *     again. A single snapshot cannot express it, which is the reason defect D8
 *     survived in seven public controls for months.
 *
 * @module @dzup-ui/testing/composition
 */

/**
 * Anything with an `element`, i.e. a Vue Test Utils wrapper, or an element.
 *
 * Exported for callers that hold a wrapper; the checks below take a
 * **container** rather than a root on purpose — a multi-root component has no
 * single root, and that is precisely the shape the fallthrough declaration
 * exists to describe.
 */
export type CompositionTarget = Element | { element: Element }

/** Resolve a wrapper-or-element to the element, for callers that hold either. */
export function elementOf(target: CompositionTarget): Element {
  return 'element' in target && (target as { element: Element }).element !== undefined
    ? (target as { element: Element }).element
    : target as Element
}

// ---------------------------------------------------------------------------
// 1. `ui` merge order — source level
// ---------------------------------------------------------------------------

/**
 * The part of a `ComponentFallthrough` this module reads.
 *
 * Structural rather than imported from `@dzup-ui/contracts`, for the reason
 * `CheckableAnatomy` and `CheckableRtl` are: this package emits declarations,
 * so `rootDir: src` forbids pulling another package's source into its program.
 */
export interface CheckableFallthrough {
  readonly target: string | 'none'
  readonly reason?: string
  readonly delegatesTo?: string
}

/**
 * Which idiom a merge site is written in.
 *
 * Both are real and both ship. Checking only the first is a hole this module
 * had until `DzKnob` was opened for an unrelated reason and found merging
 * `[rootClasses, ui?.root]` — a site the `cn()` scan could not see, because the
 * consumer's `class` is inside `rootClasses` and the `ui` value never enters a
 * `cn()` call at all. Eighteen components merge that way.
 */
export type MergeForm
  /** `cn(recipe, props.ui?.part, attrs.class)` — one call, arguments in order. */
  = | 'cn'
  /**
   * `:class="[rootClasses, ui?.root]"` — an array binding in the template whose
   * first element is a computed that already folded the consumer's `class` in.
   * Vue concatenates left to right, so the array position is the merge order
   * just as an argument position is.
   */
    | 'array'

/** One site that merges both a `ui` part and the consumer's `class`. */
export interface MergeSite {
  /** 1-based line of the site in the source. */
  readonly line: number
  /** The `ui` part names referenced at this site, in source order. */
  readonly parts: readonly string[]
  /**
   * `'ui-then-class'` is the ratified order (`UI_MERGE_ORDER`): the consumer's
   * `class` is merged last and therefore wins a tailwind-merge conflict.
   */
  readonly order: 'ui-then-class' | 'class-then-ui'
  /** Which idiom the site is written in. */
  readonly form: MergeForm
  /** The site, whitespace-collapsed, for a failure message that can be acted on. */
  readonly snippet: string
}

/**
 * Local `const` names whose definition folds in the consumer's `class`.
 *
 * `const rootClasses = computed(() => cn(styles.value.root(), attrs.class))`
 * makes `rootClasses` a carrier of the consumer's class, so a template that
 * writes `[rootClasses, ui?.root]` is merging `class` before `ui` even though
 * neither token appears beside the other.
 */
export function classCarryingIdentifiers(source: string): Set<string> {
  const carriers = new Set<string>()
  for (const match of source.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*=/g)) {
    const name = match[1]!
    const start = match.index! + match[0].length
    // The definition runs to the next top-level `const`/`function`, or the end
    // of the script block — far cheaper than a parser and sufficient, because a
    // class computed is never more than a few lines.
    const rest = source.slice(start, start + 600)
    const end = rest.search(/\n(?:const|let|function|<\/script>)/)
    const body = end < 0 ? rest : rest.slice(0, end)
    if (/\battrs\.class\b|\$attrs\.class\b/.test(body))
      carriers.add(name)
  }
  return carriers
}

/**
 * Every `cn()` call in a component source that merges a `ui` part **and** the
 * consumer's `class`.
 *
 * Calls that merge only one of the two are not sites: a component is free to
 * apply `ui.spinner` on its own to a node the consumer's `class` never reaches,
 * and a component with no `ui` prop merging `attrs.class` has no order to get
 * wrong. Only a call holding both has a precedence question to answer.
 *
 * Brace- and quote-aware rather than line-based, because most of these calls
 * are multi-line and a nested `cn()` or a template literal containing a bracket
 * would defeat a regex.
 */
export function mergeSitesIn(source: string): MergeSite[] {
  const sites: MergeSite[] = []
  let i = 0

  for (;;) {
    i = source.indexOf('cn(', i)
    if (i < 0)
      break

    const prev = source[i - 1]
    if (prev !== undefined && /[\w$.]/.test(prev)) {
      i += 3
      continue
    }

    let depth = 0
    let j = i + 2
    let quote: string | null = null
    for (; j < source.length; j++) {
      const c = source[j]
      if (quote !== null) {
        if (c === quote && source[j - 1] !== '\\')
          quote = null
        continue
      }
      if (c === '"' || c === '\'' || c === '`') {
        quote = c
        continue
      }
      if (c === '(') {
        depth++
      }
      else if (c === ')') {
        depth--
        if (depth === 0)
          break
      }
    }

    const text = source.slice(i, j + 1)
    const classIndex = text.search(/\battrs\.class\b|\$attrs\.class\b/)
    const uiIndex = text.search(/\bprops\.ui\?\.|\bui\?\.(?!\.)/)

    if (classIndex >= 0 && uiIndex >= 0) {
      sites.push({
        line: source.slice(0, i).split('\n').length,
        parts: [...new Set(
          [...text.matchAll(/\bprops\.ui\?\.(\w+)|\bui\?\.(\w+)/g)].map(m => m[1] ?? m[2]) as string[],
        )],
        order: uiIndex < classIndex ? 'ui-then-class' : 'class-then-ui',
        form: 'cn',
        snippet: text.replace(/\s+/g, ' ').slice(0, 200),
      })
    }

    i = j + 1
  }

  return [...sites, ...arrayMergeSitesIn(source)]
}

/**
 * Merge sites written as a template array binding,
 * `:class="[rootClasses, ui?.root]"`.
 *
 * Vue's `normalizeClass` concatenates an array left to right, and `cn()` — the
 * tailwind-merge wrapper — is applied *inside* the computed, not across the
 * array. So the element that comes second is the one that wins a conflict, for
 * exactly the same reason the last `cn()` argument does.
 *
 * An element only counts as carrying the consumer's `class` if it names
 * `attrs.class` directly or is an identifier in
 * {@link classCarryingIdentifiers}. `[styles.root(), ui?.root]` is therefore
 * not a site: recipe-then-`ui` is agreed by both candidate orders, so there is
 * no precedence question to answer and flagging it would be noise.
 */
export function arrayMergeSitesIn(source: string): MergeSite[] {
  const carriers = classCarryingIdentifiers(source)
  const sites: MergeSite[] = []

  for (const match of source.matchAll(/:class="\[/g)) {
    const open = match.index! + match[0].length - 1
    let depth = 0
    let end = open
    for (; end < source.length; end++) {
      const c = source[end]
      if (c === '[') {
        depth++
      }
      else if (c === ']') {
        depth--
        if (depth === 0)
          break
      }
      else if (c === '"') {
        break
      }
    }
    if (depth !== 0)
      continue

    const inner = source.slice(open + 1, end)

    // Split on top-level commas only — an element may itself be a call or an
    // object literal with commas inside it.
    const elements: string[] = []
    let current = ''
    let nesting = 0
    for (const c of inner) {
      if (c === '(' || c === '[' || c === '{')
        nesting++
      if (c === ')' || c === ']' || c === '}')
        nesting--
      if (c === ',' && nesting === 0) {
        elements.push(current)
        current = ''
        continue
      }
      current += c
    }
    elements.push(current)

    let uiAt = -1
    let classAt = -1
    const parts: string[] = []

    elements.forEach((raw, index) => {
      const element = raw.trim()
      const ui = /(?:props\.)?ui\?\.\[?'?([\w-]+)'?\]?/.exec(element)
      if (ui !== null) {
        if (uiAt < 0)
          uiAt = index
        parts.push(ui[1]!)
        return
      }
      const isDirect = /\battrs\.class\b|\$attrs\.class\b/.test(element)
      const identifier = /^[A-Z_$][\w$]*/i.exec(element)?.[0]
      const isCarrier = identifier !== undefined && carriers.has(identifier)
      if ((isDirect || isCarrier) && classAt < 0)
        classAt = index
    })

    if (uiAt >= 0 && classAt >= 0) {
      sites.push({
        line: source.slice(0, open).split('\n').length,
        parts: [...new Set(parts)],
        order: uiAt < classAt ? 'ui-then-class' : 'class-then-ui',
        form: 'array',
        snippet: `:class="[${inner.replace(/\s+/g, ' ').trim()}]"`.slice(0, 200),
      })
    }
  }

  return sites
}

/**
 * Merge sites that break {@link module:@dzup-ui/contracts/composition
 * UI_MERGE_ORDER}, as human-readable problems.
 *
 * Empty means conformant. A component with no merge site returns empty too —
 * absence of the pattern is not a violation of it.
 */
export function checkUiMergeOrder(source: string, component: string): string[] {
  return mergeSitesIn(source)
    .filter(site => site.order === 'class-then-ui')
    .map(site =>
      `${component}:${site.line} (${site.form} form) merges the consumer's \`class\` BEFORE `
      + `\`ui.${site.parts.join('/')}\`, so \`ui\` wins a tailwind-merge conflict and the consumer `
      + `cannot override it without \`!important\`. UI_MERGE_ORDER is recipe -> ui -> class. `
      + `Site: ${site.snippet}`,
    )
}

/** Throwing form of {@link checkUiMergeOrder}. */
export function expectUiMergeOrder(source: string, component: string): void {
  const problems = checkUiMergeOrder(source, component)
  if (problems.length > 0)
    throw new Error(`Merge-order contract (ADR-19 §5, TASK-R5-O6):\n  ${problems.join('\n  ')}`)
}

// ---------------------------------------------------------------------------
// 2. Attribute fallthrough — rendered
// ---------------------------------------------------------------------------

/** What {@link checkFallthrough} needs to know about the probe that was set. */
export interface FallthroughProbe {
  /** A class the test passed as `class` on the component tag. */
  readonly className: string
  /** An `id` the test passed on the component tag. */
  readonly id?: string
  /**
   * How to locate the declared target when the component emits no `data-part`
   * for it.
   *
   * Needed only by components with no anatomy file — the compound sub-parts
   * whose parent owns the declaration. Their fallthrough target is still a
   * public fact, and stamping a `data-part` on a non-declaring component to
   * make it checkable would add an undeclared emission for
   * `validate:anatomy-parts` to report. So the spec says where the target is
   * instead, and the declaration stays honest about the component having no
   * parts of its own.
   */
  readonly targetSelector?: string
}

/**
 * Whether a consumer's `class` and `id` reached the node the component
 * **declared** they would reach.
 *
 * Takes the whole rendered container rather than a root element, because the
 * shapes this exists for do not have one: a multi-root component renders a
 * fragment, and asking for "the root" of a fragment is the question the
 * declaration exists to answer.
 *
 * A `target` of `'none'` asserts the opposite claim — that the component binds
 * `$attrs` nowhere — and is checked just as strictly, because "renderless" is a
 * promise a consumer plans around.
 */
export function checkFallthrough(
  container: Element,
  fallthrough: CheckableFallthrough,
  probe: FallthroughProbe,
): string[] {
  const problems: string[] = []
  const carriers = [...container.querySelectorAll(`.${CSS.escape(probe.className)}`)]

  if (fallthrough.target === 'none') {
    if (carriers.length > 0) {
      problems.push(
        `declares \`fallthrough.target: 'none'\` but the consumer's class landed on `
        + `${carriers.length} element(s) — the first is <${carriers[0]!.tagName.toLowerCase()}>. `
        + `A renderless component must bind \`$attrs\` nowhere.`,
      )
    }
    return problems
  }

  if (carriers.length === 0) {
    problems.push(
      `declares \`fallthrough.target: '${fallthrough.target}'\` but the consumer's `
      + `\`class\` reached no element at all. Either the component drops \`$attrs.class\`, `
      + `or it binds \`$attrs\` to a node it never renders.`,
    )
    return problems
  }

  if (carriers.length > 1) {
    problems.push(
      `the consumer's \`class\` landed on ${carriers.length} elements `
      + `(${carriers.map(c => `<${c.tagName.toLowerCase()}>`).join(', ')}). `
      + `A component has exactly one fallthrough target; duplicating \`$attrs\` `
      + `duplicates their \`id\` too, which is invalid HTML.`,
    )
  }

  const carrier = carriers[0]!
  const actualPart = carrier.getAttribute('data-part')

  if (probe.targetSelector !== undefined) {
    if (!carrier.matches(probe.targetSelector)) {
      problems.push(
        `declares \`fallthrough.target: '${fallthrough.target}'\`, located by `
        + `\`${probe.targetSelector}\`, but the consumer's \`class\` landed on `
        + `<${carrier.tagName.toLowerCase()}>, which does not match it.`,
      )
    }
  }
  else if (actualPart !== fallthrough.target) {
    problems.push(
      `declares \`fallthrough.target: '${fallthrough.target}'\` but the consumer's `
      + `\`class\` landed on <${carrier.tagName.toLowerCase()}> with `
      + `${actualPart === null ? 'no `data-part`' : `\`data-part="${actualPart}"\``}. `
      + `The declaration names the node a consumer's \`class\`, \`id\` and \`data-*\` reach; `
      + `if it is wrong, every override written against it lands somewhere else.`,
    )
  }

  if (probe.id !== undefined) {
    const idCarrier = container.querySelector(`#${CSS.escape(probe.id)}`)
    if (idCarrier === null) {
      problems.push(
        `the consumer's \`id\` reached no element. \`id\` is in SAFE_FALLTHROUGH_ATTRS `
        + `because a consumer's \`<label for>\` and \`aria-describedby\` point at it.`,
      )
    }
    else if (idCarrier !== carrier) {
      problems.push(
        `the consumer's \`class\` and \`id\` landed on DIFFERENT elements `
        + `(<${carrier.tagName.toLowerCase()}> vs <${idCarrier.tagName.toLowerCase()}>). `
        + `Fallthrough has one target; splitting it means no single node is the component's surface.`,
      )
    }
  }

  return problems
}

/** Throwing form of {@link checkFallthrough}. */
export function expectFallthrough(
  container: Element,
  fallthrough: CheckableFallthrough,
  probe: FallthroughProbe,
  component = 'component',
): void {
  const problems = checkFallthrough(container, fallthrough, probe)
  if (problems.length > 0)
    throw new Error(`Fallthrough contract (TASK-R5-O6) — ${component}:\n  ${problems.join('\n  ')}`)
}

// ---------------------------------------------------------------------------
// 3. `asChild` — rendered
// ---------------------------------------------------------------------------

/** The part of an `AsChildEntry` this module reads. */
export interface CheckableAsChild {
  readonly component: string
  readonly mode: 'opt-in' | 'always'
  readonly elements: readonly string[] | '*'
  readonly guarantees: readonly ('semantics' | 'attrs' | 'ref' | 'disabled' | 'keyboard')[]
  readonly unimplemented?: string
}

/** What the caller rendered, so the checks can be told apart from a bad fixture. */
export interface AsChildRender {
  /** The container the consumer's element was rendered into. */
  readonly container: Element
  /** The tag the consumer passed, e.g. `'button'` or `'a'`. */
  readonly consumerTag: string
  /** A marker class the consumer's element carries, used to find it again. */
  readonly consumerMarker: string
  /** Whether the fixture asked for the disabled state. */
  readonly disabled?: boolean
}

/**
 * Whether a component honoured its `asChild` allowlist entry.
 *
 * The guarantees are checked **only if declared**. That is the point of listing
 * them per entry rather than assuming all five: an entry that promises
 * `semantics` and `attrs` and not `ref` is making a smaller promise, and a
 * matrix that checked `ref` anyway would be asserting a contract nobody wrote.
 */
export function checkAsChild(entry: CheckableAsChild, render: AsChildRender): string[] {
  const problems: string[] = []
  const el = render.container.querySelector(`.${CSS.escape(render.consumerMarker)}`)

  if (el === null) {
    return [
      `${entry.component}: the consumer's element (.${render.consumerMarker}) is not in the `
      + `rendered output at all. With \`asChild\`, the consumer's element IS the output — `
      + `if it is missing, the component rendered its own node instead.`,
    ]
  }

  // `semantics` — the consumer's tag survived. This is the whole promise of
  // `asChild`: the library contributed behaviour and changed no markup.
  if (entry.guarantees.includes('semantics')) {
    const tag = el.tagName.toLowerCase()
    if (tag !== render.consumerTag.toLowerCase()) {
      problems.push(
        `${entry.component}: promised \`semantics\` but the consumer's <${render.consumerTag}> `
        + `rendered as <${tag}>.`,
      )
    }
    // There is deliberately NO "did the component wrap it?" check here.
    //
    // The obvious version — flag a parent carrying a `data-part` — is wrong,
    // and was wrong in practice: `DzDialogClose` renders inside the dialog's
    // own `content` part, so its consumer's button legitimately has a
    // `data-part` parent that `DzDialogClose` did not add. Nothing in a
    // rendered tree distinguishes "my wrapper" from "my parent's part" without
    // knowing which nodes this component authored, and a check that cannot tell
    // them apart reports a defect on correct code. A gate that cries wolf is a
    // gate somebody switches off, so the wrapper claim is made by the
    // per-component assertion that the consumer's element carries no
    // `data-part` of ours (see asChild.contract.spec.ts) rather than guessed at
    // here.
  }

  // `attrs` — the component put something on their element. An `asChild`
  // trigger that forwards nothing has silently become a passthrough slot.
  if (entry.guarantees.includes('attrs')) {
    const contributed = [...el.attributes]
      .map(a => a.name)
      .filter(name => name !== 'class' && name !== 'id' && name !== 'style')
    if (contributed.length === 0) {
      problems.push(
        `${entry.component}: promised \`attrs\` but contributed no attribute to the `
        + `consumer's element. A trigger that forwards nothing is not wired to anything.`,
      )
    }
  }

  // `disabled` — reaches their element as an attribute or as ARIA. Either is
  // acceptable; neither is not, because a consumer's <a> cannot take `disabled`
  // and must get `aria-disabled` instead.
  if (entry.guarantees.includes('disabled') && render.disabled === true) {
    const hasDisabled = el.hasAttribute('disabled')
      || el.getAttribute('aria-disabled') === 'true'
      || el.getAttribute('data-disabled') !== null
    if (!hasDisabled) {
      problems.push(
        `${entry.component}: promised \`disabled\` but the consumer's element carries neither `
        + `\`disabled\`, \`aria-disabled="true"\` nor \`data-disabled\`.`,
      )
    }
  }

  // `keyboard` — their element is still reachable. `asChild` onto a <div> that
  // never gets a tabindex is the classic way this feature loses keyboard users.
  if (entry.guarantees.includes('keyboard')) {
    const tag = el.tagName.toLowerCase()
    const natively = tag === 'button' || tag === 'a' || tag === 'input' || tag === 'select' || tag === 'textarea'
    const tabindex = el.getAttribute('tabindex')
    if (!natively && (tabindex === null || tabindex === '-1')) {
      problems.push(
        `${entry.component}: promised \`keyboard\` but the consumer's <${tag}> is not natively `
        + `focusable and received no \`tabindex\`. It is reachable with a mouse only.`,
      )
    }
  }

  return problems
}

/** Throwing form of {@link checkAsChild}. */
export function expectAsChild(entry: CheckableAsChild, render: AsChildRender): void {
  const problems = checkAsChild(entry, render)
  if (problems.length > 0)
    throw new Error(`asChild contract (TASK-R5-O6):\n  ${problems.join('\n  ')}`)
}

// ---------------------------------------------------------------------------
// 4. Controlled/uncontrolled — behavioural
// ---------------------------------------------------------------------------

/** One controlled/uncontrolled observation, in the order it must be taken. */
export interface ExternalWriteTrace {
  /** What the control displayed after the user's edit. */
  readonly afterUserEdit: unknown
  /** What the parent wrote next, from outside. */
  readonly externalWrite: unknown
  /** What the control displayed after that write. */
  readonly afterExternalWrite: unknown
}

/**
 * Whether an external write **after** a user edit was honoured (defect D8).
 *
 * This is the assertion that would have caught D8, written in the shape the
 * defect actually has. The bug is not "the model does not update" — a snapshot
 * test of a fresh mount passes, and seven controls did. It is that the first
 * user* edit latches a value into component-local state, after which every
 * write from the parent is read past and discarded. So the trace has to include
 * the user's edit, or the check proves nothing.
 *
 * `afterUserEdit` is required for exactly that reason: a trace that goes
 * straight from mount to external write is testing the wrong thing, and this
 * refuses it rather than passing.
 */
export function checkExternalWrite(component: string, trace: ExternalWriteTrace): string[] {
  const problems: string[] = []
  const shown = JSON.stringify(trace.afterExternalWrite)
  const wanted = JSON.stringify(trace.externalWrite)
  const edited = JSON.stringify(trace.afterUserEdit)

  if (edited === wanted) {
    return [
      `${component}: the fixture's external write (${wanted}) equals what the control already `
      + `showed after the user's edit, so this trace cannot distinguish "honoured" from "ignored". `
      + `Write a different value.`,
    ]
  }

  if (shown !== wanted) {
    problems.push(
      `${component}: after the user edited, the parent wrote ${wanted} and the control still `
      + `shows ${shown}. An external write after a user edit must be honoured — a form reset `
      + `that silently does nothing is a data-loss defect, not a styling one (D8).`,
    )
  }

  return problems
}

/** Throwing form of {@link checkExternalWrite}. */
export function expectExternalWrite(component: string, trace: ExternalWriteTrace): void {
  const problems = checkExternalWrite(component, trace)
  if (problems.length > 0)
    throw new Error(`Controlled/uncontrolled contract (TASK-R5-O6, defect D8):\n  ${problems.join('\n  ')}`)
}

// ---------------------------------------------------------------------------
// 5. Handler composition — rendered
// ---------------------------------------------------------------------------

/**
 * Whether a consumer's listener for an event the component also handles ran
 * **exactly once**.
 *
 * A component that handles an event internally, does not declare it in
 * `defineEmits`, and also binds `$attrs` onto the same element gives the
 * consumer two listeners on one node. The symptom is a form submitted twice or
 * an analytics event double-counted — both of which look like a consumer bug
 * from inside the library.
 */
export function checkHandlerComposition(component: string, calls: number): string[] {
  if (calls === 1)
    return []

  if (calls === 0) {
    return [
      `${component}: the consumer's listener never ran. The component either swallows the `
      + `event or binds \`$attrs\` to a node the interaction does not reach.`,
    ]
  }

  return [
    `${component}: the consumer's listener ran ${calls} times. The component both declares the `
    + `event and lets the \`on*\` attribute fall through to the same element, so every consumer `
    + `handler fires once per path.`,
  ]
}

/** Throwing form of {@link checkHandlerComposition}. */
export function expectHandlerComposition(component: string, calls: number): void {
  const problems = checkHandlerComposition(component, calls)
  if (problems.length > 0)
    throw new Error(`Handler-composition contract (TASK-R5-O6):\n  ${problems.join('\n  ')}`)
}
