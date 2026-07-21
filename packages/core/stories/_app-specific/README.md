# `_app-specific` — the `Core/Feedback/App-Specific/*` badges

> **These do not ship.** They are excluded from every Storybook build by default
> (TASK-FREE2-06). To run them:
>
> ```bash
> DZUP_APP_SPECIFIC=1 yarn workspace @dzup-ui/storybook dev
> ```
>
> The mechanism is an inclusion flag in `.storybook/main.ts` (`INCLUDE_APP_SPECIFIC`);
> the rationale is in [`docs/storybook-decisions.md`](../../../../docs/storybook-decisions.md).
> A CI sentinel in `check-mdx-links.mjs` fails the build if a
> `core-feedback-app-specific-*` id ever appears in a public `index.json`.

Four components whose vocabulary is **datazup's product domain**, not design-system
semantics:

| Component | Domain vocabulary |
|---|---|
| `GovernanceBadge` | coordinator patterns — `supervisor`, `contract_net`, `blackboard`, `peer_to_peer`, `council` |
| `TeamMemberBadge` | a participant's role + live status *within a team run* |
| `DzRunStatusBadge` | run-orchestration status — `PENDING` … `CANCELLED` |
| `DzTokenProgressBar` | LLM token-budget bar, 70% / 90% thresholds |

A catalog is a promise of general-purpose reuse. None of these are reusable outside
datazup, so publishing them next to `DzBadge` and `DzProgress` — which are what a
general consumer actually wants — makes the catalog mean less. Unpublishing them is
cheaper and more honest than a paragraph explaining that four entries are not for you.

## What "does not ship" does NOT mean

They are **not** deprecated, unfinished, or unmaintained. The components are still
exported from `@dzup-ui/core`, still built, and still consumed internally. These
stories are how they are developed and reviewed — they are held to the same bar as
every other story:

- **`contract-parity`**, **`story-status`**, **`story-dod`** and **`color-lint`** all
  recurse from `packages/core/stories`, so this directory is gated by all four.
- Each component keeps its unit + contract specs under `packages/core/src/components/feedback/`.
- **`play()` + the WCAG 2.2 AA axe audit still run in CI.** The `storybook-test` job
  sets `DZUP_APP_SPECIFIC: '1'` precisely so that excluding these from the *published*
  build does not exclude them from *testing*. That runner reads its story list from
  `.storybook/main.ts`, so without the flag these would have gone untested in silence.

Only *publication* changed. If you are editing one of these, run with the flag above
and the page is exactly what it always was.

## Why this is a directory and not four names in a glob

`main.ts` names what **does** build, and a `!…` negation was rejected for the reason
TASK-FREE2-02 gives: `stories` entries are globbed independently, so an ineffective
negation fails **open** — it publishes the thing it was meant to hide. A directory
also means a fifth app-specific story lands in the right place, or is visibly in the
wrong one. A list of four filenames would have rotted on the first addition.

## Why the counts don't mention these

`apps/landing/scripts/build-counts.ts` derives `documentedComponents` from
`Dz*.stories.ts` under `stories/<family>` — this directory is not a family, so the
four dropped out of that count automatically when they moved here (139 → 137). The
`catalog` count (205) is unchanged: it globs `.vue` files under `src/components`, and
the components are still there, which is correct — they are still in the library.
**Never hand-edit a count** to reflect a move; `claims.spec.ts` reads the shipped
artifacts back off disk and fails on any literal.

## The naming debt

`TeamMemberBadge` and `GovernanceBadge` lack the `Dz` prefix every other export
carries. That prefix rule binds *catalog* entries, and these are no longer catalog
entries, so the rename does not earn a `packages/compat` shim + codemod + changeset
today. It is still real debt. Fix it if either is ever promoted to public — in which
case the rename is a precondition of promotion, not a follow-up.

## Promoting one back

The honest signal is a second, unrelated consumer asking for it — not a hunch that it
*seems* generic. Promotion means: give it the `Dz` prefix, replace the product
vocabulary with the caller's (a status badge whose statuses are a generic prop, not
`PENDING…CANCELLED`), and move the story back into `stories/feedback/`, where the
counts and the ⌘K component index pick it up with no further plumbing.
