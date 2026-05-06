# `@dzup-ui/contracts`

Canonical public-API contracts for dzup-ui components — typed interfaces for props, emits, slots, and expose surfaces (Contract Spec v1).

## Install

```bash
yarn add @dzup-ui/contracts
```

Peer dependency: `vue >= 3.5`

## What's in here

- **`CanonicalSize`** — `'xs' | 'sm' | 'md' | 'lg' | 'xl'`
- **`CanonicalTone`** — `'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'`
- **Variant types** — `ButtonVariant`, `CardVariant`, `InputVariant`, `AlertVariant`, `BadgeVariant`, `TabsVariant`, `ProgressVariant`, `ChipVariant`
- **Base prop interfaces** — `BaseAccessibilityProps`, `BaseBehaviorProps`, `BaseAppearanceProps`, `BaseValidationProps`, `BaseInteractiveProps`, `BaseFormControlProps`
- **Event type helpers** — `ChangeEvents<T>`, `FocusEvents`, `KeyboardEvents`

## Usage

```ts
import type { CanonicalSize, ButtonVariant, BaseAccessibilityProps } from '@dzup-ui/contracts'

export interface MyButtonProps extends BaseAccessibilityProps {
  size?: CanonicalSize
  variant?: ButtonVariant
}
```

All components in `@dzup-ui/core` and `@dzup-ui-pro/pro` extend these types — do the same in third-party components for consistency.
