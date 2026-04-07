/**
 * Tests for the rename-events transform.
 *
 * Verifies that component events are correctly renamed in Vue SFC templates
 * and script sections.
 */

import jscodeshift from 'jscodeshift'
import { describe, expect, it } from 'vitest'
import transformer from '../rename-events.js'

/** Helper to run the transform on a source string. */
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

describe('rename-events transform', () => {
  // -----------------------------------------------------------------------
  // Template event renames
  // -----------------------------------------------------------------------

  it('renames @update:visible to @update:open on DzDialog', () => {
    const input = `<template><DzDialog @update:visible="onClose"></DzDialog></template><script setup lang="ts"></script>`
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('@update:open="onClose"')
    expect(result).not.toContain('@update:visible')
  })

  it('renames v-on:update:visible to v-on:update:open on DzDrawer', () => {
    const input = `<template><DzDrawer v-on:update:visible="onClose"></DzDrawer></template><script setup lang="ts"></script>`
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('v-on:update:open="onClose"')
  })

  it('renames @input to @update:modelValue on DzInput', () => {
    const input = `<template><DzInput @input="onInput"></DzInput></template><script setup lang="ts"></script>`
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('@update:modelValue="onInput"')
    expect(result).not.toContain('@input')
  })

  it('renames @input to @update:modelValue on DzSelect', () => {
    const input = `<template><DzSelect @input="onChange"></DzSelect></template><script setup lang="ts"></script>`
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('@update:modelValue="onChange"')
  })

  // -----------------------------------------------------------------------
  // Script-level event string renames
  // -----------------------------------------------------------------------

  it('renames "update:visible" string in defineEmits array', () => {
    const input = [
      '<template><DzDialog></DzDialog></template>',
      `<script setup lang="ts">`,
      `const emit = defineEmits(['update:visible', 'close'])`,
      `</script>`,
    ].join('\n')
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('\'update:open\'')
    expect(result).not.toContain('\'update:visible\'')
    // 'close' should be unchanged
    expect(result).toContain('\'close\'')
  })

  it('renames "input" string in emit() calls', () => {
    const input = [
      '<template><DzInput></DzInput></template>',
      `<script setup lang="ts">`,
      `const emit = defineEmits(['input'])`,
      `emit('input', value)`,
      `</script>`,
    ].join('\n')
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('\'update:modelValue\'')
  })

  // -----------------------------------------------------------------------
  // Idempotency
  // -----------------------------------------------------------------------

  it('does not modify already-correct events', () => {
    const input = `<template><DzDialog @update:open="onClose"></DzDialog></template><script setup lang="ts"></script>`
    const result = applyTransform(input)
    expect(result).toBeNull()
  })

  it('does not modify unrelated events', () => {
    const input = `<template><DzButton @click="onClick"></DzButton></template><script setup lang="ts"></script>`
    const result = applyTransform(input)
    expect(result).toBeNull()
  })

  it('does not modify events on non-matching components', () => {
    const input = `<template><div @input="onInput"></div></template><script setup lang="ts"></script>`
    const result = applyTransform(input)
    expect(result).toBeNull()
  })
})
