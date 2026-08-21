---
"@dzup-ui/contracts": minor
"@dzup-ui/core": minor
---

**An application can now read locale, direction, messages, formats, portal target, motion, defaults, CSP nonce and test ids from one contract — and every component still works with none of them set.**

`DzThemeProvider` has covered theme since ADR-09. Everything else a component
needs from its host was a prop on that component or a string in its template.
Measured on this checkout: **79 distinct user-visible literals** (50 static
`aria-label` values no application can change, 29 prop defaults only a
per-instance prop can change), **15
components** carrying their own `portalTo`, **5 `Intl` construction sites
across 4 files** each with their own locale or none, and no policy at all for motion,
component defaults, CSP nonce or test ids.

ADR-20 (`docs/adr/ADR-20-provider-contract.md`) fixes the keys, the shapes, the
defaults and the merge rules. This release lands the **read side**; the
`DzProvider` component that writes them is the next packet.

**New in `@dzup-ui/contracts`: nine injection keys and their shapes**

`DZ_LOCALE_KEY`, `DZ_MESSAGES_KEY`, `DZ_FORMATS_KEY`, `DZ_DIRECTION_KEY`,
`DZ_PORTAL_TARGET_KEY`, `DZ_MOTION_KEY`, `DZ_DEFAULTS_KEY`, `DZ_NONCE_KEY`,
`DZ_TEST_IDS_KEY` — plus `DzLocale`, `DzMessages`, `DzDirection`,
`DzDirectionPreference`, `DzFormats`, `DzMotion`, `DzMotionPreference`,
`DzDefaults`, `DzTestIds` and the documented `DZ_PROVIDER_DEFAULTS`.

They live in the types package on purpose. An injection key is an identity: two
packages that inject the same concern must inject the *same symbol*, or the
child silently receives the default and the bug is invisible. Declaring them
here is what lets `@dzup-ui-pro/*` read an application's locale **without
importing Core's runtime**. The package stays dependency-free and tree-shakeable.

**New in `@dzup-ui/core`: ten composables, each with a typed default**

| Composable | Answers |
|---|---|
| `useDzTheme` | the existing ADR-09 theme context, under the family's name — the one that still requires a provider |
| `useDzLocale` | the active BCP-47 tag (`en-US` unset) |
| `useDzDirection` | `'ltr' \| 'rtl'` — **never `'auto'`**, resolved from the locale |
| `useDzMessages` | `read(path, fallback)` over a deep-mergeable catalog |
| `useDzFormats` | cached `Intl` number/date/relativeTime/list factories |
| `useDzPortalTarget` | where overlays teleport to |
| `useDzMotion` | `preference` and the resolved `reduced` |
| `useDzDefaults` | `resolve(component, prop, chain)` — prop → context → provider → component |
| `useDzNonce` | the CSP nonce for any style this library injects |
| `useDzTestIds` | `testId(name)`, off until a host names the attribute |

```ts
// works with no provider mounted — this is the load-bearing property
const direction = useDzDirection()          // 'ltr'
const { read } = useDzMessages()
read('select.noResults', 'No results found') // 'No results found'
```

Nine of the ten resolve to a default and never throw. `useDzTheme` is the
exception and is unchanged from ADR-09: it still requires a `DzThemeProvider`,
because theme has no sensible default for an application that has not chosen
one.

**Nothing changes for existing code.** No component consumes these yet, nothing
is deprecated, and no default differs from what components hard-code today.
That is deliberate: it makes the follow-up migrations — the 79 literals, the 15
portal props, the 9 `Intl` sites — mechanical and non-breaking, one component at
a time.

**Three rules worth knowing before you nest a provider**

- Every concern **overrides** per key, except `messages`, which **deep-merges** —
  a host changing `select.noResults` must not restate the other 71 strings.
- Direction resolves from a checked-in RTL subtag list, not
  `Intl.Locale.prototype.getTextInfo()`, which is unavailable across the
  supported Node range (ADR-18). The ADR records the delegation as intended once
  the floor moves.
- Under SSR, motion resolves to `reduced: false` — what the CSS media query
  answers before the client knows better. The alternative hydrates
  never-animating markup into animating markup, which is a visible jump.

The write half (`provideDz*`) is **not exported**. `DzProvider` is the one
sanctioned writer; publishing the write half invites a second provider, and two
providers mean two locales and two merge rules.
