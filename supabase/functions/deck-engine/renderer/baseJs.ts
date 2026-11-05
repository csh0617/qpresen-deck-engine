/* Qpresen Deck Engine — per-slide runtime (inlined into every slide) */
import { LINT_JS } from './lintJs.ts';
import { FX_JS } from './fxJs.ts';

export const BASE_JS = `
(function(){
  var H=document.documentElement;
  var D=window.DECK||{n:1,total:1};
  var IS_STATIC=H.classList.contains('static');
  window.DECK_STATIC=IS_STATIC;
  var B=null; try{ if(window.parent!==window && window.parent.QPDeck) B=window.parent.QPDeck; }catch(e){}
  window.DECK_BRIDGE=B;
  function pad(n){return (n<10?'0':'')+n}
  function fileFor(n){return 'slide-'+pad(n)+'.html'+(IS_STATIC?'?static=1':'')}
  function fit(){ var st=document.querySelector('.stage'); if(!st) return; var s=Math.min(window.innerWidth/1920, window.innerHeight/1080); st.style.setProperty('--s', s); }
  window.addEventListener('resize',fit); fit();
  function inject(){
    var st=document.querySelector('.stage'); if(!st) return;
    if(!st.querySelector('.deck-foot') && !st.hasAttribute('data-nofoot')){
      var f=document.createElement('div'); f.className='deck-foot';
      f.innerHTML='<div class="brand"><i></i>'+(D.footer||'')+'</div><div class="prog"><i></i></div><div class="pg"><b>'+pad(D.n)+'</b> / '+pad(D.total)+'</div>';
      st.appendChild(f);
      var w=(D.n/D.total*100).toFixed(2)+'%'; var pi=f.querySelector('.prog i');
      if(IS_STATIC){ pi.style.width=w; } else { setTimeout(function(){ pi.style.setProperty('--p', w); },80); }
    }
    if(!document.querySelector('.deck-nav') && !IS_STATIC && !B){
      var nav=document.createElement('div'); nav.className='deck-nav';
      nav.innerHTML='<a href="index.html" title="목차 (H)">⌂</a><a href="'+fileFor(Math.max(1,D.n-1))+'" title="이전 (←)" class="'+(D.n<=1?'dis':'')+'">‹</a><a href="'+fileFor(Math.min(D.total,D.n+1))+'" title="다음 (→)" class="'+(D.n>=D.total?'dis':'')+'">›</a>';
      document.body.appendChild(nav);
    }
  }
  function go(n){ if(n<1||n>D.total) return; if(B){B.go(n);return;} try{ parent.postMessage({qpDeck:true,kind:'goto',value:n},'*'); }catch(e){} if(window.parent===window) location.href=fileFor(n); }
  window.deckGo=go;
  window.addEventListener('keydown',function(e){
    if(e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if(e.ctrlKey||e.metaKey||e.altKey) return;
    var k=e.key;
    if(k==='ArrowRight'||k==='PageDown'||k===' '||k==='Enter'){ if(!e.shiftKey){e.preventDefault(); go(D.n+1);} }
    else if(k==='ArrowLeft'||k==='PageUp'||k==='Backspace'){ e.preventDefault(); go(D.n-1); }
    else if(k==='Home'){ go(1); } else if(k==='End'){ go(D.total); }
    else if(k==='t'||k==='T'){ toggleTheme(); }
    else if(k==='f'||k==='F'){ if(B&&B.fullscreen){B.fullscreen();return;} var el=document.documentElement; if(!document.fullscreenElement){ el.requestFullscreen&&el.requestFullscreen(); } else { document.exitFullscreen&&document.exitFullscreen(); } }
    else if(B && B.key){ B.key(k); }
    else { try{ parent.postMessage({qpDeck:true,kind:'key',value:k},'*'); }catch(err){} }
  });
  var tx=null;
  window.addEventListener('touchstart',function(e){tx=e.touches[0].clientX},{passive:true});
  window.addEventListener('touchend',function(e){ if(tx==null) return; var dx=e.changedTouches[0].clientX-tx; tx=null; if(Math.abs(dx)>60) go(D.n+(dx<0?1:-1)); },{passive:true});
  function toggleTheme(){
    var dark=H.getAttribute('data-theme')==='dark';
    if(dark){H.removeAttribute('data-theme');} else {H.setAttribute('data-theme','dark');}
    try{localStorage.setItem('deck-theme',dark?'light':'dark')}catch(e){}
    if(B&&B.setTheme) B.setTheme(dark?'light':'dark');
    document.dispatchEvent(new CustomEvent('deck:theme',{detail:{dark:!dark}}));
  }
  window.deckToggleTheme=toggleTheme;
  /* counters */
  function fmt(v,dec,sep){ var s=v.toFixed(dec); if(sep!=='0'){ var p=s.split('.'); p[0]=p[0].replace(/\\B(?=(\\d{3})+(?!\\d))/g,','); s=p.join('.'); } return s; }
  function runCounter(el){
    if(el.__done) return; el.__done=true;
    var to=parseFloat(el.getAttribute('data-count')); if(isNaN(to)) return;
    var dec=parseInt(el.getAttribute('data-decimals')||'0',10);
    var pre=el.getAttribute('data-prefix')||'', suf=el.getAttribute('data-suffix')||'';
    var dur=parseInt(el.getAttribute('data-duration')||'1400',10);
    var sep=el.getAttribute('data-sep')||'1';
    var final=el.innerHTML; if(IS_STATIC) return;
    var small=el.querySelector('small'); var tail=small?small.outerHTML:'';
    var t0=Date.now();
    var iv=setInterval(function(){ var p=Math.min(1,(Date.now()-t0)/dur); var e=1-Math.pow(1-p,3); el.innerHTML=pre+fmt(to*e,dec,sep)+suf+tail; if(p>=1){ clearInterval(iv); el.innerHTML=final; } },16);
  }
  /* typewriter */
  function runType(el){
    if(el.__typed) return; el.__typed=true;
    var text=el.getAttribute('data-type-text')||el.textContent; var sp=parseInt(el.getAttribute('data-speed')||'26',10);
    if(IS_STATIC){ el.textContent=text; return; }
    el.textContent=''; el.classList.add('caret'); var t0=Date.now();
    var iv=setInterval(function(){ var n=Math.min(text.length,Math.floor((Date.now()-t0)/sp)); el.textContent=text.slice(0,n); if(n>=text.length){ clearInterval(iv); setTimeout(function(){el.classList.remove('caret')},900); } },20);
  }
  /* reveal orchestration */
  function reveal(){
    var els=Array.prototype.slice.call(document.querySelectorAll('[data-reveal],[data-bar],[data-draw],[data-count],[data-grow],[data-type]'));
    var auto=0;
    els.forEach(function(el){
      var d=el.getAttribute('data-delay'); var delay;
      if(d!=null){ delay=parseInt(d,10); } else { delay=Math.min(1500, auto); auto+=70; }
      if(el.hasAttribute('data-draw')){ try{ var len=el.getTotalLength(); el.style.setProperty('--len',len); }catch(e){} }
      if(el.hasAttribute('data-bar')){ el.style.setProperty('--w', el.getAttribute('data-bar')+'%'); }
      el.style.setProperty('--d', delay+'ms'); el.__delay=delay;
    });
    /* chain reveals: data-after="#sel" data-gap="ms" → start after that element finished (typing/counting/entering) */
    els.forEach(function(el){
      var sel=el.getAttribute('data-after'); if(!sel) return; var t; try{ t=document.querySelector(sel); }catch(e){ t=null; } if(!t) return;
      var base=(t.__delay!=null?t.__delay:0), est=600;
      if(t.hasAttribute('data-type')){ var txt=t.getAttribute('data-type-text')||t.textContent||''; est=txt.length*parseInt(t.getAttribute('data-speed')||'26',10)+200; }
      else if(t.hasAttribute('data-count')){ est=parseInt(t.getAttribute('data-duration')||'1400',10)+150; }
      var d2=base+est+parseInt(el.getAttribute('data-gap')||'0',10);
      el.style.setProperty('--d', d2+'ms'); el.__delay=d2;
    });
    if(IS_STATIC){ els.forEach(function(el){ el.classList.add('in'); if(el.hasAttribute('data-type')) runType(el); }); H.classList.add('reveal-done'); return; }
    function flip(){ els.forEach(function(el){ el.classList.add('in'); if(el.hasAttribute('data-count')){ setTimeout(function(){runCounter(el)}, el.__delay+150); } if(el.hasAttribute('data-type')){ setTimeout(function(){runType(el)}, el.__delay); } }); }
    var flipped=false; function once(){ if(flipped) return; flipped=true; flip(); }
    requestAnimationFrame(function(){ requestAnimationFrame(once); }); setTimeout(once, 60);
    setTimeout(function(){ H.classList.add('reveal-done'); }, 2800);
  }
  /* particles */
  function particles(cv,opt){
    opt=opt||{}; var ctx=cv.getContext('2d'); if(!ctx) return;
    var W=cv.width=cv.clientWidth||1920, Hh=cv.height=cv.clientHeight||1080;
    var N=opt.n||64, link=opt.link||170, P=[], seed=opt.seed||7;
    function rnd(){ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; }
    for(var i=0;i<N;i++) P.push({x:rnd()*W,y:rnd()*Hh,vx:(rnd()-.5)*.28,vy:(rnd()-.5)*.28,r:1.2+rnd()*2.2});
    var alpha=opt.alpha||1; var c1=opt.c1||[26,140,255], c2=opt.c2||[155,77,255];
    function col(x,a){ var t=x/W; var r=Math.round(c1[0]+(c2[0]-c1[0])*t), g=Math.round(c1[1]+(c2[1]-c1[1])*t), b=Math.round(c1[2]+(c2[2]-c1[2])*t); return 'rgba('+r+','+g+','+b+','+(a*alpha)+')'; }
    function draw(){ ctx.clearRect(0,0,W,Hh);
      for(var i=0;i<N;i++){ var p=P[i]; for(var j=i+1;j<N;j++){ var q=P[j], dx=p.x-q.x, dy=p.y-q.y, d=Math.sqrt(dx*dx+dy*dy); if(d<link){ ctx.strokeStyle=col((p.x+q.x)/2,(1-d/link)*.22); ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke(); } } }
      for(var k=0;k<N;k++){ var o=P[k]; ctx.fillStyle=col(o.x,.55); ctx.beginPath(); ctx.arc(o.x,o.y,o.r,0,6.283); ctx.fill(); } }
    function step(){ for(var i=0;i<N;i++){ var p=P[i]; p.x+=p.vx; p.y+=p.vy; if(p.x<0||p.x>W) p.vx*=-1; if(p.y<0||p.y>Hh) p.vy*=-1; } draw(); }
    draw(); if(IS_STATIC) return;
    var last=0; (function loop(t){ if(document.hidden){requestAnimationFrame(loop);return;} if(t-last>33){ last=t; step(); } requestAnimationFrame(loop); })(0);
  }
  /* step cycler */
  function initCycle(){
    Array.prototype.slice.call(document.querySelectorAll('[data-cycle]')).forEach(function(box){
      var steps=Array.prototype.slice.call(box.querySelectorAll('[data-step]')); if(!steps.length) return;
      var ms=parseInt(box.getAttribute('data-cycle'),10)||2600; var si=parseInt(box.getAttribute('data-static-step')||'0',10), i=0;
      function set(k){ steps.forEach(function(s,j){ s.classList.toggle('on',j===k); }); box.setAttribute('data-active',k); }
      if(IS_STATIC){ set(si); return; } set(0); setInterval(function(){ i=(i+1)%steps.length; set(i); },ms);
      steps.forEach(function(s,j){ s.addEventListener('mouseenter',function(){ i=j; set(j); }); });
    });
  }
  /* mockup scripted steps: [data-mock-steps] with children [data-at] */
  function initMock(){
    Array.prototype.slice.call(document.querySelectorAll('[data-mock]')).forEach(function(box){
      var items=Array.prototype.slice.call(box.querySelectorAll('[data-at]'));
      var cur=box.querySelector('.cursor');
      function show(it){ it.classList.add('in'); var ty=it.querySelector('[data-type-text]'); if(ty) runType(ty); if(cur&&it.hasAttribute('data-click')){ cur.classList.add('on'); var r=it.getBoundingClientRect(), br=box.getBoundingClientRect(); var s=parseFloat(getComputedStyle(document.querySelector('.stage')).getPropertyValue('--s'))||1; cur.style.left=((r.left-br.left)/s+Math.min(r.width/s-20,60))+'px'; cur.style.top=((r.top-br.top)/s+r.height/s/2)+'px'; } var sc=box.querySelector('.chat'); if(sc) sc.scrollTop=sc.scrollHeight; }
      if(IS_STATIC){ items.forEach(show); if(cur) cur.classList.remove('on'); return; }
      items.forEach(function(it){ setTimeout(function(){ show(it); }, parseInt(it.getAttribute('data-at'),10)||0); });
      var loop=parseInt(box.getAttribute('data-loop')||'0',10);
      if(loop){ var last=items.reduce(function(m,it){ return Math.max(m,parseInt(it.getAttribute('data-at'),10)||0); },0);
        setInterval(function(){ items.forEach(function(it){ it.classList.remove('in'); var ty=it.querySelector('[data-type-text]'); if(ty){ ty.__typed=false; ty.textContent=''; } }); if(cur) cur.classList.remove('on'); items.forEach(function(it){ setTimeout(function(){ show(it); }, parseInt(it.getAttribute('data-at'),10)||0); }); }, last+loop); }
    });
  }
  function ready(){
    inject(); fit(); reveal(); initCycle(); initMock();
    Array.prototype.slice.call(document.querySelectorAll('canvas[data-particles]')).forEach(function(cv){
      var cs=getComputedStyle(document.documentElement); function rgb(v){ var m=v.trim().match(/#([0-9a-f]{6})/i); if(!m) return null; var h=m[1]; return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]; }
      particles(cv,{n:parseInt(cv.getAttribute('data-particles')||'60',10),link:parseInt(cv.getAttribute('data-link')||'170',10),alpha:parseFloat(cv.getAttribute('data-alpha')||'1'),seed:parseInt(cv.getAttribute('data-seed')||'7',10),c1:rgb(cs.getPropertyValue('--azure'))||[26,140,255],c2:rgb(cs.getPropertyValue('--violet'))||[155,77,255]});
    });
    window.__QP_READY=true;
    document.dispatchEvent(new CustomEvent('deck:ready',{detail:{static:IS_STATIC}}));
    try{ parent.postMessage({qpDeck:true,kind:'loaded',value:D.n},'*'); }catch(e){}
  }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',ready); } else { ready(); }
})();

${FX_JS}
/* self-check hook for the studio / player QA loop: window.QPLint() → { issues, stats, occupancy } */
window.QPLint=function(){ return ${LINT_JS}; };
`;
