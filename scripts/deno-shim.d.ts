declare const Deno: { env: { get(k: string): string | undefined }; serve(h: (req: Request) => Promise<Response> | Response): void };
declare module 'jsr:@supabase/functions-js/edge-runtime.d.ts';
declare module 'https://esm.sh/@supabase/supabase-js@2.49.1' { export const createClient: any; }
declare module 'npm:qrcode-generator@1.4.4' { const q: any; export default q; }
declare module 'qrcode-generator' { const q: any; export default q; }
