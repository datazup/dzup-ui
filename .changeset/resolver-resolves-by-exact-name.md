---
"@dzup-ui/core": minor
---

**`DzResolver` resolves by exact name from generated ownership data. Unknown names no longer resolve to Core.**

The resolver classified components with `name.startsWith('Dz')` and a
hand-maintained prefix list. A prefix cannot separate two packages that both use
`Dz`, and the list had drifted in both directions:

- `DzAppShell` and `DzCalendar` are **Core** components, and the list sent them
  to Pro. Pro exports no `DzAppShell` at all.
- The list named `DzScheduler`, `DzComment`, `DzVirtualTable`, `DzWorkflow` and
  `DzReactionPicker` as Pro. Pro exports none of them under those names.
- Everything else starting with `Dz` fell through to Core, so a typo
  (`DzButtonn`) resolved to an import of a component that does not exist, and
  the error surfaced as a bundler resolution failure rather than as a typo.

Ownership now comes from `packages/core/src/generated/component-ownership.ts`,
written by `yarn generate:ownership` from the ownership manifests and
freshness-checked by `yarn validate:ownership`. The resolver is a lookup:

- **Unknown name → `undefined`.** unplugin-vue-components reads that as "not
  mine" and leaves the name alone, which is the correct answer for a typo, for
  your own component, and for a Pro component in a project without Pro.
- **Only mountable symbols resolve.** `DzButtonProps` (a type), `useTheme` (a
  composable), `buttonVariants` (a recipe) and `DZ_TABS_KEY` are public exports
  but are not components, and the resolver no longer offers to import them as
  one.
- **Compound parts resolve to their parent's package**, by data rather than by
  sharing a prefix.

**New: `prefix`.** `DzResolver({ prefix: 'X' })` lets templates write
`<XButton>`; the emitted import still names the real export (`DzButton`) from
the package that owns it. It renames the tag, never the ownership, and it does
not keep the `Dz` tag as an alias.

**Minor, not patch** — an unknown `Dz*` name that used to resolve to Core now
resolves to nothing. If you relied on that fallthrough, the name was either a
typo or a component this library does not export.

`includePro: true` still resolves nothing today: no Pro ownership manifest is
published yet, so the generated table covers the Core tier only. The resolver
now says so once, at construction, naming the environment variable that fixes
it — instead of silently resolving Pro names to a package nobody can install.
