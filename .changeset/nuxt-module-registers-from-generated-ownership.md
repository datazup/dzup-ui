---
"@dzup-ui/nuxt": patch
"@dzup-ui/core": minor
---

**`@dzup-ui/nuxt` pushed a stylesheet path the tokens package does not export, so every consumer install failed.**

The module added `@dzup-ui/tokens/dist/tokens.css` to `nuxt.options.css`. That
deep path is not in the tokens package's `exports` map — the declared specifier
is `@dzup-ui/tokens/css` — so a real install died at build time with:

```
Missing "./dist/tokens.css" specifier in "@dzup-ui/tokens" package
```

It resolved in this repository only because the workspace's `node_modules` are
symlinks into the source tree, which is precisely the class of defect a
workspace-alias test cannot see. It was found by installing the packed tarball
into a Nuxt app.

Also in this release:

- **Registration comes from generated ownership data.** The module carried a
  second handwritten Pro list beside the resolver's, and the two had drifted
  from each other and from both packages: it classified the Core components
  `DzAppShell` and `DzCalendar` as Pro, and named Pro components
  (`DzScheduler`, `DzComment`, `DzVirtualTable`) that Pro does not export. Both
  lists are gone; the module reads `@dzup-ui/core/ownership`.
- **`includePro: true` with Pro absent now explains itself.** The build no
  longer fails on an unresolvable import — it logs which package is missing,
  which option asked for it, and the command that installs it, then continues
  with Core.
- **`prefix` stops mangling un-prefixed names.** The old rule was
  `name.slice(2)` unconditionally, which turned `TeamMemberBadge` into
  `AcmeamMemberBadge`. Names without the `Dz` prefix are now registered
  unchanged.
- **`@dzup-ui/core` gains an `./ownership` subpath** exposing the generated
  ownership table, so integrations can read component ownership without
  importing the component library.
