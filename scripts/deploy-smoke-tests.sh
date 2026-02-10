#!/usr/bin/env bash
#
# Deploy all smoke-test landing pages to Vercel as independent static sites.
# Each product gets its own Vercel project and production URL.
#
# Prerequisites:
#   - Vercel CLI installed (npm i -g vercel)
#   - Authenticated via `vercel login`
#
# Usage:
#   ./scripts/deploy-smoke-tests.sh

set -euo pipefail

SMOKE_DIR="$(cd "$(dirname "$0")/../smoke-tests" && pwd)"

PRODUCTS=(
  riskloop
  energyos
  capacityos
  outcomedb
  stick
  peopledb
  commitmentfilter
)

echo "============================================"
echo "  Deploying smoke-test landing pages"
echo "============================================"
echo ""

for product in "${PRODUCTS[@]}"; do
  dir="$SMOKE_DIR/$product"

  if [ ! -f "$dir/index.html" ]; then
    echo "[SKIP] $product - no index.html found"
    echo ""
    continue
  fi

  echo "[DEPLOY] $product"
  echo "  Directory: $dir"

  url=$(vercel --prod --yes "$dir" 2>&1 | tail -n 1)

  echo "  Live URL:  $url"
  echo ""
done

echo "============================================"
echo "  All deployments complete"
echo "============================================"
