#!/usr/bin/env bash
# Every build output a publishable package promises must exist after `yarn build`.
#
# Extracted from scripts/release-rehearsal.sh by TASK-R1-O3 so that it is a
# command with an exit code — a gate the ledger can record a row for — instead
# of an inline block whose result vanished with the terminal.
#
# This is deliberately a CHEAP presence check on the workspace `dist/`, not a
# packaging check: `yarn validate:published-imports --built` owns the packed
# truth (it packs with `yarn pack`, extracts, and imports every declared
# subpath). The two are complementary, and this one runs first because a
# missing `dist/index.js` should be reported as a missing build, not as a
# failed import.

set -euo pipefail
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

EXPECTED=(
  "packages/contracts/dist/index.js"
  "packages/contracts/dist/index.d.ts"
  "packages/tokens/dist/index.js"
  "packages/tokens/dist/index.d.ts"
  "packages/tokens/dist/tokens.css"
  "packages/tokens/dist/tokens.dtcg.json"
  "packages/core/dist/index.js"
  "packages/core/dist/index.d.ts"
  "packages/core/dist/core.css"
  "packages/testing/dist/index.js"
  "packages/testing/dist/index.d.ts"
  "packages/mcp/dist/index.js"
  "packages/compat/dist/index.js"
  "packages/codemods/dist/index.js"
  "packages/nuxt/dist/module.js"
  "packages/nuxt/dist/module.d.ts"
)

MISSING=()
for f in "${EXPECTED[@]}"; do
  [[ -f "$f" ]] || MISSING+=("$f")
done

if [[ ${#MISSING[@]} -gt 0 ]]; then
  echo "Missing dist artifacts:"
  printf '  %s\n' "${MISSING[@]}"
  exit 1
fi

echo "All ${#EXPECTED[@]} expected dist artifacts present."
