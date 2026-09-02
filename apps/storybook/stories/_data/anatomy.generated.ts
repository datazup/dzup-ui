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
  DzBlockquote: {
    parts: ['root', 'content', 'footer'],
    states: [],
    componentTokens: [],
    riskTier: 'A',
    optionalParts: ['footer'],
    rtl: { mirrors: 'layout', keyboard: 'none' },
  },
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
  DzButtonGroup: {
    parts: ['root'],
    states: ['idle', 'disabled'],
    componentTokens: [],
    riskTier: 'A',
    recipes: ['variant', 'size', 'tone', 'orientation'],
    rtl: { mirrors: 'layout', keyboard: 'none' },
  },
  DzCaption: {
    parts: ['root'],
    states: [],
    componentTokens: [],
    riskTier: 'A',
    recipes: ['tone'],
    rtl: { mirrors: 'layout', keyboard: 'none' },
  },
  DzCode: {
    parts: ['root'],
    states: [],
    componentTokens: [],
    riskTier: 'A',
    recipes: ['variant'],
    rtl: { mirrors: 'none', keyboard: 'none' },
  },
  DzCodeBlock: {
    parts: ['root', 'header', 'filename', 'language', 'copy-button', 'content', 'line-number'],
    states: [],
    componentTokens: [],
    riskTier: 'A',
    optionalParts: ['header', 'filename', 'language', 'copy-button', 'line-number'],
    rtl: { mirrors: 'none', keyboard: 'none' },
  },
  DzCopyButton: {
    parts: ['root'],
    states: ['idle', 'copied', 'disabled'],
    componentTokens: [],
    riskTier: 'B',
    recipes: ['variant', 'size', 'tone'],
    rtl: { mirrors: 'layout', keyboard: 'none' },
  },
  DzDialog: {
    parts: 'none',
    states: [],
    componentTokens: [],
    riskTier: 'B',
    rtl: { mirrors: 'layout', keyboard: 'none' },
  },
  DzFab: {
    parts: ['root', 'spinner', 'icon'],
    states: ['idle', 'loading', 'disabled'],
    componentTokens: ['--dz-fab-icon-size', '--dz-fab-offset', '--dz-fab-shadow', '--dz-fab-shadow-hover', '--dz-fab-size', '--dz-fab-z'],
    riskTier: 'B',
    recipes: ['variant', 'size', 'tone'],
    optionalParts: ['spinner', 'icon'],
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
  DzHeading: {
    parts: ['root'],
    states: [],
    componentTokens: [],
    riskTier: 'A',
    recipes: ['size'],
    rtl: { mirrors: 'layout', keyboard: 'none' },
  },
  DzIconButton: {
    parts: ['root', 'spinner'],
    states: ['idle', 'loading', 'disabled'],
    componentTokens: [],
    riskTier: 'B',
    recipes: ['variant', 'size', 'tone'],
    optionalParts: ['spinner'],
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
  DzInputGroup: {
    parts: ['root', 'prefix', 'content', 'suffix'],
    states: ['disabled'],
    componentTokens: [],
    riskTier: 'A',
    recipes: ['size'],
    optionalParts: ['prefix', 'suffix'],
    rtl: { mirrors: 'layout', keyboard: 'none' },
  },
  DzInputMask: {
    parts: ['root', 'control', 'input', 'prefix', 'suffix', 'error'],
    states: ['disabled', 'loading', 'readonly', 'required', 'completed'],
    componentTokens: [],
    riskTier: 'B',
    recipes: ['variant', 'size', 'tone'],
    optionalParts: ['prefix', 'suffix', 'error'],
    rtl: { mirrors: 'layout', keyboard: 'none' },
  },
  DzKbd: {
    parts: ['root', 'item', 'separator'],
    states: [],
    componentTokens: ['--dz-kbd-bg', '--dz-kbd-border', '--dz-kbd-fg', '--dz-kbd-font-size', '--dz-kbd-gap', '--dz-kbd-min-size', '--dz-kbd-padding-x', '--dz-kbd-radius', '--dz-kbd-shadow'],
    riskTier: 'A',
    recipes: ['size'],
    optionalParts: ['item', 'separator'],
    rtl: { mirrors: 'layout', keyboard: 'none' },
  },
  DzNumberInput: {
    parts: ['root', 'control', 'input', 'prefix', 'decrement', 'increment', 'error'],
    states: ['disabled', 'readonly', 'loading', 'required'],
    componentTokens: [],
    riskTier: 'B',
    recipes: ['variant', 'size', 'tone'],
    optionalParts: ['prefix', 'error'],
    rtl: { mirrors: 'layout', keyboard: 'none' },
  },
  DzOtpInput: {
    parts: ['root', 'control', 'input', 'error'],
    states: ['disabled', 'required'],
    componentTokens: [],
    riskTier: 'B',
    recipes: ['size'],
    optionalParts: ['input', 'error'],
    rtl: { mirrors: 'layout', keyboard: 'none' },
  },
  DzPasswordInput: {
    parts: ['root', 'control', 'input', 'prefix', 'spinner', 'toggle', 'error'],
    states: ['disabled', 'loading', 'readonly', 'required'],
    componentTokens: [],
    riskTier: 'B',
    recipes: ['variant', 'size', 'tone'],
    optionalParts: ['prefix', 'spinner', 'error'],
    rtl: { mirrors: 'layout', keyboard: 'none' },
  },
  DzProvider: {
    parts: 'none',
    states: [],
    componentTokens: [],
    riskTier: 'B',
    rtl: { mirrors: 'none', keyboard: 'none' },
  },
  DzRelativeTime: {
    parts: ['root'],
    states: [],
    componentTokens: ['--dz-relative-time-font-size'],
    riskTier: 'A',
    recipes: ['tone'],
    rtl: { mirrors: 'layout', keyboard: 'none' },
  },
  DzSearchInput: {
    parts: ['root', 'control', 'icon', 'input', 'spinner', 'clear', 'error'],
    states: ['disabled', 'readonly', 'loading', 'required'],
    componentTokens: [],
    riskTier: 'B',
    recipes: ['variant', 'size', 'tone'],
    optionalParts: ['spinner', 'clear', 'error'],
    rtl: { mirrors: 'layout', keyboard: 'none' },
  },
  DzSelect: {
    parts: ['root', 'trigger', 'icon', 'content', 'viewport', 'input', 'item', 'item-indicator', 'item-label', 'empty', 'error', 'options-state', 'options-message', 'options-retry'],
    states: ['idle', 'open', 'closed', 'disabled', 'invalid', 'checked', 'unchecked'],
    componentTokens: [],
    riskTier: 'B',
    recipes: ['variant', 'size'],
    optionalParts: ['icon', 'content', 'viewport', 'input', 'item', 'item-indicator', 'item-label', 'empty', 'error', 'options-state', 'options-message', 'options-retry'],
    rtl: { mirrors: 'layout', keyboard: 'none', icons: ['indicator'] },
  },
  DzSpeedDial: {
    parts: ['root', 'list', 'item'],
    states: [],
    componentTokens: [],
    riskTier: 'B',
    recipes: ['variant', 'size', 'tone'],
    optionalParts: ['item'],
    rtl: { mirrors: 'layout', keyboard: 'none' },
  },
  DzSplitButton: {
    parts: ['root', 'action', 'trigger'],
    states: ['idle', 'loading', 'disabled'],
    componentTokens: [],
    riskTier: 'B',
    recipes: ['variant', 'size', 'tone'],
    optionalParts: ['action', 'trigger'],
    rtl: { mirrors: 'layout', keyboard: 'none' },
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
  DzText: {
    parts: ['root'],
    states: [],
    componentTokens: [],
    riskTier: 'A',
    recipes: ['size', 'tone'],
    rtl: { mirrors: 'layout', keyboard: 'none' },
  },
  DzTextarea: {
    parts: ['root', 'input', 'spinner', 'error'],
    states: ['disabled', 'loading', 'readonly', 'required'],
    componentTokens: [],
    riskTier: 'B',
    recipes: ['variant', 'size', 'tone'],
    optionalParts: ['spinner', 'error'],
    rtl: { mirrors: 'layout', keyboard: 'none' },
  },
  DzThemeProvider: {
    parts: 'none',
    states: [],
    componentTokens: [],
    riskTier: 'B',
    rtl: { mirrors: 'none', keyboard: 'none' },
  },
  DzToggleButton: {
    parts: ['root'],
    states: ['idle', 'pressed', 'disabled'],
    componentTokens: [],
    riskTier: 'B',
    recipes: ['variant', 'size', 'tone'],
    rtl: { mirrors: 'layout', keyboard: 'none' },
  },
  DzVisuallyHidden: {
    parts: ['root'],
    states: [],
    componentTokens: [],
    riskTier: 'A',
    rtl: { mirrors: 'layout', keyboard: 'none' },
  },
}
