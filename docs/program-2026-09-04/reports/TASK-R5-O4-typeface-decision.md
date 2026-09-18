# TASK-R5-O4 — Arabic typeface decision sheet (carries AR-2 decision 1 / D-10)

> Prepared 2026-09-17 at `main` @ `569d887` (+ TASK-R5-O4 working tree).
> **State: open — owner decision.** Registered as **D63** in
> [`../EXECUTION-STATUS.md`](../EXECUTION-STATUS.md). Nothing was vendored.

## The question

`@dzup-ui/core` renders Arabic, Persian, Urdu and Hebrew correctly *as layout* —
direction resolves from the locale, 89 of 89 Tier B+ components declare an RTL
contract, and one landing route is now proven right-to-left end to end
(`apps/landing/e2e/rtl.spec.ts`). **What it does not control is the face the
Arabic script is drawn in.** TASK-AR-2 measured why: **no font binary is tracked
anywhere in the repository** (`git ls-files` returns zero `.woff`/`.woff2`/`.ttf`/
`.otf`); the tokens ship family *names* with system fallbacks:

| Token | Stack (measured, `packages/tokens/src`) |
|---|---|
| `primitives/typography.ts` `sans` | `'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif` |
| `theme-recipe.ts` `system` | `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `theme-recipe.ts` `geist` / `rounded` | `"Geist", "Inter", …` / `"SF Pro Rounded", "Nunito", …` |

Inter, Geist and Nunito contain **no Arabic glyphs**, so every Arabic character
falls through to whatever the platform substitutes. So: no licence obligation
today — and no guarantee of line height, numeral style, weight axis or
kashida behaviour for Arabic text.

## Options

| | A — vendor an OFL Arabic face | B — name Arabic system faces in the stack | C — consumer obligation (document it) |
|---|---|---|---|
| **What** | Ship e.g. Noto Sans Arabic, IBM Plex Sans Arabic or Vazirmatn as `woff2` with `@font-face` + `unicode-range` | Add Arabic-capable platform families to the stack, scoped by `:lang(ar)` or a `--dz-font-family-arabic` token | State in the theming/i18n docs that an RTL application supplies its script's typeface; show the token to set |
| **Licence** | SIL OFL 1.1 — shippable **with** obligations: licence text travels with the binary; Reserved Font Names (IBM Plex reserves "Plex"; renaming is required for modified builds) | None — nothing is distributed | None |
| **Size / runtime cost** | Binary in the published tarball for **every** consumer; with `unicode-range` the browser downloads it only when Arabic glyphs render, but a consumer who self-hosts or inlines `core.css` inherits the files. Per-weight `woff2` size **not measured here** — measure before choosing (the Arabic subset of a static weight is tens of KB; a variable full-range file is several hundred) | Zero bytes | Zero bytes |
| **Rendering guarantee** | Yes — one face on every platform, testable in the visual lane | Partial — platform-dependent. Measured on this Windows host: `segoeui.ttf`, `arial.ttf`, `tahoma.ttf`, `times.ttf` are present and are Arabic-capable Windows faces; macOS ships Geeza Pro / SF Arabic, Android Noto Naskh/Sans Arabic — none of these is verified by a gate here | None — the application decides |
| **Gate prerequisite** | **Yes, blocking**: AR-2 found `yarn validate:licenses` scans `package.json` dependencies only and **cannot see a vendored asset** — a font committed under `packages/` would pass silently. A binary-asset licence gate must exist first | No | No |
| **Reversibility** | Removing a shipped font is a visible change for Arabic readers (`minor` if anyone depends on it) | Token change, `patch` | Docs only |
| **Stop condition hit?** | **Yes** if bundled into `core.css` for all consumers — the task's stop condition ("a runtime font download to every consumer") and the owner's 2026-09-17 instruction both exclude it | No | No |

## Recommendation

**C now, B as an opt-in token, A never inside `@dzup-ui/core`.**

1. **C (now, zero cost):** `packages/core/docs/i18n.md` §5 already states that
   Core ships no Arabic typeface and that RTL typography is the host's
   responsibility. Add the same sentence and a two-line token example to the
   theming guide when TASK-R0-O2's docs pass runs.
2. **B (next, `patch`):** a `--dz-font-family-arabic` token defaulting to a
   platform stack (`"Segoe UI", Tahoma, "Geeza Pro", "Noto Sans Arabic",
   system-ui, sans-serif`), applied under `:lang(ar), :lang(fa), :lang(ur)`. It
   distributes nothing and improves the default on every platform that has one
   of those faces. Needs one visual fixture (Arabic label, `dir=rtl`) added to
   `scope.fixtures` so a regression is visible.
3. **A (only as a separate, opt-in package):** if the owner wants a guaranteed
   face, publish it as its own package (e.g. `@dzup-ui/fonts-arabic`) that a
   consumer imports deliberately — never as `@font-face` inside `core.css` — and
   only **after** a binary-asset licence gate exists.

## What this sheet does not decide

- Which OFL family, if A is chosen — that needs the measured `woff2` sizes and a
  design review of the three candidates against the Latin stack's x-height.
- Numeral style (`ar` vs `ar-u-nu-latn`) — AR-2 decision 4, still unasserted.
- The Arabic application's vendored core (AR-2 decision 5) — not in this checkout.
