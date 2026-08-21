---
"@dzup-ui/contracts": minor
"@dzup-ui/core": minor
---

**`DzProvider`: one component configures theme, locale, direction, messages, formats, portals, motion, component defaults, CSP nonce and test ids.**

The previous release shipped the *read* half of ADR-20 — ten composables with
typed defaults that nothing could write to. This is the writer.

```vue
<DzProvider
  :theme="{ default: 'system', persist: true }"
  locale="ar-EG"
  direction="auto"
  :messages="{ DzPagination: { next: 'التالي' } }"
  :formats="{ currency: 'EGP' }"
  portal="#dz-portal"
  motion="system"
  :defaults="{ DzButton: { size: 'sm' } }"
  :nonce="cspNonce"
  test-id-prefix="e2e"
>
  <App />
</DzProvider>
```

**A prop it does not set, it does not provide.** This is the rule that makes
nesting composable rather than destructive. An inner provider naming only the
locale leaves the theme, the portal target and the defaults exactly as the outer
one left them — nothing silently resets to a default because a child forgot to
restate it. `messages` is the single exception and deep-merges, so changing one
string does not mean restating the catalog.

**It renders no element.** Its anatomy declares `parts: 'none'`, so it can sit
between a flex container and its children, or inside a shadow root, without
changing anything. The consequence is documented rather than hidden: only the
**root** provider reflects `dir` onto `<html>`. A nested provider changes what
`useDzDirection()` answers for its subtree and writes no attribute, because it
has no element to write it on — scope a subtree with your own `<div :dir="…">`.

**`DzThemeProvider` is unchanged**, and is now a thin wrapper over `DzProvider`
with theme props only. Same four props, same ADR-09 context, same ADR-15
persistence and `data-theme` reflection; its test suite passes untouched, which
is the evidence. Mounting one inside the other is safe — `DzProvider` takes
ownership of the theme only when asked to, or when nothing above it already has.

**`getThemeScript` now writes `dir` as well as `data-theme`.**

```ts
getThemeScript({ locale: 'ar-EG' })   // also sets dir="rtl" before first paint
```

Direction is resolved where the string is generated rather than at runtime: it
comes from the application's own configuration, not from `localStorage`, so
baking it in keeps the inline script small and keeps the RTL subtag list in one
place. With no `locale` or `direction` given the emitted script is byte-identical
to before, so a host that has declared neither gets no opinion imposed on its
markup.

**`DzButton` is the first component to honour a provider default.** Precedence is
fixed by ADR-20 §6 and is the same for every component that follows: **explicit
prop → compound context (`DzButtonGroup`) → provider → the component's own
default.** With no provider mounted, every one of those lines resolves exactly as
it did before. Which components honour which axes is declared, not promised:
`DzButton.anatomy.ts` lists `globalDefaults: ['size', 'variant', 'tone']`.

**Also in this release**

- The CSP nonce now reaches the transition-suppression `<style>` the theme
  injects on a switch. Without it a strict policy drops the tag silently, and the
  symptom is a colour sweep on theme change that nobody can reproduce locally.
- `useDzTestIds().testId()` honours an optional `prefix`, so one page embedding
  two instances of an application can namespace each without every component
  learning about namespaces. `DzTestIds.prefix` is optional, so
  `DZ_PROVIDER_DEFAULTS.testIds` is unchanged.
- New in `@dzup-ui/contracts`: `DzFormatDefaults` — the `Intl` option defaults a
  host declares (`{ currency: 'EGP' }`), as distinct from the formatters a
  component asks for. A caller's own options always win.
- `DzProvider` and `DzThemeProvider` both declare an anatomy, and
  `validate:contract-parity` now looks inside `packages/core/src/providers`. It
  never did, which is why `DzThemeProvider` — a public component two story files
  import — had no contract spec. Both have one now.

**Nothing existing breaks.** No component's default changed, nothing is
deprecated, and every concern still resolves without a provider mounted.
