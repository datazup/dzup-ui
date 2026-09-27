# Chromatic: finish it or retire it — owner decision packet

> **TASK-R2-O6**, closing N1-O6 decision **D1** and program decision **D5**.
> Bound to `ui/dzup-ui` HEAD **`2d51eec`**, worktree dirty (445 uncommitted
> paths). Every repository number below was re-measured today; the vendor
> numbers are cited and dated and must be re-checked at purchase time.
>
> **This packet decides nothing.** Both options are written out so the owner
> can pick one. `[!owner]`

---

## 1. What is actually in the repository today

| fact | where | verified |
|---|---|---|
| A Chromatic workflow exists and runs on every push and PR to `main` | `.github/workflows/chromatic.yml` | today |
| The job is `continue-on-error: true` | `chromatic.yml:28` | today |
| Chromatic itself runs `exitZeroOnChanges: true` | `chromatic.yml:70` | today |
| It needs `secrets.CHROMATIC_PROJECT_TOKEN`, which is not in the repository | `chromatic.yml:62` | today |
| The dependency is installed | `apps/storybook/package.json:45` → `chromatic: ^11.0.0` | today |
| Two snapshot modes are declared globally | `apps/storybook/.storybook/preview.ts:348-353` → `light`, `dark` | today |
| TurboSnap is on | `chromatic.yml:75` → `onlyChanged: true` | today |
| The repository is **public** and **MIT**-licensed | `github.com/datazup/dzup-ui`, `LICENSE` | today |

So the job runs on every push, builds every package, builds Storybook, and then
calls `chromaui/action` with an empty token. It costs CI minutes on every commit
and produces no evidence. **That is the worst of the three available states** —
worse than finishing it and worse than deleting it — which is why this is a
decision and not a backlog item.

## 2. The volume, re-measured at `2d51eec`

```
apps/storybook/storybook-static/index.json → 1,648 entries
  story : 1,453
  docs  :   195
```

**1,453 stories × 2 declared modes = 2,906 snapshots per full build.**

N1-O6 measured 2,880 at `51dec93`. The number has grown by 26 in eighteen days,
which is the relevant trend: the volume tracks the story count, and the story
count only goes up.

TurboSnap (`onlyChanged: true`) reduces the *steady state* to the stories
affected by a diff. It does **not** reduce these events, each of which
re-snapshots everything:

- any change to `preview.ts`, `main.ts` or a global decorator (this repo changed
  `preview.ts` three times in program-2026-09 alone);
- any token change — and `@dzup-ui/tokens` is upstream of every story;
- a dependency bump, a Storybook upgrade, or a lockfile change;
- the first build on a new branch with no ancestor baseline.

A realistic month for this repository therefore contains **at least one, usually
several, full-volume builds.**

## 3. Cost

Vendor pricing as advertised in September 2026 — **re-verify before signing**:

| plan | included snapshots / month | full builds of this repo that fits in |
|---|---|---|
| Free (commercial) | 5,000 | **1.7** |
| paid entry, ~$149/mo | 35,000 | 12.0 |
| Team, ~100,000 | 100,000 | 34.4 |
| **Open-source plan** | **unlimited, free, for qualifying projects** | n/a |

The free commercial tier does **not** fit this repository: two full builds
exhaust it, and TurboSnap cannot prevent two full builds in a month here.

**The decisive fact is the last row.** `datazup/dzup-ui` is public and MIT.
Chromatic advertises a free plan with unlimited snapshots for qualifying
open-source projects. If this repository qualifies, **"finish" costs an
application and a secret, not $149/month** — and the entire cost argument for
"retire" disappears.

*What the agent could not determine:* whether Chromatic accepts this specific
project. That is an application, not a lookup, and it is an owner action.

## 4. Option FINISH

**Do:**

1. Apply for the open-source plan. If refused, price the ~$149/mo tier against
   §2 and decide again — this packet's recommendation flips if it is refused.
2. Add `CHROMATIC_PROJECT_TOKEN` as a repository secret.
3. Run once on `main` to establish the baseline build.
4. Delete `exitZeroOnChanges: true` (`chromatic.yml:70`) — **first**, and alone.
   Accepting diffs in Chromatic's UI becomes required, but the job still cannot
   fail the build while `continue-on-error` stands.
5. Only after the lane has been green three consecutive times on `main`, delete
   `continue-on-error: true` (`chromatic.yml:28`) and add the check to branch
   protection.

**Buys:**

- The review UI, which is the genuinely hard part and the part N1-O6 declined to
  build. Acceptance becomes a named human clicking against a visible diff.
- One rendering environment, vendor-operated. It makes the entire platform
  problem this task measured (§ TASK-R2-O6 handoff, probe A/B) **somebody
  else's problem**: no `win32` vs `linux`, no font-set lock, no container pin.
- Story-level coverage of all 1,453 stories immediately, against the in-repo
  lane's 8 components.

**Costs:**

- Evidence lives off-repository. `<evidence_rules>` requires every quoted metric
  to be bound to a commit; a Chromatic build URL is not a committed artifact and
  the capability matrix cannot join against it without a network call. **This
  does not go away with money.**
- It snapshots *stories*; this repository's unit of evidence is the *component*.
  1,453 stories over 144 components needs a reduction rule nobody has written.
- Vendor dependency on a gate that can block merges.

## 5. Option RETIRE

**Do:**

1. Delete `.github/workflows/chromatic.yml`.
2. Remove `chromatic` from `apps/storybook/package.json` (dependency + script).
3. Keep `parameters.chromatic.modes` in `preview.ts` **or** delete it — it is
   inert either way; keeping it costs nothing and preserves the light/dark mode
   declaration if the decision is revisited.
4. Record the decision in `docs/storybook-decisions.md`, which currently points
   at a promotion checklist that would no longer exist.

**Buys:**

- CI minutes back on every push and PR: a full `yarn build` plus a Storybook
  build, today producing nothing.
- One visual system instead of two half-wired ones, which was N1-O6's
  recommendation §6.4 and is still the honest position.
- All evidence stays committed and commit-bound.

**Costs:**

- No review UI. A diff remains three PNGs in an output directory.
- The in-repo lane stays at 8 of 144 components and — per this task's measured
  finding — **cannot gate CI at all until the CI runner's rendering environment
  is pinned** (handoff §4). Retiring Chromatic removes the only option that
  sidesteps that problem entirely.

## 6. Recommendation

**Apply for the open-source plan first; decide FINISH or RETIRE on the answer.**

The reasoning is that this task's measurement changed the balance N1-O6 struck.
N1-O6 recommended building in-repo because the missing piece was *authority*,
and authority was buildable. That was right and it was built. What this task
measured is that the *second* missing piece — a stable rendering environment —
is **not** free in-repo: 20 of 24 snapshots change when two font packages are
installed in the same container, so an in-repo linux lane only gates CI if CI is
pinned to one image forever (handoff §4, probe B). That is a real, permanent
maintenance obligation that Chromatic discharges by construction.

So:

- **If the OSS plan is granted** → **FINISH**. It is free, it solves the
  environment problem the in-repo lane cannot solve cheaply, and the two lanes
  are complementary rather than redundant: Chromatic covers 1,453 stories with a
  human review UI, the in-repo lane keeps 8→89 components' evidence *committed
  and commit-bound* for `<evidence_rules>`. Keep both, and say in
  `docs/storybook-decisions.md` which question each answers.
- **If the OSS plan is refused** → **RETIRE**. $149/month is not worth buying for
  a project that already has a working comparator and an authority model, and a
  dead workflow is worse than no workflow. Then pin the CI container (handoff §4
  decision 2) and roll the in-repo lane out instead.

**Do not leave it as it is.** Whichever way the answer goes, the current state —
a workflow that runs on every commit, builds everything, and calls a vendor with
an empty token — is the only outcome with no defenders.
