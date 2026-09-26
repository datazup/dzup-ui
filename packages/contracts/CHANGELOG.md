# @dzup-ui/contracts

## 0.2.0

### Minor Changes

- 589be13: **`ariaInvalid` has left `BaseAccessibilityProps`. Sixty-six components stop declaring a validity claim they never rendered, and the prop now lives only where validity lives.**

  `TASK-R0-O2`, closing `N5-02 D1` and the removal half recorded as `D10` in
  `docs/program-2026-09-04/reports/TASK-R5-O1-handoff.md`.

  **What changed in `@dzup-ui/contracts`.** `BaseAccessibilityProps` — the
  _labelling_ base, the one a component extends when all it wants is an
  accessible name — no longer declares `ariaInvalid`. `BaseValidationProps`
  declares it, beside `invalid`, `error` and `required`, which is the same claim.
  `TASK-R5-O1` added it there on 2026-09-04 and deliberately left the old
  declaration in place so that step was additive; this is the other half.

  **Why.** Validity is a form-control concern. Declaring it on the labelling base
  handed a validity claim to every component that wanted a name, and the library
  measured the result: **98 components declared `ariaInvalid` and 32 forwarded
  it.** The other 66 accepted the binding, type-checked it in your source, and
  rendered nothing — the same defect class as
  `.changeset/nine-aria-props-that-did-nothing-are-gone.md`, at eleven times the
  size. Six points of use had already written
  `Omit<BaseAccessibilityProps, 'ariaInvalid'>` to take the prop back by hand.

  **The 66 components that lose `ariaInvalid`:**

  `DzAccordion`, `DzAffix`, `DzAlert`, `DzAnchor`, `DzAnimatedNumber`,
  `DzAvatar`, `DzBackTop`, `DzBlockUI`, `DzBreadcrumb`, `DzButton`, `DzCalendar`,
  `DzCarousel`, `DzChip`, `DzCollapse`, `DzColorModeToggle`, `DzCommandPalette`,
  `DzContainer`, `DzContextMenuContent`, `DzCountdown`, `DzDataGrid`,
  `DzDataView`, `DzDeferredContent`, `DzDescriptions`, `DzDialogContent`,
  `DzDivider`, `DzDropdownMenuContent`, `DzFab`, `DzFlex`, `DzImage`,
  `DzImageComparison`, `DzInfiniteScroll`, `DzLightbox`, `DzList`, `DzListItem`,
  `DzMasonry`, `DzMegaMenu`, `DzMenu`, `DzMeterGroup`, `DzNotification`,
  `DzOrderList`, `DzPagination`, `DzPanel`, `DzPopconfirm`, `DzProgress`,
  `DzQRCode`, `DzRelativeTime`, `DzResizable`, `DzScrollArea`, `DzScrollProgress`,
  `DzSegmented`, `DzSheetContent`, `DzSidebar`, `DzSidebarItem`, `DzSpeedDial`,
  `DzSplitButton`, `DzSplitter`, `DzTable`, `DzTag`, `DzTimeline`,
  `DzTimelineItem`, `DzToast`, `DzToggleButton`, `DzToolbar`, `DzTour`, `DzTree`,
  `DzWatermark`.

  **No component gains a prop**, and the 32 that forward `aria-invalid` keep it
  unchanged. Twenty-five of those reach it through `BaseValidationProps` or
  `BaseFormControlProps`. Seven forward the attribute without being validation
  components and now declare the single prop on their own interface — `DzCard`,
  `DzCheckbox`, `DzCheckboxGroup`, `DzInputGroup`, `DzRadio`, `DzRadioGroup`,
  `DzSwitch`. They did **not** gain `BaseValidationProps`, because that base also
  carries `invalid`, `error` and `required`, and those seven read none of the
  three: they resolve invalidity from the enclosing `DzFormField`. Adding three
  props nothing reads would have recreated the defect this change removes.

  **Why this is a `minor` and not a `patch`.** `packages/contracts/VERSIONING.md`
  §3: removing a declared prop is a type removal, and a prop that did nothing at
  runtime still type-checked in consumer source, so deleting it stops that source
  compiling. Under the 0.x mapping in §1 a break goes in the minor position,
  where `^0.x` does not carry it into an unattended install.

  **What you will see if you were passing one.** The binding no longer resolves
  to a prop, so Vue routes it into `$attrs`, and these components spread `$attrs`
  onto their root — so `aria-invalid` now _renders_, on an element with no role to
  carry it. That is a different wrong answer from the old silent swallow. **The
  six components in the N5-02 removal emit a one-time dev-mode warning for this;
  these 66 do not** — adding 66 warnings was judged out of proportion to the
  change and is recorded as an open decision (`TASK-R0-O2` D190). Nothing warns
  you; the migration table below is the whole story.

  **Migration.** Delete the binding, or move it to the element that owns the
  validity:

  | Was                                                                   | Now                                                                                   |
  | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
  | `<DzButton :aria-invalid="hasError">`                                 | the field is invalid, not the button that submits it                                  |
  | `<DzPanel>` / `<DzContainer>` / `<DzFlex>` and the other layout boxes | put `aria-invalid` on the field inside                                                |
  | `<DzTable>` / `<DzDataGrid>` / `<DzDataView>`                         | the editable cell's control carries it                                                |
  | `<DzToast>` / `<DzAlert>` / `<DzNotification>`                        | a status message is not an invalid input; use `role="alert"`, which these already set |
  | any of the 66                                                         | bind `invalid` on the control, or wrap it in `DzFormField`                            |

  If you genuinely need the attribute on one of these roots, it still reaches the
  DOM through `$attrs` — that is now an explicit escape hatch rather than an
  accident, and it is the only behaviour in this change that did not exist before.

  **`@dzup-ui/codemods` has no delivery path** for a `rename-props` transform
  covering this removal, for the reason
  `.changeset/nine-aria-props-that-did-nothing-are-gone.md` already records: the
  package is public and publishable but sits on the changesets `ignore` list
  (owner decision `N5-01 D2`, `packages/tooling/scripts/release-policy.json`).
  The table above is the migration.

  **Regenerated with this change**, all four bound to the same sources:
  `packages/core/docs/component-meta.json`, `llms.txt`, `llms-full.txt` and the
  144 generated docs pages under `apps/docs/components/`.
  `yarn validate:form-readiness` stays green at 0 gaps.

- a01965f: **An application can now install one HTML sanitizer for the whole library, and gets a safe one until it does.**

  `DzProvider` grows a tenth concern, `sanitizer` — the seam 08-11 doc 06 asked
  for and `@dzup-ui-pro/pro` has been blocked on since its security packet
  (`docs/security.md` §10: _"No shared sanitizer provider. Each component resolves
  DOMPurify itself; a consumer cannot supply one organisation-wide adapter."_).
  Pro could not solve it on its own side: ADR-20 §9 forbids a second provider, and
  it is right to.

  ```vue
  <DzProvider :sanitizer="{ sanitize: html => DOMPurify.sanitize(html) }">
  ```

  **The default escapes rather than passing through.** Set nothing and rich
  content renders as visible text. That is deliberate and it is the whole
  argument: a pass-through default is the vulnerability the seam exists to remove,
  and it fails in the direction where nothing looks wrong until it is. Bundling a
  sanitizer was the other option and would have put a parser and an allowlist into
  every consumer's bundle for a library that renders no HTML of its own — Core has
  **zero** `v-html` and `innerHTML` sinks, and all fifteen of its
  `SecurityBoundary` declarers are URL or payload boundaries. Escaping is safe
  with no dependency, identical on a server and in a browser, and _visibly_ wrong
  when it is wrong, which is the only kind of wrong a security default should be.

  **The ceilings belong to the seam, not to your adapter.** The commonest
  installation is one line handing over `DOMPurify.sanitize`, so requiring every
  host to re-derive an input bound is how the bound comes to be missing.
  `useDzSanitizer()` applies `maxLength` and `maxDepth` **before** anything parses
  and throws `DzSanitizeLimitError`. The numbers — 128 KiB and depth 64 — are
  carried over from Pro's measurement rather than re-guessed: the cost is in the
  HTML parser, not in the sanitizer's walk, and depth and length multiply, so the
  pair bounds the amplification an attacker can construct rather than the size of
  a document. The depth guard is a scanner, never a parse, because the parse is
  the cost being bounded.

  **Three states, not two.** Omitting the prop means "nobody configured one" and
  resolves to the escaping default. Passing `null` means "the host will supply
  one", and if nothing then does, `useDzSanitizer()` throws in development — a
  configuration mistake should not turn into a rendering difference nobody looks
  for. Production falls back to escaping either way.

  **Nesting works per field.** `<DzProvider :sanitizer="{ limits: { maxDepth: 8 } }">`
  inside a provider that installed DOMPurify keeps DOMPurify and tightens only the
  ceiling, and a provider mounted to change the locale leaves an application's
  sanitizer exactly as it found it.

  `DzSanitizerAdapter`, `DzSanitizeContext`, `DzSanitizeLimits`,
  `DzSanitizerOptions`, `DzSanitizeSink`, `DzObjectUrlSink`, `DZ_SANITIZER_KEY`
  and `DzSanitizeLimitError` are exported from `@dzup-ui/contracts`, so Pro and
  your own components resolve the same policy through the same symbols without
  importing Core's runtime. The sink vocabulary is Pro's registry vocabulary
  verbatim — `markdown`, `mermaid-svg`, `notebook-output`, `diff-highlight`,
  `rich-text-paste` — with the three object-URL contexts typed apart so
  `sanitize(html, { sink: 'download-blob' })` cannot be written by accident.

  `DZ_PROVIDER_DEFAULTS` gains a `sanitizer` key. It is the first field that
  object has grown since ADR-20 published it, so it is called out rather than
  buried: code comparing against the whole object sees a new key. Recorded as
  ADR-20 amendment A6.

- 527dbd1: **Six navigation components stop rendering a hostile URL as a live link.**

  `DzButton`, `DzAnchor`, `DzBreadcrumb`, `DzMenu`, `DzSidebar` and `DzMegaMenu`
  put whatever `href` they were given straight into the DOM. Measured, not
  inferred: all nine `url-scheme` fixtures in the security corpus reached the
  rendered `href` **verbatim** on all six components — 54 measurements, severity
  high, recorded as `S1`–`S12` in
  `packages/core/security/security-deviations.json`. A `javascript:` URL from
  whatever populates a menu, breadcrumb, sidebar or anchor list — a CMS row, an
  API navigation tree, a user profile, a model response — executed **in your
  origin, with your cookies**, on an ordinary click.

  There is now one URL policy, and it is on by default.

  ```vue
  <!-- renders a <button>, not a link; `href` is not in the DOM -->
  <DzButton href="javascript:void(0)" @click="save">Save</DzButton>
  ```

  **This is a breaking change, and it is the point.** `javascript:void(0)` is a
  widespread legacy idiom in exactly these item-list props. It renders today and
  it does not after this release. Under `packages/contracts/VERSIONING.md` (0.x:
  minor = breaking) that is a `minor`.

  **Migration.** Every component keeps the non-link branch it already had, so a
  refused URL degrades rather than disappears: `DzButton`, `DzMenuItem` and
  `DzSidebarItem` render their `<button>` and still emit `click`;
  `DzBreadcrumbItem` renders its `<span role="link">`; `DzAnchor` renders the same
  `<a>` with no `href`, which is not a link. So the common case —
  `href="javascript:void(0)"` beside a `@click` handler — keeps working as a
  button. If you were relying on the URL itself running, move the code into the
  click handler. If a scheme you legitimately need is refused, widen the policy
  once at the provider (below) rather than per call site.

  **The allowlist.** `http`, `https`, `mailto`, `tel`, `sms`, plus every relative,
  query and fragment URL, which carry no scheme and resolve against the document
  you already served. Everything else is refused — `javascript:`, `vbscript:`,
  `data:`, `file:`, `blob:`, and every scheme nobody has thought of yet. An
  allowlist is wrong in the safe direction; a denylist is a list of the attacks
  somebody remembered.

  **A refused URL is refused, never rewritten.** The attribute is omitted and the
  element carries `data-state="url-rejected"`, which you can style and a test can
  see. Rewriting to `#` would produce a control that looks operable and is not,
  which is a worse failure than refusing to draw a link, and is invisible to
  everything except a click. Development builds warn once per component, prop and
  scheme — once, because a hostile menu is a _list_ of them and a warning per row
  is a warning nobody reads.

  **The decision is made after WHATWG normalization**, not on the raw string: the
  URL parser strips leading and trailing C0 controls and spaces, removes tab, LF
  and CR from anywhere in the input, and compares schemes case-insensitively. A
  check written as `startsWith('javascript:')` closes one of the four evasions the
  corpus carries and admits the other three.

  **One escape hatch, at the provider.**

  ```vue
  <DzProvider :url-policy="{ allow: (url, ctx) => ctx.allowedByDefault || url.startsWith('slack:') }">
  <DzProvider :url-policy="{ allowedSchemes: ['https'] }">
  ```

  `allow` sees the library's own verdict, so widening is one line that cannot
  accidentally disable the base policy, and narrowing is the same line inverted.
  There is deliberately **no per-component opt-out prop**: it would re-open the
  hole for exactly the consumers most likely to reach for it, one call site at a
  time and with no central record. Nesting folds per field — a nested provider
  narrowing `allowedSchemes` keeps an ancestor's `allow`.

  **Forgetting the provider gives you the strict policy, not an open one.** The
  key has no `null` arm, unlike the sanitizer: a policy whose absent value is the
  safe value cannot be switched off by forgetting something.

  `DzUrlPolicy`, `DzUrlPolicyOptions`, `DzUrlPolicyContext`, `DzUrlSink`,
  `DZ_URL_POLICY_KEY` and `DZ_ALLOWED_URL_SCHEMES` are exported from
  `@dzup-ui/contracts`, and `useDzUrlPolicy()` from `@dzup-ui/core`, so Pro and
  your own components resolve one policy through the same symbols.
  `DZ_PROVIDER_DEFAULTS` gains a `urlPolicy` key. Recorded as ADR-20 amendment A7.

  **Also in this release: `securityBoundary` is a set.** A component can cross two
  boundaries and one does — `DzQRCode` encodes an arbitrary `value` into a
  machine-readable code _and_ renders a host-supplied `icon` as an `<img src>`.
  With a single value it declared `payload` and its URL sink was invisible to the
  capability matrix while being asserted in the corpus. `ComponentQuality
.securityBoundary` and the `securityBoundary` field of `quality-matrix.json`,
  `capability-matrix.json` and `component-meta.json` are now arrays
  (`["url","payload"]`, `["none"]`). If you read those artifacts, that is a shape
  change.

- 8d80bc3: Evidence by risk tier: every public component now says what it owes, and one page says what it has (TASK-OSS-P5-01…06).

  **`@dzup-ui/contracts`** gains `quality-tiers`: the tier→evidence rules, the WCAG
  2.2 catalog a component library can actually fail, the APG pattern vocabulary,
  and `SecurityBoundary` — a second axis so a `DzButton` with an `href` owes a URL
  policy without owing a data grid's performance baseline.

  **`RiskTier` was inverted and is now corrected.** TASK-OSS-P3-02 introduced the
  field with `A` as the highest risk and `D` as structural layout, which is the
  opposite of the 2026-08-11 reassessment it was implementing and of every P5
  packet that consumes it. The scale is now ascending — `A` presentational, `B`
  interactive primitive, `C` composite, `D` security or data boundary — and the
  eight declarations written against the old reading were migrated. Read any
  `riskTier` predating this change as the mirror of the current scale.

  **`DzFileUpload` now enforces `accept` and `multiple` on the drop path.**
  `:accept` and `:multiple` on `<input type="file">` constrain the operating
  system's picker and have no effect on a drop — `DataTransfer.files` arrives
  unfiltered. A control rendering "Accepted: image/\*" beneath its drop zone would
  take a dropped `.exe` into `v-model` and emit `upload` with no `error` event.
  Both are now checked in `processFiles`, where the picker and the drop zone meet.
  An application relying on the old behaviour will start receiving `error` events
  it previously did not.

  Also adds: a component anatomy for `DzFileUpload`, its threat model and
  hostile-input corpus under `packages/core/security/`, and its SSR sample.

- a01965f: **All six cascade layers are declared, so a consumer override wins by contract instead of by accident.**

  ADR-19 §2 decided six layers — `@layer dz-reset, dz-tokens, dz-base,
dz-components, dz-utilities, dz-overrides;` — and its Consequences promised that
  _"consumers gain `dz-overrides` immediately as a documented place to write, with
  no library change required"_. Three of the six existed nowhere. `dz-reset`,
  `dz-utilities` and `dz-overrides` were named by the ADR and emitted by nothing.

  The promise still appeared to hold, which is the part worth explaining. An
  **unregistered** layer sorts after every registered one, so a consumer writing
  `@layer dz-overrides { … }` did win — not because the library said so, but
  because nothing had claimed the name. That would have stopped being true the
  first time the library registered any layer after `dz-components`, silently, in a
  consumer's build, with no error anywhere.

  ```css
  /* your stylesheet, imported after the dzup ones */
  @layer dz-overrides {
    .dz-tab-close-btn {
      opacity: 0.5;
    } /* wins. no !important. */
  }
  ```

  **The statement ships in both stylesheets, and it has to.** CSS registers a layer
  at its _first_ appearance. `tokens.css` used to open `@layer dz-tokens` without
  declaring the order, so if a bundler emitted it before `core.css`, `dz-tokens`
  registered ahead of `dz-reset` and the shipped order depended on emit order.
  Both sheets now carry the same six-slot statement; `base.css` remains the single
  statement the docs evidence layer reads.

  **Box-model and document normalisation moved from `dz-base` into `dz-reset`,**
  which is where ADR-19's own table always put them. Nothing else in the library
  sets `box-sizing`, `margin` on `body`, or `scroll-behavior`, so no shipped
  selector changed weight — but a consumer now has the layer the ADR promised for
  resetting the reset.

  **One limit, measured and asserted rather than smoothed over.** A consumer sheet
  that opens `@layer dz-overrides { … }` _before_ the dzup stylesheets are
  evaluated registers that layer first; the library's statement then appends
  `dz-reset … dz-components` after it, `dz-components` wins, and the override
  silently does nothing. Repeating the statement in both sheets does not fix it and
  nothing the library ships can — it cannot make a declaration appear before a
  sheet that loads earlier. Import the dzup stylesheets first, or use unlayered
  CSS, which beats every library layer in either order. `yarn test:e2e:layer-order`
  asserts all of this in chromium, firefox and webkit **against the packed
  tarballs**, because what a consumer receives is the built artifact and every step
  between source and artifact can drop a layer statement.

  **What can break, and what to do.** This is a `minor` because two placements
  of consumer CSS that used to win now lose. Both were measured in Chromium and
  Firefox against the packed tarballs of this release and of the one before it,
  in both stylesheet emit orders (`docs/qa/changeset-audit-2026-09-26/REPORT.md`):
  - **Rules you wrote inside `@layer dz-reset`.** The library used to leave that
    name unregistered, so your `dz-reset` layer was appended last and beat
    `dz-components` and `dz-tokens`. It is now the first, lowest layer, as ADR-19
    §2 decided, and those rules lose. Move them to `@layer dz-overrides`, or make
    them unlayered.
  - **Reset overrides inside `@layer dz-base`, in a sheet loaded before the
    dzup stylesheets.** `box-sizing`, `body` margin and font, and
    `scroll-behavior` moved from `dz-base` to `dz-reset`. A `dz-base` rule that
    loads first now loses to them. Load the dzup stylesheets first, or move the
    rule to `dz-overrides`.

  Unlayered CSS, `@layer dz-overrides`, `dz-components`, `dz-utilities` and a
  layer of your own name behave exactly as before, in every position.

  **`data-state` is no longer typed by a union a shipped component violated.**
  `DataAttributes['data-state']` was typed `DataState`, a closed eight-value list;
  `DzButton` has emitted `idle | loading | disabled` — none of the three — since it
  shipped. ADR-19 §4 decided the widening and it had not been performed. It is now:
  the attribute is `string`, and `DataState` stays as the _named vocabulary_ to
  draw from where it fits. If you were assigning `DataAttributes['data-state']`
  into a `DataState`-typed variable, that no longer narrows on its own — read the
  component's own `states` array, which is where the constraint moved.

  The constraint is real rather than nominal because the check moved with it:
  `yarn validate:anatomy-parts` now reads every `data-state` literal a template can
  produce and fails when the component's anatomy does not declare it. Measured at
  the widening: zero violations across all 32 components that declare an anatomy.

  **Seven part names joined the shared vocabulary and seven were kept deliberately
  outside it.** `validate:anatomy-parts` had been reporting 14 shipped names beyond
  the original 30 — the mechanism ADR-19 §3 specified, working. `clear`, `toggle`,
  `filename`, `language`, `body`, `row` and `cell` name jobs that recur and are now
  vocabulary. `copy-button`, `line-number`, `decrement`, `increment` and the three
  `options-*` names are recorded in the new `ANATOMY_PART_EXTENSIONS` export with a
  reason each, so a reviewed extension is distinguishable from a name nobody has
  looked at. **Nothing was renamed** — renaming a shipped part name is breaking,
  which is exactly why the review happened now.

  **`ariaInvalid` gains its correct home on `BaseValidationProps`,** beside
  `invalid`, `error` and `required`. It is still declared on
  `BaseAccessibilityProps`, deprecated, so this release changes no component's prop
  surface; removing it there is the breaking half and ships on its own.

  **A vendor sublayer registry, empty on purpose.** ADR-19 §3 keeps Reka internals
  out of the parts contract; nothing said the same about a `[data-reka-*]`
  _selector_ inside `@layer dz-components`, which is the same bet on somebody
  else's markup with none of the visibility.
  `packages/core/src/styles/vendor-registry.json` records selector, owner, reason
  and exit condition, and `yarn validate:vendor-sublayers` fails on an incomplete
  entry, on an entry whose rule was deleted, and on a vendor-shaped selector with
  no entry. It ships with **zero** entries, measured rather than assumed — the only
  contact with Reka is a custom property the library reads — which is precisely why
  the third rule is there.

### Patch Changes

- 2d51eec: **Counts pluralise by the locale's rules, the message catalog can finally be imported, and locale packs have a format and a gate.**

  **Five components built their plurals by concatenation** —
  `` `${n} tag${n === 1 ? '' : 's'}` `` in `DzTagsInput`, and the same shape in
  `DzCountdown`, `DzDataView`, `DzMention` and `DzRating`. That is English's two
  forms and nobody else's: Bosnian has a `few` form, Arabic has six categories,
  French puts `0` in the singular. None of those strings was in the catalog either,
  so no application could translate them at all. They are now 13 catalog keys
  written in a documented subset of ICU MessageFormat and selected by
  `Intl.PluralRules`:

  ```vue
  <DzProvider
    locale="bs-BA"
    :messages="{ DzTagsInput: { count: '{count, plural, one {# oznaka} few {# oznake} other {# oznaka}}' } }"
  >
  ```

  **English output is unchanged, with two deliberate exceptions.** Numbers are
  formatted for the locale, so a count from 1,000 gains its grouping separator
  (`1,234 items`); and `DzDataView`'s paged announcement said _"of 1 items"_ — it
  now says _"of 1 item"_. A host translation that does not parse, or names an
  argument the component does not pass, renders the English default instead of
  breaking the component, and warns once in development.

  **New: `useDzMessageFormat()`**, the same formatter for code outside Core's
  components — a Pro component's own count-bearing keys, or an application's.
  Argument values are data: a value containing `{`, `#` or `<` is inserted as text,
  never read as syntax, and never becomes markup.

  **New in `@dzup-ui/contracts`:** `DzMessage<Args>` (a typed catalog string —
  formatting `DzTagsInput.countOfMax` without a numeric `max` is a type error),
  `DzMessageArgsOf`, `DzMessageKey`, `DzLocalePack`, and `DzInstant` /
  `DzPlainDate` / `DzPlainTime`, which name the date semantics each component
  follows.

  **The catalog is reachable from the package.** Until now `enMessages` and Core's
  `DzMessageCatalog` augmentation were unreachable by every path the package
  exposes: a translator could not obtain the strings, and a consumer's TypeScript
  saw an empty catalog. Now:
  - `@dzup-ui/core/i18n` — `useDzMessageFormat` and the catalog types; the root
    entry's declarations reference the augmentation too.
  - `@dzup-ui/core/i18n/locales/en.json` — the complete English catalog as a
    locale pack, `import en from '@dzup-ui/core/i18n/locales/en.json' with { type: 'json' }`.

  **Locale packs are JSON data** (`{ locale, direction, fallback, messages }`), so
  a translation tool can edit them and no pack can enter a JavaScript import graph
  — a consumer who never imports a language never ships it. `yarn
validate:i18n-packs` requires every catalog key to be translated **or listed as an
  explicit fallback**, every translation to parse and read the same arguments as
  English, and a pack's declared direction to agree with the locale. A `de` pack is
  **scaffolded, not translated** — no machine translation is shipped — and is not
  published until a translator fills it. `packages/core/docs/i18n.md` has the
  syntax, the contribution path and the semantics table.

  **Fixed: `DzTimePicker` could display the wrong time.** A time of day is a plain
  value, but it was formatted through a local-zone `Date` merged with the host's
  `formats.date` defaults — so an application that set a `timeZone` default (the
  usual way to make server and browser agree) showed 09:05 as 22:05 to a user in
  Sarajevo under `Pacific/Kiritimati`. A plain time is now formatted in UTC from a
  UTC value, so no host zone can move it. Nothing changes for an application that
  sets no zone.

- 527dbd1: **A pane and a column can now be resized with a single pointer and no dragging, and the packages say which browsers they are built for.**

  **WCAG 2.2 SC 2.5.7 Dragging Movements was measured as not met on three
  surfaces** — `DzResizable`, `DzSplitter` and `DzTable`'s column resize. All
  three were keyboard-operable, and a keyboard path satisfies SC 2.1.1, not this
  one: the criterion is about pointer input and asks for a single pointer without
  dragging. `DzTable`'s handle was the worst of them, because `@click.stop` sat on
  it and discarded the one plain press that might have been a non-drag path.

  Each of the three now carries a **stepper pair** — one control that shrinks, one
  that grows:
  - **Nothing moves until you reach for it.** The pair is absolutely positioned
    over the gutter (or, for a column, over the header cell) and rests fully
    transparent, so it occupies no layout and paints nothing: every splitter and
    every table header looks exactly as it did, and no consuming layout shifts.
    It is revealed by hovering the gutter, by focusing the separator, or by one
    tap on a device that has no hover. The **DOM** does gain two buttons per
    handle, so a consumer's own DOM snapshot of one of these three components will
    need re-recording — that is the one thing this change asks of you.
  - **It is the same step as the keyboard.** On a splitter, a press dispatches the
    very `keydown` the arrow keys already drive, so the step is `keyboardResizeBy`
    and `Shift` is still the full sweep. On a column, both paths call one
    function: 8 px, or 24 px with `Shift`.
  - **There is no prop to switch it off.** A conformance claim a consumer can
    withdraw is not one worth publishing.
  - Each control is **24 × 24 CSS px**, the SC 2.5.8 floor, measured in chromium,
    firefox and webkit.

  New `data-part` names you can style and test against: `step-decrease` and
  `step-increase` on the resizable, splitter and table anatomies. `DzTable`'s
  column-resize handle also gains `data-part="separator"` — it has carried
  `role="separator"` all along — plus `aria-valuenow` and `aria-valuemin`, so a
  screen reader is told the width it is changing.

  Four catalog keys, so nothing is hard-coded English:
  `DzResizableHandle.shrinkPane`, `DzResizableHandle.growPane`,
  `DzTableCell.narrowColumn`, `DzTableCell.widenColumn`.

  **The packages now declare a supported-browser floor.** All six published
  packages carry a `browserslist` key naming the same range. It is not a
  preference: it is the lowest range the published CSS can be generated for, so a
  declaration below it would be a promise the build could not keep. The
  browser-support evidence page reads it out of the tree and prints, beside it,
  the engines the matrix actually drives — a browser the floor admits and no lane
  measures is named as supported by declaration and nothing more.

  This is a `patch` under `packages/contracts/VERSIONING.md`: every part, key and
  attribute above is **added**, none is removed, renamed or narrowed, and §3's
  accessibility carve-out puts a corrected rendered accessibility attribute in the
  patch position deliberately — we would rather ship the fix than hold it for a
  range bump.

- 4c9fb7a: **An application can now read locale, direction, messages, formats, portal target, motion, defaults, CSP nonce and test ids from one contract — and every component still works with none of them set.**

  `DzThemeProvider` has covered theme since ADR-09. Everything else a component
  needs from its host was a prop on that component or a string in its template.
  Measured on this checkout: **79 distinct user-visible literals** (50 static
  `aria-label` values no application can change, 29 prop defaults only a
  per-instance prop can change), **15
  components** carrying their own `portalTo`, **5 `Intl` construction sites
  across 4 files** each with their own locale or none, and no policy at all for motion,
  component defaults, CSP nonce or test ids.

  ADR-20 (`docs/adr/ADR-20-provider-contract.md`) fixes the keys, the shapes, the
  defaults and the merge rules. This release lands the **read side**; the
  `DzProvider` component that writes them is the next packet.

  **New in `@dzup-ui/contracts`: nine injection keys and their shapes**

  `DZ_LOCALE_KEY`, `DZ_MESSAGES_KEY`, `DZ_FORMATS_KEY`, `DZ_DIRECTION_KEY`,
  `DZ_PORTAL_TARGET_KEY`, `DZ_MOTION_KEY`, `DZ_DEFAULTS_KEY`, `DZ_NONCE_KEY`,
  `DZ_TEST_IDS_KEY` — plus `DzLocale`, `DzMessages`, `DzDirection`,
  `DzDirectionPreference`, `DzFormats`, `DzMotion`, `DzMotionPreference`,
  `DzDefaults`, `DzTestIds` and the documented `DZ_PROVIDER_DEFAULTS`.

  They live in the types package on purpose. An injection key is an identity: two
  packages that inject the same concern must inject the _same symbol_, or the
  child silently receives the default and the bug is invisible. Declaring them
  here is what lets `@dzup-ui-pro/*` read an application's locale **without
  importing Core's runtime**. The package stays dependency-free and tree-shakeable.

  **New in `@dzup-ui/core`: ten composables, each with a typed default**

  | Composable          | Answers                                                                                             |
  | ------------------- | --------------------------------------------------------------------------------------------------- |
  | `useDzTheme`        | the existing ADR-09 theme context, under the family's name — the one that still requires a provider |
  | `useDzLocale`       | the active BCP-47 tag (`en-US` unset)                                                               |
  | `useDzDirection`    | `'ltr' \| 'rtl'` — **never `'auto'`**, resolved from the locale                                     |
  | `useDzMessages`     | `read(path, fallback)` over a deep-mergeable catalog                                                |
  | `useDzFormats`      | cached `Intl` number/date/relativeTime/list factories                                               |
  | `useDzPortalTarget` | where overlays teleport to                                                                          |
  | `useDzMotion`       | `preference` and the resolved `reduced`                                                             |
  | `useDzDefaults`     | `resolve(component, prop, chain)` — prop → context → provider → component                           |
  | `useDzNonce`        | the CSP nonce for any style this library injects                                                    |
  | `useDzTestIds`      | `testId(name)`, off until a host names the attribute                                                |

  ```ts
  // works with no provider mounted — this is the load-bearing property
  const direction = useDzDirection() // 'ltr'
  const { read } = useDzMessages()
  read('select.noResults', 'No results found') // 'No results found'
  ```

  Nine of the ten resolve to a default and never throw. `useDzTheme` is the
  exception and is unchanged from ADR-09: it still requires a `DzThemeProvider`,
  because theme has no sensible default for an application that has not chosen
  one.

  **Nothing changes for existing code.** No component consumes these yet, nothing
  is deprecated, and no default differs from what components hard-code today.
  That is deliberate: it makes the follow-up migrations — the 79 literals, the 15
  portal props, the 9 `Intl` sites — mechanical and non-breaking, one component at
  a time.

  **Three rules worth knowing before you nest a provider**
  - Every concern **overrides** per key, except `messages`, which **deep-merges** —
    a host changing `select.noResults` must not restate the other 71 strings.
  - Direction resolves from a checked-in RTL subtag list, not
    `Intl.Locale.prototype.getTextInfo()`, which is unavailable across the
    supported Node range (ADR-18). The ADR records the delegation as intended once
    the floor moves.
  - Under SSR, motion resolves to `reduced: false` — what the CSS media query
    answers before the client knows better. The alternative hydrates
    never-animating markup into animating markup, which is a visible jump.

  The write half (`provideDz*`) is **not exported**. `DzProvider` is the one
  sanctioned writer; publishing the write half invites a second provider, and two
  providers mean two locales and two merge rules.

- 527dbd1: **A failed screen-reader run is no longer published as a pass, and risk tiers now say which AT pairings they owe.**

  The manual assistive-technology matrix resolved a component's evidence cell by
  counting run records whose `result` was not `unrun` and **never reading the
  value**. A component whose every AT/browser pairing a human had recorded as
  `fail` therefore published `state: 'pass'`. So did an all-`blocked` run, and so
  did one pairing out of six. The defect was measured — not theorised — in
  TASK-N1-O4 §6.2, and it was latent only because 0 of 534 cells had ever been
  executed: the first honest screen-reader session in this repository's history
  would have been published as a clean pass.

  It is fixed at the source. The evidence vocabulary gained a `fail` state, and
  resolution moved into one pure function with a rule that never resolves upward:
  any recorded `fail` or `partial` makes the cell `fail`; a `blocked` run makes it
  `present`; `pass` requires every task to have passed on every pairing the
  component's tier requires. A failure outranks staleness too — a failure that has
  not been re-run against newer code is still a failure, and demoting it to the
  neutral-reading `stale` would launder it exactly as `pass` did.

  **New in `@dzup-ui/contracts`:** `TIER_AT_PAIR_INCREMENT` and
  `requiredAtPairs(tier)` — which AT/browser pairings a risk tier requires,
  accumulated from Tier A upward so that Tier D ⊇ Tier C ⊇ Tier B is a property of
  the data rather than a rule to remember. Tier B owes NVDA + Firefox; Tier C adds
  JAWS + Chrome and VoiceOver + Safari; Tier D owes all six. Previously there was
  no differentiation at all, so the one component in the catalog whose primary job
  is a data boundary owed exactly what a badge owed.

  **This narrows nothing.** The scaffold still carries a row for all six pairings
  on all 89 Tier B–D components — 534 cells, unchanged — because an unrun cell has
  to stay visible. The tier table only says which cells hold a component's evidence
  state hostage, and both numbers are always reported together.

  Run records also gained a `task` column, so a result can finally say which of the
  component's tasks it is evidence about; the scaffold had instructed testers to
  "append one row per {task, pair}" since the day it shipped, with no column to put
  one in.

- 4c9fb7a: **Components can now declare what a consumer may address, and five of them do: parts, states, and a typed per-part `ui` override.**

  Until now the only sanctioned way to restyle a dzup-ui component was a design
  token or the `class` on its root. Anything else — a spinner inside a button, the
  error message under an input, a dialog's backdrop, a select's portaled listbox —
  was reachable only by writing a descendant selector against class names that
  `tailwind-variants` generates and is free to change. Those selectors worked
  until they didn't, and nothing told anyone when they stopped.

  ADR-19 (`docs/adr/ADR-19-public-styling-contract.md`) makes that surface
  explicit. This release lands the machinery and the first five components.

  **New in `@dzup-ui/contracts`**
  - `ComponentAnatomy` — a component's declared parts, states, component tokens,
    recipe axes and risk tier.
  - `ANATOMY_PART_VOCABULARY` — the shared part names, so `content` means the same
    thing on a dialog and on a popover.
  - `AnatomyPart<A>` and `UiOverrides<A>` — derived types that make a part name a
    compile error rather than a class that lands nowhere.

  **New in `@dzup-ui/testing`**
  - `expectAnatomy(wrapper, anatomy)` — asserts the rendered DOM emits every
    declared part exactly once (or is declared optional) and no undeclared one.
    Runner-independent, and it takes the anatomy structurally, so the package
    needs no dependency on `@dzup-ui/contracts`.

  **New in `@dzup-ui/core`: `data-part` and `ui` on five components**

  | Component          | Parts you can now address                                                                                           |
  | ------------------ | ------------------------------------------------------------------------------------------------------------------- |
  | `DzButton`         | `root`, `spinner`                                                                                                   |
  | `DzInput`          | `root`, `control`, `input`, `prefix`, `suffix`, `spinner`, `clear`, `error`                                         |
  | `DzSelect`         | `root`, `trigger`, `icon`, `content`, `viewport`, `input`, `item`, `item-indicator`, `item-label`, `empty`, `error` |
  | `DzDialogContent`  | `overlay`, `content`, `header`, `viewport`, `footer`                                                                |
  | `DzTable` (family) | `root`, `content`, `title`, `header`, `body`, `row`, `cell`, `footer`                                               |

  ```vue
  <!-- before: a selector against a generated class, and a prayer -->
  <style>
  .my-form .inline-flex > svg {
    height: 24px !important;
  }
  </style>

  <!-- after -->
  <DzButton loading :ui="{ spinner: 'h-6 w-6' }">Save</DzButton>
  <DzSelect :items="items" :ui="{ content: 'max-h-40', item: 'py-3' }" />
  <DzDialogContent :ui="{ overlay: 'backdrop-blur-sm' }" />
  ```

  Overrides merge through `cn()` (clsx + tailwind-merge), so a conflicting utility
  replaces the component's own rather than fighting it. **No `!important` is
  needed, and Playwright asserts that in a real browser** rather than the docs
  asserting it in prose.

  **`DzDialog` declares `parts: 'none'`** — it wraps Reka's `DialogRoot`, which is
  a provider and renders no element. That is an answer, not an omission: the
  dialog's surface is declared on `DzDialogContent`, where the nodes are.

  **Nothing is removed, and every existing override keeps working.**
  - `class` lands exactly where it always did — the button root, the input's
    visual field, the select trigger, the dialog panel, the table's scroll
    container. `ui.root` is the new way to reach an outer node.
  - `data-dz-dialog-overlay`, `data-dz-search-input` and `data-dz-no-results` are
    still emitted, now alongside `data-part` (dual-emit for one minor series;
    removing them needs a major).
  - `DzDialogContent`'s `overlayClass` still applies. It is deprecated in favour
    of `:ui="{ overlay: … }"`; both work, and `ui` takes precedence.

  **Two things this release deliberately does not claim**

  `DzSelect` and `DzTable` declare `componentTokens: []`, because they own no
  `--dz-select-*` or `--dz-table-*` custom property — they style from global
  semantic tokens. Declaring invented names would have documented override points
  that do not exist. Per-instance restyling of those two goes through `ui`.

  `DzButton` mirrors `data-tone` but not `data-variant` or `data-size`, though it
  declares all three recipe axes. Its contract spec asserts that gap rather than
  hiding it, so closing it is a visible change rather than a silent one.

  **138 of 143 public components have not declared an anatomy yet.**
  `yarn validate:ownership` reports the number against a ceiling that only
  ratchets down, and the Storybook docs say plainly, per component, when a
  component has not declared one.

- a01965f: **Components now declare what their keys do, and the documentation renders the table from that declaration instead of saying it has not been derived.**

  Until this release the library had no machine-readable keyboard contract. The one
  generated keyboard signal was the capability matrix's `keyboard-spec` cell, and
  that cell was a regular expression over the unit spec: it recorded _that_ some
  key was asserted, never _which_ key did _what_. So every one of the 144 generated
  component pages carried the sentence **"Not yet derived"** exactly where an
  accessibility reviewer looks first, and the only honest alternative would have
  been a hand-typed table that nothing could check and that would be wrong within
  a release.

  **New in `@dzup-ui/contracts`**

  `ComponentAnatomy` gains an optional `keyboard` field:

  ```ts
  export const anatomy = {
    parts: ['root', 'spinner'],
    states: ['idle', 'loading', 'disabled'],
    componentTokens: ['--dz-button-md-height'],
    keyboard: [
      { key: 'Enter', action: 'Activate the button.', wcag: ['2.1.1'], apg: 'button' },
      { key: ' ', action: 'Activate the button.', wcag: ['2.1.1'], apg: 'button' },
    ],
    riskTier: 'B',
  } as const satisfies ComponentAnatomy
  ```

  Each `KeyboardBinding` carries the key as `KeyboardEvent.key` spells it, any
  modifiers, the part or state it applies in, what it does, the WCAG success
  criteria it is the mechanism for, the APG pattern it implements, and whether it
  swaps meaning in a right-to-left document. `keyboard: 'none'` is an **explicit
  claim** that the component has no keyboard behaviour of its own — deliberately a
  different fact from the field being absent, and the two are never collapsed.

  **In `@dzup-ui/core`:** 104 components declare a contract — 393 bindings across
  85 components, plus 19 that declare `'none'`.

  **New in `@dzup-ui/testing`:** `expectKeyboardContract` / `checkKeyboardContract`
  hold a rendered component to its declaration — that every binding's context names
  a part or state the component actually declares, that no key is declared twice,
  that nothing contradicts the component's own RTL contract, and that something in
  the tree can receive a key at all.

  **What you get as a consumer.** Every component page now publishes a real
  keyboard table with WCAG and APG references per row, and the components that have
  not declared one say _"not declared"_ rather than implying they have no keyboard
  behaviour. The same declaration is what the manual screen-reader scaffolds cite,
  so a tester drives the component's promises rather than the pattern's from
  memory.

  **Two things this release makes visible rather than fixes.** `DzMenu` and
  `DzSidebar` are assigned the APG `menu` and `treeview` patterns but implement
  neither pattern's keyboard — their items are links and buttons in document order
  with no roving index — and their declarations now say so. And because
  `keyboard-spec` is measured against the declared contract instead of against any
  key at all, the number of components whose spec exercises everything they promise
  is **5**, not the 29 the old presence test reported.

- a01965f: **Every form control declares its styling surface — and five of them stop pinning things to the wrong edge in Arabic.**

  This finishes the ADR-19 rollout across the catalogue's risk-bearing components.
  `forms` was the last family and the largest: 24 more components now declare
  their parts, their states and a typed per-part `ui` override, so restyling a
  combobox's option row, a slider's thumb, a date picker's month grid or a
  transfer list's pane no longer means writing a descendant selector against a
  class name `tailwind-variants` is free to change.

  **Every Tier B, C and D component in the library now declares an anatomy.**

  **New `data-part` and `ui` surfaces**

  | Group              | Components                                                                                                                              | Parts you can now address                                                                                                                                                                                                                                                 |
  | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | Selection controls | `DzCheckbox`, `DzCheckboxGroup`, `DzRadio`, `DzRadioGroup`, `DzSwitch`                                                                  | `root`, `control`, `indicator`, `label`                                                                                                                                                                                                                                   |
  | Value controls     | `DzSlider`, `DzRangeSlider`, `DzKnob`, `DzRating`, `DzInplace`                                                                          | `root`, `control`, `indicator`, `item`, `item-indicator`, `label`, `trigger`, `content`, `icon`, `error`                                                                                                                                                                  |
  | Pickers            | `DzColorPicker`, `DzDatePicker`, `DzDateRangePicker`, `DzTimePicker`                                                                    | `root`, `control`, `trigger`, `label`, `icon`, `clear`, `content`, `panel`, `header`, `title`, `action`, `group`, `row`, `cell`, `item`, `input`, `list`, `separator`, `footer`, `indicator`, `error`                                                                     |
  | Option controls    | `DzCombobox`, `DzListbox`, `DzMultiSelect`, `DzCascader`, `DzTreeSelect`, `DzTransfer`, `DzPersonaSelector`, `DzMention`, `DzTagsInput` | `root`, `control`, `input`, `trigger`, `clear`, `icon`, `content`, `viewport`, `panel`, `list`, `group`, `group-label`, `item`, `item-label`, `item-indicator`, `body`, `header`, `hint`, `loader`, `empty`, `error`, `options-state`, `options-message`, `options-retry` |
  | Renderless         | `DzFieldArray`                                                                                                                          | `parts: 'none'` — it renders no element of its own, and now says so                                                                                                                                                                                                       |

  ```vue
  <DzCheckbox
    v-model="agreed"
    :ui="{ control: 'rounded-full', label: 'text-sm' }"
  >I agree</DzCheckbox>
  <DzSlider v-model="volume" :ui="{ indicator: 'size-5 shadow-lg' }" />
  <DzCombobox :items="items" :ui="{ item: 'rounded-lg', 'item-indicator': 'opacity-60' }" />
  <DzTransfer :source="items" :ui="{ list: 'w-72', header: 'font-semibold' }" />
  <DzDatePicker v-model="date" :ui="{ item: 'rounded-full', title: 'uppercase tracking-wide' }" />
  ```

  **The async options row is part of the contract now.** The tri-state row a
  selection control shows while its options are loading, empty or failed emits
  `options-state`, `options-message` and `options-retry`, and every control that
  renders it — `DzCascader`, `DzCombobox`, `DzListbox`, `DzMultiSelect`,
  `DzPersonaSelector`, `DzSelect`, `DzTransfer`, `DzTreeSelect` — now declares
  those three names. They were emitted and undeclared in every one of them.

  **Eight real RTL fixes, found by declaring rather than by reading.**

  `validate:rtl` reads a component's declared `rtl.mirrors` and then checks its
  source for physical utilities. Declaring these turned up geometry that promised
  to follow the reading direction and did not:
  - **`DzRating`**'s partial-star overlay was pinned to the screen's left edge and
    clipped by width, so in an Arabic document it filled the wrong half of every
    star. Now a logical inset.
  - **`DzTimePicker`**'s clear control was pinned to the screen's right edge rather
    than to the end of the field. Now a logical inset.
  - **`DzCombobox`** and **`DzMultiSelect`** positioned the option check mark and
    indented the option label physically. Now logical.
  - **`DzDatePicker`**, **`DzDateRangePicker`** and **`DzPersonaSelector`** used
    physical `ml-`/`pl-` for the calendar trigger and the persona row. Now `ms-`/`ps-`.

  **In a left-to-right document nothing moves by a pixel.** The logical properties
  compile to the same edges the physical ones did.

  **Nothing is removed and every existing override keeps working.** `ui` is a new
  optional prop on 21 components; `class` lands exactly where it always did; no
  part was renamed and no `data-state` value changed. In `@dzup-ui/contracts`, the
  three `options-*` names move from `held` to `reviewed` in
  `ANATOMY_PART_EXTENSIONS`, which is a documentation change to an already-exported
  constant.

- 4c9fb7a: **Every user-visible string the library renders is now translatable from one place.**

  Before this release, `@dzup-ui/core` shipped **54 static `aria-label` values
  across 27 components that no application could change at all** — not with a
  prop, not with a provider. An Arabic application shipped `aria-label="Clear
input"` and had no way to do otherwise. A further **39 literal defaults on
  `*Text`/`*Label`/`*Placeholder` props across 24 components** could only be
  changed one instance at a time, which is repetition rather than localisation.

  All of them now resolve through one catalog:

  ```vue
  <DzProvider
    locale="fr-FR"
    :messages="{
      DzInput: { clear: 'Effacer le champ' },
      DzSelect: { noResults: 'Aucun résultat' },
    }"
  >
    <App />
  </DzProvider>
  ```

  **Nothing changes until you supply a catalog.** Every value in the shipped
  English catalog is byte-identical to the literal it replaced — including one
  inconsistency that was deliberately _not_ tidied: `DzCascader` uses `Search…`
  (U+2026) where `DzSelect` and `DzListbox` use `Search...`. Normalising them
  would be a visible change to three components smuggled in under a refactor.

  Overrides apply **per key**, so translating `DzTimePicker.confirm` keeps the
  other ten strings that component renders.

  **New in `@dzup-ui/contracts`: `DzMessageCatalog`**, an empty interface that each
  tier augments from its own package:

  ```ts
  declare module '@dzup-ui/contracts' {
    interface DzMessageCatalog {
      DzChart: { noData: string }
    }
  }
  ```

  Core contributes its ~38 components this way, which makes the extension
  mechanism ADR-20 §9 requires of Pro **the same one Core itself uses** rather
  than a second-class hook. It also augments a package Pro already depends on:
  Pro depends inward on Core _contracts_ and must never import Core's runtime.

  **All `Intl` construction is cached, and one case was pathological.**
  `DzAnimatedNumber.tween.ts` built its `Intl.NumberFormat` _inside_ the function
  a running tween calls **once per frame** — and ECMA-402 requires locale data to
  be resolved on construction. Formatting 1,000 rows now constructs at most one
  formatter per (locale, options) pair, which is asserted rather than claimed. The
  cache moved to a module that imports nothing, so the framework-free tween
  helpers can reach it.

  **One behaviour change, and it fixes a hydration bug.** `DzAnimatedNumber`,
  `DzTimePicker` and `useRelativeTime` used to format with `Intl`'s _ambient_
  locale when given no explicit one. That is not the same value on a Node server
  as in a visitor's browser, so a server-rendered figure or a "2 minutes ago"
  could hydrate into a different language or a different group separator — a
  mismatch invisible to anyone developing in the locale their server runs in. They
  now use the application's declared locale, falling back to `en-US`.

  The pure exported helpers `formatNumber`, `formatRelativeTime` and
  `formatAbsoluteTime` keep their signatures **and** their semantics: an omitted
  `locale` still means the runtime's own. Only the composable and the components
  changed.

  **New gate: `yarn validate:hardcoded-strings`.** Fails on a static `aria-label`
  in a template or a literal default on a user-visible prop. It reads the
  `<template>` block only, so JSDoc `@example` strings — 11 of them, which the
  first inventory pass wrongly swept up — are not flagged. A line may be exempted
  with a `hardcoded-string-ok: <reason>` comment, and the reason lives next to the
  string rather than in a list somewhere else.

  **New in Storybook: a Pseudo-locale toolbar.** Renders every string accented,
  padded +30% and framed in `[!!! … !!!]`, across every story rather than a chosen
  few. Un-accented text is a string the catalog does not reach; a missing `!!!]`
  is a label that clipped. The pseudo catalog is generated from the English one,
  so a message added tomorrow is covered today.

  **Known gap, stated rather than fixed:** `DzOrderList`'s `dragHandleLabel` is
  documented as "accessible label for each row's drag handle" and **nothing
  renders it** — the handle is `aria-hidden="true"`. Its literal stays, with the
  reason in the source. Giving that handle an accessible name is an accessibility
  decision, not a codemod.

- 2d51eec: **`DzMention` and `DzPersonaSelector` can be driven by a remote option source through the same contract as the seven selection controls.**

  `TASK-R3-O3`, renderer contract C9. Additive: without `optionsState` both
  components behave as before.

  **`DzMention`** now takes `optionsState`, `optionsError` and `optionsRetryable`
  and emits `loadOptions` / `retryOptions`. Pass `optionsState` and each trigger
  token asks the host — reason `open` for a new token, `search` as the query grows,
  with an `AbortSignal` that the next request aborts — and the host writes its
  answer into the trigger's `options`. The menu shows the shared loading, empty and
  error rows (`options-state`, `options-message`, `options-retry`), and retry keeps
  focus in the text field. The `search` event still fires first and carries the
  trigger character.

  The **async resolver** form (`options: (query) => Promise<…>`) keeps working and
  now runs on the same seam: a newer query aborts the older request instead of a
  private counter, and **a rejected resolver shows the error row with a retry**
  where it used to leave an unhandled rejection and the previous list on screen.
  Its loading and no-results rows, and the `#loading` / `#empty` slots, are
  unchanged. `aria-controls` is now only set while the suggestion list is actually
  rendered.

  **`DzPersonaSelector`** declares the seam and forwards it to the `DzCombobox` it
  renders. It was reachable before only through untyped attribute fallthrough.

  `@dzup-ui/contracts`: `ANATOMY_PART_EXTENSIONS` lists `DzMention` as an owner of
  the three `options-*` part names.

- 4c9fb7a: **`DzProvider`: one component configures theme, locale, direction, messages, formats, portals, motion, component defaults, CSP nonce and test ids.**

  The previous release shipped the _read_ half of ADR-20 — ten composables with
  typed defaults that nothing could write to. This is the writer.

  ```vue
  <DzProvider
    :theme="{ default: 'system', persist: true }"
    locale="ar-EG"
    direction="auto"
    :messages="{ DzPagination: { next: 'التالي' } }"
    :formats="{ currency: 'EGP' }"
    portal="#dz-portal"
    motion="system"
    :defaults="{ DzButton: { size: 'sm' } }"
    :nonce="cspNonce"
    test-id-prefix="e2e"
  >
    <App />
  </DzProvider>
  ```

  **A prop it does not set, it does not provide.** This is the rule that makes
  nesting composable rather than destructive. An inner provider naming only the
  locale leaves the theme, the portal target and the defaults exactly as the outer
  one left them — nothing silently resets to a default because a child forgot to
  restate it. `messages` is the single exception and deep-merges, so changing one
  string does not mean restating the catalog.

  **It renders no element.** Its anatomy declares `parts: 'none'`, so it can sit
  between a flex container and its children, or inside a shadow root, without
  changing anything. The consequence is documented rather than hidden: only the
  **root** provider reflects `dir` onto `<html>`. A nested provider changes what
  `useDzDirection()` answers for its subtree and writes no attribute, because it
  has no element to write it on — scope a subtree with your own `<div :dir="…">`.

  **`DzThemeProvider` is unchanged**, and is now a thin wrapper over `DzProvider`
  with theme props only. Same four props, same ADR-09 context, same ADR-15
  persistence and `data-theme` reflection; its test suite passes untouched, which
  is the evidence. Mounting one inside the other is safe — `DzProvider` takes
  ownership of the theme only when asked to, or when nothing above it already has.

  **`getThemeScript` now writes `dir` as well as `data-theme`.**

  ```ts
  getThemeScript({ locale: 'ar-EG' }) // also sets dir="rtl" before first paint
  ```

  Direction is resolved where the string is generated rather than at runtime: it
  comes from the application's own configuration, not from `localStorage`, so
  baking it in keeps the inline script small and keeps the RTL subtag list in one
  place. With no `locale` or `direction` given the emitted script is byte-identical
  to before, so a host that has declared neither gets no opinion imposed on its
  markup.

  **`DzButton` is the first component to honour a provider default.** Precedence is
  fixed by ADR-20 §6 and is the same for every component that follows: **explicit
  prop → compound context (`DzButtonGroup`) → provider → the component's own
  default.** With no provider mounted, every one of those lines resolves exactly as
  it did before. Which components honour which axes is declared, not promised:
  `DzButton.anatomy.ts` lists `globalDefaults: ['size', 'variant', 'tone']`.

  **Also in this release**
  - The CSP nonce now reaches the transition-suppression `<style>` the theme
    injects on a switch. Without it a strict policy drops the tag silently, and the
    symptom is a colour sweep on theme change that nobody can reproduce locally.
  - `useDzTestIds().testId()` honours an optional `prefix`, so one page embedding
    two instances of an application can namespace each without every component
    learning about namespaces. `DzTestIds.prefix` is optional, so
    `DZ_PROVIDER_DEFAULTS.testIds` is unchanged.
  - New in `@dzup-ui/contracts`: `DzFormatDefaults` — the `Intl` option defaults a
    host declares (`{ currency: 'EGP' }`), as distinct from the formatters a
    component asks for. A caller's own options always win.
  - `DzProvider` and `DzThemeProvider` both declare an anatomy, and
    `validate:contract-parity` now looks inside `packages/core/src/providers`. It
    never did, which is why `DzThemeProvider` — a public component two story files
    import — had no contract spec. Both have one now.

  **Nothing existing breaks.** No component's default changed, nothing is
  deprecated, and every concern still resolves without a provider mounted.

- e986952: **All seven selection controls can now be driven by a remote option source through one contract, `DzFileUpload` can hold file references instead of binaries, and ten value codecs define the seam a form renderer binds through.**

  `TASK-FORM-OSS-03`. Clause references are to
  `docs/program-2026-08/form-control-renderer-contract.md`.

  **One async-options seam, not seven** (C9). `DzSelect`, `DzMultiSelect`,
  `DzCombobox`, `DzListbox`, `DzCascader`, `DzTreeSelect` and `DzTransfer` each
  took a static array and had nowhere to say "loading", "that failed", or "there
  is nothing to show" — so a renderer whose options come from a data source had to
  grow one adapter per control.

  They now share `AsyncOptionsProps` (`optionsState`, `optionsError`,
  `optionsRetryable`), `AsyncOptionsEmits` (`loadOptions`, `retryOptions`), one
  `useAsyncOptions` composable, and one `options-state` slot. Five states rather
  than a boolean `loading`, because a failed load and a successful one that
  returned nothing are not the same thing and a boolean cannot tell you which
  happened.

  **Core never performs the request.** No URL, no credential, no `fetch`. The
  control emits `loadOptions` with a query, a reason, and an `AbortSignal`, and
  the host owns execution, fencing and caching (form spec 04 §5, spec 06). Every
  request supersedes the last and aborts its signal _before_ emitting, so a host
  that fences on the signal never has two in flight. All of this is inert unless
  `optionsState` is passed: a control with a plain array behaves exactly as it did.

  **`DzFileUpload` gains `model-mode="ref"`** (C1). The default stays `File[]`.
  In reference mode `v-model` holds `DzFileRef[]` — `{ id, name, size, type,
status, error? }`, all JSON — and the binary reaches the host through
  `uploadRequest` instead. A form document is persisted JSON, so a `File` in the
  model is lost on reload and leaks a live handle into a builder preview.
  Removing a row that is still uploading aborts it.

  This one widens a type: `v-model` is `File[] | DzFileRef[]`, so a consumer who
  annotated their ref as `File[]` widens it to `DzFileUploadValue`. Runtime
  behaviour in the default mode is unchanged.

  **Ten value codecs**, in `@dzup-ui/contracts`: `emptyValueFor`, `isEmptyValue`,
  `toNumberValue`, `toIsoDate`/`fromIsoDate`, `toIsoTime`/`fromIsoTime`,
  `toFileRef`, `isFileRef`, `isJsonSerializable`. Pure — no Vue, no DOM, no clock,
  no locale — so they run on a server, in a test, and inside a builder preview.

  Two of them are worth reading before use. `isEmptyValue(false)` is **false**:
  an unchecked box has answered, and conflating that with absence is how a
  mandatory checkbox comes to be satisfied by never being touched.
  `toIsoDate` takes date _parts_, not a `Date`: `new Date('2026-08-24')` is
  midnight UTC and formats as the 23rd in any negative offset.

  **Where the codecs live, and why.** In `@dzup-ui/contracts`, which is types-only
  with a stated exception for `assertNever` — these are the same kind of thing.
  They also could not go in `@dzup-ui/core`: its public surface is generated from
  `public-api.manifest.json`, the ownership schema has no `utility` kind, and the
  `unclassified` ceiling of 29 only ratchets down. Ten more functions of the class
  `cn` and `themeScript` already occupy would have taken it to 39. Raising that is
  a maintainer decision, so the ledger asks for it rather than taking it.

  **Events are camelCase.** `loadOptions`, `retryOptions`, `uploadRequest` — the
  repository lints custom event names and had no kebab-cased ones before these.
  Nothing changes for a consumer: `@load-options="…"` in a template still resolves.

- 4c9fb7a: **Components lay out, navigate and point the right way in a right-to-left document — and say so in a form something can check.**

  `DzProvider` has resolved `dir` since the previous release. What it could not fix
  is CSS: **55 lines across 26 variants files used physical `left`/`right`
  utilities**, so an Arabic application got a mirrored document with borders,
  padding and text alignment still pinned to the physical left. They are logical
  now — `ms`/`me`, `ps`/`pe`, `border-s`/`border-e`, `rounded-s`, `text-start`.

  **`DzTable` is the clearest case:** its header and body cells were `text-left`,
  so every cell in an Arabic table aligned against the wrong edge while the table
  itself mirrored.

  **Tab keyboard navigation followed the keycap, not the reading order.** APG's
  tabs pattern is written as _previous_ and _next_; `useTabs` hard-coded
  ArrowRight as next. In Arabic the next tab is to the **left**, so a user
  pressing the key that points at the next tab got the previous one. The
  horizontal keys now follow the direction. The vertical keys deliberately do not:
  `dir` is about the inline axis, and ArrowUp is ArrowUp in every language.

  **New: an `rtl` field on component anatomy** (`@dzup-ui/contracts`), with three
  axes because they fail independently:

  ```ts
  rtl: { mirrors: 'layout', keyboard: 'swap-horizontal', icons: ['indicator'] }
  ```

  - `mirrors` — `layout` or a deliberate `none`
  - `keyboard` — whether ArrowLeft/ArrowRight exchange meaning
  - `icons` — parts whose icon carries direction and mirrors with the layout

  **New: `yarn validate:rtl`.** A component declaring `mirrors: 'layout'` may not
  use a physical utility in its variants. Genuinely physical cases say so in the
  file with a `rtl-physical-ok` comment and a reason — source code (a gutter that
  stays left because code reads left-to-right), `align="left"` on `DzHeading` and
  `DzText` (an author naming a side, not asking for the start edge), and
  `DzSheet`'s `side` (whether a sheet mirrors is a product decision, recorded
  rather than taken).

  **New: `packages/core/docs/rtl-matrix.md`**, generated from the declarations by
  `yarn generate:rtl-matrix` so the table cannot drift from them.

  **New in `@dzup-ui/testing`:** `expectRtl`, `checkRtl`, `expectRtlComputed` and
  `forwardArrow`. `expectRtlComputed` **throws under jsdom rather than passing** —
  jsdom does no layout, so it cannot resolve a class-driven `margin-inline-start`,
  and a test that cannot check its claim should say so instead of going green.

  **New in Storybook: a Direction toolbar** that renders every story right-to-left
  under an Arabic locale, alongside the pseudo-locale toggle.

  **Coverage, stated plainly:** 7 components declare an RTL contract, because the
  field lives in the anatomy and only 7 declare an anatomy. The logical-property
  migration covered the whole catalog regardless. The two rollouts are the same
  rollout.

- 5773f65: **The published `@dzup-ui/contracts` could not be loaded by Node's ESM resolver at all. It can now.** Any consumer whose bundler externalised it — every Nuxt app, on Nuxt 3 and Nuxt 4 alike — got a 500 on the first render.

  `TASK-N5-03`. Five re-exports in the emitted `dist/index.js` were **extensionless**:

  ```js
  export { ANATOMY_PART_VOCABULARY } from './anatomy.types' // ← Node: ERR_MODULE_NOT_FOUND
  ```

  `anatomy.types.js` is right there next to it. Node's ESM resolver does not care:
  relative specifiers in ESM must carry their extension, and `tsc` emits the
  specifier the source wrote. `packages/contracts/src` wrote extensionless ones,
  so `tsc` emitted extensionless ones, and the file describes an import that
  cannot resolve.

  The failure a consumer saw:

  ```
  Cannot find module '…/node_modules/@dzup-ui/contracts/dist/anatomy.types'
    imported from '…/node_modules/@dzup-ui/contracts/dist/index.js'
  [nitro]  ├─ / (60ms)
    │ └── [500] Server Error
  ERROR  Exiting due to prerender errors.
  ```

  **Why nothing caught it.** Every gate that loads this package resolves modules
  the way a _bundler_ does, not the way Node does: Vitest and Vite both resolve
  extensionless relative specifiers, and `tsconfig.base.json` sets
  `moduleResolution: "bundler"`, which tells TypeScript to assume the same. Two
  thousand unit tests, `typecheck:all`, `validate:exports`, `validate:dts` and
  `validate:externals` all pass against a file Node cannot open. The Nuxt consumer
  fixtures are the one lane in this repository that runs the published tarball
  through Node — and they were red, on both Nuxt majors, for exactly this reason.

  The fix is the convention `@dzup-ui/testing`, `@dzup-ui/mcp` and
  `@dzup-ui/codemods` already use: relative specifiers carry `.js`, which
  `moduleResolution: "bundler"` resolves to the `.ts` source at compile time and
  Node resolves to the emitted `.js` at runtime. 27 specifiers across 7 files;
  no type, no export and no runtime value changed.

  A `patch` under `packages/contracts/VERSIONING.md`: nothing that worked stops
  working, and something that never worked starts.

- a01965f: **Your `class` beats `ui`, `asChild` has a published allowlist, and every component that puts your attributes somewhere unexpected now says so.**

  Three composition rules existed only as prose. Nothing checked them, and one of
  the three had shipped in two contradictory versions at once.

  **The `ui` merge order is now decided and published.** ADR-19 §5 said `class`
  and `ui` "merge through the same `cn()`" but never said in which order — and
  `cn()` is tailwind-merge, so the order _is_ the answer to which one takes
  effect. Measured across the catalogue, 5 components passed `ui` first and 74
  merge sites passed `class` first: the same two props produced opposite results
  on `DzButton` and `DzCard`, and nothing said which was right.

  The ratified order is **recipe → `ui` → your `class`**, exported as
  `UI_MERGE_ORDER`. Your `class` is merged last and wins a conflict. That is what
  ADR-19 §5 promises ("`class` keeps its meaning … nothing about existing usage
  changes") and it is the rule that survives composition: when an application
  wraps `DzButton` in its own `AppButton` and sets `ui` for a house style,
  `<AppButton class="w-full">` still works instead of sending that author to
  `!important`. Every component documentation page now states the order.

  The components that merge the other way are recorded with a downward-only
  ceiling rather than quietly fixed — re-ordering a merge changes rendered output,
  so it is sequenced separately. A **new** component that merges the wrong way
  fails the contract lane immediately.

  **`asChild` has an allowlist.** `asChild` makes _your_ element the rendered
  node, so every promise about a root — the `data-part`, the recipe class, the
  focus ring — stops applying there. `AS_CHILD_ALLOWLIST` now records the eight
  components that do it, which element kinds each accepts, what each guarantees
  (semantics, attributes, ref, disabled, keyboard) and why it is allowed. A
  component cannot add itself: the list lives in `@dzup-ui/contracts`, and source
  and list are checked against each other in both directions.

  It also records one defect rather than hiding it: **`DzButton`'s `asChild` prop
  is declared and does nothing.** The template never reads it. Use `as`, `href` or
  `to` for polymorphism — those work. The prop is now marked `unimplemented` so
  the gap is counted rather than discovered by a reader of the types.

  **Anatomies can declare where your attributes land.** The new optional
  `fallthrough` field answers "where does my `class` actually go?" for the two
  shapes where the answer is not "the one root":
  - **Multi-root components** — Vue cannot choose a target for a fragment, so the
    component does. `DzKnob`, `DzSidebar`, `DzLightbox`, `DzPopconfirm`,
    `DzTableRow`, `DzToastViewport` and `DzFieldArray` now each say which node
    they chose. `DzFieldArray` declares `target: 'none'`: it renders no element of
    its own, so a `class` you pass reaches nothing — a fact worth learning from
    the contract rather than from an empty DOM.
  - **Controls that re-point `class` inward** — on `DzSlider`, `DzRangeSlider`,
    `DzRating`, `DzDatePicker`, `DzDateRangePicker` and `DzMention` your `class`
    lands on an inner part, so a width you pass applies there rather than to the
    whole component. Nothing moved; the behaviour is unchanged and now documented.

  `DzPersonaSelector` additionally declares `delegatesTo: 'DzCombobox'` — it
  renders no element of its own, and its root _is_ a combobox.

  **New testing helpers.** `@dzup-ui/testing` gains `expectUiMergeOrder`,
  `expectFallthrough`, `expectAsChild`, `expectHandlerComposition` and
  `expectExternalWrite`, alongside `expectAnatomy` and `expectKeyboardContract`.

  `expectExternalWrite` is deliberately shaped as a _trace_ rather than a
  snapshot: it requires a reading taken after a user edit, because the defect it
  exists to catch only appears after one.

## 0.1.0 (2026-08-10)

### Minor Changes

- 573f2ae: Add a shared portal-placement contract and expose it on `DzDialogContent`,
  `DzConfirmDialog`, `DzSheetContent`, `DzPopoverContent`, `DzTooltipContent`,
  `DzDropdownMenuContent`, `DzContextMenuContent`, `DzSelect`, `DzMultiSelect`,
  `DzCombobox`, `DzCommandPalette`, and `DzLightbox`. Dialog content now identifies and
  supports customizing its single owned overlay, while production portal defaults
  remain unchanged.

  Publish `@dzup-ui/testing` with guarded DOM test-environment support so
  consumers can mount real Reka-backed components instead of replacing portals or
  design-system components with stubs.

## 0.1.0-alpha.0 (2026-04-06)

### Features

- Initial alpha release of dzup-ui component contracts
- TypeScript interfaces for all public component APIs (ADR-01)
- Canonical variant and size enums shared across core and pro
- `assertNever` runtime helper for exhaustive switch checking
