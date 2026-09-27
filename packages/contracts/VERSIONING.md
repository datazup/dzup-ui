# Versioning policy — `@dzup-ui/*` before 1.0

> **Status:** authored by `TASK-N5-01` (2026-09-03). This file is the versioning
> statement for every `@dzup-ui/*` package. It lives in `@dzup-ui/contracts`
> because the contracts package is the one thing every other package — and every
> consumer, and `@dzup-ui-pro/pro` — already depends on inward.
>
> **The three reconciliations in §7 were APPLIED on 2026-09-04** by TASK-R5-O1,
> in the three documents themselves. §7 now records what changed and where, so
> the ruling is auditable rather than merely announced. Nothing was deleted: each
> amended document carries a dated note saying what it used to say and why the
> old wording was wrong.
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
2. written migration notes in the changeset: for each removed prop, what to
   write instead;
3. a codemod entry in `@dzup-ui/codemods` where the change is mechanical,
   named in the changeset's frontmatter so it is released with the removal;
4. a changeset at **minor**, naming the removal in its first line.

> **Amended 2026-09-26 (owner decision D182, with N5-01 D2).** Clause 2 used to
> require *"a dev-mode runtime warning (`warnDeprecated` in `@dzup-ui/compat`,
> the existing utility — it is in `compat`, not `codemods`)"*, and clause 3 did
> not say the codemod must be released. `@dzup-ui/compat` is withheld from
> release, so clause 2 named an artifact no consumer could install. The owner
> released `@dzup-ui/codemods` and kept `compat` withheld; the clauses now name
> only what ships. `DZUP-UI-OWNER-DECISIONS-20260926-R1`.

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

## 7. Reconciliations — RESOLVED 2026-09-04

This statement disagreed with three documents already in the repository. All
three were amended **in place** by `TASK-R5-O1` on 2026-09-04 (report:
`docs/program-2026-09-04/reports/TASK-R5-O1-handoff.md`), each with a dated note
in the amended document recording what it used to say. Nothing was deleted and
no version was released.

**7.1 — `apps/storybook/stories/Versioning.mdx` stated the 1.x mapping.**
✅ **Resolved — amended.** Its bump table said *"major — a breaking change"* and
*"minor — additive, your code still runs"*, and its breaking list was headed
*"Breaking (major only)"* — the correct table for 1.x and the wrong one for the
range every package is actually in. The page now carries **both**: "Today —
while every package is `0.x`" (the §1 mapping, with the caret-range reasoning)
and "At 1.0 — what these numbers will mean" (the original table, correctly
labelled as future). Its breaking-surface list is kept and re-headed "the
breaking bump" rather than "major only", and the deprecation window now reads
"removed in a breaking one — a minor while the packages are `0.x`, a major from
1.0". This file remains the statement of record; the MDX page is its
consumer-facing half.
→ `apps/storybook/stories/Versioning.mdx`

**7.2 — ADR-19 §6 said part removal "is a **major** change".**
✅ **Resolved — amended, as this section proposed.** §6 is now headed *"dual-emit
for one release series; removal is breaking"* and reads *"breaking, and therefore
a minor while the library is `0.x` (a major from 1.0)"*. The second half of the
same amendment landed with it: §6 no longer says the `DataState` widening "ships
as a minor" — under §2.1 a type-level widening is a **patch** — and "adding
parts… is additive" now names the patch position explicitly. Wording only; the
intent is unchanged. The ADR's **status is untouched** (still Proposed —
acceptance is TASK-R0-O2).
→ `docs/adr/ADR-19-public-styling-contract.md` §6

**7.3 — `packages/tokens/TOKENS.md` said the two deprecated sidebar aliases are
"removed in the next major".**
✅ **Resolved — held until 1.0**, the option this section called the safer
default. Before 1.0 there is no next major, so the sentence promised a removal no
releasable version could carry. `--dz-sidebar-text` and `--dz-sidebar-text-hover`
now read *"held until 1.0"*, with the reasoning inline: they cost two lines, and
removing them in a `0.x` minor would break every consumer who took the token ABI
at its word for the sake of that saving. They keep `$deprecated` in the DTCG
export.
→ `packages/tokens/TOKENS.md`

---

## 8. Reading this policy from code

`yarn validate:release-policy` is the gate; `packages/tooling/scripts/release-policy.json`
is its data — the package classification (published / withheld / private), the
`allowMajor` flag, and the ratchets. Changing what the repository considers
publishable is an edit to that file, not to a validator.
