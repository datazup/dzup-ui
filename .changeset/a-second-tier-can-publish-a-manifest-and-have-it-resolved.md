---
"@dzup-ui/contracts": patch
"@dzup-ui/core": patch
"@dzup-ui/nuxt": patch
---

**A second-tier package can now publish an ownership manifest, and `includePro` resolves it.**

`DzResolver({ includePro: true })` and the Nuxt module's `includePro` have
advertised a second tier since the resolver was rewritten to exact-name lookup.
Neither could resolve anything, and the reason was not the code: **this
repository had never published the schema an ownership manifest would conform
to.** The shape existed only inside `@dzup-ui/tooling`, which is private, so no
downstream package could produce a conforming manifest even in principle. The
seam was recorded as "blocked" across two programmes, waiting on an artifact
nobody had specified.

**`@dzup-ui/contracts` now publishes that schema.** Pure, dependency-free, and
usable by any package that wants its components auto-imported:

```ts
import { OWNERSHIP_MANIFEST_SUBPATH, readOwnershipManifest } from '@dzup-ui/contracts'
```

- `OWNERSHIP_MANIFEST_SCHEMA_VERSION` (`1.1.0`), `OWNERSHIP_MANIFEST_SCHEMA_MAJOR`
  (`1`) and `OWNERSHIP_MANIFEST_SUBPATH`
  (`./manifests/component-ownership.manifest.json`, a **declared exports
  subpath**).
- `OwnershipManifestDocument` / `OwnershipManifestEntry` and the kind, status and
  tier vocabularies — the same sets this repository's own generator emits, so one
  reader serves both tiers.
- `readOwnershipManifest`, `indexOwnershipManifest`, `consumeOwnershipManifest`,
  `isSupportedOwnershipSchema`, `ownershipSpecifier` and the two diagnostics.

Required per entry: `symbol`, `package`, `subpath`, `kind` — all facts a
component library can generate about itself. `since`, `deprecated`, `family`,
`status`, `subpaths`, `anatomy` and `evidence` are optional. `evidence` is
required of this repository's own manifest and optional here on purpose: it
names authority paths inside the *producing* repository, which a consumer cannot
open and no resolver reads.

**`@dzup-ui/core`** — the resolver reads a conforming manifest from the installed
second-tier package, **as data**, at construction time. It never imports
second-tier runtime source, so nothing in that package executes in your build.
New `resolveFrom` option names the project directory to resolve from (default
`process.cwd()`). Unknown names answer `undefined` in **both** tiers.

**`@dzup-ui/nuxt`** — `includePro` registers the second tier's mountable
components from that manifest, each from the subpath the manifest declares, so a
part can come from a narrower entry point than the root barrel.
`componentsToRegister` takes an optional second argument; every existing call is
unchanged. `proTierMissingMessage()` is deprecated — still exported, no longer
emitted — because a table baked in when `@dzup-ui/core` was built is no longer
the only route to a second tier, and it is not the one that matters: the version
**you** installed is the version whose components you can import.

Three failures, three different owners, three different messages — none of them
silence:

- **Package not installed** → install it, or turn the option off. Unchanged,
  byte for byte.
- **Installed, no conforming manifest** → the subpath to export, named as a gap
  in *that* package rather than something you failed to install.
- **A schema major this build cannot read** → refused with the version named,
  never parsed best-effort. A resolver guessing at a redefined field misroutes
  imports silently, which is the defect this whole path exists to end.

A name both tiers export keeps the first tier's answer and names both packages.
Nothing picks a winner between two tiers at your build time.

Patch, not minor: nothing was removed and no existing answer changed. Names that
used to resolve to `undefined` because no second tier could exist may now
resolve — which is the option finally doing what it says.
