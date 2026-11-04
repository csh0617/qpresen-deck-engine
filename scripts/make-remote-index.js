// Generates a single-file edge function entry that imports the engine from a remote base URL (e.g. jsDelivr @commit)
// usage: node scripts/make-remote-index.js https://cdn.jsdelivr.net/gh/csh0617/qpresen-deck-engine@<sha>/engine > supabase/functions/deck-engine/index.remote.ts
import { readFileSync } from 'node:fs';
const base = process.argv[2]; if (!base) { console.error('base url required'); process.exit(1); }
let s = readFileSync('supabase/functions/deck-engine/index.ts', 'utf8');
s = s.replace(/from '\.\/renderer\//g, `from '${base.replace(/\/$/, '')}/renderer/`).replace(/from '\.\/llm\//g, `from '${base.replace(/\/$/, '')}/llm/`);
process.stdout.write(s);
