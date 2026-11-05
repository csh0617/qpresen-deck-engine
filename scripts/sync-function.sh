#!/usr/bin/env bash
# Copy engine sources into the edge function folder (Deno imports relative .ts files)
set -e
cd "$(dirname "$0")/.."
rm -rf supabase/functions/deck-engine/renderer supabase/functions/deck-engine/llm supabase/functions/deck-engine/knowledge supabase/functions/deck-engine/assets
mkdir -p supabase/functions/deck-engine/renderer supabase/functions/deck-engine/llm supabase/functions/deck-engine/knowledge supabase/functions/deck-engine/assets
cp engine/renderer/*.ts supabase/functions/deck-engine/renderer/
cp engine/llm/*.ts supabase/functions/deck-engine/llm/
cp engine/knowledge/*.ts supabase/functions/deck-engine/knowledge/
cp engine/assets/libs.ts supabase/functions/deck-engine/assets/
echo "synced $(ls supabase/functions/deck-engine/renderer | wc -l) renderer + $(ls supabase/functions/deck-engine/llm | wc -l) llm files"
