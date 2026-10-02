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

Both packed commands reuse installed external dependencies without installing
or downloading packages. Their temporary directories are printed and retained
for diagnosis; `TMPDIR` selects the output location. Datazup operators run them
through the Storage launcher so outputs remain on Storage. The browser install
is needed only when Chromium is absent.

This gate pins the existing Tailwind fixture contract. It qualifies static
styles and the representative packed SSR cases; bound-style compatibility,
public installation instructions, other browser engines, AT and performance
remain separate work.
