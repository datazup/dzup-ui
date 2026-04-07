/**
 * Shared utility types used across contracts and component implementations.
 *
 * @module @dzup-ui/contracts/utility
 */

// ---------------------------------------------------------------------------
// Object manipulation
// ---------------------------------------------------------------------------

/**
 * Make specific properties of `T` required while keeping the rest unchanged.
 *
 * @typeParam T - The source type
 * @typeParam K - Keys to make required
 */
export type RequireProps<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

/**
 * Make specific properties of `T` optional while keeping the rest unchanged.
 *
 * @typeParam T - The source type
 * @typeParam K - Keys to make optional
 */
export type OptionalProps<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

/**
 * Flatten an intersection into a plain object type for better IDE display.
 *
 * `Prettify<A & B>` shows `{ ...all fields... }` instead of `A & B`.
 */
export type Prettify<T> = { [K in keyof T]: T[K] } & {}

// ---------------------------------------------------------------------------
// Function helpers
// ---------------------------------------------------------------------------

/**
 * Extract the emit function signature from an emits interface.
 *
 * Given `{ change: [value: string] }`, produces the tuple `[value: string]`.
 *
 * @typeParam T - Emits interface
 * @typeParam K - Event name key
 */
export type EmitPayload<
  T extends Record<string, unknown[]>,
  K extends keyof T,
> = T[K]

// ---------------------------------------------------------------------------
// Brand types
// ---------------------------------------------------------------------------

/**
 * Nominal / branded type for compile-time distinction of structurally
 * identical types (e.g., `ComponentId` vs plain `string`).
 *
 * @typeParam T - The base type
 * @typeParam Brand - A unique brand tag
 */
export type Branded<T, Brand extends string> = T & { readonly __brand: Brand }

// ---------------------------------------------------------------------------
// Exhaustive check
// ---------------------------------------------------------------------------

/**
 * Use in `default` case of switch statements to get a compile-time error
 * when a union is not fully handled.
 *
 * ```ts
 * switch (tone) {
 *   case 'primary': ...
 *   // missing other cases → compile error
 *   default: assertNever(tone)
 * }
 * ```
 */
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${String(value)}`)
}
