/**
 * `@dzup-ui/core/i18n` — the localisation surface (TASK-R5-O4; the export slice
 * of TASK-R1-O2, N5-04 D4).
 *
 * Also re-exported from the package root, so `import { useDzMessageFormat }
 * from '@dzup-ui/core'` works too; the subpath exists so a host can reach the
 * i18n surface without naming the component barrel.
 *
 * **What ships where, and why the catalog is not a named export here.** The
 * English catalog and every locale pack ship as **JSON data** —
 * `@dzup-ui/core/i18n/locales/<locale>.json`, shaped as `DzLocalePack` — not as
 * JavaScript values. A pack is what a translator and a translation-management
 * tool edit; it must not be code, and it must not sit in an import graph where
 * one stray import puts a second language into every bundle. It is also why
 * this module adds no `unclassified` ownership entry: data files are not
 * exported symbols, exactly as `./styles` is not.
 *
 * The `DzCoreMessageGroup` re-export is load-bearing beyond its own value: it is
 * what makes the emitted declarations reference `messages.d.ts`, and with it
 * Core's `DzMessageCatalog` augmentation. Without a reference a consumer's
 * TypeScript never loads that file and sees an empty catalog (N5-04 F9).
 *
 * The shapes themselves — `DzMessage`, `DzMessageKey`, `DzLocalePack`,
 * `DzInstant`, `DzPlainDate`, `DzPlainTime` — live in `@dzup-ui/contracts`,
 * where Pro can reach them without importing Core, and are not re-exported
 * here: one import path per type.
 *
 * @module @dzup-ui/core/i18n
 */

export type { DzCoreMessageGroup } from './messages.ts'
export { useDzMessageFormat } from './useDzMessageFormat.ts'
export type { DzMessageFormatter } from './useDzMessageFormat.ts'
