# ADR-17: Token Source Of Truth And Component Token Ownership

Date: 2026-04-22

Status: Accepted

## Context

`dzup-ui` already has a strong token foundation in `@dzup-ui/tokens`:

- primitives
- semantic theme mappings
- selected shared component token families
- generated CSS custom properties
- Tailwind integration

At the same time, many components in `@dzup-ui/core` and `@dzup-ui/pro` still maintain local `*.tokens.ts` files that map shared token semantics into component-specific implementation details.

That means the codebase currently has two distinct token ownership layers:

1. central token definitions in `@dzup-ui/tokens`
2. component-local token adaptation files in component packages

The previous wording in some repo surfaces overstated the central package as the source of truth for all tokens. That is not accurate for the current implementation.

## Decision

We are adopting a hybrid token ownership model.

### Canonical source of truth

`@dzup-ui/tokens` is the canonical source of truth for:

- primitive design tokens
- semantic theme tokens
- shared cross-component token families that are intentionally public and reusable

### Component ownership

Component-local `*.tokens.ts` files in `@dzup-ui/core` and `@dzup-ui/pro` are the source of truth for:

- component-level token mapping
- implementation adaptation from shared tokens to component anatomy
- local indirection needed by a component's variants, states, or compound structure

These component-local token files are implementation-layer assets, not a competing public token package.

## Consequences

### What changes immediately

- repo and package docs must stop claiming that all component tokens are centralized in `@dzup-ui/tokens`
- contributor guidance must distinguish between canonical tokens and component adaptation layers
- new components should build from shared token semantics first, then add local mapping only where necessary

### What does not change immediately

- we are not forcing all component `*.tokens.ts` files into `@dzup-ui/tokens`
- we are not introducing a separate `@dzup-ui-pro/tokens` package
- we are not blocking component-local token files when they are the clearest implementation boundary

## Rules

### Use `@dzup-ui/tokens` for:

- primitive scales
- light/dark semantic tokens
- interaction-contract semantics
- token families intentionally shared across multiple component families
- token values that are part of the stable public theming surface

### Use component-local `*.tokens.ts` for:

- component anatomy mapping
- local slot or subpart token indirection
- temporary adaptation while a family is stabilizing
- cases where centralization would add coupling without increasing reuse

### Do not:

- claim that component-local token files are independent token systems
- create a second public token package for Pro
- duplicate central token definitions locally when a stable shared token already exists

## Follow-up Plan

### Immediate

1. Align repo docs and package comments with this ADR.
2. Remove wording that claims full token centralization where the codebase is still hybrid.
3. Document this ownership model for contributors and agents.

### Short term

1. Review component-local token files and identify which families are truly stable and reusable.
2. Promote only those stable families into `@dzup-ui/tokens`.
3. Keep component-local files where they are implementation details rather than theming API.

### Long term

1. Consider generating more component token maps from canonical token schemas.
2. Reduce handwritten duplication where it adds no design-system value.
3. Reassess whether the hybrid model should remain permanent or become a transitional stage toward stricter centralization.

## Rationale

This decision keeps the architecture honest.

The current codebase is too component-local to truthfully claim total centralization, but it is already centralized enough that primitives and semantics should not be redefined ad hoc inside components. A hybrid model preserves delivery velocity while tightening the design-system contract around what is truly canonical.
