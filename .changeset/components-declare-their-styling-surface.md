---
"@dzup-ui/contracts": minor
"@dzup-ui/testing": minor
"@dzup-ui/core": minor
---

**Components can now declare what a consumer may address, and five of them do: parts, states, and a typed per-part `ui` override.**

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

| Component | Parts you can now address |
|---|---|
| `DzButton` | `root`, `spinner` |
| `DzInput` | `root`, `control`, `input`, `prefix`, `suffix`, `spinner`, `clear`, `error` |
| `DzSelect` | `root`, `trigger`, `icon`, `content`, `viewport`, `input`, `item`, `item-indicator`, `item-label`, `empty`, `error` |
| `DzDialogContent` | `overlay`, `content`, `header`, `viewport`, `footer` |
| `DzTable` (family) | `root`, `content`, `title`, `header`, `body`, `row`, `cell`, `footer` |

```vue
<!-- before: a selector against a generated class, and a prayer -->
<style>.my-form .inline-flex > svg { height: 24px !important; }</style>

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
