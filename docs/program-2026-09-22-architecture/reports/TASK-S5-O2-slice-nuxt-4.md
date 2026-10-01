# TASK-S5-O2 · slice 2 — Nuxt 4

> **Landed: PARTLY — and the part that mattered was already landed before this
> task started.** The `@nuxt/kit` v4 retarget is done. The peer-range narrowing
> this slice was expected to perform is **refused, with the packet's own premise
> falsified by the registry.** Repository `ui/dzup-ui`, commit **`4e4e46f`**.
> No commit, push, CI dispatch or publish was performed.

## 0. The packet's premise is false — measured first, because everything else depends on it

The task prompt's gap statement says:

> *"the **Nuxt module retargeted to `@nuxt/kit` v4** (Nuxt 3 reached EOL
> 2026-07-31, which makes the `>=3.0.0` floor debate moot)"*

**Both halves are wrong at `4e4e46f`.** The retarget is not pending — it has
already landed. And Nuxt 3 is not EOL in the sense that matters to a peer range:

```
yarn npm info nuxt --fields time
→ 3.21.9   2026-07-18   |  4.5.0  2026-07-18
  3.21.10  2026-07-27   |  4.5.1  2026-07-27
  3.21.11  2026-08-05   |  4.5.2  2026-08-05
```

**`nuxt@3.21.11` was published on 2026-08-05 — five days *after* the stated EOL
date — and it shipped on the same day, to the minute-ish, as `nuxt@4.5.2`.** A
3.x release paired with every 4.x release is the signature of an actively
co-maintained branch, and the `3x` dist-tag points at it. Whatever "EOL
2026-07-31" refers to, the registry does not show an abandoned line.

**This does not make the floor debate moot. It makes narrowing the floor a
change that would drop a still-shipping, still-floor-compatible major for no
measured benefit.** §4 is the recommendation that follows.

## 1. Declared target and current state — measured

```
node -e "const p=require('./packages/nuxt/package.json');
         console.log(JSON.stringify(p.dependencies),JSON.stringify(p.peerDependencies))"
→ {"@dzup-ui/contracts":"workspace:*","@nuxt/kit":"4.5.2"}
  {"@dzup-ui/core":">=0.1.0-alpha.0","@dzup-ui/tokens":">=0.1.0-alpha.0","nuxt":">=3.0.0"}
```

| Thing | Declared | Installed | Verdict |
|---|---|---|---|
| `@nuxt/kit` (the module's own dependency) | **`4.5.2` exact** | **4.5.2** | **the retarget is DONE.** It landed in TASK-R5-O9's Track-C partial, and the changeset `nuxt-module-now-builds-against-nuxt-kit-4.md` is among the 42 pending |
| `peerDependencies.nuxt` | **`>=3.0.0`** | — | unchanged, and §4 says it should stay |
| `nuxt` (dev/fixtures) | pinned | **4.4.5** | the newest Nuxt that installs on this repository's declared Node floor |
| Fixture matrix | `nuxt-majors` job, `.github/workflows/vue-next.yml:173–174` | legs **`3.19.0`** and **`4.4.5`** | pinned exactly, not ranged — §2.2 is why |

### 1.1 Upstream re-verified 2026-09-24

| Package | `latest` | `engines.node` | Bearing |
|---|---|---|---|
| `@nuxt/kit` | **4.5.2** (`3x` 3.21.11) | **`>=18.12.0`** | **the module itself is Node-18-safe at every 4.x.** Installed = latest. No drift |
| `nuxt@4.4.5` | — | **`^20.19.0 \|\| >=22.12.0`** | **floor-compatible** — this is why the fixture pins it |
| `nuxt@4.4.6` | — | `^22.12.0 \|\| ^24.11.0 \|\| >=26.0.0` | **floor-breaking** — the first 4.x that is |
| `nuxt@4.5.2` (`latest`) | 4.5.2 | **`^22.19.0 \|\| ^24.11.0 \|\| >=26.0.0`** | **worse than the memo recorded** (`^22.12.0`); the consumer floor moved up again to **22.19.0** |
| `nuxt@3.21.11` (`3x`) | — | **`^20.19.0 \|\| >=22.12.0`** | **floor-compatible** |
| `nuxt@3.19.0` (matrix leg) | — | `^20.19.0 \|\| >=22.12.0` | floor-compatible |

**Drift from the memo, reported not silently taken:** the memo (Track C) recorded
`nuxt >= 4.4.6` as `^22.12.0 || ^24.11.0 || >=26.0.0`. That is still true of
4.4.6, but `latest` (4.5.2) has since moved its floor to **`^22.19.0`**. The
memo's conclusion is unchanged in kind and sharper in degree.

## 2. What breaks — run, not predicted

### 2.1 The tarball fixtures at Nuxt 4 — already run, at this exact commit

**Not re-run here, and that is the correct decision under README §4.4**
(*"Never redo work a report records"*). TASK-S2-O4 ran the `nuxt-majors` lane in
full at **`4e4e46f`**, under the declared Node floor **v20.19.0**, against
`DZUP_FIXTURE_NUXT=4.4.5`:

> *"`nuxt-majors` fixtures asserting something: **0 of 6** → **6 of 6 green** at
> nuxt 4.4.5, locally; 12 passed / 8 skipped; `core-pro` `unrun` pending
> TASK-S3-O1."* — `TASK-S2-O4-handoff.md` §8

Re-running it would repack `packages/nuxt/test/.tarballs/` (gitignored but
mtime-gated) on a tree carrying sixteen packets' uncommitted work, for an answer
that already exists at the same commit. **The 3.19.0 leg remains unrun** — S2-O4
ran 1 of 2 matrix legs — and that is recorded as a gap, not inferred.

### 2.2 What *would* break if the peer range were narrowed to `>=4.0.0`

Measured, not predicted, from the engines table in §1.1:

| Consumer | Node 20.19.0 (the declared floor) | Node 22.19.0+ |
|---|---|---|
| `nuxt@3.21.11` | **installs** | installs |
| `nuxt@4.4.5` | **installs** | installs |
| `nuxt@4.4.6` … `4.5.2` | **CANNOT install** | installs |

So narrowing `peerDependencies.nuxt` to `>=4.0.0` would:
- **drop `nuxt@3.19.0`–`3.21.11`**, a line that is still shipping and is
  floor-compatible;
- **buy nothing in currency**, because the newest Nuxt 4 a consumer can install
  under ADR-18 is **4.4.5**, not 4.5.2 — the range would admit versions the
  declared Node floor forbids;
- be a **breaking change** under `packages/contracts/VERSIONING.md` (0.x: minor =
  breaking), and therefore unrepeatable after publication.

### 2.3 A documentation defect found and fixed

`packages/nuxt/README.md` asserted two things that are false at `4e4e46f`:

| Line | Said | Reality |
|---|---|---|
| 3 | *"**Nuxt 3** module for `@dzup-ui/core`"* | it depends on `@nuxt/kit@4.5.2` and the fixture matrix's newest leg is `nuxt@4.4.5` |
| 225 | *"The fixtures build on **Nuxt 3.21.11**."* | the matrix pins **`3.19.0`** and **`4.4.5`**; `3.21.11` appears nowhere in it |

**Both corrected** (§5). This is the `<state the supported Nuxt range in the
package README>` half of the prompt, and it was a real defect: the README was
advertising a support posture the repository had already moved off.

## 3. Revertibility

| Revert | Command | What it does NOT restore |
|---|---|---|
| **The README correction (this slice's only write)** | `git checkout -- packages/nuxt/README.md` | **careful: that file was already dirty at START** (` M`, another packet's work), so `git checkout` would destroy that packet's edits too. The safe revert is to re-apply the two original paragraphs by hand; both are quoted verbatim in §2.3 and in this task's handoff |
| The `@nuxt/kit` v4 retarget (already landed, not by this task) | `git checkout -- packages/nuxt/package.json && yarn install`, and delete `.changeset/nuxt-module-now-builds-against-nuxt-kit-4.md` | **the changeset's place in the pending set.** Deleting one of 42 changes what `changeset version` will produce, and `validate:release-policy` counts it |
| A peer-range narrowing (**not performed**) | `git checkout -- packages/nuxt/package.json` **before** publication | **nothing, while unpublished — and everything, after.** A narrowed peer range in a published 0.x package is a `minor` under VERSIONING.md, i.e. breaking, and npm has no unpublish path that consumers' lockfiles respect. **This is the one item in all four slices that is genuinely irreversible after the act**, which is precisely why it is left to the owner |

## 4. Go / no-go, with a costed window

**NO-GO on narrowing the peer range. GO on the two cheap, additive items.**

| Move | Verdict | Window | Reasoning |
|---|---|---|---|
| **`@nuxt/kit` → v4 retarget** | **ALREADY DONE** — nothing to schedule | 0 | `dependencies["@nuxt/kit"] = "4.5.2"` at `4e4e46f`, with a changeset |
| **Narrow `peerDependencies.nuxt` `>=3.0.0` → `>=4.0.0`** | **NO-GO** | — | The packet's premise (Nuxt 3 EOL ⇒ moot) is **falsified** (§0). Memo trigger **C1** — *raise the floor when the Nuxt 3 fixture leg goes red* — **has not fired**; that leg has not even been run at `4e4e46f`. The change is breaking and, after publication, irreversible. Narrowing a range on principle is the exact move `D-S2O4-5`/`-6` are still cleaning up after |
| **Correct the README's Nuxt claims** | **GO — done** | ~20 min | §2.3. A false support statement in the package README is a consumer-facing defect and costs nothing to fix |
| **Run the `nuxt@3.19.0` matrix leg locally** | **GO — the cheapest real unknown left** | ~40 min under Node 20.19.0 | It is 1 of 2 legs and it is the **only evidence that would legitimately move C1**. S2-O4 ran the 4.4.5 leg; nobody has run the 3.x leg at this commit |
| **Make the Nuxt range a *generated* README fact** | **GO, as its own packet** | ~2 h | See `D-S5O2-2` below. Not done here — see the handoff for why a new generator region was judged the wrong thing to add on a programme's last task |

**What this slice unblocks:** nothing is blocked on it — which is itself the
finding. **What a no-go forgoes:** a narrower, more honest-looking peer range
that would be *less* true than the current one.

## 5. Implemented files + API effect

| File | Change | API effect |
|---|---|---|
| `packages/nuxt/README.md` | line 3: "Nuxt 3 module" → "Nuxt module … built against `@nuxt/kit` v4 and supports **both Nuxt 3 and Nuxt 4**". §"Supported Nuxt versions": replaced the single stale sentence with the measured engines table, the two matrix pins (`3.19.0`, `4.4.5`), why they are pinned rather than ranged, and an explicit statement that the floor is **not** being narrowed | **none.** Prose only, outside every `validate:doc-snippets` snippet block and outside every `facts:*` region (this file has **0** such regions — it is in `FACT_DOCUMENTS` but carries no markers, which the generator tolerates by design: *"Documents with no markers are untouched"*) |

**Unscheduled?** No — this is a documentation correction, not a cutover. The
cutover this slice was asked to prepare (the peer-range narrowing) was **not**
performed, and the switch is left to the owner exactly as the authority limits
require.

## 6. ADR-18 interaction — this is the slice that produces it

**A Nuxt 4 move is an ADR-18 amendment input, and here is the exact input:**

> The newest `nuxt` a consumer can install on this repository's declared Node
> floor (`^20.19.0 || >=22.13.0`) is **`4.4.5`**. `nuxt@4.4.6` requires Node
> `^22.12.0`; `nuxt@4.5.2` (`latest`) requires **`^22.19.0`**. `@nuxt/kit` is
> unaffected (`>=18.12.0` at every 4.x), so **the module is not the constraint —
> the consumer's runtime is.**

This is memo trigger **C2** stated as a measurement: *raise the Node floor to
`>=22.12.0` when the fixtures need `nuxt >= 4.4.6`*. They do not need it yet. If
the floor ever moves, it is not a dependency bump — `.nvmrc`, `engines` in two
`package.json` files and ~14 CI `node-version:` values move together or
`validate:engines` fails.

**Recorded, not resolved.** TASK-S0-O3 found ADR-18 not ready (Node floor
disputed, two `node:fs` glob sites needing Node 22). Nothing here resolves that;
this slice adds one more measured argument to its input pile, and the argument
points the same way the `node:fs` glob sites do: **towards 22, eventually, and
not yet.**

## 7. Decision raised

**`D-S5O2-2` 🟢 NEW — the Nuxt support range is prose, and prose drifts.** It
drifted twice before this task found it (§2.3). `packages/nuxt/README.md` is
already in `FACT_DOCUMENTS` in
`packages/tooling/scripts/generate-readme-facts.ts` and carries **zero** fact
regions, so the machinery to prevent this exists and is unused for this file.
Options: (a) add a `facts:nuxt-support` region rendering `peerDependencies.nuxt`,
`dependencies["@nuxt/kit"]` and the two matrix pins, gated by
`validate:readme-facts` — modelled exactly on `renderVapor`, which already proves
the pattern for a *compatibility claim* · (b) leave it as prose and re-audit
manually · (c) remove `packages/nuxt/README.md` from `FACT_DOCUMENTS` so the list
stops implying a coverage that does not exist. **Recommendation (a)**, as its own
small packet. The matrix pins would need a data source — the cleanest is to lift
the two legs out of the YAML into a `nuxt-majors.json` beside
`vue-next-lane.json`, which the workflow then reads, so one file is the truth for
both CI and the README.
