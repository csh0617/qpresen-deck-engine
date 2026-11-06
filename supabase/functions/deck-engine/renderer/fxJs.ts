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
  /* 3D scene layer: <main class="stage" data-scene="terrain|network|cubes|fireflies" data-scene-opts='{…}'> (THREE + DeckScenes inlined on demand).
     Mounted right after a photo backdrop when one exists (inside .body) so the scene floats over the photo and under the content. */
  function scene(){
    var st=stage(); if(!st) return; var name=st.getAttribute('data-scene'); if(!name||name==='none'||!window.DeckScenes||!window.DeckScenes[name]) return;
    var opts={}; try{ opts=JSON.parse(st.getAttribute('data-scene-opts')||'{}'); }catch(e){}
    var box=document.createElement('div'); box.className='fx-3d'; if(opts.opacity!=null) box.style.setProperty('--fx-op',opts.opacity);
    var bd=st.querySelector('.backdrop'); var au=st.querySelector(':scope > .fx-aurora');
    if(bd&&bd.parentNode){ bd.parentNode.insertBefore(box,bd.nextSibling); } else if(au){ st.insertBefore(box,au.nextSibling); } else { st.insertBefore(box,st.firstChild); }
    try{ window.DeckScenes[name](box,st,opts,{static:ST||RM}); }catch(e){ console.warn('scene failed',e); box.remove(); }
  }
  /* carousel: [data-carousel="3200"] host (class .carousel[.fan|.stack]); children .ci rotate through data-pos; optional [data-dots] + [data-label] inside the host's parent */
  function carousel(){
    Array.prototype.forEach.call(document.querySelectorAll('[data-carousel]'),function(host){
      var items=Array.prototype.slice.call(host.querySelectorAll(':scope > .ci')); if(!items.length) return;
      host.classList.add('carousel'); if(!host.classList.contains('stack')) host.classList.add('fan');
      var ms=parseInt(host.getAttribute('data-carousel'),10); if(isNaN(ms)) ms=3200;
      var scope=host.parentNode||host; var dots=scope.querySelector('[data-dots]'); var label=scope.querySelector('[data-label]');
      if(dots&&!dots.children.length){ dots.classList.add('car-dots'); dots.innerHTML=items.map(function(){return '<i></i>';}).join(''); }
      var di=dots?Array.prototype.slice.call(dots.children):[]; var k=parseInt(host.getAttribute('data-static-step')||'0',10)||0;
      function arrange(k,flash){ items.forEach(function(c,j){ c.setAttribute('data-pos',(j-k+items.length)%items.length); }); di.forEach(function(d,j){ d.classList.toggle('on',j===k); });
        if(label) label.textContent=items[k].getAttribute('data-name')||''; host.setAttribute('data-active',k);
        if(flash&&!ST&&!RM){ var f=items[k]; f.classList.remove('flash'); void f.offsetWidth; f.classList.add('flash'); }
        try{ host.dispatchEvent(new CustomEvent('carousel',{detail:{i:k,item:items[k]}})); }catch(e){} }
      arrange(k,false); if(ST||RM||!ms) { items.forEach(function(c,j){ c.addEventListener('click',function(){ k=j; arrange(j,true); }); }); return; }
      var timer=setInterval(function(){ k=(k+1)%items.length; arrange(k,true); },ms);
      items.forEach(function(c,j){ c.addEventListener('click',function(){ k=j; arrange(j,true); clearInterval(timer); timer=setInterval(function(){ k=(k+1)%items.length; arrange(k,true); },ms); }); });
    });
  }
  /* word cycler: <span data-words='["…","…"]' data-interval="2600" data-mode="type|fade" data-sync="#chips">; chips' children get .on by index */
  function words(){
    Array.prototype.forEach.call(document.querySelectorAll('[data-words]'),function(el){
      var list; try{ list=JSON.parse(el.getAttribute('data-words')); }catch(e){ return; } if(!list||!list.length) return;
      var ms=parseInt(el.getAttribute('data-interval'),10)||2600, mode=el.getAttribute('data-mode')||'type', sync=el.getAttribute('data-sync'), chips=sync?document.querySelector(sync):null;
      var si=parseInt(el.getAttribute('data-static-step')||'0',10)||0, i=si, tm=null;
      function mark(k){ if(!chips) return; Array.prototype.forEach.call(chips.children,function(c,j){ c.classList.toggle('on',j===k); }); }
      function show(k){ var t=String(list[k]); mark(k); try{ el.dispatchEvent(new CustomEvent('words',{detail:{i:k,text:t}})); }catch(e){}
        if(ST||RM){ el.textContent=t; return; }
        if(mode==='fade'){ el.classList.add('fade-out'); setTimeout(function(){ el.textContent=t; el.classList.remove('fade-out'); el.classList.add('fade-in'); },260); return; }
        el.textContent=''; el.classList.add('typing'); var n=0, sp=parseInt(el.getAttribute('data-speed'),10)||38; clearInterval(tm);
        tm=setInterval(function(){ n++; el.textContent=t.slice(0,n); if(n>=t.length){ clearInterval(tm); setTimeout(function(){ el.classList.remove('typing'); },600); } },sp); }
      show(i); if(ST||RM) return; setInterval(function(){ i=(i+1)%list.length; show(i); },ms);
    });
  }
  /* packets: <path data-packets="3" data-dur="3s" data-r="5"> inside an <svg> → circles riding the path (SMIL animateMotion, no JS per frame) */
  function packets(){
    var n=0; Array.prototype.forEach.call(document.querySelectorAll('svg path[data-packets]'),function(path){
      var cnt=parseInt(path.getAttribute('data-packets'),10)||2, dur=path.getAttribute('data-dur')||'3s', r=path.getAttribute('data-r')||'5';
      if(!path.id) path.id='qp-path-'+(++n); var svg=path.ownerSVGElement; if(!svg) return; var NS='http://www.w3.org/2000/svg', XL='http://www.w3.org/1999/xlink';
      for(var k=0;k<cnt;k++){ var c=document.createElementNS(NS,'circle'); c.setAttribute('r',r); c.setAttribute('class','packet'+(path.getAttribute('data-packet-class')?' '+path.getAttribute('data-packet-class'):''));
        var am=document.createElementNS(NS,'animateMotion'); am.setAttribute('dur',dur); am.setAttribute('repeatCount','indefinite'); am.setAttribute('begin',(-(parseFloat(dur)||3)*k/cnt)+'s');
        var mp=document.createElementNS(NS,'mpath'); mp.setAttributeNS(XL,'xlink:href','#'+path.id); mp.setAttribute('href','#'+path.id); am.appendChild(mp); c.appendChild(am); svg.appendChild(c); }
      if(ST||RM){ try{ svg.pauseAnimations(); svg.setCurrentTime(1.2); }catch(e){} }
    });
  }
  /* waveform bars: <div class="wave" data-wave="28"> */
  function waves(){
    Array.prototype.forEach.call(document.querySelectorAll('[data-wave]'),function(w){ if(w.children.length) return; var n=parseInt(w.getAttribute('data-wave'),10)||24, h=''; w.classList.add('wave');
      for(var i=0;i<n;i++){ var v=35+Math.round(55*Math.abs(Math.sin(i*1.7)+Math.cos(i*0.6))/2); h+='<i style="--h:'+v+'%;--dl:'+(-(i*137%900))+'ms"></i>'; } w.innerHTML=h; });
  }
  /* panel switch: <div data-switch="#stepsHost"> children follow the host's data-cycle index (.on) — scene per step */
  function switches(){
    Array.prototype.forEach.call(document.querySelectorAll('[data-switch]'),function(box){ var host=document.querySelector(box.getAttribute('data-switch')); if(!host) return;
      var panels=Array.prototype.slice.call(box.children); function set(k){ panels.forEach(function(p,j){ p.classList.toggle('on',j===k); }); }
      set(parseInt(host.getAttribute('data-active')||'0',10)||0); host.addEventListener('cycle',function(ev){ set(ev.detail.i); }); host.addEventListener('carousel',function(ev){ set(ev.detail.i); }); });
  }
  /* sim runner: a slide may define window.SLIDE={init(){…},tick(dt,t){…}} for canvas/Three simulations — the engine runs init once and ticks every frame
     (static mode: init + one representative tick at t=4.2s; tab hidden → paused). Same contract as the 800조 reference deck. */
  function slideRunner(){
    var S=window.SLIDE; if(!S||typeof S.init!=='function') return;
    try{ S.init(); }catch(e){ console.warn('SLIDE.init failed',e); return; }
    if(typeof S.tick!=='function') return;
    if(ST||RM){ try{ S.tick(0.016,4.2); }catch(e){ console.warn('SLIDE.tick failed',e); } return; }
    var last=0,t=0,raf=0,alive=true;
    function loop(now){ if(!alive) return; var dt=last?Math.min(.05,(now-last)/1000):0; last=now; t+=dt; try{ S.tick(dt,t); }catch(e){ console.error(e); alive=false; return; } raf=requestAnimationFrame(loop); }
    raf=requestAnimationFrame(loop);
    document.addEventListener('visibilitychange',function(){ if(document.hidden){ alive=false; cancelAnimationFrame(raf); last=0; } else if(!alive){ alive=true; raf=requestAnimationFrame(loop); } });
  }
  function go(){ aurora(); rail(); tilt(); parallax(); pops(); scene(); carousel(); words(); packets(); waves(); switches(); slideRunner(); }
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
