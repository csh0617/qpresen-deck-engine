/* Qpresen Deck Engine — base stylesheet (inlined into every slide). Theme tokens come from theme.ts */
export const BASE_CSS = `
*,*::before,*::after{box-sizing:border-box}
html,body{margin:0;padding:0;height:100%}
body{background:var(--bg-2);color:var(--text);font-family:var(--font);font-size:22px;line-height:1.45;-webkit-font-smoothing:antialiased;overflow:hidden;word-break:keep-all;overflow-wrap:anywhere;font-feature-settings:'tnum' 1,'ss05' 1}
h1,h2,h3,h4,p,ul,ol,figure{margin:0}ul,ol{padding:0;list-style:none}
strong,b{font-weight:700;color:var(--ink)}em{font-style:normal}
img,svg{display:block;max-width:100%}
svg.ic{width:1em;height:1em;display:inline-block;vertical-align:-.15em;flex:none}
a{color:inherit}

/* ---- stage ---- */
.stage{position:absolute;left:50%;top:50%;width:var(--stage-w);height:var(--stage-h);transform:translate(-50%,-50%) scale(var(--s,1));transform-origin:center center;background:var(--bg);color:var(--text);overflow:hidden;padding:104px 96px 100px;display:flex;flex-direction:column;box-shadow:0 0 0 1px var(--line)}
.stage::before{content:'';position:absolute;inset:0;pointer-events:none;z-index:0;background:radial-gradient(820px 520px at 104% -8%,color-mix(in srgb,var(--f) 9%,transparent) 0%,transparent 62%),radial-gradient(760px 520px at -6% 108%,color-mix(in srgb,var(--brand) 7%,transparent) 0%,transparent 62%)}
.stage>*{position:relative;z-index:1}
.stage.dark,.stage.dark .card{color:#DCE3F2}
.stage.dark{background:#0B1020;--bg:#0B1020;--ink:#F4F6FC;--text:#DCE3F2;--muted:#9DACC6;--faint:#6C7B98;--line:#1E2A47;--line-2:#2C3B62;--card:#111A33;--card-2:#15213F;--card-3:#1B2A4C;--brand-100:#20286A;--brand-50:#181F4E}
.amb{position:absolute;inset:0;pointer-events:none;z-index:0;overflow:hidden}
.amb canvas{position:absolute;inset:0;width:100%;height:100%}
.orb{position:absolute;border-radius:50%;filter:blur(60px);opacity:.5;animation:orbdrift 18s ease-in-out infinite alternate}
.orb.a{width:560px;height:560px;right:-160px;top:-180px;background:radial-gradient(circle,color-mix(in srgb,var(--violet) 26%,transparent),transparent 70%)}
.orb.b{width:620px;height:620px;left:-240px;bottom:-280px;background:radial-gradient(circle,color-mix(in srgb,var(--azure) 22%,transparent),transparent 70%);animation-delay:-7s}
@keyframes orbdrift{0%{translate:0 0;scale:1}100%{translate:-40px 30px;scale:1.08}}

/* ---- top bar ---- */
.topbar{position:absolute!important;left:96px;right:96px;top:38px;height:36px;display:flex;align-items:center;justify-content:space-between;z-index:6;font-size:14px;font-weight:700;letter-spacing:.18em;color:var(--muted);text-transform:uppercase}
.topbar .lg{display:flex;align-items:center;gap:10px;letter-spacing:.02em;text-transform:none;font-size:16px;color:var(--muted)}
.topbar .lg i{width:12px;height:12px;border-radius:4px;background:var(--qg);display:inline-block}
.topbar .lg img{height:30px;width:auto}
.topbar .rt{display:flex;align-items:center;gap:14px}
.topbar .rt b{color:var(--ink);letter-spacing:.12em}.topbar .rt i{width:28px;height:1px;background:var(--line-2);display:inline-block}

/* ---- header ---- */
.head{display:flex;flex-direction:column;gap:12px;margin-bottom:34px}
.head .eyebrow{font-size:16px;font-weight:800;letter-spacing:.18em;color:var(--f-ink);text-transform:uppercase;display:flex;align-items:center;gap:14px}
.head .eyebrow .no{display:inline-grid;place-items:center;height:28px;min-width:44px;padding:0 10px;border-radius:999px;background:var(--f-ink);color:#fff;font-size:14px;letter-spacing:.06em}
.head .eyebrow .ln{width:56px;height:2px;border-radius:2px;background:var(--f);opacity:.45}
.head h1{font-size:58px;line-height:1.16;letter-spacing:-.03em;font-weight:800;color:var(--ink);max-width:1560px}
.head h1 em{color:var(--f-ink)}
.gtext,.theme-grad .head h1 em{background:var(--qg);-webkit-background-clip:text;background-clip:text;color:transparent}
.head .sub{font-size:24px;color:var(--muted);font-weight:500;letter-spacing:-.01em;line-height:1.5;max-width:1500px}
.head.compact{gap:8px;margin-bottom:26px}.head.compact h1{font-size:46px}.head.compact .sub{font-size:21px}
.body{flex:1;min-height:0;display:flex;flex-direction:column}

/* ---- footer / nav / source ---- */
.deck-foot{position:absolute;left:96px;right:96px;bottom:34px;display:flex;justify-content:space-between;align-items:center;font-size:15px;color:var(--muted);pointer-events:none;z-index:5}
.deck-foot .brand{display:flex;align-items:center;gap:12px;font-weight:700;letter-spacing:.02em;white-space:nowrap}
.deck-foot .brand i{width:10px;height:10px;border-radius:3px;background:var(--qg);display:inline-block}
.deck-foot .prog{flex:1;margin:0 34px;height:3px;border-radius:3px;background:var(--line);overflow:hidden;position:relative}
.deck-foot .prog i{position:absolute;left:0;top:0;bottom:0;border-radius:3px;background:var(--qg);width:var(--p,0%);transition:width 1.2s var(--ease)}
.deck-foot .pg{font-variant-numeric:tabular-nums;font-weight:600;white-space:nowrap}.deck-foot .pg b{color:var(--ink);font-size:19px}
.source{position:absolute;right:96px;bottom:62px;font-size:15px;color:var(--muted);pointer-events:none;max-width:1300px;text-align:right;z-index:5}
.source::before{content:'※ '}
.deck-nav{position:fixed;right:12px;top:50%;translate:0 -50%;display:flex;flex-direction:column;gap:6px;z-index:50;opacity:.22;transition:opacity .3s}
.deck-nav:hover{opacity:1}
.deck-nav a{width:38px;height:38px;border-radius:10px;background:var(--card);border:1px solid var(--line-2);color:var(--ink);display:grid;place-items:center;text-decoration:none;font-size:18px;box-shadow:var(--shadow)}
.deck-nav a.dis{opacity:.35;pointer-events:none}
html.static .deck-nav{display:none}
.wm{position:absolute;right:26px;bottom:18px;width:120px;height:120px;color:var(--f);opacity:.08;pointer-events:none}.wm .ic{width:100%;height:100%}

/* ---- field color scopes ---- */
.stage{--f-ink:var(--brand-ink)}
.f-brand{--f:var(--brand);--f-100:var(--brand-100);--f-50:var(--brand-50);--f-ink:var(--brand-ink)}
.f-azure{--f:var(--azure);--f-100:var(--azure-100);--f-50:var(--azure-50);--f-ink:var(--azure-ink)}
.f-violet{--f:var(--violet);--f-100:var(--violet-100);--f-50:var(--violet-50);--f-ink:var(--violet-ink)}
.f-teal{--f:var(--teal);--f-100:var(--teal-100);--f-50:var(--teal-50);--f-ink:var(--teal-ink)}
.f-amber{--f:var(--amber);--f-100:var(--amber-100);--f-50:var(--amber-50);--f-ink:var(--amber-ink)}
.f-rose{--f:var(--rose);--f-100:var(--rose-100);--f-50:var(--rose-50);--f-ink:var(--rose-ink)}
.f-navy{--f:var(--navy);--f-100:var(--navy-100);--f-50:var(--navy-50);--f-ink:var(--navy-ink)}
.f-ok{--f:var(--ok);--f-100:var(--ok-100);--f-50:var(--ok-50);--f-ink:var(--ok-ink)}
.f-danger{--f:var(--danger);--f-100:var(--danger-100);--f-50:var(--danger-50);--f-ink:var(--danger-ink)}
.stage.dark,.stage.dark [class*=f-]{--f-ink:color-mix(in srgb,var(--f) 80%,#fff)}

/* ---- surfaces ---- */
.card{background:var(--card);border:1px solid var(--line);border-radius:var(--r);box-shadow:var(--shadow);padding:28px 30px;min-height:0;position:relative}
.card.tint{background:var(--f-50);border-color:color-mix(in srgb,var(--f) 22%,var(--line))}
.card.solid{background:var(--f-ink);color:#fff;border-color:transparent}
.card.solid strong,.card.solid b,.card.solid h3,.card.solid .k-title,.card.solid .kpi .v{color:#fff}.card.solid .k-body,.card.solid .kpi .l,.card.solid .k-small{color:rgba(255,255,255,.82)}
.card.flat{box-shadow:none;background:var(--card-2)}
.card.glass{background:color-mix(in srgb,var(--card) 76%,transparent);backdrop-filter:blur(18px) saturate(150%);-webkit-backdrop-filter:blur(18px) saturate(150%);border:1px solid color-mix(in srgb,#fff 70%,var(--line));box-shadow:var(--shadow-lg),inset 0 1px 0 rgba(255,255,255,.8)}
.card.edge{overflow:hidden}.card.edge::before{content:'';position:absolute;left:0;top:0;right:0;height:5px;background:var(--f)}
.card.dark{background:#0B1230;border-color:#1C2550;color:#C9D3EE}.card.dark b,.card.dark strong,.card.dark h3,.card.dark .k-title{color:#fff}.card.dark .k-body,.card.dark .k-small{color:#B6C2E2}
.card.lift{transition:translate .45s var(--ease),box-shadow .45s var(--ease),border-color .45s}.card.lift:hover{translate:0 -6px;box-shadow:var(--shadow-lg);border-color:color-mix(in srgb,var(--f) 40%,var(--line))}
.gborder{position:relative;border-radius:var(--r);background:var(--card)}
.gborder::after{content:'';position:absolute;inset:0;border-radius:inherit;padding:1.5px;background:var(--qg);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}
.hair{height:1px;background:var(--line)}.gline{height:2px;border-radius:2px;background:var(--qg)}.divider{height:1px;background:var(--line);margin:14px 0}

/* ---- typography helpers ---- */
.k-eyebrow{font-size:15px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:var(--f-ink)}
.k-title{font-size:27px;font-weight:800;color:var(--ink);letter-spacing:-.02em;line-height:1.25}
.k-body{font-size:20px;line-height:1.55;color:var(--text)}
.k-small{font-size:16px;line-height:1.5;color:var(--muted)}
.mega{font-size:120px;font-weight:800;letter-spacing:-.05em;line-height:.95;font-variant-numeric:tabular-nums;color:var(--ink)}
.big{font-size:64px;font-weight:800;letter-spacing:-.04em;line-height:1;font-variant-numeric:tabular-nums;color:var(--ink)}
.big small,.mega small{font-size:.38em;font-weight:700;letter-spacing:-.01em;margin-left:4px;color:var(--f)}
.num-g{background:var(--qg);-webkit-background-clip:text;background-clip:text;color:transparent}

/* ---- atoms ---- */
.num{width:44px;height:44px;border-radius:50%;background:var(--f-ink);color:#fff;display:grid;place-items:center;font-weight:800;font-size:19px;flex:none;letter-spacing:.02em}
.num.lg{width:56px;height:56px;font-size:24px}.num.sq{border-radius:12px}
.icon-circle{width:56px;height:56px;border-radius:50%;background:var(--f-100);color:var(--f);display:grid;place-items:center;flex:none}
.icon-circle .ic{width:28px;height:28px}.icon-circle.solid{background:var(--f-ink);color:#fff}.icon-circle.lg{width:72px;height:72px}.icon-circle.lg .ic{width:36px;height:36px}
.ic-sq{width:52px;height:52px;border-radius:15px;background:var(--f-100);color:var(--f);display:grid;place-items:center;flex:none}.ic-sq .ic{width:26px;height:26px}.ic-sq.lg{width:64px;height:64px;border-radius:18px}.ic-sq.lg .ic{width:32px;height:32px}.ic-sq.solid{background:var(--f-ink);color:#fff}
.chip,.pill{display:inline-flex;align-items:center;gap:7px;padding:6px 14px;border-radius:999px;background:var(--f-100);color:var(--f-ink);font-size:16px;font-weight:700;line-height:1.3;white-space:nowrap}
.chip.solid,.pill.solid{background:var(--f-ink);color:#fff}.chip.o,.pill.o{background:transparent;border:1.5px solid color-mix(in srgb,var(--f) 60%,transparent);color:var(--f)}.chip.gray,.pill.gray{background:var(--card-3);color:var(--muted)}
.tag{display:inline-block;padding:3px 10px;border-radius:7px;background:var(--card-3);color:var(--muted);font-size:15px;font-weight:700}
.label{font-size:17px;font-weight:700;color:var(--f-ink);letter-spacing:.02em}
.kpi{display:flex;flex-direction:column;gap:6px}
.kpi .v{font-size:56px;font-weight:800;color:var(--ink);letter-spacing:-.035em;line-height:1.05;font-variant-numeric:tabular-nums;display:flex;align-items:baseline;gap:4px;flex-wrap:wrap}
.kpi .v small{font-size:24px;font-weight:700;color:var(--f-ink);letter-spacing:-.01em}
.kpi .v .pre{font-size:28px;font-weight:700;color:var(--muted)}
.kpi .l{font-size:18px;color:var(--ink);font-weight:700;margin-top:6px}.kpi .s{font-size:16px;color:var(--muted);line-height:1.45}
.delta{display:inline-flex;align-items:center;gap:4px;font-size:15px;font-weight:800;padding:3px 9px;border-radius:999px}
.delta.up{background:var(--ok-100);color:color-mix(in srgb,var(--ok) 70%,var(--ink))}.delta.down{background:var(--danger-100);color:color-mix(in srgb,var(--danger) 80%,var(--ink))}.delta.flat{background:var(--card-3);color:var(--muted)}
.bullets{display:flex;flex-direction:column;gap:12px}
.bullets li{position:relative;padding-left:24px;font-size:21px;line-height:1.5}
.bullets li::before{content:'';position:absolute;left:2px;top:.62em;width:9px;height:9px;border-radius:50%;background:var(--f)}
.bullets.dash li::before{width:10px;height:2px;border-radius:1px;top:.75em}.bullets.sm li{font-size:18px}.bullets.check li{padding-left:34px}.bullets.check li::before{width:22px;height:22px;top:.3em;left:0;border-radius:7px;background:var(--f-100);background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6 9 17l-5-5'/%3E%3C/svg%3E");background-size:14px;background-position:center;background-repeat:no-repeat;background-color:var(--f)}
.bar{height:10px;border-radius:999px;background:var(--card-3);overflow:hidden}.bar>i{display:block;height:100%;border-radius:999px;background:var(--f);width:var(--w,0%);transition:width 1.2s var(--ease)}
.grid{display:grid;gap:24px;min-height:0}.grid-2{grid-template-columns:repeat(2,minmax(0,1fr))}.grid-3{grid-template-columns:repeat(3,minmax(0,1fr))}.grid-4{grid-template-columns:repeat(4,minmax(0,1fr))}.grid-5{grid-template-columns:repeat(5,minmax(0,1fr))}.grid-6{grid-template-columns:repeat(6,minmax(0,1fr))}
.tbl{width:100%;border-collapse:separate;border-spacing:0;font-size:18px}
.tbl th{background:var(--card-3);color:var(--ink);font-weight:800;padding:14px 16px;text-align:left;border-bottom:1px solid var(--line-2);white-space:nowrap}
.tbl td{padding:13px 16px;border-bottom:1px solid var(--line);vertical-align:middle;line-height:1.4}
.tbl tr:last-child td{border-bottom:none}.tbl .r{text-align:right;font-variant-numeric:tabular-nums}.tbl .c{text-align:center}
.tbl tr.hl td{background:var(--f-50);font-weight:700;color:var(--ink)}.tbl td.hl,.tbl th.hl{background:var(--f-50);color:var(--ink);font-weight:700}
.tbl.lg{font-size:20px}.tbl.lg th{padding:16px 18px}.tbl.lg td{padding:16px 18px}
.tbl.dense{font-size:16px}.tbl.dense th{padding:10px 12px}.tbl.dense td{padding:9px 12px}
.tbl tbody tr:first-child td{border-top:none}
.callout{display:flex;align-items:center;gap:18px;padding:20px 28px;border-radius:var(--r-sm);background:var(--f-50);border:1px solid color-mix(in srgb,var(--f) 25%,var(--line));font-size:21px;color:var(--ink);line-height:1.5}
.callout .ic-sq{width:46px;height:46px;border-radius:13px}.callout b{color:var(--f-ink)}
.band{border-radius:18px;padding:20px 28px;display:flex;align-items:center;gap:18px;font-size:21px;font-weight:600;line-height:1.5;background:linear-gradient(90deg,var(--f-50),color-mix(in srgb,var(--f-50) 40%,var(--card)));border:1px solid color-mix(in srgb,var(--f) 28%,var(--line))}
.band b{color:var(--ink)}
.meta-bar{display:flex;align-items:center;gap:36px;padding:14px 26px;border-radius:var(--r-sm);border:1px solid color-mix(in srgb,var(--f) 30%,var(--line));background:var(--f-50);font-size:19px}
.meta-bar b{color:var(--f);margin-right:10px;font-weight:800}
.note{font-size:16px;color:var(--faint)}
.avatar{width:64px;height:64px;border-radius:50%;background:var(--qg);color:#fff;display:grid;place-items:center;font-weight:800;font-size:26px;flex:none}
.img{border-radius:var(--r);overflow:hidden;background:var(--card-3);position:relative;box-shadow:var(--shadow)}
.img img{width:100%;height:100%;object-fit:cover}
.img .cap{position:absolute;left:0;right:0;bottom:0;padding:14px 18px;font-size:15px;color:#fff;background:linear-gradient(transparent,rgba(5,10,30,.72));line-height:1.4}
.art{position:relative;overflow:hidden;background:var(--card-3)}
.art svg{width:100%;height:100%;display:block}
.art .lab{position:absolute;left:18px;bottom:16px;font-size:15px;font-weight:700;color:#fff;background:rgba(5,10,30,.45);padding:6px 12px;border-radius:999px;backdrop-filter:blur(6px)}
.qr{display:flex;flex-direction:column;align-items:center;gap:10px}
.qr svg{width:148px;height:148px;background:#fff;padding:8px;border-radius:14px;border:1px solid var(--line)}
.qr span{font-size:15px;font-weight:700;color:var(--muted)}

/* ---- reveal system ---- */
html.js [data-reveal]{opacity:0;translate:0 26px;filter:blur(6px);transition:opacity .85s var(--ease),translate .85s var(--ease),scale .85s var(--ease),filter .85s var(--ease);transition-delay:var(--d,0ms)}
html.js [data-reveal=left]{translate:-30px 0}html.js [data-reveal=right]{translate:30px 0}html.js [data-reveal=scale],html.js [data-reveal=zoom]{translate:0 0;scale:.9}html.js [data-reveal=fade]{translate:0 0}html.js [data-reveal=up]{translate:0 40px}
html.js [data-reveal].in,html.js.reveal-done [data-reveal]{opacity:1;translate:0 0;scale:1;filter:none}
html.js:not(.static) [data-bar]:not(.in)>i{width:0}
html.js:not(.static) [data-draw]{stroke-dasharray:var(--len);stroke-dashoffset:var(--len);transition:stroke-dashoffset 1.3s var(--ease);transition-delay:var(--d,0ms)}
html.js [data-draw].in,html.js.reveal-done [data-draw]{stroke-dashoffset:0}
html.js:not(.static) [data-grow]{transform:scaleY(0);transform-origin:bottom;transition:transform 1.1s var(--ease);transition-delay:var(--d,0ms)}
html.js:not(.static) [data-grow=x]{transform:scaleX(0);transform-origin:left}
html.js [data-grow].in,html.js.reveal-done [data-grow]{transform:none}
html.static *,html.static *::before,html.static *::after{transition:none!important;animation:none!important}
html.static [data-reveal]{opacity:1!important;translate:0 0!important;scale:1!important;filter:none!important}
html.static [data-draw]{stroke-dashoffset:0!important}html.static [data-grow]{transform:none!important}
@keyframes floaty{0%,100%{translate:0 0}50%{translate:0 -10px}}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--f) 45%,transparent)}70%{box-shadow:0 0 0 14px transparent}}
@keyframes spin{to{rotate:360deg}}
@keyframes dashflow{to{stroke-dashoffset:-48}}
@keyframes ping{0%{transform:scale(.6);opacity:.7}100%{transform:scale(2.2);opacity:0}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.25}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes rise{0%{translate:0 0}50%{translate:0 -12px}100%{translate:0 0}}
.float{animation:floaty 5s ease-in-out infinite}.pulse{animation:pulse 2.2s ease-out infinite}.spin-slow{animation:spin 24s linear infinite;transform-origin:center}
.flowline{stroke-dasharray:6 10;animation:dashflow 1.6s linear infinite}
html.static .flowline,html.static .float,html.static .pulse,html.static .spin-slow{animation:none}
.caret::after{content:'';display:inline-block;width:2px;height:1em;background:currentColor;margin-left:3px;vertical-align:-.15em;animation:blink 1s steps(1) infinite}
[data-cycle]>[data-step]{transition:opacity .5s var(--ease),translate .5s var(--ease),box-shadow .5s,border-color .5s}
[data-cycle]>[data-step]:not(.on){opacity:.55}
[data-cycle]>[data-step].on{opacity:1;box-shadow:var(--shadow-lg);border-color:color-mix(in srgb,var(--f) 45%,var(--line))}

/* =====================================================================
   ARCHETYPE LAYOUTS
   ===================================================================== */
/* cover */
.a-cover{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:64px;align-items:center;height:100%}
.a-cover .hero .kicker{display:inline-flex;align-items:center;gap:10px;font-size:19px;font-weight:700;color:var(--f-ink);margin-bottom:26px}
.a-cover .hero .kicker::before{content:'';width:10px;height:10px;border-radius:3px;background:var(--f)}
.a-cover .hero h1{font-size:86px;line-height:1.08;letter-spacing:-.045em;font-weight:800;color:var(--ink);margin:0 0 28px}
.a-cover .hero h1 em{color:var(--f)}
.a-cover .hero .tagline{font-size:26px;line-height:1.55;color:var(--muted);max-width:820px;margin-bottom:34px}
.a-cover .meta{display:flex;flex-wrap:wrap;gap:12px 32px;font-size:19px;color:var(--text);margin-bottom:26px}
.a-cover .meta span{display:inline-flex;align-items:center;gap:9px}.a-cover .meta .ic{color:var(--f);width:22px;height:22px}.a-cover .meta b{color:var(--ink)}
.a-cover .tags{display:flex;flex-wrap:wrap;gap:10px}
.a-cover .side{display:flex;flex-direction:column;gap:22px;align-items:stretch;min-width:0}
.a-cover .side .img,.a-cover .side .art{aspect-ratio:4/3;width:100%;border-radius:28px;box-shadow:var(--shadow-xl)}
.a-cover .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.a-cover .stats .card{padding:22px 24px}.a-cover .stats .v{font-size:40px;font-weight:800;color:var(--ink);letter-spacing:-.03em;line-height:1}.a-cover .stats .v small{font-size:18px;color:var(--f);margin-left:3px}.a-cover .stats .l{font-size:15px;color:var(--muted);margin-top:8px}
.a-cover .agenda{display:flex;gap:10px;flex-wrap:wrap;margin-top:34px}
.a-cover .agenda .st{display:inline-flex;align-items:center;gap:10px;padding:10px 16px;border-radius:12px;background:var(--card);border:1px solid var(--line);font-size:16px;font-weight:700;color:var(--text);box-shadow:var(--shadow)}
.a-cover .agenda .st b{color:var(--f-ink);font-size:14px}
.a-cover .speaker{position:absolute;right:0;top:-40px;display:flex;align-items:center;gap:14px;padding:10px 14px 10px 18px;border-radius:999px;background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow)}
.a-cover .speaker .n{font-size:17px;font-weight:800;color:var(--ink);line-height:1.2}.a-cover .speaker .n small{display:block;font-size:13px;font-weight:600;color:var(--muted);margin-top:3px}
.a-cover .speaker .avatar{width:46px;height:46px;font-size:19px}
.a-cover.solo{grid-template-columns:1fr}.a-cover.solo .hero h1{font-size:96px;max-width:1500px}
.stage.a-cover-photo{padding:0}.stage.a-cover-photo .ph{position:absolute;inset:0;z-index:0}.stage.a-cover-photo .ph img,.stage.a-cover-photo .ph .art{width:100%;height:100%;object-fit:cover}
.stage.a-cover-photo .ph::after{content:'';position:absolute;inset:0;background:linear-gradient(100deg,rgba(5,10,30,.86) 0%,rgba(5,10,30,.62) 50%,rgba(5,10,30,.25) 100%)}
.stage.a-cover-photo .a-cover{padding:104px 96px 100px;color:#fff;--ink:#fff;--text:#E6ECF8;--muted:#C8D2E6;--f-ink:color-mix(in srgb,var(--f) 70%,#fff)}.stage.a-cover-photo .a-cover [class*=f-]{--f-ink:color-mix(in srgb,var(--f) 70%,#fff)}
.stage.a-cover-photo .a-cover .tagline,.stage.a-cover-photo .a-cover .meta{color:#DCE4F2}.stage.a-cover-photo .a-cover .meta b{color:#fff}
.stage.a-cover-photo .chip{background:rgba(255,255,255,.14);color:#fff;border:1px solid rgba(255,255,255,.2)}
.stage.a-cover-photo .agenda .st{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.18);color:#fff}.stage.a-cover-photo .agenda .st b{color:#fff}
.stage.a-cover-photo .speaker{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.2)}.stage.a-cover-photo .speaker .n,.stage.a-cover-photo .speaker .n small{color:#fff}
.stage.a-cover-photo .deck-foot{color:rgba(255,255,255,.7)}.stage.a-cover-photo .deck-foot .pg b{color:#fff}.stage.a-cover-photo .deck-foot .prog{background:rgba(255,255,255,.2)}

/* section divider */
.a-section{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:60px;align-items:center;height:100%}
.a-section .numeral{font-size:260px;font-weight:800;letter-spacing:-.06em;line-height:.9;color:var(--f);opacity:.14}
.a-section .lab{font-size:20px;font-weight:800;letter-spacing:.2em;color:var(--f-ink);text-transform:uppercase;margin:-30px 0 18px}
.a-section h2{font-size:84px;font-weight:800;letter-spacing:-.04em;line-height:1.08;color:var(--ink)}
.a-section h2 em{color:var(--f-ink)}
.a-section .bul{display:flex;flex-direction:column;gap:20px}
.a-section .bul li{display:flex;align-items:flex-start;gap:18px;font-size:27px;line-height:1.45;color:var(--text);padding:24px 28px;border-radius:16px;background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow)}
.a-section .bul li .num{width:40px;height:40px;font-size:17px;margin-top:3px}
.stage.dark .a-section .bul li{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
.a-section .img,.a-section .art{aspect-ratio:4/3;width:100%;border-radius:28px}

/* agenda */
.a-agenda{display:grid;grid-template-columns:repeat(var(--cols,3),minmax(0,1fr));grid-auto-rows:1fr;gap:24px;align-content:stretch;height:100%}
.a-agenda .it{display:flex;gap:20px;align-items:flex-start;padding:30px 32px;background:var(--card);border:1px solid var(--line);border-radius:var(--r);box-shadow:var(--shadow);min-height:150px}
.a-agenda .it .num{width:52px;height:52px;font-size:20px;border-radius:14px}
.a-agenda .it h3{font-size:28px;font-weight:800;color:var(--ink);line-height:1.3;margin-bottom:10px;letter-spacing:-.015em}
.a-agenda .it p{font-size:19px;color:var(--muted);line-height:1.55}
.a-agenda .it .m{margin-top:14px;display:inline-flex;gap:8px;align-items:center;font-size:15px;font-weight:700;color:var(--f-ink);letter-spacing:.04em}
.a-agenda.rail{display:flex;flex-direction:column;gap:16px;justify-content:center}
.a-agenda.rail .it{min-height:0;padding:22px 34px;align-items:center;gap:28px}
.a-agenda.rail .it .rn{font-size:54px;font-weight:800;letter-spacing:-.04em;line-height:1;color:var(--f);opacity:.55;min-width:84px;text-align:center}
.a-agenda.rail .it>div{flex:1}.a-agenda.rail .it h3{margin:0 0 4px;font-size:30px}.a-agenda.rail .it p{font-size:19px}
.a-agenda.rail .it .m{margin:0;flex:none;font-size:16px;padding:10px 16px;border-radius:999px;background:var(--f-50);border:1px solid color-mix(in srgb,var(--f) 22%,var(--line))}

/* question */
.a-question{position:relative;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:72px;align-items:center;height:100%}
.a-question .q{font-size:84px;font-weight:800;letter-spacing:-.045em;line-height:1.12;color:var(--ink)}
.a-question .q em{color:var(--f-ink)}
.a-question .hint{font-size:26px;color:var(--muted);margin-top:30px;line-height:1.5;max-width:760px}
.a-question .opts{display:grid;grid-template-columns:1fr 1fr;gap:18px;position:relative;z-index:1}
.a-question .opts.n3,.a-question .opts.n5{grid-template-columns:1fr}
.a-question .opts li{display:flex;align-items:center;gap:20px;padding:30px 30px;min-height:170px;border-radius:22px;background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow);font-size:26px;font-weight:700;color:var(--ink);line-height:1.35}
.a-question .opts.n3 li,.a-question .opts.n5 li{min-height:0;padding:24px 30px}
.a-question .opts li .num{width:52px;height:52px;font-size:21px;border-radius:16px;background:var(--f-100);color:var(--f-ink)}
.a-question .qmark{font-size:460px;font-weight:800;color:var(--f);opacity:.07;line-height:1;position:absolute;right:0;top:-70px;pointer-events:none;z-index:0;user-select:none}
.a-question.solo .qmark{right:60px}

/* kpi grid */
.a-kpi{display:flex;flex-direction:column;gap:24px;height:100%}
.a-kpi .grid{flex:1;align-content:stretch}
.a-kpi .card{display:flex;flex-direction:column;justify-content:space-between;gap:18px;padding:30px 32px}
.a-kpi .card .top{display:flex;align-items:center;justify-content:space-between;gap:12px}
.a-kpi .card .top .ic-sq{width:48px;height:48px;border-radius:14px}
.a-kpi .card .bar{margin-top:6px}
.a-kpi .foot{font-size:20px;color:var(--text);padding:18px 26px;border-radius:16px;background:var(--f-50);border:1px solid color-mix(in srgb,var(--f) 22%,var(--line));display:flex;gap:14px;align-items:center}
.a-kpi .foot b{color:var(--f-ink)}
.grid-5 .kpi .v,.grid-6 .kpi .v{font-size:44px}

/* big number */
.a-bignum{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr);gap:64px;align-items:center;height:100%}
.a-bignum .n{font-size:220px;font-weight:800;letter-spacing:-.06em;line-height:.9;color:var(--ink);font-variant-numeric:tabular-nums;display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
.a-bignum .n small{font-size:72px;color:var(--f-ink);font-weight:800;letter-spacing:-.02em}
.a-bignum .n .pre{font-size:80px;color:var(--muted);font-weight:700}
.a-bignum .lab{font-size:34px;font-weight:800;color:var(--ink);margin-top:26px;letter-spacing:-.02em}
.a-bignum .ctx{font-size:24px;color:var(--muted);line-height:1.6;margin-top:18px;max-width:900px}
.a-bignum.solo{grid-template-columns:1fr;text-align:center;justify-items:center}
.a-bignum.solo .n{font-size:300px;justify-content:center;background:var(--qg);-webkit-background-clip:text;background-clip:text;color:transparent;padding:0 .04em}
.a-bignum.solo .n small{font-size:84px;color:var(--f-ink);-webkit-text-fill-color:var(--f-ink)}
.a-bignum.solo .n .pre{-webkit-text-fill-color:var(--muted)}
.a-bignum.solo .lab{font-size:38px;margin-top:30px}
.a-bignum.solo .ctx{font-size:25px;max-width:1100px;margin:18px auto 0;padding:22px 34px;border-radius:18px;background:var(--card-2);border:1px solid var(--line)}
.a-bignum .cmp{display:flex;flex-direction:column;gap:14px}
.a-bignum .cmp li{display:flex;justify-content:space-between;align-items:center;gap:18px;padding:22px 28px;border-radius:18px;background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow)}
.a-bignum .cmp li span{font-size:19px;color:var(--muted);font-weight:600}.a-bignum .cmp li b{font-size:32px;color:var(--ink);letter-spacing:-.03em;font-variant-numeric:tabular-nums}

/* bullets + visual */
.a-bv{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:48px;align-items:stretch;height:100%;min-height:0}
.a-bv.v-left{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.a-bv.v-left .vis{order:-1}
.a-bv .list{display:flex;flex-direction:column;gap:16px;justify-content:center;min-width:0}
.a-bv .list li{display:flex;gap:18px;align-items:flex-start;padding:20px 24px;border-radius:18px;background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow)}
.a-bv .list li .ic-sq{margin-top:2px}
.a-bv .list li h3{font-size:24px;font-weight:800;color:var(--ink);line-height:1.3}
.a-bv .list li p{font-size:19px;color:var(--muted);line-height:1.5;margin-top:6px}
.a-bv .vis{min-width:0;min-height:0;display:flex;flex-direction:column;justify-content:center}
.a-bv .vis .img,.a-bv .vis .art{width:100%;height:100%;max-height:100%;border-radius:26px;aspect-ratio:auto}
.a-bv .vis .img img{height:100%}
.a-bv .vis .stat{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;height:100%;border-radius:26px;background:var(--f-50);border:1px solid color-mix(in srgb,var(--f) 25%,var(--line));text-align:center;padding:40px}
.a-bv .vis .stat .v{font-size:150px;font-weight:800;letter-spacing:-.06em;line-height:.95;color:var(--ink)}.a-bv .vis .stat .v small{font-size:48px;color:var(--f-ink);margin-left:4px}
.a-bv .vis .stat .l{font-size:26px;font-weight:800;color:var(--ink)}.a-bv .vis .stat .s{font-size:19px;color:var(--muted)}
.a-bv .vis .icons{display:grid;grid-template-columns:repeat(2,1fr);grid-auto-rows:1fr;gap:20px;align-content:stretch;height:100%}
.a-bv .vis .icons div{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:28px 18px;border-radius:22px;background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow);font-size:22px;font-weight:700;color:var(--ink);text-align:center}
.a-bv .vis .icons .ic-sq.lg{width:84px;height:84px;border-radius:24px}.a-bv .vis .icons .ic-sq.lg .ic{width:42px;height:42px}
.a-bv .callout{margin-top:18px}
.a-bv .vis .svgbox{height:100%;display:flex;align-items:center;justify-content:center;border-radius:26px;background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow);padding:30px;overflow:hidden}
.a-bv .vis .svgbox svg{max-height:100%;width:100%;height:100%}
.a-bv .vis figcaption{font-size:15px;color:var(--faint);margin-top:10px;text-align:center}

/* cards */
.a-cards{display:flex;flex-direction:column;gap:22px;height:100%}
.a-cards .grid{flex:1;align-content:center;grid-auto-rows:minmax(0,auto)}
.a-cards .card{display:flex;flex-direction:column;gap:18px;padding:38px 38px 40px;min-height:340px;max-height:100%}
.a-cards .card .tp{display:flex;align-items:center;justify-content:space-between;gap:12px}
.a-cards .card h3{font-size:30px;font-weight:800;color:var(--ink);line-height:1.3;letter-spacing:-.015em}
.a-cards .card p{font-size:21px;color:var(--muted);line-height:1.55}
.a-cards .card .pts{display:flex;flex-direction:column;gap:11px;margin-top:6px}
.a-cards .card .pts li{position:relative;padding-left:20px;font-size:20px;color:var(--text);line-height:1.45}
.a-cards .grid-2 .card,.a-cards .grid-3 .card{min-height:420px}
.a-cards .grid-2 .card h3{font-size:34px}.a-cards .grid-2 .card p{font-size:23px}.a-cards .grid-2 .card .pts li{font-size:22px}
.a-cards .grid-3 .card .ic-sq{width:60px;height:60px}.a-cards .grid-3 .card .ic-sq .ic{width:30px;height:30px}
.a-cards .card .pts li::before{content:'';position:absolute;left:0;top:.62em;width:7px;height:7px;border-radius:50%;background:var(--f)}
.a-cards .card .val{font-size:42px;font-weight:800;color:var(--ink);letter-spacing:-.03em;line-height:1;margin-top:auto}.a-cards .card .val small{font-size:20px;color:var(--f-ink);margin-left:3px}
.a-cards .card .ghost{position:absolute;right:22px;top:14px;font-size:64px;font-weight:800;color:var(--f);opacity:.1;letter-spacing:-.04em;line-height:1}
.a-cards .card.solid p{color:rgba(255,255,255,.85)}.a-cards .card.solid .pts li{color:#fff}.a-cards .card.solid .pts li::before{background:#fff}.a-cards .card.solid .ic-sq{background:rgba(255,255,255,.18);color:#fff}
.a-cards .foot{font-size:20px;color:var(--text);padding:18px 26px;border-radius:16px;background:var(--f-50);border:1px solid color-mix(in srgb,var(--f) 22%,var(--line));display:flex;gap:14px;align-items:center}
.grid-4 .a-cards .card h3,.a-cards .grid-4 .card h3{font-size:23px}.a-cards .grid-4 .card p{font-size:18px}.a-cards .grid-4 .card .pts li{font-size:17px}.a-cards .grid-4 .card{padding:30px 28px 32px;min-height:300px}
.a-cards .grid-5 .card,.a-cards .grid-6 .card{padding:24px 22px;min-height:240px}.a-cards .grid-5 .card h3,.a-cards .grid-6 .card h3{font-size:20px}.a-cards .grid-5 .card p,.a-cards .grid-6 .card p{font-size:16px}

/* comparison */
.a-compare{display:flex;flex-direction:column;gap:22px;height:100%}
.a-compare .tb{flex:1;display:grid;grid-template-columns:240px repeat(var(--cols,2),minmax(0,1fr));grid-auto-rows:1fr;gap:0;border:1px solid var(--line);border-radius:var(--r);overflow:hidden;background:var(--card);box-shadow:var(--shadow)}
.a-compare .tb>div{padding:18px 24px;border-bottom:1px solid var(--line);border-right:1px solid var(--line);font-size:20px;line-height:1.45;display:flex;align-items:center}
.a-compare .tb>div:nth-child(var(--n)n){border-right:none}
.a-compare .tb .hd{background:var(--card-3);font-weight:800;color:var(--ink);font-size:21px;flex-direction:column;align-items:flex-start;gap:4px;justify-content:center}
.a-compare .tb .hd small{font-size:14px;color:var(--muted);font-weight:600}
.a-compare .tb .rl{font-weight:700;color:var(--muted);background:var(--card-2);font-size:17px}
.a-compare .tb .hl{background:var(--f-50);color:var(--ink);font-weight:600}
.a-compare .tb .hd.hl{background:var(--f-ink);color:#fff}.a-compare .tb .hd.hl small{color:rgba(255,255,255,.8)}
.a-compare .verdict{display:flex;align-items:center;gap:16px;padding:20px 28px;border-radius:16px;background:var(--f-50);border:1px solid color-mix(in srgb,var(--f) 25%,var(--line));font-size:22px;color:var(--ink);font-weight:600}.a-compare .verdict .ic{color:var(--f-ink);width:28px;height:28px;flex:none}
.a-compare.wrap{display:flex;flex-direction:column;gap:24px;height:100%}.a-compare.wrap .a-compare.vs{flex:1;min-height:0;height:auto}
.a-compare .tb .ok{color:var(--ok);font-weight:800}.a-compare .tb .no{color:var(--danger);font-weight:800}
.a-compare.vs{display:grid;grid-template-columns:1fr 80px 1fr;gap:24px;align-items:stretch}
.a-compare.vs .col{display:flex;flex-direction:column;gap:14px;padding:34px 36px;justify-content:center;border-radius:var(--r);background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow)}
.a-compare.vs .col h3{font-size:32px;font-weight:800;color:var(--ink);letter-spacing:-.02em}.a-compare.vs .col .k-small{font-size:18px;margin-top:-6px}
.a-compare.vs .col.hl{border-color:color-mix(in srgb,var(--f) 45%,var(--line));background:var(--f-50)}
.a-compare.vs .col li{display:flex;gap:16px;font-size:22px;line-height:1.5;padding:16px 0;border-bottom:1px solid var(--line)}.a-compare.vs .col li:last-child{border-bottom:none}
.a-compare.vs .col li b{color:var(--muted);font-weight:700;min-width:130px;flex:none}
.a-compare.vs .mid{display:grid;place-items:center;font-size:24px;font-weight:800;color:var(--f)}.a-compare.vs .mid span{width:64px;height:64px;border-radius:50%;background:var(--f-100);display:grid;place-items:center}

/* timeline */
.a-tl{height:100%;display:flex;flex-direction:column;gap:36px;justify-content:center}
.a-tl .h{position:relative;flex:0 0 auto;display:grid;grid-template-columns:repeat(var(--n),minmax(0,1fr));gap:20px;align-items:stretch;padding-top:74px}
.a-tl .h::before{content:'';position:absolute;left:0;right:0;top:28px;height:4px;border-radius:2px;background:var(--line-2)}
.a-tl .h .fill{position:absolute;left:0;top:28px;height:4px;border-radius:2px;background:var(--qg);width:var(--w,0%);transition:width 1.6s var(--ease)}
.a-tl .h .it{position:relative}
.a-tl .h .it .dot{position:absolute;left:0;top:-54px;width:28px;height:28px;border-radius:50%;background:var(--card);border:5px solid var(--f);box-shadow:0 0 0 5px var(--bg)}
.a-tl .h .it.now .dot{background:var(--f)}
.a-tl .h .it.now .dot::after{content:'';position:absolute;inset:-11px;border-radius:50%;border:3px solid color-mix(in srgb,var(--f) 45%,transparent);animation:blink 2.2s ease-in-out infinite}
.a-tl .h .it .d{font-size:18px;font-weight:800;letter-spacing:.06em;color:var(--f-ink);margin-bottom:12px}
.a-tl .h .it h3{font-size:27px;font-weight:800;color:var(--ink);line-height:1.3;margin-bottom:12px}
.a-tl .h .it p{font-size:20px;color:var(--muted);line-height:1.5}
.a-tl .h .it .card{padding:30px 30px;min-height:290px;height:100%}
.a-tl .h.n2 .it .card,.a-tl .h.n3 .it .card{min-height:330px;padding:36px 36px}.a-tl .h.n3 .it h3{font-size:30px}.a-tl .h.n3 .it p{font-size:22px}
.a-tl .v{flex:1;position:relative;display:flex;flex-direction:column;gap:14px;padding-left:64px;min-height:0;justify-content:center}
.a-tl .v::before{content:'';position:absolute;left:22px;top:10px;bottom:10px;width:4px;border-radius:2px;background:var(--line-2)}
.a-tl .v .it{position:relative;display:grid;grid-template-columns:150px 1fr;gap:22px;align-items:center;padding:16px 24px;background:var(--card);border:1px solid var(--line);border-radius:18px;box-shadow:var(--shadow)}
.a-tl .v .it::before{content:'';position:absolute;left:-54px;top:50%;translate:0 -50%;width:22px;height:22px;border-radius:50%;background:var(--card);border:5px solid var(--f);box-shadow:0 0 0 4px var(--bg)}
.a-tl .v .it .d{font-size:18px;font-weight:800;color:var(--f-ink);letter-spacing:.04em}
.a-tl .v .it h3{font-size:23px;font-weight:800;color:var(--ink);line-height:1.3}.a-tl .v .it p{font-size:18px;color:var(--muted);margin-top:4px;line-height:1.45}
.a-tl .foot{font-size:22px;color:var(--ink);padding:20px 28px;border-radius:16px;background:var(--f-50);border:1px solid color-mix(in srgb,var(--f) 22%,var(--line));display:flex;gap:14px;align-items:center}.a-tl .foot::before{content:'';width:10px;height:10px;border-radius:50%;background:var(--f);flex:none}
.a-tl .h.n5 .it h3,.a-tl .h.n6 .it h3{font-size:22px}.a-tl .h.n6 .it p,.a-tl .h.n7 .it p,.a-tl .h.n8 .it p{font-size:16px}.a-tl .h.n7 .it h3,.a-tl .h.n8 .it h3{font-size:19px}.a-tl .h.n7 .it .card,.a-tl .h.n8 .it .card{padding:18px 18px}

/* process */
.a-proc{height:100%;display:flex;flex-direction:column;gap:26px;justify-content:center}
.a-proc .steps{display:grid;grid-template-columns:repeat(var(--n),minmax(0,1fr));gap:18px;align-items:stretch}
.a-proc .st{position:relative;display:flex;flex-direction:column;gap:16px;padding:34px 32px 32px;border-radius:var(--r);background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow);min-height:330px}
.a-proc .st .no{display:flex;align-items:center;gap:12px}
.a-proc .st .no .num{width:44px;height:44px;font-size:18px}
.a-proc .st .no .ic-sq{margin-left:auto}
.a-proc .st h3{font-size:26px;font-weight:800;color:var(--ink);line-height:1.3}
.a-proc .st p{font-size:19px;color:var(--muted);line-height:1.55}
.a-proc .st:not(:last-child)::after{content:'';position:absolute;right:-22px;top:50%;translate:0 -50%;width:26px;height:26px;background:var(--f);border-radius:50%;z-index:2;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12h14'/%3E%3Cpath d='m12 5 7 7-7 7'/%3E%3C/svg%3E");background-size:14px;background-position:center;background-repeat:no-repeat}
.a-proc.chev .st{clip-path:polygon(0 0,calc(100% - 34px) 0,100% 50%,calc(100% - 34px) 100%,0 100%,34px 50%);border-radius:0;padding-left:52px;padding-right:48px;box-shadow:none;border:none;background:var(--f-50)}
.a-proc.chev .st:first-child{clip-path:polygon(0 0,calc(100% - 34px) 0,100% 50%,calc(100% - 34px) 100%,0 100%);padding-left:30px}
.a-proc.chev .st::after{display:none}
.a-proc.circ .steps{position:relative}
.a-proc.circ .st{align-items:center;text-align:center;border:none;box-shadow:none;background:transparent;min-height:0;padding:0}
.a-proc.circ .st .big-ic{width:176px;height:176px;border-radius:50%;background:var(--f-100);color:var(--f-ink);display:grid;place-items:center;border:8px solid var(--card);box-shadow:var(--shadow-lg);margin-bottom:14px}
.a-proc.circ .st .big-ic .ic{width:76px;height:76px}
.a-proc.circ .st h3{font-size:28px}.a-proc.circ .st p{font-size:19px;max-width:260px;text-align:center}
.a-proc.circ .steps::before{content:'';position:absolute;left:8%;right:8%;top:88px;height:4px;border-radius:2px;background:var(--line-2);z-index:0}
.a-proc.circ .st{z-index:1}
.a-proc.circ .st::after{right:-30px;top:76px;translate:0 0}
.a-proc .result{display:flex;align-items:center;gap:16px;padding:24px 32px;border-radius:18px;background:var(--ink);color:var(--bg);font-size:23px;font-weight:700;box-shadow:var(--shadow-lg)}
.a-proc .result .ic{width:30px;height:30px;color:var(--f);flex:none}.a-proc .result em{color:var(--f)}
.stage.dark .a-proc .result,html[data-theme=dark] .a-proc .result{background:var(--card-3);color:var(--ink)}
.a-proc.chev .st{min-height:360px;padding-top:40px;justify-content:center}.a-proc.chev .st h3{font-size:25px}.a-proc.chev .st p{font-size:19px}
.a-proc .steps.n5 .st h3,.a-proc .steps.n6 .st h3{font-size:21px}.a-proc .steps.n6 .st p{font-size:16px}

/* chart */
.a-chart{height:100%;display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,.7fr);gap:36px;align-items:stretch;min-height:0}
.a-chart.cl .side{order:2}.a-chart.cr .side{order:-1}.a-chart.cf{grid-template-columns:1fr}
.a-chart .ch{display:flex;flex-direction:column;gap:14px;padding:28px 30px 22px;border-radius:var(--r);background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow);min-height:0}
.a-chart .ch .t{display:flex;align-items:baseline;justify-content:space-between;gap:14px}
.a-chart .ch .t h3{font-size:22px;font-weight:800;color:var(--ink)}.a-chart .ch .t span{font-size:15px;color:var(--muted)}
.a-chart .ch .plot{flex:1;min-height:0}.a-chart .ch .plot svg{width:100%;height:100%}
.a-chart .side{display:flex;flex-direction:column;gap:18px;justify-content:center;min-width:0}
.a-chart .side .ins{padding:26px 28px;border-radius:var(--r);background:var(--f-50);border:1px solid color-mix(in srgb,var(--f) 25%,var(--line))}
.a-chart .side .ins h3{font-size:25px;font-weight:800;color:var(--ink);line-height:1.3;margin-bottom:10px}.a-chart .side .ins p{font-size:19px;color:var(--text);line-height:1.55}
.a-chart .side .co{display:flex;align-items:center;gap:16px;padding:18px 24px;border-radius:18px;background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow)}
.a-chart .side .co .v{font-size:36px;font-weight:800;color:var(--ink);letter-spacing:-.03em;min-width:120px;font-variant-numeric:tabular-nums}
.a-chart .side .co .l{font-size:17px;font-weight:700;color:var(--ink)}.a-chart .side .co .d{font-size:15px;color:var(--muted);margin-top:3px}
.legend{display:flex;gap:18px;flex-wrap:wrap;font-size:15px;color:var(--muted);font-weight:600}.legend span{display:inline-flex;align-items:center;gap:7px}.legend i{width:12px;height:12px;border-radius:4px;display:inline-block}
.chart-svg text{font-family:var(--font);fill:var(--muted);font-size:15px;font-weight:600}
.chart-svg .ax{stroke:var(--line-2)}.chart-svg .gl{stroke:var(--line);stroke-dasharray:3 5}
.chart-svg .vl{fill:var(--ink);font-weight:800;font-size:17px}.chart-svg .xl{font-size:16px}.chart-svg .xl.hl{fill:var(--ink);font-weight:800}
.chart-svg .bar-hl{filter:drop-shadow(0 6px 10px rgba(0,0,0,.18))}
.chart-svg .dn-c{fill:var(--ink);font-size:52px;font-weight:800;letter-spacing:-.03em}.chart-svg .dn-l{font-size:16px}

/* table */
.a-table{height:100%;display:grid;grid-template-columns:1fr;gap:24px;align-content:start;min-height:0}
.a-table.aside{grid-template-columns:minmax(0,1.5fr) minmax(0,.5fr)}
.a-table .wrap{border-radius:var(--r);border:1px solid var(--line);overflow:hidden;background:var(--card);box-shadow:var(--shadow)}
.a-table .cap{font-size:15px;color:var(--muted);margin-top:12px}
.a-table .as{display:flex;flex-direction:column;gap:14px;padding:26px 28px;border-radius:var(--r);background:var(--f-50);border:1px solid color-mix(in srgb,var(--f) 25%,var(--line))}
.a-table .as h3{font-size:22px;font-weight:800;color:var(--ink)}.a-table .as li{position:relative;padding-left:18px;font-size:18px;line-height:1.5;color:var(--text)}.a-table .as li::before{content:'';position:absolute;left:0;top:.6em;width:8px;height:8px;border-radius:50%;background:var(--f)}

/* matrix */
.a-matrix{height:100%;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:40px;align-items:stretch}
.a-matrix .mx{position:relative;padding:0 0 46px 56px;min-height:0}
.a-matrix .mx .plane{position:relative;height:100%;border-radius:22px;overflow:hidden;border:1px solid var(--line);background:var(--card);box-shadow:var(--shadow);display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr}
.a-matrix .mx .plane>div{padding:22px 24px;border:1px solid var(--line);position:relative}
.a-matrix .mx .plane>div h4{font-size:21px;font-weight:800;color:var(--ink);margin-bottom:6px}.a-matrix .mx .plane>div p{font-size:16px;color:var(--muted);line-height:1.45}
.a-matrix .mx .plane>div.q0{background:color-mix(in srgb,var(--f-50) 60%,var(--card))}.a-matrix .mx .plane>div.q1{background:var(--f-50)}.a-matrix .mx .plane>div.q2{background:var(--card)}.a-matrix .mx .plane>div.q3{background:color-mix(in srgb,var(--f-50) 60%,var(--card))}
.a-matrix .mx .plane>div.pt{position:absolute;translate:-50% -50%;z-index:2;width:var(--sz,26px);height:var(--sz,26px);padding:0;border:0;background:none}
.a-matrix .mx .pt i{display:block;width:var(--sz,26px);height:var(--sz,26px);border-radius:50%;background:var(--f);border:4px solid var(--card);box-shadow:var(--shadow-lg)}
.a-matrix .mx .pt b{position:absolute;top:100%;left:50%;translate:-50% 6px;font-size:16px;color:var(--ink);white-space:nowrap;background:color-mix(in srgb,var(--card) 88%,transparent);padding:4px 10px;border-radius:999px;backdrop-filter:blur(4px);box-shadow:var(--shadow)}
.a-matrix .mx .pt.er b{left:auto;right:-6px;translate:0 6px}.a-matrix .mx .pt.el b{left:-6px;translate:0 6px}.a-matrix .mx .pt.eb b{top:auto;bottom:100%;translate:-50% -6px}.a-matrix .mx .pt.eb.er b{translate:0 -6px}.a-matrix .mx .pt.eb.el b{translate:0 -6px}
.a-matrix .mx .xl{position:absolute;left:56px;right:0;bottom:8px;display:flex;justify-content:space-between;font-size:15px;color:var(--muted);font-weight:700}
.a-matrix .mx .xl b{position:absolute;left:50%;translate:-50% 0;font-size:16px;color:var(--muted)}
.a-matrix .mx .yl{position:absolute;left:8px;top:0;bottom:46px;display:flex;flex-direction:column;justify-content:space-between;align-items:center;font-size:15px;color:var(--muted);font-weight:700}
.a-matrix .mx .yl b{writing-mode:vertical-rl;rotate:180deg;font-size:16px;color:var(--muted)}
.a-matrix .mx .yl span{writing-mode:vertical-rl;rotate:180deg}
.a-matrix .side{display:flex;flex-direction:column;gap:14px;justify-content:center}
.a-matrix .side .card{padding:20px 24px;display:flex;gap:16px;align-items:flex-start}
.a-matrix .side .card h4{font-size:21px;font-weight:800;color:var(--ink)}.a-matrix .side .card p{font-size:16px;color:var(--muted);margin-top:4px;line-height:1.45}
.a-matrix .side .card .num{width:36px;height:36px;font-size:15px;border-radius:10px}

/* diagram */
.a-diag{height:100%;display:grid;grid-template-columns:1fr;gap:30px;min-height:0}
.a-diag.aside{grid-template-columns:minmax(0,1.35fr) minmax(0,.65fr)}
.a-diag .cv{position:relative;min-height:0;border-radius:var(--r);background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow);padding:30px;display:flex;align-items:center;justify-content:center;overflow:hidden}
.a-diag .cv.plain{background:none;border:none;box-shadow:none;padding:0;overflow:visible}
.a-diag .cv svg{width:100%;height:100%;max-height:100%}
.a-diag .cv .node{position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center}
.dg-node{fill:var(--card);stroke:var(--line-2);stroke-width:1.5}
.dg-text{font-family:var(--font);fill:var(--ink);font-size:22px;font-weight:800}
.dg-desc{font-family:var(--font);fill:var(--muted);font-size:16px;font-weight:600}
.dg-edge{stroke:var(--line-2);stroke-width:2.5;fill:none}
.dg-edge.f{stroke:var(--f)}
.dg-lab{font-family:var(--font);fill:var(--muted);font-size:14px;font-weight:700}
.a-diag .as{display:flex;flex-direction:column;gap:14px;justify-content:center}
.a-diag .as .card{padding:24px 26px}
.a-diag .as h3{font-size:22px;font-weight:800;color:var(--ink);margin-bottom:12px}
.a-diag .as li{position:relative;padding-left:18px;font-size:18px;line-height:1.5;color:var(--text);margin-bottom:8px}.a-diag .as li::before{content:'';position:absolute;left:0;top:.6em;width:8px;height:8px;border-radius:50%;background:var(--f)}
.a-diag .layers{display:flex;flex-direction:column;gap:16px;width:100%;max-width:1400px;height:100%;justify-content:center}
.a-diag .layers .ly{display:grid;grid-template-columns:260px 1fr;gap:22px;align-items:center;padding:24px 30px;flex:1;max-height:190px;border-radius:18px;background:var(--f-50);border:1px solid color-mix(in srgb,var(--f) 24%,var(--line))}
.a-diag .layers .ly h4{font-size:24px;font-weight:800;color:var(--ink);display:flex;align-items:center;gap:12px}
.a-diag .layers .ly .cells{display:flex;gap:10px;flex-wrap:wrap}
.a-diag .layers .ly .cells span{padding:12px 18px;border-radius:12px;background:var(--card);border:1px solid var(--line);font-size:19px;font-weight:600;color:var(--text);box-shadow:var(--shadow)}
.a-diag .funnel{display:flex;flex-direction:column;align-items:center;gap:10px;width:100%}
.a-diag .funnel .fl{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:18px 32px;border-radius:14px;background:var(--f-ink);color:#fff;font-weight:700;font-size:20px;width:var(--w)}
.a-diag .funnel .fl small{font-size:15px;opacity:.85;font-weight:600}
.a-diag .flow{display:flex;align-items:stretch;gap:0;width:100%;justify-content:center}
.a-diag .flow .fn{flex:1;max-width:340px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:14px;padding:44px 24px;border-radius:24px;background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow)}
.a-diag .flow .fn .ic-sq.lg{width:96px;height:96px;border-radius:28px}.a-diag .flow .fn .ic-sq.lg .ic{width:46px;height:46px}.a-diag .flow .fn .num.lg{width:72px;height:72px;font-size:30px}
.a-diag .flow .fn h4{font-size:26px;font-weight:800;color:var(--ink)}.a-diag .flow .fn p{font-size:19px;color:var(--muted);line-height:1.45}
.a-diag .flow .ar{display:grid;place-items:center;width:60px;color:var(--f)}.a-diag .flow .ar .ic{width:34px;height:34px}

/* quote */
.a-quote{height:100%;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.55fr);gap:60px;align-items:center}
.a-quote.solo{grid-template-columns:1fr}
.a-quote .qm{width:96px;height:96px;color:var(--f);opacity:.35;margin-bottom:10px}
.a-quote blockquote{font-size:60px;font-weight:800;line-height:1.25;letter-spacing:-.035em;color:var(--ink);max-width:1300px}
.a-quote blockquote em{color:var(--f)}
.a-quote .by{display:flex;align-items:center;gap:16px;margin-top:40px;font-size:21px;color:var(--muted)}
.a-quote .by b{color:var(--ink);font-size:23px}.a-quote .by i{width:48px;height:3px;background:var(--f);display:inline-block;border-radius:2px}
.a-quote .ctx{font-size:19px;color:var(--muted);margin-top:18px;line-height:1.6;max-width:1100px}
.a-quote .img,.a-quote .art{aspect-ratio:1/1;border-radius:30px}

/* image hero */
.stage.a-hero-stage{padding:0}
.a-hero{position:absolute;inset:0}
.a-hero .ph{position:absolute;inset:0}.a-hero .ph img,.a-hero .ph .art{width:100%;height:100%;object-fit:cover}
.a-hero .ph::after{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(5,10,30,.9) 0%,rgba(5,10,30,.45) 45%,rgba(5,10,30,.15) 100%)}
.a-hero.ov-light .ph::after{background:linear-gradient(to top,rgba(255,255,255,.95) 0%,rgba(255,255,255,.55) 45%,rgba(255,255,255,.1) 100%)}
.a-hero.ov-gradient .ph::after{background:linear-gradient(100deg,rgba(5,10,30,.9) 0%,rgba(5,10,30,.5) 55%,rgba(5,10,30,.1) 100%)}
.a-hero .tx{position:absolute;left:96px;right:96px;bottom:120px;color:#fff;max-width:1300px}
.a-hero.ov-light .tx{color:var(--ink)}
.a-hero .tx .eyebrow{font-size:17px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#fff;opacity:.85;margin-bottom:16px}
.a-hero.ov-light .tx .eyebrow{color:var(--f);opacity:1}
.a-hero .tx h1{font-size:76px;font-weight:800;letter-spacing:-.04em;line-height:1.1;margin-bottom:20px;color:inherit}
.a-hero .tx h1 em{color:#FFD56B}.a-hero.ov-light .tx h1 em{color:var(--f)}
.a-hero .tx .cap{font-size:24px;line-height:1.5;opacity:.92;max-width:1000px}
.a-hero .tx .stats{display:flex;gap:16px;margin-top:30px}
.a-hero .tx .stats div{padding:18px 26px;border-radius:18px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.22);backdrop-filter:blur(10px)}
.a-hero.ov-light .tx .stats div{background:rgba(255,255,255,.8);border-color:var(--line)}
.a-hero .tx .stats .v{font-size:40px;font-weight:800;letter-spacing:-.03em;line-height:1}.a-hero .tx .stats .l{font-size:15px;opacity:.85;margin-top:8px}
.a-hero.center .tx{text-align:center;left:50%;translate:-50% 0;right:auto;width:1400px;bottom:auto;top:50%;translate:-50% -50%}
.a-hero.center .tx .stats{justify-content:center}
.a-hero .foot-ov{position:absolute;left:96px;right:96px;bottom:34px;display:flex;justify-content:space-between;font-size:15px;color:rgba(255,255,255,.7);font-weight:600}
.a-hero.ov-light .foot-ov{color:var(--faint)}

/* annotated image */
.a-annot{height:100%;display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,.75fr);gap:36px;align-items:stretch;min-height:0}
.a-annot.left .img{order:2}
.a-annot .img{height:100%;border-radius:26px}
.a-annot .img img{height:100%}
.a-annot .hs{position:absolute;translate:-50% -50%;z-index:2}
.a-annot .hs i{display:block;width:30px;height:30px;border-radius:50%;background:var(--f-ink);color:#fff;border:3px solid #fff;box-shadow:0 6px 16px rgba(0,0,0,.35);font-style:normal;font-weight:800;font-size:14px;display:grid;place-items:center}
.a-annot .hs i::after{content:'';position:absolute;inset:-8px;border-radius:50%;border:2px solid #fff;opacity:.6;animation:ping 1.8s ease-out infinite}
.a-annot .hs span{position:absolute;left:24px;top:-6px;white-space:nowrap;background:rgba(5,10,30,.78);color:#fff;font-size:15px;font-weight:700;padding:7px 12px;border-radius:10px;backdrop-filter:blur(6px)}
.a-annot .hs.flip span{left:auto;right:24px}
.a-annot .list{display:flex;flex-direction:column;gap:12px;justify-content:center}
.a-annot .list li{display:flex;gap:14px;align-items:flex-start;padding:18px 22px;border-radius:16px;background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow)}
.a-annot .list li .num{width:34px;height:34px;font-size:15px;margin-top:2px}
.a-annot .list li h4{font-size:20px;font-weight:800;color:var(--ink)}.a-annot .list li p{font-size:16px;color:var(--muted);line-height:1.5;margin-top:4px}
.a-annot .intro{font-size:18px;color:var(--muted);line-height:1.55;margin-bottom:6px}

/* mockup */
.a-mock{height:100%;display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,.75fr);gap:40px;align-items:stretch;min-height:0}
.a-mock.full{grid-template-columns:1fr}
.a-mock .dev{position:relative;border-radius:26px;background:#0E1326;border:1px solid #27304F;box-shadow:var(--shadow-xl);overflow:hidden;display:flex;flex-direction:column;min-height:0;flex:1}
.a-mock .dev .bar{height:48px;border-radius:0;background:#141A33;display:flex;align-items:center;gap:8px;padding:0 18px;flex:none;font-size:14px;color:#8A96B8}
.a-mock .dev .bar i{width:12px;height:12px;border-radius:50%;background:#FF5F57;display:inline-block}.a-mock .dev .bar i+i{background:#FEBC2E}.a-mock .dev .bar i+i+i{background:#28C840}
.a-mock .dev .bar .url{margin-left:14px;flex:1;height:30px;border-radius:8px;background:#0B0F1F;display:flex;align-items:center;padding:0 14px;font-size:14px;color:#A9B4D4}
.a-mock .dev .scr{flex:1;min-height:0;background:#F7F8FC;color:#1E2945;position:relative;overflow:hidden;display:flex;flex-direction:column}
.a-mock.phone .dev{width:420px;margin:0 auto;border-radius:44px;border:8px solid #111;background:#111}.a-mock.phone .dev .bar{display:none}.a-mock.phone .dev .scr{border-radius:34px}
.a-mock .chat{flex:1;display:flex;flex-direction:column;gap:14px;padding:26px 30px;overflow:hidden;justify-content:flex-end}
.a-mock .chat .m{max-width:80%;padding:18px 24px;border-radius:20px;font-size:21px;line-height:1.5;opacity:0;translate:0 10px;transition:opacity .4s,translate .4s}
.a-mock .chat .m.in{opacity:1;translate:0 0}
.a-mock .chat .m.u{align-self:flex-end;background:var(--f-ink);color:#fff;border-bottom-right-radius:6px}
.a-mock .chat .m.a{align-self:flex-start;background:#fff;border:1px solid #E3E8F0;border-bottom-left-radius:6px;color:#1E2945}
.a-mock .chat .m.n{align-self:center;background:transparent;color:#8A97AD;font-size:16px;padding:4px;text-align:center;max-width:90%}
.a-mock .chat .m.c{align-self:flex-start;background:var(--f-100);color:var(--f);font-weight:700;font-size:16px;border-radius:12px;padding:10px 16px}
.a-mock .composer{flex:none;margin:0 30px 26px;height:56px;border-radius:16px;background:#fff;border:1px solid #E3E8F0;display:flex;align-items:center;padding:0 20px;font-size:17px;color:#8A97AD;box-shadow:0 6px 18px rgba(20,30,90,.06)}
.a-mock .composer .send{margin-left:auto;width:36px;height:36px;border-radius:50%;background:var(--f-ink);color:#fff;display:grid;place-items:center}.a-mock .composer .send .ic{width:18px;height:18px}
.a-mock .side{display:flex;flex-direction:column;gap:16px;justify-content:center}
.a-mock .side h3{font-size:30px;font-weight:800;color:var(--ink);margin-bottom:8px;letter-spacing:-.02em}
.a-mock .side li{display:flex;gap:14px;align-items:flex-start;padding:22px 24px;border-radius:16px;background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow);font-size:21px;line-height:1.45;color:var(--text)}
.a-mock .side li .num{width:38px;height:38px;font-size:16px;margin-top:0}
.a-mock .side .tip{padding:20px 24px;border-radius:16px;background:var(--f-50);border:1px solid color-mix(in srgb,var(--f) 24%,var(--line));font-size:20px;color:var(--ink);display:flex;gap:12px;align-items:flex-start;line-height:1.45}.a-mock .side .tip .ic{color:var(--f-ink);flex:none;width:24px;height:24px;margin-top:2px}
.a-mock .dash{flex:1;display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:min-content;gap:16px;padding:24px}
.a-mock .dash .w{background:#fff;border:1px solid #E3E8F0;border-radius:14px;padding:16px 18px;opacity:0;translate:0 8px;transition:opacity .4s,translate .4s}
.a-mock .dash .w.in{opacity:1;translate:0 0}.a-mock .dash .w.wide{grid-column:span 3}
.a-mock .dash .w .k{font-size:13px;color:#8A97AD;font-weight:700;letter-spacing:.06em}.a-mock .dash .w .v{font-size:28px;font-weight:800;color:#0B1B3A;margin-top:6px}
.a-mock .dash .w .bars{display:flex;gap:8px;align-items:flex-end;height:80px;margin-top:10px}.a-mock .dash .w .bars i{flex:1;background:var(--f);border-radius:4px 4px 0 0;opacity:.85}
.a-mock .cursor{position:absolute;width:22px;height:22px;z-index:5;pointer-events:none;transition:left .7s var(--ease),top .7s var(--ease);opacity:0}
.a-mock .cursor.on{opacity:1}
.a-mock .cursor svg{filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))}

/* pricing */
.a-pricing{height:100%;display:grid;grid-template-columns:repeat(var(--n),minmax(0,1fr));gap:22px;align-items:stretch}
.a-pricing .pl{display:flex;flex-direction:column;gap:16px;padding:32px 30px;border-radius:var(--r);background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow);position:relative}
.a-pricing .pl.hl{border-color:color-mix(in srgb,var(--f) 55%,var(--line));box-shadow:var(--shadow-lg);background:var(--f-50)}
.a-pricing .pl .bd{position:absolute;right:22px;top:-14px;padding:5px 14px;border-radius:999px;background:var(--f-ink);color:#fff;font-size:14px;font-weight:800;letter-spacing:.04em}
.a-pricing .pl h3{font-size:24px;font-weight:800;color:var(--ink)}
.a-pricing .pl .pr{font-size:48px;font-weight:800;color:var(--ink);letter-spacing:-.04em;line-height:1}.a-pricing .pl .pr small{font-size:18px;color:var(--muted);font-weight:600;letter-spacing:0;margin-left:4px}
.a-pricing .pl .ds{font-size:16px;color:var(--muted);line-height:1.5}
.a-pricing .pl ul{display:flex;flex-direction:column;gap:10px;margin-top:6px}
.a-pricing .pl li{display:flex;gap:10px;align-items:flex-start;font-size:17px;color:var(--text);line-height:1.45}.a-pricing .pl li .ic{color:var(--f);width:20px;height:20px;margin-top:3px;flex:none}

/* team */
.a-team{height:100%;display:grid;grid-template-columns:repeat(var(--n),minmax(0,1fr));gap:22px;align-content:center}
.a-team .mb{display:flex;flex-direction:column;align-items:center;text-align:center;gap:12px;padding:34px 26px 30px;border-radius:var(--r);background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow)}
.a-team .mb .avatar{width:136px;height:136px;font-size:52px}
.a-team .mb .img{width:136px;height:136px;border-radius:50%;box-shadow:none}
.a-team .mb{padding:44px 30px 38px;min-height:400px;justify-content:center}
.a-team .mb h3{font-size:28px;font-weight:800;color:var(--ink);margin-top:8px}
.a-team .mb .role{font-size:16px;font-weight:800;color:var(--f-ink);letter-spacing:.06em}
.a-team .mb p{font-size:18px;color:var(--muted);line-height:1.5;max-width:300px}
.a-team .mb .tags{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:4px}

/* checklist */
.a-check{height:100%;display:grid;grid-template-columns:1fr;gap:24px;align-content:center}
.a-check.aside{grid-template-columns:minmax(0,1.4fr) minmax(0,.6fr)}
.a-check.g2 .groups{display:grid;grid-template-columns:1fr 1fr;gap:22px}
.a-check .grp h3{font-size:22px;font-weight:800;color:var(--f-ink);margin-bottom:14px;letter-spacing:.02em}
.a-check ul{display:flex;flex-direction:column;gap:12px}
.a-check li{display:flex;gap:18px;align-items:flex-start;padding:22px 26px;border-radius:16px;background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow);font-size:23px;line-height:1.45;color:var(--text)}
.a-check li .bx{width:30px;height:30px;border-radius:9px;border:2px solid var(--line-2);flex:none;display:grid;place-items:center;color:#fff;margin-top:1px}
.a-check li.done .bx{background:var(--f-ink);border-color:var(--f-ink)}.a-check li.done .bx .ic{width:18px;height:18px}
.a-check li.done{color:var(--ink)}
.a-check li small{display:block;font-size:17px;color:var(--muted);margin-top:4px}
.a-check .as{padding:30px 32px;border-radius:var(--r);background:var(--f-50);border:1px solid color-mix(in srgb,var(--f) 25%,var(--line));font-size:22px;line-height:1.6;color:var(--ink);align-self:center}

/* summary */
.a-summary{height:100%;display:flex;flex-direction:column;gap:26px;justify-content:center}
.a-summary .tk{display:grid;grid-template-columns:repeat(var(--n,3),minmax(0,1fr));gap:22px}
.a-summary .tk .card{display:flex;flex-direction:column;gap:16px;padding:38px 36px;min-height:340px}
.a-summary .tk .card .num{width:48px;height:48px;font-size:20px;border-radius:14px}
.a-summary .tk .card h3{font-size:28px;font-weight:800;color:var(--ink);line-height:1.3}.a-summary .tk .card p{font-size:20px;color:var(--muted);line-height:1.6}
.a-summary .cta{display:flex;align-items:center;gap:18px;padding:24px 32px;border-radius:20px;background:var(--f-ink);color:#fff;font-size:24px;font-weight:700;box-shadow:var(--shadow-lg)}
.a-summary .cta .ic{width:30px;height:30px}
.a-summary .nx{font-size:17px;color:var(--muted);display:flex;align-items:center;gap:10px}

/* closing */
.a-closing{height:100%;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:60px;align-items:center}
.a-closing h2{font-size:104px;font-weight:800;letter-spacing:-.045em;line-height:1.05;color:var(--ink)}
.a-closing h2::before{content:'';display:block;width:88px;height:8px;border-radius:4px;background:var(--qg);margin-bottom:34px}
.a-closing h2 em{color:var(--f-ink)}
.a-closing .sub{font-size:28px;color:var(--muted);line-height:1.5;margin-top:28px;max-width:820px}
.a-closing .kw{display:flex;gap:12px;flex-wrap:wrap;margin-top:36px}.a-closing .kw .chip{font-size:18px;padding:10px 18px}
.a-closing .ct{position:relative;display:flex;flex-direction:column;gap:16px;padding:44px 44px 40px;border-radius:var(--r);background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow-xl);overflow:hidden}
.a-closing .ct::before{content:'';position:absolute;left:0;top:0;right:0;height:8px;background:var(--qg)}
.a-closing .ct .nm{font-size:36px;font-weight:800;color:var(--ink);letter-spacing:-.02em}.a-closing .ct .og{font-size:21px;color:var(--muted);margin-top:-8px}
.a-closing .ct li{display:flex;align-items:center;gap:14px;font-size:21px;color:var(--text)}.a-closing .ct li .ic{color:var(--f-ink);width:24px;height:24px}
.stage:has(.a-closing) .amb .orb{opacity:.85}
.a-closing .ct .qr{flex-direction:row;justify-content:flex-start;gap:18px;padding-top:10px;border-top:1px solid var(--line);margin-top:6px}
.a-closing .thanks{font-size:24px;font-weight:800;color:var(--f-ink);letter-spacing:.04em;margin-top:34px;display:flex;align-items:center;gap:12px}.a-closing .thanks::before{content:'';width:34px;height:3px;background:var(--f);border-radius:2px}

/* custom */
.a-custom{height:100%;min-height:0;position:relative}

/* print */
@media print{.deck-nav{display:none}}
`;
