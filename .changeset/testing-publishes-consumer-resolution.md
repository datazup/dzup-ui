---
"@dzup-ui/testing": patch
---

**Expose the built `@dzup-ui/testing/resolution` entrypoint for checkout co-development.**

The published testing package now exports `createDzupResolution` and its types
through built JavaScript and declarations. External build configurations can
import this public subpath instead of the private, source-only
`@dzup-ui/tooling/resolution` entrypoint. Existing private tooling imports remain
compatible; the resolution algorithm is unchanged.

This is a Node build-configuration helper. It requires an explicit absolute
dzup-ui checkout root; `externalized` mode also requires the selected packages
to be built. It does not install packages, build a checkout, or establish npm
registry availability. Applications consuming installed packages should use
their native package exports without checkout aliases.
