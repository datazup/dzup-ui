---
"@dzup-ui/core": patch
"@dzup-ui/nuxt": patch
---

**The Pro package is `@dzup-ui-pro/pro`. The resolver and the Nuxt module named a package that has never existed.**

`DzResolver({ includePro: true })` emitted `from: '@dzup-ui/pro'`, and
`@dzup-ui/nuxt` transpiled and registered components from the same string. No
such package is published under any plan — the commercial tier is
`@dzup-ui-pro/pro` — so every consumer who followed the documented `includePro`
path got an unresolvable import for the one feature the option exists to enable.

The reason it survived is the part worth recording: `resolver.spec.ts` asserted
the *same wrong name* at all three of its Pro sites. The suite was green, the
feature was broken, and the gate certified it. A green test that copies the
implementation's mistake is not evidence.

What changed:

- The resolver emits `@dzup-ui-pro/pro` for Pro components. Its two package
  names are module-local constants, and the spec states the two real names
  independently rather than importing them — asserting an implementation
  against its own constant is what hid this defect.
- `@dzup-ui/nuxt` transpiles and registers Pro components from `@dzup-ui-pro/pro`.
  The `includePro` option name is unchanged.
- `@dzup-ui/codemods`' `rename-imports` now rewrites `dzup-ui/pro` and
  `@dzup-ui/pro-components` to `@dzup-ui-pro/pro`, so a migrated codebase no
  longer lands on the dead name.
- A new repository gate, `yarn validate:package-names`, fails if a retired
  package name reappears outside changelogs, changesets, ADRs, and audit
  records. It is in `yarn validate:all`.

This is a patch: the previous behaviour could not work for anybody. If you set
`includePro: true` against a local `@dzup-ui/pro` alias, repoint it at
`@dzup-ui-pro/pro`.

`includePro: true` still requires the Pro package to be installed, and Pro is
not published yet — the option remains `false` by default.
