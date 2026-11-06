/* ===== v2 · three.js scene kit (terrain / network / cubes / fireflies) — offline, inlined ===== */
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

  return {terrain:terrain,network:network,cubes:cubes,fireflies:fireflies};
})();
