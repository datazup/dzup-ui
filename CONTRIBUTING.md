# Contributing to dzup-ui

Thank you for your interest in contributing to dzup-ui! This document outlines the process for contributing to this MIT-licensed Vue 3 component library.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- Yarn 4.x (`corepack enable && corepack prepare yarn@4.6.0 --activate`)

### Setup

```bash
git clone https://github.com/datazup/dzup-ui.git
cd dzup-ui
yarn install
```

### Verify your setup

```bash
yarn typecheck
yarn test
yarn build
```

## Development Workflow

### Branches

- `main` — stable, release-ready code
- `next` — upcoming major changes
- `feat/<name>` — new features
- `fix/<name>` — bug fixes

### Making Changes

1. Fork the repository and create a branch from `main`.
2. Make your changes, adding tests where appropriate.
3. Run the full validation suite before submitting:

```bash
yarn typecheck
yarn lint
yarn test
yarn test:contracts
yarn validate:all
```

4. Ensure all tests pass and coverage does not drop below 80%.

### Interaction Contract

Interactive components should use the shared semantic utilities for focus and disabled states instead of duplicating token plumbing inline.

- Use `button` semantics for explicit actions.
- Use `control` semantics for navigation, selection, toggles, and interactive surfaces.
- Use `input` semantics for direct text entry.
- Use `input-shell` semantics for composite fields that wrap nested inputs.

Reference:
- [packages/core/src/styles/INTERACTION_CONTRACT.md](./packages/core/src/styles/INTERACTION_CONTRACT.md)

The repo now enforces this with:

```bash
yarn validate:interaction-contract
```

### Token Ownership

Use `@dzup-ui/tokens` for primitives, semantic tokens, and shared public token families. Use component-local `*.tokens.ts` files for component anatomy mapping and implementation-level adaptation when centralization would not improve reuse.

Reference:
- [docs/adr/ADR-17-token-source-of-truth-and-component-token-ownership.md](./docs/adr/ADR-17-token-source-of-truth-and-component-token-ownership.md)

### Adding a Component

- Place new components under `packages/core/src/components/<family>/`.
- Add a contract spec (`*.contract.spec.ts`) alongside the component.
- Add an a11y spec (`*.a11y.spec.ts`) for interactive components.
- Follow the semantic interaction contract instead of inlining raw focus-ring token classes or one-off invalid outlines.
- Prefer shared tokens first; add local `*.tokens.ts` indirection only when the component needs its own anatomy mapping or stable subpart semantics.
- Export the component from `packages/core/src/index.ts`.
- Add a Storybook story under `apps/storybook/src/stories/`.

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(buttons): add DzSplitButton loading state
fix(inputs): correct focus ring in dark mode
docs(contributing): add component checklist
```

## Pull Requests

- Keep PRs focused — one feature or fix per PR.
- Fill in the PR template completely.
- Link any related issues with `Closes #<issue>`.
- All CI checks must pass before merge.
- A maintainer review is required before merging.

## Changesets

This project uses [Changesets](https://github.com/changesets/changesets) for versioning.

Add a changeset for any user-facing change:

```bash
yarn changeset
```

Follow the prompts to select the packages changed and the bump type (patch / minor / major).

## Reporting Issues

- Search existing issues before opening a new one.
- Use the provided issue templates.
- For security vulnerabilities, see [SECURITY.md](SECURITY.md) — do **not** open a public issue.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
