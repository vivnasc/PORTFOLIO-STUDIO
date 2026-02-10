#!/bin/bash

PRODUCT_ID=$1
PRODUCT_NAME=$2
DOMAIN=$3

if [ -z "$PRODUCT_ID" ] || [ -z "$PRODUCT_NAME" ] || [ -z "$DOMAIN" ]; then
  echo "Usage: ./scripts/create-product.sh <product-id> <Product Name> <domain.com>"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
TEMPLATE_DIR="$ROOT_DIR/packages/core-template"
PRODUCT_DIR="$ROOT_DIR/products/$PRODUCT_ID"

if [ -d "$PRODUCT_DIR" ]; then
  echo "Error: Product directory already exists at $PRODUCT_DIR"
  exit 1
fi

echo "Creating $PRODUCT_NAME..."

# Copy template
cp -r "$TEMPLATE_DIR" "$PRODUCT_DIR"

# Update package.json
sed -i "s/@repo\/core-template/@repo\/$PRODUCT_ID/g" "$PRODUCT_DIR/package.json"

# Create product-specific directories
mkdir -p "$PRODUCT_DIR/app/features"
mkdir -p "$PRODUCT_DIR/app/api/$PRODUCT_ID"
mkdir -p "$PRODUCT_DIR/database/migrations"

# Create .env.local.example
cat > "$PRODUCT_DIR/.env.local.example" << EOF
NEXT_PUBLIC_PRODUCT_ID=$PRODUCT_ID
NEXT_PUBLIC_PRODUCT_NAME=$PRODUCT_NAME
NEXT_PUBLIC_DOMAIN=$DOMAIN

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_PAYPAL_CLIENT_ID=
PAYPAL_SECRET=

ANTHROPIC_API_KEY=
EOF

echo "Product created at products/$PRODUCT_ID"
echo "Next steps:"
echo "  1. Copy .env.local.example to .env.local and fill values"
echo "  2. Create Supabase project"
echo "  3. Run migrations: supabase db push"
echo "  4. Implement product features in app/features/"
