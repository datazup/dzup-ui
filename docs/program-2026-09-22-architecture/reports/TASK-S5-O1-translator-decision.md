# TASK-S5-O1 — first translated locale: translator decision sheet

> **Measured at `main` @ `4e4e46f` plus the working tree, 2026-09-24.**
> **State: open — owner decision.** Carries **D59** (opened by
> `../../program-2026-09-04/reports/TASK-R5-O4-handoff.md` §5, 2026-09-17).
> **No translation was written, and none was estimated into a pack.** `de.json`
> is exactly as R5-O4 left it: 116 keys, all of them explicit `fallback`, zero
> translated.

## 1. The decision

**Name a human who reads the target language, and name the language.** Everything
else about a second locale is built, gated and documented. This is the only input
the engineering cannot supply, and it is the last thing between "one locale ships"
and a gated, provable two.

Writing German (or any other) message values here would fabricate evidence of a
supported locale — the exact failure mode this programme keeps catching — so the
task stopped at the boundary and built the measurement instead.

## 2. The volume, measured

Every figure derived from `packages/core/src/i18n/locales/en.json` at `4e4e46f`:

| Measurement | Value |
|---|---|
| Catalog keys | **116** |
| Component groups they belong to | **44** |
| Total words across all English values | **318** |
| Total characters | **1,896** |
| Average words per key | **2.7** |
| Keys of 1–2 words | **82** (71 %) |
| Keys of 3–4 words | **24** |
| Keys of 5–8 words | **6** |
| Keys of 9+ words | **4** |
| Keys carrying an interpolation | **11** |
| …of which are plurals | **10** |
| Longest value | `{total, plural, one {Showing {start} to {end} of # item} other {Showing {start} to {end} of # items}}` |

**What the 116 keys are.** Accessible names and short UI labels — `Close`,
`Back to top`, `Breadcrumb`, `No options found`, `Try again`, `Next slide` — plus
ten count-bearing messages (`DzCountdown` ×4, `DzDataView` ×2, `DzMention`,
`DzRating`, `DzTagsInput` ×2). There is no marketing copy, no prose and no
sentence longer than fourteen words.

## 3. Effort estimate

**Derived arithmetic, not a measured rate.** Stated as a range with its
assumptions so the owner can replace the rate and keep the shape.

| Item | Volume | Assumption | Estimate |
|---|---|---|---|
| Translate 106 plain values | 318 words minus the plural bodies | a native speaker with UI conventions works faster than prose rate on 1–2 word labels but must open each one in context | **1.5–2.5 h** |
| The 10 count-bearing messages | 10 messages × the language's plural categories | 2 categories (de) → **20 branch strings**; 4 (pl, ru) → **40**; 6 (ar, cy) → **60** | **0.5 h** (2 categories) to **1.5 h** (6) |
| Context pass in Storybook | 44 component groups | the pseudo-locale and RTL toolbar controls make this a pass, not a search | **1 h** |
| Review by a second speaker | 116 keys | the "no machine translation" rule means a named reviewer, which is a second person's hour | **0.5–1 h** |
| **Total, German (2 plural categories)** | | | **3.5–5 h** |
| **Total, a 4- or 6-category language** | | | **4.5–6.5 h** |

**The estimate that matters is not the hours.** 116 keys at 2.7 words is a
single-sitting job for a native speaker. The cost that has actually blocked this
for seven days is *finding the person* and *owning the review*, and neither gets
cheaper by waiting — the catalog grew 110 → 116 between R5-O4 and this task, so
every week adds keys to the same job.

## 4. What is ready for that person, today

| Ready | Where |
|---|---|
| A scaffold command that resolves direction and refuses to clobber | `yarn i18n:new <bcp47-tag>` |
| The 116 source strings as a single reference file | `packages/core/src/i18n/locales/en.json` (generated from `enMessages`, gated byte-identical) |
| A structural gate | `yarn validate:i18n-packs` — missing/extra keys, syntax, argument parity, shape, direction, tree-shaking, exports |
| A completeness gate that prints a percentage | `yarn validate:i18n-completeness` — identical-to-English subtracted, plural categories checked against CLDR for **their** language, scaffold register, supported floor |
| One command for both | `yarn i18n:check` |
| A layout pre-flight that needs no translation | Storybook toolbar: **Pseudo-locale** (+30 % padded, accented, framed) and **Direction: RTL** |
| A written contribution path | `packages/core/docs/i18n.md` §5 (8 steps), `CONTRIBUTING.md` "Translations" |
| Proof the formatter is right before their time is spent | `message-format.spec.ts` (Bosnian `few`, French zero-is-singular, Arabic six categories, Arabic-Indic digits) + `i18n-completeness.spec.ts` (Polish, Arabic, Welsh, Japanese, Russian ordinals — 50 specs) |

## 5. Options

| | A — commission `de` (the existing scaffold) | B — commission a different first locale | C — keep waiting |
|---|---|---|---|
| **Cost** | 3.5–5 h of a named German speaker + a reviewer | same, plus the scaffold (one command) | zero, and the debt grows with the catalog |
| **What it proves** | the whole locale layer against a second real data point; 2 plural categories, LTR | as A; a 4- or 6-category language **also** exercises `plural-categories` against real content, and an RTL one exercises the direction path end to end | nothing; every i18n claim stays single-data-point |
| **Gate movement** | `locales at ≥95 %: 1 → 2`, `minSupportedLocales: 1 → 2`, `de` leaves the scaffold register | same | none |
| **Risk** | German has the same plural shape as English, so it proves the *pipeline* but not the *plural* half | a 6-category language is the strongest proof and the largest ask | the catalog grew 110 → 116 in seven days; it will keep growing |

## 6. Recommendation

**B, with `pl` or `ar` as the first locale — but take A if the German speaker is
the one who is actually available.**

The reasoning: German has **two** plural categories, exactly like English, so a
German pack proves the pipeline (scaffold → translate → gate → publish → resolve)
and leaves the most interesting half of the contract still untested by real
content. Polish (4 categories) or Arabic (6, plus RTL, plus the typeface question
in the sheet beside this one) exercises `plural-categories` against content a
translator wrote rather than against a spec fixture, and Arabic additionally puts
a real pack behind the direction path that today has only a landing-route test.

**But availability beats elegance.** The engineering has been complete for seven
days, and one finished locale of any kind moves `minSupportedLocales` from 1 to 2
and turns every i18n claim in this repository from a single data point into a
gated fact. If the available speaker reads German, commission German; the plural
half is then covered by the 50 specs in `i18n-completeness.spec.ts` and by
whichever locale comes second.

**What the owner does, concretely:**

1. Name the language and the person (and the reviewer — the no-machine-translation
   rule needs a second name).
2. The translator runs `yarn i18n:new <tag>` (or opens `de.json`), translates, and
   runs `yarn i18n:check` until it prints ≥ 95 %.
3. Add the pack's `./i18n/locales/<tag>.json` entry to
   `packages/core/package.json` `exports` and a `patch` changeset for
   `@dzup-ui/core`.
4. Raise `minSupportedLocales` from **1** to **2** and delete the pack's entry
   from `scaffolds` in
   `packages/tooling/src/validators/i18n-completeness-ceilings.json`. That single
   edit is what makes "two locales ship" a gated fact — and, because the floor may
   only rise, what stops it from quietly becoming one again.
