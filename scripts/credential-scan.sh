#!/usr/bin/env bash
# credential-scan.sh — scan git history for accidentally committed secrets
# Run this BEFORE executing git filter-repo (H3 history purge).
# Usage: bash scripts/credential-scan.sh [--fix]
#
# Requires: git (already installed)
# Optionally uses: gitleaks (https://github.com/gitleaks/gitleaks) if available
# No network access required; pure git log scanning.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

echo "=== Credential scan for: $(basename "$REPO_ROOT") ==="
echo "Working dir: $REPO_ROOT"
echo ""

FOUND=0

# ─── Pattern list ─────────────────────────────────────────────────────────────
# Covers tokens, keys, and credentials commonly leaked in UI repos.
declare -a PATTERNS=(
  # Generic high-entropy tokens / API keys
  'AKIA[0-9A-Z]{16}'                         # AWS access key ID
  '[Aa][Ww][Ss]_[Ss][Ee][Cc][Rr][Ee][Tt]'   # AWS secret reference
  'ghp_[A-Za-z0-9]{36}'                      # GitHub personal access token (classic)
  'github_pat_[A-Za-z0-9_]{82}'             # GitHub fine-grained PAT
  'npm_[A-Za-z0-9]{36}'                      # npm automation token
  'sk-[A-Za-z0-9]{48}'                       # OpenAI-style secret key
  'xox[baprs]-[A-Za-z0-9\-]{10,48}'         # Slack token
  # Generic patterns
  '[Pp][Aa][Ss][Ss][Ww][Oo][Rr][Dd]\s*=\s*["\x27][^"]{6,}'
  '[Ss][Ee][Cc][Rr][Ee][Tt]\s*[:=]\s*["\x27][^"]{8,}'
  '[Aa][Pp][Ii][_-][Kk][Ee][Yy]\s*[:=]\s*["\x27][^"]{8,}'
  '[Tt][Oo][Kk][Ee][Nn]\s*[:=]\s*["\x27][A-Za-z0-9_\-\.]{16,}'
  # Private keys
  '-----BEGIN (RSA|EC|DSA|OPENSSH|PGP) PRIVATE KEY'
  # Connection strings
  'mongodb(\+srv)?://[^:]+:[^@]+@'
  'postgres(ql)?://[^:]+:[^@]+@'
  'mysql://[^:]+:[^@]+@'
  'redis://:?[^@]+@'
  # .env-style
  '^(export )?[A-Z_]+=.{8,}$'
)

# ─── 1. Scan current working tree ─────────────────────────────────────────────
echo "--- [1/3] Scanning working tree ---"
for pat in "${PATTERNS[@]}"; do
  matches=$(git grep -lE "$pat" -- ':!node_modules' ':!*.lock' ':!scripts/credential-scan.sh' 2>/dev/null || true)
  if [[ -n "$matches" ]]; then
    echo -e "${RED}PATTERN HIT (working tree):${NC} $pat"
    echo "$matches" | sed 's/^/  /'
    FOUND=$((FOUND + 1))
  fi
done

# ─── 2. Scan git history (all refs) ──────────────────────────────────────────
echo ""
echo "--- [2/3] Scanning git history (all commits) ---"
echo "    (This may take a minute on large repos)"

for pat in "${PATTERNS[@]}"; do
  # git log -G searches diff content; -S counts occurrences
  hits=$(git log --all --oneline -G "$pat" -- 2>/dev/null | head -20 || true)
  if [[ -n "$hits" ]]; then
    echo -e "${RED}PATTERN HIT (history):${NC} $pat"
    echo "$hits" | sed 's/^/  commit: /'
    FOUND=$((FOUND + 1))
  fi
done

# ─── 3. Check for .env files ever tracked ────────────────────────────────────
echo ""
echo "--- [3/3] Checking for .env files ever tracked ---"
env_history=$(git log --all --full-history --oneline -- '**/.env' '.env' '**/.env.*' '.env.*' 2>/dev/null || true)
if [[ -n "$env_history" ]]; then
  echo -e "${YELLOW}WARNING: .env files found in history:${NC}"
  echo "$env_history" | sed 's/^/  /'
  FOUND=$((FOUND + 1))
else
  echo -e "${GREEN}OK: No .env files found in history.${NC}"
fi

# ─── Optional: gitleaks ──────────────────────────────────────────────────────
echo ""
if command -v gitleaks &>/dev/null; then
  echo "--- [bonus] Running gitleaks detect ---"
  gitleaks detect --source . --no-git 2>&1 || true
else
  echo -e "${YELLOW}TIP: Install gitleaks for a more thorough scan:${NC}"
  echo "  https://github.com/gitleaks/gitleaks#installation"
fi

# ─── Summary ─────────────────────────────────────────────────────────────────
echo ""
echo "========================================="
if [[ $FOUND -gt 0 ]]; then
  echo -e "${RED}SCAN COMPLETE — $FOUND pattern(s) matched.${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Manually review each hit above to confirm it is a real secret."
  echo "  2. Rotate any confirmed credentials immediately."
  echo "  3. Then run the H3 filter-repo purge (see STATUS.md §H3)."
  exit 1
else
  echo -e "${GREEN}SCAN COMPLETE — No obvious credentials found.${NC}"
  echo "You may proceed with the H3 git filter-repo purge."
fi
