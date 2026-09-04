/**
 * Tests for the rename-props transform.
 *
 * Verifies that component props are correctly renamed in Vue SFC templates
 * using the regex-based approach.
 */

import jscodeshift from 'jscodeshift'
import { describe, expect, it } from 'vitest'
import transformer from '../rename-props.js'

/** Helper to run the transform on a Vue SFC string. */
function applyTransform(source: string, path = 'test.vue'): string | null {
  const fileInfo = { path, source }
  const j = jscodeshift.withParser('tsx')
  const api = {
    jscodeshift: j,
    j,
    report: () => {},
    stats: () => {},
  }
  return transformer(fileInfo, api, {})
}

describe('rename-props transform', () => {
  // -----------------------------------------------------------------------
  // DzButton type -> tone + variant expansion
  // -----------------------------------------------------------------------

  it('expands DzButton type="primary" to tone="primary" variant="solid"', () => {
    const input = `<template><DzButton type="primary">Click</DzButton></template><script setup lang="ts"></script>`
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('tone="primary"')
    expect(result).toContain('variant="solid"')
    expect(result).not.toContain('type="primary"')
  })

  it('expands DzButton type="danger" to tone="danger" variant="solid"', () => {
    const input = `<template><DzButton type="danger">Delete</DzButton></template><script setup lang="ts"></script>`
    const result = applyTransform(input)
    expect(result).toContain('tone="danger"')
    expect(result).toContain('variant="solid"')
  })

  it('expands DzButton type="text" to tone="neutral" variant="text"', () => {
    const input = `<template><DzButton type="text">More</DzButton></template><script setup lang="ts"></script>`
    const result = applyTransform(input)
    expect(result).toContain('tone="neutral"')
    expect(result).toContain('variant="text"')
  })

  // -----------------------------------------------------------------------
  // DzAlert type -> tone
  // -----------------------------------------------------------------------

  it('renames DzAlert type="error" to tone="danger"', () => {
    const input = `<template><DzAlert type="error">Oops</DzAlert></template><script setup lang="ts"></script>`
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('tone="danger"')
    expect(result).not.toContain('type="error"')
  })

  // -----------------------------------------------------------------------
  // visible -> open on overlays
  // -----------------------------------------------------------------------

  it('renames DzDialog visible to open', () => {
    const input = `<template><DzDialog visible></DzDialog></template><script setup lang="ts"></script>`
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('open')
    expect(result).not.toContain('visible')
  })

  it('renames :visible="show" to :open="show" on DzDrawer', () => {
    const input = `<template><DzDrawer :visible="show"></DzDrawer></template><script setup lang="ts"></script>`
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain(':open="show"')
    expect(result).not.toContain(':visible')
  })

  it('renames v-bind:visible to v-bind:open on DzModal', () => {
    const input = `<template><DzModal v-bind:visible="isOpen"></DzModal></template><script setup lang="ts"></script>`
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('v-bind:open="isOpen"')
  })

  // -----------------------------------------------------------------------
  // Size value renames
  // -----------------------------------------------------------------------

  it('renames size="small" to size="sm"', () => {
    const input = `<template><DzButton size="small">Go</DzButton></template><script setup lang="ts"></script>`
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('size="sm"')
    expect(result).not.toContain('size="small"')
  })

  it('renames size="medium" to size="md"', () => {
    const input = `<template><DzInput size="medium" /></template><script setup lang="ts"></script>`
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('size="md"')
  })

  it('renames size="large" to size="lg"', () => {
    const input = `<template><DzBadge size="large">5</DzBadge></template><script setup lang="ts"></script>`
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('size="lg"')
  })

  // -----------------------------------------------------------------------
  // Idempotency
  // -----------------------------------------------------------------------

  it('does not modify already-correct props', () => {
    const input = `<template><DzButton tone="primary" variant="solid">OK</DzButton></template><script setup lang="ts"></script>`
    const result = applyTransform(input)
    expect(result).toBeNull()
  })

  it('does not modify non-matching components', () => {
    const input = `<template><div visible></div></template><script setup lang="ts"></script>`
    const result = applyTransform(input)
    expect(result).toBeNull()
  })

  // -----------------------------------------------------------------------
  // Removed ARIA props (TASK-N5-02)
  // -----------------------------------------------------------------------

  /**
   * These nine declarations were removed rather than implemented, because the
   * elements they would land on cannot carry them. Stripping the binding is the
   * migration: the value did nothing before the removal, and after it Vue would
   * route it into `$attrs` and render it on a `<div>` with no role.
   */
  it('strips :aria-invalid from DzGrid', () => {
    const input = `<template><DzGrid :cols="2" :aria-invalid="hasError">x</DzGrid></template><script setup lang="ts"></script>`
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).not.toContain('aria-invalid')
    expect(result).toContain(':cols="2"')
  })

  it('strips the static and shorthand forms too', () => {
    const staticForm = applyTransform(`<template><DzStack aria-invalid="true">x</DzStack></template><script setup lang="ts"></script>`)
    expect(staticForm).not.toContain('aria-invalid')
    const shorthand = applyTransform(`<template><DzTabs aria-invalid>x</DzTabs></template><script setup lang="ts"></script>`)
    expect(shorthand).not.toContain('aria-invalid')
  })

  it('strips v-bind:aria-invalid from DzStepper', () => {
    const input = `<template><DzStepper v-bind:aria-invalid="bad">x</DzStepper></template><script setup lang="ts"></script>`
    const result = applyTransform(input)
    expect(result).not.toContain('aria-invalid')
  })

  it('strips all four removed props from DzFloatLabel', () => {
    const input = `<template><DzFloatLabel label="Email" :aria-label="a" :aria-labelledby="b" :aria-describedby="c" :aria-invalid="d"><input></DzFloatLabel></template><script setup lang="ts"></script>`
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).not.toContain('aria-label')
    expect(result).not.toContain('aria-labelledby')
    expect(result).not.toContain('aria-describedby')
    expect(result).not.toContain('aria-invalid')
    expect(result).toContain('label="Email"')
  })

  /**
   * The three props that were **implemented** rather than removed must survive.
   * A codemod that stripped every ARIA prop off every wrapper would be the same
   * class of mistake the task exists to fix, in the opposite direction.
   */
  it('keeps the props that are now honoured', () => {
    const stepper = applyTransform(`<template><DzStepper :aria-labelledby="h" :aria-describedby="d">x</DzStepper></template><script setup lang="ts"></script>`)
    expect(stepper).toBeNull()
    const inplace = applyTransform(`<template><DzInplace :aria-labelledby="h" />"</template><script setup lang="ts"></script>`)
    expect(inplace).toBeNull()
  })

  it('leaves aria-invalid on a component that still declares it', () => {
    const input = `<template><DzInput :aria-invalid="bad" /></template><script setup lang="ts"></script>`
    expect(applyTransform(input)).toBeNull()
  })

  it('removes the JSX spelling of a removed prop', () => {
    const input = `const el = <DzGrid cols={2} ariaInvalid={bad} />`
    const result = applyTransform(input, 'test.tsx')
    expect(result).not.toBeNull()
    expect(result).not.toContain('ariaInvalid')
    expect(result).toContain('cols={2}')
  })

  it('is idempotent — a second run finds nothing left to strip', () => {
    const input = `<template><DzGrid :aria-invalid="bad">x</DzGrid></template><script setup lang="ts"></script>`
    const once = applyTransform(input)
    expect(once).not.toBeNull()
    expect(applyTransform(once as string)).toBeNull()
  })
})
