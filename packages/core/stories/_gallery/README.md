# `_gallery` — the `Visual Refresh/*` screens

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
marks them as demo screens. Before TASK-FREE-12 they had no tag and no `storySort`
entry, so they fell through the trailing `'*'` in `preview.ts` and surfaced in the
public sidebar as an unexplained root — an instrument that read as leftover
scaffolding. They are now pinned last in the sort order, below `Core`.

## A11y

This directory is item 5 in the a11y ratchet backlog (`docs/design-tasks.md`): 19
failing stories across 7 files, first counted on 2026-07-16. The failures are real
and mostly `color-contrast`. Note that the `freestyle/` half is hand-written Tailwind
that the library does not control — an a11y failure there is a property of the
comparison target, not of dzup-ui.
