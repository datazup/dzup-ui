---
"@dzup-ui/core": patch
---

**Every overlay now teleports where your application says, including the four that never asked.**

Nineteen components portal part of themselves out of the DOM — dialogs, sheets,
popovers, tooltips, menus, select and combobox panels, the command palette, the
lightbox, the tour, the sidebar's mobile overlay and the blocking layer. Each one
decided its own destination. Fifteen took a `portalTo` prop you had to pass to
every instance; **four teleported to a hard-coded `body` with no way to redirect
them at all**: `DzBlockUI`, `DzSidebar`, `DzPopconfirm` and `DzTour`.

Now they all follow one rule:

```
instance `portalTo`  →  DzProvider `portal`  →  document.body
```

```vue
<DzProvider portal="#app-overlays">
  <App />
</DzProvider>
```

**Nothing changes without a provider.** With no `portal` set and no `portalTo`
prop, every component teleports exactly where it did before — which is what let
nineteen components migrate in one change instead of nineteen.

**This closes the shadow-DOM limitation the Styling Cookbook documented twice as
unsolvable.** Custom properties inherit through a shadow boundary and
stylesheets do not, so an overlay that escaped to `document.body` lost the
adopted sheet and rendered unstyled. Point `portal` at a container inside the
root and it stays within the boundary:

```vue
<DzProvider :portal="shadowOverlayContainer">
  <App />
</DzProvider>
```

**New:** `portalTo` on `DzBlockUI`, `DzSidebar`, `DzPopconfirm` and `DzTour`, so
the per-instance escape hatch is uniform across all nineteen.

`portalDisabled` and `portalDefer` are unchanged and stay per-instance — they
are about whether *this* overlay teleports, not about where overlays go.

New guide: **Portals & Embedding**, covering the shadow-root recipe (both halves
— adopted stylesheets *and* the portal container), the end-to-end testing recipe
(`portal` plus `test-id-prefix`), and the CSP nonce note.
