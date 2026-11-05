#!/usr/bin/env bash
# Release the engine for the Supabase Edge Function (remote-import deploy).
# 1) commit the engine, 2) pin index.remote.ts to that commit (immutable URLs → no stale bundler cache), 3) commit + push,
# 4) print the one-line entry to paste into the dashboard editor (Edge Functions → deck-engine → Code → Deploy updates).
set -euo pipefail
cd "$(dirname "$0")/.."
MSG="${1:-engine release}"
bash scripts/sync-function.sh >/dev/null 2>&1 || true
npx esbuild scripts/browser-entry.ts --bundle --format=iife --global-name=QE --platform=browser --target=es2022 --minify --outfile=dist/engine-browser.js >/dev/null 2>&1 || true
git add -A
git commit -qm "$MSG

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01UwR3NNbjEodVZ8nvknobCu" || true
SHA=$(git rev-parse HEAD)
node scripts/make-remote-index.js "https://raw.githubusercontent.com/csh0617/qpresen-deck-engine/${SHA}/engine" > supabase/functions/deck-engine/index.remote.ts
git add supabase/functions/deck-engine/index.remote.ts
git commit -qm "pin remote entry to ${SHA:0:7}

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01UwR3NNbjEodVZ8nvknobCu"
ENTRY=$(git rev-parse HEAD)
git push -q origin main
echo "release ${ENTRY:0:7} (engine ${SHA:0:7})"
echo "import 'https://raw.githubusercontent.com/csh0617/qpresen-deck-engine/${ENTRY}/supabase/functions/deck-engine/index.remote.ts';"
