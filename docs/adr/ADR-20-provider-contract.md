# ADR-20 — Provider contract: locale, direction, messages, formats, portals, motion, defaults, nonce, test ids

- **Status:** Proposed (TASK-OSS-P4-01, 2026-08-21; amended by TASK-OSS-P4-02 and P4-03, 2026-08-21 — see *Amendments*)
- **Extends:** ADR-09 (theme context), ADR-08 (compound context by provide/inject)
- **Depended on by:** TASK-OSS-P4-02 (`DzProvider`), P4-03 (message catalogs),
  P4-04 (portal migration), P4-05 (RTL matrices), and every Pro slice that needs
  an application's locale
- **Implements the read side.** The `DzProvider` component that writes these
  values is P4-02; this ADR fixes the keys, the shapes, the defaults and the
  merge rules so that it has something to implement against.

## Context

The reassessment records finding **M2**: `DzThemeProvider` covers theme, and
locale, direction, messages, formats, portal container, motion policy, component
defaults, CSP nonce and test IDs have no single public contract.

Measured on the checkout, 2026-08-21:

| Concern | State before this ADR |
|---|---|
| User-visible strings | **79 distinct literals**, in two groups: **50** static `aria-label` values that *no* application can change — `'Clear input'`, `'Back to top'`, `'Close lightbox'` — and **29** literal defaults on `*Text`/`*Label`/`*Title`/`*Message`/`*Placeholder` props (`noResultsText`, `cancelText`), which only a per-instance prop can change. A further 152 `aria-label` occurrences are already bound or interpolated and are not in scope. |
| Portal target | **15 components** extend `BasePortalProps` and take their own `portalTo`. An application embedding the library in a shell must pass the same selector to every one of them, and cannot fix the one it forgot. |
| `Intl` formatters | **5 construction sites across 4 files** build them independently, each with its own `locale` argument or none (9 files reference `Intl.` once type declarations and prose are counted). `DzAnimatedNumber.tween.ts:150` constructs one *inside* `format()`, which a tween calls per frame. |
| Direction | 14 component files reference `dir`/`direction` ad hoc. Nothing resolves a locale to a writing direction. |
| Motion | No policy. Components animate or do not, per component. |
| Component defaults | None. `size="sm"` is typed on every call site or nowhere. |
| CSP nonce | None. `DzThemeProvider` injects a `<style>` tag (ADR-15) that a strict CSP drops silently — the symptom is a colour sweep on theme change that nobody can reproduce locally. |
| Test ids | None. |

## Decision

### 1. One symbol per concern, declared in `@dzup-ui/contracts`

Nine injection keys (`DZ_LOCALE_KEY`, `DZ_MESSAGES_KEY`, `DZ_FORMATS_KEY`,
`DZ_DIRECTION_KEY`, `DZ_PORTAL_TARGET_KEY`, `DZ_MOTION_KEY`, `DZ_DEFAULTS_KEY`,
`DZ_NONCE_KEY`, `DZ_TEST_IDS_KEY`), plus theme's existing `DZ_THEME_KEY`.

**Why in contracts.** An injection key is an identity: two packages that inject
the same concern must inject the *same symbol*, or the child silently receives
the default and the bug is invisible. Declaring them in the types package is
what lets `@dzup-ui-pro/*` read an application's locale **without importing
Core's runtime** — the dependency direction the whole package graph is built on.

These are the second and subsequent runtime values in a types-only package
(`assertNever` was the first). `Symbol()` calls are side-effect-free and
tree-shakeable. The alternative — string keys — collides silently across
libraries, which is the failure the symbol form exists to prevent.

**Why separate keys rather than one context object.** So a provider can override
the locale without restating the portal target, and so a component that reads
only the direction does not re-render when the message catalog changes.

### 2. Every concern has a typed default, and only theme requires a provider

```ts
DZ_PROVIDER_DEFAULTS = {
  locale: 'en-US',
  direction: 'auto',
  motion: 'system',
  portalTarget: undefined,   // the portal's own default, i.e. document.body
  nonce: undefined,
  testIds: { enabled: false, attribute: 'data-testid' },
}
```

**This is the load-bearing decision.** A consumer must be able to adopt one
component without adopting an architecture. **Nine of the ten composables
resolve to a default when uninjected and never throw.**

`useDzTheme` is the exception, and stays one: it is `useTheme` re-exported, and
`useTheme` throws without a `DzThemeProvider` unless called with
`{ optional: true }`. Theme genuinely has no sensible default for an application
that has not chosen one, and the behaviour shipped with ADR-09 — changing it
here would change the semantics of a contract components already depend on.
Revisiting it is listed under Rollout.

The defaults are exported rather than buried in each composable, because "works
without a provider" is a contract a consumer should be able to read, and because
Pro must resolve to the same values.

### 3. Nested providers override per key — except messages, which deep-merge

A child provider replaces its ancestor's value for the keys it sets, and leaves
the rest alone.

**Messages are the exception, and the exception is the point.** A host that
wants to change `select.noResults` must not have to restate the other 71
strings. `provideDzMessages` reads its ancestor's catalog and provides the deep
merge, so nesting composes instead of truncating.

That the write half can read its own key is Vue semantics worth stating,
because it is not obvious: `inject` resolves against the **parent** chain, so a
component never sees its own `provide`. It is what makes the merge possible, and
it is also why a provider and its consumer must be different components — a test
that provides and consumes in one `setup` reads the default and looks like a
bug in the library.

### 4. Direction resolves from the locale unless a host overrides it

`useDzDirection()` returns `'ltr' | 'rtl'` — **never `'auto'`**. A component
asking "am I in RTL?" wants a yes or no; `'auto'` is a thing a *host* declares.
Resolving it centrally means no component has to know the script direction of
every language the application ships.

Resolution is a checked-in list of RTL language subtags, matched on the subtag
so `ar-EG` and `fa-IR` work without enumerating regions.
`Intl.Locale.prototype.getTextInfo()` would be the right mechanism and is
deliberately **not** used: it is Baseline-2023 and unavailable across this
repository's Node floor (`^20.19.0 || >=22.13.0`, ADR-18). When the floor moves
past it, the list becomes a one-line delegation.

### 5. Formatters are cached application-wide, keyed by locale plus options

Constructing an `Intl.NumberFormat` resolves locale data per ECMA-402; it is not
free, and it is why every serious i18n layer caches. The cache is module-level
so it survives component unmounts, and the key normalises option order — two
callers asking for the same format with keys in a different order mean the same
thing.

`useDzFormats()` returns **plain functions, not refs**, so each call reads the
locale at call time: a locale change is picked up without the caller
re-subscribing, and a component can format inside a render without a watcher.

### 6. Default precedence: prop → compound context → provider → component default

Fixed here, in one place, so no component invents its own order:

1. **An explicit prop wins**, because it is what the author of that line wrote.
2. **Then compound context** — a `DzButtonGroup` is nearer and more specific
   than an application-wide setting.
3. **Then the provider**, per-component entry before shared axis, so
   "make buttons extra small" beats "make everything large" for buttons and
   leaves every other component on large.
4. **Then the component's own default.**

`useDzDefaults().resolve(component, prop, chain)` implements it; a component
passes what it has and takes back the answer.

### 7. Motion follows the OS unless the application has already asked the user

`'system'` (default) consults `prefers-reduced-motion`. `'reduced'` never
animates. `'full'` animates regardless — **an explicit override of a stated
accessibility preference**, admitted only because a host that has already asked
the user is better placed to decide than this library is.

**Under SSR the honest answer is `reduced: false`**, matching what the CSS media
query resolves to before the client knows better. Answering `true` would render
markup that never animates and hydrate into markup that does, which is a visible
jump rather than a safe default.

### 8. Test ids are off until a host names the attribute

An attribute nobody asked for is payload on every rendered node. `data-testid`,
`data-test` and `data-qa` are all in use and none is more correct, so the host
names it. `testId()` returns `undefined` when disabled, which `v-bind` drops —
a production build carries no attribute rather than an empty one.

### 9. Pro extends by declaration merging, never by a second provider

Pro supplies additional `messages` and `defaults` through TypeScript declaration
merging on the interfaces exported here. **A parallel Pro provider is
forbidden**: it would mean two locales, two merge rules, and a component whose
behaviour depends on which provider a host remembered to mount.

## Consequences

- Nine composables ship with typed defaults and no provider requirement, and
  `useDzTheme` keeps its ADR-09 behaviour, so nothing existing breaks and
  nothing is required to adopt them.
- The 79 hard-coded literals become mechanically replaceable: a component
  swapping `'No results found'` for `read('select.noResults', 'No results
  found')` behaves **identically** until an application supplies a catalog. That
  is what lets P4-03 proceed component by component rather than as one breaking
  change.
- 15 `portalTo` props gain a default source. The props stay — P4-04 decides
  their deprecation — but an application can now set the target once.
- The formatter cache is shared, so the five independent `Intl` construction
  sites can be migrated one at a time to the same cache.
- `@dzup-ui/contracts` now carries runtime symbols. It remains dependency-free
  and tree-shakeable.

## Alternatives considered

**One `DzConfig` object under a single key.** Rejected — every consumer
re-renders on every change, and a nested provider overriding the locale would
have to restate the portal target, the nonce and the defaults.

**String injection keys.** Rejected — they collide silently across libraries,
and the collision surfaces as a component reading another library's config.

**Keys in `@dzup-ui/core`.** Rejected — Pro would have to import Core's runtime
to read an application's locale, inverting the dependency the package graph is
built on.

**Extending `DzThemeProvider` with the other nine concerns.** Rejected — it
would make a component that only wants the theme re-render on a locale change,
and it would break the ADR-09 contract that has already shipped.

**`Intl.Locale.prototype.getTextInfo()` for direction.** Rejected *for now* —
unavailable across the supported Node range (ADR-18). Recorded as the intended
replacement rather than left as a hand-maintained list to be discovered.

**Deep-merging every concern, not just messages.** Rejected — for a scalar like
the locale or the nonce there is nothing to merge, and for `defaults` a host
overriding one component's size should not silently inherit half of an
ancestor's per-component map.

## Rollout

1. This ADR is **Proposed** until a maintainer approves it. The composables are
   additive and safe to land either way; nothing consumes them yet.
2. ~~**P4-02** builds `DzProvider` on the `provideDz*` half, keeping
   `DzThemeProvider` working.~~ **Done.** `DzProvider` ships in
   `packages/core/src/providers/`; `DzThemeProvider` is a thin wrapper over it
   and its suite passes untouched. The four decisions P4-02 had to take are
   recorded under *Amendments*.
3. ~~**P4-03** replaces the 79 hard-coded literals, one component at a time.~~
   **Done**, and as one mechanical change rather than one component at a time —
   which only became the cheaper option once every replacement value was proved
   byte-identical to the literal it replaced. See *Amendment A5*.
4. **P4-04** migrates the 15 portal props to the provider default.
5. **P4-05** uses `useDzDirection` for the RTL matrices.
6. **Open:** whether `useDzTheme` should gain a default and stop throwing, so
   all ten concerns behave alike. That is a change to a shipped ADR-09 contract
   and needs a maintainer decision; P4-02 is the natural moment to take it.

## Amendments (TASK-OSS-P4-02)

Building the writer forced four decisions this ADR had not taken. They are
recorded here rather than in a second ADR because each one is a rule about the
keys and merge semantics §1–§9 define.

### A1. A provider provides only the keys its props set

§3 says a child "replaces its ancestor's value for the keys it sets". P4-02
makes that literal: `DzProvider` calls `provideDz*` **only** for a prop that is
defined. An undefined prop is not "use the default" — it is "leave whatever the
ancestor decided alone".

Without this, `<DzProvider locale="ar-EG">` nested inside a configured provider
would silently reset the portal target, the nonce and the defaults to their
documented values, which is a truncation wearing an override's clothes. It is
also what lets `DzThemeProvider` delegate: it passes `theme` and nothing else,
so it takes ownership of the theme and of nothing else.

`provideDzLocale`'s signature changed accordingly — both arguments are optional,
because "set the direction, inherit the locale" is a real configuration.

### A2. Only the root provider writes to `<html>`

`data-theme` (§ADR-15) and now `dir` are document-level attributes. A nested
provider that wrote them would apply a subtree's direction to the whole page,
and two providers would fight in an order decided by mount timing.

So: the **root** provider reflects, a nested one does not. Theme keeps its
existing rule instead — a provider reflects `data-theme` when it *owns* theme,
which a nested provider does only when its host asks for one.

Direction is additionally reflected **only when the host declared a `locale` or
a `direction`**. A provider mounted to set a portal target has no opinion about
writing direction, and stamping `dir="ltr"` on a document that never asked is an
opinion.

The consequence is a real limitation and is documented rather than engineered
around: because `DzProvider` renders no element (`parts: 'none'`), a nested
provider changing direction changes what `useDzDirection()` answers for its
subtree and writes no attribute anywhere. Scoping `dir` in the DOM for a subtree
is the host's `<div :dir="…">`. The alternative — rendering a wrapper — would
make the provider unusable inside a shadow root, inside a `<tbody>`, and between
a flex container and its children, which is a much larger cost than one
attribute.

### A3. Theme is owned by whoever is asked, or by the root if nobody was

`<DzProvider>` with no `theme` prop and no theme above it owns the theme, so it
behaves exactly like `<DzThemeProvider>`; a consumer is not required to know that
theme is the one concern with a separate history. A provider nested inside a
themed tree that says nothing about theme leaves it alone.

This does **not** resolve the open question in Rollout §6: `useDzTheme` still
throws without a provider. It narrows it — "no provider" is now a rarer state —
but changing a shipped ADR-09 contract is still an owner decision.

### A4. Two shapes are accepted where the contract has one

Both are normalised before anything is provided, so `useDzDefaults().resolve()`
and `useDzFormats()` each see exactly one shape.

- **`defaults`** accepts the contract's `{ components: { DzButton: {…} } }` and
  the shorthand `{ DzButton: {…} }`. `size`, `tone`, `density` and `components`
  are the only reserved keys and no component is named any of them, so there is
  no ambiguity to resolve. An explicit `components` entry wins over the
  shorthand for the same component: the contract form is the specific one.
- **`formats`** takes a new `DzFormatDefaults` — option defaults a *host*
  declares — as distinct from `DzFormats`, the factories a *component* asks for.
  A caller's own options always win. `currency` is named separately because
  `Intl.NumberFormat` throws `TypeError` for `style: 'currency'` with no
  currency, so without a host default a component cannot offer currency
  formatting at all.

`DzTestIds` also gains an optional `prefix`. Optional rather than defaulted to
`''` so `DZ_PROVIDER_DEFAULTS.testIds` stays exactly the two fields §2 published.

### A5. §9's "declaration merging" needs a target, and it is not `DzMessages`

§9 says Pro extends by declaration merging "on the interfaces exported here".
Building the catalog found that no such interface existed: `DzMessages` carries
an index signature, so there is nothing to merge into, and `DzDefaults.components`
has the same problem. The mechanism was named without a target.

P4-03 adds one: **`DzMessageCatalog`, an empty interface in `@dzup-ui/contracts`
that every tier augments from its own package.**

```ts
declare module '@dzup-ui/contracts' {
  interface DzMessageCatalog {
    DzInput: { clear: string, loading: string }
  }
}
```

Two things follow, and both are the point:

**Core uses the same mechanism it requires of Pro.** Core's ~38 components are
contributed by exactly the augmentation above, from `packages/core/src/i18n/
messages.ts`. A hook only one tier uses is a hook nobody tests.

**It is empty in contracts on purpose.** `@dzup-ui/contracts` knows about base
prop interfaces and canonical taxonomies, not about `DzCombobox`; enumerating
Core's components in the types package would invert that. And it has to live in
contracts rather than in Core, because Pro can only augment a package it depends
on — Pro depends inward on Core *contracts* and must never import Core's
runtime, so `declare module '@dzup-ui/core'` was never available to it.

`DzMessages` is unchanged and keeps its loose recursive shape: it is what a
*host* passes to `DzProvider`, where partial overrides are the whole point.
`DzMessageCatalog` is what the *library* guarantees it will look up. The two
meet in `useComponentMessages`, which resolves per key so a host overriding one
string keeps the rest.

**The locale default now has teeth, and that is a behaviour change.** §2 fixed
`locale: 'en-US'` as the default, but until P4-03 nothing read it —
`DzAnimatedNumber`, `DzTimePicker` and `useRelativeTime` each passed `undefined`
to `Intl`, which means "the runtime's own locale". That is not the same value on
a Node server as in a visitor's browser, so those components could render one
language on the server and hydrate into another. They now resolve through the
provider. The **pure exported helpers** (`formatNumber`, `formatRelativeTime`,
`formatAbsoluteTime`) deliberately do not: an omitted `locale` still means the
runtime's own, because they are public functions whose signature says so.

### What did not change

Every default in §2, the deep-merge rule for messages in §3, the direction
resolution in §4, the formatter cache in §5, the precedence in §6, the motion
policy in §7, and the Pro extension rule in §9. No component's default changed,
and every concern still resolves with no provider mounted.

### One correction to a downstream document

`foundation-tasks.md`'s API example for P4-02 shows `:motion="'reduce'"`.
`DzMotionPreference` is `'system' | 'reduced' | 'full'` — `'reduce'` is the CSS
media-query value, not this contract's. The implementation follows this ADR.

## Validation hooks

| Hook | What it enforces |
|---|---|
| `packages/core/src/composables/provider/provider.spec.ts` | defaults with no provider · nested override · message deep-merge across a boundary · formatter cache hit, option-order normalisation, locale separation · default precedence |
| `packages/core/tests/ssr/provider-ssr.spec.ts` | every concern resolves with `window`, `document` and `matchMedia` **deleted** — not merely absent from a render |
| `packages/core/src/providers/DzProvider.spec.ts` | prop → composable routing · nesting per key · the negative case (an unset prop provides nothing) · message deep-merge across a boundary · defaults precedence and both accepted shapes · `persist: false` in both directions · nonce on the injected style tag · `dir` reflected by the root only |
| `packages/core/src/providers/DzProvider.contract.spec.ts` · `DzThemeProvider.contract.spec.ts` | Contract Spec v1 and anatomy conformance — including `parts: 'none'`, i.e. that neither renders an element |
| `packages/core/tests/ssr/dz-provider-ssr.spec.ts` | server render with the browser globals deleted, **plus** hydration with zero mismatch warnings for a configured, a nested, and a themed tree |
| `yarn validate:contract-parity` | now covers `packages/core/src/providers`, which it never did |
| `yarn validate:hardcoded-strings` | no static `aria-label` in a template and no literal default on a user-visible prop, unless a comment says why |
| `packages/core/src/i18n/i18n.spec.ts` | every catalog value equals the literal it replaced · per-key override · a non-string override falls back rather than rendering `[object Object]` · 1,000 rows construct at most one formatter per (locale, options) pair |
| Storybook Pseudo-locale toolbar | every story, every family: un-accented text is a string the catalog does not reach |
| `yarn validate:exports` · `validate:ownership` | the composables are in the generated barrel and the ownership manifest |
| `yarn validate:adr-references` | this document resolves for every `ADR-20` citation |
