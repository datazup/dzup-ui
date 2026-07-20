# `_gallery` — the `Visual Refresh/*` screens

> **These do not ship.** They are excluded from every Storybook build by default
> (TASK-FREE2-02). To run them:
>
> ```bash
> DZUP_GALLERY=1 yarn workspace @dzup-ui/storybook dev
> ```
>
> The mechanism is an inclusion flag in `.storybook/main.ts` (`INCLUDE_GALLERY`); the
> rationale is in [`docs/storybook-decisions.md`](../../../../docs/storybook-decisions.md).
> A CI sentinel in `check-mdx-links.mjs` fails the build if a `visual-refresh-*` id
> ever appears in a public `index.json`.
>
> **`DzTokenBrowser.stories.ts` in this directory is different — it IS public.** It is
> the `Guides/Design Tokens` page (and `DesignTokens.mdx` attaches to it via
> `<Meta of={…} />`). Never widen the exclusion to the whole directory; `main.ts` names
> it explicitly, and a second sentinel asserts it still builds.

These eight stories are the instrument the design system is **measured with**, not a
reference for using it. Each page renders the same screen three ways:

| Story | Renders |
|---|---|
| `FreeStyled` | `freestyle/*.vue` — raw Tailwind 4, **no dzup-ui, no tokens**. The "looks great" visual target. |
| `DzupUI` | `dzup/*.vue` — the same screen rebuilt from `@dzup-ui/core`. |
| `dzup-ui (datazup brand)` | the `dzup/` build wrapped in `BrandScope`, i.e. under datazup brand tokens. |

Putting the two halves side by side is what makes a gap in the token system visible
and arguable — `docs/visual-refresh/AUDIT.md` scores each token tier (elevation,
color richness, focus treatment, …) by comparing them. That is also why
`color-lint.ts` exempts `freestyle/*` with `token-check-disable-file`: tokenizing the
target would erase the comparison. **Do not "fix" the freestyle screens to use
tokens.** They are supposed to be untokenized.

## Why these carry no `status:*` tag

The maturity ladder in `../_shared/status.ts` grades *components* — things with an
API, a contract, and a support promise. A composed demo screen has none of those, so
a status tag would be a category error rather than a missing field. Both readers of
that taxonomy skip this namespace on purpose:

- `packages/tooling/src/validators/story-status.ts` only checks
  `Core/<Family>/<Component>` titles.
- `apps/storybook/stories/_data/componentStatus.ts` filters the same way, so these
  screens never enter the maturity matrix.

They do carry a `gallery` tag, which makes the set filterable in the sidebar and
marks them as demo screens.

**History.** Before TASK-FREE-12 they had no tag and no `storySort` entry, so they
fell through the trailing `'*'` in `preview.ts` and surfaced in the public sidebar as
an unexplained root — an instrument that read as leftover scaffolding. TASK-FREE-12
pinned them last, below `Core`, on the theory that ordering the root made it legible.
It didn't: the problem was that a screen of raw `indigo-600` Tailwind was published as
documentation at all, next to the rules forbidding it. TASK-FREE2-02 unshipped them.
The `'Visual Refresh'` entry still sits last in `preview.ts`'s sort order, where it is
inert in a public build and keeps the root pinned in a `DZUP_GALLERY=1` one.

## A11y

This directory is item 5 in the a11y ratchet backlog (`docs/design-tasks.md`): 19
failing stories across 7 files, first counted on 2026-07-16. The failures are real
and mostly `color-contrast`. Note that the `freestyle/` half is hand-written Tailwind
that the library does not control — an a11y failure there is a property of the
comparison target, not of dzup-ui.
