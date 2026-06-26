/**
 * DzInputMask — tailwind-variants (tv) style definitions.
 *
 * Reuses the DzInput token surface (`--dz-input-*`) so masked fields are
 * visually identical to plain text inputs (TASK-NF-25, step 3). The wrapper and
 * inner-element variants are re-exported under mask-specific names to satisfy
 * the per-component file layout while avoiding style duplication.
 *
 * @module @dzup-ui/core/components/inputs/DzInputMask.variants
 */

import type { InputElementVariantProps, InputWrapperVariantProps } from './DzInput.variants.ts'
import {

  inputElementVariants,

  inputWrapperVariants,
} from './DzInput.variants.ts'

/** Wrapper variants — shared with DzInput (outer container, border, focus ring). */
export const maskWrapperVariants = inputWrapperVariants

/** Inner `<input>` element variants — shared with DzInput (native reset). */
export const maskElementVariants = inputElementVariants

/** Variant prop types extracted from the shared tv() definitions. */
export type MaskWrapperVariantProps = InputWrapperVariantProps
export type MaskElementVariantProps = InputElementVariantProps
