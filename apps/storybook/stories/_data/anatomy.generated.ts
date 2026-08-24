/**
 * AUTO-GENERATED — do not edit.
 *
 * Written by `yarn generate:ownership` from
 * packages/core/manifests/component-ownership.manifest.json.
 * `yarn validate:ownership` fails if this file drifts from it.
 *
 * A narrowing of the ownership manifest to the field the docs render: the
 * declared styling surface (ADR-19). Components absent from this table have not
 * declared one yet, and the count is ratcheted in
 * packages/tooling/src/ownership/unclassified-ceiling.json.
 */

/** One component's declared styling surface, as the docs render it. */
export interface DocAnatomy {
  readonly parts: readonly string[] | 'none'
  readonly states: readonly string[]
  readonly componentTokens: readonly string[]
  readonly riskTier: 'A' | 'B' | 'C' | 'D'
  readonly recipes?: readonly string[]
  readonly optionalParts?: readonly string[]
  readonly globalDefaults?: readonly string[]
  /** RTL contract (TASK-OSS-P4-05). */
  readonly rtl?: {
    readonly mirrors: 'layout' | 'none'
    readonly keyboard: 'swap-horizontal' | 'none'
    readonly icons?: readonly string[]
  }
}

/** Public components in the catalog, declared or not. */
export const PUBLIC_COMPONENT_COUNT = 144

/** Components that have declared an anatomy, by exported name. */
export const ANATOMY: Readonly<Record<string, DocAnatomy>> = {
  DzButton: {
    parts: ['root', 'spinner'],
    states: ['idle', 'loading', 'disabled'],
    componentTokens: ['--dz-button-disabled-opacity', '--dz-button-focus-ring-color', '--dz-button-focus-ring-offset', '--dz-button-focus-ring-width', '--dz-button-font-family', '--dz-button-font-weight', '--dz-button-icon-font-size', '--dz-button-icon-height', '--dz-button-icon-width', '--dz-button-lg-font-size', '--dz-button-lg-gap', '--dz-button-lg-height', '--dz-button-lg-padding-x', '--dz-button-md-font-size', '--dz-button-md-gap', '--dz-button-md-height', '--dz-button-md-padding-x', '--dz-button-radius', '--dz-button-sm-font-size', '--dz-button-sm-gap', '--dz-button-sm-height', '--dz-button-sm-padding-x', '--dz-button-transition', '--dz-button-xl-font-size', '--dz-button-xl-gap', '--dz-button-xl-height', '--dz-button-xl-padding-x', '--dz-button-xs-font-size', '--dz-button-xs-gap', '--dz-button-xs-height', '--dz-button-xs-padding-x'],
    riskTier: 'B',
    recipes: ['variant', 'size', 'tone'],
    optionalParts: ['spinner'],
    globalDefaults: ['size', 'variant', 'tone'],
    rtl: { mirrors: 'layout', keyboard: 'none' },
  },
  DzDialog: {
    parts: 'none',
    states: [],
    componentTokens: [],
    riskTier: 'B',
    rtl: { mirrors: 'layout', keyboard: 'none' },
  },
  DzFileUpload: {
    parts: ['root'],
    states: ['disabled'],
    componentTokens: [],
    riskTier: 'D',
    recipes: ['size'],
    rtl: { mirrors: 'layout', keyboard: 'none' },
  },
  DzInput: {
    parts: ['root', 'control', 'input', 'prefix', 'suffix', 'spinner', 'clear', 'error'],
    states: ['disabled', 'loading', 'readonly'],
    componentTokens: ['--dz-input-bg', '--dz-input-border', '--dz-input-border-focus', '--dz-input-disabled-opacity', '--dz-input-focus-ring-color', '--dz-input-focus-ring-width', '--dz-input-font-family', '--dz-input-lg-font-size', '--dz-input-lg-height', '--dz-input-lg-padding-x', '--dz-input-md-font-size', '--dz-input-md-height', '--dz-input-md-padding-x', '--dz-input-placeholder', '--dz-input-radius', '--dz-input-sm-font-size', '--dz-input-sm-height', '--dz-input-sm-padding-x', '--dz-input-transition', '--dz-input-xl-font-size', '--dz-input-xl-height', '--dz-input-xl-padding-x', '--dz-input-xs-font-size', '--dz-input-xs-height', '--dz-input-xs-padding-x'],
    riskTier: 'B',
    recipes: ['variant', 'size', 'tone'],
    optionalParts: ['prefix', 'suffix', 'spinner', 'clear', 'error'],
    rtl: { mirrors: 'layout', keyboard: 'none' },
  },
  DzProvider: {
    parts: 'none',
    states: [],
    componentTokens: [],
    riskTier: 'B',
    rtl: { mirrors: 'none', keyboard: 'none' },
  },
  DzSelect: {
    parts: ['root', 'trigger', 'icon', 'content', 'viewport', 'input', 'item', 'item-indicator', 'item-label', 'empty', 'error'],
    states: ['idle', 'open', 'closed', 'disabled', 'invalid', 'checked', 'unchecked'],
    componentTokens: [],
    riskTier: 'B',
    recipes: ['variant', 'size'],
    optionalParts: ['icon', 'content', 'viewport', 'input', 'item', 'item-indicator', 'item-label', 'empty', 'error'],
    rtl: { mirrors: 'layout', keyboard: 'none', icons: ['indicator'] },
  },
  DzTable: {
    parts: ['root', 'content', 'title', 'header', 'body', 'row', 'cell', 'footer'],
    states: ['ready', 'loading', 'selected'],
    componentTokens: [],
    riskTier: 'C',
    recipes: ['size', 'variant'],
    optionalParts: ['title', 'header', 'body', 'row', 'cell', 'footer'],
    rtl: { mirrors: 'layout', keyboard: 'swap-horizontal' },
  },
  DzThemeProvider: {
    parts: 'none',
    states: [],
    componentTokens: [],
    riskTier: 'B',
    rtl: { mirrors: 'none', keyboard: 'none' },
  },
}
