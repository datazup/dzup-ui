#!/usr/bin/env bash
# release-rehearsal.sh — full pre-publish smoke test for dzup-ui
# Simulates what CI does on a clean checkout, but runs locally.
#
# Usage:
#   bash scripts/release-rehearsal.sh
#   bash scripts/release-rehearsal.sh --skip-install   # reuse existing node_modules
#
# Requirements: node >=20, yarn (corepack), git

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

SKIP_INSTALL=false
for arg in "$@"; do
  [[ "$arg" == "--skip-install" ]] && SKIP_INSTALL=true
done

step() { echo -e "\n${BOLD}==> $*${NC}"; }
ok()   { echo -e "${GREEN}✓ $*${NC}"; }
fail() { echo -e "${RED}✗ FAILED: $*${NC}"; exit 1; }
warn() { echo -e "${YELLOW}⚠ $*${NC}"; }

echo ""
echo -e "${BOLD}dzup-ui release rehearsal${NC}"
echo "Repo: $REPO_ROOT"
echo "Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "Node: $(node --version)"
echo "Yarn: $(yarn --version 2>/dev/null || echo 'not found')"
echo ""

# ─── 1. Clean install ─────────────────────────────────────────────────────────
if [[ "$SKIP_INSTALL" == "false" ]]; then
  step "1. yarn install --immutable"
  yarn install --immutable || fail "yarn install --immutable"
  ok "Dependencies installed"
else
  warn "Skipping install (--skip-install)"
fi

# ─── 2. Typecheck ─────────────────────────────────────────────────────────────
step "2. yarn typecheck:all"
yarn typecheck:all || fail "typecheck:all"
ok "No type errors"

# ─── 3. Lint ──────────────────────────────────────────────────────────────────
step "3. yarn lint"
yarn lint || fail "lint"
ok "No lint errors"

# ─── 4. Tests ─────────────────────────────────────────────────────────────────
step "4. yarn test (unit + contracts + a11y)"
yarn test           || fail "yarn test"
yarn test:contracts || fail "yarn test:contracts"
yarn test:a11y      || fail "yarn test:a11y"
ok "All tests pass"

# ─── 5. Build ─────────────────────────────────────────────────────────────────
step "5. yarn build"
yarn build || fail "yarn build"
ok "Build succeeded"

# ─── 6. Verify dist artifacts ─────────────────────────────────────────────────
step "6. Verify dist artifacts"
MISSING=()
declare -a EXPECTED=(
  "packages/contracts/dist/index.js"
  "packages/contracts/dist/index.d.ts"
  "packages/tokens/dist/index.js"
  "packages/tokens/dist/index.d.ts"
  "packages/core/dist/index.js"
  "packages/core/dist/index.d.ts"
  "packages/compat/dist/index.js"
  "packages/codemods/dist/index.js"
  "packages/nuxt/dist/module.js"
)
for f in "${EXPECTED[@]}"; do
  [[ -f "$f" ]] || MISSING+=("$f")
done
if [[ ${#MISSING[@]} -gt 0 ]]; then
  echo "Missing dist artifacts:"
  printf '  %s\n' "${MISSING[@]}"
  fail "dist artifacts incomplete"
fi
ok "All expected dist artifacts present"

# ─── 7. ESM-only check ────────────────────────────────────────────────────────
step "7. ESM-only policy check (no CJS output)"
if find packages/core/dist packages/tokens/dist packages/contracts/dist \
     -name "*.cjs" -o -name "*.cjs.js" 2>/dev/null | grep -q .; then
  fail "CJS output detected — ESM-only policy violation"
fi
ok "ESM-only output verified"

# ─── 8. Pack smoke tests for all publishable packages ─────────────────────────
step "8. npm pack --dry-run smoke tests"
declare -a PUBLISHABLE=(
  "packages/contracts"
  "packages/tokens"
  "packages/core"
  "packages/compat"
  "packages/codemods"
  "packages/nuxt"
)
for pkg in "${PUBLISHABLE[@]}"; do
  if [[ ! -f "$pkg/package.json" ]]; then
    warn "Skipping $pkg (no package.json)"
    continue
  fi
  pack_out=$(cd "$pkg" && npm pack --dry-run 2>&1)
  if echo "$pack_out" | grep -q "link:"; then
    echo "$pack_out"
    fail "$pkg: link: dependency in tarball"
  fi
  if echo "$pack_out" | grep -q "workspace:"; then
    echo "$pack_out"
    fail "$pkg: workspace: dependency in tarball (not resolved — use real semver)"
  fi
  ok "$pkg: pack clean"
done

# ─── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}=========================================${NC}"
echo -e "${GREEN}${BOLD}  Release rehearsal PASSED${NC}"
echo -e "${GREEN}${BOLD}=========================================${NC}"
echo ""
echo "All gates passed. The repo is ready to publish."
echo "Next: coordinate H3 history purge, then run the actual changeset publish."
