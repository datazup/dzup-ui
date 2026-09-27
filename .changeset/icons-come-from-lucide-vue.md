---
"@dzup-ui/codemods": patch
"@dzup-ui/core": minor
---

**Icons come from `@lucide/vue`, not the deprecated `lucide-vue-next`.** `lucide-vue-next` is deprecated on npm in favour of `@lucide/vue`, its renamed continuation. `@dzup-ui/core` now depends on `@lucide/vue ^1.47.0`. The glyph names it uses are unchanged.

This is a `minor` because three things you can see change (owner decision D175):

- **Every icon's rendered `class` changes.** `lucide lucide-chevron-down-icon` becomes `lucide lucide-chevron-down`, and `X`'s `lucide lucide-xicon` becomes `lucide lucide-x`. `Filter` renders `lucide lucide-funnel lucide-filter` and `MoreHorizontal` renders `lucide lucide-ellipsis lucide-more-horizontal`. If your CSS or tests select on a `lucide-*` class that an icon inside a dzup component renders, update the selector.
- **Icons render `aria-hidden="true"` by default.** `@lucide/vue` 1.x marks every icon decorative. The dzup components already give icon-only controls their accessible name, so no control loses its name. If your own icons carry meaning, give the control an `aria-label`.
- **Three glyphs are redrawn:** `CalendarIcon`, `Clock` and `Filter`. The date pickers, the time picker and the data-grid header show the new drawings.

**If your own code imports `lucide-vue-next`,** you can keep it, and you will then install both packages. To move to one:

```sh
npx @dzup-ui/codemods swap-icon-library src/
```

It rewrites `lucide-vue-next` imports, deep subpaths, re-exports and dynamic `import()` to `@lucide/vue`, in `.ts`, `.tsx`, `.js` and every `<script>` block of a `.vue` file. It is not part of `all`; run it on its own, then your formatter.

**`@dzup-ui/codemods`:** `swap-icon-library` now rewrites `.vue` files. It used to parse a whole single-file component as TypeScript and fail on every one, so it changed only `.ts` files.

The registry items the site serves for `shadcn add` now name `@lucide/vue` in their `dependencies` and in their source.
