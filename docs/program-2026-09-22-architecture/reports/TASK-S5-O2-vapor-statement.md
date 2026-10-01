# TASK-S5-O2 — Vapor-interop compatibility statement

> Repository `ui/dzup-ui`, commit **`4e4e46f`**. Evidence bound to
> **`vue@3.6.0-rc.9`**, run 2026-09-24 in a throwaway `git worktree`.
> **This is a statement, not a build.** `@dzup-ui/core` is a virtual-DOM
> component library, it is not compiled in Vapor mode, and per the prompt's
> `<statement_not_build>` requirement **no Vapor build was started**.
>
> A statement of this shape is worth exactly what the run behind it is worth, so
> §1 says what ran, §3 says what is *proved*, §4 says what is **unknown**, and
> §5 says what is **incompatible**. Those three are kept apart on purpose: this
> repository's evidence rules refuse a claim that reads as tested when it was
> reasoned.

## 1. The run

| | |
|---|---|
| Vue | **3.6.0-rc.9** (`rc` dist-tag, re-verified from the registry on 2026-09-24; `latest` is **3.5.43** — 3.6 is **not** GA) |
| Spec | `packages/core/tests/vapor-interop.spec.ts` |
| Config | `packages/tooling/scripts/vue-next.vitest.config.ts` — aliases `vue` to Vue's own single-file `runtime-with-vapor` build |
| Command | `vitest run -c packages/tooling/scripts/vue-next.vitest.config.ts packages/core/tests/vapor-interop.spec.ts` (= `yarn test:vue-next:vapor`) |
| Result | **exit 0 · 2 passed, 1 skipped** · `· vapor-interop: vue 3.6.0-rc.9 — single Vue runtime with vaporInteropPlugin, running for real` |
| Previous evidence | **rc.6** (TASK-N5-03). This is the first run under **rc.9**, which discharges memo trigger **D3** (*"the Vapor statement is re-verified on every promotion"*) |

**What the passing test actually does**, so the claim is not larger than the
assertion: it builds a Vapor root with `defineVaporComponent`, asserts that
`createVaporApp`, `defineVaporComponent`, `createComponent` and
`vaporInteropPlugin` are all exported by name, installs the interop plugin,
mounts the app, renders **`DzButton`** inside it through `createComponent` with a
`tone` prop and a `data-testid`, and asserts on the real DOM that a `<button>`
exists and carries `data-tone="primary"`.

**And the run that must not be mistaken for it.** Under Vitest's *default*
resolution the same spec reports, on the same Vue:

```
· vapor-interop: vue 3.6.0-rc.9 — VERIFICATION NOT PERFORMED
· vapor-interop: UNRUN — … the `vue` module this process loaded has no
  `createVaporApp` — its CJS build carries no Vapor runtime … do not quote the
  Vapor compatibility statement as tested from this run.
```

Only the single-runtime run backs anything. Both were executed; both are recorded.

## 2. The statement

> **`@dzup-ui/core` is a virtual-DOM library and is not compiled in Vapor mode,
> nor is that planned.** A Vue 3.6 application that uses Vapor mode can render
> `@dzup-ui/core` components, because Vue 3.6 ships `vaporInteropPlugin`, which
> lets a Vapor component render a vDOM child. The direction that is **verified**
> is *Vapor parent → vDOM dzup-ui child*, on `vue@3.6.0-rc.9`, by the run in §1.
> Every other direction and every API listed in §4 is **unverified**, and §5
> lists what is **incompatible by construction**.

The README paragraph that publishes this is **generated, not typed** — a
`facts:vapor` region in `packages/tooling/scripts/generate-readme-facts.ts`, whose
`backed` flag is `existsSync(packages/core/tests/vapor-interop.spec.ts)`. Delete
the spec and the README changes to say the claim is **UNBACKED** and
`validate:readme-facts` goes red. That property is why the statement is allowed
to exist at all.

## 3. What Vue 3.6 / Vapor changes about component-instance assumptions

Vapor components compile to direct DOM operations. They have **no vDOM component
instance**, so the things a vDOM library reaches for through the instance proxy
are not there. The audit below is `packages/core/src`, production files only
(`.spec.ts` excluded), counted rather than characterised.

| What the library relies on | Sites | Vapor status |
|---|---:|---|
| `getCurrentInstance()` | **1 file** — `components/buttons/DzButton.vue:47` | **§4.1 — unknown** |
| `instance.appContext.components.<name>` | **1 site** — `DzButton.vue:124`, `RouterLink` detection | **§4.1 — unknown** |
| `$el` on a **child component ref** | **5 sites**: `DzSpeedDial.vue:231`, `DzOrderList.vue:115`, `DzRangeSlider.vue:151`, `DzSlider.vue:151`, `DzPopconfirm.vue:196` | **§4.2 — unknown** |
| `$refs` | **0** | not a risk |
| `provide()` / `inject()` — the ADR-20 provider chain | **36** `provide` · **62** `inject` · **36** distinct `DZ_*_KEY` injection keys · 7 provider composables under `composables/provider/` | **§3.1 — supported, and exercised** |
| `useAttrs()` / `useSlots()` | **192** | **§4.3 — partly unknown** (slots), attrs fine |
| `defineExpose` | **23 files** | **§4.2 — unknown in one direction only** |
| `<Teleport>` | **4 files**: `DzBlockUI`, `DzSidebar`, `DzPopconfirm`, `DzTour` | **§4.4 — unknown** |
| `<Transition>` | **4 files**: `DzBlockUI`, `DzSidebar`, `DzDialogContent`, `DzDialogOverlay` | **§5.1 — incompatible in a Vapor *component*; irrelevant in an interop child** |
| `<Suspense>` | **1 file**: `DzAsyncBoundary.vue` | **§5.2 — incompatible in a Vapor component** |
| render-function API (`h`) imported from `vue` | **2 files** | **§4.5 — unknown** |
| `onMounted` / `onBeforeUnmount` | 37 / 48 | lifecycle hooks exist in Vapor; not a risk for a vDOM child |
| `v-memo`, `cloneVNode`, `mergeProps`, `customRef`, `useTemplateRef` | **0** each | not a risk |
| Direct DOM access (`document.*` inside components) | present, e.g. portal targets and focus management | **§4.6 — unknown in one respect** |

### 3.1 The ADR-20 provider chain — the one large surface that is *not* a concern

The provider chain (locale, direction, messages, formats, portals, motion,
defaults, nonce, test ids) is built entirely on `provide`/`inject` with typed
`InjectionKey`s — 36 keys, 7 composables. **`provide`/`inject` is part of Vue's
component API, not of the vDOM renderer**, and Vue 3.6 implements it for Vapor
components as well as vDOM ones. The interop run in §1 exercised it
transitively: `DzButton` calls `useDzDefaults()` and `useDzUrlGuard()` on setup,
both of which `inject`, and the component mounted and rendered. That is not a
full proof of the chain across the interop boundary (§4.7), but it is evidence
that `inject` on a vDOM child inside a Vapor app does not throw.

**This matters because it is the biggest surface and the cheapest worry to
retire.** 104 anatomy files and the whole ADR-19/20 contract sit on it.

## 4. UNKNOWN — not tested, and not claimed

Each item below is a specific thing nobody has run. None of them is a known
defect; all of them are reasons the statement in §2 is scoped the way it is.

**4.1 `getCurrentInstance()` and `appContext` inside an interop child.**
`DzButton` calls `getCurrentInstance()` unconditionally and, on the link path,
reads `instance?.appContext.components.RouterLink` to decide whether to render a
router link. The §1 run **proves `getCurrentInstance()` does not throw** for a
vDOM child of a Vapor app — `DzButton` mounted and rendered. What it does **not**
prove is that `appContext.components` is populated the way a vDOM app populates
it: the test app registered no global components, so the `RouterLink` lookup was
never exercised. **Unknown: whether `app.component('RouterLink', …)` on a
`createVaporApp()` is visible to a vDOM child's `appContext`.** This is the
single most consequential unknown in this document, because it is the only place
the library reads the application's component registry.

**4.2 `$el` on a child ref, and `defineExpose` across the boundary.** Five sites
reach through a child component ref to `.$el` (four of them with an
`?? el` fallback for a plain element, which is defensive and good). Inside
`@dzup-ui/core` those children are always vDOM — Reka UI primitives or other
dzup components — so the pattern is safe **within** the library. **Unknown: what
happens if a consumer passes a *Vapor* component into a slot that one of these
five reaches into.** A Vapor component instance has no `$el`, so
`triggerRef.value?.$el?.focus()` would silently no-op (optional chaining) rather
than throw — which is the worse failure mode, because focus management would fail
invisibly. The same question applies in reverse to the 23 `defineExpose` files: a
Vapor parent holding a ref to a vDOM dzup child should work through the interop
proxy, but nobody has run it.

**4.3 Slots passed from a Vapor parent into a vDOM child.** The §1 run passed
**props only** (`tone`, `data-testid`) — no slot content. `@dzup-ui/core` is
slot-heavy (192 `useAttrs`/`useSlots` sites; every compound component is
slot-driven). **Unknown: whether a Vapor-compiled slot renders correctly inside a
vDOM child through `vaporInteropPlugin`, and whether `useSlots()` sees it.** This
is the largest *untested surface area* in the document, as opposed to the largest
*risk*.

**4.4 `<Teleport>` inside an interop child.** Four components teleport
(`DzBlockUI`, `DzSidebar`, `DzPopconfirm`, `DzTour`), and ADR-20's portal target
is provider-configurable. **Unknown: whether a teleport inside a vDOM subtree of a
Vapor app lands in the configured target.** Untested in both the interop config
and — per slice 3 — untestable through the repository's Storybook browser lane
while that lane is broken.

**4.5 Render functions.** Two files import the render-function API from `vue`.
**Unknown** whether they behave identically under interop; not exercised.

**4.6 Direct DOM access.** Components read and write the document for focus
management, portal hosts and the ADR-15 theme script. These are ordinary DOM
calls and do not depend on a component instance, so there is **no reason to
expect a problem** — but "no reason to expect" is not evidence, and it is
recorded here rather than in §3.

**4.7 The provider chain across the boundary, end to end.** §3.1 shows `inject`
works for an interop child. **Unknown: whether a `provide()` made by a *Vapor*
ancestor is visible to a vDOM dzup descendant.** That is the exact shape a
consumer would use (`DzProvider` wrapped by, or wrapping, Vapor components) and
it has not been run.

**4.8 Everything above is bound to an RC.** `vue@3.6.0-rc.9` is a release
candidate. Memo trigger **D3** requires this statement to be re-verified on every
promotion, and the reason is stated in the memo better than it could be here:
moving to a new Vue minor *invalidates the evidence, not the claim's
plausibility* — and the claim without the evidence is what this repository's
evidence rules exist to refuse.

## 5. INCOMPATIBLE — by construction, and not defects

**5.1 `<Transition>` and `<TransitionGroup>` are vDOM-renderer features.** Four
components use `<Transition>`. These cannot appear in a component compiled in
**Vapor** mode. **This is not a problem for the supported direction**: under
`vaporInteropPlugin` a dzup component remains a vDOM component and keeps its
vDOM renderer, transitions included. It becomes a hard incompatibility only under
the scenario §6 rules out — compiling `@dzup-ui/core` itself in Vapor mode.

**5.2 `<Suspense>` likewise.** `DzAsyncBoundary.vue` is built on `<Suspense>`,
a vDOM-only feature. Same conclusion, same scope.

**5.3 `@dzup-ui/core` cannot be consumed as Vapor components.** There is no Vapor
build, no `vapor` export condition, and no plan for one. A consumer who wants
Vapor-compiled components from this library will not get them. This is the
library's declared posture, not an omission.

**Nothing in the audit is incompatible in the *supported* direction.** Every
item in §5 is incompatible only with a scenario §6 refuses.

## 6. What is explicitly not planned

**Compiling `@dzup-ui/core` in Vapor mode is not scheduled and is not intended.**
The library is a vDOM library; Vapor interop is the supported path and it is the
one that is verified. The memo records this as its Track-D "Non-goal" and this
task re-affirms it. Consumers wanting Vapor-native primitives should compose them
themselves, outside this library's support contract — the same answer this
repository already gives for headless usage.

## 7. How to re-verify, and when

```bash
# from ui/dzup-ui, on a tree where you may change dependencies
yarn test:vue-next:vapor        # pins the lane's Vue, installs, runs, restores, VERIFIES the restore
```

Re-verify when **any** of these is true:
1. the lane's pinned Vue moves (today `vue-next-lane.json` says `3.6.0-rc.6`; the
   registry `rc` tag is **`3.6.0-rc.9`** — the pin is **three RCs stale** and
   repinning it is this task's slice-1 recommendation);
2. `vue@latest` becomes 3.6.x (memo trigger **D1**);
3. `dependencies.vue` is bumped (memo trigger **D2**);
4. any of §4's unknowns is closed by a new test — at which point it moves to §3
   and this document is amended rather than re-asserted.

## 8. Recommendation

**The statement stands, at the scope §2 gives it.** The cheapest three things
that would shrink §4 materially, in order:

1. **Add a slot case to `vapor-interop.spec.ts`** (~30 min) — closes §4.3, the
   largest untested surface, and it is four lines inside a spec that already has
   the whole apparatus.
2. **Add a `provide()` from the Vapor root and assert a dzup descendant reads it**
   (~30 min) — closes §4.7 and, with it, the biggest surface in the library.
3. **Register a stub `RouterLink` on the Vapor app and assert `DzButton` finds
   it** (~20 min) — closes §4.1, the only place the library reads the application
   component registry.

All three are additions to one existing spec, none requires a Vapor build, and
together they would move this document from one verified direction to a verified
*contract*. They are **not** done here: this task's remit is a statement, and
adding test cases to prove a claim the same task then publishes is a change of
scope that should be its own packet with its own review.
