// Prints the files array for the Supabase deploy (MCP deploy_edge_function or CLI)
import { readFileSync, readdirSync } from 'node:fs';
const base = 'supabase/functions/deck-engine';
const files = ['index.ts', ...readdirSync(base + '/renderer').map(f => 'renderer/' + f), ...readdirSync(base + '/llm').map(f => 'llm/' + f)];
const out = files.map(name => ({ name, content: readFileSync(`${base}/${name}`, 'utf8') }));
console.error(files.map(f => `${f} ${(readFileSync(`${base}/${f}`).length / 1024).toFixed(1)}KB`).join('\n'));
console.log(JSON.stringify(out));
