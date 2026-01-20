#!/usr/bin/env bash

# EAS Build pre-install hook to enable Corepack and use pnpm
# This script runs before dependency installation

set -euo pipefail

echo "🔧 Enabling Corepack for pnpm support..."
corepack enable

echo "✅ Corepack enabled successfully"
echo "📦 pnpm version:"
pnpm --version
