/* FX layer CSS — ported from the reference decks (고창 AI특강 v2 layers): photo backdrops, aurora, section rail, 3D tilt,
   3D entrance, cinematic dark stage, app-window kit and the guided-click layer. Opt-in via html classes / components. */
export const FX_CSS = `
/* ===== FX layer (ported from the reference decks, opt-in) ===== */
:root{--f-alt:var(--q3);--ease-out:cubic-bezier(.2,.8,.2,1);--ease-spring:cubic-bezier(.34,1.56,.64,1)}
/* photo backdrop with Ken Burns + legibility fades. Class names say WHICH SIDE FADES TO THE STAGE COLOR (= where the text goes):
   default/.fade-l = left fades (text left, photo right) · .fade-r = right fades (text right, photo left) · .fade-b = bottom fades · .fade-t = top fades
   <div class="backdrop kb"><img src style="--pos:50% 40%"><div class="credit">사진: …</div></div> */
.stage>.head{position:relative;z-index:3}
.photo{position:relative;overflow:hidden;border-radius:var(--r);background:var(--card-3);min-height:0}
.photo img{width:100%;height:100%;object-fit:cover;display:block}
.photo.kb img{animation:kenburns 24s ease-in-out infinite alternate;transform-origin:center}
@keyframes kenburns{from{scale:1;translate:0 0}to{scale:1.09;translate:-1.2% .8%}}
.photo .cap{position:absolute;left:18px;bottom:16px;padding:8px 16px;border-radius:999px;background:rgba(255,255,255,.9);color:var(--ink);font-size:16px;font-weight:700;backdrop-filter:blur(6px);z-index:2}
.photo .credit,.backdrop .credit{position:absolute;right:14px;bottom:10px;font-size:13px;color:rgba(255,255,255,.9);text-shadow:0 1px 3px rgba(0,0,0,.6);z-index:2;pointer-events:none}
.backdrop .credit.dark{color:rgba(0,0,0,.5);text-shadow:none}
.photo.frame{border:1px solid var(--line);box-shadow:var(--shadow)}
.photo.sq{border-radius:var(--r-sm)}
.backdrop{position:fixed!important;inset:0;overflow:hidden;z-index:0;border-radius:0} /* fixed = relative to the transformed .stage, so it bleeds to the stage edges even from inside a positioned .body */
.backdrop img{width:100%;height:100%;object-fit:cover;object-position:var(--pos,center)}
.backdrop::before{content:'';position:absolute;inset:0;z-index:1;pointer-events:none;background:var(--bd-top,linear-gradient(transparent,transparent)),linear-gradient(0deg,var(--bg) 0%,color-mix(in srgb,var(--bg) 70%,transparent) 7%,transparent 12%)} /* footer strip (+ header strip when the engine header is present) so chrome text never sits on the photo */
.stage>.head~.body .backdrop{--bd-top:linear-gradient(180deg,var(--bg) 0%,color-mix(in srgb,var(--bg) 85%,transparent) 17%,transparent 34%)}
.stage.cine .backdrop::before{background:var(--bd-top,linear-gradient(transparent,transparent)),linear-gradient(0deg,#070C1C 0%,rgba(7,12,28,.7) 7%,transparent 12%)}
.stage.cine>.head~.body .backdrop{--bd-top:linear-gradient(180deg,#070C1C 0%,rgba(7,12,28,.85) 17%,transparent 34%)}
.backdrop.kb img{animation:kenburns 26s ease-in-out infinite alternate}
.backdrop::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,var(--bg) 0%,var(--bg) 36%,color-mix(in srgb,var(--bg) 72%,transparent) 58%,color-mix(in srgb,var(--bg) 10%,transparent) 100%)}
.backdrop.fade-l::after{background:linear-gradient(90deg,var(--bg) 0%,var(--bg) 36%,color-mix(in srgb,var(--bg) 72%,transparent) 58%,color-mix(in srgb,var(--bg) 10%,transparent) 100%)}
.backdrop.fade-r::after{background:linear-gradient(270deg,var(--bg) 0%,var(--bg) 36%,color-mix(in srgb,var(--bg) 72%,transparent) 58%,color-mix(in srgb,var(--bg) 10%,transparent) 100%)}
.backdrop.fade-b::after{background:linear-gradient(180deg,color-mix(in srgb,var(--bg) 15%,transparent) 0%,color-mix(in srgb,var(--bg) 65%,transparent) 45%,var(--bg) 100%)}
.backdrop.fade-t::after{background:linear-gradient(0deg,color-mix(in srgb,var(--bg) 15%,transparent) 0%,color-mix(in srgb,var(--bg) 65%,transparent) 45%,var(--bg) 100%)}
.backdrop.soft::after{background:color-mix(in srgb,var(--bg) 84%,transparent)}
.backdrop.veil::after{background:color-mix(in srgb,var(--bg) 92%,transparent)}
.backdrop.dim::after{background:linear-gradient(180deg,rgba(5,14,32,.25) 0%,rgba(5,14,32,.72) 100%)}
/* aurora blobs (html.fx-aurora), section rail (html.fx-rail), 3D tilt (html.fx-tilt), 3D entrance (html.fx-3d-in), cinematic dark stage (.stage.cine) */
.fx-aurora{position:absolute!important;inset:0;overflow:hidden;z-index:-1;pointer-events:none;border-radius:inherit}
.fx-aurora i{position:absolute;border-radius:50%;opacity:.38;will-change:transform;
  background:radial-gradient(closest-side,color-mix(in srgb,var(--f) 15%,transparent),transparent 70%)}
.fx-aurora i:nth-child(1){width:1100px;height:1100px;left:-320px;top:-640px;animation:aur1 26s ease-in-out infinite alternate}
.fx-aurora i:nth-child(2){width:900px;height:900px;right:-300px;bottom:-520px;animation:aur2 31s ease-in-out infinite alternate;
  background:radial-gradient(closest-side,color-mix(in srgb,var(--f-alt) 12%,transparent),transparent 70%)}
.fx-aurora i:nth-child(3){width:620px;height:620px;left:46%;top:-380px;opacity:.35;animation:aur3 22s ease-in-out infinite alternate;
  background:radial-gradient(closest-side,color-mix(in srgb,var(--gold) 12%,transparent),transparent 70%)}
@keyframes aur1{from{transform:translate(0,0) scale(1)}to{transform:translate(140px,90px) scale(1.12)}}
@keyframes aur2{from{transform:translate(0,0) scale(1)}to{transform:translate(-160px,-80px) scale(1.08)}}
@keyframes aur3{from{transform:translate(0,0)}to{transform:translate(-120px,70px)}}
html.static .fx-aurora i{animation:none!important}
.sec-rail{position:absolute;left:50%;top:50%;translate:-50% -50%;display:flex;align-items:center;gap:7px;pointer-events:none}
.sec-rail span{height:5px;width:34px;border-radius:999px;background:var(--line-2);position:relative;transition:background .4s}
.sec-rail span.done{background:color-mix(in srgb,var(--f) 45%,var(--line-2))}
.sec-rail span.on{background:linear-gradient(90deg,var(--f),var(--f-alt));width:60px;box-shadow:0 0 12px color-mix(in srgb,var(--f) 50%,transparent)}
.sec-rail span.on::after{content:attr(data-l);position:absolute;left:50%;top:-22px;translate:-50% 0;font-size:12.5px;font-weight:800;letter-spacing:.06em;color:var(--f);white-space:nowrap}
.photo{box-shadow:0 30px 60px -30px rgba(15,35,80,.45),0 0 0 1px rgba(15,35,80,.08)}
.photo::after{content:'';position:absolute;inset:0;pointer-events:none;border-radius:inherit;box-shadow:0 0 0 1px rgba(255,255,255,.35) inset}
.photo .cap{background:rgba(255,255,255,.86);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);box-shadow:0 6px 18px -8px rgba(0,0,0,.4)}
html.js.qfx-3d-in [data-reveal]{filter:blur(10px);transition:opacity .9s var(--ease-out),translate .9s var(--ease-out),scale .9s var(--ease-out),rotate .9s var(--ease-out),filter .9s var(--ease-out);transition-delay:var(--d,0ms)}
html.js.qfx-3d-in [data-reveal]:not([data-reveal=left]):not([data-reveal=right]):not([data-reveal=scale]):not([data-reveal=fade]){rotate:x 7deg;transform-origin:50% 110%}
html.js.qfx-3d-in [data-reveal].in,html.js.reveal-done [data-reveal]{filter:none;rotate:x 0deg}
html.static [data-reveal]{filter:none!important;rotate:none!important}
.tilt{transform-style:preserve-3d;transition:transform .55s var(--ease-out),box-shadow .5s var(--ease-out);will-change:transform}
.tilt.tilting{transition:transform .08s linear}
.tilt.tilting:not(.solid)::after{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;
  background:radial-gradient(380px 260px at var(--mx,50%) var(--my,50%),rgba(255,255,255,.6),transparent 62%);mix-blend-mode:soft-light;z-index:1}
@keyframes npop{0%{scale:1}40%{scale:1.07}100%{scale:1}}
.stage.cine{background:#070C1C;color:#E6ECF8}
.stage.cine::before{
  background:
    radial-gradient(1300px 760px at 78% 24%, color-mix(in srgb,var(--f) 30%,transparent) 0%, transparent 60%),
    radial-gradient(900px 620px at 6% 100%, color-mix(in srgb,var(--f-alt) 24%,transparent) 0%, transparent 60%),
    linear-gradient(180deg,#070C1C,#050915)}
.stage.cine::after{background-image:radial-gradient(rgba(255,255,255,.16) 1px,transparent 1.2px);
  -webkit-mask-image:linear-gradient(180deg,rgba(0,0,0,.35),rgba(0,0,0,.05) 70%,transparent);mask-image:linear-gradient(180deg,rgba(0,0,0,.35),rgba(0,0,0,.05) 70%,transparent)}
.stage.cine .fx-aurora i{opacity:.6}
.fx-3d{position:absolute!important;inset:0;z-index:-1;pointer-events:none;opacity:var(--fx-op,.95)}
.fx-3d canvas{display:block;width:100%;height:100%}
.stage.cine .backdrop::after{background:linear-gradient(90deg,#070C1C 0%,rgba(7,12,28,.94) 30%,rgba(7,12,28,.58) 58%,rgba(7,12,28,.34) 100%)}
.stage.cine .backdrop.fade-l::after{background:linear-gradient(90deg,#070C1C 0%,rgba(7,12,28,.94) 30%,rgba(7,12,28,.58) 58%,rgba(7,12,28,.34) 100%)}
.stage.cine .backdrop.fade-r::after{background:linear-gradient(270deg,#070C1C 0%,rgba(7,12,28,.94) 30%,rgba(7,12,28,.58) 58%,rgba(7,12,28,.34) 100%)}
.stage.cine .backdrop.fade-b::after{background:linear-gradient(180deg,rgba(7,12,28,.35) 0%,rgba(7,12,28,.78) 55%,#070C1C 100%)}
.stage.cine .backdrop.fade-t::after{background:linear-gradient(0deg,rgba(7,12,28,.35) 0%,rgba(7,12,28,.78) 55%,#070C1C 100%)}
.stage.cine .backdrop.soft::after,.stage.cine .backdrop.veil::after,.stage.cine .backdrop.dim::after{background:linear-gradient(180deg,rgba(7,12,28,.72),rgba(7,12,28,.9))}
.stage.cine .backdrop img{filter:saturate(.85) contrast(1.06) brightness(.72)}
.stage.cine .head h1,.stage.cine .hero-title,.stage.cine strong,.stage.cine b,.stage.cine .big-quote,.stage.cine .kpi .v,.stage.cine .card-title{color:#fff}
.stage.cine .head .sub,.stage.cine .hero-sub,.stage.cine .meta-line,.stage.cine p{color:rgba(230,236,248,.82)}
.stage.cine .meta-line b{color:#fff}
.stage.cine .head .eyebrow{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18);color:#fff;box-shadow:none}
.stage.cine .head .eyebrow::before{background:#fff;box-shadow:0 0 0 3px rgba(255,255,255,.18)}
.stage.cine .sec-num{background:linear-gradient(135deg,#fff 0%,color-mix(in srgb,var(--f) 70%,#fff) 100%);-webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 0 40px color-mix(in srgb,var(--f) 60%,transparent))}
.stage.cine .hero-title em,.stage.cine .head h1 em,.stage.cine .big-quote em{background:linear-gradient(92deg,color-mix(in srgb,var(--f) 60%,#fff),color-mix(in srgb,var(--f-alt) 55%,#fff));-webkit-background-clip:text;background-clip:text;color:transparent}
.stage.cine .chip{background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.18);box-shadow:0 1px 0 rgba(255,255,255,.12) inset;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
.stage.cine .chip.solid{background:linear-gradient(135deg,var(--f),var(--f-alt));border-color:transparent}
.stage.cine .card{background:linear-gradient(180deg,rgba(255,255,255,.1),rgba(255,255,255,.05));border-color:rgba(255,255,255,.16);color:#E6ECF8;
  box-shadow:0 1px 0 rgba(255,255,255,.12) inset,0 30px 60px -30px rgba(0,0,0,.8)}
.stage.cine .card.tint{background:linear-gradient(135deg,color-mix(in srgb,var(--f) 26%,rgba(255,255,255,.06)),rgba(255,255,255,.04))}
.stage.cine .card .l,.stage.cine .kpi .l,.stage.cine .note{color:rgba(230,236,248,.7)}
.stage.cine .deck-foot{color:rgba(230,236,248,.72)}
.stage.cine .deck-foot .pg b{background:linear-gradient(120deg,#fff,color-mix(in srgb,var(--f) 50%,#fff));-webkit-background-clip:text;background-clip:text;color:transparent}
.stage.cine .sec-rail span{background:rgba(255,255,255,.16)}
.stage.cine .sec-rail span.done{background:rgba(255,255,255,.38)}
.stage.cine .sec-rail span.on::after{color:#fff}
.stage.cine .source{color:rgba(230,236,248,.6)}
.stage.cine .credit{color:rgba(255,255,255,.55)!important}
.stage.cine .deck-prog i{box-shadow:0 0 22px color-mix(in srgb,var(--f) 80%,transparent)}
.stage.cine .photo .cap{background:rgba(10,16,34,.72);color:#fff;border:1px solid rgba(255,255,255,.16)}
.stage.cine .kbd{background:rgba(255,255,255,.1);color:#fff;border-color:rgba(255,255,255,.2)}
.stage.cine .tag{background:rgba(255,255,255,.12);color:rgba(255,255,255,.85)}
.stage.cine .avatar{box-shadow:0 0 0 2px rgba(255,255,255,.25)}
.stage.cine .divider{background:rgba(255,255,255,.14)}
.stage.cine .icon-circle{background:rgba(255,255,255,.1);color:#fff;box-shadow:0 0 0 1px rgba(255,255,255,.14)}
.stage.cine .icon-circle.solid{background:linear-gradient(135deg,var(--f),var(--f-alt))}
.stage.cine .muted,.stage.cine .faint{color:rgba(230,236,248,.6)}
.pop{animation:npop .55s var(--ease-spring) 1}
/* app-window kit (.app .chrome .app-side .app-top .msg .composer .amenu .art-card .app-panel .know) + guided-click layer (.g-layer .g-cur .g-call .g-ring .g-rip .gsteps) */
.app{--app-bg:#FFFFFF;--app-side:#F9F9F9;--app-line:#E5E5E5;--app-ink:#0D0D0D;--app-muted:#8F8F8F;--app-accent:#0D0D0D;--app-user:#F4F4F4;--app-hover:rgba(0,0,0,.05);
  position:relative;display:flex;background:var(--app-bg);color:var(--app-ink);border:1px solid var(--line-2);border-radius:18px;overflow:hidden;box-shadow:var(--shadow-lg);font-size:17px;line-height:1.5;min-height:0;min-width:0}
.app.claude{--app-bg:#FAF9F5;--app-side:#F0EEE6;--app-line:#E6E3D8;--app-ink:#141413;--app-muted:#87867F;--app-accent:#D97757;--app-user:#F0EEE6;--app-hover:rgba(0,0,0,.05)}
.app.gemini{--app-bg:#FFFFFF;--app-side:#F0F4F9;--app-line:#E1E6EE;--app-ink:#1F1F1F;--app-muted:#5F6368;--app-accent:#1A73E8;--app-user:#F0F4F9}
.app.nblm{--app-bg:#FFFFFF;--app-side:#F7F9FC;--app-line:#E0E4EB;--app-ink:#1F1F1F;--app-muted:#5F6368;--app-accent:#0B57D0;--app-user:#E8EEF8}
.app.pplx{--app-bg:#FCFCF9;--app-side:#F3F3EE;--app-line:#E2E2DA;--app-ink:#13343B;--app-muted:#64645F;--app-accent:#20808D;--app-user:#F3F3EE}
.app.copilot{--app-bg:#FFFFFF;--app-side:#F5F5F5;--app-line:#E3E3E3;--app-ink:#242424;--app-muted:#707070;--app-accent:#0F6CBD;--app-user:#E8F1FB}
.app.hwp{--app-bg:#FFFFFF;--app-side:#F4F6FA;--app-line:#DEE3EC;--app-ink:#1C2430;--app-muted:#6C7889;--app-accent:#2460E0;--app-user:#EEF3FF}
.app.dark{--app-bg:#212121;--app-side:#171717;--app-line:#3A3A3A;--app-ink:#ECECEC;--app-muted:#9B9B9B;--app-user:#303030;--app-hover:rgba(255,255,255,.08)}
.app-side{width:232px;flex:none;background:var(--app-side);border-right:1px solid var(--app-line);padding:14px 12px;display:flex;flex-direction:column;gap:4px;font-size:15px;color:var(--app-ink);min-height:0;overflow:hidden}
.app-side .logo{display:flex;align-items:center;gap:10px;padding:6px 10px 14px;font-weight:700;font-size:16px}
.app-side .logo .ic{width:22px;height:22px}
.app-side .it{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:none}
.app-side .it.on{background:var(--app-hover)}
.app-side .it .ic{width:18px;height:18px;flex:none;color:var(--app-ink);opacity:.8}
.app-side .sec{font-size:13px;color:var(--app-muted);margin:14px 10px 4px;font-weight:600}
.app-side .spacer{flex:1}
.app-side .me{display:flex;align-items:center;gap:10px;padding:8px 10px;font-size:14px;border-top:1px solid var(--app-line);margin-top:6px}
.app-main{flex:1;min-width:0;display:flex;flex-direction:column;position:relative}
.app-top{height:52px;flex:none;display:flex;align-items:center;justify-content:space-between;padding:0 18px;font-size:16px;font-weight:600;color:var(--app-ink)}
.app-top .model{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:10px}
.app-top .model::after,.chev::after{content:'';width:7px;height:7px;border-right:2px solid var(--app-muted);border-bottom:2px solid var(--app-muted);rotate:45deg;margin:-4px 0 0 4px}
.app-top .right{display:flex;gap:10px;align-items:center;font-size:14px;color:var(--app-muted)}
.app-body{flex:1;min-height:0;overflow:hidden;padding:8px 36px 0;display:flex;flex-direction:column}
.app-body .col{max-width:780px;width:100%;margin:0 auto;display:flex;flex-direction:column;gap:18px;min-height:0}
.app-body .col.wide{max-width:none}
.msg{display:flex;gap:14px;align-items:flex-start}
.msg.user{justify-content:flex-end}
.msg.user .bub{background:var(--app-user);border-radius:22px;padding:12px 18px;max-width:78%;color:var(--app-ink)}
.app.claude .msg.user{justify-content:flex-start}
.app.claude .msg.user .bub{border-radius:14px;max-width:88%;display:flex;gap:12px;align-items:flex-start}
.msg .av{width:30px;height:30px;border-radius:50%;flex:none;display:grid;place-items:center;border:1px solid var(--app-line);background:#fff;color:var(--app-ink)}
.msg .av .ic{width:18px;height:18px}
.msg .av.claude{background:var(--app-accent);border-color:transparent;color:#fff}
.msg .txt{flex:1;min-width:0;color:var(--app-ink)}
.msg .txt p{margin:0 0 10px}
.msg .txt p:last-child{margin-bottom:0}
.msg .txt ul,.msg .txt ol{padding-left:24px;list-style:disc;margin:4px 0 10px;display:block}
.msg .txt ol{list-style:decimal}
.msg .txt li{margin:3px 0;padding:0;font-size:inherit;line-height:1.5}
.msg .txt li::before{display:none}
.msg .txt h4{font-size:18px;margin:10px 0 6px;color:var(--app-ink)}
.msg .txt strong,.msg .txt b{color:var(--app-ink)}
.msg .txt table{border-collapse:collapse;font-size:15px;margin:6px 0 10px;width:100%}
.msg .txt th,.msg .txt td{border:1px solid var(--app-line);padding:6px 10px;text-align:left}
.msg .txt th{background:var(--app-hover);font-weight:700}
.msg .txt .code{margin:8px 0}
.msg .acts{display:flex;gap:10px;color:var(--app-muted);margin-top:8px}
.msg .acts .ic{width:16px;height:16px}
.app .tool{display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;border:1px solid var(--app-line);background:var(--app-hover);font-size:14px;color:var(--app-muted);white-space:nowrap}
.app .tool .ic{width:15px;height:15px}
.app .tool.spin .ic{animation:spin 1.1s linear infinite}
.app .tool.done{color:var(--app-ink)}
.app .think{font-size:15px;color:var(--app-muted);display:flex;align-items:center;gap:8px}
.composer{flex:none;margin:10px auto 8px;width:100%;max-width:780px;border:1px solid var(--app-line);border-radius:26px;background:#fff;box-shadow:0 2px 14px rgba(0,0,0,.06);padding:12px 14px 10px;display:flex;flex-direction:column;gap:10px;color:var(--app-ink)}
.app.claude .composer{border-radius:18px;box-shadow:0 4px 18px rgba(0,0,0,.06)}
.app.dark .composer{background:#303030;border-color:#424242}
.composer .inp{font-size:16px;color:var(--app-ink);min-height:24px;padding:0 4px}
.composer .inp.ph{color:var(--app-muted)}
.composer .row{display:flex;align-items:center;justify-content:space-between;gap:8px}
.composer .btns{display:flex;gap:8px;align-items:center;color:var(--app-muted);font-size:14px}
.composer .btn{height:34px;min-width:34px;border-radius:50%;border:1px solid var(--app-line);display:inline-flex;align-items:center;justify-content:center;gap:6px;color:var(--app-ink);padding:0}
.composer .btn.pill{border-radius:999px;padding:0 12px;font-size:14px}
.composer .btn.ghost{border-color:transparent}
.composer .send{width:36px;height:36px;border-radius:50%;background:var(--app-accent);color:#fff;display:grid;place-items:center;border:0;flex:none}
.app.claude .composer .send{border-radius:10px}
.composer .send .ic,.composer .btn .ic{width:18px;height:18px}
.app .disclaimer{text-align:center;font-size:12px;color:var(--app-muted);padding:0 0 8px}
.app .greet{font-family:Georgia,'Times New Roman','Noto Serif KR',serif;font-size:34px;color:var(--app-ink);text-align:center;margin:40px 0 22px;letter-spacing:-.01em}
.app .greet .ic{width:34px;height:34px;color:var(--app-accent);vertical-align:-6px;margin-right:10px}
.app .suggest{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
.app .suggest span{padding:8px 14px;border:1px solid var(--app-line);border-radius:999px;font-size:14px;color:var(--app-muted);background:#fff}
.app-panel{width:46%;flex:none;border-left:1px solid var(--app-line);background:#fff;display:flex;flex-direction:column;min-width:0;min-height:0}
.app-panel.l{border-left:0;border-right:1px solid var(--app-line)}
.app-panel .ph{height:48px;flex:none;display:flex;align-items:center;justify-content:space-between;padding:0 16px;border-bottom:1px solid var(--app-line);font-size:15px;font-weight:600;color:var(--app-ink)}
.app-panel .ph .seg{display:flex;border:1px solid var(--app-line);border-radius:8px;overflow:hidden;font-size:13px;font-weight:600}
.app-panel .ph .seg span{padding:4px 12px;color:var(--app-muted)}
.app-panel .ph .seg span.on{background:var(--app-hover);color:var(--app-ink)}
.app-panel .pb{flex:1;min-height:0;padding:16px;overflow:hidden;position:relative}
.app.claude .app-panel{background:#FFFFFF}
.app{font-size:18px;line-height:1.55;border-radius:16px;border:1px solid rgba(15,35,80,.14)}
.app.v2{flex-direction:column}
.app.v2 .app-row{display:flex;flex:1;min-height:0;min-width:0}
.chrome{flex:none;height:48px;display:flex;align-items:center;gap:14px;padding:0 16px;background:#F0F2F5;border-bottom:1px solid #DDE1E8;color:#5B6372;font-size:14px}
.app.claude .chrome{background:#ECEAE2;border-bottom-color:#DEDBD0}
.chrome .tl{display:flex;gap:8px;flex:none}
.chrome .tl i{width:13px;height:13px;border-radius:50%;background:#FF5F57;box-shadow:0 0 0 .5px rgba(0,0,0,.08) inset}
.chrome .tl i:nth-child(2){background:#FEBC2E}
.chrome .tl i:nth-child(3){background:#28C840}
.chrome .nav{display:flex;gap:10px;color:#A0A6B1;font-size:18px;flex:none}
.chrome .url{flex:1;max-width:560px;margin:0 auto;height:30px;border-radius:9px;background:#fff;border:1px solid #E0E4EA;display:flex;align-items:center;gap:8px;padding:0 12px;color:#30363F;font-size:14px;font-weight:500}
.chrome .url .ic{width:13px;height:13px;color:#6B7280;flex:none}
.chrome .url span{opacity:.55}
.chrome .sp{flex:1}
.chrome .ext{display:flex;gap:12px;color:#A0A6B1}
.chrome .ext i{width:16px;height:16px;border-radius:4px;background:#D6DAE1;display:block}
.app-side{width:262px;padding:12px 10px;font-size:16px;gap:2px}
.app-side .top{display:flex;align-items:center;justify-content:space-between;padding:6px 8px 12px}
.app-side .top .ic{width:22px;height:22px}
.app-side .top .ic.sm{width:18px;height:18px;color:var(--app-muted)}
.app-side .it{padding:9px 10px;border-radius:10px;font-weight:500;gap:11px;font-size:16px}
.app-side .it .ic{width:19px;height:19px;opacity:.9}
.app-side .it.on{background:var(--app-hover);font-weight:600}
.app-side .it.plus{color:var(--app-ink)}
.app-side .it.plus .pc{width:22px;height:22px;border-radius:50%;background:var(--app-accent);color:#fff;display:grid;place-items:center;font-size:16px;font-weight:600;line-height:1}
.app.gpt .app-side .it.plus .pc{background:#0D0D0D}
.app-side .sec{font-size:13px;margin:16px 10px 5px;font-weight:600;letter-spacing:.02em}
.app-side .me{padding:10px 8px 4px;font-size:15px;gap:10px;align-items:center}
.app-side .me .plan{margin-left:auto;font-size:12.5px;padding:3px 9px;border-radius:999px;background:var(--app-hover);color:var(--app-muted);font-weight:700}
.app-side .me .nm{display:flex;flex-direction:column;line-height:1.2}
.app-side .me .nm small{font-size:12.5px;color:var(--app-muted);font-weight:500}
.avatar{width:30px;height:30px;font-size:14px}
.app-main{background:var(--app-bg)}
.app-top{height:56px;padding:0 16px 0 14px;font-size:17px}
.app-top .model{padding:7px 10px;border-radius:10px;font-weight:600;gap:6px;position:relative}
.app-top .model b{font-weight:600;color:var(--app-muted);margin-left:2px}
.app-top .model.g-hit,.app-top .model.open{background:var(--app-hover)}
.app-top .right{gap:8px;font-size:15px}
.app-top .right .btn-top{display:inline-flex;align-items:center;gap:7px;padding:7px 12px;border-radius:999px;border:1px solid var(--app-line);color:var(--app-ink);font-weight:600;font-size:14.5px;background:var(--app-bg)}
.app-top .right .btn-top .ic{width:15px;height:15px}
.app-top .right .dots{font-size:20px;color:var(--app-muted);padding:0 4px;letter-spacing:1px}
.app-top .crumb{display:flex;align-items:center;gap:8px;font-weight:600;color:var(--app-ink)}
.app-top .crumb .ic{width:17px;height:17px;color:var(--app-muted)}
.app-top .crumb .sep{color:var(--app-muted);font-weight:400}
.app-top .crumb .chev::after{margin-left:6px}
.amenu{position:absolute;z-index:8;min-width:300px;background:#fff;border:1px solid var(--app-line);border-radius:14px;box-shadow:0 20px 50px -14px rgba(0,0,0,.28),0 2px 8px rgba(0,0,0,.08);padding:8px;font-size:15px;color:var(--app-ink);
  opacity:0;translate:0 -6px;pointer-events:none;transition:opacity .25s,translate .25s}
.amenu.open{opacity:1;translate:0 0;pointer-events:auto}
.amenu .mh{font-size:12.5px;color:var(--app-muted);padding:8px 12px 4px;font-weight:600}
.amenu .mi{display:flex;align-items:center;gap:12px;padding:9px 12px;border-radius:9px;line-height:1.3}
.amenu .mi .ic{width:18px;height:18px;flex:none;color:var(--app-ink)}
.amenu .mi b{font-weight:600;display:block}
.amenu .mi small{display:block;font-size:13px;color:var(--app-muted)}
.amenu .mi .chk{margin-left:auto;width:18px;height:18px;color:var(--app-ink);opacity:0}
.amenu .mi.sel .chk{opacity:1}
.amenu .mi.g-hit,.amenu .mi.hover{background:var(--app-hover)}
.amenu .mi .pro{margin-left:auto;font-size:11.5px;font-weight:700;padding:2px 7px;border-radius:999px;background:var(--app-hover);color:var(--app-muted)}
.app-body{padding:10px 36px 0}
.app-body .col{max-width:820px;gap:22px}
.msg{gap:16px}
.msg.user .bub{background:var(--app-user);border-radius:24px;padding:13px 20px;max-width:80%;font-size:18px;line-height:1.55}
.app.claude .msg.user .bub{border-radius:16px;max-width:92%;padding:14px 18px}
.msg .av{width:32px;height:32px}
.msg .av .ic{width:19px;height:19px}
.msg .txt{font-size:18px;line-height:1.6}
.msg .txt h4{font-size:19px;margin:12px 0 6px}
.msg .txt ul,.msg .txt ol{padding-left:26px;margin:4px 0 12px}
.msg .txt li{margin:4px 0}
.msg .txt table{font-size:16px}
.msg .txt th,.msg .txt td{padding:7px 12px}
.msg .acts{gap:14px;margin-top:10px;color:var(--app-muted)}
.msg .acts .ic{width:17px;height:17px}
.msg .acts span{display:inline-flex;align-items:center;gap:6px;font-size:13.5px}
.app .tool{font-size:14.5px;padding:7px 13px}
.app .think{font-size:16px;gap:10px}
.app .think .shimmer{background:linear-gradient(90deg,var(--app-muted) 0%,var(--app-ink) 50%,var(--app-muted) 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:shim 1.6s linear infinite;font-weight:500}
html.static .app .think .shimmer{animation:none;color:var(--app-muted)}
.app .mark{background:#FFF3C4;color:#8A5A00;padding:1px 6px;border-radius:5px;font-weight:700}
.app.claude .mark{background:#FDEBD0;color:#9A4A12}
.composer{max-width:820px;border-radius:28px;padding:14px 16px 12px;gap:12px;background:#fff;border:1px solid var(--app-line);box-shadow:0 2px 16px rgba(0,0,0,.06),0 0 0 1px rgba(0,0,0,.02);transition:box-shadow .3s,border-color .3s}
.composer.focus,.composer.g-hit{border-color:#C9CCD2;box-shadow:0 6px 24px rgba(0,0,0,.1),0 0 0 1px rgba(0,0,0,.03)}
.composer .inp{font-size:17.5px;min-height:26px;padding:2px 6px;line-height:1.5;white-space:pre-wrap;word-break:keep-all;overflow-wrap:anywhere}
.composer .inp.typing::after{content:'';display:inline-block;width:2px;height:1.05em;background:var(--app-ink);vertical-align:-.18em;margin-left:2px;animation:caret 1s steps(2) infinite}
.composer .btns{gap:8px;font-size:14.5px}
.composer .btn{height:36px;min-width:36px;gap:7px}
.composer .btn.pill{padding:0 13px;font-size:14.5px;font-weight:500}
.composer .btn.pill.on{background:#DCEBFF;color:#0A5BD3;border-color:transparent;font-weight:600}
.composer .btn.pill .x{margin-left:2px;opacity:.6}
.composer .send{width:38px;height:38px}
.composer .send .ic{width:19px;height:19px}
.composer .send.g-hit{box-shadow:0 0 0 4px color-mix(in srgb,var(--app-accent) 30%,transparent)}
.composer .voice{height:36px;padding:0 12px;border-radius:999px;background:#0D0D0D;color:#fff;display:inline-flex;align-items:center;gap:6px;font-size:13.5px;font-weight:600}
.composer .voice .ic{width:16px;height:16px}
.app.claude .composer{border-radius:18px;background:#fff;border-color:#E6E3D8;box-shadow:0 4px 20px rgba(0,0,0,.06)}
.app.claude .composer .send{border-radius:9px;background:var(--app-accent)}
.app.claude .composer .model{display:inline-flex;align-items:center;gap:6px;font-size:14.5px;font-weight:600;color:var(--app-ink);padding:0 10px;height:36px;border-radius:9px}
.app.claude .composer .model.g-hit,.app.claude .composer .model.open{background:var(--app-hover)}
.app .disclaimer{font-size:12.5px;padding:0 0 10px}
.app .greet{font-size:38px;margin:46px 0 26px}
.app.claude{--app-side:#F3F1EA;--app-line:#E6E3D8;--app-hover:rgba(0,0,0,.055)}
.app.claude .app-side .it.plus .pc{background:var(--app-accent)}
.app.claude .app-side .it .ic{color:#5E5D59}
.app.claude .msg .av.claude{background:var(--app-accent);color:#fff}
.app.claude .msg .av.user{background:#5E5D59;color:#fff;border:0;font-size:13px;font-weight:700}
.app.claude .msg.user .bub .av{width:28px;height:28px;border-radius:50%;background:#5E5D59;color:#fff;display:grid;place-items:center;font-size:13px;font-weight:700;flex:none}
.art-card{display:flex;align-items:center;gap:14px;padding:12px 14px;border:1px solid var(--app-line);border-radius:12px;background:#fff;max-width:420px;margin:6px 0 2px;box-shadow:0 2px 8px rgba(0,0,0,.05)}
.art-card .ai{width:40px;height:40px;border-radius:9px;background:var(--app-hover);display:grid;place-items:center;flex:none}
.art-card .ai .ic{width:20px;height:20px}
.art-card b{display:block;font-size:16px;line-height:1.25}
.art-card small{display:block;color:var(--app-muted);font-size:13px;margin-top:2px}
.art-card.g-hit{border-color:var(--app-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--app-accent) 20%,transparent)}
.app-panel{width:46%;background:#fff}
.app-panel .ph{height:52px;padding:0 16px;font-size:15.5px}
.app-panel .ph .seg{border-radius:9px;font-size:13.5px}
.app-panel .ph .seg span{padding:5px 13px}
.app-panel .ph .acts{display:flex;align-items:center;gap:10px;color:var(--app-muted)}
.app-panel .ph .acts .ic{width:17px;height:17px}
.app-panel .ph .acts .pub{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;background:var(--app-accent);color:#fff;font-size:13.5px;font-weight:600}
.app-panel .pb{padding:18px}
.know{display:flex;flex-direction:column;gap:12px;font-size:15px}
.know .kh{display:flex;align-items:center;justify-content:space-between;font-weight:600;font-size:15px}
.know .kh .ic{width:16px;height:16px;color:var(--app-muted)}
.know .cap{display:flex;flex-direction:column;gap:6px}
.know .cap .bar{height:7px;background:var(--app-hover)}
.know .cap .bar>i{background:var(--app-accent);box-shadow:none}
.know .cap .bar>i::after{display:none}
.know .file{display:flex;align-items:center;gap:12px;padding:10px 12px;border:1px solid var(--app-line);border-radius:10px;background:#fff}
.know .file .fi{width:34px;height:34px;border-radius:8px;background:#FDEBD0;color:#C2410C;display:grid;place-items:center;flex:none;font-size:11px;font-weight:800}
.know .file b{display:block;font-size:15px;line-height:1.25}
.know .file small{color:var(--app-muted);font-size:12.5px}
.know .file .ok{margin-left:auto;width:18px;height:18px;color:#15A34A}
.know .file.g-hit{border-color:var(--app-accent)}
.know .drop{border:1.5px dashed var(--app-line);border-radius:10px;padding:12px;text-align:center;color:var(--app-muted);font-size:13.5px}
.g-layer{position:absolute;inset:0;z-index:40;pointer-events:none;overflow:visible}
.g-cur{position:absolute;width:30px;height:30px;translate:-4px -3px;opacity:0;transition:left .78s cubic-bezier(.3,.9,.3,1),top .78s cubic-bezier(.3,.9,.3,1),opacity .4s,scale .15s;filter:drop-shadow(0 4px 8px rgba(0,0,0,.35));z-index:3}
.g-cur.show{opacity:1}
.g-cur.dn{scale:.82}
.g-cur.bye{opacity:0}
.g-rip{position:absolute;width:14px;height:14px;border-radius:50%;translate:-50% -50%;border:3px solid var(--f);animation:grip .65s ease-out forwards;z-index:2}
@keyframes grip{from{scale:.4;opacity:.9}to{scale:4;opacity:0}}
.g-ring{position:absolute;border-radius:12px;box-shadow:0 0 0 3px var(--f),0 0 0 8px color-mix(in srgb,var(--f) 22%,transparent);opacity:0;transition:opacity .35s;z-index:1}
.g-ring.in{opacity:1;animation:gring 2.2s ease-out 1}
@keyframes gring{0%{box-shadow:0 0 0 3px var(--f),0 0 0 4px color-mix(in srgb,var(--f) 60%,transparent)}100%{box-shadow:0 0 0 3px var(--f),0 0 0 14px transparent}}
.g-call{position:absolute;display:inline-flex;align-items:center;gap:9px;padding:7px 14px 7px 7px;border-radius:999px;background:var(--ink);color:#fff;font-size:16.5px;font-weight:700;white-space:nowrap;
  box-shadow:0 14px 30px -10px rgba(15,35,80,.55),0 0 0 1px rgba(255,255,255,.35) inset;opacity:0;scale:.86;transition:opacity .4s var(--ease-out),scale .5s var(--ease-spring);z-index:4}
.g-call.in{opacity:1;scale:1}
.g-call.out,.g-ring.out{opacity:0!important;transition:opacity .45s}
.g-call b{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--f),var(--f-alt));display:grid;place-items:center;font-size:15px;font-weight:800;color:#fff;flex:none}
.g-call.p-r::before,.g-call.p-l::before,.g-call.p-t::before,.g-call.p-b::before{content:'';position:absolute;width:12px;height:12px;background:var(--ink);rotate:45deg}
.g-call.p-r::before{left:-5px;top:50%;translate:0 -50%}
.g-call.p-l::before{right:-5px;top:50%;translate:0 -50%}
.g-call.p-t::before{bottom:-5px;left:50%;translate:-50% 0}
.g-call.p-b::before{top:-5px;left:50%;translate:-50% 0}
.g-hit{position:relative}
.g-click{animation:gclick .36s ease-out 1}
.gsteps{display:flex;flex-direction:column;gap:7px}
.gsteps li{display:flex;align-items:center;gap:12px;padding:9px 14px;border-radius:13px;border:1px solid var(--line);background:rgba(255,255,255,.75);font-size:17.5px;line-height:1.3;color:var(--text);transition:all .45s var(--ease-out);position:relative;overflow:hidden}
.gsteps li::before{display:none}
.gsteps li .n{width:30px;height:30px;border-radius:50%;background:var(--card-3);color:var(--muted);display:grid;place-items:center;font-weight:800;font-size:16px;flex:none;transition:all .4s}
.gsteps li .t{flex:1;min-width:0}
.gsteps li .t small{display:block;font-size:13.5px;color:var(--muted);margin-top:1px;font-weight:500}
.gsteps li .k{font-size:13.5px;color:var(--faint);font-weight:600;white-space:nowrap}
.gsteps li.on{border-color:color-mix(in srgb,var(--f) 45%,var(--line));background:linear-gradient(90deg,color-mix(in srgb,var(--f) 12%,#fff),#fff);box-shadow:0 14px 30px -18px color-mix(in srgb,var(--f) 60%,transparent);translate:6px 0}
.gsteps li.on .n{background:linear-gradient(135deg,var(--f),var(--f-alt));color:#fff;box-shadow:0 6px 14px -6px color-mix(in srgb,var(--f) 70%,transparent)}
.gsteps li.on .t b{color:var(--f)}
.gsteps li.done{opacity:.78}
.gsteps li.done .n{background:var(--ok-100);color:var(--ok)}
.gsteps li.done .n::before{content:'✓'}
.gsteps li.done .n span{display:none}
html.static .gsteps li{translate:0 0}
.g-note{display:inline-flex;align-items:center;gap:6px;padding:3px 9px;border-radius:7px;background:color-mix(in srgb,var(--f) 10%,#fff);color:var(--f);font-size:13px;font-weight:700;border:1px dashed color-mix(in srgb,var(--f) 40%,transparent)}
.gx{opacity:0;translate:0 12px;transition:opacity .5s var(--ease-out),translate .5s var(--ease-out)}
.gx.in{opacity:1;translate:0 0}
@keyframes shim{from{background-position:200% 0}to{background-position:-200% 0}}
@keyframes grip{from{scale:.4;opacity:.9}to{scale:4;opacity:0}}
@keyframes gring{0%{box-shadow:0 0 0 3px var(--f),0 0 0 4px color-mix(in srgb,var(--f) 60%,transparent)}100%{box-shadow:0 0 0 3px var(--f),0 0 0 14px transparent}}
@keyframes gclick{0%{scale:1}40%{scale:.96}100%{scale:1}}
@keyframes ring{0%{scale:.55;opacity:1}100%{scale:2.1;opacity:0}}
@keyframes dot{0%,80%,100%{opacity:.25;translate:0 0}40%{opacity:1;translate:0 -4px}}
@keyframes caret{50%{opacity:0}}
html.static .tilt{transform:none!important}

/* ===== device kit (ported from the Qpresen IR deck) — frames for real-looking screens ===== */
.dv-phone{--pw:300px;position:relative;width:var(--pw);padding:calc(var(--pw)*.034);border-radius:calc(var(--pw)*.17);background:linear-gradient(150deg,#39425F 0%,#0C1124 34%,#151B33 70%,#2B3352 100%);box-shadow:inset 0 0 0 1.5px #4A5478,inset 0 0 0 4px #0A0E1D,0 34px 80px rgba(24,32,110,.26),0 10px 22px rgba(24,32,110,.16)}
.dv-phone::before{content:'';position:absolute;right:-3px;top:22%;width:3px;height:12%;border-radius:0 3px 3px 0;background:#2C3454}
.dv-phone::after{content:'';position:absolute;left:-3px;top:18%;width:3px;height:7%;border-radius:3px 0 0 3px;background:#2C3454}
.dv-phone .scr{position:relative;border-radius:calc(var(--pw)*.135);overflow:hidden;background:#fff;aspect-ratio:640/1571;color:var(--ink)}
.dv-phone .scr>img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
.dv-phone .cam{position:absolute;top:calc(var(--pw)*.035);left:50%;translate:-50% 0;width:calc(var(--pw)*.034);height:calc(var(--pw)*.034);border-radius:50%;background:#0A0E1D;box-shadow:0 0 0 2px #1B2240;z-index:4}
.dv-phone.tilt3d{transform:perspective(1600px) rotateY(var(--ry,-14deg)) rotateX(var(--rx,6deg)) rotateZ(var(--rz,2deg));transition:transform .8s var(--ease)}
.dv-browser{border-radius:18px;overflow:hidden;background:var(--card);box-shadow:var(--shadow-lg);border:1px solid var(--line)}
.dv-browser .bar{height:38px;display:flex;align-items:center;gap:8px;padding:0 14px;background:var(--card-2);border-bottom:1px solid var(--line)}
.dv-browser .bar i{width:11px;height:11px;border-radius:50%;background:#FF5F57}
.dv-browser .bar i:nth-child(2){background:#FEBC2E}
.dv-browser .bar i:nth-child(3){background:#28C840}
.dv-browser .bar .url{margin-left:12px;flex:1;height:24px;border-radius:7px;background:var(--card);border:1px solid var(--line);font-size:14px;color:var(--muted);display:flex;align-items:center;padding:0 12px;gap:6px;font-weight:600}
.dv-browser .vw{position:relative;overflow:hidden}
.dv-browser .vw>img{width:100%;display:block}
.dv-screen{position:relative;border-radius:16px;overflow:hidden;background:#0A1030;box-shadow:0 0 0 10px #10162E,0 0 0 11px #2A3256,var(--shadow-xl);color:#fff}
.dv-stand{width:180px;height:16px;margin:16px auto 0;border-radius:0 0 12px 12px;background:linear-gradient(#D8DEEA,#C3CBDB)}
.dv-hud{font-family:var(--font);color:#9BE15D;background:#050A06;border-radius:18px;padding:18px 22px;box-shadow:inset 0 0 0 1px #1E3A1A,0 20px 50px rgba(0,0,0,.25);text-shadow:0 0 8px rgba(155,225,93,.45)}
.dv-glasses{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:34px;padding:16px 22px 22px;border-radius:38% 38% 44% 44% / 30% 30% 50% 50%;background:linear-gradient(180deg,#1B2235,#0B0F1E);box-shadow:inset 0 0 0 2px #3A4466,0 24px 60px rgba(0,0,0,.3)}
.dv-glasses::before{content:'';position:absolute;left:50%;top:14px;width:34px;height:14px;translate:-50% 0;border-radius:0 0 12px 12px;background:#2C3454}
.dv-glasses>.lens{min-height:220px;border-radius:26% 26% 36% 36% / 24% 24% 44% 44%;background:#050A06;color:#9BE15D;padding:18px 20px;box-shadow:inset 0 0 0 1px #1E3A1A;text-shadow:0 0 8px rgba(155,225,93,.45);font-size:15px;line-height:1.5}

/* ===== carousel: [data-carousel] host, children .ci get data-pos (0=front) — fan/stack layouts ===== */
.carousel{position:relative;perspective:1600px;transform-style:preserve-3d}
.carousel>.ci{position:absolute;left:50%;top:50%;width:var(--cw,440px);aspect-ratio:16/9;margin:calc(var(--cw,440px)*-.28) 0 0 calc(var(--cw,440px)*-.5);border-radius:14px;overflow:hidden;background:var(--card);box-shadow:0 2px 6px rgba(16,24,64,.10),0 26px 60px rgba(30,40,120,.22);transition:transform .75s var(--ease),opacity .6s var(--ease),filter .6s;cursor:pointer;transform-style:preserve-3d}
.carousel>.ci>img{width:100%;height:100%;object-fit:cover;display:block}
.carousel>.ci::after{content:'';position:absolute;inset:0;background:linear-gradient(125deg,rgba(255,255,255,.28) 0%,rgba(255,255,255,0) 38%);pointer-events:none}
.carousel>.ci[data-pos="0"]{transform:translate3d(0,34px,0) scale(1);z-index:6}
.carousel>.ci[data-pos="1"]{transform:translate3d(38%,0,-60px) rotateY(-24deg) rotateZ(6deg) scale(.8);z-index:5}
.carousel>.ci[data-pos="2"]{transform:translate3d(6%,-26%,-140px) scale(.73);z-index:3;opacity:.72;filter:saturate(.8)}
.carousel>.ci[data-pos="3"]{transform:translate3d(-38%,0,-60px) rotateY(24deg) rotateZ(-6deg) scale(.8);z-index:5}
.carousel>.ci[data-pos="4"],.carousel>.ci[data-pos="5"],.carousel>.ci[data-pos="6"],.carousel>.ci[data-pos="7"]{transform:translate3d(0,-40%,-240px) scale(.6);opacity:0;z-index:1}
.carousel.stack>.ci[data-pos="1"]{transform:translate3d(6%,-10%,-60px) scale(.92);z-index:5;opacity:.9}
.carousel.stack>.ci[data-pos="2"]{transform:translate3d(12%,-20%,-120px) scale(.84);z-index:4;opacity:.7}
.carousel.stack>.ci[data-pos="3"]{transform:translate3d(18%,-30%,-180px) scale(.76);z-index:3;opacity:.5}
.carousel>.ci .ci-tag{position:absolute;left:12px;bottom:12px;padding:5px 10px;border-radius:999px;background:rgba(10,14,30,.72);color:#fff;font-size:13px;font-weight:700;opacity:0;transition:opacity .4s}
.carousel>.ci[data-pos="0"] .ci-tag{opacity:1}
.carousel>.ci.flash::before{content:'';position:absolute;inset:0;background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.55) 50%,transparent 70%);transform:translateX(-120%);animation:ciflash 1s var(--ease) forwards;z-index:2;pointer-events:none}
@keyframes ciflash{to{transform:translateX(120%)}}
.car-dots{display:flex;gap:7px;justify-content:center;align-items:center}
.car-dots i{width:7px;height:7px;border-radius:999px;background:var(--line-2);transition:all .35s}
.car-dots i.on{width:22px;background:var(--qg)}
html.static .carousel>.ci{transition:none}

/* ===== word cycler: [data-words='["…","…"]'] (type|fade) + waveform bars [data-wave] ===== */
[data-words]{display:inline-block;min-width:1ch}
[data-words].typing::after{content:'';display:inline-block;width:2px;height:.95em;margin-left:2px;vertical-align:-.12em;background:currentColor;animation:caret 1s steps(2) infinite}
[data-words].fade-out{opacity:0;transition:opacity .25s}
[data-words].fade-in{opacity:1;transition:opacity .35s}
.wave{display:flex;align-items:center;gap:3px;height:28px}
.wave i{width:3px;border-radius:2px;background:currentColor;height:var(--h,40%);opacity:.85;animation:wavebar 1.1s ease-in-out infinite alternate;animation-delay:var(--dl,0ms)}
.wave.mute i{animation-play-state:paused;opacity:.35}
@keyframes wavebar{0%{transform:scaleY(.35)}100%{transform:scaleY(1)}}
html.static .wave i{animation:none}

/* ===== packets along an SVG path: <path data-packets="3" data-dur="3s"> (fxJs adds circles with animateMotion) ===== */
.packet{fill:var(--f);filter:drop-shadow(0 0 6px color-mix(in srgb,var(--f) 70%,transparent))}

/* ===== panel switch: [data-switch="#cycleHost"] container — children follow the host's cycle index (.on) ===== */
[data-switch]>*{display:none}
[data-switch]>.on{display:block}
[data-switch].fade>*{display:block;position:absolute;inset:0;opacity:0;transition:opacity .45s var(--ease);pointer-events:none}
[data-switch].fade>.on{opacity:1;pointer-events:auto}

/* ===== 3D scene layer (Three.js scene kit: terrain / network / cubes / fireflies) ===== */
.fx-3d{position:fixed!important;inset:0;z-index:1;pointer-events:none;opacity:var(--fx-op,.95)} /* fixed = full stage even when mounted inside .body after a backdrop */
.fx-3d canvas{display:block;width:100%;height:100%}

/* ===== small status helpers (from the IR deck): .live dot, .floaty hover-float, .status pill ===== */
.live{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:800;letter-spacing:.14em;color:#2BD67B}
.live::before{content:'';width:8px;height:8px;border-radius:50%;background:#2BD67B;box-shadow:0 0 0 0 rgba(43,214,123,.6);animation:livedot 1.6s ease-out infinite}
@keyframes livedot{70%{box-shadow:0 0 0 9px rgba(43,214,123,0)}100%{box-shadow:0 0 0 0 rgba(43,214,123,0)}}
.floaty{animation:floaty 5s ease-in-out infinite}
@keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
html.static .floaty,html.static .live::before{animation:none}

/* ---- connectors (data-connect) ---- */
svg.connect{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:2}
svg.connect .cn-flow{animation:cn-flow 1.1s linear infinite}
@keyframes cn-flow{to{stroke-dashoffset:-19}}
svg.connect .cn-label{font-size:14px;font-weight:700;fill:var(--ink);font-family:var(--font)}
svg.connect .cn-lbg{fill:var(--card,#fff);stroke:var(--line);stroke-width:1}
.stage.cine svg.connect .cn-lbg{fill:rgba(10,18,36,.85);stroke:rgba(255,255,255,.18)}.stage.cine svg.connect .cn-label{fill:#fff}

/* ---- maps (data-map) ---- */
.map{position:relative;display:block}.map svg.mp{width:100%;height:100%;display:block;overflow:hidden}
.mp-r{fill:var(--map-land,#E3E9F3);stroke:var(--map-line,#fff);stroke-width:1.2;stroke-linejoin:round;transition:fill .5s}
.mp-r.hi{fill:color-mix(in srgb,var(--f) 58%,#fff)}.mp-r.dim{opacity:.55}
.stage.cine .mp-r{fill:rgba(255,255,255,.1);stroke:rgba(255,255,255,.22)}.stage.cine .mp-r.hi{fill:color-mix(in srgb,var(--f) 70%,transparent)}
.mp-rl{font-family:var(--font);font-weight:700;font-size:13px;fill:var(--muted);pointer-events:none}.mp-rl.hi{fill:var(--f-ink)}.stage.cine .mp-rl{fill:rgba(255,255,255,.7)}.stage.cine .mp-rl.hi{fill:#fff}
.mp-m .mp-dot{fill:var(--f);stroke:#fff;stroke-width:2}.mp-m .mp-ring{fill:var(--f);opacity:.25;transform-origin:center;transform-box:fill-box;animation:mp-pulse 2.2s ease-out infinite}
.mp-m.f-rose .mp-dot,.mp-m.f-rose .mp-ring{fill:var(--rose)}.mp-m.f-amber .mp-dot,.mp-m.f-amber .mp-ring{fill:var(--amber)}.mp-m.f-teal .mp-dot,.mp-m.f-teal .mp-ring{fill:var(--teal)}.mp-m.f-violet .mp-dot,.mp-m.f-violet .mp-ring{fill:var(--violet)}.mp-m.f-azure .mp-dot,.mp-m.f-azure .mp-ring{fill:var(--azure)}.mp-m.f-ok .mp-dot,.mp-m.f-ok .mp-ring{fill:var(--ok)}.mp-m.f-navy .mp-dot,.mp-m.f-navy .mp-ring{fill:var(--navy)}
.mp-m .mp-lb{font-family:var(--font);font-weight:800;fill:var(--ink)}.mp-m .mp-lbg{fill:var(--card,#fff);stroke:var(--line);stroke-width:1}
.stage.cine .mp-m .mp-lb{fill:#fff}.stage.cine .mp-m .mp-lbg{fill:rgba(10,18,36,.82);stroke:rgba(255,255,255,.18)}
.mp-m.pre{opacity:0;transform:translate(0,6px)}.mp-m{transition:opacity .5s,transform .5s}
.mp-route{fill:none;stroke:var(--f);stroke-linecap:round;opacity:.9}.mp-route.flow{stroke-dasharray:10 9;animation:cn-flow 1.1s linear infinite}
.stage.cine .mp-route{stroke:#fff;opacity:.75}
@keyframes mp-pulse{0%{transform:scale(.6);opacity:.45}100%{transform:scale(1.9);opacity:0}}
`;
