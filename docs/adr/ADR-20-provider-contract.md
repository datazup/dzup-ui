# ADR-20 — Provider contract: locale, direction, messages, formats, portals, motion, defaults, nonce, test ids

- **Status:** Proposed (TASK-OSS-P4-01, 2026-08-21; amended by TASK-OSS-P4-02 and P4-03, 2026-08-21, TASK-R3-O2 2026-09-04, TASK-R2-O4 2026-09-18 and TASK-R0-O2 2026-09-22 — see *Amendments*)
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
- **A tenth concern, the sanitizer, was added by amendment A6** (TASK-R3-O2).
  Its default is an escaping adapter rather than a pass-through, it has zero
  component consumers inside Core by construction, and it is the seam
  `@dzup-ui-pro/pro` consumes in place of its per-component DOMPurify sites.

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

Building the writer forced four decisions this ADR had not taken (A1–A4); P4-03
added a fifth (A5), TASK-R3-O2 a sixth (A6, 2026-09-04) and TASK-R2-O4 a seventh
(A7, 2026-09-18), each adding a concern rather than a rule. **A8 (TASK-R0-O2,
2026-09-22) is different in kind**: it adds nothing and decides nothing — it
corrects seven statements of fact this document makes that measurement has since
contradicted, including the `getTextInfo()` claim in §4 (**D181**). They are all
recorded here rather than in a second ADR because each is a rule — or a
correction to a rule — about the keys and merge semantics §1–§9 define.

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

### A6. A tenth concern: the sanitizer (TASK-R3-O2, 2026-09-04)

**Added after P4, and by a different force.** A1–A5 were decisions that building
the writer forced. This one is a decision that *another package* forced: Pro's
QUAL-04 built a 13-sink registry, a malicious corpus and a Trusted Types lane,
and then recorded in `../../../dzup-ui-pro/docs/security.md` §10 that the shared
`DzSanitizerAdapter` could not be built, because **Core had no provider seam and
§9 forbids a Pro-only provider.** §9 is right, so the seam belongs here.

08-11 doc 06 asks for a central sanitizer adapter configurable **once per
application**: allowed markup, a Trusted Types policy name and input ceilings. A
`sanitizer` concern is added with the same obligations the other nine carry — a
key in contracts (`DZ_SANITIZER_KEY`), a typed default, per-key nesting, an
SSR-safe resolution and a documented composable (`useDzSanitizer`).

**The default is escaping, and that is the substantive decision.** Core renders
no HTML sink of its own — measured at `99b963a`: zero `v-html`, zero `innerHTML`
in `packages/core/src`, and all fifteen `SecurityBoundary` declarers are `url` or
`payload` — so there was no existing Core sanitizer to promote. Of the three
candidates:

| Default | Verdict |
|---|---|
| Pass-through | **Rejected.** It is the vulnerability the seam exists to remove, and it fails in the direction where nothing looks wrong until it is. |
| Bundle a sanitizer | **Rejected.** A parser and an allowlist in every consumer's bundle, for a library that renders no HTML, and Core would own a policy that belongs to the host. |
| **Escape** | **Chosen.** Safe with no dependency, byte-identical on server and client, and *visibly* wrong when it is wrong: a host that meant to render rich content sees tags as text on the first render rather than shipping an unguarded sink. |

**The ceilings are the seam's, not the adapter's.** `resolveSanitizer` enforces
`limits` before delegating, so the common installation
(`{ sanitize: html => DOMPurify.sanitize(html) }`) cannot omit them by
forgetting them. `maxLength` is in **characters**, and `128 KiB` / depth `64` are
Pro's measured `DEFAULT_SANITIZE_LIMITS` carried over unchanged rather than
re-guessed. The depth guard is a **scanner, not a parse** — the parse is the cost
being bounded — ported from Pro with its 26 validated shapes, so the two tiers
cannot come to disagree about what depth 64 means.

**Three states, not two.** Omitted means "nobody configured one" and resolves to
the escaping default. `null` means "the host will supply one" and, if nothing
does, throws in development — a distinction A1 makes possible and one that keeps
a configuration mistake from becoming a rendering difference nobody looks for.
In production the same state falls back to escaping: failing closed beats
failing loudly in a user's face.

**Consequences for §2 and for the ratchet.** `DZ_PROVIDER_DEFAULTS` grows a
`sanitizer` key — the first time it has grown since §2 published it, and a
contract change for anyone comparing against the object, so it ships under a
`minor` per `VERSIONING.md`'s 0.x rule. The vocabulary (`markdown`,
`mermaid-svg`, `notebook-output`, `diff-highlight`, `rich-text-paste`, and the
three object-URL contexts typed separately) is Pro's registry vocabulary
verbatim; no name is invented and none is dropped.

**What this amendment does *not* claim.** The seam has **zero component
consumers in Core**, because Core has no HTML sink to consume it — and unlike
D20-1 through D20-4, that is a property of the catalogue rather than an
un-run rollout. It is stated here so acceptance records it: what ships is *the
contract and its default*, exercised by its own suite and by Pro
TASK-R5-P2, not adoption across 144 components.


### A7. An eleventh concern: the URL policy (TASK-R2-O4, 2026-09-18)

08-11 doc 06 asks for a URL/DOM policy on the navigation sinks. TASK-N1-O5 then
**measured** that none existed anywhere in `packages/core/src` — no scheme
check, no allowlist, no normalization — and that all nine `url-scheme` corpus
fixtures reached the rendered `href` verbatim on all six navigation-sink
components: **54 measurements**, severity high, recorded as `S1`–`S12` in
`packages/core/security/security-deviations.json` and as finding U1 in
`packages/core/security/url-boundary.threat-model.md` §2a. It reported rather
than fixed, because refusing `javascript:void(0)` is a public-behaviour change.
This amendment is the fix.

**`urlPolicy` is the eleventh concern by §1's count** — the nine keys plus
theme, plus A6's sanitizer — and the *twelfth* by the composables barrel's,
which counts `useDzTheme` as one of its readers. Both numbers are in the source
and neither is wrong; they count different lists.

`DZ_URL_POLICY_KEY` lives in
`@dzup-ui/contracts`; `useDzUrlPolicy()` in Core; `DzProvider`'s `urlPolicy`
prop is the one writer. Default allowlist:
`http`, `https`, `mailto`, `tel`, `sms`, plus every relative, query and fragment
URL — those carry no scheme and resolve against the document the host already
served. Everything else is refused.

**Four properties, and each is a decision rather than an implementation detail.**

1. **An allowlist, not a denylist.** A denylist is a list of the attacks
   somebody thought of; `javascript:` alone is four evasions wide, and the next
   scheme a browser ships is admitted by default. An allowlist is wrong in the
   direction where a legitimate scheme is visibly refused until a host adds it.
2. **The decision is made after WHATWG normalization** (§4.4: strip leading and
   trailing C0 controls and spaces, remove tab/LF/CR from anywhere, compare the
   scheme case-insensitively). A check written as `startsWith('javascript:')`
   closes one of the four evasions the corpus carries and admits the other
   three, which is exactly the shape of a security control that tests green.
3. **A rejected URL is omitted, never rewritten.** Every one of the six keeps
   the non-link branch it already had, so the element degrades instead of
   disappearing: `DzButton`, `DzMenuItem` and `DzSidebarItem` render their
   `<button>` and still emit `click`; `DzBreadcrumbItem` renders its
   `<span role="link">`; `DzAnchor` renders the same `<a>` with no `href`, which
   by definition is not a link. Rewriting to `#` or to `javascript:void(0)`
   would produce a control that looks operable and is not — a worse failure
   than refusing to draw a link, and one nothing except a click can see. The
   element carries `data-state="url-rejected"`, declared in each anatomy, so a
   consumer can style it and a test can assert it.
4. **The escape hatch is the provider, once.** `urlPolicy.allow` receives the
   library's own verdict as `allowedByDefault`, so widening is one line that
   cannot accidentally disable the base policy, and narrowing is the same line
   inverted. A per-component opt-out prop was rejected: it re-opens the hole for
   exactly the consumers most likely to reach for it, one call site at a time,
   with no central record of where.

**The asymmetry with A6 is deliberate.** `DZ_SANITIZER_KEY` has a `null` arm
meaning "the host said it would supply one and did not"; `DZ_URL_POLICY_KEY` has
none. A URL policy has no such state, because the library's answer with nothing
configured is the **strict** one — a tree that forgot its provider is the strict
tree, not the open one, and a key whose absent value is the safe value cannot be
switched off by forgetting something. Nesting still folds per field: a nested
provider narrowing `allowedSchemes` keeps an ancestor's `allow`, which A6's
per-field fold established and which required Core to carry the resolved `allow`
beside the verdict (`DzResolvedUrlPolicy`, Core-internal).

**Consequences for §2 and for the ratchet.** `DZ_PROVIDER_DEFAULTS` grows a
`urlPolicy` key, the second growth after A6's, and for the same reason: a
defaults object that cannot describe a concern stops being the answer to "what
do I get with no provider", and Pro must resolve to the same scheme list.
Security-corpus deviations move **54 → 0**, and the ceiling moves with them, so
a regression fails the corpus rather than matching a pin.

**What this amendment does *not* claim.** It governs the **navigation** sink
only. The eight subresource sinks (`<img src>`) still pass their URL through and
still measure `inert`: no shipping engine has fetched a `javascript:`
subresource this decade, `data:image/svg+xml` in an `<img>` is script-disabled
by specification, and the residual — an unconditional GET to an origin the
page's author did not choose — is the host's `img-src` directive. No component
can decide which origins a consumer trusts, and one that tried would be useless.
`DzUrlSink` names both kinds so a host *can* opt an image sink in; the library
does not do it for them.

### What did not change

Every default in §2 **that existed before A6 and A7** (both add a key rather
than changing one), the deep-merge rule for messages in §3, the direction
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
| `packages/core/src/security/sanitize.spec.ts` | A6: escaping default is not a pass-through · ceilings enforced before parsing, length before depth · the depth scanner's over-count and under-count bypasses · per-field fold · options read at call time |
| `packages/core/src/security/url-policy.spec.ts` | A7: WHATWG normalization on all three steps · all four `javascript:` evasions · allowlist refuses what nobody has thought of yet · the provider fold, including a nested list keeping an ancestor's `allow` · rejection is omission, with neither `#` nor `javascript:void(0)` substituted · the dev warning fires once per component, prop and scheme · agreement with the corpus oracle, which keeps its own normalizer |
| `packages/core/security/url-boundary.url-policy.spec.ts` · `.malicious-corpus.spec.ts` | A7: the 54 measurements that found the gap, now asserting the REQUIRED outcome with an empty deviation register behind them |
| `yarn test:e2e:csp` | A7 and A6 §8: `DzThemeProvider` + `DzFileUpload` render identically under a real `Content-Security-Policy` header with no `'unsafe-inline'`, no un-nonced `<style>` survives, and the URL policy holds in chromium, firefox and webkit |
| `yarn validate:contract-parity` | now covers `packages/core/src/providers`, which it never did |
| `yarn validate:hardcoded-strings` | no static `aria-label` in a template and no literal default on a user-visible prop, unless a comment says why |
| `packages/core/src/i18n/i18n.spec.ts` | every catalog value equals the literal it replaced · per-key override · a non-string override falls back rather than rendering `[object Object]` · 1,000 rows construct at most one formatter per (locale, options) pair |
| Storybook Pseudo-locale toolbar | every story, every family: un-accented text is a string the catalog does not reach |
| `yarn validate:exports` · `validate:ownership` | the composables are in the generated barrel and the ownership manifest |
| `yarn validate:adr-references` | this document resolves for every `ADR-20` citation |

---

### A8. Corrections at acceptance review (TASK-R0-O2, 2026-09-22)

Seven corrections, from the acceptance packet
`docs/program-2026-09/reports/N5-05-adr-20-acceptance-packet.md` §4 and from
`docs/program-2026-09-04/reports/owner-decision-register-2026-09.md` **D181**.
Each is a correction of **fact**; none changes a decision. The one decision this
amendment does not take is the acceptance itself — see A8.7.

#### A8.1 §4 is wrong about `getTextInfo()`, on every Node floor under discussion — the **D181** correction

Decision 4 says `Intl.Locale.prototype.getTextInfo()` is *"Baseline-2023 and
unavailable across this repository's Node floor (`^20.19.0 || >=22.13.0`,
ADR-18)"*, and that *"when the floor moves past it, the list becomes a one-line
delegation."* *Alternatives considered* repeats it: *"Rejected for now —
unavailable across the supported Node range (ADR-18)."*

**The rejection is right and the reason is wrong, in a way that matters.**
`getTextInfo()` requires Node **24.0.0**. It is not unlocked by `>=22.13.0`, and
it is not unlocked by the floor the repository declares today. Measured and
recorded independently by two reports:

- `docs/program-2026-09/reports/N5-04-peer-hygiene-handoff.md` §3 (**N5-04 D3**):
  the floor should *"stop coupling the floor to the RTL list — that needs Node
  ≥ 24.0.0"*.
- `docs/program-2026-09-04/reports/TASK-R1-O6-handoff.md` §7.3 (**D176**):
  *"raising to `>=22.13.0` does not unlock `Intl.Locale.prototype.getTextInfo()`
  — that needs Node 24.0.0 — so ADR-20 §4's 'when the floor moves past it'
  prediction is wrong and must be corrected in the same amendment."*

**Read §4 and the *Alternatives considered* entry as saying this instead:** the
checked-in RTL subtag list is kept because `getTextInfo()` requires **Node ≥
24.0.0**, which is above every floor currently under consideration for ADR-18 —
the declared `^20.19.0 || >=22.13.0`, and the `>=22.13.0` that two reports
recommend. `>=24.0.0` was considered as an ADR-18 floor and **rejected**
(**D176**): Node 22 LTS runs to April 2027 and a library floor excluding it is
aggressive. So the list is not a stopgap waiting on a floor bump that is about
to happen — **it is the mechanism for the foreseeable life of this ADR**, and
§4's "one-line delegation" is a long-dated intention rather than a plan.

The corollary, recorded as ADR-18 amendment **A3**: the Node floor and the RTL
mechanism are **independent** decisions and must stop being argued as one.
Nothing in ADR-18's Decision section depends on the RTL list, and no amendment
to the floor should be justified by it.

*Custody note: D181 records that this correction "has no owner" — TASK-R0-O2's
scope as written covered acceptance and not this. D181's recommendation (a) was
to widen TASK-R0-O2 to carry it, on the ground that "accepting an ADR whose §4
is known wrong makes the acceptance itself unciteable". That is what this
sub-amendment does. The Node floor itself is **not** decided here; see ADR-18
amendment A1.*

#### A8.2 The motion policy has consumers now — packet D20-1 is falsified

The packet's most consequential finding was that **`useDzMotion` had zero `.vue`
consumers**, so a host setting `motion="reduced"` changed nothing anywhere, and
it recommended amending §7 to say the policy was *"specified and unadopted"*.

**Do not make that amendment.** `TASK-R5-O3` landed the adoption. Measured
2026-09-22 at `527dbd1` over `packages/core/src/components`: **18 components**
consume the policy — three through `useDzMotion()` (`DzAnimatedNumber`,
`DzAnchor`, `DzTour`) and fifteen through `useDzMotionAttribute()`. §7 now
describes something the catalogue partly does, and the accessibility consequence
the packet named — that §7 admits `'full'` as an override of a stated preference
while "the library pays the cost and banks none of the benefit" — no longer
holds.

#### A8.3 Adoption counts for the Consequences — packet D20-2/3/4, with today's figures

The packet asked for the adoption counts to be written into Consequences,
because without them *"the Consequences read as a description of a system in
use"*. They are recorded **here** rather than in Consequences, because the
numbers the packet measured are not the numbers today and a Consequences bullet
would simply go stale a third time. Measured 2026-09-22 at `527dbd1`, over
`packages/core/src/components` unless stated:

| Concern | Packet, 2026-09-03 | **2026-09-22** | Measured by |
|---|---|---|---|
| portal target | 18 | **18** | `useDzPortalTarget(` |
| test ids | **0** | **89** | `useDzTestIds(` |
| defaults | **1** | **23** | `useDzDefaults(` |
| direction | **0** | **19** | `useDzDirection(` |
| motion | **0** | **18** | `useDzMotion(` + `useDzMotionAttribute(` |
| messages | 40 catalog entries | **44** entries · **45** components read through `useComponentMessages` | `packages/core/src/i18n/messages.ts` |
| formats | "every `Intl` use" | **3** components call `useDzFormats(`; **0** `new Intl.` outside `i18n/intl-cache.ts` | grep |
| locale | — | **1** direct `useDzLocale(`; the rest reach locale through formats and messages | grep |
| nonce | — | **1** (`DzProvider` itself) | grep |
| sanitizer (A6) | 0 by construction | **0 by construction** — the seam exists for `@dzup-ui-pro` | A6 |

So of the packet's four "over-claimed adoption" divergences, **three are closed**
(D20-1 motion, D20-2 direction, D20-3 test ids) and **one is substantially
closed** (D20-4 defaults, 1 → 23). The residual for §6 is tracked as a
**generated** ratchet with argued exclusions rather than a hand-listed figure —
owner decision **D33**, taken as option (a) under delegation on 2026-09-17 and
recorded as **D80** in
`docs/program-2026-09-04/reports/TASK-R5-O3-handoff.md`.

#### A8.4 Rollout §4 is Done — packet D20-6

Rollout item 4 (*"**P4-04** migrates the 15 portal props to the provider
default"*) is still written as open while items 2 and 3 are struck through.
**Read it as struck through and Done.** 18 components consume
`useDzPortalTarget()` against a 15-component target; resolution is
`props.portalTo ?? dzPortalTarget.value`, matching §6 step 1 (`DzSelect.vue:84`);
and the props were **retained**, matching the Consequences line *"The props stay
— P4-04 decides their deprecation"*.

**The half P4-04 did not do is still not done:** it was chartered to decide the
deprecation of the 15 `portalTo` props and did not. That remains `[!owner]`
**D-M**; the packet's recommendation is *keep them permanently, and say so*, on
the ground that they are §6 step 1's escape hatch.

#### A8.5 §5's formatter migration is complete — packet D20-7

The Consequences bullet reads *"the five independent `Intl` construction sites
**can be** migrated one at a time to the same cache."* **Read it in the past
tense.** Measured 2026-09-22: **zero `new Intl.` constructions anywhere in
`packages/core/src` outside `i18n/intl-cache.ts`**, which holds four. The
per-frame construction in `DzAnimatedNumber.tween.ts` that the Context table
called out is gone. A clean win the document under-claims.

#### A8.6 A5's Core-component count — packet D20-8

Amendment A5 says *"Core's ~38 components are contributed by exactly the
augmentation above."* The figure has been 40 and is now **44** top-level entries
in `packages/core/src/i18n/messages.ts`. Rather than correct the literal a third
time: **the count is whatever that file declares**, and this document should
cite the file rather than transcribe a number out of it. This is the
hand-typed-facts class N2-S1 §11.3 records five prior sightings of.

#### A8.7 Status — and what is still open

This ADR remains **`Proposed`**. TASK-R0-O2 found **no recorded owner
acceptance** for ADR-18, ADR-19 or ADR-20 in any ledger, handoff or decision
register, and will not invent an owner name or a date. Since 2026-09-22 the
status is measured rather than inert: `yarn validate:adr-references` reads the
`Status:` line at the top of this file and counts this document in
`maxProposedCitedFromCode` (`packages/tooling/scripts/adr-registry.json`), which
is **3** today.

The `[!owner]` decisions acceptance still depends on, after this amendment:

| Id | Question | State after A8 |
|---|---|---|
| **N5-05 D-H** | motion: adopt · amend-and-defer · drop §7 | **Overtaken by events** — A8.2. 18 components adopt it; there is nothing left to defer |
| **N5-05 D-I** | record the adoption counts | **Done** — A8.3, with today's figures rather than the packet's |
| **N5-05 D-J** | strike Rollout §4 as Done | **Done** — A8.4. Its second half (`D-M`) is still open |
| **N5-05 D-K** | restate §5's migration as complete | **Done** — A8.5 |
| **N5-05 D-L** | should `DZ_THEME_KEY` move to contracts, **and** should `useDzTheme` stop throwing? (packet D20-5 + D20-9, Rollout §6) | **Open.** One question, not two — whether theme stops being special. Both halves unchanged in the tree |
| **N5-05 D-M** | deprecate the 15 `portalTo` props, or keep them permanently? | **Open** — A8.4 |
| **N5-05 D-N** | batch the three contracts-shape questions | **Partly closed.** Its `ariaInvalid` half (N5-02 **D1**) was completed by TASK-R0-O2 on 2026-09-22; `D-L`'s two halves remain |
| **N5-05 D-P** | write ADR-09 before answering D-L | **Open.** D-L proposes amending ADR-09, which has no document — it is one of the 14 in `adr-registry.json` |
| **D6** | `DZ_PROVIDER_DEFAULTS` grew a `sanitizer` key (A6) — accept the growth under a `minor`, or hold it in a second constant | **Open.** Register §3.1 |

**None of these blocks acceptance on a factual contradiction.** The packet's own
summary holds and is now stronger: ADR-20 has **no clause whose code contradicts
it** — every divergence was either the document under-claiming what shipped or
over-claiming adoption, and A8 corrects both directions. What is missing is a
signature and five genuinely open questions, four of which (`D-L`, `D-M`, `D-P`,
`D6`) the packet itself marks non-blocking.

### A9. D181 decided; the Node floor is settled *(DZUP-UI-ADR-PREP-20260926-R1, 2026-09-26)*

The owner took **D181** option (a) on 2026-09-26: the §4 correction is carried
by this ADR's acceptance review. **A8.1 is that correction**, so D181 is
discharged and no separate amendment packet is owed.

The owner also decided the Node floor, **D176**: it stays
`^20.19.0 || >=22.13.0` (ADR-18 amendment A6). A8.1's reading is unchanged by
that. `getTextInfo()` needs Node 24.0.0, which is above the kept floor, so the
checked-in RTL list stays the mechanism.

**Status.** The open questions in A8.7 (`D-L`, `D-M`, `D-P`, `D6`) are unchanged,
and A8.7 already records that none of them blocks acceptance. This ADR remains
`Proposed` until the owner accepts it; `docs/qa/adr-prep-2026-09-26/ACCEPTANCE.md`
lists the exact edit.
