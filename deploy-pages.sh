#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME="lw-sheepx-fun"
ACCOUNT_ID="93dff57608d56f07820e9e24be483bbf"
BRANCH="main"

export CLOUDFLARE_ACCOUNT_ID="$ACCOUNT_ID"

npm run -s build

wrangler pages project list >/dev/null 2>&1 || true
wrangler pages project create "$PROJECT_NAME" --production-branch "$BRANCH" >/dev/null 2>&1 || true

wrangler pages deploy "dist" \
  --project-name "$PROJECT_NAME" \
  --branch "$BRANCH" \
  --commit-hash "0000000000000000000000000000000000000000" \
  --commit-message "manual deploy" \
  --commit-dirty=true
