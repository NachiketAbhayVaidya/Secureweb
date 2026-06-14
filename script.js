/* =====================================================
   ABHEDYA SECURITY — Three.js World v4
   + Mobile joystick   + Full light theme (buildings)
   + Guard spotlight   + Fixed panels
   ===================================================== */

// ── EMAILJS ───────────────────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';
try{if(typeof emailjs!=='undefined'&&EMAILJS_PUBLIC_KEY!=='YOUR_PUBLIC_KEY')emailjs.init(EMAILJS_PUBLIC_KEY);}catch(e){}

// ── FORCE-DISMISS ─────────────────────────────────────────────────────────────
const FORCE_DISMISS=setTimeout(startWorld,5000);
const lsBar=document.getElementById('lsBar');
const lsHint=document.getElementById('lsHint');
const HINTS=['Building world…','Deploying guard…','Lighting up zones…','Ready to patrol!'];
let loadPct=0;
const loadTick=setInterval(()=>{
  loadPct+=Math.random()*20+10;
  if(loadPct>=100){loadPct=100;clearInterval(loadTick);startWorld();}
  if(lsBar)lsBar.style.width=loadPct+'%';
  if(lsHint)lsHint.textContent=HINTS[Math.min(3,Math.floor(loadPct/26))];
},180);
function startWorld(){
  clearTimeout(FORCE_DISMISS);clearInterval(loadTick);
  const ls=document.getElementById('loadingScreen');
  if(!ls||ls.style.display==='none')return;
  ls.classList.add('fade-out');
  setTimeout(()=>{ls.style.display='none';},900);
}

// ── DETECT MOBILE ─────────────────────────────────────────────────────────────
const isMobile=()=>window.innerWidth<=900||('ontouchstart' in window);

try{

// ── SCENE ────────────────────────────────────────────────────────────────────
const canvas=document.getElementById('threeCanvas');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.setClearColor(0x07111f);

const scene=new THREE.Scene();
scene.fog=new THREE.Fog(0x07111f,50,200);

const camera=new THREE.PerspectiveCamera(55,window.innerWidth/window.innerHeight,0.1,200);
camera.position.set(0,28,105);camera.lookAt(0,2,80);

window.addEventListener('resize',()=>{
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
});

// ── LIGHTS ───────────────────────────────────────────────────────────────────
const ambient=new THREE.AmbientLight(0x3355aa,1.4);scene.add(ambient);
const sun=new THREE.DirectionalLight(0xfff5e0,1.2);
sun.position.set(20,40,20);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left=-70;sun.shadow.camera.right=70;
sun.shadow.camera.top=70;sun.shadow.camera.bottom=-70;sun.shadow.camera.far=120;
scene.add(sun);
const moonLight=new THREE.PointLight(0x6688cc,1.2,80);
moonLight.position.set(-20,25,-15);scene.add(moonLight);
const guardLight=new THREE.PointLight(0xfff8e0,1.8,14);guardLight.castShadow=false;scene.add(guardLight);
const guardFill=new THREE.PointLight(0xffeedd,0.6,22);scene.add(guardFill);

// ── MATERIAL REGISTRY (for theme switching) ───────────────────────────────────
// Every themeable mesh is registered here so we can recolor on theme change
const themeMats={
  ground:null, grid:null,
  hqMain:[], hqAccent:[], hqWindow:[],
  corporate:[], corporateGlass:[],
  gate:[], booth:[],
  fireZone:[], nightTower:[],
  residential:[], residentialRoof:[],
  industrial:[], industrialChimney:[],
  trees:[], treeTops:[],
  stars:null, moon:null, halo:null,
};

// ── HELPERS ──────────────────────────────────────────────────────────────────
function box(w,h,d,col,x,y,z,group,tag){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color:col}));
  m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;
  (group||scene).add(m);
  if(tag&&themeMats[tag])themeMats[tag].push(m.material);
  return m;
}
function cyl(rt,rb,h,s,col,x,y,z,tag){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,s),new THREE.MeshLambertMaterial({color:col}));
  m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);
  if(tag&&themeMats[tag])themeMats[tag].push(m.material);
  return m;
}

// ── GROUND ───────────────────────────────────────────────────────────────────
const ground=new THREE.Mesh(new THREE.PlaneGeometry(400,400),new THREE.MeshLambertMaterial({color:0x111e2e}));
ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
themeMats.ground=ground.material;

const grid=new THREE.GridHelper(400,60,0x2a4878,0x182840);
grid.position.y=0.02;scene.add(grid);
themeMats.grid=grid.material;

// ── STARS / MOON ─────────────────────────────────────────────────────────────
const starArr=new Float32Array(800*3);
for(let i=0;i<800;i++){starArr[i*3]=(Math.random()-.5)*300;starArr[i*3+1]=Math.random()*80+20;starArr[i*3+2]=(Math.random()-.5)*300;}
const starGeo=new THREE.BufferGeometry();starGeo.setAttribute('position',new THREE.BufferAttribute(starArr,3));
const stars=new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xffffff,size:0.3,transparent:true,opacity:0.7}));
scene.add(stars);themeMats.stars=stars.material;

const moonMesh=new THREE.Mesh(new THREE.SphereGeometry(2.5,16,16),new THREE.MeshBasicMaterial({color:0xfff5c0}));
moonMesh.position.set(-30,45,-40);scene.add(moonMesh);themeMats.moon=moonMesh.material;
const haloMesh=new THREE.Mesh(new THREE.RingGeometry(3,5,32),new THREE.MeshBasicMaterial({color:0xfff5c0,transparent:true,opacity:0.08,side:THREE.DoubleSide}));
haloMesh.position.copy(moonMesh.position);scene.add(haloMesh);themeMats.halo=haloMesh.material;

// ── SUN (light theme) ─────────────────────────────────────────────────────────
const sunSphere=new THREE.Mesh(new THREE.SphereGeometry(2,12,12),new THREE.MeshBasicMaterial({color:0xfffaaa}));
sunSphere.position.set(30,48,-30);scene.add(sunSphere);sunSphere.visible=false;

// ══════════════════════════════════════════════════════════════════════════════
// ROAD-BASED TOWN LAYOUT
// Main road: x=−4..+4 running along Z axis from z=+48 to z=−45
// Sites alternate LEFT (x≈−16) and RIGHT (x≈+16) along the road
// ══════════════════════════════════════════════════════════════════════════════

// ── MAIN ROAD (tarmac strip) ─────────────────────────────────────────────────
const roadMat=new THREE.MeshLambertMaterial({color:0x1a1a22});
const road=new THREE.Mesh(new THREE.PlaneGeometry(8,200),roadMat);
road.rotation.x=-Math.PI/2; road.position.set(0,0.02,-10); road.receiveShadow=true; scene.add(road);
// Road centre dashes
for(let i=-80;i<88;i+=6){
  const dash=new THREE.Mesh(new THREE.PlaneGeometry(0.3,3),new THREE.MeshBasicMaterial({color:0xd4b800}));
  dash.rotation.x=-Math.PI/2; dash.position.set(0,0.04,i); scene.add(dash);
}
// Road edges (white lines)
[-4,4].forEach(ex=>{
  const edge=new THREE.Mesh(new THREE.PlaneGeometry(0.2,100),new THREE.MeshBasicMaterial({color:0xffffff,opacity:0.5,transparent:true}));
  edge.rotation.x=-Math.PI/2; edge.position.set(ex,0.04,-10); scene.add(edge);
});
// Street lamps along road
[-70,-55,-40,-25,-10,5,20,35,50,65].forEach(lz=>{
  [-5.5,5.5].forEach(lx=>{
    box(0.15,5,0.15,0x334455,lx,2.5,lz);
    box(1.2,0.12,0.12,0x334455,lx+(lx<0?0.6:-0.6),5,lz);
    const lamp=new THREE.PointLight(0xffe8a0,0.7,12);
    lamp.position.set(lx+(lx<0?1.2:-1.2),5,lz); scene.add(lamp);
  });
});
// Pavement / kerb strips
[-4.8,4.8].forEach(kx=>{
  const kerb=new THREE.Mesh(new THREE.PlaneGeometry(1.6,100),new THREE.MeshLambertMaterial({color:0x1e2535}));
  kerb.rotation.x=-Math.PI/2; kerb.position.set(kx,0.015,-10); kerb.receiveShadow=true; scene.add(kerb);
});

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: make a canvas texture sign
function makeSign(text,bg,fg,w=256,h=48){
  const c=document.createElement('canvas');c.width=w;c.height=h;
  const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,w,h);
  x.fillStyle=fg;x.font=`bold ${Math.floor(h*0.55)}px Arial`;x.textAlign='center';x.fillText(text,w/2,h*0.72);
  return new THREE.CanvasTexture(c);
}

// ─────────────────────────────────────────────────────────────────────────────
// SITE 1 — GATE (z=+42, centre of road — entrance arch)
// ─────────────────────────────────────────────────────────────────────────────
const GZ=80; // gate z
// Tall entrance pillars
box(1.2,7,1.2,0xb0a888,-4.8,3.5,GZ,null,'gate');
box(1.2,7,1.2,0xb0a888, 4.8,3.5,GZ,null,'gate');
// Pillar caps
box(1.5,0.4,1.5,0x988870,-4.8,7.2,GZ,null,'gate');
box(1.5,0.4,1.5,0x988870, 4.8,7.2,GZ,null,'gate');
// Arch crossbar
box(10.8,0.6,0.6,0xa09878,0,7.2,GZ,null,'gate');
box(10.8,0.25,1.0,0x887860,0,6.85,GZ,null,'gate'); // arch depth
// Sign on arch
const gM=new THREE.Mesh(new THREE.PlaneGeometry(5.5,0.9),new THREE.MeshBasicMaterial({map:makeSign('ABHEDYA SECURITY','#c8a030','#0a0800',320,56)}));
gM.position.set(0,7.2,GZ+0.32); scene.add(gM);
// LEFT door (closed iron gate)
const DOOR_COLS=[0x6a6a58,0x7a7a68];
for(let r=0;r<2;r++) box(3.5,0.12,0.12,0x888870,r===0?-2.25:-2.25,r===0?4.0:0.2,GZ,null,'gate');
box(0.12,4.0,0.12,0x888870,-0.6,2.1,GZ,null,'gate');
box(0.12,4.0,0.12,0x888870,-3.8,2.1,GZ,null,'gate');
box(3.3,0.12,0.12,0x888870,-2.2,2.1,GZ,null,'gate');
for(let b=0;b<6;b++) box(0.1,4.0,0.1,0x606058,-3.7+b*0.62,2.1,GZ,null,'gate');
// RIGHT door
for(let r=0;r<2;r++) box(3.5,0.12,0.12,0x888870, 2.25,r===0?4.0:0.2,GZ,null,'gate');
box(0.12,4.0,0.12,0x888870,0.6,2.1,GZ,null,'gate');
box(0.12,4.0,0.12,0x888870,3.8,2.1,GZ,null,'gate');
box(3.3,0.12,0.12,0x888870,2.2,2.1,GZ,null,'gate');
for(let b=0;b<6;b++) box(0.1,4.0,0.1,0x606058,0.65+b*0.62,2.1,GZ,null,'gate');
// Guard booth RIGHT side
box(2.6,3.8,2.6,0xc8c0b0,7.8,1.9,GZ,null,'booth');
box(2.8,0.25,2.8,0xa8a090,7.8,3.85,GZ,null,'booth');
box(2.6,0.1,2.6,0x585048,7.8,3.98,GZ,null,'booth');
// Booth window (front)
const bw=new THREE.Mesh(new THREE.PlaneGeometry(1.0,0.75),new THREE.MeshBasicMaterial({color:0x8ab8cc,opacity:0.55,transparent:true}));
bw.position.set(6.5,2.2,GZ+0.01); scene.add(bw);
// Booth door
box(0.65,2.1,0.08,0xb0a890,7.8,1.05,GZ+1.3,null,'booth');
// Boom barrier LEFT
const boomPost=box(0.25,2.5,0.25,0xccbba8,-6.0,1.25,GZ+1.5);
const boom=new THREE.Mesh(new THREE.BoxGeometry(4.0,0.14,0.14),new THREE.MeshLambertMaterial({color:0xdd2222}));
boom.position.set(-8.0,2.52,GZ+1.5); scene.add(boom);
// Red/white stripe on boom
for(let s=0;s<4;s++){
  const stripe=new THREE.Mesh(new THREE.BoxGeometry(0.35,0.15,0.16),new THREE.MeshBasicMaterial({color:s%2===0?0xdd2222:0xffffff}));
  stripe.position.set(-6.5+s*0.8,2.52,GZ+1.5); scene.add(stripe);
}

// ─────────────────────────────────────────────────────────────────────────────
// SITE 2 — ABHEDYA HQ (z=+25, LEFT side x=−16)
// ─────────────────────────────────────────────────────────────────────────────
const HX=-20, HZ=50;
// Main tower — 6 floors, detailed facade
box(10,24,9,0x142438,HX,12,HZ,null,'hqMain');
// Lobby base (wider, lighter)
box(11,3.5,10,0x1a3050,HX,1.75,HZ,null,'hqMain');
// Penthouse cap
box(7,5,7,0x0e1e32,HX,27.5,HZ,null,'hqMain');
box(4,2,4,0x0c1828,HX,31,HZ,null,'hqMain');
// Side annex
box(5,14,7,0x112030,HX-7.5,7,HZ,null,'hqMain');
// Column details on facade
[-2,0,2].forEach(cx=>box(0.4,24,0.4,0x1e3a5a,HX+cx,12,HZ+4.55,null,'hqMain'));
// Windows — 4 columns x 6 rows, centred on front face z=HZ+4
for(let r=0;r<6;r++) for(let c=0;c<4;c++){
  const w=new THREE.Mesh(new THREE.PlaneGeometry(1.2,1.1),new THREE.MeshBasicMaterial({color:0xaad4f8,opacity:0.75,transparent:true}));
  w.position.set(HX-4.5+c*3.0, 3.5+r*3.5, HZ+4.56); scene.add(w);
  themeMats.hqWindow.push(w.material);
}
// Night glow lining on windows
const hqLight=new THREE.PointLight(0x5599ff,0.5,20);hqLight.position.set(HX,10,HZ+6);scene.add(hqLight);
// HQ sign above lobby
const hqSgn=new THREE.Mesh(new THREE.PlaneGeometry(6.5,1.1),new THREE.MeshBasicMaterial({map:makeSign('ABHEDYA SECURITY SOLUTIONS','#182e4a','#D4AF37',384,64)}));
hqSgn.position.set(HX,3.8,HZ+5.01); scene.add(hqSgn);
// Flagpole
box(0.1,8,0.1,0xaaaaaa,HX+5.5,4,HZ+4,null,'hqMain');
const flag=new THREE.Mesh(new THREE.PlaneGeometry(2,1),new THREE.MeshBasicMaterial({color:0xff9900,side:THREE.DoubleSide}));
flag.position.set(HX+4.5,8,HZ+4); scene.add(flag);

// ─────────────────────────────────────────────────────────────────────────────
// SITE 3 — FIRE TRAINING (z=+10, LEFT x=−16)
// ─────────────────────────────────────────────────────────────────────────────
const FX=-20, FZ=20;
// Training shed
box(10,4,8,0x222830,FX,2,FZ,null,'fireZone');
box(10.4,0.4,8.4,0x1a2028,FX,4.2,FZ,null,'fireZone');
// Fire drill area in front
box(6,0.1,6,0x2a1a10,FX,0.06,FZ+7,null,'fireZone');
// Fire barrel
cyl(0.6,0.7,1.8,8,0x444444,FX,0.9,FZ+6,'fireZone');
const flameMeshes=[],flameColors=[0xff4400,0xff8800,0xffcc00];
for(let fi=0;fi<3;fi++){
  const fm=new THREE.Mesh(new THREE.ConeGeometry(0.38+fi*0.1,1.4+fi*0.35,6),new THREE.MeshBasicMaterial({color:flameColors[fi],transparent:true,opacity:0.88}));
  fm.position.set(FX+(fi-1)*0.5,1.9+fi*0.22,FZ+6); scene.add(fm); flameMeshes.push(fm);
}
// Extinguisher rack
box(0.3,1.2,0.3,0xcc2200,FX+2,0.6,FZ+6,null,'fireZone');
box(0.3,0.3,0.3,0x888888,FX+2,1.35,FZ+6,null,'fireZone');
box(0.3,1.2,0.3,0xcc2200,FX+2.8,0.6,FZ+6,null,'fireZone');
const fireGlow=new THREE.PointLight(0xff5500,2.0,14);fireGlow.position.set(FX,3,FZ+6);scene.add(fireGlow);
// Danger sign
const fsgn=new THREE.Mesh(new THREE.PlaneGeometry(3.5,0.8),new THREE.MeshBasicMaterial({map:makeSign('⚠ FIRE TRAINING AREA','#8b1a00','#ffcc00',280,48)}));
fsgn.position.set(FX,4.6,FZ+4.06); scene.add(fsgn);

// ─────────────────────────────────────────────────────────────────────────────
// SITE 4 — CORPORATE (z=−5, RIGHT x=+16)
// ─────────────────────────────────────────────────────────────────────────────
const CX=20, CZ=-10;
// Main glass tower
box(11,20,9,0x162040,CX,10,CZ,null,'corporate');
// Wide podium
box(13,3,11,0x1c2a48,CX,1.5,CZ,null,'corporate');
// Tower cap
box(8,3,7,0x101828,CX,22.5,CZ,null,'corporate');
// Glass facade strips — blue tinted
for(let f=0;f<6;f++){
  const fac=new THREE.Mesh(new THREE.PlaneGeometry(10,2.8),new THREE.MeshBasicMaterial({color:0x2060a0,opacity:0.45,transparent:true}));
  fac.position.set(CX,3.0+f*3.0,CZ+4.51); scene.add(fac);
  themeMats.corporateGlass.push(fac.material);
}
// Side columns
[-5,5].forEach(cx=>box(0.5,20,0.5,0x1a2848,CX+cx,10,CZ,null,'corporate'));
const corLight=new THREE.PointLight(0x4488ff,0.5,22);corLight.position.set(CX,12,CZ+6);scene.add(corLight);
// Corp sign
const csgn=new THREE.Mesh(new THREE.PlaneGeometry(6,1.0),new THREE.MeshBasicMaterial({map:makeSign('CORPORATE CAMPUS','#101828','#4aafff',320,56)}));
csgn.position.set(CX,3.7,CZ+4.52); scene.add(csgn);

// ─────────────────────────────────────────────────────────────────────────────
// SITE 5 — NIGHT WATCH TOWER (z=−5, RIGHT x=+28 — beside corp)
// ─────────────────────────────────────────────────────────────────────────────
const NX=32, NZ=-10;
// Concrete tower base
box(2.5,2,2.5,0x1a2838,NX,1,NZ,null,'nightTower');
cyl(0.45,0.55,14,10,0x182030,NX,7,NZ,'nightTower');
// Platform
box(4,0.3,4,0x1a2838,NX,14.15,NZ,null,'nightTower');
// Guard cabin on platform
box(3,2.5,3,0x101828,NX,15.65,NZ,null,'nightTower');
box(3.4,0.2,3.4,0x141e2e,NX,16.95,NZ,null,'nightTower');
// Searchlight head
cyl(0.35,0.45,0.6,8,0x888888,NX,17.3,NZ,'nightTower');
const spot=new THREE.SpotLight(0xffffcc,2.5,35,Math.PI/7,0.45);
spot.position.set(NX,17.5,NZ);spot.target.position.set(NX,0,NZ-8);scene.add(spot);scene.add(spot.target);
// Ladder bars
for(let l=0;l<7;l++) box(0.6,0.08,0.08,0x446688,NX+0.5,1.5+l*1.8,NZ+0.5,null,'nightTower');

// ─────────────────────────────────────────────────────────────────────────────
// SITE 6 — RESIDENTIAL (z=−22, RIGHT x=+16..+26)
// ─────────────────────────────────────────────────────────────────────────────
const RZ=-45;
const housePos=[[16,RZ],[22,RZ],[19,RZ-7],[25,RZ-4]];
const roofMats=[];
housePos.forEach(([hx,hz])=>{
  box(5,4.5,5,0x1e2e40,hx,2.25,hz,null,'residential');
  // Window pairs
  [[-1.2,1.2]].forEach(([wx1,wx2])=>{
    [2.5].forEach(wy=>{
      const w1=new THREE.Mesh(new THREE.PlaneGeometry(0.9,0.9),new THREE.MeshBasicMaterial({color:0xffe8a0,opacity:0.8,transparent:true}));
      w1.position.set(hx+wx1,wy,hz+2.51);scene.add(w1);
      const w2=new THREE.Mesh(new THREE.PlaneGeometry(0.9,0.9),new THREE.MeshBasicMaterial({color:0xffe8a0,opacity:0.8,transparent:true}));
      w2.position.set(hx+wx2,wy,hz+2.51);scene.add(w2);
    });
  });
  // Door
  box(0.7,1.5,0.08,0x3a2810,hx,0.75,hz+2.52,null,'residential');
  // Gabled roof
  const roof=new THREE.Mesh(new THREE.ConeGeometry(4.0,2.2,4),new THREE.MeshLambertMaterial({color:0x3a1a10}));
  roof.position.set(hx,5.7,hz);roof.rotation.y=Math.PI/4;roof.castShadow=true;scene.add(roof);
  themeMats.residentialRoof.push(roof.material);
});
// Boundary wall around cluster
box(14,1.2,0.3,0x2a3848,21,0.6,RZ+3.5,null,'residential');
box(0.3,1.2,12,0x2a3848,14,0.6,RZ-5,null,'residential');

// ─────────────────────────────────────────────────────────────────────────────
// SITE 7 — INDUSTRIAL (z=−35, LEFT x=−16)
// ─────────────────────────────────────────────────────────────────────────────
const IX=-20, IZ=-70;
// Main factory building
box(16,9,12,0x182028,IX,4.5,IZ,null,'industrial');
// Loading dock
box(8,3,4,0x141c22,IX,1.5,IZ+8,null,'industrial');
// Roof details
box(16.5,0.5,12.5,0x101820,IX,9.25,IZ,null,'industrial');
// Chimneys
cyl(0.55,0.65,10,8,0x1e2a38,IX-4,5,IZ-3,'industrialChimney');
cyl(0.55,0.65,13,8,0x1e2a38,IX+4,6.5,IZ-3,'industrialChimney');
// Smoke
const smokeArr=new Float32Array(80*3);
for(let s=0;s<80;s++){
  smokeArr[s*3]  =IX+(s%2===0?-4:4)+(Math.random()-.5)*2;
  smokeArr[s*3+1]=15+Math.random()*10;
  smokeArr[s*3+2]=IZ-3+(Math.random()-.5)*2;
}
const smokeGeo=new THREE.BufferGeometry();smokeGeo.setAttribute('position',new THREE.BufferAttribute(smokeArr,3));
const smoke=new THREE.Points(smokeGeo,new THREE.PointsMaterial({color:0x556677,size:0.6,transparent:true,opacity:0.4}));
scene.add(smoke);
// Factory sign
const isgn=new THREE.Mesh(new THREE.PlaneGeometry(5.5,0.9),new THREE.MeshBasicMaterial({map:makeSign('INDUSTRIAL ZONE','#101820','#ff8800',320,56)}));
isgn.position.set(IX,9.7,IZ+6.01); scene.add(isgn);
// Warning light on chimney tops
[IX-4,IX+4].forEach(cx=>{
  const wl=new THREE.PointLight(0xff4400,0.6,8);wl.position.set(cx,16,IZ-3);scene.add(wl);
});

// ── TREES along road sides ────────────────────────────────────────────────────
const treeTrunkMats=[],treeTopMats=[];
[-68,-58,-48,-38,-28,-18,-8,2,12,22,32,42,52,62,72].forEach(tz=>{
  [-6.5,6.5].forEach(tx=>{
    const trunk=cyl(0.18,0.22,3,6,0x4a3520,tx,1.5,tz,'trees');
    treeTrunkMats.push(trunk.material);
    const top=new THREE.Mesh(new THREE.SphereGeometry(1.1,8,6),new THREE.MeshLambertMaterial({color:0x0d2d18}));
    top.position.set(tx,3.8,tz);top.castShadow=true;scene.add(top);
    treeTopMats.push(top.material);
    themeMats.treeTops.push(top.material);
  });
});

// ── GUARD CHARACTER ──────────────────────────────────────────────────────────
const guardGroup=new THREE.Group();scene.add(guardGroup);
function gb(w,h,d,col,x,y,z){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color:col}));
  m.position.set(x,y,z);m.castShadow=true;guardGroup.add(m);return m;
}
const bootL=gb(0.35,0.4,0.6,0x0d1a2e,-0.15,0.2,0.05);
const bootR=gb(0.35,0.4,0.6,0x0d1a2e,0.15,0.2,0.05);
const legLP=new THREE.Group();legLP.position.set(-0.13,1.1,0);guardGroup.add(legLP);
const legLM=new THREE.Mesh(new THREE.BoxGeometry(0.28,0.8,0.28),new THREE.MeshLambertMaterial({color:0x1a2540}));legLM.position.set(0,-0.4,0);legLM.castShadow=true;legLP.add(legLM);
const legRP=new THREE.Group();legRP.position.set(0.13,1.1,0);guardGroup.add(legRP);
const legRM=new THREE.Mesh(new THREE.BoxGeometry(0.28,0.8,0.28),new THREE.MeshLambertMaterial({color:0x1a2540}));legRM.position.set(0,-0.4,0);legRM.castShadow=true;legRP.add(legRM);
const body=gb(0.72,0.95,0.42,0x1e3a5f,0,1.67,0);
gb(0.74,0.1,0.44,0xD4AF37,0,1.27,0);
const badge=new THREE.Mesh(new THREE.PlaneGeometry(0.18,0.18),new THREE.MeshBasicMaterial({color:0xD4AF37}));
badge.position.set(0,1.78,0.22);guardGroup.add(badge);
gb(0.22,0.22,0.44,0x1e3a5f,-0.47,2.08,0);gb(0.22,0.22,0.44,0x1e3a5f,0.47,2.08,0);
const armLP=new THREE.Group();armLP.position.set(-0.47,2.05,0);guardGroup.add(armLP);
const armLM=new THREE.Mesh(new THREE.BoxGeometry(0.24,0.72,0.24),new THREE.MeshLambertMaterial({color:0x1e3a5f}));armLM.position.set(0,-0.36,0);armLM.castShadow=true;armLP.add(armLM);
const glL=new THREE.Mesh(new THREE.SphereGeometry(0.12,8,6),new THREE.MeshLambertMaterial({color:0x0d1a2e}));glL.position.set(0,-0.76,0);armLP.add(glL);
const armRP=new THREE.Group();armRP.position.set(0.47,2.05,0);guardGroup.add(armRP);
const armRM=new THREE.Mesh(new THREE.BoxGeometry(0.24,0.72,0.24),new THREE.MeshLambertMaterial({color:0x1e3a5f}));armRM.position.set(0,-0.36,0);armRM.castShadow=true;armRP.add(armRM);
const glR=new THREE.Mesh(new THREE.SphereGeometry(0.12,8,6),new THREE.MeshLambertMaterial({color:0x0d1a2e}));glR.position.set(0,-0.76,0);armRP.add(glR);
gb(0.2,0.28,0.2,0xc8a882,0,2.22,0);
const headM=new THREE.Mesh(new THREE.SphereGeometry(0.28,14,12),new THREE.MeshLambertMaterial({color:0xc8a882}));headM.position.set(0,2.62,0);headM.castShadow=true;guardGroup.add(headM);
const capT=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.30,0.15,8),new THREE.MeshLambertMaterial({color:0x1e3a5f}));capT.position.set(0,2.92,0);guardGroup.add(capT);
const capB=new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.38,0.05,16),new THREE.MeshLambertMaterial({color:0x1e3a5f}));capB.position.set(0,2.82,0.05);guardGroup.add(capB);
const capBadge=new THREE.Mesh(new THREE.SphereGeometry(0.07,8,6),new THREE.MeshLambertMaterial({color:0xD4AF37,emissive:0xD4AF37,emissiveIntensity:0.4}));capBadge.position.set(0,2.88,0.29);guardGroup.add(capBadge);
[[-0.1,2.66,0.26],[0.1,2.66,0.26]].forEach(([x,y,z])=>{
  const e=new THREE.Mesh(new THREE.SphereGeometry(0.042,8,6),new THREE.MeshLambertMaterial({color:0x111122}));e.position.set(x,y,z);guardGroup.add(e);
});
const must=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.035,0.04),new THREE.MeshLambertMaterial({color:0x3a2010}));must.position.set(0,2.56,0.27);guardGroup.add(must);
const walkieG=new THREE.Group();walkieG.position.set(0,-0.82,0);armLP.add(walkieG);
walkieG.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.1,0.22,0.06),new THREE.MeshLambertMaterial({color:0xD4AF37})),{castShadow:true}));
const wAnt=new THREE.Mesh(new THREE.CylinderGeometry(0.008,0.008,0.14,4),new THREE.MeshLambertMaterial({color:0x888888}));wAnt.position.set(0.04,0.18,0);walkieG.add(wAnt);walkieG.visible=false;
const torchG=new THREE.Group();torchG.position.set(0,-0.82,0);armRP.add(torchG);
torchG.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.05,0.35,8),new THREE.MeshLambertMaterial({color:0x888888})),{castShadow:true}));
const torchHead=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.06,0.1,8),new THREE.MeshLambertMaterial({color:0xaaaaaa}));torchHead.position.set(0,0.22,0);torchG.add(torchHead);
const torchPL=new THREE.PointLight(0xffffaa,0,6);torchG.add(torchPL);torchG.visible=false;
guardGroup.position.set(0,0,90); // start just outside gate

// ── ZONES ────────────────────────────────────────────────────────────────────
const zones=[
  {id:'gate',       label:'🚪 Gate Security',     pos:[0,0,80],    r:7, icon:'🚪',tag:'ENTRANCE CONTROL',   title:'Securing the <em>Gate</em>',          text:'Our guards maintain <strong>strict access control</strong> at every entry — visitor logging, vehicle checks, zero-tolerance entry.',  list:['✓ Visitor management','✓ Vehicle checking','✓ 24/7 manned entry'],         night:false,walkie:true, torch:false,lc:0xffffaa,li:0.6},
  {id:'hq',         label:'🏛 Abhedya HQ',         pos:[-20,0,50],  r:8, icon:'🛡️',tag:'OUR FOUNDATION',     title:'What is <em>Abhedya</em>?',           text:'Abhedya means <strong>Impenetrable</strong>. Founded on armed forces values — discipline, vigilance, zero compromise.',           list:['✓ Background verified','✓ Military supervisors','✓ 24×7 command'],          night:false,walkie:true, torch:false,lc:0xD4AF37,li:0.8},
  {id:'fire',       label:'🔥 Fire Training Zone', pos:[-20,0,20],  r:7, icon:'🔥',tag:'EMERGENCY TRAINING', title:'Fire & Emergency <em>Response</em>',  text:'Every guard is <strong>fire safety certified</strong>. Evacuation, extinguisher use, and first response — drilled to instinct.',  list:['✓ Fire extinguisher cert.','✓ Evacuation drills','✓ First aid trained'],    night:true, walkie:false,torch:false,lc:0xff5500,li:1.3},
  {id:'corporate',  label:'🏢 Corporate Security', pos:[20,0,-10],  r:8, icon:'🏢',tag:'CORPORATE PATROL',   title:'Office & IT Park <em>Security</em>',  text:'Disciplined floor patrols, RFID access, and professional protocols for <strong>corporate campuses</strong> and IT parks.',         list:['✓ Access control','✓ CCTV coordination','✓ Visitor mgmt'],                  night:false,walkie:true, torch:false,lc:0x4488ff,li:0.5},
  {id:'nightwatch', label:'🌙 Night Watch Tower',  pos:[32,0,-10],  r:6, icon:'🌙',tag:'NIGHT SHIFT',        title:'On Guard <em>Through the Night</em>', text:'Night guards carry torches, radios and <strong>heightened vigilance</strong>. Threats dont sleep — neither do we.',             list:['✓ Night patrol rotations','✓ Intruder detection','✓ Digital logs'],         night:true, walkie:false,torch:true, lc:0x44aaee,li:0.7},
  {id:'residential',label:'🏠 Residential',        pos:[22,0,-45],  r:9, icon:'🏠',tag:'GATED COMMUNITIES',  title:'Protecting <em>Homes</em>',           text:'From gated societies to apartments — resident safety, vehicle entry and <strong>community watch patrols</strong>.',               list:['✓ Gate management','✓ Resident verification','✓ Emergency response'],       night:false,walkie:true, torch:false,lc:0x44dd88,li:0.5},
  {id:'industrial', label:'🏭 Industrial Zone',    pos:[-20,0,-70], r:9, icon:'🏭',tag:'INDUSTRIAL SECURITY',title:'Factory & Plant <em>Protection</em>', text:'<strong>High-security perimeter control</strong> for plants — shift guards, asset tracking, safety enforcement.',                list:['✓ Perimeter surveillance','✓ Asset protection','✓ Shift deployment'],       night:false,walkie:true, torch:false,lc:0xff8800,li:0.6},
];
zones.forEach(z=>{
  z.position=new THREE.Vector3(...z.pos);
  const ring=new THREE.Mesh(new THREE.RingGeometry(z.r-0.2,z.r,32),new THREE.MeshBasicMaterial({color:z.lc,transparent:true,opacity:0.22,side:THREE.DoubleSide}));
  ring.rotation.x=-Math.PI/2;ring.position.set(...z.pos).setY(0.05);scene.add(ring);z.ring=ring;
  const zl=new THREE.PointLight(z.lc,z.li,15);zl.position.set(z.pos[0],6,z.pos[2]);scene.add(zl);z.zlight=zl;
  const lc2=document.createElement('canvas');lc2.width=420;lc2.height=108;
  const lx=lc2.getContext('2d');
  lx.fillStyle='rgba(7,17,31,0.9)';lx.beginPath();lx.roundRect(0,0,420,108,14);lx.fill();
  lx.strokeStyle='#D4AF37';lx.lineWidth=3;lx.beginPath();lx.roundRect(2,2,416,104,14);lx.stroke();
  lx.fillStyle='#D4AF37';lx.font='bold 30px Arial';lx.textAlign='center';lx.fillText(z.label,144,50);
  const sp=new THREE.Mesh(new THREE.PlaneGeometry(5.5,1.35),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(lc2),transparent:true,depthWrite:false}));
  sp.position.set(z.pos[0],5.5,z.pos[2]);sp.scale.set(0,0,0);scene.add(sp);z.sprite=sp;
});

// ── THEME TOGGLE ─────────────────────────────────────────────────────────────
let isLight=false;
// DARK colours — visible night palette with clear contrast
const DARK={
  ground:0x111e2e, gridA:0x2a4878, gridB:0x182840,
  hqMain:0x142438,      // deep navy blue — clearly visible
  hqAccent:0x1a3050, hqSide:0x112030,
  corporate:0x162040,   // midnight blue glass tower
  corporateTop:0x101828, corpGlass:0x204070,
  booth:0x1e3048,       // steel-blue booth
  fire:0x333a44,        // dark steel barrel
  tower:0x182030, towerTop:0x101820,
  house:0x1e2e40,       // dark slate-blue houses
  roof:0x3a1a10,        // dark brown roofs
  factory:0x182028, chimney:0x1e2a38,
  trunk:0x4a3520, treetop:0x0e3018,
};
// LIGHT colours — Realistic Daylight Palette
const LIGHT={
  ground:0x5a8a4a,      // grass green
  gridA:0x4a7a3a, gridB:0x3d6830,
  hqMain:0xb8b0a0,      // warm concrete
  hqAccent:0xa8a090, hqSide:0xa0988a,
  corporate:0x78889a,   // glass tower — slate blue
  corporateTop:0x687080, corpGlass:0x6090c0,
  booth:0xd8d0c0,       // cream cabin
  fire:0x6a6a62,        // dark steel
  tower:0x7a8890, towerTop:0x6a7880, // gunmetal
  house:0xc8aa80, roof:0x8a3020,    // sandy brick + terracotta
  factory:0x80888a, chimney:0x6a7070,
  trunk:0x7a5230, treetop:0x3a8228,  // natural green
};

// Collect all material references once after scene is built
// We walk the scene and tag materials by the mesh userData.tag set during creation
// Simpler: we just keep explicit references
let allBuildingMats=[];  // filled below after scene build

function applyTheme(light){
  isLight=light;
  const C=light?LIGHT:DARK;
  // Sky / fog
  // Sky colours
  const skyCol = light ? 0x87ceeb : 0x0f1f38;  // day=sky blue, night=brighter navy
  renderer.setClearColor(skyCol);
  scene.fog.color.set(light ? 0xa8d8ea : 0x0f1f38);
  scene.fog.near = light ? 60 : 55;
  scene.fog.far  = light ? 220 : 200;
  // Ground
  ground.material.color.set(C.ground);
  // Grid — subtle earthy tones in day
  if(grid.material.length){grid.material[0].color.set(C.gridA);grid.material[1].color.set(C.gridB);}
  // Stars / moon / sun
  stars.visible=!light; moonMesh.visible=!light; haloMesh.visible=!light;
  sunSphere.visible=light;
  // Lights — warm natural white sunlight in day
  ambient.color.set(light?0xfff8f0:0x223355);
  ambient.intensity=light?1.8:0.8;
  sun.color.set(light?0xfff4e0:0xfff5e0); // warm white sunlight
  sun.intensity=light?2.2:1.2;
  moonLight.intensity=light?0:0.6;
  // Apply to all registered mats
  allBuildingMats.forEach(o=>{ if(o&&o.mat&&o.mat.color) o.mat.color.set(light?o.lightCol:o.darkCol); });
  // Tree tops specially (they are separate)
  treeTopMats.forEach(m=>m.color.set(light?LIGHT.treetop:DARK.treetop));
  // Road stays dark always (tarmac) — just ensure mini map redraws
  drawMiniMap();
}

// After building the scene collect all mats we need to recolor
// We tag them during addBox by returning the mesh, then push to allBuildingMats
// Simpler approach: re-traverse scene and match by current color
// CLEANEST: just store them as we build — done below via explicit push

// We build them into an explicit array here:
allBuildingMats=[];
// Helper to register
function regMat(mat,darkCol,lightCol){allBuildingMats.push({mat,darkCol,lightCol});}

// Walk all scene children after build and tag by color groups
// (We do this after scene construction at bottom of try block)

document.getElementById('themeToggle').addEventListener('click',()=>{
  applyTheme(!isLight);
  document.getElementById('themeToggle').textContent=isLight?'🌙':'☀️';
});

// ── CAMERA ORBIT ─────────────────────────────────────────────────────────────
let orbitTheta=0,orbitPhi=0.45,orbitRadius=38;
let isDrag=false,lastMX=0,lastMY=0;
const camSmooth=new THREE.Vector3(0,0,0);

// Single-touch = orbit on mobile (when NOT on joystick)
// Two-touch = pinch to zoom
let touchStart=null,pinchStart=null;

canvas.addEventListener('mousedown',e=>{isDrag=true;lastMX=e.clientX;lastMY=e.clientY;});
window.addEventListener('mouseup',()=>isDrag=false);
window.addEventListener('mousemove',e=>{
  if(!isDrag)return;
  orbitTheta-=(e.clientX-lastMX)*0.005;
  orbitPhi=Math.max(0.15,Math.min(1.4,orbitPhi-(e.clientY-lastMY)*0.005));
  lastMX=e.clientX;lastMY=e.clientY;
});
canvas.addEventListener('wheel',e=>{orbitRadius=Math.max(10,Math.min(60,orbitRadius+e.deltaY*0.04));},{passive:true});

// ── MOBILE TOUCH ORBIT + PINCH (on canvas, ignoring joystick) ────────────────
function distBetweenTouches(t){return Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);}

canvas.addEventListener('touchstart',e=>{
  if(e.touches.length===1){
    touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY};
    isDrag=true; lastMX=e.touches[0].clientX; lastMY=e.touches[0].clientY;
  } else if(e.touches.length===2){
    pinchStart=distBetweenTouches(e.touches);
    isDrag=false;
  }
},{passive:true});

canvas.addEventListener('touchmove',e=>{
  e.preventDefault();
  if(e.touches.length===1&&isDrag){
    orbitTheta-=(e.touches[0].clientX-lastMX)*0.006;
    orbitPhi=Math.max(0.15,Math.min(1.4,orbitPhi-(e.touches[0].clientY-lastMY)*0.006));
    lastMX=e.touches[0].clientX;lastMY=e.touches[0].clientY;
  } else if(e.touches.length===2&&pinchStart!==null){
    const d=distBetweenTouches(e.touches);
    orbitRadius=Math.max(10,Math.min(60,orbitRadius-(d-pinchStart)*0.05));
    pinchStart=d;
  }
},{passive:false});

canvas.addEventListener('touchend',()=>{isDrag=false;pinchStart=null;},{passive:true});

// ── KEYBOARD ─────────────────────────────────────────────────────────────────
const keys={};
window.addEventListener('keydown',e=>{keys[e.code]=true;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();});
window.addEventListener('keyup',  e=>keys[e.code]=false);

// ── MOBILE JOYSTICK ───────────────────────────────────────────────────────────
const joyWrap=document.getElementById('joystickWrap');
const joyBase=document.getElementById('joystickBase');
const joyKnob=document.getElementById('joystickKnob');
const JOY_RADIUS=33; // max knob offset
let joyActive=false;
let joyVec={x:0,y:0}; // normalised -1..1
let joyId=null; // touch identifier

function joyStart(cx,cy){
  joyActive=true;
  joyMove(cx,cy);
}
function joyMove(cx,cy){
  const rect=joyBase.getBoundingClientRect();
  const ox=cx-(rect.left+rect.width/2);
  const oy=cy-(rect.top+rect.height/2);
  const mag=Math.min(JOY_RADIUS,Math.hypot(ox,oy));
  const angle=Math.atan2(oy,ox);
  const nx=Math.cos(angle)*mag;
  const ny=Math.sin(angle)*mag;
  joyKnob.style.transform=`translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`;
  joyVec={x:nx/JOY_RADIUS, y:ny/JOY_RADIUS};
}
function joyEnd(){
  joyActive=false;
  joyVec={x:0,y:0};
  joyKnob.style.transform='translate(-50%,-50%)';
}

joyBase.addEventListener('touchstart',e=>{
  e.stopPropagation();e.preventDefault();
  joyId=e.changedTouches[0].identifier;
  joyStart(e.changedTouches[0].clientX,e.changedTouches[0].clientY);
},{passive:false});
joyBase.addEventListener('touchmove',e=>{
  e.stopPropagation();e.preventDefault();
  for(const t of e.changedTouches){
    if(t.identifier===joyId){joyMove(t.clientX,t.clientY);break;}
  }
},{passive:false});
joyBase.addEventListener('touchend',e=>{
  e.stopPropagation();
  for(const t of e.changedTouches){if(t.identifier===joyId){joyEnd();break;}}
},{passive:false});
// Mouse fallback for joystick (for desktop testing)
joyBase.addEventListener('mousedown',e=>{e.stopPropagation();joyStart(e.clientX,e.clientY);});
window.addEventListener('mousemove',e=>{if(joyActive)joyMove(e.clientX,e.clientY);});
window.addEventListener('mouseup',()=>{if(joyActive)joyEnd();});

// ── ZONE INFO PANEL ───────────────────────────────────────────────────────────
let activeZone=null;
let userClosedZoneId=null; // tracks which zone the user manually dismissed
const securedZones=new Set(); // zones that have been secured by the guard
let zoneTimer=null;           // { zone, startTime, duration }
let zoneTimerEl=null;         // DOM element for the circular timer
const zoneLabel=document.getElementById('zoneLabel');
const infoPanel=document.getElementById('infoPanel');

function openZone(z){
  // Don't reopen a zone the user just dismissed until they leave and re-enter
  if(userClosedZoneId===z.id) return;
  document.getElementById('ipIcon').textContent=z.icon;
  document.getElementById('ipTag').textContent=z.tag;
  document.getElementById('ipTitle').innerHTML=z.title;
  document.getElementById('ipText').innerHTML=z.text;
  document.getElementById('ipList').innerHTML=(z.list||[]).map(l=>`<li>${l}</li>`).join('');
  // Show panel on desktop only — hidden via CSS on mobile
  if(!isMobile()){
    infoPanel.style.display='';
    infoPanel.classList.remove('hidden');
    requestAnimationFrame(()=>infoPanel.classList.add('visible'));
  }
  zoneLabel.textContent=z.label;zoneLabel.classList.add('visible');
  torchG.visible=z.torch;torchPL.intensity=z.torch?2:0;
  walkieG.visible=z.walkie;
  if(!isLight){ambient.intensity=z.night?0.3:0.8;moonLight.intensity=z.night?1.4:0.6;}
  if(z.ring)z.ring.material.opacity=0.65;
  if(z.sprite)z.sprite.scale.set(1,1,1);
  showSpeech(getSpeech(z.id));
}
function closeZone(prev, userInitiated=false){
  infoPanel.classList.remove('visible');
  zoneLabel.classList.remove('visible');
  // After transition ends, add hidden so it's off-screen
  setTimeout(()=>{
    if(!infoPanel.classList.contains('visible')){
      infoPanel.classList.add('hidden');
    }
  },500);
  torchG.visible=false;torchPL.intensity=0;walkieG.visible=false;
  if(!isLight){ambient.intensity=0.8;moonLight.intensity=0.6;}
  if(prev&&prev.ring)prev.ring.material.opacity=0.22;
  if(prev&&prev.sprite)prev.sprite.scale.set(0,0,0);
  // If user manually closed, remember which zone so we don't auto-reopen it
  if(userInitiated&&prev) userClosedZoneId=prev.id;
}

// ✕ close button — pass userInitiated=true
document.getElementById('ipClose').addEventListener('click',()=>{
  closeZone(activeZone, true);
  activeZone=null;
});

// ── SPEECH ───────────────────────────────────────────────────────────────────
let speechMesh=null,speechTm=null;
function showSpeech(text){
  if(speechMesh){guardGroup.remove(speechMesh);speechMesh=null;}
  clearTimeout(speechTm);
  const sc=document.createElement('canvas');sc.width=480;sc.height=110;
  const cx=sc.getContext('2d');
  cx.fillStyle='rgba(7,17,31,0.95)';cx.beginPath();cx.roundRect(0,0,480,110,14);cx.fill();
  cx.strokeStyle='#D4AF37';cx.lineWidth=3;cx.beginPath();cx.roundRect(2,2,476,106,14);cx.stroke();
  cx.fillStyle='#D4AF37';cx.font='bold 28px Arial';cx.textAlign='center';cx.fillText(text,240,65);
  speechMesh=new THREE.Mesh(new THREE.PlaneGeometry(4.2,0.96),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(sc),transparent:true,depthWrite:false}));
  speechMesh.position.set(0,4.1,0);guardGroup.add(speechMesh);
  speechTm=setTimeout(()=>{if(speechMesh){guardGroup.remove(speechMesh);speechMesh=null;}},3500);
}
function getSpeech(id){return{gate:'Checking all access!',hq:'Abhedya — Impenetrable!',corporate:'Floor patrol active.',fire:'Fire training certified!',nightwatch:'Night watch on duty!',residential:'Community secured!',industrial:'Perimeter locked!'}[id]||'On patrol!';}

// ── MINI MAP ─────────────────────────────────────────────────────────────────
const mmC=document.getElementById('miniMapCanvas');
const mmCtx=mmC?mmC.getContext('2d'):null;
const MMS=130/200;
function worldToMM(x,z){return[(x+100)*MMS,(z+100)*MMS];}
function drawMiniMap(){
  if(!mmCtx)return;
  mmCtx.fillStyle=isLight?'rgba(255,210,235,0.97)':'rgba(7,17,31,0.95)';
  mmCtx.fillRect(0,0,130,130);
  zones.forEach(z=>{
    const[mx,mz]=worldToMM(z.pos[0],z.pos[2]);
    mmCtx.beginPath();mmCtx.arc(mx,mz,z.r*MMS,0,Math.PI*2);
    mmCtx.strokeStyle=isLight?'#e91e63':'#D4AF37';mmCtx.lineWidth=1;mmCtx.globalAlpha=0.55;mmCtx.stroke();
    mmCtx.fillStyle=isLight?'rgba(233,30,99,0.12)':'rgba(212,175,55,0.12)';mmCtx.fill();mmCtx.globalAlpha=1;
  });
  const[gx,gz]=worldToMM(guardGroup.position.x,guardGroup.position.z);
  const grad=mmCtx.createRadialGradient(gx,gz,0,gx,gz,10);
  grad.addColorStop(0,isLight?'rgba(233,30,99,0.75)':'rgba(212,175,55,0.7)');grad.addColorStop(1,'rgba(0,0,0,0)');
  mmCtx.beginPath();mmCtx.arc(gx,gz,10,0,Math.PI*2);mmCtx.fillStyle=grad;mmCtx.fill();
  mmCtx.beginPath();mmCtx.arc(gx,gz,4,0,Math.PI*2);mmCtx.fillStyle=isLight?'#e91e63':'#D4AF37';mmCtx.fill();
  mmCtx.save();mmCtx.translate(gx,gz);mmCtx.rotate(guardGroup.rotation.y+Math.PI);
  mmCtx.beginPath();mmCtx.moveTo(0,-6);mmCtx.lineTo(-3,2);mmCtx.lineTo(3,2);mmCtx.closePath();
  mmCtx.fillStyle='#fff';mmCtx.fill();mmCtx.restore();
}

// ── PANELS ───────────────────────────────────────────────────────────────────
let openPanelId=null;
function openPanel(id){
  if(openPanelId&&openPanelId!==id){
    const prev=document.getElementById(openPanelId);
    if(prev)prev.classList.remove('open');
  }
  openPanelId=id;
  const p=document.getElementById(id);if(!p)return;
  requestAnimationFrame(()=>requestAnimationFrame(()=>p.classList.add('open')));
}
function closePanel(id){
  const p=document.getElementById(id);if(!p)return;
  p.classList.remove('open');
  if(openPanelId===id)openPanelId=null;
  document.querySelectorAll('.bn-btn').forEach(b=>b.classList.toggle('active',b.dataset.section==='world'));
}
window.closePanel=closePanel;
document.getElementById('closeServices').addEventListener('click',()=>closePanel('servicesPanel'));
document.getElementById('closeTeam')    .addEventListener('click',()=>closePanel('teamPanel'));
document.getElementById('closeContact') .addEventListener('click',()=>closePanel('contactPanel'));

document.querySelectorAll('.bn-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.bn-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const sec=btn.dataset.section;
    if(sec==='world'){if(openPanelId){document.getElementById(openPanelId).classList.remove('open');openPanelId=null;}return;}
    openPanel(sec+'Panel');
  });
});

// ── CONTACT FORM ─────────────────────────────────────────────────────────────
document.getElementById('contactForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const btn=document.getElementById('sendBtn'),status=document.getElementById('formStatus');
  const name=document.getElementById('cf_name').value.trim();
  const phone=document.getElementById('cf_phone').value.trim();
  const email=document.getElementById('cf_email').value.trim();
  const service=document.getElementById('cf_service').value;
  const message=document.getElementById('cf_message').value.trim();
  if(!name||!phone||!message){status.textContent='⚠ Please fill in Name, Phone and Message.';status.className='form-status error';return;}
  btn.disabled=true;btn.textContent='Sending…';status.textContent='';status.className='form-status';
  const params={from_name:name,phone_number:phone,email_address:email||'Not provided',service_required:service||'Not specified',message,to_name:'Abhedya Security'};
  try{
    if(typeof emailjs!=='undefined'&&EMAILJS_SERVICE_ID!=='YOUR_SERVICE_ID'){
      await emailjs.send(EMAILJS_SERVICE_ID,EMAILJS_TEMPLATE_ID,params);
      status.textContent='✓ Message sent! We will contact you within 24 hours.';
      status.className='form-status success';e.target.reset();
    } else {
      const msg=encodeURIComponent(`Hello Abhedya Security!\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email||'N/A'}\nService: ${service||'N/A'}\nMessage: ${message}`);
      window.open(`https://wa.me/917666793286?text=${msg}`,'_blank');
      status.textContent='✓ Redirected to WhatsApp with your message!';
      status.className='form-status success';e.target.reset();
    }
  }catch(err){
    status.textContent='✗ Could not send. WhatsApp us: +91 76667 93286';
    status.className='form-status error';
  }finally{btn.disabled=false;btn.textContent='Send Request →';}
});

// ── NOW register all building materials for theme switching ───────────────────
// We traverse the scene and match by initial color values
scene.traverse(obj=>{
  if(!obj.isMesh||!obj.material||!obj.material.color)return;
  const c=obj.material.color.getHex();
  // Map dark hex → light hex
  const map={
    [DARK.hqMain]:LIGHT.hqMain,[DARK.hqAccent]:LIGHT.hqAccent,[DARK.hqSide]:LIGHT.hqSide,
    [DARK.corporate]:LIGHT.corporate,[DARK.corporateTop]:LIGHT.corporateTop,
    [DARK.corpGlass]:LIGHT.corpGlass,
    [DARK.booth]:LIGHT.booth,[DARK.fire]:LIGHT.fire,
    [DARK.tower]:LIGHT.tower,[DARK.towerTop]:LIGHT.towerTop,
    [DARK.house]:LIGHT.house,[DARK.roof]:LIGHT.roof,
    [DARK.factory]:LIGHT.factory,[DARK.chimney]:LIGHT.chimney,
    [DARK.trunk]:LIGHT.trunk,[DARK.treetop]:LIGHT.treetop,
  };
  if(map[c]!==undefined)regMat(obj.material,c,map[c]);
});
// Grid needs special handling (its material is an array)
// Grid helper uses LineSegments with array of materials — handle in applyTheme already

// ── ANIMATION LOOP ────────────────────────────────────────────────────────────
const clock=new THREE.Clock();
let walkCycle=0,frameN=0;

function animate(){
  requestAnimationFrame(animate);
  const delta=Math.min(clock.getDelta(),0.05);
  const elapsed=clock.getElapsedTime();
  frameN++;

  // Movement — keyboard OR joystick
  let moving=false;
  const dir=new THREE.Vector3();

  if(keys['ArrowUp']   ||keys['KeyW']){dir.z-=1;moving=true;}
  if(keys['ArrowDown'] ||keys['KeyS']){dir.z+=1;moving=true;}
  if(keys['ArrowLeft'] ||keys['KeyA']){dir.x-=1;moving=true;}
  if(keys['ArrowRight']||keys['KeyD']){dir.x+=1;moving=true;}

  // Joystick overrides / adds
  if(joyActive&&(Math.abs(joyVec.x)>0.08||Math.abs(joyVec.y)>0.08)){
    dir.x+=joyVec.x;
    dir.z+=joyVec.y; // joystick Y → world Z
    moving=true;
  }

  if(moving){
    dir.normalize().applyAxisAngle(new THREE.Vector3(0,1,0),orbitTheta);
    const spd=5.5;
    guardGroup.position.x=Math.max(-50,Math.min(50,guardGroup.position.x+dir.x*spd*delta));
    guardGroup.position.z=Math.max(-85,Math.min(92,guardGroup.position.z+dir.z*spd*delta));
    guardGroup.rotation.y=Math.atan2(dir.x,dir.z);
    walkCycle+=delta*9;
  }

  // Walk/idle anim
  if(moving){
    const sw=Math.sin(walkCycle)*0.55;
    legLP.rotation.x=sw;legRP.rotation.x=-sw;
    armLP.rotation.x=-sw*0.7;armRP.rotation.x=sw*0.7;
    bootL.position.z=Math.sin(walkCycle)*0.1;bootR.position.z=-Math.sin(walkCycle)*0.1;
    body.position.y=1.67+Math.abs(Math.sin(walkCycle*2))*0.02;
  } else {
    const br=Math.sin(elapsed*1.4)*0.012;
    body.position.y=1.67+br;
    legLP.rotation.x=0;legRP.rotation.x=0;
    armLP.rotation.x=0;armRP.rotation.x=0;
    bootL.position.z=0;bootR.position.z=0;
    armLP.rotation.z=0.05+Math.sin(elapsed*0.8)*0.02;
    armRP.rotation.z=-0.05-Math.sin(elapsed*0.8)*0.02;
  }

  // Guard follow lights
  guardLight.position.set(guardGroup.position.x,guardGroup.position.y+3,guardGroup.position.z);
  guardFill .position.set(guardGroup.position.x,guardGroup.position.y+5,guardGroup.position.z);
  const inNight=activeZone&&activeZone.night;
  if(moving){
    guardLight.intensity=1.6+Math.abs(Math.sin(walkCycle*2))*0.6;
  } else {
    guardLight.intensity=1.5+Math.sin(elapsed*1.2)*0.3;
  }
  guardLight.distance=inNight?20:14;
  guardFill.intensity=inNight?0.9:0.5;
  if(isLight){
    guardLight.color.set(0xff88bb);  // pink-warm light on guard
    guardLight.intensity*=0.5;
    guardFill.intensity*=0.35;
  } else {
    guardLight.color.set(0xfff8e0);
  }

  // Speech & zone labels face camera
  if(speechMesh)speechMesh.rotation.y=-guardGroup.rotation.y+orbitTheta;
  zones.forEach(z=>{if(z.sprite&&z.sprite.scale.x>0)z.sprite.rotation.y=orbitTheta;});

  // Flames
  flameMeshes.forEach((fm,i)=>{
    fm.scale.y=0.8+Math.sin(elapsed*9+i*1.7)*0.25;
    fm.position.y=1.8+i*0.2+Math.sin(elapsed*11+i)*0.06;
    fm.rotation.y+=0.06;
  });
  fireGlow.intensity=1.2+Math.sin(elapsed*7)*0.5;

  // Smoke
  const sa=smoke.geometry.attributes.position;
  for(let s=0;s<60;s++){
    sa.array[s*3+1]+=0.025;
    if(sa.array[s*3+1]>22)sa.array[s*3+1]=12;
    sa.array[s*3]+=Math.sin(elapsed+s)*0.003;
  }
  sa.needsUpdate=true;

  // Rings — green if secured, active colour if current, dim otherwise
  zones.forEach((z,i)=>{
    if(z.ring){
      if(securedZones.has(z.id)){
        z.ring.material.color.set(0x00ff88);
        z.ring.material.opacity=0.55+Math.sin(elapsed*1.5+i)*0.1;
      } else {
        z.ring.material.color.set(z.lc);
        z.ring.material.opacity=(activeZone===z?0.62:0.18)+Math.sin(elapsed*2+i)*0.08;
      }
      z.ring.rotation.z+=0.004;
    }
    if(z.zlight){
      if(securedZones.has(z.id)){
        z.zlight.color.set(0x00ff88);
        z.zlight.intensity=1.2+Math.sin(elapsed*2+i)*0.2;
      } else {
        z.zlight.color.set(z.lc);
        z.zlight.intensity=z.li*(0.85+Math.sin(elapsed*3+i)*0.15);
      }
    }
  });
  // Update circular timer progress
  if(zoneTimer && zoneTimerEl){
    const prog=Math.min(1,(elapsed-zoneTimer.startTime)/zoneTimer.duration);
    const circ=2*Math.PI*36; // r=36
    const dashOffset=circ*(1-prog);
    const arc=zoneTimerEl.querySelector('.zt-arc');
    if(arc) arc.style.strokeDashoffset=dashOffset;
    if(prog>=1) completeZoneTimer();
  }
  spot.intensity=1.8+Math.sin(elapsed*0.5)*0.3;
  moonMesh.rotation.y+=0.0008;haloMesh.rotation.z+=0.001;
  if(!isLight)stars.material.opacity=0.55+Math.sin(elapsed*0.4)*0.15;

  // Zone detection — userClosedZoneId prevents auto-reopen after manual close
  let nearest=null,nd=Infinity;
  zones.forEach(z=>{const d=guardGroup.position.distanceTo(z.position);if(d<z.r&&d<nd){nd=d;nearest=z;}});
  if(nearest!==activeZone){
    if(nearest){
      closeZone(activeZone);
      cancelZoneTimer();
      activeZone=nearest;
      openZone(nearest);
      // Start securing timer only if not already secured
      if(!securedZones.has(nearest.id)) startZoneTimer(nearest, elapsed);
    } else {
      userClosedZoneId=null;
      cancelZoneTimer();
      closeZone(activeZone);
      activeZone=null;
    }
  }

  // Camera follow
  camSmooth.lerp(guardGroup.position,0.05);
  camera.position.set(
    camSmooth.x+orbitRadius*Math.sin(orbitTheta)*Math.cos(orbitPhi),
    camSmooth.y+orbitRadius*Math.sin(orbitPhi),
    camSmooth.z+orbitRadius*Math.cos(orbitTheta)*Math.cos(orbitPhi)
  );
  camera.lookAt(camSmooth.x,camSmooth.y+1.5,camSmooth.z);

  if(frameN%3===0)drawMiniMap();
  renderer.render(scene,camera);
}

// ── ZONE SECURING TIMER ──────────────────────────────────────────────────────
function startZoneTimer(z, elapsed){
  cancelZoneTimer();
  zoneTimer={ zone:z, startTime:elapsed, duration:2.0 };
  // Create DOM timer overlay
  const el=document.createElement('div');
  el.id='zoneTimerUI';
  el.innerHTML=`
    <svg viewBox="0 0 88 88" width="88" height="88">
      <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="6"/>
      <circle class="zt-arc" cx="44" cy="44" r="36" fill="none"
        stroke="#${z.lc.toString(16).padStart(6,'0')}"
        stroke-width="6" stroke-linecap="round"
        stroke-dasharray="${2*Math.PI*36}"
        stroke-dashoffset="${2*Math.PI*36}"
        transform="rotate(-90 44 44)"
        style="transition:stroke-dashoffset 0.05s linear"/>
      <text x="44" y="50" text-anchor="middle" fill="white"
        font-family="monospace" font-size="14" font-weight="bold">SEC</text>
    </svg>
    <div class="zt-label">SECURING…</div>
  `;
  el.style.cssText=`
    position:fixed;left:50%;bottom:95px;transform:translateX(-50%);
    z-index:350;display:flex;flex-direction:column;align-items:center;gap:4px;
    pointer-events:none;animation:ztFadeIn 0.3s ease;
  `;
  // Inject keyframe if not already there
  if(!document.getElementById('zt-style')){
    const st=document.createElement('style');
    st.id='zt-style';
    st.textContent=`
      @keyframes ztFadeIn{from{opacity:0;transform:translateX(-50%) scale(0.8)}to{opacity:1;transform:translateX(-50%) scale(1)}}
      @keyframes ztSecured{0%{transform:translateX(-50%) scale(1)}50%{transform:translateX(-50%) scale(1.3)}100%{transform:translateX(-50%) scale(1)}}
      #zoneTimerUI .zt-label{font-family:monospace;font-size:11px;letter-spacing:2px;color:#fff;text-transform:uppercase;text-shadow:0 0 8px rgba(255,255,255,0.5)}
    `;
    document.head.appendChild(st);
  }
  document.body.appendChild(el);
  zoneTimerEl=el;
}

function cancelZoneTimer(){
  zoneTimer=null;
  if(zoneTimerEl){ zoneTimerEl.remove(); zoneTimerEl=null; }
}

function completeZoneTimer(){
  const z=zoneTimer.zone;
  cancelZoneTimer();
  securedZones.add(z.id);
  // Flash green "SECURED!" popup above guard
  showSpeech('✅ '+z.id.toUpperCase()+' SECURED!');
  // Briefly show a big green flash on screen
  const flash=document.createElement('div');
  flash.style.cssText=`
    position:fixed;inset:0;z-index:340;pointer-events:none;
    background:radial-gradient(circle,rgba(0,255,136,0.18) 0%,transparent 70%);
    animation:flashGreen 0.8s ease forwards;
  `;
  if(!document.getElementById('fg-style')){
    const fs=document.createElement('style');
    fs.id='fg-style';
    fs.textContent='@keyframes flashGreen{0%{opacity:1}100%{opacity:0}}';
    document.head.appendChild(fs);
  }
  document.body.appendChild(flash);
  setTimeout(()=>flash.remove(),900);
  // Show a fixed "SECURED" badge instead of timer
  showSecuredBadge(z);
}

function showSecuredBadge(z){
  const el=document.createElement('div');
  el.style.cssText=`
    position:fixed;left:50%;bottom:95px;transform:translateX(-50%);
    z-index:350;pointer-events:none;
    background:rgba(0,255,136,0.15);border:2px solid #00ff88;
    border-radius:12px;padding:8px 20px;
    font-family:monospace;font-size:13px;letter-spacing:2px;
    color:#00ff88;text-transform:uppercase;text-shadow:0 0 10px rgba(0,255,136,0.7);
    backdrop-filter:blur(8px);
    animation:ztFadeIn 0.3s ease;
    box-shadow:0 0 20px rgba(0,255,136,0.3);
  `;
  el.textContent='✅ SITE SECURED';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 2500);
}

setTimeout(()=>showSpeech(isMobile()?'Waddle to the gate! 🚪':'Walk to the gate! ⬆'),2000);
animate();

}catch(err){
  console.error('Scene error:',err);
  startWorld();
}