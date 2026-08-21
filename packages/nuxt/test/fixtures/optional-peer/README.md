# optional-peer

Written to prove that a consumer who only uses plain components need not install
`reka-ui`. **Measuring it proved the opposite**, and the fixture now records what
is true rather than what was hoped.

`@dzup-ui/core` declares `reka-ui` in `peerDependencies` with no
`peerDependenciesMeta.optional`, so:

- npm 7+ installs it automatically, even though this fixture's `package.json`
  never asks for it; and
- removing it fails the build with `Rollup failed to resolve import "reka-ui"`
  — for an app whose only component is `<DzButton>`.

So Core has **no optional peers** today, and the reassessment's
"one representative optional peer, present and absent" case has nothing to bind
to. Making `reka-ui` genuinely optional is an owner decision that needs two
things: `peerDependenciesMeta` on the package, and a registration strategy that
does not pull a Reka-backed component into a Button-only app.
