/* FX layer JS — ported from the reference decks: effects (aurora/rail/tilt/parallax/pop) + guided-click engine. */
export const FX_JS = `

/* ===== FX layer: aurora, section rail, 3D tilt, parallax, counter pop (opt-in via <html class="qfx-aurora qfx-rail qfx-tilt qfx-3d-in">) ===== */
(function(){
  var H=document.documentElement, D=window.DECK||{n:1,total:1};
  var ST=H.classList.contains('static');
  var RM=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function stage(){ return document.querySelector('.stage'); }
  function aurora(){
    if(!H.classList.contains('qfx-aurora')) return;
    var st=stage(); if(!st||st.querySelector('.fx-aurora')||st.querySelector('.amb')||st.classList.contains('a-cover')) return;
    var a=document.createElement('div'); a.className='fx-aurora'; a.innerHTML='<i></i><i></i><i></i>';
    var bd=st.querySelector(':scope > .backdrop');
    if(bd) st.insertBefore(a,bd.nextSibling); else st.insertBefore(a,st.firstChild);
  }
  function rail(){
    if(!H.classList.contains('qfx-rail')||!D.sections||!D.sections.length) return;
    var f=document.querySelector('.deck-foot'); if(!f||f.querySelector('.sec-rail')) return;
    var r=document.createElement('div'); r.className='sec-rail';
    var cur=-1; D.sections.forEach(function(s,i){ if(D.n>=s[1]&&D.n<=s[2]) cur=i; });
    D.sections.forEach(function(s,i){ var sp=document.createElement('span'); sp.setAttribute('data-l',s[0]); if(i<cur) sp.className='done'; if(i===cur) sp.className='on'; r.appendChild(sp); });
    f.appendChild(r);
  }
  function tilt(){
    if(ST||RM||!H.classList.contains('qfx-tilt')) return;
    var st=stage(); if(!st) return;
    var cards=Array.prototype.filter.call(st.querySelectorAll('.card'),function(c){
      return !c.closest('.app')&&!c.closest('.browser')&&!c.closest('.phone')&&!c.closest('.a-mock')&&!c.closest('.card .card')&&!c.hasAttribute('data-notilt')&&c.offsetWidth>150&&c.offsetHeight>70;
    });
    cards.forEach(function(c){
      c.classList.add('tilt'); if(getComputedStyle(c).position==='static') c.style.position='relative';
      c.addEventListener('pointermove',function(e){
        var r=c.getBoundingClientRect(); var nx=(e.clientX-r.left)/r.width-.5, ny=(e.clientY-r.top)/r.height-.5;
        var max=Math.min(5, 1800/Math.max(r.width,r.height)*1.2);
        c.classList.add('tilting');
        c.style.transform='perspective(1400px) rotateX('+(-ny*max).toFixed(2)+'deg) rotateY('+(nx*max).toFixed(2)+'deg) translateZ(8px)';
        c.style.setProperty('--mx',((nx+.5)*100).toFixed(1)+'%'); c.style.setProperty('--my',((ny+.5)*100).toFixed(1)+'%');
      });
      c.addEventListener('pointerleave',function(){ c.classList.remove('tilting'); c.style.transform=''; });
    });
  }
  function parallax(){
    if(ST||RM||!H.classList.contains('qfx-aurora')) return;
    var st=stage(); if(!st) return;
    var layers=function(){ return [st.querySelector('.fx-aurora'),st.querySelector('.fx-3d')].filter(Boolean); };
    var tx=0,ty=0,cx=0,cy=0,raf=null;
    window.addEventListener('pointermove',function(e){ tx=(e.clientX/window.innerWidth-.5); ty=(e.clientY/window.innerHeight-.5); if(!raf) raf=requestAnimationFrame(tick); });
    function tick(){ raf=null; cx+=(tx-cx)*.08; cy+=(ty-cy)*.08;
      layers().forEach(function(l,i){ var k=(i+1)*14; l.style.transform='translate('+(cx*k).toFixed(1)+'px,'+(cy*k).toFixed(1)+'px)'; });
      if(Math.abs(tx-cx)>.001||Math.abs(ty-cy)>.001) raf=requestAnimationFrame(tick); }
  }
  function pops(){
    if(ST) return;
    Array.prototype.forEach.call(document.querySelectorAll('[data-count]'),function(el){
      var s=(el.__delay!=null?el.__delay:0)+150+parseInt(el.getAttribute('data-duration')||'1400',10);
      setTimeout(function(){ el.classList.add('pop'); },s);
    });
  }
  function go(){ aurora(); rail(); tilt(); parallax(); pops(); }
  var fired=false;
  document.addEventListener('deck:ready',function(){ if(!fired){ fired=true; go(); } });
  if(window.__QP_READY&&!fired){ fired=true; go(); }
})();

/* ===== v2 · Guided-click engine (cursor + numbered callouts + typing) =====
   Usage: <div class="app" data-guide='[ {step}, ... ]'>
   step = { at:ms, do:'click'|'type'|'point'|'show'|'hide'|'clear'|'class'|'scroll',
            sel:'#id', text:'…', speed:ms/char, call:'label', num:1, pos:'r'|'l'|'t'|'b',
            open:'#menu', close:'#menu', step:n, cls:'name', hold:ms }
   Static mode (?static=1): final state → all callouts shown, no cursor, steps all done. */
(function(){
  var H=document.documentElement, ST=H.classList.contains('static');
  var RM=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function init(){
    var stage=document.querySelector('.stage'); if(!stage) return;
    var hosts=stage.querySelectorAll('[data-guide]'); if(!hosts.length) return;
    Array.prototype.forEach.call(hosts,function(host){ run(stage,host); });
  }
  function rectIn(stage,el){
    var sr=stage.getBoundingClientRect(), r=el.getBoundingClientRect();
    var s=sr.width/1920;
    return {x:(r.left-sr.left)/s, y:(r.top-sr.top)/s, w:r.width/s, h:r.height/s};
  }
  function run(stage,host){
    var steps; try{ steps=JSON.parse(host.getAttribute('data-guide')); }catch(e){ return; }
    var layer=document.createElement('div'); layer.className='g-layer'; stage.appendChild(layer);
    var cur=null;
    if(!ST&&!RM){
      cur=document.createElement('div'); cur.className='g-cur';
      cur.innerHTML='<svg viewBox="0 0 24 24" width="30" height="30"><path d="M5 3l14 8.5-6.2 1.6L9.5 20z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
      cur.style.left='1180px'; cur.style.top='760px'; layer.appendChild(cur);
    }
    function target(sel){ return sel?stage.querySelector(sel):null; }
    function markStep(n){
      if(!n) return;
      Array.prototype.forEach.call(stage.querySelectorAll('[data-step]'),function(li){
        var k=parseInt(li.getAttribute('data-step'),10);
        li.classList.toggle('on',k===n); li.classList.toggle('done',k<n);
      });
    }
    function callout(el,st){
      if(!st.call) return;
      if((ST||RM)&&st.ttl) return;
      var r=rectIn(stage,el);
      var c=document.createElement('div'); c.className='g-call'+(st.pos?' p-'+st.pos:' p-r');
      c.innerHTML=(st.num?'<b>'+st.num+'</b>':'')+'<span>'+st.call+'</span>';
      layer.appendChild(c);
      var pos=st.pos||'r';
      if(pos==='r'){ c.style.left=(r.x+r.w+16)+'px'; c.style.top=(r.y+r.h/2)+'px'; c.style.translate='0 -50%'; }
      else if(pos==='l'){ c.style.left=(r.x-16)+'px'; c.style.top=(r.y+r.h/2)+'px'; c.style.translate='-100% -50%'; }
      else if(pos==='t'){ c.style.left=(r.x+r.w/2)+'px'; c.style.top=(r.y-14)+'px'; c.style.translate='-50% -100%'; }
      else if(pos==='b'){ c.style.left=(r.x+r.w/2)+'px'; c.style.top=(r.y+r.h+14)+'px'; c.style.translate='-50% 0'; }
      else if(pos==='tl'){ c.style.left=(r.x)+'px'; c.style.top=(r.y-14)+'px'; c.style.translate='0 -100%'; }
      else if(pos==='tr'){ c.style.left=(r.x+r.w)+'px'; c.style.top=(r.y-14)+'px'; c.style.translate='-100% -100%'; }
      else if(pos==='bl'){ c.style.left=(r.x)+'px'; c.style.top=(r.y+r.h+14)+'px'; c.style.translate='0 0'; }
      else if(pos==='br'){ c.style.left=(r.x+r.w)+'px'; c.style.top=(r.y+r.h+14)+'px'; c.style.translate='-100% 0'; }
      if(st.dx) c.style.marginLeft=st.dx+'px'; if(st.dy) c.style.marginTop=st.dy+'px';
      requestAnimationFrame(function(){ c.classList.add('in'); });
      // ring on target (or st.ringSel)
      var rel=st.ringSel?(target(st.ringSel)||el):el; var rr=rectIn(stage,rel);
      var ring=document.createElement('div'); ring.className='g-ring'; layer.appendChild(ring);
      ring.style.left=(rr.x-3)+'px'; ring.style.top=(rr.y-3)+'px'; ring.style.width=(rr.w+6)+'px'; ring.style.height=(rr.h+6)+'px';
      requestAnimationFrame(function(){ ring.classList.add('in'); });
      if(st.ringOff){ ring.style.display='none'; }
      rel.classList.add('g-hit');
      if(st.ttl&&!(ST||RM)){ setTimeout(function(){ c.classList.add('out'); ring.classList.add('out'); rel.classList.remove('g-hit'); setTimeout(function(){ c.remove(); ring.remove(); },500); }, st.ttl); }
    }
    function moveTo(el,cb){
      if(!cur){ cb&&cb(); return; }
      var r=rectIn(stage,el);
      var x=r.x+r.w*(0.5), y=r.y+r.h*0.55;
      if(el.getAttribute('data-cur')){ var p=el.getAttribute('data-cur').split(','); x=r.x+parseFloat(p[0]); y=r.y+parseFloat(p[1]); }
      cur.style.left=x+'px'; cur.style.top=y+'px'; cur.classList.add('show');
      setTimeout(cb,760);
    }
    function clickFx(){
      if(!cur) return;
      cur.classList.add('dn'); setTimeout(function(){cur.classList.remove('dn')},160);
      var rp=document.createElement('i'); rp.className='g-rip'; rp.style.left=cur.style.left; rp.style.top=cur.style.top; layer.appendChild(rp);
      setTimeout(function(){ rp.remove(); },700);
    }
    function typeInto(el,text,speed,done){
      el.classList.remove('ph'); el.classList.add('typing');
      var i=0, sp=speed||22;
      if(ST||RM){ el.textContent=text; el.classList.remove('typing'); done&&done(); return; }
      var t0=Date.now();
      var iv=setInterval(function(){
        var n=Math.min(text.length,Math.floor((Date.now()-t0)/sp));
        if(n!==i){ i=n; el.textContent=text.slice(0,i); }
        if(i>=text.length){ clearInterval(iv); el.classList.remove('typing'); done&&done(); }
      },20);
    }
    function doStep(st){
      var el=target(st.sel);
      if(st.step) markStep(st.step);
      if(st.open){ var o=target(st.open); if(o) o.classList.add('open'); }
      if(st.close){ var c2=target(st.close); if(c2) c2.classList.remove('open'); }
      if(st.cls&&el){ el.classList.add(st.cls); }
      if(st.uncls&&el){ el.classList.remove(st.uncls); }
      if(st.show){ Array.prototype.forEach.call(stage.querySelectorAll(st.show),function(e){ e.classList.add('in'); }); }
      if(st.hide){ Array.prototype.forEach.call(stage.querySelectorAll(st.hide),function(e){ e.classList.add('gone'); setTimeout(function(){e.classList.add('off')},380); }); }
      if(!el) return;
      if(st.do==='click'){ moveTo(el,function(){ clickFx(); el.classList.add('g-click'); setTimeout(function(){el.classList.remove('g-click')},360); callout(el,st); if(st.open2){ var o2=target(st.open2); if(o2) o2.classList.add('open'); } if(st.close2){ var c3=target(st.close2); if(c3) c3.classList.remove('open'); } if(st.cls2){ el.classList.add(st.cls2); } }); }
      else if(st.do==='type'){ moveTo(el,function(){ clickFx(); callout(el,st); el.classList.add('focus'); typeInto(el.querySelector('.inp')||el,st.text||'',st.speed,function(){ el.classList.remove('focus'); }); }); }
      else if(st.do==='point'){ moveTo(el,function(){ callout(el,st); }); }
      else if(st.do==='clear'){ var inp=el.querySelector('.inp')||el; inp.textContent=inp.getAttribute('data-ph')||''; if(inp.getAttribute('data-ph')) inp.classList.add('ph'); }
      else if(st.do==='call'){ callout(el,st); }
    }
    if(ST||RM){
      // final state
      steps.forEach(function(st){
        var el=target(st.sel);
        if(st.step) markStep(st.step);
        if(st.cls&&el) el.classList.add(st.cls);
        if(st.cls2&&el) el.classList.add(st.cls2);
        if(st.show){ Array.prototype.forEach.call(stage.querySelectorAll(st.show),function(e){ e.classList.add('in'); }); }
        if(st.hide){ Array.prototype.forEach.call(stage.querySelectorAll(st.hide),function(e){ e.classList.add('gone','off'); }); }
        if(st.open&&!st.keep){ /* menus end closed */ }
        if(st.keepOpen){ var o=target(st.keepOpen); if(o) o.classList.add('open'); }
        if(el&&(st.do==='click'||st.do==='type'||st.do==='point'||st.do==='call')) callout(el,st);
        if(st.do==='clear'){ var inp=el&&(el.querySelector('.inp')||el); if(inp&&inp.getAttribute('data-ph')){ inp.textContent=inp.getAttribute('data-ph'); inp.classList.add('ph'); } }
      });
      return;
    }
    steps.forEach(function(st){ setTimeout(function(){ doStep(st); }, st.at||0); });
    var last=steps.reduce(function(m,s){return Math.max(m,s.at||0)},0);
    setTimeout(function(){ if(cur){ cur.classList.add('bye'); } }, last+2600);
  }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',function(){ setTimeout(init,30); }); } else { setTimeout(init,30); }
})();

`;
