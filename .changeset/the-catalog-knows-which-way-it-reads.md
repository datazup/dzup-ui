---
"@dzup-ui/contracts": minor
"@dzup-ui/core": patch
"@dzup-ui/testing": minor
---

**Components lay out, navigate and point the right way in a right-to-left document — and say so in a form something can check.**

`DzProvider` has resolved `dir` since the previous release. What it could not fix
is CSS: **55 lines across 26 variants files used physical `left`/`right`
utilities**, so an Arabic application got a mirrored document with borders,
padding and text alignment still pinned to the physical left. They are logical
now — `ms`/`me`, `ps`/`pe`, `border-s`/`border-e`, `rounded-s`, `text-start`.

**`DzTable` is the clearest case:** its header and body cells were `text-left`,
so every cell in an Arabic table aligned against the wrong edge while the table
itself mirrored.

**Tab keyboard navigation followed the keycap, not the reading order.** APG's
tabs pattern is written as *previous* and *next*; `useTabs` hard-coded
ArrowRight as next. In Arabic the next tab is to the **left**, so a user
pressing the key that points at the next tab got the previous one. The
horizontal keys now follow the direction. The vertical keys deliberately do not:
`dir` is about the inline axis, and ArrowUp is ArrowUp in every language.

**New: an `rtl` field on component anatomy** (`@dzup-ui/contracts`), with three
axes because they fail independently:

```ts
rtl: { mirrors: 'layout', keyboard: 'swap-horizontal', icons: ['indicator'] }
```

- `mirrors` — `layout` or a deliberate `none`
- `keyboard` — whether ArrowLeft/ArrowRight exchange meaning
- `icons` — parts whose icon carries direction and mirrors with the layout

**New: `yarn validate:rtl`.** A component declaring `mirrors: 'layout'` may not
use a physical utility in its variants. Genuinely physical cases say so in the
file with a `rtl-physical-ok` comment and a reason — source code (a gutter that
stays left because code reads left-to-right), `align="left"` on `DzHeading` and
`DzText` (an author naming a side, not asking for the start edge), and
`DzSheet`'s `side` (whether a sheet mirrors is a product decision, recorded
rather than taken).

**New: `packages/core/docs/rtl-matrix.md`**, generated from the declarations by
`yarn generate:rtl-matrix` so the table cannot drift from them.

**New in `@dzup-ui/testing`:** `expectRtl`, `checkRtl`, `expectRtlComputed` and
`forwardArrow`. `expectRtlComputed` **throws under jsdom rather than passing** —
jsdom does no layout, so it cannot resolve a class-driven `margin-inline-start`,
and a test that cannot check its claim should say so instead of going green.

**New in Storybook: a Direction toolbar** that renders every story right-to-left
under an Arabic locale, alongside the pseudo-locale toggle.

**Coverage, stated plainly:** 7 components declare an RTL contract, because the
field lives in the anatomy and only 7 declare an anatomy. The logical-property
migration covered the whole catalog regardless. The two rollouts are the same
rollout.
