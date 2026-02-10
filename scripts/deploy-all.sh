#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

PRODUCTS=(
  "riskloop"
  "energyos"
  "capacityos"
  "outcomedb"
  "stick"
  "peopledb"
  "commitmentfilter"
)

FAILED=()

for product in "${PRODUCTS[@]}"; do
  PRODUCT_DIR="$ROOT_DIR/products/$product"

  if [ ! -d "$PRODUCT_DIR" ]; then
    echo "Skipping $product - directory not found"
    continue
  fi

  echo "Deploying $product to Vercel..."

  cd "$PRODUCT_DIR"

  npm run build
  if [ $? -ne 0 ]; then
    echo "Build failed for $product"
    FAILED+=("$product")
    cd "$ROOT_DIR"
    continue
  fi

  vercel --prod --yes
  if [ $? -ne 0 ]; then
    echo "Deploy failed for $product"
    FAILED+=("$product")
  else
    echo "$product deployed"
  fi

  cd "$ROOT_DIR"
done

echo ""
echo "Deployment complete."

if [ ${#FAILED[@]} -gt 0 ]; then
  echo "Failed: ${FAILED[*]}"
  exit 1
else
  echo "All products deployed successfully."
fi
