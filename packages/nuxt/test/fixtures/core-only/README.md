# core-only

The baseline: a consumer who installs `@dzup-ui/core` + `@dzup-ui/nuxt` from
tarballs and writes `<DzButton>` with no import statement.

Proves the module registers Core components from the artifact a consumer really
receives, not from a workspace alias.
