# Versioning policy — `@dzup-ui/*` before 1.0

> **Status:** authored by `TASK-N5-01` (2026-09-03). This file is the versioning
> statement for every `@dzup-ui/*` package. It lives in `@dzup-ui/contracts`
> because the contracts package is the one thing every other package — and every
> consumer, and `@dzup-ui-pro/pro` — already depends on inward.
>
> **Three reconciliations in §7 are `[!owner]`** and are marked as such. They are
> places where this statement disagrees with prose already in the repository.
> Until an owner rules, the older text is not deleted; the disagreement is
> recorded here so nobody has to discover it during a release.
>
> **This document authorises no release.** It states what a number would mean.

---

## 1. The rule

Every published `@dzup-ui/*` package is `0.x`. Under semver §4 a `0.x` version
grants no compatibility guarantee at all, so `0.x` libraries must *choose* a
convention and say which one. This is ours, and it is the one npm's default
caret range already assumes:

| Bump | `0.2.0 →` | Means | A consumer on `^0.2.0` |
|---|---|---|---|
| **minor** | `0.3.0` | **A breaking change.** Something that used to work no longer does. | **does not receive it.** They opt in by widening the range. |
| **patch** | `0.2.1` | **Additive or a fix.** New API, or a defect corrected. Existing code keeps working. | **receives it automatically.** |
| **major** | `1.0.0` | **Not used before 1.0.** A `major` bump *is* the 1.0 release. | — |

The reason the mapping is shifted rather than the usual major/minor/patch is
mechanical, not stylistic: `^0.2.0` resolves to `>=0.2.0 <0.3.0`. The minor
position is the only one a caret range protects in `0.x`, so the minor position
is where a break has to go. Putting a break in the patch position would push it
into every consumer's next `yarn install` unannounced.

**`major` is refused by a gate.** `yarn validate:release-policy` fails on a
changeset that declares `major` against a `0.x` package, because such a bump
would ship `1.0.0` — declaring the library stable — as a side effect of a
routine change. Releasing 1.0 is a deliberate act with its own exit criteria
(see `docs/program-2026-09/reports/1-0-exit-criteria-2026-09.md`), and flipping
`allowMajor` in `packages/tooling/scripts/release-policy.json` is part of it.

---

## 2. What "breaking" covers

A change is **breaking** when it removes, renames, or narrows anything in the
five surfaces below. Each surface names the artifact that records it, so
"is this breaking?" is answerable by reading a file rather than by opinion.

### 2.1 Component API — the manifests

Recorded in `packages/core/manifests/public-api.manifest.json` (the barrel
exports are generated from it, ADR-01) and
`packages/core/manifests/component-ownership.manifest.json` (1,327 symbols with
`kind` and `subpath`).

Breaking:

- Removing or renaming a component, prop, emit, slot, expose entry, injection
  key, composable, or exported type.
- Removing a value from a variant taxonomy (`ButtonVariant`, `CanonicalSize`, …).
- **Narrowing** a type the consumer passes *in* (a prop, a composable argument).
- **Widening** a type the library hands *out* — a slot prop, an emit payload, an
  expose return, a composable return. This direction is the one that gets
  missed: widening `file: File` to `file: File | DzFileRef` on a slot is source
  code the consumer already wrote that no longer type-checks.
- Changing a prop's default in a way that changes rendered output.

Not breaking: adding an optional prop, slot, emit or export; adding a value to a
taxonomy (it widens a type the consumer may have been switching on
exhaustively — noted, not classed as breaking); widening a type the consumer
passes in.

### 2.2 Styling contract — ADR-19

Public, and therefore breaking to remove or rename:

- `data-part` names (ADR-19 §3; the shared vocabulary is
  `ANATOMY_PART_VOCABULARY` in `@dzup-ui/contracts`, and a component's own
  anatomy file is authoritative for what it emits).
- A component's declared `data-state` enum values (ADR-19 §4).
- The presence-only boolean state attributes: `data-disabled · data-loading ·
  data-invalid · data-readonly · data-required · data-selected · data-checked ·
  data-expanded · data-active · data-dragging · data-pending`.
- The recipe attributes: `data-size · data-variant · data-tone · data-density ·
  data-orientation`.
- The `ui` prop's part union for a component.
- The six cascade layer names: `dz-reset, dz-tokens, dz-base, dz-components,
  dz-utilities, dz-overrides`.

Explicitly **not** the contract, and free to change in a patch:

- The class names `tv()` emits. They are recipe output and carry no promise
  (`apps/docs/guide/styling-contract.md`).
- DOM structure. **A part is a promise about identity, not about structure**
  (ADR-19 §3): a part may move in the tree, gain a wrapper, or change element
  type without that being breaking.
- Whether a physical CSS utility is replaced by its logical equivalent
  (`text-left` → `text-start`) — the rendered class changes, the contract does
  not.

### 2.3 Token ABI — `packages/tokens/TOKENS.md`

The `--dz-*` custom property names **and the values they resolve to** are the
ABI. Breaking:

- Renaming or removing a `--dz-*` name.
- **Changing a token's resolved value.** `TOKENS.md` is explicit that this is
  breaking, and it is stricter than a name-only rule: a consumer's contrast
  audit, visual baselines and brand match are all built on values.

Not the ABI: DTCG group paths, the `$extensions["com.dzup"]` payload
(`untyped`, `coverage`, `themeVarying`), and which tier a token is declared in.
`--dz-appshell-header-bg` moving between the semantic and component tiers is not
breaking.

`TOKENS.md` §1 currently defers to this document — *"the 0.x release policy for
`@dzup-ui/*` is an open packet (`TASK-N5-01`)… treat this section as a statement
of contract, and the release policy as the thing that will make it a promise."*
This is that policy. The deferral can be retired.

### 2.4 Package surface

Breaking: removing a package; renaming a package; removing or repointing an
`exports` map subpath; raising a peer dependency floor (`vue`, `reka-ui`);
raising `engines.node` (ADR-18).

Not breaking: a deep path that is not in the `exports` map. Nothing reachable
only by reaching past the export map is API.

### 2.5 Provider and runtime contract — ADR-20

Breaking: removing or renaming an injection key, or narrowing a provider option
shape. Additive provider options are additive.

---

## 3. The accessibility carve-out

Two directions, and they land in different positions. This is the clause
`TASK-N5-02` (the six un-honoured ARIA props) is gated on.

**Correcting a rendered accessibility attribute is a `patch`.** Removing a
dangling `aria-describedby` id, dropping an `aria-live` that conflicts with
`role="alert"`, fixing a token that fails WCAG AA contrast: these change what
the browser sees and can break a consumer's own DOM snapshot, and they still
ship as a patch. We would rather change a colour or an attribute than keep a
known accessibility failure until a range bump.

**Removing a declared prop is a `minor`.** A component that declares
`ariaLabelledby` and does nothing with it is a promise-shaped lie, and the
honest fix is to delete the declaration. Deleting it is a type removal under
§2.1 and ships in the minor position — never as a patch, no matter how
un-honoured the prop was. A prop that silently did nothing still type-checked in
consumer source, and removal stops that source compiling.

Every such removal ships with all four of:

1. the type removed from the component's `.types.ts`;
2. a dev-mode runtime warning (`warnDeprecated` in `@dzup-ui/compat`, the
   existing utility — it is in `compat`, not `codemods`);
3. a codemod entry in `@dzup-ui/codemods` where the change is mechanical;
4. a changeset at **minor**, naming the removal in its first line.

---

## 4. Deprecation

A deprecated API keeps working for **at least one full `0.x` minor series** and
is removed in a **minor**, not a major. Announcing and removing in the same
release is not deprecation.

A deprecation ships with a named replacement, a dev-mode console warning naming
it, a changeset, and a working migration path — a codemod where the change is
mechanical, written instructions where it is not.

**There is no repository-wide ledger of deprecated symbols.** Three partial ones
exist: `packages/tooling/scripts/retired-package-names.json` (package names, 1
entry), `DEPRECATED_TOKENS` in `packages/tokens/src/dtcg.ts` (2 entries), and
`@deprecated` JSDoc on the `compat` adapters. Nothing records a deprecated
*prop*, *part* or *state*. That gap is recorded, not closed here.

---

## 5. What is not covered at all

Anything not named in §2 may change in any release:

- `tv()` recipe internals and the class names they emit.
- DOM structure and element types (see §2.2).
- Anything imported from a deep path rather than the package's `exports` map.
- `@dzup-ui/compat` and `@dzup-ui/codemods` — migration tooling, versioned with
  the library, not a stable API of their own.
- `@dzup-ui/tooling` — private, unpublished.

---

## 6. Where the numbers come from

Changesets. A pull request that changes any surface in §2 carries a
`.changeset/*.md` naming each affected package and its level. The level is the
author's claim; `yarn validate:release-policy` checks the claim's *shape*
(known package, legal level, no `major`, no mixed skipped/published changeset)
and `yarn changeset status` proves the plan assembles at all.

Neither gate can tell whether a change is genuinely breaking. That judgement is
review's, and §2 exists to make it a shared one.

---

## 7. Reconciliations — `[!owner]`

This statement disagrees with three documents already in the repository. None is
edited by `TASK-N5-01`; the disagreement is recorded so a release does not
discover it.

**7.1 — `apps/storybook/stories/Versioning.mdx` states the 1.x mapping.** Its
bump table says *"major — a breaking change"* and *"minor — additive, your code
still runs"*, and its "What counts as breaking" list is headed *"Breaking (major
only)"*. That is the correct table for 1.x and the wrong one for the version
range every package is actually in. **Decision needed:** amend `Versioning.mdx`
to carry the 0.x mapping now and the 1.x mapping as "what these numbers will
mean at 1.0", or supersede it with this file. Its breaking-surface list is good
and is largely absorbed above.

**7.2 — ADR-19 §6 says part removal "is a **major** change".** ADR-19 is
**Proposed**, so this is a proposed rule meeting a proposed policy. Under §1,
`major` before 1.0 means `1.0.0`, so read literally ADR-19 forbids removing a
part until the library is stable. **Decision needed:** amend ADR-19 §6 to say
"breaking, and therefore a minor while the library is 0.x" — a wording change,
not a change of intent. ADR-19's other release sentences already agree with this
document ("adding parts… is additive"; the `DataState` widening "ships as a
minor" — under §2.1 that widening is type-level and would now be a patch, which
is the second half of the same amendment).

**7.3 — `packages/tokens/TOKENS.md` says the two deprecated sidebar aliases are
"removed in the next major".** Same shape as 7.2: before 1.0 there is no next
major. **Decision needed:** either restate as "removed in a future minor" or
hold them until 1.0 deliberately. Holding them is defensible — they cost two
lines — and is the safer default until an owner says otherwise.

---

## 8. Reading this policy from code

`yarn validate:release-policy` is the gate; `packages/tooling/scripts/release-policy.json`
is its data — the package classification (published / withheld / private), the
`allowMajor` flag, and the ratchets. Changing what the repository considers
publishable is an edit to that file, not to a validator.
