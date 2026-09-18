---
"@dzup-ui/contracts": patch
"@dzup-ui/core": patch
---

**Counts pluralise by the locale's rules, the message catalog can finally be imported, and locale packs have a format and a gate.**

**Five components built their plurals by concatenation** —
`` `${n} tag${n === 1 ? '' : 's'}` `` in `DzTagsInput`, and the same shape in
`DzCountdown`, `DzDataView`, `DzMention` and `DzRating`. That is English's two
forms and nobody else's: Bosnian has a `few` form, Arabic has six categories,
French puts `0` in the singular. None of those strings was in the catalog either,
so no application could translate them at all. They are now 13 catalog keys
written in a documented subset of ICU MessageFormat and selected by
`Intl.PluralRules`:

```vue
<DzProvider
  locale="bs-BA"
  :messages="{ DzTagsInput: { count: '{count, plural, one {# oznaka} few {# oznake} other {# oznaka}}' } }"
>
```

**English output is unchanged, with two deliberate exceptions.** Numbers are
formatted for the locale, so a count from 1,000 gains its grouping separator
(`1,234 items`); and `DzDataView`'s paged announcement said *"of 1 items"* — it
now says *"of 1 item"*. A host translation that does not parse, or names an
argument the component does not pass, renders the English default instead of
breaking the component, and warns once in development.

**New: `useDzMessageFormat()`**, the same formatter for code outside Core's
components — a Pro component's own count-bearing keys, or an application's.
Argument values are data: a value containing `{`, `#` or `<` is inserted as text,
never read as syntax, and never becomes markup.

**New in `@dzup-ui/contracts`:** `DzMessage<Args>` (a typed catalog string —
formatting `DzTagsInput.countOfMax` without a numeric `max` is a type error),
`DzMessageArgsOf`, `DzMessageKey`, `DzLocalePack`, and `DzInstant` /
`DzPlainDate` / `DzPlainTime`, which name the date semantics each component
follows.

**The catalog is reachable from the package.** Until now `enMessages` and Core's
`DzMessageCatalog` augmentation were unreachable by every path the package
exposes: a translator could not obtain the strings, and a consumer's TypeScript
saw an empty catalog. Now:

- `@dzup-ui/core/i18n` — `useDzMessageFormat` and the catalog types; the root
  entry's declarations reference the augmentation too.
- `@dzup-ui/core/i18n/locales/en.json` — the complete English catalog as a
  locale pack, `import en from '@dzup-ui/core/i18n/locales/en.json' with { type: 'json' }`.

**Locale packs are JSON data** (`{ locale, direction, fallback, messages }`), so
a translation tool can edit them and no pack can enter a JavaScript import graph
— a consumer who never imports a language never ships it. `yarn
validate:i18n-packs` requires every catalog key to be translated **or listed as an
explicit fallback**, every translation to parse and read the same arguments as
English, and a pack's declared direction to agree with the locale. A `de` pack is
**scaffolded, not translated** — no machine translation is shipped — and is not
published until a translator fills it. `packages/core/docs/i18n.md` has the
syntax, the contribution path and the semantics table.

**Fixed: `DzTimePicker` could display the wrong time.** A time of day is a plain
value, but it was formatted through a local-zone `Date` merged with the host's
`formats.date` defaults — so an application that set a `timeZone` default (the
usual way to make server and browser agree) showed 09:05 as 22:05 to a user in
Sarajevo under `Pacific/Kiritimati`. A plain time is now formatted in UTC from a
UTC value, so no host zone can move it. Nothing changes for an application that
sets no zone.
