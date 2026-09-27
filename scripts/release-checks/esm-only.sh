#!/usr/bin/env bash
# ESM-only policy: no CommonJS output in any published package's `dist/`.
#
# Extracted from scripts/release-rehearsal.sh by TASK-R1-O3 so that it is a
# command with an exit code the release ledger can record.
#
# The original was:
#
#   if find packages/core/dist packages/tokens/dist packages/contracts/dist \
#        -name "*.cjs" -o -name "*.cjs.js" | grep -q . ; then fail; fi
#
# Its `-o` precedence was checked rather than assumed, and it is FINE: GNU find
# applies the implicit `-print` to the whole expression, so both branches were
# reported (verified with findutils 4.10.0 against a seeded `index.cjs` and
# `other.cjs.js` — both detected). The parentheses below are for readability,
# not a fix.
#
# What WAS wrong is the scope: the original named three directories by hand and
# so never looked at `@dzup-ui/testing`, `@dzup-ui/mcp` or `@dzup-ui/nuxt` —
# three of the six packages the policy publishes. The list is now derived from
# release-policy.json, so a newly published package is covered by existing
# rather than by someone remembering. `*.d.cts` is added to the patterns for
# the same reason: a CJS *declaration* is CJS output.

set -euo pipefail
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

mapfile -t DIRS < <(node -e '
  const { readFileSync, readdirSync, existsSync } = require("node:fs")
  const { join } = require("node:path")
  const policy = JSON.parse(readFileSync("packages/tooling/scripts/release-policy.json", "utf8"))
  const published = new Set(policy.published)
  for (const dir of readdirSync("packages")) {
    const manifest = join("packages", dir, "package.json")
    if (!existsSync(manifest)) continue
    const { name } = JSON.parse(readFileSync(manifest, "utf8"))
    if (!published.has(name)) continue
    const dist = join("packages", dir, "dist")
    if (existsSync(dist)) console.log(dist.replace(/\\\\/g, "/"))
  }
')

if [[ ${#DIRS[@]} -eq 0 ]]; then
  echo "No dist/ directory for any published package — run \`yarn build\` first." >&2
  exit 1
fi

FOUND="$(find "${DIRS[@]}" \( -name '*.cjs' -o -name '*.cjs.js' -o -name '*.d.cts' \) -print 2>/dev/null || true)"

if [[ -n "$FOUND" ]]; then
  echo "CJS output detected — ESM-only policy violation:"
  echo "$FOUND"
  exit 1
fi

echo "ESM-only output verified across ${#DIRS[@]} published dist directories."
