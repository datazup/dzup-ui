import type { DzMessage, DzMessageValues } from '@dzup-ui/contracts'
import { useDzLocale } from '../composables/provider/useDzLocale.ts'
import { formatMessage } from './message-format.ts'

/**
 * Plural, select and typed interpolation for the active locale (TASK-R5-O4).
 *
 * The read side of the message syntax for code outside Core's own components —
 * a Pro component formatting the count-bearing keys it adds to
 * `DzMessageCatalog`, or an application formatting its own:
 *
 * ```ts
 * const { read } = useDzMessages()
 * const { format } = useDzMessageFormat()
 * const rows = format(
 *   read('DzChart.points', '{count, plural, one {# point} other {# points}}'),
 *   { count: series.length },
 * )
 * ```
 *
 * One mechanism, no privileged tier (ADR-20 §9): Core's components format
 * through the same parser, the same `Intl.PluralRules` cache and the same
 * fallback rule.
 *
 * @module @dzup-ui/core/i18n/useDzMessageFormat
 */

export interface DzMessageFormatter {
  /**
   * Format `message` for the active locale.
   *
   * `values` is typed from the message when it is a `DzMessage<Args>`, so a
   * catalog key declared `DzMessage<{ count: number }>` refuses a missing or
   * string `count` at compile time.
   *
   * Values are data: a value containing `{`, `#` or `<` is inserted as text,
   * never read as syntax, and the result is text for a text or attribute
   * binding — never markup.
   *
   * @param fallback The shipped English default. Rendered — with its branches
   * chosen by English plural rules — when `message` does not parse or names an
   * argument `values` lacks, so a broken translation degrades to English
   * instead of breaking the component. Without one, that error is thrown.
   */
  format: <A extends DzMessageValues>(message: DzMessage<A>, values: A, fallback?: DzMessage<A>) => string
}

/**
 * A message formatter bound to the application's locale.
 *
 * Reads the locale at call time, like `useDzFormats`, so a locale change is
 * picked up without re-subscribing and a component can format inside a render.
 */
export function useDzMessageFormat(): DzMessageFormatter {
  const locale = useDzLocale()

  return {
    format: (message, values, fallback) => {
      if (fallback === undefined || message === fallback)
        return formatMessage(message, values, locale.value, fallback === undefined ? {} : { pluralLocale: 'en' })
      try {
        return formatMessage(message, values, locale.value)
      }
      catch {
        return formatMessage(fallback, values, locale.value, { pluralLocale: 'en' })
      }
    },
  }
}
