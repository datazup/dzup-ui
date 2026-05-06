# `@dzup-ui/codemods`

Automated code transforms (codemods) for migrating from old dzup-ui to `@dzup-ui/core` vNext.

## Install

```bash
yarn add -D @dzup-ui/codemods
# or npx without install:
npx @dzup-ui/codemods <transform> <path>
```

## Usage

```bash
# List available transforms
yarn dzup-codemod --list

# Apply a transform to your source directory
yarn dzup-codemod rename-imports ./src
```

## Available transforms

| Transform | Description |
|---|---|
| `rename-imports` | Updates import paths from `@old/dzup-ui` to `@dzup-ui/core` |
| `update-props` | Renames deprecated prop names to the new API |
| `remove-compat` | Replaces `@dzup-ui/compat` imports with direct `@dzup-ui/core` ones |

## Notes

- Codemods use `jscodeshift` — they modify files in-place. Commit your changes before running.
- Always review the diff after applying a codemod — not all edge cases can be automated.
- For manual migration guidance, see the `@dzup-ui/compat` [README](../compat/README.md).
