# TASK-S5-O1 — Arabic and Hebrew typeface decision sheet

> **Measured at `main` @ `4e4e46f` plus the working tree, 2026-09-24.**
> **State: open — owner decision.** Carries **D63** (opened by
> `../../program-2026-09-04/reports/TASK-R5-O4-typeface-decision.md`, 2026-09-17)
> and AR-2 decision 1 / D-10. **Nothing was vendored and no purchase was made.**
> This sheet supersedes the R5-O4 sheet on three points it left open: the
> candidate licences in detail, the size cost (still **unmeasured** — with the
> exact command and why it was not run here), and the fact that the absence is
> now **reported by a gate** rather than only by a document.

## 1. What changed since the R5-O4 sheet

| | 2026-09-17 (`569d887`) | 2026-09-24 (`4e4e46f`) |
|---|---|---|
| Font binaries tracked in this repository | 0 (measured once, by hand) | **0 — re-measured on every gate run** by `trackedFontBinaries()` in `validate:i18n-completeness` |
| Where the absence is recorded | one report | the report **plus** a gate line on every `validate:all` run, plus `packages/core/docs/i18n.md` §4 and §5 |
| Locales that could exercise it | 0 Arabic packs | still 0 — and the gate now reports the Arabic row as **`no pack exercises it (forward declaration — unasserted, not passing)`** rather than omitting it |
| Option B's landing place | described in prose | **detected**: the moment a `--dz-font-family-arabic` token exists in `@dzup-ui/tokens`, the gate's row reads `token-provisioned` with no edit to any file |

The gate line, as it prints today:

```
script/typeface provisioning (report-only, never fails this gate):
  [script-support] latin: token-stack — pack(s): de, en
  [script-support] arabic: none — decision D63; 0 font binaries tracked in this
      repository, so the host supplies the face — no pack exercises it
      (forward declaration — unasserted, not passing)
  [script-support] hebrew: none — decision D63; 0 font binaries tracked … — no pack
      exercises it (forward declaration — unasserted, not passing)
```

**Why it is report-only and never fails.** Failing would force one of two things
the owner has excluded: a purchase, or a silent degradation to a platform
substitute dressed up as a pass. Option C — the host supplies its script's
typeface — is the *recommended position*, not a defect. What the gate refuses to
do is let the absence disappear, which is the only failure mode a document alone
has.

## 2. The question, restated

`@dzup-ui/core` renders Arabic, Persian, Urdu and Hebrew correctly **as layout**:
direction resolves from the locale, the RTL contract is declared per component in
`rtl-matrix.md` and gated by `yarn validate:rtl`, and one landing route is proved
right-to-left end to end (`apps/landing/e2e/rtl.spec.ts`). What it does not
control is **the face the script is drawn in**. Inter, Geist and Nunito — the
three families the token stacks name — contain no Arabic and no Hebrew glyphs, so
every character in those scripts falls through to whatever the platform
substitutes. Consequence today: **no licence obligation, and no guarantee of line
height, numeral style, weight axis or kashida behaviour.**

## 3. Candidate licences, if a face is ever shipped (option A)

All three candidates are **SIL Open Font Licence 1.1**, which is the only licence
class that can be shipped inside a package at all without a per-seat or
per-pageview obligation. OFL is shippable **with** obligations, and they are not
the same for all three:

| Candidate | Licence | Reserved Font Name | The obligation that actually bites |
|---|---|---|---|
| **Noto Sans Arabic** (Google) | OFL 1.1 | none declared | Licence text must travel with the binary — a `LICENSE` file beside the `woff2` and a notice in the package's own licence disclosure. Broadest coverage of the three; the platform default on Android, so it is also the face most Arabic readers already see. |
| **IBM Plex Sans Arabic** (IBM) | OFL 1.1 | **"Plex" is reserved** | A *modified* build — and a subset produced by `pyftsubset` is a modified build — **may not be called Plex**. Shipping a subset therefore means renaming the family, which breaks the one thing option A was for: a name a consumer can rely on. This is the trap in the R5-O4 sheet's "Reserved Font Names" note, spelled out. |
| **Vazirmatn** | OFL 1.1 | none declared | Persian-first design; excellent for `fa`, and its Arabic coverage is complete but its proportions are tuned for Persian text. Smallest of the three by glyph count. |

Two obligations apply to **all** of them and neither is satisfied today:

1. **The licence text must be distributed with the binary.** A font under
   `packages/` is not a `package.json` dependency, and
   `yarn validate:licenses` scans dependency manifests only — AR-2's finding, and
   it still holds at `4e4e46f`. **A vendored font would pass the licence gate
   silently.** A binary-asset licence gate is therefore a *blocking prerequisite*
   for option A, not a follow-up.
2. **OFL forbids selling the font by itself** and requires derivative works to
   carry the licence. Neither is a problem for a UI library, but both must be
   stated in the published package's licence disclosure, which is generated and
   would need a new input.

Licence classes that were **excluded without further review**: anything
proprietary or per-domain (Monotype, Linotype, foundry web licences) — a component
library cannot hold a licence on its consumers' behalf; and anything with a
pageview cap, for the same reason.

## 4. Size cost — **unmeasured here**, with the method

Per the programme's evidence rules, an unmeasured figure is reported unmeasured
rather than estimated into the record. **No per-weight `woff2` size was measured
for this sheet**, because measuring one means downloading a font binary, and
downloading a font binary onto this machine is the first half of vendoring it —
the act this task is forbidden to take. The measurement is one command for
whoever takes the decision:

```bash
# for each candidate, per weight, Arabic subset only
pyftsubset NotoSansArabic-Regular.ttf \
  --unicodes='U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FDFD' \
  --layout-features='*' --flavor=woff2 --output-file=noto-ar-400.woff2
ls -l noto-ar-*.woff2
```

What **is** measured, and is the number that matters for the decision:

| Measured at `4e4e46f` | Value |
|---|---|
| `packages/core/dist/core.css` (the whole published stylesheet) | **19,865 bytes** |
| Font binaries tracked in the repository | **0** |
| Weights the `sans` stack implies (400/500/600/700) | **4** → any option-A figure is multiplied by four |
| Arabic-capable faces already present on this Windows host (option B's dependency, zero download) | `segoeui.ttf` 959,752 B · `arial.ttf` 1,045,720 B · `tahoma.ttf` 919,260 B · `times.ttf` 1,190,736 B |

**The decision-relevant consequence, which does not need the exact figure.**
The entire published stylesheet is under 20 KB. An Arabic subset of a single
static weight is larger than that by any measure, and four weights are larger
again — so **option A makes the typeface the dominant payload of the package**,
and `unicode-range` only helps a consumer who loads the CSS from the package: one
who self-hosts or inlines `core.css` inherits the files unconditionally. That is
enough to decide option A without the byte count; the byte count is needed only to
choose *between* candidates, which is a design review, not this decision.

## 5. Options

| | A — vendor an OFL face | B — an opt-in `--dz-font-family-<script>` token | C — host obligation, documented |
|---|---|---|---|
| **What ships** | `woff2` binaries + `@font-face` + `unicode-range` | one token, defaulting to a platform stack, applied under `:lang(ar), :lang(fa), :lang(ur)` | nothing |
| **Licence obligation** | OFL 1.1, licence text travels with the binary; Plex additionally forbids the name on a subset | none | none |
| **Bytes added** | unmeasured × 4 weights, and larger than the whole of `core.css` | **0** | **0** |
| **Rendering guarantee** | yes, one face everywhere, testable in the visual lane | partial — platform-dependent, and *no gate here verifies a platform face exists* | none; the application decides |
| **Blocking prerequisite** | **yes** — a binary-asset licence gate, because `validate:licenses` cannot see a vendored asset | no | no |
| **Reversibility** | removing a shipped face is visible to Arabic readers → `minor` | token change → `patch` | docs only |
| **Recorded by a gate today** | — | the gate flips its row to `token-provisioned` automatically | **yes** — the row prints on every `validate:all` run |

## 6. Recommendation — unchanged from R5-O4, now with the reasons closed

**C now · B next as a `patch` · A never inside `@dzup-ui/core`.**

1. **C is already in force and is now gated.** `packages/core/docs/i18n.md` §4 and
   §5 state that Core ships no Arabic or Hebrew typeface and that RTL typography
   is the host's responsibility, and `validate:i18n-completeness` prints it on
   every run. **No further action is needed to hold this position** — which is
   what makes it the right default.
2. **B is the cheap improvement and needs one decision, not a procurement.** Add
   `--dz-font-family-arabic`, defaulting to
   `"Segoe UI", Tahoma, "Geeza Pro", "Noto Sans Arabic", system-ui, sans-serif`,
   applied under `:lang(ar), :lang(fa), :lang(ur)`; and the Hebrew equivalent.
   It distributes nothing, costs zero bytes, improves the default on every
   platform that has one of those faces, and the completeness gate reports
   `token-provisioned` for that script the moment it lands — so option B records
   its own arrival. It needs **one visual fixture** (an Arabic label under
   `dir=rtl`) added to `e2e/visual/` `scope.fixtures` so a regression is visible.
   Recommended as the next packet.
3. **A only as a separate, opt-in package** (e.g. `@dzup-ui/fonts-arabic`) that a
   consumer imports deliberately — never `@font-face` inside `core.css` — and only
   **after** a binary-asset licence gate exists. If A is ever taken:
   **Noto Sans Arabic**, because it has no Reserved Font Name to trip over on a
   subset and it is what most Arabic readers already see.

## 7. What this sheet still does not decide

- **Which OFL family**, if A is chosen — needs the measured `woff2` sizes from §4
  and a design review of the three candidates against the Latin stack's x-height.
- **Numeral style** (`ar` vs `ar-u-nu-latn`) — AR-2 decision 4, still
  **unasserted**. `formatMessage` renders Arabic-Indic digits under `ar` today
  (asserted in `message-format.spec.ts:61`); whether a product wants that is a
  host decision with no default that is right for everyone.
- **The Hebrew face** — the same decision (D63) covers it, but a face that covers
  Arabic usually does not cover Hebrew, so option B needs two tokens, not one.
- **The Arabic application's vendored core** (AR-2 decision 5) — not in this
  checkout, and out of this repository's scope.
