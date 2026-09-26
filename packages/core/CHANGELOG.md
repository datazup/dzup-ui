# @dzup-ui/core

## 0.3.0

### Minor Changes

- 527dbd1: **A parent can take a control's value back after the user has edited it, a focus trap gives focus back when it releases, a disabled tree is disabled, and a menu's `aria-controls` points at something that exists.**

  `TASK-R2-O3` closes the defect register `TASK-N1-O1` reported and did not fix.
  Every entry below has a regression spec that failed before the change and passes
  after it; the spec title carries the defect id.

  **An external write after a user edit is honoured** (defect D8). `useDualModel`
  merges a control's default `v-model` with its legacy `v-model:value` and wrote
  to **both**. On a consumer who bound only `v-model:value` — which is every
  template written before the dual model — the default model is component-local
  state, so the first user edit latched a value into it, and from that moment
  every read preferred the latched copy and **every external write was silently
  discarded**. Resetting a form field did nothing at all. Seven public controls
  shared it: `DzCascader`, `DzInplace`, `DzKnob`, `DzMention`, `DzRating`,
  `DzTagsInput`, `DzTreeSelect`.

  The composable now remembers the value it last wrote. A model that has moved
  away from it was moved by the parent, and the parent wins — whichever model
  (or both) the consumer bound. A consumer binding the default `v-model` sees no
  change; a consumer binding `v-model:value` gets back the control of the value
  they always had in every other control.

  The whole suite was green through all of it, because every test mounted fresh
  and asserted, and on a fresh mount the composable was correct. The seven
  regression specs are written as traces — edit, _then_ write — for that reason.

  **A focus trap returns focus when it releases** (defect D7). `useFocusTrap`'s
  `deactivate()` removed its keydown listener and nothing else, so dismissing a
  `DzTour` — Skip, Escape or Finish — left focus on `<body>` instead of the
  control that opened it (WCAG 2.4.3 Focus Order). It now restores focus to
  whatever held it when the trap was activated, and skips the restore when the
  target has left the document or when something outside deliberately took focus
  as the trap closed. `useFocusTrap` gains an options argument,
  `{ restoreFocus?: boolean }`, default `true`; `DzBlockUI` and `DzPopconfirm`
  pass `false` because they already own the restore and know a better target.

  **`<DzTree disabled>` and `<DzResizable disabled>` do something** (defects D1,
  D2). Both stamped a `data-disabled` attribute on the root and stopped there,
  because the prop never reached the context their children inject: every tree row
  kept its roving `tabindex`, its click handler, its chevron and its selection,
  and every resize handle stayed focusable with Arrow keys still resizing.
  Freezing a layout required repeating `disabled` on every single handle.
  `DzTreeContext` and `DzResizableContext` each gain a `disabled: Ref<boolean>`
  member, and a child is inert when its own `disabled` **or** the group's is set.

  **A disabled combobox has no live Clear button** (defect D9). `DzCombobox`'s
  clear control had no `:disabled` binding while its sibling trigger did, so a
  disabled combobox holding a value still rendered a clickable Clear.
  `tabindex="-1"` kept keyboard users out of it; pointer and AT users were not.

  **`aria-controls` points at an element that exists** (defect D11). Five overlay
  content components bound `:id="id"` unconditionally, which handed an explicit
  `undefined` to the underlying Reka component and **overrode the content id Reka
  generates for itself**. The panel then carried no `id` at all while its trigger
  advertised one — axe `aria-valid-attr-value`, and an AT user following the
  reference found nothing. `DzDropdownMenuContent`, `DzContextMenuContent`,
  `DzDialogContent`, `DzSheetContent` and `DzCommandPalette` now bind the
  attribute only when there is one; an explicit `id` still wins.

  **`DzMention`'s `loading` prop is no longer dead** (defect D3). It was declared
  (through `BaseBehaviorProps`), defaulted in the component, and read by nothing.
  The host's answer is now ORed with the component's own resolver state, so a host
  that knows it is fetching can say so before a trigger character has been typed.

  **An ARIA attribute that only works after hydration is now a test failure**
  (defect D5, finding E6). `DzOrderList` shipped `:ariaLabel` (camelCase), which
  reaches `aria-label` in a browser through ARIA reflection and is **absent from
  server-rendered markup** — so every jsdom and Playwright assertion passed while
  the list had no accessible name until hydration. The source is already correct;
  `packages/core/tests/ssr/aria-attribute-casing-ssr.spec.ts` now gates the class,
  from both ends: a scan of every component template for a camelCase ARIA
  attribute name, and a scan of real server output with a seeded component that
  must be caught.

  **Story and tooling corrections.** Two stories asserted `role="alert"` on a form
  field's error message, which `DzFormMessage` deliberately stopped emitting in
  `e986952` — an `alert` implies `aria-live="assertive"` and would interrupt
  whatever the user was being told, so renderer contract C4 says polite. One story
  bound `:options` on a `DzSelect`, which takes `items`, and threw while
  rendering. And `validate:story-dod`'s state-prop scan read the whole `.types.ts`
  file, so a same-named **slot** and _item-level_ members counted as component
  props; it now reads `*Props` interface bodies only (defect D6). The `states`
  denominator moves 62 → 56 and every enforced check stays green.

  **Not fixed, recorded instead.** Defect D4 (a `role="button"` span inside the
  `<button role="combobox">` trigger of `DzCascader` and `DzTreeSelect`) and
  defect D10 (`DzTreeSelect` declaring `aria-activedescendant` while DOM focus
  moves into the tree) each need a decision the library's owner has to take, and
  each changes rendered output or a published part. Both are pinned by
  recorded-defect assertions in their contract specs, so the count cannot drift
  and the eventual fix cannot land unnoticed.

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

- 63c1325: **Icons come from `@lucide/vue`, not the deprecated `lucide-vue-next`.** `lucide-vue-next` is deprecated on npm in favour of `@lucide/vue`, its renamed continuation. `@dzup-ui/core` now depends on `@lucide/vue ^1.47.0`. The glyph names it uses are unchanged.

  This is a `minor` because three things you can see change (owner decision D175):
  - **Every icon's rendered `class` changes.** `lucide lucide-chevron-down-icon` becomes `lucide lucide-chevron-down`, and `X`'s `lucide lucide-xicon` becomes `lucide lucide-x`. `Filter` renders `lucide lucide-funnel lucide-filter` and `MoreHorizontal` renders `lucide lucide-ellipsis lucide-more-horizontal`. If your CSS or tests select on a `lucide-*` class that an icon inside a dzup component renders, update the selector.
  - **Icons render `aria-hidden="true"` by default.** `@lucide/vue` 1.x marks every icon decorative. The dzup components already give icon-only controls their accessible name, so no control loses its name. If your own icons carry meaning, give the control an `aria-label`.
  - **Three glyphs are redrawn:** `CalendarIcon`, `Clock` and `Filter`. The date pickers, the time picker and the data-grid header show the new drawings.

  **If your own code imports `lucide-vue-next`,** you can keep it, and you will then install both packages. To move to one:

  ```sh
  npx @dzup-ui/codemods swap-icon-library src/
  ```

  It rewrites `lucide-vue-next` imports, deep subpaths, re-exports and dynamic `import()` to `@lucide/vue`, in `.ts`, `.tsx`, `.js` and every `<script>` block of a `.vue` file. It is not part of `all`; run it on its own, then your formatter.

  **`@dzup-ui/codemods`:** `swap-icon-library` now rewrites `.vue` files. It used to parse a whole single-file component as TypeScript and fail on every one, so it changed only `.ts` files.

  The registry items the site serves for `shadcn add` now name `@lucide/vue` in their `dependencies` and in their source.

- 5773f65: **Nine ARIA props that were declared, type-checked in your source, and never rendered anything have been removed from six components.** `DzFloatLabel` loses `ariaLabel`, `ariaLabelledby`, `ariaDescribedby` and `ariaInvalid`; `DzInplace`, `DzGrid`, `DzStack`, `DzStepper` and `DzTabs` lose `ariaInvalid`.

  `TASK-N5-02`. These are the six `⛔ gap` cells the C2 (identity) column of
  `docs/program-2026-08/form-controls-readiness-matrix.md` has carried since the
  form-controls audit. The matrix now reports **0 gaps**.

  **Why removal and not implementation.** Each of these props inherits from
  `BaseAccessibilityProps` and each landed on an element that cannot carry it:
  - `DzGrid` and `DzStack` render a generic `<div>`. A layout box is not invalid;
    the fields inside it are.
  - `DzTabs` renders Reka's `TabsRoot`, which is not a widget with a validity
    state. A field inside a panel is invalid, and `DzTabTrigger` is where an
    invalid-panel affordance belongs.
  - `DzStepper`'s root is `role="group"`, and ARIA 1.2 does not support
    `aria-invalid` on `group`.
  - `DzInplace`'s display trigger is `role="button"`, likewise unsupported.
  - `DzFloatLabel` is a `<div>` plus a `<label>`. It is not a labelable element and
    computes no accessible name of its own, a generic element ignores
    `aria-describedby` and `aria-invalid` entirely, and the control it wraps
    already merges its own error id into `aria-describedby` — writing one from the
    wrapper would clobber that merge.

  A declared prop that silently does nothing is worse than its absence, because a
  consumer reasonably believes it has met its own accessibility obligation. The
  honest fix is to stop declaring it.

  **Why this is a `minor` and not a `patch`.** `packages/contracts/VERSIONING.md`
  §3: removing a declared prop is a type removal, and a prop that did nothing at
  runtime still type-checked in consumer source, so deleting it stops that source
  compiling. Under the 0.x mapping in §1 a break goes in the minor position, where
  `^0.x` does not carry it into an unattended install.

  **What you will see if you were passing one.** The binding no longer resolves to
  a prop, so Vue routes it into `$attrs` and every one of these components spreads
  `$attrs` onto its root — which means the attribute now _renders_, on an element
  with no role to carry it. That is a different wrong answer from the old silent
  swallow, so each component emits a one-time dev-mode warning naming the prop,
  what to do instead, and the fall-through. Production builds drop the check.

  **Migration.** Delete the binding, or move it to the element that owns it:

  | Was                                   | Now                                                               |
  | ------------------------------------- | ----------------------------------------------------------------- |
  | `<DzGrid :aria-invalid="hasError">`   | put `aria-invalid` on the field, or bind `invalid` on the control |
  | `<DzStack :aria-invalid="…">`         | same                                                              |
  | `<DzTabs :aria-invalid="…">`          | the field inside the panel carries it                             |
  | `<DzStepper :aria-invalid="…">`       | the field inside the step carries it                              |
  | `<DzInplace :aria-invalid="…">`       | set it on the editor you render into `#edit`                      |
  | `<DzFloatLabel :aria-label="…">` etc. | put all four on the control you wrap, or use `DzFormField`        |

  `@dzup-ui/codemods`' `rename-props` transform strips all nine, in every binding
  form a Vue template or JSX can write:

  ```sh
  npx @dzup-ui/codemods rename-props src/
  ```

  `@dzup-ui/codemods` is released alongside this change (owner decision N5-01-D2,
  2026-09-26). The table above is the same migration, by hand.

  **Three sibling props were kept and implemented rather than removed** —
  `DzInplace.ariaLabelledby`, `DzStepper.ariaLabelledby` and
  `DzStepper.ariaDescribedby`. See the accompanying patch.

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

- 4c9fb7a: **`DzResolver` resolves by exact name from generated ownership data. Unknown names no longer resolve to Core.**

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

- e986952: **`aria-describedby` names only the sub-parts a field actually renders, `DzFormMessage` stops interrupting the user, `DzFileUpload` and `DzColorPicker` get an id a label can point at, `DzFieldArray` gives each row ids of its own, and the last five controls take `v-model`.**

  Slices three to five of `TASK-FORM-OSS-02`, which closes it: the readiness
  matrix goes from 84 open gaps to 3, and all three are out of scope on purpose —
  one is `TASK-FORM-OSS-03`'s work and two are owner decisions recorded below.

  **A field described its control with ids that were not there** (C4).
  `useFormField` pushed `descriptionId` into `aria-describedby` unconditionally,
  so every control inside a `DzFormField` with no `DzFormDescription` — most of
  them — announced itself described by an element that did not exist. It failed in
  the quietest way available: assistive technology ignores a dangling id, nothing
  warned, and the `parts.length > 0` guard at the end could never be false.

  The field now names only what is rendered. It decides that by **walking its
  slot before children render**, because registration alone cannot work on the
  server: SSR renders children in order and never comes back, so a control
  serialised before the description's `setup` ran would omit the id and the client
  would add it — a hydration mismatch on an accessibility attribute, which is
  worse than the dangling id it replaced. Registration is kept as the catch-all
  for a description rendered by some intermediate component of the consumer's own.

  **`DzFormMessage` carried `role="alert"` and `aria-live="polite"` on the same
  node** (C4). `alert` implies assertive and wins, so every standing field error
  interrupted whatever the user was being told. A message already on screen when
  the control is focused is read as part of its description; only one that
  _arrives_ needs a live region. It is polite now, with no `role`.

  **Two controls computed an id and rendered it nowhere** (C2). `DzFileUpload`
  had no `id` in the DOM at all — a `DzFormLabel`'s `for` named an id that
  appeared nowhere in the control, and clicking the label did nothing. It is on
  the drop zone, not the hidden `<input>`, because the input is `aria-hidden` and
  `tabindex="-1"`: a label pointing at it would name a node no user can reach.
  `DzColorPicker` skipped the field context in the same way.

  **`DzFieldArray` hands each row its own ids** (C2). Every row of a repeater
  sits inside one `DzFormField`, so every control in it resolved to the _same_
  id: a label for row 1 could activate row 3, and an `aria-describedby` could name
  another item's error. The default slot now receives `fieldId`, `descriptionId`
  and `messageId` per row, derived from an `id` prop, the field context, or a
  generated base — which is spec 04 §8's "collision-free control/help/error IDs
  per form instance and array item".

  **The last five named models** (C1). `DzKnob`, `DzRating`, `DzTagsInput`,
  `DzMention` and `DzInplace` join `DzCascader` and `DzTreeSelect` in taking both
  `v-model` and `v-model:value`. Every Core control's value is now on the default
  model, and a spec ratchets that so the next one cannot ship without it.

  **States and SSR.** `data-required` on the six text inputs and on every date,
  time, file, slider, knob, rating and colour control; `data-loading` and
  `aria-busy` on `DzKnob` and `DzRating`, whose `loading` prop was declared,
  defaulted and read nowhere. `packages/core/tests/ssr/form-controls-ssr.spec.ts`
  now renders all 39 controls with a value: the audit found 26 with no SSR spec at
  all, including all three pickers, where a server/client locale split is exactly
  the defect `TASK-OSS-P4-03` found elsewhere.

  **Two owner decisions, recorded rather than made.** `DzFloatLabel` inherits
  `ariaLabel`, `ariaLabelledby`, `ariaDescribedby` and `ariaInvalid` and honours
  none; `DzInplace` inherits two of them. Binding them to a wrapper `<div>` would
  be equally meaningless and merely harder to notice, so they are listed in
  `packages/tooling/src/forms/assessments.ts` as `inertProps` with a reason each,
  and their cells stay open. Removing them is a breaking type change.

  **One SSR behaviour is Reka's, not ours.** `DzSlider` renders its track and
  filled range on the server and defers the thumb — `display:none`, at 0%, with no
  `aria-valuenow` until the collection registers on mount. Setting the attribute
  from Core does not work, because the primitive binds it itself and wins over a
  fallthrough. Asserted as-is so a future Reka that changes it is noticed.

- e986952: **`DzCascader` and `DzTreeSelect` now take `v-model` as well as `v-model:value`, thirteen selection controls reflect the states their types promise, `DzRadio` and `DzRadioGroup` read the field context they were ignoring, and `DzSelect` stops rendering an empty field on the server.**

  The second slice of `TASK-FORM-OSS-02`. Clause references are to
  `docs/program-2026-08/form-control-renderer-contract.md`; the per-control status
  is `docs/program-2026-08/form-controls-readiness-matrix.md`.

  **Both model names, one value** (C1). Seven Core controls bind their value to
  `v-model:value` and every other control binds `v-model`. That is invisible until
  something binds a control whose name it does not know — a schema-driven
  renderer, for instance, which holds a component and a codec and binds `v-model`
  to whatever the registry names. On those seven it bound _nothing_: no error, no
  warning, a control that renders and never reports a value.

  `DzCascader` and `DzTreeSelect` now accept both. `v-model:value` is unchanged
  and every existing template keeps working; `v-model` reaches the same value.
  Whichever a consumer binds is the one that carries it, and binding both keeps
  them in step. The merge is one composable, `useDualModel`, exported from
  `@dzup-ui/core` — the remaining five controls follow in the next slices.

  **States that were only in the type** (C3). Six props were declared, defaulted,
  and read nowhere: `DzCascader.loading`, `DzListbox.loading` and `.readonly`,
  `DzTreeSelect.loading` and `.required`, `DzCombobox.required`,
  `DzMultiSelect.required`. All now reach the DOM.

  Alongside them, `data-required` on `DzSelect`, `DzSwitch`, `DzCheckbox`,
  `DzRadioGroup`, `DzListbox` and `DzTransfer`. Those six already rendered
  `aria-required` — Reka supplies it — but not the presence-only attribute ADR-19
  §4 names, so a stylesheet had no way to show a required field as required.

  **Identity the field context was already offering** (C2). `DzRadioGroup` merged
  required, describedby and invalid from `DzFormField` and not `disabled`, so
  every radio inside a disabled field stayed live. `DzRadio` read no context at
  all and declared an `ariaInvalid` prop that did nothing.

  **`DzSelect` renders its value on the server** (C5). `SelectValue` resolves a
  label from Reka's item registry, and that registry fills when the _content_
  mounts — which never happens during SSR. A select with a value therefore
  server-rendered an empty placeholder and filled itself in after hydration: a
  field that looks unset until JavaScript arrives. The label is now computed from
  `items`, which is already on the component. Unset selects are untouched — the
  first attempt supplied slot content unconditionally, which replaced the
  placeholder too and emptied the accessible name of every empty select.

  **`DzSwitch` honours `prefers-reduced-motion`** (C7). The thumb is the one part
  that moves, and it slid regardless.

  **`DzPersonaSelector` was never broken.** It renders a `DzCombobox`, and
  injection walks the component tree, so the field context reaches the delegate
  directly. The readiness matrix now records the delegation instead of reporting
  three gaps against a wrapper that correctly does nothing.

  **Tests.** `packages/core/tests/ssr/form-controls-ssr.spec.ts` grew the
  selection controls — each rendered with a value, `DzCascader` and `DzTreeSelect`
  through _both_ model names. `useDualModel` has its own unit suite, and the
  contract specs gained the dual-model and state assertions. Nothing existing was
  edited: all 4,317 core tests pass, including the 69 that already covered these
  two components.

- 2d51eec: **A grid child can now say how many columns it spans, and `DzStack` accepts `row` and `column`.**

  `TASK-R3-O3`, decision D67. Both changes are additive; nothing existing changes
  behaviour.

  **`DzGridItem`** is a new compound part of `DzGrid` with a typed `span` — a
  count from 1 to 12, `'full'`, or one per breakpoint:

  ```vue
  <DzGrid :cols="{ sm: 1, md: 12 }">
    <DzGridItem :span="{ md: 6 }"><DzInput /></DzGridItem>
    <DzGridItem :span="{ md: 6 }"><DzInput /></DzGridItem>
    <DzGridItem span="full"><DzTextarea /></DzGridItem>
  </DzGrid>
  ```

  Until now a spanning field was a raw `class="col-span-2"` on the child — not an
  API, not typed, and easy to get wrong: a class assembled at runtime
  (`` `md:col-span-${n}` ``) is invisible to Tailwind's scanner and silently
  compiles to nothing. The span classes come from a literal table, so every one is
  emitted. A span is writing-mode relative, so it mirrors under `dir="rtl"`; the
  item renders one element with no DOM reads, so server and client markup match.
  A numeric span outside 1–12 is clamped. New types: `DzGridItemProps`,
  `DzGridItemSlots`, `GridSpan`, `ResponsiveSpan`.

  **`DzStack` `direction`** now also accepts `row` (same as `horizontal`) and
  `column` (same as `vertical`) — the vocabulary a form renderer's layout node and
  CSS use. Before, `direction="row"` silently fell back to vertical. Neither
  spelling is deprecated.

- 527dbd1: **The two credential inputs stop failing WCAG 2.2 SC 3.3.8 Accessible Authentication.**

  SC 3.3.8 (AA) forbids a cognitive-function test in an authentication step unless
  the step offers an alternative or a _mechanism_ that removes it. Both of the
  library's credential inputs shipped the mechanism switched off. Neither was a
  missing feature — each was a flag that was never passed.

  **`DzOtpInput` now advertises platform autofill.** Reka's `PinInput` emits
  `autocomplete="one-time-code"` on every cell only when its `otp` flag is set, and
  `DzOtpInput` never set it, so every cell rendered `autocomplete="false"`. iOS,
  macOS and Android therefore did not offer the code that had just arrived by SMS,
  and the user was left transcribing a code from another device — which is the
  cognitive-function test the criterion exists to remove. The new `otp` prop
  defaults to `true`, which is what the component is named for; focus also lands on
  the first empty cell rather than the cell that was tapped, which is Reka's own
  behaviour behind the same flag.

  ```vue
  <DzOtpInput v-model="code" />
  <!-- autofillable one-time code -->
  <DzOtpInput v-model="pin" :otp="false" />
  <!-- a local PIN; do not offer to fill it -->
  ```

  Pasting a code already worked and is unchanged: a paste into any cell is split
  across the cells, on every engine.

  **`DzPasswordInput` can finally say which password step it is.** The field
  hard-coded `autocomplete="current-password"`, and because the component sets
  `inheritAttrs: false` and spreads `$attrs` onto its wrapper `<div>`, writing
  `autocomplete="new-password"` on the component put the token on an element no
  browser reads. A registration or change-password form could not steer a password
  manager at all — silently. `autocomplete` is now a prop, still defaulting to
  `current-password`, and it lands on the `<input>`.

  ```vue
  <DzPasswordInput v-model="pw" autocomplete="new-password" />
  ```

  **The reveal control is reachable by keyboard.** The show/hide toggle carried
  `tabindex="-1"`, so the only way to check what you had typed was a mouse. Reading
  back a password you cannot see is the other technique SC 3.3.8 recognises, and a
  control with a function of its own that no key can reach is a plain SC 2.1.1
  failure besides. The attribute is gone; the toggle is now an ordinary tab stop
  after the field.

  Its label is also translatable for the first time — `DzPasswordInput.showPassword`
  and `DzPasswordInput.hidePassword` join the message catalog, replacing two English
  literals that no application could change.

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

- e986952: **`DzTabs`, `DzAccordion` and `DzStepper` can reveal a hidden panel and say when it is rendered, `DzStepper` can refuse a step change, and `useRevealAndFocus` reports whether focus actually landed.**

  `TASK-FORM-OSS-04`, which closes the FORM-OSS program.

  **The defect this exists to stop** is one of the quietest in a form. A wizard or
  tabbed form validates on submit, finds its first invalid field inside a panel
  that is not currently shown, and calls `focus()` on it. The element is not in
  the document — or it is `display: none` — so `focus()` does nothing, raises
  nothing, and returns nothing. The user is told "please fix the errors" and given
  no way to reach them.

  Closing it takes both halves. **`revealItem(id)`** on all three disclosure
  primitives opens or activates the panel holding `id` and emits `revealed`
  _after_ it has rendered, which is the moment focus becomes possible. It fires
  even when the item was already open, so a caller never has to special-case that
  branch — which is exactly where the missing focus comes back.
  **`useRevealAndFocus`** waits for `nextTick`, then for the reveal transition,
  then focuses — and returns **the element that actually holds focus, or `null`**.
  A form that gets `null` can fall back to its error summary instead of stranding
  the user.

  The transition wait is bounded and skipped under `prefers-reduced-motion`. A
  `transitionend` that never fires must not leave the user with no focus at all:
  slightly early focus is recoverable, never focusing is not.

  **`DzStepper` gains `beforeChange` and `linear`.** A wizard cannot advance past
  a step whose fields are invalid, and the stepper is the only thing that knows a
  change is being attempted. The guard is a **boolean and nothing more** — the
  stepper is never told what validation is, only whether the host permits this
  move. It is awaited even when synchronous, so an async validator does not cause
  the next step to flash and roll back. A refusal emits `blocked` with a reason,
  because a Next button that silently does nothing is indistinguishable from a
  broken one.

  `linear` tracks the furthest step reached rather than the current one, so a user
  can return to step 1 from step 3 and jump straight back — which is what "you
  cannot skip ahead" means to a person filling in a form.

  **`revealItem` deliberately bypasses the guard.** It is how a form takes the
  user _to_ an error; a guard that blocked it would trap them on a step whose
  problems are somewhere else.

  **`DzAccordion` honours `prefers-reduced-motion`.** Its panel height animation
  and its chevron rotation both ran regardless.

  **What was audited and found sound.** `DzGrid`'s responsive `cols` work per
  breakpoint, and neither it nor `DzStack` has a physical direction: CSS grid and
  `flex-direction: row` are writing-mode relative, so `dir="rtl"` orders them
  correctly with nothing to configure. Both now have specs saying so.

  **Two things are recorded rather than fixed.** `DzGrid` has **no span API** — a
  renderer's "this field takes two of three columns" is a raw `class` on the
  child today, and adding a `DzGridItem` or a `span` prop is an owner decision.
  And `DzStack` calls its axis `horizontal`/`vertical` where a renderer's layout
  node says `row`/`column`; a `direction="row"` silently falls back to vertical,
  which reads as a styling bug for a week. Both are asserted by tests so the
  absence cannot be mistaken for an oversight.

  The readiness matrix now carries a **Layouts** section, so these five are
  tracked beside the 39 controls rather than in prose.

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

- c02da02: **Pressing Retry in `DzCombobox` or `DzMultiSelect` no longer closes the list.** The button disappears as soon as the reload starts, so a mouse press used to drop focus to the page and close the popover. The list the user had just asked to reload vanished. The error row now keeps focus in the input, as `DzMention` already did (async-options contract C9.4), and the list stays open through loading → ready.
- 7d351cd: **`DzCommandPalette`: search the whole `label`, not just what the row happens to render.**

  The palette documented `label` as its search key and filtered `props.items` on it — but Reka's
  `ComboboxItem` also registers each row's _rendered text_ (`textValue || textContent`) with
  `ComboboxRoot` and hides any row its own filter scores zero. That second filter sat downstream
  of, and invisible to, the first, so it silently won.

  The effect only shows up in the pattern `label` exists for: a consumer that puts a full search
  haystack in `label` (ids, tags, keywords) and renders a shorter caption through the `#item`
  slot. Those rows were then filtered by the caption. On this repo's own site that made every
  block unfindable by its id, its tags, or the `Dz*` components it is built from — all three
  indexed and weighted — while the visible title still matched, and nothing in the DOM showed why.

  `ComboboxRoot` now gets `ignore-filter`, leaving this component's filter the only one. Matching
  is unchanged in kind: it uses the same `Intl.Collator`-backed comparison Reka's filter used, so
  it stays case- and accent-insensitive (`resume` still finds `Résumé`).

  Also removes a `:filter-function` binding that had quietly stopped doing anything — it is not a
  `ComboboxRoot` prop in Reka 2.x, so it fell through to `$attrs` and onto the listbox element.

  No API change: same props, same emits, same slots. Rows that were being filtered out despite a
  matching `label` now appear, which is the documented behaviour.

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

- a01965f: **Navigation and data components declare their styling surface, and a sidebar no longer opens on the wrong edge in Arabic.**

  The ADR-19 styling contract — declared parts, declared states, a typed per-part
  `ui` override — reached two more families this release. **Every** public
  component in `navigation` now declares one, and eleven more in `data` join
  `DzTable`, so restyling a menu, a pager, a tab set, a calendar or a grid no
  longer means writing a descendant selector against a class name
  `tailwind-variants` is free to change.

  **New `data-part` and `ui` surfaces**

  | Family       | Components                                                                                                                                                                                                   | Parts you can now address                                                                                                                                                                                                 |
  | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `navigation` | `DzAnchor`, `DzBackTop`, `DzBreadcrumb` (family), `DzColorModeToggle`, `DzMegaMenu`, `DzMenu` (family), `DzPagination`, `DzSegmented`, `DzSidebar` (family), `DzStepper`, `DzStepperItem`, `DzTabs` (family) | `root`, `list`, `item`, `item-label`, `separator`, `trigger`, `indicator`, `panel`, `group`, `group-label`, `action`, `content`, `close`, `header`, `footer`, `body`, `overlay`, `icon`, `suffix`, `title`, `description` |
  | `data`       | `DzAccordion` (family), `DzCalendar`, `DzChip`, `DzDataGrid` (family), `DzDataView`, `DzInfiniteScroll`, `DzListItem`, `DzOrderList`, `DzTag`, `DzTree`, `DzTreeItem`                                        | `root`, `item`, `trigger`, `indicator`, `content`, `header`, `title`, `group`, `action`, `row`, `cell`, `body`, `panel`, `list`, `item-label`, `control`, `loader`, `error`, `hint`, `empty`, `footer`, `close`           |

  ```vue
  <DzPagination :total="500" :ui="{ action: 'rounded-full', separator: 'opacity-40' }" />
  <DzSidebar :ui="{ overlay: 'backdrop-blur-sm', body: 'gap-1' }" />
  <DzTabTrigger value="one" closable :ui="{ close: 'opacity-100' }">One</DzTabTrigger>
  <DzCalendar v-model="date" :ui="{ item: 'rounded-lg', title: 'font-semibold' }" />
  <DzTreeItem :node="node" :ui="{ indicator: 'text-[var(--dz-primary)]' }" />
  ```

  **Two real fixes, not just declarations.**

  `validate:rtl` reads a component's declared `rtl.mirrors` and then checks its
  source for physical utilities. Declaring these two turned up geometry that
  promised to follow the reading direction and did not:
  - **`DzSidebar`** pinned the rail and the mobile drawer with `left-0`, and the
    drawer slid out with `-translate-x-full`. In a right-to-left document that put
    the navigation on the edge the content reads away from, and would have slid
    the drawer _into_ the page instead of off it. Now `inset-s-0` plus an
    `rtl:translate-x-full` companion.
  - **`DzBackTop`** pinned the scroll-to-top control with
    `right-[var(--dz-back-top-offset)]`. Unlike `DzFab`, it takes no `position`
    prop — the corner is "out of the way of the text", which is a statement about
    the reading direction. Now `inset-e-`.

  Two inline physical margins went with them: the sidebar item's badge
  (`ml-auto` → `ms-auto`) and the data view's paginator (`ml-auto` → `ms-auto`).

  **In a left-to-right document nothing moves by a pixel.** `inset-s-`, `inset-e-`
  and `ms-` compile to the same edge that `left-`, `right-` and `ml-` did.

  **Nothing is removed and every existing override keeps working.** `ui` is a new
  optional prop on 22 components; `class` lands exactly where it always did; no
  part was renamed and no `data-state` value changed.

- 4c9fb7a: **`@dzup-ui/nuxt` pushed a stylesheet path the tokens package does not export, so every consumer install failed.**

  The module added `@dzup-ui/tokens/dist/tokens.css` to `nuxt.options.css`. That
  deep path is not in the tokens package's `exports` map — the declared specifier
  is `@dzup-ui/tokens/css` — so a real install died at build time with:

  ```
  Missing "./dist/tokens.css" specifier in "@dzup-ui/tokens" package
  ```

  It resolved in this repository only because the workspace's `node_modules` are
  symlinks into the source tree, which is precisely the class of defect a
  workspace-alias test cannot see. It was found by installing the packed tarball
  into a Nuxt app.

  Also in this release:
  - **Registration comes from generated ownership data.** The module carried a
    second handwritten Pro list beside the resolver's, and the two had drifted
    from each other and from both packages: it classified the Core components
    `DzAppShell` and `DzCalendar` as Pro, and named Pro components
    (`DzScheduler`, `DzComment`, `DzVirtualTable`) that Pro does not export. Both
    lists are gone; the module reads `@dzup-ui/core/ownership`.
  - **`includePro: true` with Pro absent now explains itself.** The build no
    longer fails on an unresolvable import — it logs which package is missing,
    which option asked for it, and the command that installs it, then continues
    with Core.
  - **`prefix` stops mangling un-prefixed names.** The old rule was
    `name.slice(2)` unconditionally, which turned `TeamMemberBadge` into
    `AcmeamMemberBadge`. Names without the `Dz` prefix are now registered
    unchanged.
  - **`@dzup-ui/core` gains an `./ownership` subpath** exposing the generated
    ownership table, so integrations can read component ownership without
    importing the component library.

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

- 4c9fb7a: **Every overlay now teleports where your application says, including the four that never asked.**

  Nineteen components portal part of themselves out of the DOM — dialogs, sheets,
  popovers, tooltips, menus, select and combobox panels, the command palette, the
  lightbox, the tour, the sidebar's mobile overlay and the blocking layer. Each one
  decided its own destination. Fifteen took a `portalTo` prop you had to pass to
  every instance; **four teleported to a hard-coded `body` with no way to redirect
  them at all**: `DzBlockUI`, `DzSidebar`, `DzPopconfirm` and `DzTour`.

  Now they all follow one rule:

  ```
  instance `portalTo`  →  DzProvider `portal`  →  document.body
  ```

  ```vue
  <DzProvider portal="#app-overlays">
    <App />
  </DzProvider>
  ```

  **Nothing changes without a provider.** With no `portal` set and no `portalTo`
  prop, every component teleports exactly where it did before — which is what let
  nineteen components migrate in one change instead of nineteen.

  **This closes the shadow-DOM limitation the Styling Cookbook documented twice as
  unsolvable.** Custom properties inherit through a shadow boundary and
  stylesheets do not, so an overlay that escaped to `document.body` lost the
  adopted sheet and rendered unstyled. Point `portal` at a container inside the
  root and it stays within the boundary:

  ```vue
  <DzProvider :portal="shadowOverlayContainer">
    <App />
  </DzProvider>
  ```

  **New:** `portalTo` on `DzBlockUI`, `DzSidebar`, `DzPopconfirm` and `DzTour`, so
  the per-instance escape hatch is uniform across all nineteen.

  `portalDisabled` and `portalDefer` are unchanged and stay per-instance — they
  are about whether _this_ overlay teleports, not about where overlays go.

  New guide: **Portals & Embedding**, covering the shadow-root recipe (both halves
  — adopted stylesheets _and_ the portal container), the end-to-end testing recipe
  (`portal` plus `test-id-prefix`), and the CSP nonce note.

- 4c9fb7a: **The Pro package is `@dzup-ui-pro/pro`. The resolver and the Nuxt module named a package that has never existed.**

  `DzResolver({ includePro: true })` emitted `from: '@dzup-ui/pro'`, and
  `@dzup-ui/nuxt` transpiled and registered components from the same string. No
  such package is published under any plan — the commercial tier is
  `@dzup-ui-pro/pro` — so every consumer who followed the documented `includePro`
  path got an unresolvable import for the one feature the option exists to enable.

  The reason it survived is the part worth recording: `resolver.spec.ts` asserted
  the _same wrong name_ at all three of its Pro sites. The suite was green, the
  feature was broken, and the gate certified it. A green test that copies the
  implementation's mistake is not evidence.

  What changed:
  - The resolver emits `@dzup-ui-pro/pro` for Pro components. Its two package
    names are module-local constants, and the spec states the two real names
    independently rather than importing them — asserting an implementation
    against its own constant is what hid this defect.
  - `@dzup-ui/nuxt` transpiles and registers Pro components from `@dzup-ui-pro/pro`.
    The `includePro` option name is unchanged.
  - `@dzup-ui/codemods`' `rename-imports` now rewrites `dzup-ui/pro` and
    `@dzup-ui/pro-components` to `@dzup-ui-pro/pro`, so a migrated codebase no
    longer lands on the dead name.
  - A new repository gate, `yarn validate:package-names`, fails if a retired
    package name reappears outside changelogs, changesets, ADRs, and audit
    records. It is in `yarn validate:all`.

  This is a patch: the previous behaviour could not work for anybody. If you set
  `includePro: true` against a local `@dzup-ui/pro` alias, repoint it at
  `@dzup-ui-pro/pro`.

  `includePro: true` still requires the Pro package to be installed, and Pro is
  not published yet — the option remains `false` by default.

- e986952: **Every text input now reflects `readonly` in the DOM, `DzOtpInput` finally does something with `required`, `DzInputGroup` honours the three ARIA props it was ignoring, `DzInputMask` can hold the unmasked value, and `DzNumberInput` stops announcing `0` for a field the user cleared.**

  The first slice of `TASK-FORM-OSS-02`, closing the `inputs/` gaps that
  `docs/program-2026-08/form-controls-readiness-matrix.md` reports. Clause
  references are to
  `docs/program-2026-08/form-control-renderer-contract.md`.

  **`data-readonly` on five controls** (C3). `DzTextarea`, `DzSearchInput`,
  `DzPasswordInput`, `DzNumberInput` and `DzInputMask` all pass `readonly` to the
  native element and none of them said so on the root, so no stylesheet and no
  test could distinguish a read-only field from an editable one. `DzInput` has
  always emitted it; the other five now match. Presence-only, absent when false,
  per ADR-19 §4.

  **`DzOtpInput` implements `required`** (C3). The prop was declared, defaulted to
  `false`, and read nowhere — the type told a consumer it worked. It now resolves
  against `DzFormField` the way the other states do and emits `data-required` plus
  `aria-required`.

  **`DzInputGroup` honours `ariaLabelledby`, `ariaDescribedby` and `ariaInvalid`**
  (C2). All three are inherited from `BaseAccessibilityProps` and all three were
  dropped on the floor. While wiring them: binding `:aria-invalid="ariaInvalid"`
  directly emits `aria-invalid="false"` on every group, because an unset prop in
  that position renders as the string. It is `ariaInvalid || undefined`, and a
  contract assertion holds the line.

  **`DzInputMask` gains `modelMode`** (C1), defaulting to `'masked'` — today's
  behaviour, byte for byte. `model-mode="unmasked"` puts the stripped value in
  `v-model` instead, which is what a form document should persist: with the
  default, changing a mask from `"(999) 999-9999"` to `"999-999-9999"` leaves
  every stored value formatted for a mask that no longer exists.
  `update:unmasked` has always emitted the raw value, but a consumer binding
  `v-model` generically — a schema-driven renderer, for instance — has no way to
  reach a one-way emit. The displayed value is derived, not stored, so the field
  renders correctly on the server in both modes.

  **`DzNumberInput.change` carries `number | undefined`** (C1). Clearing the field
  sets the model to `undefined` and used to announce `0` — indistinguishable from
  the user typing zero, and only the event was wrong. The event now carries what
  the model holds.

  **This one is a behaviour change**: a handler typed `(value: number) => void`
  must widen to `number | undefined`, and code that treated the cleared field as
  `0` will now see `undefined`. That is the point — `0` is a legitimate value and
  nothing downstream could tell the two apart.

  **Tests.** A new `packages/core/tests/ssr/form-controls-ssr.spec.ts` renders
  every input _with a value_ and checks the server output contains it — the audit
  found 26 of 39 controls with no SSR spec at all, and "renders without throwing"
  does not catch a field that hydrates into a different value. Contract specs
  gained the clause assertions for each fix, and
  `forms/aria-invalid-casting.spec.ts` pins the `??` resolution chain that every
  control shares.

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

- 5773f65: **`DzStepper` now honours `ariaLabelledby` and `ariaDescribedby`, `DzInplace` now honours `ariaLabelledby`, and `DzOrderList`'s `dragHandleLabel` finally reaches the DOM.**

  `TASK-N5-02`, the other half of the six C2 gaps in
  `docs/program-2026-08/form-controls-readiness-matrix.md`. Where the accompanying
  `minor` removes a prop that no element could carry, this ships the three that
  could — plus one documented label that nothing rendered.

  **`DzStepper.ariaLabelledby` and `DzStepper.ariaDescribedby`** (C2). The root is
  `role="group"`, which supports both, and `aria-describedby` is global to every
  role. The root already carried `aria-label`, so accepting one form of a name
  while dropping the id-reference form of the same name _on the same element_ was
  incoherent rather than principled. A wizard can now be named by its own visible
  heading instead of by a duplicated string.

  The built-in `aria-label="Progress steps"` fallback yields when `ariaLabelledby`
  is supplied. Two names on one element is not an error — `aria-labelledby` wins —
  but shipping a fallback the browser is guaranteed to discard is noise in the DOM
  and in every snapshot of it. An explicit `ariaLabel` is still honoured alongside
  `ariaLabelledby`; only the default steps aside.

  **`DzInplace.ariaLabelledby`** (C2). The display trigger is a real `<button>`
  already carrying `aria-label` and `aria-describedby`. Same argument, same
  element, one line.

  **`DzOrderList.dragHandleLabel` renders.** It was documented as "accessible label
  for each row's drag handle" and **no element carried it** — a gap this repository
  stated openly rather than fixed when the i18n work went in. It now reaches the
  DOM as the handle's `title`, and its default moved into the message catalog as
  `DzOrderList.dragHandle`, so it is translatable like every other string. The
  rendered default is byte-identical: `Drag to reorder`.

  It is deliberately **not** an accessible name, and the prop's documentation now
  says so. The handle stays `aria-hidden="true"`: it is a pointer-only affordance
  whose function is already reachable from the keyboard through the Move controls
  and the row's own space-to-grab, and naming it would fold "Drag to reorder" into
  the accessible name of _every_ row under `selectable`, where each row is
  `role="option"` — a name-from-content role. Trading a dead prop for four polluted
  row names is not an accessibility improvement. Correcting the prop's
  documentation to describe a tooltip is the honest end of it.

  **Why these are `patch` and the removals are `minor`.**
  `packages/contracts/VERSIONING.md` §3: correcting a rendered accessibility
  attribute ships as a patch even though it changes what the browser sees and can
  break a consumer's DOM snapshot — we would rather change an attribute than keep
  a known accessibility failure until a range bump. Nothing here narrows a type.

- a01965f: **Twenty-five more components declare their styling surface, and the dialog's close button stops sitting on the wrong side in Arabic.**

  The ADR-19 styling contract — declared parts, declared states, a typed per-part
  `ui` override — reached five families this release. Every Tier B and above
  component in `cards`, `feedback`, `layout`, `media` and `overlays` now says what
  a consumer may address, so restyling those components no longer means writing a
  descendant selector against a class name `tailwind-variants` is free to change.

  **New `data-part` and `ui` surfaces**

  | Family     | Components                                                                                                                                         | Parts you can now address                                                                                                                                                                                                                     |
  | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `cards`    | `DzCard` (family), `DzImageCard`, `DzStatCard`                                                                                                     | `root`, `header`, `body`, `footer`, `action`, `overlay`, `title`, `icon`, `description`                                                                                                                                                       |
  | `feedback` | `DzBlockUI`, `DzNotification`, `DzToast`, `DzSpinner`                                                                                              | `root`, `content`, `overlay`, `icon`, `title`, `description`, `action`, `close`, `indicator`                                                                                                                                                  |
  | `layout`   | `DzPanel`, `DzToolbar`, `DzScrollArea`, `DzSplitter`/`DzResizable` (families), `DzCollapse`                                                        | `root`, `header`, `trigger`, `title`, `indicator`, `action`, `content`, `group`, `viewport`, `panel`, `separator`                                                                                                                             |
  | `media`    | `DzCarousel` (family), `DzImageComparison`, `DzLightbox`                                                                                           | `root`, `viewport`, `content`, `item`, `list`, `item-indicator`, `action`, `panel`, `label`, `separator`, `control`, `overlay`, `close`, `description`                                                                                        |
  | `overlays` | `DzDropdownMenu`, `DzContextMenu`, `DzPopover`, `DzTooltip`, `DzSheet` (families), `DzConfirmDialog`, `DzPopconfirm`, `DzCommandPalette`, `DzTour` | `content`, `item`, `prefix`, `suffix`, `separator`, `indicator`, `overlay`, `title`, `description`, `close`, `icon`, `action`, `panel`, `header`, `body`, `footer`, `input`, `control`, `list`, `group`, `group-label`, `item-label`, `empty` |

  ```vue
  <DzToast :toast="toast" :ui="{ indicator: 'w-2', close: 'opacity-100' }" />
  <DzPanel collapsible header="Filters" :ui="{ indicator: 'text-[var(--dz-primary)]' }" />
  <DzCarousel :ui="{ viewport: 'rounded-xl' }" />
  <DzDropdownMenuItem :ui="{ suffix: 'opacity-60' }">Rename</DzDropdownMenuItem>
  ```

  **One real fix, not just a declaration: RTL insets.**

  `validate:rtl` could not see a physical `left-…` or `right-…` inset at all — the
  one clause meant to catch them named `inset-l-` / `inset-r-`, which Tailwind 4
  does not generate. With the gate widened, five components turned out to pin a
  control to a physical edge while declaring that they mirror with the document:
  - `DzDialog`'s close button and `DzToast`'s close button and tone stripe,
  - `DzNotification`'s dismiss button,
  - `DzLightbox`'s previous / next buttons, close button and counter.

  All are now logical (`inset-s-` / `inset-e-`). **In a left-to-right document
  nothing moves by a pixel.** In a right-to-left one, the close control is finally
  on the edge the reader finishes at.

  Where a physical side is the point — `DzFab`'s and `DzSpeedDial`'s
  `position="bottom-right"`, `DzToast`'s viewport corners, `DzSheet`'s `side` —
  the geometry is unchanged and now carries the `rtl-physical-ok` marker with the
  reason written at the line.

  **Nothing is removed and every existing override keeps working.** `ui` is a new
  optional prop; `class` lands exactly where it always did; no part was renamed.

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

- Updated dependencies [2d51eec]
- Updated dependencies [527dbd1]
- Updated dependencies [4c9fb7a]
- Updated dependencies [527dbd1]
- Updated dependencies [589be13]
- Updated dependencies [4c9fb7a]
- Updated dependencies [a01965f]
- Updated dependencies [a01965f]
- Updated dependencies [4c9fb7a]
- Updated dependencies [2d51eec]
- Updated dependencies [a01965f]
- Updated dependencies [4c9fb7a]
- Updated dependencies [e986952]
- Updated dependencies [527dbd1]
- Updated dependencies [4c9fb7a]
- Updated dependencies [8d80bc3]
- Updated dependencies [5773f65]
- Updated dependencies [a01965f]
- Updated dependencies [a01965f]
  - @dzup-ui/contracts@0.2.0
  - @dzup-ui/tokens@0.3.0

## 0.2.0 (2026-08-10)

### Minor Changes

- ca9c390: Add `DzEmoji` — an accessible emoji primitive in the **media** family.

  Renders an emoji glyph with a consistent type-scale (`xs`–`xl`) and correct
  screen-reader semantics: decorative by default (`aria-hidden="true"`), or
  meaningful (`role="img"` + `aria-label`) when a `label` is provided. Solves the
  inconsistent announcement of raw emoji characters across assistive tech.

- New `DzPageHero` layout component + `.dz-prose` rich-content styles.

  **DzPageHero** — dark gradient hero band for top-level views (eyebrow,
  gradient h1, description, meta row, glass-treated actions cluster), extracted
  from docs-app's `DocsPageHero` so every app on the neural-indigo preset can
  share the band. Styling keys off the new `PAGE_HERO_TOKENS`
  (`--dz-page-hero-*`) in `@dzup-ui/tokens`, with `--dz-auth-brand-*` fallbacks.

  **.dz-prose** — typography for rendered rich content (markdown → sanitized
  HTML), ported from docs-app's `.docs-prose` and shipped unlayered in
  `dist/core.css` via base.css.

- 573f2ae: Add a shared portal-placement contract and expose it on `DzDialogContent`,
  `DzConfirmDialog`, `DzSheetContent`, `DzPopoverContent`, `DzTooltipContent`,
  `DzDropdownMenuContent`, `DzContextMenuContent`, `DzSelect`, `DzMultiSelect`,
  `DzCombobox`, `DzCommandPalette`, and `DzLightbox`. Dialog content now identifies and
  supports customizing its single owned overlay, while production portal defaults
  remain unchanged.

  Publish `@dzup-ui/testing` with guarded DOM test-environment support so
  consumers can mount real Reka-backed components instead of replacing portals or
  design-system components with stubs.

- 6c5f522: Normalize the `warning` intent: every intent now exposes the same solid-fill state set (TASK-DS-10).

  `warning` was the only intent that shipped `-solid` / `-solid-hover`, so every
  consumer — `tv()` variants, the contrast gate, the story codemod — carried a
  `tone === 'warning'` branch, and each branch was a place to forget warning exists.

  **New tokens (additive; nothing was renamed or removed):**
  - `--dz-{intent}-solid` and `--dz-{intent}-solid-hover` for `primary`, `secondary`,
    `success`, `danger`, `info`. These resolve to the same primitive shades as
    `--dz-{intent}` / `--dz-{intent}-hover` (500/600 light, 400/300 dark), so **no
    published token changed color** and the swap is a visual no-op for those five.
  - `--dz-warning-hover`, which the intent was missing entirely.

  `--dz-warning-solid` / `--dz-warning-solid-hover` keep their exact values. They are
  no longer a bespoke pair — they are warning's members of a uniform family.

  **Why warning is shaped this way, and why the fill set has two states.** Near-black
  `--dz-warning-foreground` on `--dz-warning` (shade 500) measures **3.51:1** — below
  WCAG AA. A warning button therefore fills with shade 300 (8.44:1) and hovers to 400
  (5.87:1). The ramp affords no shade between 400 and 500, so a third, darker pressed
  step is not available at AA. The uniform fill set is `-solid` + `-solid-hover`; there
  is no `-solid-active` for any intent.

  **Behavior change.** `DzButton`, `DzToast` and `DzTabs` previously hovered solid
  `success` / `danger` / `info` fills with a `/90` alpha shortcut while `primary` used
  its designed `-hover` shade. All tones now hover to `--dz-{tone}-solid-hover` (the
  shade-600 step). This aligns them with `primary` and puts every hover fill under the
  contrast gate, which the alpha shortcut escaped.

  **`-active` reclassified.** `--dz-{intent}-active` is documented as a pressed _surface_
  color, not a text-bearing fill: no component puts `{intent}-foreground` on it, and
  `--dz-warning-active` could not carry it legibly. The contrast gate no longer asserts
  that pair (94 → 84 pairs), because it was gating a combination nothing renders.

  **Special cases removed:** `buildContrastPairs()` in `@dzup-ui/tooling`, the solid and
  outline compound variants across 15 `*.variants.ts` / `*.tokens.ts` files, and the
  `story-color-tokens` codemod all now loop over intents with no branch.

### Patch Changes

- 64359ea: Repair form-control semantics in `DzDatePicker`, `DzTimePicker`, and `DzTransfer`.
  - `DzDatePicker` now forwards required state to Reka's native form input instead
    of placing an unsupported `aria-required` attribute on a `role="group"`.
  - `DzTimePicker` exposes its trigger as a combobox and renders its clear action
    as a sibling control, avoiding nested interactive content while preserving
    focus after clearing.
  - `DzTransfer` now owns its options with labelled multiselect listboxes and uses
    keyboard-operable options with a non-interactive visual selection indicator.

  The landing catalog's light/dark accessibility audit now certifies every block,
  so the two resolved debt exceptions and their unbacked trust-mark fallback are
  removed.

- 6c5f522: Fix `DzCodeBlock`'s language chip failing WCAG AA.

  The chip (`bash`, `vue`, …) inherited the header's `--dz-muted-foreground` and sat
  on a 10%-opacity `--dz-foreground` fill, measuring **3.64:1** — below the 4.5:1
  required for text. It carries real information, so it now takes the full
  `--dz-foreground` colour, and the pair passes.

  Found with an axe pass over the landing hero, which renders two code blocks above
  the fold. `yarn validate:tokens` does not catch this: the `intent-text-contrast`
  gate is scoped to `--dz-{intent}` text on `{intent}-muted` fills, and this pair is
  neither.

- 6c5f522: Fix `DzDropdownMenu`'s `defaultOpen` prop, which was declared but had no effect.

  Two defects, both required for an uncontrolled menu to open on mount:
  - `defaultOpen` was never forwarded to Reka's `DropdownMenuRoot`.
  - `defineModel<boolean | undefined>('open')` declared `open` as a **Boolean** prop
    with no default, so Vue boolean-cast the unbound value to `false`. Reka read that
    as "controlled, and closed", which pinned the menu shut and made `defaultOpen`
    unreachable even once forwarded. The model now declares `default: undefined`, so
    `open` stays undefined until a consumer binds `v-model:open`.

  Click-to-open was unaffected (the local `defineModel` fed the new value back), so
  this only changes menus that relied on `defaultOpen`, which previously could not
  open at all. `DzDropdownMenuProps` doc comments were also corrected — `modal` was
  described as "controlled open state".

- d3047a8: Fix export targets that the build never emitted.

  `package.json` declared `"./styles": "./dist/core.css"`, and the README told consumers to
  `@import "@dzup-ui/core/styles"` — but no build step ever produced a CSS file, so the import
  failed to resolve for anyone installing the package. `src/index.ts` now side-effect-imports
  `./styles/base.css` and the Vite lib build pins the extracted asset to `dist/core.css`
  (`build.lib.cssFileName`). The JS entry itself stays CSS-free, so `./styles` remains opt-in and
  safe to import under SSR.

  The same class of bug hit every per-family subpath: `./buttons`, `./cards`, `./data`,
  `./feedback`, `./forms`, `./inputs`, `./layout`, `./media`, `./navigation`, `./overlays`,
  `./typography` and `./providers` all shipped an `index.d.ts` with no `index.js` beside it —
  Rollup inlines re-export-only barrels under `preserveModules`, so no chunk was emitted and the
  subpath resolved to nothing. Each barrel is now an explicit build entry.

  `yarn validate:exports` now asserts that **every** target in an `exports` map exists on disk,
  including plain-string and non-JS (`.css`/`.json`) targets, which it previously never walked.

- f794441: Give standalone time-picker combobox triggers an accessible name derived from their placeholder while preserving explicit ARIA and form-field labelling.
- df5ba54: Fix `DzPageHero` title gradient rendering as a solid bar: use `background-image`
  instead of the `background` shorthand, which reset `background-clip` to
  `border-box` and defeated `bg-clip-text` in consumer builds.
- Updated dependencies
- Updated dependencies [573f2ae]
- Updated dependencies [de9cc6f]
- Updated dependencies [6c5f522]
  - @dzup-ui/tokens@0.2.0
  - @dzup-ui/contracts@0.1.0

## 0.1.0 (2026-05-03)

### Minor Changes

- ddd50b7: Canonicalize sidebar color tokens and add the missing `--dz-appshell-sidebar-width` definition.
  - New canonical token names: `--dz-sidebar-foreground`, `--dz-sidebar-foreground-hover`, `--dz-sidebar-heading`, `--dz-sidebar-header-bg`, `--dz-sidebar-footer-bg`. These already existed at the semantic tier; they are now also emitted at the component default tier, fixing the cascade collision that prevented `@datazup/dzup-theme` and similar brand presets from cleanly overriding sidebar paint.
  - `--dz-sidebar-text` and `--dz-sidebar-text-hover` are kept as deprecated aliases that resolve to the canonical names. They will be removed in the next major.
  - `--dz-sidebar-section-title-color` now resolves through `--dz-sidebar-heading` instead of `--dz-muted-foreground` directly. Apps that override the heading token will see the change reflected in section titles automatically.
  - New token `--dz-appshell-sidebar-width: var(--dz-sidebar-width)` — fixes a four-week-old orphan: `DzAppShell.variants.ts` reads this token but no source file defined it. With this fix the existing `DzAppShell` `sidebarWidth` prop has the correct token plumbing for downstream variant rewrites.

  No existing component variants change in this release. Variant rewrites that consume the canonical names ship in a follow-up minor (Phase 2 / Phase 3 of the shell improvement plan in `apps/website-app/docs/analysis/dzup-ui-shell-improvement-pm-plan-2026-04-29.md`).

### Patch Changes

- f17af15: Add Storybook play() interaction assertions to overlay, navigation, and form stories.
  - `DzDropdownMenu` — Interactive + Accessibility stories: open/select/dismiss and aria-disabled verification
  - `DzContextMenu` — Accessibility story: right-click open, aria-disabled check, Escape dismiss
  - `DzDialogParts` — Default + Accessibility stories: portal open/close, aria-modal, aria-labelledby/describedby, focus return on Escape
  - `DzTabsParts` — Default + Accessibility stories: tab activation, panel swap, roving tabindex, ArrowRight navigation, disabled trigger aria-disabled
  - `DzSwitch` — Interactive + Accessibility stories: click toggle (aria-checked), Space key, Tab focus movement
  - `DzCheckboxGroup` — Interactive + Accessibility stories: multi-select, toggle off, Space key, Tab focus independence
  - `DzRadioGroup` — Interactive + Accessibility stories: exclusive selection, ArrowDown roving tabindex

- Updated dependencies [ddd50b7]
  - @dzup-ui/tokens@0.1.0

## 0.1.0-alpha.1 (2026-04-03)

### Features

- Keyboard navigation composables for Calendar, Gantt, Kanban, Diagram components
- File size extractions: DzDiagramEditor, DzTreeMap, useWorkflowDesigner decomposed
- Contributing guide (CONTRIBUTING.md)
- Playwright E2E test setup with visual regression and keyboard navigation tests
- Performance benchmarks for DataGrid, Accordion, Tabs
- Tree-shaking validation script
- Bundle size budget enforcement with CI integration
- Consumer integration test app validating DX

### Migration

- 3 new compat adapters: DzTabsCompat, DzCheckboxCompat, DzRadioCompat
- 3 more compat adapters: DzSwitchCompat, DzAccordionCompat, DzTooltipCompat (11 total)
- 2 new codemods: rename-slots, rename-components (5 total)
- extractTemplate() bugfix: handles nested `<template #slot>` correctly

### Accessibility

- axe-core accessibility tests for complex components
- DzChartDataTable: screen reader data table for Chart.js visualizations

## 0.1.0-alpha.0 (2026-04-02)

### Features

- Initial alpha release of dzup-ui core component library
- 11 component families: buttons, cards, data, feedback, forms, inputs, layout, media, navigation, overlays, typography
- 146 Vue 3 components with TypeScript strict mode
- Tailwind CSS 4 integration with design token system
- Reka UI headless primitives for interactive components (Dialog, Select, Tabs, Menu, etc.)
- tailwind-variants (tv) for type-safe variant styling
- Full v-model support via defineModel() (Vue 3.4+)
- WCAG AA accessibility compliance with ARIA attributes and keyboard navigation
- SSR-safe components (onMounted for DOM access)
- Contract Spec v1 compliance for all public APIs
- 2300+ unit and contract tests
