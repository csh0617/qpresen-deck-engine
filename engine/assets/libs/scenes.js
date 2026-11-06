/* ===== v3 · three.js scene kit (terrain / network / cubes / fireflies / aurora / orbit / waves / particles / globe) — offline, inlined ===== */
window.DeckScenes=(function(){
  if(!window.THREE) return {};
  var T=window.THREE;
  function col(st,name,fallback){ var v=getComputedStyle(st).getPropertyValue(name).trim(); try{ return new T.Color(v||fallback); }catch(e){ return new T.Color(fallback); } }
  function dot(){ var c=document.createElement('canvas'); c.width=c.height=64; var g=c.getContext('2d'); var r=g.createRadialGradient(32,32,0,32,32,32);
    r.addColorStop(0,'rgba(255,255,255,1)'); r.addColorStop(.35,'rgba(255,255,255,.75)'); r.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=r; g.fillRect(0,0,64,64);
    var t=new T.CanvasTexture(c); t.needsUpdate=true; return t; }
  function renderer(box){
    var r=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
    r.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75)); r.setSize(1920,1080,false);
    r.domElement.style.width='100%'; r.domElement.style.height='100%'; box.appendChild(r.domElement); return r;
  }
  function loop(fn,opts){
    var t0=performance.now(), raf=null, alive=true;
    function frame(now){ if(!alive) return; fn((now-t0)/1000); raf=requestAnimationFrame(frame); }
    if(opts.static){ fn(4.2); return; }
    raf=requestAnimationFrame(frame);
    document.addEventListener('visibilitychange',function(){ if(document.hidden){ alive=false; cancelAnimationFrame(raf);} else if(!alive){ alive=true; t0=performance.now()-4200; raf=requestAnimationFrame(frame);} });
  }
  var mouse={x:0,y:0};
  window.addEventListener('pointermove',function(e){ mouse.x=e.clientX/window.innerWidth-.5; mouse.y=e.clientY/window.innerHeight-.5; },{passive:true});

  /* ---------- terrain: waving point-field (data fields) ---------- */
  function terrain(box,st,o,opts){
    var r=renderer(box), sc=new T.Scene();
    var cam=new T.PerspectiveCamera(42,1920/1080,1,6000); cam.position.set(0,(o.camY||150),(o.camZ||980)); cam.lookAt(0,(o.lookY||-120),0);
    var c1=col(st,'--f','#1F4FD8'), c2=new T.Color(o.c2||'#ffffff');
    var W=o.w||3400,Hh=o.h||2200, seg=o.seg||170, seg2=o.seg2||110;
    var geo=new T.PlaneGeometry(W,Hh,seg,seg2);
    var uni={uTime:{value:0},uAmp:{value:o.amp||90},uC1:{value:c1},uC2:{value:c2},uTex:{value:dot()},uOp:{value:o.op!=null?o.op:.9},uSize:{value:o.size||2.4},uPR:{value:r.getPixelRatio()}};
    var vs='uniform float uTime;uniform float uAmp;uniform float uSize;uniform float uPR;varying float vH;varying float vA;\n'+
      'void main(){vec3 p=position;float h=sin(p.x*0.011+uTime*0.55)*0.6+cos(p.y*0.015-uTime*0.42)*0.5+sin((p.x+p.y)*0.0065+uTime*0.3)*0.9+sin(p.x*0.03-uTime*0.9)*0.15;'+
      'p.z+=h*uAmp;vH=clamp((h+2.1)/4.2,0.0,1.0);vec4 mv=modelViewMatrix*vec4(p,1.0);gl_PointSize=(uSize+vH*3.2)*(820.0/-mv.z)*uPR;gl_Position=projectionMatrix*mv;'+
      'vA=clamp(1.0-(-mv.z-500.0)/2600.0,0.0,1.0);}';
    var fs='uniform vec3 uC1;uniform vec3 uC2;uniform sampler2D uTex;uniform float uOp;varying float vH;varying float vA;\n'+
      'void main(){vec4 t=texture2D(uTex,gl_PointCoord);vec3 c=mix(uC1,uC2,vH*0.85);gl_FragColor=vec4(c,t.a*vA*uOp*(0.45+vH*0.8));}';
    var mat=new T.ShaderMaterial({uniforms:uni,vertexShader:vs,fragmentShader:fs,transparent:true,depthWrite:false,blending:T.AdditiveBlending});
    var pts=new T.Points(geo,mat); pts.rotation.x=-(o.tilt||1.18); pts.position.y=o.y||-230; sc.add(pts);
    if(o.lines!==false){
      var lgeo=new T.WireframeGeometry(new T.PlaneGeometry(W,Hh,Math.round(seg/5),Math.round(seg2/5)));
      var lvs='uniform float uTime;uniform float uAmp;varying float vA;void main(){vec3 p=position;float h=sin(p.x*0.011+uTime*0.55)*0.6+cos(p.y*0.015-uTime*0.42)*0.5+sin((p.x+p.y)*0.0065+uTime*0.3)*0.9+sin(p.x*0.03-uTime*0.9)*0.15;p.z+=h*uAmp;vec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;vA=clamp(1.0-(-mv.z-500.0)/2600.0,0.0,1.0);}';
      var lfs='uniform vec3 uC1;uniform float uOp;varying float vA;void main(){gl_FragColor=vec4(uC1,vA*uOp*0.16);}';
      var lmat=new T.ShaderMaterial({uniforms:uni,vertexShader:lvs,fragmentShader:lfs,transparent:true,depthWrite:false,blending:T.AdditiveBlending});
      var ln=new T.LineSegments(lgeo,lmat); ln.rotation.x=pts.rotation.x; ln.position.y=pts.position.y; sc.add(ln);
    }
    loop(function(t){ uni.uTime.value=t; cam.position.x+=((mouse.x*60)-cam.position.x)*.04; cam.position.y+=(((o.camY||150)-mouse.y*30)-cam.position.y)*.04; cam.lookAt(0,(o.lookY||-120),0); r.render(sc,cam); },opts);
  }

  /* ---------- network: drifting nodes + proximity links ---------- */
  function network(box,st,o,opts){
    var r=renderer(box), sc=new T.Scene();
    var cam=new T.PerspectiveCamera(45,1920/1080,1,5000); cam.position.set(0,0,o.camZ||1150);
    var c1=col(st,'--f','#7C3AED'), c2=col(st,'--f-alt','#DB2777');
    var BL=o.light?T.NormalBlending:T.AdditiveBlending; var POP=o.light?(o.pop||.55):.95;
    var N=o.n||170, BX=o.bx||1500, BY=o.by||820, BZ=o.bz||600, R=o.link||230;
    var pos=new Float32Array(N*3), vel=new Float32Array(N*3), siz=new Float32Array(N);
    for(var i=0;i<N;i++){ pos[i*3]=(Math.random()-.5)*BX; pos[i*3+1]=(Math.random()-.5)*BY; pos[i*3+2]=(Math.random()-.5)*BZ;
      vel[i*3]=(Math.random()-.5)*.5; vel[i*3+1]=(Math.random()-.5)*.5; vel[i*3+2]=(Math.random()-.5)*.3; siz[i]=6+Math.random()*12; }
    var g=new T.BufferGeometry(); g.setAttribute('position',new T.BufferAttribute(pos,3)); g.setAttribute('aSize',new T.BufferAttribute(siz,1));
    var uni={uTex:{value:dot()},uC1:{value:c1},uC2:{value:c2},uTime:{value:0},uPR:{value:r.getPixelRatio()}};
    uni.uPop={value:POP};
    var pm=new T.ShaderMaterial({uniforms:uni,transparent:true,depthWrite:false,blending:BL,
      vertexShader:'attribute float aSize;uniform float uTime;uniform float uPR;varying float vK;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);float pulse=0.85+0.15*sin(uTime*2.0+position.x*0.01);gl_PointSize=aSize*pulse*(900.0/-mv.z)*uPR;vK=clamp((position.z+300.0)/600.0,0.0,1.0);gl_Position=projectionMatrix*mv;}',
      fragmentShader:'uniform sampler2D uTex;uniform vec3 uC1;uniform vec3 uC2;uniform float uPop;varying float vK;void main(){vec4 t=texture2D(uTex,gl_PointCoord);gl_FragColor=vec4(mix(uC1,uC2,vK),t.a*uPop);}'});
    var pts=new T.Points(g,pm);
    var MAXL=N*6; var lpos=new Float32Array(MAXL*2*3), lcol=new Float32Array(MAXL*2*3);
    var lg=new T.BufferGeometry(); lg.setAttribute('position',new T.BufferAttribute(lpos,3)); lg.setAttribute('color',new T.BufferAttribute(lcol,3));
    var lm=new T.LineBasicMaterial({vertexColors:true,transparent:true,opacity:o.lop||.55,blending:BL,depthWrite:false});
    var lines=new T.LineSegments(lg,lm);
    var grp=new T.Group(); grp.add(pts); grp.add(lines); grp.position.set(o.ox||0,o.oy||0,0); sc.add(grp);
    function step(dt){
      for(var i=0;i<N;i++){ for(var k=0;k<3;k++){ var idx=i*3+k; pos[idx]+=vel[idx]*dt*60; var lim=[BX,BY,BZ][k]/2; if(pos[idx]>lim||pos[idx]<-lim) vel[idx]*=-1; } }
      var n=0;
      for(var a=0;a<N;a++){ for(var b=a+1;b<N;b++){ if(n>=MAXL) break;
        var dx=pos[a*3]-pos[b*3], dy=pos[a*3+1]-pos[b*3+1], dz=pos[a*3+2]-pos[b*3+2]; var d2=dx*dx+dy*dy+dz*dz;
        if(d2<R*R){ var d=Math.sqrt(d2); var w=(1-d/R); var cc=c1.clone().lerp(c2,(pos[a*3+2]+300)/600).multiplyScalar(w*0.9);
          lpos[n*6]=pos[a*3];lpos[n*6+1]=pos[a*3+1];lpos[n*6+2]=pos[a*3+2];lpos[n*6+3]=pos[b*3];lpos[n*6+4]=pos[b*3+1];lpos[n*6+5]=pos[b*3+2];
          lcol[n*6]=cc.r;lcol[n*6+1]=cc.g;lcol[n*6+2]=cc.b;lcol[n*6+3]=cc.r;lcol[n*6+4]=cc.g;lcol[n*6+5]=cc.b; n++; } } }
      lg.setDrawRange(0,n*2); lg.attributes.position.needsUpdate=true; lg.attributes.color.needsUpdate=true; g.attributes.position.needsUpdate=true;
    }
    var last=0;
    loop(function(t){ var dt=Math.min(.05,t-last); last=t; step(opts.static?0.016:dt); uni.uTime.value=t;
      grp.rotation.y=t*(o.spin||.045)+mouse.x*.25; grp.rotation.x=mouse.y*.15; r.render(sc,cam); },opts);
  }

  /* ---------- cubes: floating glass wire-blocks ---------- */
  function cubes(box,st,o,opts){
    var r=renderer(box), sc=new T.Scene();
    var cam=new T.PerspectiveCamera(42,1920/1080,1,6000); cam.position.set(0,40,o.camZ||1300);
    var c1=col(st,'--f','#1F4FD8'), c2=col(st,'--f-alt','#6D28D9');
    sc.add(new T.AmbientLight(0xffffff,.9)); var pl=new T.PointLight(0xffffff,1.2,0); pl.position.set(400,500,900); sc.add(pl);
    var grp=new T.Group(); grp.position.set(o.ox||0,o.oy||0,0); sc.add(grp); var items=[];
    var N=o.n||34;
    for(var i=0;i<N;i++){
      var s=60+Math.random()*150; var geo=new T.BoxGeometry(s,s,s);
      var k=Math.random(); var cc=c1.clone().lerp(c2,k);
      var mesh=new T.Mesh(geo,new T.MeshPhysicalMaterial({color:cc,transparent:true,opacity:.07,roughness:.15,metalness:.1,side:T.DoubleSide,depthWrite:false}));
      var edge=new T.LineSegments(new T.EdgesGeometry(geo),new T.LineBasicMaterial({color:cc,transparent:true,opacity:.5+Math.random()*.35}));
      var gg=new T.Group(); gg.add(mesh); gg.add(edge);
      gg.position.set((Math.random()-.5)*(o.bx||1900),(Math.random()-.5)*(o.by||1000),(Math.random()-.5)*(o.bz||900));
      gg.rotation.set(Math.random()*3,Math.random()*3,Math.random()*3);
      items.push({g:gg,rx:(Math.random()-.5)*.25,ry:(Math.random()-.5)*.3,ph:Math.random()*6.3,amp:18+Math.random()*30,y0:gg.position.y});
      grp.add(gg);
    }
    loop(function(t){ items.forEach(function(it){ it.g.rotation.x+=it.rx*.016; it.g.rotation.y+=it.ry*.016; it.g.position.y=it.y0+Math.sin(t*.6+it.ph)*it.amp; });
      grp.rotation.y=mouse.x*.18+t*.02; grp.rotation.x=mouse.y*.1; r.render(sc,cam); },opts);
  }

  /* ---------- fireflies: drifting glowing motes ---------- */
  function fireflies(box,st,o,opts){
    var r=renderer(box), sc=new T.Scene();
    var cam=new T.PerspectiveCamera(50,1920/1080,1,4000); cam.position.set(0,0,o.camZ||900);
    var c1=col(st,'--f','#E07B00'), c2=new T.Color(o.c2||'#FFD24D');
    var N=o.n||520, BX=o.bx||2200, BY=o.by||1300, BZ=o.bz||900;
    var pos=new Float32Array(N*3), ph=new Float32Array(N), sz=new Float32Array(N), sp=new Float32Array(N);
    for(var i=0;i<N;i++){ pos[i*3]=(Math.random()-.5)*BX; pos[i*3+1]=(Math.random()-.5)*BY; pos[i*3+2]=(Math.random()-.5)*BZ; ph[i]=Math.random()*6.28; sz[i]=4+Math.random()*14; sp[i]=.3+Math.random()*.9; }
    var g=new T.BufferGeometry(); g.setAttribute('position',new T.BufferAttribute(pos,3)); g.setAttribute('aPh',new T.BufferAttribute(ph,1)); g.setAttribute('aSz',new T.BufferAttribute(sz,1)); g.setAttribute('aSp',new T.BufferAttribute(sp,1));
    var uni={uTime:{value:0},uTex:{value:dot()},uC1:{value:c1},uC2:{value:c2},uOp:{value:o.op!=null?o.op:.85},uPR:{value:r.getPixelRatio()}};
    var m=new T.ShaderMaterial({uniforms:uni,transparent:true,depthWrite:false,blending:T.AdditiveBlending,
      vertexShader:'attribute float aPh;attribute float aSz;attribute float aSp;uniform float uTime;uniform float uPR;varying float vA;varying float vK;void main(){vec3 p=position;p.y+=sin(uTime*aSp+aPh)*28.0+uTime*aSp*9.0;p.y=mod(p.y+650.0,1300.0)-650.0;p.x+=cos(uTime*aSp*0.7+aPh)*18.0;vec4 mv=modelViewMatrix*vec4(p,1.0);float tw=0.55+0.45*sin(uTime*(1.2+aSp)+aPh*3.0);gl_PointSize=aSz*tw*(700.0/-mv.z)*uPR;vA=tw;vK=fract(aPh);gl_Position=projectionMatrix*mv;}',
      fragmentShader:'uniform sampler2D uTex;uniform vec3 uC1;uniform vec3 uC2;uniform float uOp;varying float vA;varying float vK;void main(){vec4 t=texture2D(uTex,gl_PointCoord);gl_FragColor=vec4(mix(uC1,uC2,vK),t.a*vA*uOp);}'});
    var pts=new T.Points(g,m); sc.add(pts);
    loop(function(t){ uni.uTime.value=t; pts.rotation.y=mouse.x*.12; pts.rotation.x=mouse.y*.08; r.render(sc,cam); },opts);
  }

  /* ---------- aurora: slow translucent ribbons (light curtains) ---------- */
  function aurora(box,st,o,opts){
    var r=renderer(box), sc=new T.Scene();
    var cam=new T.PerspectiveCamera(40,1920/1080,1,5000); cam.position.set(0,0,o.camZ||1100);
    var c1=col(st,'--f','#22D3EE'), c2=col(st,'--f-alt','#A78BFA'); var N=o.n||5, grp=new T.Group(); sc.add(grp); var mats=[];
    for(var i=0;i<N;i++){
      var geo=new T.PlaneGeometry(o.w||2600,o.h||420,160,8);
      var uni={uTime:{value:0},uSeed:{value:i*1.7},uC1:{value:c1.clone().lerp(c2,i/Math.max(1,N-1))},uC2:{value:c2},uOp:{value:(o.op!=null?o.op:.22)}};
      var vs='uniform float uTime;uniform float uSeed;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;p.y+=sin(p.x*0.0035+uTime*0.35+uSeed)*120.0+sin(p.x*0.011-uTime*0.22+uSeed*2.0)*40.0;p.z+=cos(p.x*0.004+uTime*0.3+uSeed)*160.0;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}';
      var fs='uniform vec3 uC1;uniform vec3 uC2;uniform float uOp;uniform float uTime;uniform float uSeed;varying vec2 vUv;void main(){float e=smoothstep(0.0,0.35,vUv.y)*smoothstep(1.0,0.55,vUv.y);float s=0.75+0.25*sin(vUv.x*18.0+uTime*0.9+uSeed);gl_FragColor=vec4(mix(uC1,uC2,vUv.x),e*s*uOp);}';
      var m=new T.ShaderMaterial({uniforms:uni,vertexShader:vs,fragmentShader:fs,transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide});
      var mesh=new T.Mesh(geo,m); mesh.position.set(0,(i-(N-1)/2)*(o.gap||150)+(o.oy||120),-i*60); mesh.rotation.x=-(o.tilt||0.55); grp.add(mesh); mats.push(uni);
    }
    loop(function(t){ mats.forEach(function(u){ u.uTime.value=t; }); grp.rotation.y=mouse.x*.12; grp.rotation.x=mouse.y*.06; r.render(sc,cam); },opts);
  }

  /* ---------- orbit: tilted rings with satellites around a glowing core ---------- */
  function orbit(box,st,o,opts){
    var r=renderer(box), sc=new T.Scene();
    var cam=new T.PerspectiveCamera(42,1920/1080,1,6000); cam.position.set(0,120,o.camZ||1500); cam.lookAt(0,0,0);
    var c1=col(st,'--f','#1F4FD8'), c2=col(st,'--f-alt','#06B6D4'); var grp=new T.Group(); grp.position.set(o.ox||380,o.oy||-40,0); sc.add(grp);
    var tex=dot(); var rings=[]; var R=o.rings||4;
    var core=new T.Sprite(new T.SpriteMaterial({map:tex,color:c2,transparent:true,opacity:.9,blending:T.AdditiveBlending,depthWrite:false})); core.scale.set(260,260,1); grp.add(core);
    for(var i=0;i<R;i++){ var rad=(o.r0||220)+i*(o.dr||120); var pts=[]; for(var k=0;k<=160;k++){ var a=k/160*Math.PI*2; pts.push(new T.Vector3(Math.cos(a)*rad,0,Math.sin(a)*rad)); }
      var lg=new T.BufferGeometry().setFromPoints(pts); var lm=new T.LineBasicMaterial({color:c1.clone().lerp(c2,i/R),transparent:true,opacity:.45-i*.06,blending:T.AdditiveBlending,depthWrite:false});
      var ring=new T.Line(lg,lm); var g=new T.Group(); g.add(ring); g.rotation.set((o.tilt||1.05)+i*.08,0,i*.5); grp.add(g);
      var sats=[]; var ns=2+(i%3); for(var j=0;j<ns;j++){ var sp=new T.Sprite(new T.SpriteMaterial({map:tex,color:j%2?c2:c1,transparent:true,opacity:.95,blending:T.AdditiveBlending,depthWrite:false})); sp.scale.set(22+j*6,22+j*6,1); g.add(sp); sats.push({s:sp,ph:j/ns*Math.PI*2,sp:(.35-i*.05)*(j%2?1:-1)}); }
      rings.push({g:g,rad:rad,sats:sats,i:i}); }
    loop(function(t){ rings.forEach(function(rg){ rg.g.rotation.y=t*(.05+rg.i*.01); rg.sats.forEach(function(sa){ var a=sa.ph+t*sa.sp; sa.s.position.set(Math.cos(a)*rg.rad,0,Math.sin(a)*rg.rad); }); });
      core.material.opacity=.75+Math.sin(t*1.4)*.15; grp.rotation.y=mouse.x*.3; grp.rotation.x=mouse.y*.15; r.render(sc,cam); },opts);
  }

  /* ---------- waves: wireframe sea — rolling line field seen from the shore ---------- */
  function waves(box,st,o,opts){
    var r=renderer(box), sc=new T.Scene();
    var cam=new T.PerspectiveCamera(48,1920/1080,1,8000); cam.position.set(0,(o.camY||240),(o.camZ||900)); cam.lookAt(0,-140,-600);
    var c1=col(st,'--f','#0EA5E9'), c2=col(st,'--f-alt','#8B5CF6');
    var W=o.w||4200, D=o.d||3200, nx=o.nx||70, nz=o.nz||44; var pos=new Float32Array(nx*nz*3); var idx=[]; 
    for(var z=0;z<nz;z++) for(var x=0;x<nx;x++){ var i=(z*nx+x)*3; pos[i]=(x/(nx-1)-.5)*W; pos[i+1]=0; pos[i+2]=-(z/(nz-1))*D; if(x<nx-1) idx.push(z*nx+x,z*nx+x+1); if(z<nz-1&&(x%3===0)) idx.push(z*nx+x,(z+1)*nx+x); }
    var geo=new T.BufferGeometry(); geo.setAttribute('position',new T.BufferAttribute(pos,3)); geo.setIndex(idx);
    var uni={uTime:{value:0},uC1:{value:c1},uC2:{value:c2},uAmp:{value:o.amp||70},uOp:{value:o.op!=null?o.op:.55}};
    var vs='uniform float uTime;uniform float uAmp;varying float vA;varying float vH;void main(){vec3 p=position;float h=sin(p.x*0.004+uTime*0.9)*0.5+sin(p.z*0.006-uTime*0.7)*0.8+sin((p.x+p.z)*0.0025+uTime*0.5)*0.6;p.y=h*uAmp;vH=clamp((h+1.9)/3.8,0.0,1.0);vec4 mv=modelViewMatrix*vec4(p,1.0);vA=clamp(1.0-(-mv.z-300.0)/3200.0,0.0,1.0);gl_Position=projectionMatrix*mv;}';
    var fs='uniform vec3 uC1;uniform vec3 uC2;uniform float uOp;varying float vA;varying float vH;void main(){gl_FragColor=vec4(mix(uC1,uC2,vH),vA*uOp*(0.35+vH*0.65));}';
    var mat=new T.ShaderMaterial({uniforms:uni,vertexShader:vs,fragmentShader:fs,transparent:true,depthWrite:false,blending:T.AdditiveBlending});
    var lines=new T.LineSegments(geo,mat); lines.position.y=o.y||-200; sc.add(lines);
    loop(function(t){ uni.uTime.value=t; cam.position.x+=((mouse.x*80)-cam.position.x)*.04; cam.lookAt(0,-140,-600); r.render(sc,cam); },opts);
  }

  /* ---------- particles: data streams flowing along curved lanes ---------- */
  function particles(box,st,o,opts){
    var r=renderer(box), sc=new T.Scene();
    var cam=new T.PerspectiveCamera(45,1920/1080,1,5000); cam.position.set(0,0,o.camZ||1100);
    var c1=col(st,'--f','#22C55E'), c2=col(st,'--f-alt','#06B6D4'); var L=o.lanes||7, PER=o.per||90, N=L*PER;
    var pos=new Float32Array(N*3), aT=new Float32Array(N), aLane=new Float32Array(N), aSz=new Float32Array(N);
    for(var i=0;i<N;i++){ aT[i]=Math.random(); aLane[i]=Math.floor(i/PER); aSz[i]=4+Math.random()*10; }
    var g=new T.BufferGeometry(); g.setAttribute('position',new T.BufferAttribute(pos,3)); g.setAttribute('aT',new T.BufferAttribute(aT,1)); g.setAttribute('aLane',new T.BufferAttribute(aLane,1)); g.setAttribute('aSz',new T.BufferAttribute(aSz,1));
    var uni={uTime:{value:0},uTex:{value:dot()},uC1:{value:c1},uC2:{value:c2},uPR:{value:r.getPixelRatio()},uL:{value:L},uSpeed:{value:o.speed||.09},uOp:{value:o.op!=null?o.op:.9}};
    var vs='attribute float aT;attribute float aLane;attribute float aSz;uniform float uTime;uniform float uPR;uniform float uL;uniform float uSpeed;varying float vK;varying float vA;'+
      'void main(){float t=fract(aT+uTime*uSpeed*(0.6+0.4*aLane/uL));float lane=(aLane-(uL-1.0)/2.0);float x=(t-0.5)*2600.0;float y=lane*110.0+sin(t*6.283+lane)*90.0+sin(x*0.004+uTime*0.6)*40.0;float z=cos(t*6.283*0.5+lane*1.3)*220.0;vK=aLane/uL;vA=sin(t*3.1416);vec4 mv=modelViewMatrix*vec4(x,y,z,1.0);gl_PointSize=aSz*(900.0/-mv.z)*uPR;gl_Position=projectionMatrix*mv;}';
    var fs='uniform sampler2D uTex;uniform vec3 uC1;uniform vec3 uC2;uniform float uOp;varying float vK;varying float vA;void main(){vec4 t=texture2D(uTex,gl_PointCoord);gl_FragColor=vec4(mix(uC1,uC2,vK),t.a*vA*uOp);}';
    var m=new T.ShaderMaterial({uniforms:uni,vertexShader:vs,fragmentShader:fs,transparent:true,depthWrite:false,blending:T.AdditiveBlending});
    var pts=new T.Points(g,m); pts.position.set(o.ox||0,o.oy||-60,0); pts.rotation.z=o.rot||-.12; sc.add(pts);
    loop(function(t){ uni.uTime.value=t; pts.rotation.y=mouse.x*.15; pts.rotation.x=mouse.y*.1; r.render(sc,cam); },opts);
  }

  /* ---------- globe: point sphere with arcs (global reach) ---------- */
  function globe(box,st,o,opts){
    var r=renderer(box), sc=new T.Scene();
    var cam=new T.PerspectiveCamera(40,1920/1080,1,6000); cam.position.set(0,0,o.camZ||1500);
    var c1=col(st,'--f','#38BDF8'), c2=col(st,'--f-alt','#A78BFA'); var R=o.r||420, N=o.n||2600; var grp=new T.Group(); grp.position.set(o.ox||430,o.oy||-60,0); sc.add(grp);
    var pos=new Float32Array(N*3), sz=new Float32Array(N); var phi=Math.PI*(3-Math.sqrt(5));
    for(var i=0;i<N;i++){ var y=1-(i/(N-1))*2; var rad=Math.sqrt(1-y*y); var th=phi*i; pos[i*3]=Math.cos(th)*rad*R; pos[i*3+1]=y*R; pos[i*3+2]=Math.sin(th)*rad*R; sz[i]=3+Math.random()*4; }
    var g=new T.BufferGeometry(); g.setAttribute('position',new T.BufferAttribute(pos,3)); g.setAttribute('aSz',new T.BufferAttribute(sz,1));
    var uni={uTex:{value:dot()},uC1:{value:c1},uC2:{value:c2},uPR:{value:r.getPixelRatio()},uOp:{value:o.op!=null?o.op:.85}};
    var pm=new T.ShaderMaterial({uniforms:uni,transparent:true,depthWrite:false,blending:T.AdditiveBlending,
      vertexShader:'attribute float aSz;uniform float uPR;varying float vK;varying float vF;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);vK=(position.y/420.0+1.0)*0.5;vF=clamp((mv.z+1500.0+420.0)/840.0,0.0,1.0);gl_PointSize=aSz*(1500.0/-mv.z)*uPR;gl_Position=projectionMatrix*mv;}',
      fragmentShader:'uniform sampler2D uTex;uniform vec3 uC1;uniform vec3 uC2;uniform float uOp;varying float vK;varying float vF;void main(){vec4 t=texture2D(uTex,gl_PointCoord);gl_FragColor=vec4(mix(uC1,uC2,vK),t.a*uOp*(0.25+0.75*vF));}'});
    grp.add(new T.Points(g,pm));
    var arcs=[]; var A=o.arcs||7;
    function rnd(){ var i=Math.floor(Math.random()*N); return new T.Vector3(pos[i*3],pos[i*3+1],pos[i*3+2]); }
    for(var k=0;k<A;k++){ var a=rnd(), b=rnd(); var mid=a.clone().add(b).multiplyScalar(.5).normalize().multiplyScalar(R*(1.25+Math.random()*.35)); var curve=new T.QuadraticBezierCurve3(a,mid,b); var cp=curve.getPoints(60);
      var lg=new T.BufferGeometry().setFromPoints(cp); var lm=new T.LineBasicMaterial({color:k%2?c2:c1,transparent:true,opacity:.0,blending:T.AdditiveBlending,depthWrite:false}); var ln=new T.Line(lg,lm); grp.add(ln); arcs.push({l:ln,ph:Math.random()*8}); }
    loop(function(t){ grp.rotation.y=t*(o.spin||.08)+mouse.x*.3; grp.rotation.x=.3+mouse.y*.15; arcs.forEach(function(ar){ ar.l.material.opacity=Math.max(0,Math.sin(t*.6+ar.ph))*.8; }); r.render(sc,cam); },opts);
  }

  return {terrain:terrain,network:network,cubes:cubes,fireflies:fireflies,aurora:aurora,orbit:orbit,waves:waves,particles:particles,globe:globe};
})();
