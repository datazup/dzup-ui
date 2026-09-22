#!/usr/bin/env bash
# release-rehearsal.sh — full pre-publish smoke test for dzup-ui
# Simulates what CI does on a clean checkout, but runs locally.
#
# Usage:
#   bash scripts/release-rehearsal.sh
#   bash scripts/release-rehearsal.sh --skip-install   # reuse existing node_modules
#   bash scripts/release-rehearsal.sh --no-evidence    # gates only, no release bundle
#
# Requirements: node >=20, yarn (corepack), git
#
# ── What TASK-R1-O3 changed, and why ─────────────────────────────────────────
#
# 1. Every gate now writes a MACHINE-READABLE row to
#    docs/qa/release/<date>-<sha>/results.jsonl and a log to
#    .../logs/NN-<name>.txt, so `yarn release:report` can project sections 2
#    and 3 of the release report instead of anyone re-typing them. Before this,
#    the rehearsal printed to a terminal and left nothing behind: a run that
#    passed and a run that never happened were indistinguishable the next day.
#
#    The logs are `.txt`, not `.log`, on purpose: `.gitignore:42` is `*.log`,
#    so a bundle whose per-gate evidence were `.log` files could never be
#    committed. Pro's release bundle hit exactly this (its finding E-6, 50
#    ignored logs).
#
# 2. Exit codes are captured DIRECTLY (`set +e; cmd > log 2>&1; rc=$?`), never
#    through a pipe. `cmd | tee log` returns tee's status, which is how an
#    aggregate in this repository reported green over a stale artifact for
#    three packets (S1-F10).
#
# 3. The old step 8 — `npm pack --dry-run` piped through `grep workspace:` —
#    was REPLACED, because it could never fail. `npm pack --dry-run` prints the
#    tarball's FILE LIST, so the grep had nothing to match (measured: 0
#    matches), while a real `npm pack` of packages/core *does* emit
#    `"@dzup-ui/contracts": "workspace:*"`. It is now
#    `yarn validate:published-imports --built`, which packs with `yarn pack`
#    and actually LOADS every published entry, plus `yarn release:evidence`,
#    which reads the dependency block of the manifest inside each tarball —
#    the check the old step believed it was making. (TASK-R1-O2 finding F2 /
#    decision D151; the identical step in .github/workflows/ci.yml is D151's
#    and is not touched here.)
#
# 4. The API diff, the supply-chain evidence and the 8-section report now run
#    as part of the rehearsal, so a rehearsal produces a BUNDLE rather than a
#    verdict.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

SKIP_INSTALL=false
WITH_EVIDENCE=true
for arg in "$@"; do
  [[ "$arg" == "--skip-install" ]] && SKIP_INSTALL=true
  [[ "$arg" == "--no-evidence" ]] && WITH_EVIDENCE=false
done

step() { echo -e "\n${BOLD}==> $*${NC}"; }
ok()   { echo -e "${GREEN}✓ $*${NC}"; }
fail() { echo -e "${RED}✗ FAILED: $*${NC}"; exit 1; }
warn() { echo -e "${YELLOW}⚠ $*${NC}"; }

# ─── Bundle ───────────────────────────────────────────────────────────────────
HEAD_SHA="$(git rev-parse HEAD 2>/dev/null || echo unknown)"
SHORT_SHA="${HEAD_SHA:0:7}"
DIRTY_COUNT="$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')"
BUNDLE="docs/qa/release/$(date -u +%Y-%m-%d)-${SHORT_SHA}"
mkdir -p "$BUNDLE/logs"
: > "$BUNDLE/results.jsonl"

GATE_N=0

# run_gate <name> <shell command>
#
# Runs the command with its output captured to a log, reads the exit status
# DIRECTLY, appends one JSON row, and stops the rehearsal on failure. The row
# is written whether the gate passed or failed, so a fail-fast run still leaves
# a ledger naming the gate that stopped it.
run_gate() {
  local name="$1"; shift
  local cmd="$*"
  GATE_N=$((GATE_N + 1))
  local n_padded
  n_padded="$(printf '%02d' "$GATE_N")"
  local log="${n_padded}-${name}.txt"
  local started
  started="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  local t0
  t0="$(date +%s)"

  step "${GATE_N}. ${cmd}"
  set +e
  eval "$cmd" > "$BUNDLE/logs/$log" 2>&1
  local rc=$?
  set -e
  local t1
  t1="$(date +%s)"

  node -e '
    const [name, cmd, exit, seconds, log, startedAt, n, out] = process.argv.slice(1)
    require("node:fs").appendFileSync(out, `${JSON.stringify({
      n: Number(n), name, command: cmd, exit: Number(exit),
      seconds: Number(seconds), log, startedAt,
    })}\n`)
  ' "$name" "$cmd" "$rc" "$((t1 - t0))" "$log" "$started" "$GATE_N" "$BUNDLE/results.jsonl"

  if [[ $rc -ne 0 ]]; then
    tail -40 "$BUNDLE/logs/$log" || true
    fail "$name (exit $rc) — log: $BUNDLE/logs/$log"
  fi
  ok "$name ($((t1 - t0))s)"
}

echo ""
echo -e "${BOLD}dzup-ui release rehearsal${NC}"
echo "Repo:   $REPO_ROOT"
echo "Date:   $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "Node:   $(node --version)"
echo "Yarn:   $(yarn --version 2>/dev/null || echo 'not found')"
echo "HEAD:   $HEAD_SHA"
echo "Dirty:  $DIRTY_COUNT path(s)$([[ "$DIRTY_COUNT" != "0" ]] && echo '  ← the bundle will be stamped admissible: false')"
echo "Bundle: $BUNDLE"
echo ""

# ─── 1. Clean install ─────────────────────────────────────────────────────────
if [[ "$SKIP_INSTALL" == "false" ]]; then
  run_gate "install-immutable" "yarn install --immutable"
else
  warn "Skipping install (--skip-install) — this gate is absent from the ledger, not passing"
fi

# ─── Repository gates ─────────────────────────────────────────────────────────
run_gate "typecheck-all"  "yarn typecheck:all"
run_gate "typecheck-tooling" "yarn typecheck:tooling"
run_gate "lint"           "yarn lint"
run_gate "test"           "yarn test"
run_gate "test-contracts" "yarn test:contracts"
run_gate "test-a11y"      "yarn test:a11y"
run_gate "build"          "yarn build"

# ─── Packaged-artifact gates ──────────────────────────────────────────────────
#
# `validate:all` runs after the build on purpose: several of its links read
# generated artifacts, and `validate:published-imports --built` requires a dist
# that exists and is not older than its sources.
run_gate "validate-all"   "yarn validate:all"
run_gate "dist-artifacts" "bash scripts/release-checks/dist-artifacts.sh"
run_gate "esm-only"       "bash scripts/release-checks/esm-only.sh"
run_gate "published-imports" "yarn validate:published-imports --built"

# The nearest thing OSS has to a downstream canary: real Nuxt consumers built
# from the PACKED tarballs, outside the repository. It is not adoption evidence
# and the report says so — but a rehearsal that never installs its own output
# into anything leaves section 6 with nothing at all.
run_gate "nuxt-fixtures" "yarn test:nuxt-fixtures:pack"

# ─── Release evidence ─────────────────────────────────────────────────────────
if [[ "$WITH_EVIDENCE" == "true" ]]; then
  run_gate "api-diff"  "yarn release:api-diff --out $BUNDLE"
  run_gate "evidence"  "yarn release:evidence --out $BUNDLE"
  # The report is a projection of results.jsonl, so it runs LAST and is not
  # itself a gate row — a report that reported on itself would be circular.
  step "$((GATE_N + 1)). yarn release:report --out $BUNDLE"
  yarn release:report --out "$BUNDLE" || fail "release:report"
  ok "release report written"
else
  warn "Skipping release evidence (--no-evidence)"
fi

# ─── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}=========================================${NC}"
echo -e "${GREEN}${BOLD}  Release rehearsal: all gates exit 0${NC}"
echo -e "${GREEN}${BOLD}=========================================${NC}"
echo ""
echo "Bundle:  $BUNDLE"
echo "Ledger:  $BUNDLE/ledger.md"
echo "Report:  $BUNDLE/report.md"
echo ""
if [[ "$DIRTY_COUNT" != "0" ]]; then
  warn "The worktree carried $DIRTY_COUNT uncommitted path(s): every artifact in this"
  warn "bundle is stamped 'admissible: false'. It is a CANDIDATE record, not release"
  warn "evidence. doc 08's first stop condition is 'dirty/unidentified source'."
  echo ""
fi
echo "This rehearsal publishes, tags, signs and dispatches NOTHING. Those are owner"
echo "actions. Next: review $BUNDLE/report.md section 8."
