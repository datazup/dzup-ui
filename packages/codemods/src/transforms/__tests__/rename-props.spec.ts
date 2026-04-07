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
})
