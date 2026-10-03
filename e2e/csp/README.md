# Static strict-CSP regression gates

From a clean checkout with the repository dependencies installed:

```sh
yarn test:ssr
yarn test:resolution:packed
yarn playwright install --with-deps chromium
yarn test:csp:packed
```

`yarn test` and `yarn test:coverage` also discover `ssr.spec.ts`. The SSR command
prepares generated tokens and landing counts, then checks source SSR bytes and
the static-style inventory. Restoring any static template style fails it.

The packed resolution command builds and packs `@dzup-ui/testing`, extracts it
outside the repository, and runs native Node and TypeScript consumers through
the public `@dzup-ui/testing/resolution` export. Removing the export fails it.
No private evidence-runner paths or environment setup are required.

The packed CSP command rebuilds contracts, tokens and Core, extracts their
tarballs, and renders representative public component exports without source
aliases or hydration. Chromium compares identical SSR bytes and external CSS
under open and strict policy headers. A deliberate inline-style control must
be blocked, while every library root retains external containment and matching
computed styles. CI invokes all three commands as blocking steps.

The packed consumer copies the first CSS block from
`apps/docs/guide/getting-started.md` into `src/style.css`. It checks actual Button
display, height and fill, and Input control layout, height, fill and border;
token CSS loading and open/strict equality alone cannot pass an unstyled install.
`node --test e2e/csp/install-styled.test.mjs` also pins the README/guide setup,
Tailwind plugin and entry import. Removing the explicit Core `@source` must fail
the packed styling assertion; installed packages are excluded from automatic
Tailwind detection.

A separate packed client page mounts a virtual table, scrolls until both spacer
cells exist, opens the color picker, and checks their zero padding/borders and
the color input's native appearance reset under open/strict headers. Host base
rules deliberately add padding/borders so absent reset utilities cannot pass by
default. This page permits external scripts; its surrounding dynamic bound
styles remain outside the static SSR compatibility claim.

Both packed commands reuse installed external dependencies without installing
or downloading packages. Their temporary directories are printed and retained
for diagnosis; `TMPDIR` selects the output location. Datazup operators run them
through the Storage launcher so outputs remain on Storage. The browser install
is needed only when Chromium is absent.

This gate qualifies the documented Vue/Vite styling setup, static styles and
these representative packed cases. General bound-style compatibility, Nuxt
utility-generation integration, other browser engines, AT and performance
remain separate work.
