# RESIDUAL-01 — gate cleanup batch (register rows #3, `D-S2O1-1`, `D-S2O1-2`)

**Tree:** `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a` + uncommitted worktree (the
16-task programme, uncommitted **by design** — the owner commits, not the agent).
**Run:** 2026-09-25. **Repository:** `ui/dzup-ui` (OSS, `@dzup-ui/*`) only.

> **Status: COMPLETE.** Written incrementally (three agents in this programme
> stalled mid-task and lost everything they had not yet written), so every section
> was appended as soon as its evidence existed rather than at the end.

**The two-line summary.** With the icon alignment's lockfile change in place
`yarn validate:all` **exits 0 over all 60 links — the first green aggregate in this
programme** — and links **52–59 executed inside the aggregate for the first time in
the repository's history**, link 60 (`yarn build`) being new. An agent may not leave
a mutated `yarn.lock`, so on the tree as delivered the chain still **exits 1 at link
51**, and **one owner command — `yarn install` — is all that separates the two**.

## 0. The batch

| # | register row | title | section |
|---|---|---|---|
| 1 | **#3** (`D174` ≡ `D175` ≡ `N5-04 D2` ≡ `D-S0O1-3` ≡ `D-S1O3-5`) | clear the `validate:all` red at link 51 — icon single-version | §1 |
| 2 | **`D-S2O1-2`** (row 7) | `packages/mcp` declares MIT and ships no licence text | §2 |
| 3 | **`D-S2O1-1`** ≡ `D-S0O1-1(c)` (row 16) | `packages/nuxt` has no type gate; `yarn build` is not a chain link | §3 |

**Measured entry state** (never quoted from a doc):

```
node -e "console.log(require('./package.json').scripts['validate:all'].split('&&').length)"   →  59
git rev-parse HEAD                                                                             →  4e4e46f…
git status --porcelain | wc -l                                                                 →  289
sha256sum yarn.lock  →  6332fae92448b45b41c114ab44e47087038eb59e48116cddccf3d17644e87adb
```

---

## 1. Implemented files, and what each one changes

| file | change | API / artifact effect |
|---|---|---|
| `apps/landing/package.json:31` | `lucide-vue-next` `^0.475.0` → `^0.477.0` | none. Workspace app, not a published package |
| `apps/sandbox/package.json:15` | same | none. Workspace app, retired as a product (row #17) |
| `apps/landing/playground-template/package.json:15` | same | **template payload, not an install.** See §1.2 |
| `packages/mcp/LICENSE` | **new** — byte-identical copy of `packages/nuxt/LICENSE` | `package/LICENSE` now in the published tarball (§2) |
| `packages/mcp/package.json` | `files` gains `LICENSE` as its first entry; `//files` note extended | tarball contents only; no code, exports or types |
| `.changeset/the-mcp-package-ships-the-licence-it-declares.md` | **new**, `@dzup-ui/mcp: patch` | pending changesets 41 → 42 |
| `packages/nuxt/tsconfig.json` | `allowImportingTsExtensions: false` **removed** (inherits `true` from the base); `$comment2` records why | none — this view does not emit |
| `packages/nuxt/tsconfig.build.json` | `allowImportingTsExtensions: false` **declared here** instead | **none, proved**: `packages/nuxt/dist` md5s identical before and after a rebuild (§3.2) |
| `package.json` → `typecheck:all` | `+ tsc --noEmit -p packages/nuxt/tsconfig.json`, inserted before `yarn typecheck:apps` (packages then apps) | the lane now covers 9 projects + apps instead of 8 + apps |
| `package.json` → `//typecheck:all:nuxt` | **new** explanatory key, matching the `//typecheck:all:mcp` convention | documentation |
| `package.json` → `validate:all` | `&& yarn build` **appended as link 60** | link count 59 → **60**; links 1–59 keep their numbers |
| `package.json` → `//validate:all:build` | **new** explanatory key | documentation |

No ratchet ceiling was raised, no allowlist widened, no file excluded and no error
suppressed. The only `exclude`/flag movement in the batch (`packages/nuxt`'s
`allowImportingTsExtensions`) **increases** what is checked: three spec files that
no compiler had ever read are now in the gate.

### 1.1 Why the three apps went UP rather than `core` going down

`^0.477.0` is what the **published** package (`@dzup-ui/core`) declares, and it is
the version a consumer installing `@dzup-ui/core` receives. Moving `core` down to
`^0.475.0` would align the gate by changing the published surface to match two
workspace apps — one of which (`apps/sandbox`) is retired. Aligning the apps up
changes nothing a consumer can see. It is also forward-compatible with row #3
option (a) (the `@lucide/vue ^1.47.0` swap), which still stands on the merits:
`lucide-vue-next` is deprecated upstream, and the gate still prints that as an
advisory after this change.

### 1.2 `playground-template` is copied, not installed — verified, not assumed

The task flagged this as a thing to check rather than assume. It is **not a
workspace**: root `workspaces` is `["packages/*","apps/*"]`, and this directory is
`apps/landing/playground-template`, one level deeper. Its package is named
`dzup-ui-playground`, and `grep -n playground-template yarn.lock` → **exit 1, no
match**; `grep -n dzup-ui-playground yarn.lock` likewise finds no workspace entry.
So editing it has **zero lockfile effect**.

The gate agrees, and says so in its own words — `validate:icon-duplicates` prints
the file under a heading it reserves for exactly this case:

```
  shipped to consumers, not installed here:
    apps/landing/playground-template/package.json    lucide-vue-next@"^0.477.0"
    apps/landing/public/r/*.json                     lucide-vue-next in 40 item(s)
```

It was still worth changing: the template is what the docs playground scaffolds
for a reader, so leaving it on `^0.475.0` would hand every reader the duplicate
this batch exists to remove. It is payload, so it is a **consumer-facing fact**,
not a dev-tree detail.

### 1.3 The lockfile — what happened, what the owner must run

`validate:icon-duplicates` **reads `yarn.lock`, not `node_modules`**, by design
(its own header: *"a lockfile is what a consumer's CI installs from"*). So the
three manifest edits alone do **not** clear link 51. Re-run immediately after the
edits, with `yarn.lock` untouched:

```
yarn validate:peers > peers-1.log 2>&1 ; echo "exit $?"   →  exit 1

  2 lockfile entr(ies) · 2 distinct version(s) · 1 name(s) · 3 declaration(s)
  ✗ [single-version] 2 versions of the icon library resolve (0.475.0, 0.477.0); exactly 1 may.
        lucide-vue-next@0.475.0  declared as "^0.475.0"            ← no declarant left; orphan in the lockfile
        lucide-vue-next@0.477.0  declared as "^0.477.0" by @dzup-ui/core, @dzup-ui/landing, @dzup-ui/sandbox
```

Note the shape of that failure: all **3** declarations now read `^0.477.0` and the
`^0.475.0` line has no declarant at all. The violation is a **stale lockfile
entry**, nothing else.

**What the owner must run — exactly one command:**

```
yarn install --mode=update-lockfile      # resolution only; no link step, no node_modules churn
```

or a plain `yarn install` if `node_modules` should be corrected at the same time
(see the `lock-vs-disk` advisory in §1.4 for why that is the better of the two).

**Measured proof of what that command does.** `yarn.lock` was backed up
byte-exactly, `yarn install --mode=update-lockfile` was run so the *real* diff
could be measured rather than guessed, and the file was then restored. `yarn`
produces **exactly four changes**, and one of them is not this batch's:

```
1563c1563   @dzup-ui/landing   <     lucide-vue-next: "npm:^0.475.0"
                               >     lucide-vue-next: "npm:^0.477.0"
1593a1594   @dzup-ui/nuxt      >     "@dzup-ui/contracts": "workspace:*"      ← PRE-EXISTING drift, not this batch
1615c1616   @dzup-ui/sandbox   <     lucide-vue-next: "npm:^0.475.0"
                               >     lucide-vue-next: "npm:^0.477.0"
12993,13001d12993  the whole "lucide-vue-next@npm:^0.475.0" resolution block, deleted
```

> **New finding, worth its own line.** The `@dzup-ui/nuxt` → `@dzup-ui/contracts`
> dependency added by the *uncommitted* S3-O1 work was **never recorded in
> `yarn.lock`**. So the lockfile in this worktree is already stale independently of
> this batch, and a CI job running `yarn install --immutable` on the committed tree
> would fail on that line alone. The owner's install corrects it for free; it is
> named here so it is not later mistaken for a side effect of the icon alignment.

**`yarn.lock` is unchanged by this batch.** The experiment window was opened and
closed; the file was restored from the byte-exact backup and re-hashed:

```
sha256  before any work   6332fae92448b45b41c114ab44e47087038eb59e48116cddccf3d17644e87adb
sha256  after restore     6332fae92448b45b41c114ab44e47087038eb59e48116cddccf3d17644e87adb   ← identical
git status --porcelain yarn.lock   →  (no output: clean)
```

### 1.4 Link 51 with the lockfile aligned — measured, then reverted

Run inside the experiment window, with the yarn-resolved lockfile in place:

```
yarn validate:peers > peers-2.log 2>&1 ; echo "exit $?"   →  exit 0

  1 lockfile entr(ies) · 1 distinct version(s) · 1 name(s) · 3 declaration(s)
  ✓ icon library: one name, one version.
```

Two advisories remain, both report-only by construction and **neither introduced
by this batch**:

- `! [deprecated-ident]` — `lucide-vue-next` is deprecated upstream. This is row
  #3 option (a), the real swap, still open. The gate's own text: *"this line is not
  a failure."*
- `! [lock-vs-disk] yarn.lock resolves [0.477.0] but node_modules holds [0.475.0,
  0.477.0]` — an artifact of `--mode=update-lockfile` skipping the link step. Its
  own text: *"REPORT ONLY — this line cannot fail the build (D193) … Run `yarn
  install` before trusting a green run."* **This is the reason to prefer a plain
  `yarn install` over `--mode=update-lockfile`**: the advisory disappears only when
  the link step runs.

---

## 2. `packages/mcp/LICENSE` — closed, with tarball proof

### 2.1 What the convention actually is (read, not assumed)

```
md5sum packages/*/LICENSE LICENSE
7281b4a9175a6c90c5572d47c901edeb  packages/{codemods,compat,contracts,core,nuxt,tokens}/LICENSE   and  ./LICENSE
2321025aaf591f2afa8e249ea24749a4  packages/testing/LICENSE
```

`packages/testing/LICENSE` is the **only** outlier and `diff` shows the text is
identical — the difference is line endings (it is LF; the other six and the
repository root are CRLF). The majority convention, including the root licence, is
therefore CRLF, and the copy was made with `cp` from `packages/nuxt/LICENSE` so it
is byte-identical rather than merely equivalent:

```
MIT License

Copyright (c) 2026 DataZup
…
md5  packages/mcp/LICENSE  = 7281b4a9175a6c90c5572d47c901edeb   ← same as its six siblings and the root
file packages/mcp/LICENSE  = ASCII text, with CRLF line terminators
```

The copyright line and year are **unchanged** (`Copyright (c) 2026 DataZup`); no
year, holder or wording was invented.

### 2.2 `files` — and why the entry is not redundant

`files` was `["README.md","dist","docs","server.json"]`; every other package puts
`LICENSE` **first**:

```
contracts ["LICENSE","VERSIONING.md","dist"]      core     ["LICENSE","README.md","dist"]
testing   ["LICENSE","README.md","dist","security-corpus"]   tokens ["LICENSE","dist"]
nuxt      ["LICENSE","dist"]                      compat   ["LICENSE","dist"]
codemods  ["LICENSE","bin","dist"]                mcp      ["README.md","dist","docs","server.json"]  ← was
```

so `mcp` now reads `["LICENSE","README.md","dist","docs","server.json"]`. npm and
yarn both include a root `LICENSE` by default whatever `files` says — but a
default is not a declaration, seven siblings declare it, and the entry is what
makes the inclusion a property of this manifest rather than of the packer's
version. The `//files` sibling key records that reasoning in the manifest itself.

### 2.3 Tarball proof

`npm pack` is unusable here and was not used: these are yarn-4 workspaces with
`workspace:*` siblings, which `npm pack` rejects with `EUNSUPPORTEDPROTOCOL`.

```
yarn workspace @dzup-ui/mcp pack --out <scratch>/mcp-pack.tgz   →  exit 0
tar -tzf mcp-pack.tgz                                           →  exit 0

package/CHANGELOG.md
package/LICENSE                 ←  the point of this item
package/README.md
package/dist/index.d.ts … package/dist/tools.js.map        (12 files)
package/docs/mcp-tool-surface.json
package/package.json
package/server.json

tar -xzOf mcp-pack.tgz package/LICENSE | md5sum
7281b4a9175a6c90c5572d47c901edeb    ←  identical to the sibling packages' licence
```

The tarball was then deleted; the scratch directory holds only `.log`/`.txt`
files. (Note for whoever repeats this on Windows: `tar -tzf C:/…` fails with
*"Cannot connect to C: resolve failed"* because `tar` reads `C:` as a remote host
— `cd` into the directory first, or pass `--force-local`.)

A `patch` changeset accompanies it, as required for any change to a published
package: `.changeset/the-mcp-package-ships-the-licence-it-declares.md`.

---

## 3. The gate gap — `packages/nuxt` in the typecheck lane, `yarn build` as a link

### 3.1 What wiring `packages/nuxt` into `typecheck:all` surfaced

The 17 errors the register names were already repaired by TASK-S2-O1, so the
question was what the project reports **now**. Answer: **6 errors, all of one
kind, all in spec files, and the gate — not the code — was wrong.**

```
node node_modules/typescript/bin/tsc --noEmit -p packages/nuxt/tsconfig.json   →  exit 2

packages/nuxt/src/module.pro.spec.ts(50,98):        error TS5097: An import path can only end with
packages/nuxt/src/module.pro.spec.ts(51,40):        error TS5097   a '.ts' extension when
packages/nuxt/src/module.second-tier.spec.ts(61,98) error TS5097   'allowImportingTsExtensions' is
packages/nuxt/src/module.second-tier.spec.ts(62,40) error TS5097   enabled.
packages/nuxt/src/module.spec.ts(41,18):            error TS5097
packages/nuxt/src/module.spec.ts(42,40):            error TS5097
```

Every one is an `await import('./module.ts')` — **the repository's own mandated
import form** (CLAUDE.md rule 5). `packages/nuxt/tsconfig.json` had
`allowImportingTsExtensions: false`, overriding the base config's `true`.

Why it was there: TypeScript refuses `allowImportingTsExtensions` together with
emit, and `tsconfig.build.json` — which **does** emit — `extends`
`tsconfig.json`. The flag was in the typecheck view purely to satisfy the build
view that inherits from it. But the typecheck view sets `noEmit: true` and its
`include` is `src/**/*.ts`, which covers the three specs.

**The fix moves the flag to the project that actually needs it** rather than
excluding anything:

- `packages/nuxt/tsconfig.json` — drop the override, inherit `true` from
  `tsconfig.base.json`.
- `packages/nuxt/tsconfig.build.json` — declare `allowImportingTsExtensions:
  false` there, where emit makes it mandatory and where `src/**/*.spec.ts` is
  already excluded.

This is safe because **no non-spec file in the package uses a `.ts` specifier** —
verified, not assumed:

```
grep -rn "from '[^']*\.ts'|import('[^']*\.ts')" packages/nuxt/src/
→ 9 hits, all in module.{pro,second-tier,}.spec.ts ; packages/nuxt/src/module.ts: none
```

So the build program contains no `.ts` specifier and the flag is inert there.
Nothing was disabled, excluded or allowlisted: the spec files went from
*unchecked* to *checked*.

### 3.2 Proof the published artifact is unchanged

The edit touches a published package's build config, so the emitted bytes were
hashed on both sides rather than reasoned about:

```
find packages/nuxt/dist -type f | sort | xargs md5sum   > before.txt
  2be5a8b3350536ea62d12eb2b23c39b9  packages/nuxt/dist/module.d.ts
  e0bfc58cba8d75f121ae08869042f6a3  packages/nuxt/dist/module.js
  c7da33a8bb1d3c37f77cb4fb3c5ae3f9  packages/nuxt/dist/module.js.map

yarn workspace @dzup-ui/nuxt build   →  exit 0
find … | xargs md5sum > after.txt ; diff before.txt after.txt   →  exit 0   (identical)
```

**No changeset was added for `@dzup-ui/nuxt`**, and that is a deliberate call, not
an omission. Two reasons: the published bytes are provably identical, and an
unreleased `@dzup-ui/nuxt: patch` changeset for exactly this tsconfig split
already exists (`.changeset/olive-pugs-invite.md`, from TASK-S2-O1) — this change
is a refinement *inside* that same unreleased change, so a second changeset would
declare a second patch for one shipment. Register row #10 (re-level the
over-declared changesets) is the reason not to inflate the set without cause.

### 3.3 `typecheck:all` — the new lane

```
tsc      --noEmit -p packages/tokens/tsconfig.json
tsc      --noEmit -p packages/contracts/tsconfig.json
tsc      --noEmit -p packages/testing/tsconfig.json
vue-tsc  --noEmit -p packages/core/tsconfig.json
vue-tsc  --noEmit -p packages/compat/tsconfig.json
tsc      --noEmit -p packages/codemods/tsconfig.json
tsc      --noEmit -p packages/mcp/tsconfig.json
tsc      --noEmit -p packages/mcp/tsconfig.test.json
tsc      --noEmit -p packages/nuxt/tsconfig.json          ←  NEW
yarn typecheck:apps
```

```
yarn typecheck:all > typecheck-all.log 2>&1 ; echo "exit $?"   →  exit 0   (zero output)
```

`packages/nuxt` was the last published package with no type gate. Every one of the
six published packages is now in the lane.

`typecheck:all` is what `.github/workflows/ci.yml:48` runs in the blocking
`typecheck` job, and that job is a `needs:` prerequisite of **six** other jobs, so
the new project gates the whole workflow, not just one step.

### 3.4 `yarn build` as link 60 — why the end, and why it matters

Appended, never inserted. Three reasons, in order of how expensive getting it
wrong would be:

1. **Every link number in this programme's reports is a position in one string.**
   The count has moved six times in a week; the register cites "link 51" and
   "links 52–55" by number. Inserting renumbers every citation silently.
2. **The position is load-bearing in the other direction too.** Links 1–59 are the
   *pre-build* lane: several validators treat a stale or missing `dist/` as a
   warning precisely because nothing has built yet.
   `.github/workflows/ci.yml:306` flips the same condition to an error in its
   *post-build* validate step and says so in a comment. Building first would
   change what 59 gates mean; building last adds an assertion and moves none.
3. It is what the register's own recommendation says (*"append at the end, as link
   51 did"*).

Why the link is needed at all: the build was red from `589be13` until
2026-09-23 and **not one of the 59 links noticed**, because a broken build is not
a broken typecheck — the failure was a `rootDir`/emit contradiction that only an
emitting compiler can see. §3.1's TS5097 finding is the mirror image: a `--noEmit`
check sees spec files the build excludes. Both halves are needed, and both are now
wired.

```
node -e "console.log(require('./package.json').scripts['validate:all'].split('&&').length)"   →  60
last two links:  yarn validate:runtime-floor | yarn build
```

---

## 4. Aggregate qualification

### 4.1 The first aggregate attempt — and what the chain caught

The first end-to-end run **failed at link 3**, on this batch's own edit:

```
yarn validate:all > log 2>&1 ; echo "exit $?" > exitfile          (4 lines of output)

packages/nuxt/tsconfig.build.json
  5:5  error  Expected object keys to be in specified order.
             'allowImportingTsExtensions' should be after 'paths'   jsonc/sort-keys
✖ 1 problem (1 error, 0 warnings)
```

`eslint --fix` was **not** used (it has corrupted a string literal in this
repository before); the key was moved by hand to sit after `paths`, and the seven
touched JSON files were re-linted individually to **exit 0**.

> **Harness hazard, third recorded instance.** The task-completion notice for that
> run read *"completed (exit code 0)"*. The **file-captured `$?` read `exit 1`.**
> The notice reports the wrapping subshell. Register §1.2 records two prior
> instances; this is the third, and it is the reason every exit code in this report
> comes from `; echo "exit $?" > file` and not from a notification.

Two notes on scope: the root `package.json` is **not** in the lint lane
(`eslint packages/ apps/ e2e/ --max-warnings 0`), so the three pre-existing
`jsonc/sort-keys` errors a direct `eslint package.json` reports are out of scope
and were left alone. And `packages/nuxt/tsconfig.json`'s new `$comment2` key
sorts correctly after `$comment`, so it needed nothing.

### 4.2 The run this report quotes

Run end to end after the fix, with the aligned lockfile in place:

```
yarn validate:all > validate-all-2.log 2>&1 ; echo "exit $?" > validate-all-2.exit

exit 0          ←  1,292 lines of output · 130 green lines · all 60 links executed
```

**`yarn validate:all` exits 0. That has not happened at any point in this
programme.** Every prior measurement stopped at link 51.

### 4.3 Pre-existing vs new — which links executed in the aggregate, and when first

| link | gate | status in this run | first aggregate execution? |
|---|---|---|---|
| 1–50 | `typecheck` … `release-policy` | green | no — routinely reached |
| **51** | `validate:peers` → `validate:icon-duplicates` | **✓ `icon library: one name, one version.`** | **first time green in this programme** |
| **52** | `validate:licenses` | ✓ `All dependency licenses are compatible.` | **YES — first ever execution inside the aggregate** |
| **53** | `validate:tree-shake` | ✓ 4 PASS (`DzButton` 194.2 KB … `DzAlert` 192.3 KB), `All checks passed!` | **YES** |
| **54** | `validate:evidence-binding` | ✓ 4 artifacts bound, HEAD `4e4e46f6` | **YES** |
| **55** | `validate:deprecations` | ✓ 16 annotated · 16 WITH a record · 0 WITHOUT | **YES** |
| **56** | `validate:adr-status` | ✓ 3 documents · 0 Accepted · 3 Proposed · 3 grandfathered (ceiling 3) | **YES** |
| **57** | `validate:at-runs` | ✓ 534 cells · 0 executed · no archived session records yet | **YES** |
| **58** | `validate:docs-freshness` | ✓ with a `⚠` (below) | **YES** |
| **59** | `validate:runtime-floor` | ✓ floor 20.19.0 · 2,313 files · 2 APIs above it, both listed | **YES** |
| **60** | **`yarn build`** — NEW | ✓ 8 of 8 workspaces emit | **YES — the link did not exist before** |

So **links 52–59 executed inside the aggregate for the first time in the
repository's history** — the thing register row #3 said four of them had never
done — and link 60 executed for the first time because it is new. The
`evidence-binding` gate, *"built precisely to catch this programme's failure
mode"* (row #3's words), has now run in the chain it was written for.

Link 60 is proved to have run all the way through, not just started — the last
three workspaces build with `tsc`, which prints nothing on success, so the
artifacts were timestamped instead:

```
packages/codemods/dist/index.js   12:15:47
packages/nuxt/dist/module.js      12:15:51      ←  the package that had no gate
packages/mcp/dist/index.js        12:15:54
```

### 4.4 Advisories in the green run — all report-only, all pre-existing

None of these is introduced by this batch and none can fail the chain. They are
listed so a reader does not mistake a green aggregate for an empty one:

- **`! [dirty-input]` ×4** (link 54) — `component-ownership.manifest.json`,
  `quality-matrix.json`, `capability-matrix.json`, `component-meta.json` each have
  declared inputs modified in the worktree. Gate's own words: *"the COMMITTED
  binding is what this gate proves; this line is not a failure."* This is register
  row #2 (commit the worktree), unchanged.
- **`⚠ docs-freshness`** (link 58) — *"the stamps agree, but the BUILD is
  unmeasured or stale … Run with `--require-dist` (the deploy lane does) to make
  that an error."* By design: the pre-build lane cannot assert a build.
- **`! [deprecated-ident]`** (link 51) — `lucide-vue-next` is deprecated upstream.
  Row #3 option (a), still open.
- **`! [lock-vs-disk]`** (link 51) — `node_modules` still holds both versions
  because `--mode=update-lockfile` skips the link step. Disappears on a plain
  `yarn install`.
- **`STALE @dzup-ui/mcp: dist … predates packages/mcp/package.json`** (link 32,
  `validate:published-imports`) — a **direct consequence of editing a published
  manifest in the same run**, and a nice illustration of why link 60 belongs at the
  end: the pre-build lane correctly reports that it is judging yesterday's build,
  and link 60 then refreshes it, so the *next* run's lane sees a dist newer than
  the manifest.

### 4.5 The aggregate on the tree as delivered — run end to end, not inferred

**This matters more than §4.2 and must not be skipped.** `yarn.lock` was restored
to its original bytes, and the whole chain was then re-run end to end on exactly
the tree the owner receives — after the documentation in this batch was written, so
this run also re-qualifies links 1–50 against the new files:

```
sha256sum yarn.lock   →  6332fae92448b45b41c114ab44e47087038eb59e48116cddccf3d17644e87adb   (original)
yarn validate:all > validate-all-delivered.log 2>&1 ; echo "exit $?" > validate-all-delivered.exit

exit 1          ←  469 lines · 119 green lines · stops at link 51
```

**Exactly one `✗` in the whole log**, and it is the expected one:

```
✗ [single-version] 2 versions of the icon library resolve (0.475.0, 0.477.0); exactly 1 may.
      lucide-vue-next@0.475.0  declared as "^0.475.0"                      ← orphan lockfile entry
      lucide-vue-next@0.477.0  declared as "^0.477.0" by @dzup-ui/core, @dzup-ui/landing, @dzup-ui/sandbox
```

So **as delivered: `yarn validate:all` exits 1 and the failing link is 51**, the
same link and the same clause as before this batch — but with **0** declarants
left on the old range instead of 3, and with links 52–60 now known-green in the
aggregate rather than never having run there. Links 52–60 are again *unreached* in
the aggregate until the owner acts. **One command changes that, and it is the only
thing standing between this tree and a green 60-link chain:**

```
yarn install
```

> The harness reported *"completed (exit code 0)"* for this run too. The
> file-captured `$?` reads **exit 1**. That is the **fourth** instance in this
> batch alone (§4.1 was the third overall); the hazard is not occasional.

### 4.6 What the two runs prove together

| | aligned lockfile (§4.2) | as delivered (§4.5) |
|---|---|---|
| `validate:all` exit | **0** | **1** |
| links executed | **60 of 60** | 50 of 60, stops at 51 |
| green lines | 130 | 119 |
| log lines | 1,292 | 469 |
| distinct `✗` | **none** | 1 (`[single-version]`) |

The pair is the point: the second run says what the owner has, the first says what
one command buys, and neither is a projection.

### 4.7 Tests

`yarn test` is not a `validate:all` link. No `.ts`, `.vue`, `.css` or `.mts`
source file was touched by this batch — only JSON manifests, two `tsconfig`s and a
licence file — so the suite was exercised where it could plausibly be affected and
then in full:

```
node node_modules/vitest/vitest.mjs run packages/nuxt/src                → exit 0   3 files,   69 tests
node node_modules/vitest/vitest.mjs run packages/mcp/src \
     packages/tooling/src/validators/mcp-surface.spec.ts                 → exit 0   5 files,  154 tests

yarn test > test-1.log 2>&1 ; echo "exit $?" > test-1.exit               → exit 0
  Test Files  572 passed (572)
       Tests  11126 passed | 3 skipped | 1 todo (11130)
    Duration  355.00s
```

**One run, no flake** — the documented "exit 1 with zero failing tests under load"
reporter flake did not occur, so there is only one run to quote. The numbers are
identical to the pre-batch baseline (572 / 11,126 / 0 failed).

`mcp-surface.spec.ts` is included deliberately: it is the spec behind
`validate:mcp` (link 34), the gate that reads `packages/mcp`'s `files` array, and
`files` is what item 2 changed.

### 4.8 Documentation added after the green run, and why no gate re-run was owed

The three documents this batch writes all live under
`docs/program-2026-09-22-architecture/`. **No link in the 60-link chain scans that
path** — verified rather than assumed: `validate:doc-snippets`' `DOC_ROOTS` is
`README.md`, three package READMEs, `apps/storybook/stories`, `apps/landing/src`
and `apps/docs/guide`; `validate:docs-pages` and `validate:docs-freshness` read
`apps/docs`; `validate:docs-size` reads the built `dist`s; `validate:readme-facts`
reads `README.md`; `validate:adr-references` reads `docs/adr` plus source, and this
batch cites no new ADR number. The §4.5 run nevertheless happened **after** the
documents were written, so links 1–50 are qualified against them in fact and not
only in argument.

---

## 5. Ratchet movements (old → new)

| ratchet / counted quantity | old | new | held by |
|---|---|---|---|
| `validate:all` chain links | 59 | **60** | count it, never quote it: `node -e "console.log(require('./package.json').scripts['validate:all'].split('&&').length)"` |
| `validate:all` links that have ever executed **in the aggregate** | 50 of 59 | **60 of 60** | the run in §4.2 |
| `typecheck:all` TypeScript projects | 8 + `typecheck:apps` | **9 + `typecheck:apps`** | `package.json#typecheck:all`, `ci.yml:48` |
| **Published packages with no type gate** | **1** (`@dzup-ui/nuxt`) | **0** | `typecheck:all` |
| **Published packages shipping no licence text** | **1** (`@dzup-ui/mcp`) | **0** | qualification row 10's tarball clause |
| Packages under `packages/` with a `LICENSE` | 7 of 8 | **8 of 8** | `ls packages/*/LICENSE` |
| Icon-library declarants on `^0.475.0` | 3 | **0** | `grep -rn lucide-vue-next --include=package.json` |
| Icon-library versions resolving in `yarn.lock` | 2 | **2 as delivered · 1 after the owner's `yarn install`** | `validate:icon-duplicates` |
| Pending changesets | 42 | **43** | `find .changeset -name '*.md' -not -name 'README.md' \| wc -l` |
| Dirty paths | 289 | **295** | `git status --porcelain \| wc -l` |

**No ceiling was raised and no allowlist widened.** `maxProposedCitedFromCode`
(3), `maxGrandfathered` (3), `maxBreaches` (2), `minSupportedLocales` (1), the
36,000,000 B docs-size ceiling, `i18n-completeness-ceilings.json` and the
`check:links` allowlist are all **byte-identical** to their pre-batch state. The
one flag this batch moved (`allowImportingTsExtensions` in `packages/nuxt`)
*widens what is checked*: it took three spec files from unchecked to checked.

---

## 6. Owner decisions — closed, and raised

### 6.1 Closed to the limit of agent authority

| row | id | new status |
|---|---|---|
| **#7** | **`D-S2O1-2`** | **CLOSED — option (a) executed in full.** File, `files` entry and `patch` changeset all landed; tarball proof in §2.3. Nothing owner-only remains except the commit |
| **#16** | **`D-S2O1-1`** ≡ `D-S0O1-1(c)` | **CLOSED — option (a) executed in full.** Both halves: `packages/nuxt` in `typecheck:all`, `yarn build` as link 60. The register called it *"a one-line owner act"*; it was two lines plus a real defect in the typecheck view (§3.1) |
| **#3** | `D174` ≡ `D175` ≡ `N5-04 D2` ≡ `D-S0O1-3` ≡ `D-S1O3-5` | **option (b) executed; row stays OPEN on two counts.** (i) The manifest half is done — 3 declarants aligned to `^0.477.0`, zero on `^0.475.0` — but the gate reads `yarn.lock` and **an agent may not leave a mutated lockfile**, so the last step is the owner's `yarn install`. (ii) Option (a), the `@lucide/vue ^1.47.0` swap, is untouched and still right on the merits: the upstream deprecation is permanent and the gate still prints it |

### 6.2 Raised

1. **`D-RES01-1` 🟢 — the icon alignment needs one owner command, and there is a
   second reason to run it.** `yarn install` (preferred) or
   `yarn install --mode=update-lockfile`. It makes link 51 green and links 52–60
   aggregate-qualified on the committed tree. **It also fixes a pre-existing
   lockfile staleness this batch discovered**: `@dzup-ui/nuxt` → `@dzup-ui/contracts`
   is in the manifest and **not** in `yarn.lock` (§1.3), so any CI job running
   `yarn install --immutable` fails on the committed tree today, for a reason that
   has nothing to do with icons. Options: (a) plain `yarn install` — also clears the
   `lock-vs-disk` advisory; (b) `--mode=update-lockfile` — lockfile only, advisory
   persists; (c) neither, and link 51 stays red. **Recommendation: (a).** Exactly 4
   lines change in `yarn.lock` and they are enumerated in §1.3, so the diff is
   reviewable in ten seconds.
2. **`D-RES01-2` 🟢 — should `qualify:package` be re-run to flip row 10?**
   Qualification row 10's only red clause was *"`@dzup-ui/mcp` ships no LICENSE file
   in its tarball"* (`e2e/package-qualification/rows-policy.ts:207`), and §2.3
   proves the tarball now carries it. **It was deliberately not re-run**:
   `yarn qualify:package` writes `docs/qa/release/<candidate>/package-qualification.{md,json}`,
   which on a dirty tree is stamped `admissible: false` and fires SC-3 (register rows
   #2, #6) — a report nobody may cite. Options: (a) re-run after the commit, as part
   of the release-evidence regeneration; (b) re-run now and accept an inadmissible
   artifact; (c) accept §2.3's tarball listing as the proof. **Recommendation: (a),
   with (c) standing in the meantime.**
3. **`D-RES01-3` 🟢 — `yarn test` is still not a `validate:all` link.** This batch
   closed the *build* hole; the same argument applies to the suite, and the
   counter-argument is real (a ~10-minute link in a lane that is supposed to be
   runnable on a fresh clone, plus the documented vitest reporter flake — `yarn test`
   has exited 1 with zero failing tests under load). Options: (a) append
   `yarn test` as link 61; (b) leave it to CI, where it already has its own job;
   (c) append a fast subset. **Recommendation: (b)** — CI's `test` job is a `needs:`
   prerequisite of the same downstream jobs, so the coverage exists; the build was
   different precisely because **nothing** covered it.

---

## 7. Ranked next packet

1. **Register #2 / `D127` — commit the 295-path worktree.** Owner-only, and it
   remains the single act that unblocks the most. It is now also the prerequisite
   for this batch's own last step, since the lockfile change must land in the same
   commit as the three manifests it follows from.
2. **`D-RES01-1` — the one `yarn install`.** Cheapest act in the register with the
   largest measurable effect: it turns a 60-link chain green and clears a
   pre-existing `--immutable` failure at the same time.
3. **Register #3 option (a) — the `@lucide/vue ^1.47.0` swap.** Now the *only*
   remaining half of row #3, and no longer on the critical path for any gate:
   codemod, visual re-baseline, AT re-baseline, `minor`. Note the tension register
   row #12 records — the codemod that would perform it is currently unpublishable.
4. **Register #6 / `D-S2O2-3` — API baselines for the five unbaselined published
   packages.** Blocked on 1; structurally red until done.
5. **Register #8 / `D-S2O1-3` — the Nuxt nonce half.** *"A defect whose fix is
   already in the repository"*: `DZ_NONCE_KEY` exists and
   `packages/nuxt/src/module.ts` never reads it. Small, self-contained, and now
   covered by both a type gate and a build link.
6. **Register #17 / `D177` — remove `apps/sandbox`.** Cheaper than it was: it is no
   longer one of two conflicting declarants, so removing it is pure hygiene with no
   gate consequence either way.
