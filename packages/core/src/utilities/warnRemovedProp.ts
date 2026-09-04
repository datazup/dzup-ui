/**
 * Dev-mode warning for a prop this component used to declare and no longer does.
 *
 * `packages/contracts/VERSIONING.md` §3 requires four things of every removed
 * prop: the type removed, a dev-mode runtime warning, a codemod entry, and a
 * changeset at **minor**. This is the second of the four.
 *
 * ## Why this lives in `core` and not in `compat`
 *
 * `@dzup-ui/compat` already ships `warnDeprecated(old, new, pkg)` for its
 * adapters, and this module is deliberately **not** a second copy of it. It
 * cannot be a reuse of it either: stable Core may never import `compat`
 * (`ui/dzup-ui/CLAUDE.md`, enforced by `yarn validate:boundaries`), so a Core
 * component warning about its own removed prop has no reachable helper. The two
 * also answer different questions — `warnDeprecated` names a *replacement
 * component*, this one names a *removed prop on a component that still exists*
 * and has to look the value up in `$attrs`, because a prop that is no longer
 * declared arrives as a fall-through attribute rather than as a prop.
 *
 * ## The fall-through this exists to make visible
 *
 * Removing a prop declaration does not make the value disappear. Vue routes an
 * undeclared binding into `$attrs`, and every component here spreads `$attrs`
 * onto its root, so `<DzGrid :aria-invalid="true">` — which used to be swallowed
 * silently — now **renders** `aria-invalid="true"` on a `<div>` that has no role
 * to carry it. That is a different wrong answer from the old one, and it is the
 * reason a type removal alone is not the whole fix. The warning names it.
 *
 * @module @dzup-ui/core/utilities/warnRemovedProp
 */

/**
 * `component.prop` pairs already warned about, so a list rendering 500 rows
 * produces one line rather than 500.
 *
 * Module-scoped and therefore per-session, matching `@dzup-ui/compat`'s
 * `warnDeprecated`. {@link resetRemovedPropWarnings} exists so a spec can assert
 * the warning fires at all, which a once-per-session set otherwise makes
 * order-dependent.
 */
const warned = new Set<string>()

/**
 * Convert a camelCase prop name to the kebab-case attribute a template writes.
 *
 * Both spellings have to be checked. `<DzGrid :aria-invalid="x">` lands in
 * `$attrs` as `aria-invalid`; `<DzGrid :ariaInvalid="x">` — which is what a
 * consumer migrating from the declared prop is most likely to have written —
 * lands as `ariaInvalid`. Checking only one of them warns about half the cases
 * and leaves the other half exactly as silent as the bug being fixed.
 */
function kebab(prop: string): string {
  return prop.replace(/([A-Z])/g, s => `-${s.toLowerCase()}`)
}

/**
 * Warn, once per `component.prop` per session, when a removed prop is still passed.
 *
 * No-op outside dev. The check is a `$attrs` lookup and nothing else, so it
 * costs one property test per removed prop per setup call in production too —
 * except that the `import.meta.env?.DEV` guard lets a bundler drop the whole
 * body.
 *
 * @param component - The component's public name, e.g. `DzGrid`.
 * @param attrs     - The result of `useAttrs()`.
 * @param removed   - Removed prop name → what the consumer should do instead.
 *
 * @example
 * ```ts
 * const attrs = useAttrs()
 * warnRemovedProps('DzGrid', attrs, {
 *   ariaInvalid: 'A layout box is not invalid; put aria-invalid on the field.',
 * })
 * ```
 */
export function warnRemovedProps(
  component: string,
  attrs: Readonly<Record<string, unknown>>,
  removed: Readonly<Record<string, string>>,
): void {
  if (import.meta.env?.DEV !== true)
    return
  for (const [prop, guidance] of Object.entries(removed)) {
    if (!(prop in attrs) && !(kebab(prop) in attrs))
      continue
    const key = `${component}.${prop}`
    if (warned.has(key))
      continue
    warned.add(key)
    console.warn(
      `[dzup-ui] ${component} no longer accepts \`${prop}\`. It was declared and `
      + `never rendered; the declaration has been removed rather than left as a `
      + `promise the component cannot keep. ${guidance} `
      + `It is now passed through to the root element as a plain attribute. `
      + `See packages/contracts/VERSIONING.md §3.`,
    )
  }
}

/**
 * Clear the once-per-session set. For specs only.
 */
export function resetRemovedPropWarnings(): void {
  warned.clear()
}
