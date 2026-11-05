import type { DeckSpec, Notes } from './types.ts';
import { esc, pad, plain } from './util.ts';
import { themeCss } from './theme.ts';

export interface PlayerInput {
  spec: DeckSpec; pages: string[]; titles: string[]; notes: Notes[]; sections: [string, number, number][]; fontCss: string; thumbs?: string[];
}

/** Single-file deck player: dock, progress, overview, notes+timer, help, hash nav, static mode, theme, blackout. */
export function renderPlayer(inp: PlayerInput): string {
  const { spec } = inp; const m = spec.meta; const N = inp.pages.length;
  const theme = m.theme || 'signature-white';
  const data = { total: N, titles: inp.titles, notes: inp.notes, sections: inp.sections, font: inp.fontCss, pages: inp.pages, thumbs: inp.thumbs || [], types: spec.slides.map(s => s.body?.type || ''), meta: { title: m.title, subtitle: m.subtitle || '', presenter: m.presenter?.name || '', date: m.date || '', event: m.event || '' } };
  const json = JSON.stringify(data).replace(/<\//g, '<\\/').replace(/<!--/g, '<\\!--');
  const title = esc(m.title);
  return `<!doctype html>
<html lang="${m.lang || 'ko'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="qp-deck-engine" content="1.0">
<meta name="qp-deck-pages" content="${N}">
<title>${title}</title>
${inp.fontCss}
<style>${themeCss(theme, m.brand)}
*{box-sizing:border-box}
html,body{margin:0;height:100%;overflow:hidden;background:var(--bg-2);font-family:var(--font);color:var(--ink);word-break:keep-all}
#stage{position:fixed;inset:0;transition:right .35s cubic-bezier(.16,1,.3,1)}
body.notes #stage{right:440px}
#stage iframe{position:absolute;inset:0;width:100%;height:100%;border:0;background:var(--bg-2);opacity:0;transition:opacity .45s ease}
#stage iframe.on{opacity:1;z-index:1}
.dock{position:fixed;left:50%;bottom:14px;translate:-50% 0;display:flex;align-items:center;gap:6px;padding:6px;border-radius:999px;background:color-mix(in srgb,var(--card) 90%,transparent);backdrop-filter:blur(14px);box-shadow:0 12px 34px rgba(20,30,90,.18),0 0 0 1px rgba(20,30,90,.06);z-index:30;opacity:0;transition:opacity .35s}
body.notes .dock{left:calc(50% - 220px)}
.dock.show,.dock:hover{opacity:1}
.dock button{appearance:none;border:0;background:transparent;font:inherit;font-weight:700;font-size:14px;color:var(--ink);height:36px;min-width:36px;padding:0 12px;border-radius:999px;cursor:pointer}
.dock button:hover{background:var(--card-3)}
.dock .pg{font-variant-numeric:tabular-nums;padding:0 10px;font-size:14px;font-weight:700;color:var(--muted);white-space:nowrap;max-width:420px;overflow:hidden;text-overflow:ellipsis}
.dock .pg b{font-size:16px;color:var(--brand)}
.bar{position:fixed;left:0;top:0;height:3px;background:var(--qg);z-index:31;transition:width .5s cubic-bezier(.16,1,.3,1)}
#ov{position:fixed;inset:0;z-index:40;background:color-mix(in srgb,var(--bg-2) 96%,transparent);backdrop-filter:blur(10px);overflow:auto;padding:36px 48px 60px;display:none}
#ov.on{display:block}
#ov h2{margin:0;font-size:28px;letter-spacing:-.02em}#ov h2 em{font-style:normal;color:var(--brand)}
#ov .kb{margin:6px 0 10px;color:var(--muted);font-size:14px}
#ov h3{margin:26px 0 12px;font-size:17px;color:var(--muted);letter-spacing:.02em}
#ov .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:18px}
#ov a{display:block;text-decoration:none;color:var(--ink);background:var(--card);border-radius:14px;overflow:hidden;box-shadow:0 6px 20px rgba(20,30,90,.08);border:2px solid transparent;transition:transform .25s,border-color .25s}
#ov a:hover{transform:translateY(-3px);border-color:var(--brand)}
#ov a.cur{border-color:var(--violet)}
#ov img,#ov .th{width:100%;aspect-ratio:16/9;display:block;object-fit:cover;background:var(--card-3)}
#ov .th{display:flex;flex-direction:column;justify-content:flex-end;padding:14px 16px;gap:6px;background:linear-gradient(135deg,var(--card-2),var(--card-3));position:relative}
#ov .th::before{content:'';position:absolute;left:0;top:0;right:0;height:5px;background:var(--qg)}
#ov .th b{font-size:12px;color:var(--brand);letter-spacing:.12em}#ov .th span{font-size:15px;font-weight:700;line-height:1.3;color:var(--ink)}
#ov a .t{display:block;padding:9px 12px 11px;font-size:14px;font-weight:700;line-height:1.35}
#ov a .t b{color:var(--brand);margin-right:6px}
#notes{position:fixed;top:0;right:0;bottom:0;width:440px;background:var(--card);border-left:1px solid var(--line);z-index:35;display:none;flex-direction:column}
body.notes #notes{display:flex}
#notes .hd{padding:20px 24px 14px;border-bottom:1px solid var(--line)}
#notes .hd .row{display:flex;justify-content:space-between;align-items:center}
#notes .clock{font-size:30px;font-weight:800;font-variant-numeric:tabular-nums;letter-spacing:-.02em}
#notes .clock small{font-size:14px;color:var(--muted);font-weight:700;margin-left:6px}
#notes .hd button{appearance:none;border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;font:inherit;font-size:13px;font-weight:700;padding:6px 12px;cursor:pointer}
#notes .cur{margin-top:12px;font-size:13px;font-weight:800;letter-spacing:.14em;color:var(--brand)}
#notes .ttl{font-size:18px;font-weight:800;margin-top:4px;line-height:1.35}
#notes .tm{font-size:13px;color:var(--muted);margin-top:4px}
#notes .bd{padding:18px 24px;overflow:auto;flex:1;font-size:17px;line-height:1.85;white-space:pre-wrap}
#notes .nx{padding:14px 24px;border-top:1px solid var(--line);font-size:14px;color:var(--muted)}
#notes .nx b{color:var(--ink)}
#help{position:fixed;left:50%;top:50%;translate:-50% -50%;z-index:50;background:var(--card);border-radius:18px;padding:26px 30px;box-shadow:0 30px 80px rgba(20,30,90,.25);display:none;font-size:15px;line-height:2}
#help.on{display:block}
#help kbd{display:inline-block;min-width:28px;text-align:center;padding:0 7px;border:1px solid var(--line-2);border-bottom-width:2px;border-radius:6px;font:inherit;font-weight:700;font-size:13px;margin-right:8px}
#black{position:fixed;inset:0;background:#000;z-index:60;display:none}#black.on{display:block}
#hint{position:fixed;right:16px;top:14px;z-index:20;font-size:12px;color:var(--muted);background:var(--card);padding:6px 10px;border-radius:999px;border:1px solid var(--line);opacity:1;transition:opacity .6s}
#hint.off{opacity:0;pointer-events:none}
</style>
</head>
<body>
<div class="bar" id="bar"></div>
<div id="stage"><iframe id="fa" title="${title}" allow="fullscreen"></iframe><iframe id="fb" title="${title}" allow="fullscreen"></iframe></div>
<div id="hint">← → 이동 · H 목차 · N 노트 · F 전체화면 · B 검은 화면 · T 테마 · ? 도움말</div>
<div class="dock" id="dock">
  <button id="bPrev" title="이전 (←)">‹</button><div class="pg" id="pg"><b>01</b> / ${pad(N)}</div><button id="bNext" title="다음 (→)">›</button>
  <button id="bOv" title="목차 (H)">목차</button><button id="bNotes" title="발표자 노트 (N)">노트</button><button id="bFs" title="전체화면 (F)">전체화면</button><button id="bHelp" title="도움말 (?)">?</button>
</div>
<div id="ov"><h2>${title}${m.subtitle ? ` <em>${esc(m.subtitle)}</em>` : ''}</h2><div class="kb">← → 이동 · H 목차 · N 발표자 노트 · F 전체화면 · B 검은 화면 · T 다크 테마 · 주소 끝 #s07 바로가기 · ?static=1 정적(인쇄) 모드</div><div id="ovg"></div></div>
<aside id="notes"><div class="hd"><div class="row"><div class="clock" id="clock">00:00<small>경과</small></div><button id="bReset">타이머 초기화</button></div><div class="cur" id="ncur">SLIDE 01 / ${pad(N)}</div><div class="ttl" id="nttl"></div><div class="tm" id="ntm"></div></div><div class="bd" id="nbd"></div><div class="nx" id="nnx"></div></aside>
<div id="help"><b>키보드</b><br><kbd>→</kbd><kbd>Space</kbd>다음 · <kbd>←</kbd>이전 · <kbd>Home</kbd>/<kbd>End</kbd>처음·끝<br><kbd>H</kbd>목차 · <kbd>N</kbd>발표자 노트(+경과 시간) · <kbd>F</kbd>전체화면 · <kbd>T</kbd>다크 테마 · <kbd>B</kbd>검은 화면<br><kbd>Esc</kbd>닫기 · 주소 끝 <b>#s07</b> 바로가기 · <b>?static=1</b> 애니메이션 없이 완성 화면</div>
<div id="black"></div>
<script id="qp-data" type="application/json">${json}</script>
<script>
(function(){
  'use strict';
  var D=JSON.parse(document.getElementById('qp-data').textContent);
  var N=D.total, cur=0, fa=document.getElementById('fa'), fb=document.getElementById('fb'), front=fa, back=fb, loading=0;
  var isStatic=/[?&]static=1/.test(location.search);
  var theme='light'; try{ if(localStorage.getItem('deck-theme')==='dark') theme='dark'; }catch(e){}
  function pad(n){return (n<10?'0':'')+n}
  function src(n){ var h=D.pages[n-1].split('__QP_FONT__').join(D.font); if(theme==='dark') h=h.replace('<html lang=','<html data-theme="dark" lang='); return h; }
  var dock=document.getElementById('dock'), dockT=null;
  function poke(){ dock.classList.add('show'); clearTimeout(dockT); dockT=setTimeout(function(){dock.classList.remove('show')},2200); }
  function ui(){
    document.getElementById('pg').innerHTML='<b>'+pad(cur)+'</b> / '+pad(N)+' · '+D.titles[cur-1].replace(/</g,'&lt;');
    document.getElementById('bar').style.width=(cur/N*100)+'%';
    document.title=pad(cur)+' · '+D.titles[cur-1]+' — '+D.meta.title;
    var nt=D.notes[cur-1]||{s:'',t:0};
    document.getElementById('ncur').textContent='SLIDE '+pad(cur)+' / '+pad(N);
    document.getElementById('nttl').textContent=D.titles[cur-1];
    document.getElementById('ntm').textContent=nt.t?('권장 '+nt.t+'초'):'';
    document.getElementById('nbd').textContent=nt.s||'(노트 없음)';
    document.getElementById('nnx').innerHTML=cur<N?'다음 · <b>'+pad(cur+1)+' '+D.titles[cur].replace(/</g,'&lt;')+'</b>':'마지막 장';
    [].forEach.call(document.querySelectorAll('#ov a'),function(a,i){a.classList.toggle('cur',i===cur-1)});
  }
  function go(n){
    if(n==='index'){ toggleOv(true); return; }
    n=Number(n); if(!(n>=1&&n<=N)||n===cur) return;
    cur=n; toggleOv(false); ui(); try{ if(location.hash!=='#s'+pad(n)) history.replaceState(null,'','#s'+pad(n)); }catch(e){} /* srcdoc/about:blank embeds forbid history updates */
    var token=++loading, b=back;
    b.onload=function(){ if(token!==loading) return; b.classList.add('on'); front.classList.remove('on'); back=front; front=b; try{b.contentWindow.focus()}catch(e){} setTimeout(function(){ if(token===loading){ back.removeAttribute('srcdoc'); back.onload=null; } },700); };
    b.srcdoc=src(n);
    try{ parent.postMessage({qpDeck:true,kind:'page',value:n,total:N},'*'); }catch(e){}
  }
  function fullscreen(){ var r=document.fullscreenElement?(document.exitFullscreen&&document.exitFullscreen()):(document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen()); if(r&&r.catch) r.catch(function(){}); }
  function toggleOv(on){ var o=document.getElementById('ov'); o.classList.toggle('on',on==null?!o.classList.contains('on'):on); }
  function toggleNotes(){ document.body.classList.toggle('notes'); startClock(); }
  var t0=null, clk=null;
  function startClock(){ if(t0==null) t0=Date.now(); if(clk) return; clk=setInterval(function(){ var s=Math.floor((Date.now()-t0)/1000); document.getElementById('clock').innerHTML=pad(Math.floor(s/60))+':'+pad(s%60)+'<small>경과</small>'; },500); }
  function key(k){
    if(k==='n'||k==='N') toggleNotes();
    else if(k==='h'||k==='H') toggleOv();
    else if(k==='f'||k==='F') fullscreen();
    else if(k==='b'||k==='B'||k==='.') document.getElementById('black').classList.toggle('on');
    else if(k==='Escape'){ toggleOv(false); document.getElementById('help').classList.remove('on'); document.getElementById('black').classList.remove('on'); }
    else if(k==='?') document.getElementById('help').classList.toggle('on');
  }
  window.QPDeck={go:go,fullscreen:fullscreen,isStatic:isStatic,key:key,setTheme:function(t){theme=t;try{localStorage.setItem('deck-theme',t)}catch(e){}},current:function(){return cur},total:N};
  var g=document.getElementById('ovg'), html='';
  (D.sections.length?D.sections:[['전체',1,N]]).forEach(function(s){
    html+='<h3>'+s[0]+'</h3><div class="grid">';
    for(var i=s[1];i<=s[2];i++){ var th=D.thumbs[i-1]; html+='<a href="#s'+pad(i)+'" data-n="'+i+'">'+(th?'<img src="'+th+'" alt="">':'<div class="th"><b>SLIDE '+pad(i)+'</b><span>'+(D.types&&D.types[i-1]?D.types[i-1]:'')+'</span></div>')+'<span class="t"><b>'+pad(i)+'</b>'+D.titles[i-1].replace(/</g,'&lt;')+'</span></a>'; }
    html+='</div>';
  });
  g.innerHTML=html;
  g.addEventListener('click',function(e){ var a=e.target.closest('a'); if(!a) return; e.preventDefault(); go(+a.getAttribute('data-n')); });
  document.getElementById('bPrev').onclick=function(){go(cur-1)}; document.getElementById('bNext').onclick=function(){go(cur+1)};
  document.getElementById('bOv').onclick=function(){toggleOv()}; document.getElementById('bNotes').onclick=toggleNotes;
  document.getElementById('bFs').onclick=fullscreen; document.getElementById('bHelp').onclick=function(){key('?')};
  document.getElementById('bReset').onclick=function(){ t0=Date.now(); };
  document.getElementById('black').onclick=function(){ this.classList.remove('on'); };
  window.addEventListener('mousemove',poke);
  window.addEventListener('message',function(e){ var d=e.data||{}; if(d.qpDeck){ if(d.kind==='goto') go(d.value); else if(d.kind==='key'){ var k=d.value; if(k==='ArrowRight'||k===' '||k==='Enter'||k==='PageDown') go(cur+1); else if(k==='ArrowLeft'||k==='Backspace'||k==='PageUp') go(cur-1); else if(k==='Home') go(1); else if(k==='End') go(N); else if(k==='h'||k==='H') toggleOv(); else if(k==='f'||k==='F') fullscreen(); else key(k); } } else if(d.deckGo) go(d.deckGo); });
  window.addEventListener('keydown',function(e){
    if(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    var k=e.key;
    if((k==='ArrowRight'||k==='PageDown'||k===' '||k==='Enter')&&!e.shiftKey){e.preventDefault();go(cur+1)}
    else if(k==='ArrowLeft'||k==='PageUp'||k==='Backspace'){e.preventDefault();go(cur-1)}
    else if(k==='Home'){go(1)} else if(k==='End'){go(N)}
    else if(k==='h'||k==='H'){toggleOv()} else if(k==='f'||k==='F'){fullscreen()}
    else if(k==='t'||k==='T'){ try{front.contentWindow.deckToggleTheme()}catch(err){} }
    else key(k);
  });
  window.addEventListener('hashchange',function(){ var m=location.hash.match(/^#s(\\d{2,3})$/); if(m) go(+m[1]); });
  var m=null; try{ m=location.hash.match(/^#s(\\d{2,3})$/); }catch(e){} var ds=parseInt(document.documentElement.getAttribute('data-start')||'',10); go(m?+m[1]:(ds>0?ds:1)); poke();
  setTimeout(function(){ document.getElementById('hint').classList.add('off'); },6000);
})();
</script>
</body>
</html>`;
}

export function thumbCard(title: string, n: number): string { return `<div class="th"><b>SLIDE ${pad(n)}</b><span>${esc(plain(title))}</span></div>`; }
