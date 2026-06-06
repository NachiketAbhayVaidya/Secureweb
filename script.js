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
scene.fog=new THREE.Fog(0x07111f,40,120);

const camera=new THREE.PerspectiveCamera(55,window.innerWidth/window.innerHeight,0.1,200);
camera.position.set(0,18,28);camera.lookAt(0,0,0);

window.addEventListener('resize',()=>{
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
});

// ── LIGHTS ───────────────────────────────────────────────────────────────────
const ambient=new THREE.AmbientLight(0x223355,0.8);scene.add(ambient);
const sun=new THREE.DirectionalLight(0xfff5e0,1.2);
sun.position.set(20,40,20);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left=-50;sun.shadow.camera.right=50;
sun.shadow.camera.top=50;sun.shadow.camera.bottom=-50;sun.shadow.camera.far=100;
scene.add(sun);
const moonLight=new THREE.PointLight(0x4466aa,0.6,60);
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
const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshLambertMaterial({color:0x0a1520}));
ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
themeMats.ground=ground.material;

const grid=new THREE.GridHelper(120,30,0x1a3050,0x0d1f35);
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

// ── HQ BUILDING ──────────────────────────────────────────────────────────────
box(8,20,8,0x0c1e38,-18,10,-8,null,'hqMain');
box(5,6,5,0x0e2244,-18,23,-8,null,'hqMain');
box(5,12,6,0x0b1c32,-26,6,-8,null,'hqMain');
// HQ building centre x=-18, width=8 → spans -22 to -14
// 3 columns spaced 2.2 apart, centred on -18: -20.2, -18, -15.8
// front face z = -8+4 = -4, plane sits just in front at z=-3.85
for(let r=0;r<4;r++)for(let c=0;c<3;c++){
  const w=new THREE.Mesh(new THREE.PlaneGeometry(0.7,0.9),new THREE.MeshBasicMaterial({color:0xD4AF37,opacity:0.85,transparent:true}));
  w.position.set(-20.2+c*2.2, 3+r*3.8, -3.85);scene.add(w);
  themeMats.hqWindow.push(w.material);
}
// HQ sign
const signC=document.createElement('canvas');signC.width=512;signC.height=128;
const sx=signC.getContext('2d');sx.fillStyle='#D4AF37';sx.fillRect(0,0,512,128);
sx.fillStyle='#0d1a2e';sx.font='bold 60px Arial';sx.textAlign='center';sx.fillText('ABHEDYA HQ',256,86);
const signM=new THREE.Mesh(new THREE.PlaneGeometry(5,1.2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(signC)}));
signM.position.set(-18,21.5,-3.9);scene.add(signM);

// ── GATE ─────────────────────────────────────────────────────────────────────
box(0.5,5,0.5,0xD4AF37,-2.5,2.5,12,null,'gate');
box(0.5,5,0.5,0xD4AF37,2.5,2.5,12,null,'gate');
box(5.5,0.3,0.3,0xD4AF37,0,5.2,12,null,'gate');
for(let i=0;i<4;i++)box(0.15,4,0.15,0xc8a020,-2+i*1.3,2,12,null,'gate');
box(2,3,2,0x1a3050,5,1.5,12,null,'booth');
box(2,0.15,2,0xD4AF37,5,3.1,12,null,'booth');

// ── CORPORATE ────────────────────────────────────────────────────────────────
box(10,16,8,0x0d2040,18,8,-5,null,'corporate');
box(7,4,6,0x0f2550,18,18,-5,null,'corporate');
for(let f=0;f<5;f++){
  const fac=new THREE.Mesh(new THREE.PlaneGeometry(9,2.5),new THREE.MeshBasicMaterial({color:0x1a4060,opacity:0.4,transparent:true}));
  fac.position.set(18,2.5+f*3,-0.9);scene.add(fac);
  themeMats.corporateGlass.push(fac.material);
}

// ── FIRE ZONE ─────────────────────────────────────────────────────────────────
cyl(0.5,0.6,1.5,8,0x333333,-18,0.75,16,'fireZone');
const flameMeshes=[],flameColors=[0xff4400,0xff8800,0xffcc00];
for(let fi=0;fi<3;fi++){
  const fm=new THREE.Mesh(new THREE.ConeGeometry(0.3+fi*0.1,1.2+fi*0.3,6),new THREE.MeshBasicMaterial({color:flameColors[fi],transparent:true,opacity:0.85}));
  fm.position.set(-18+(fi-1)*0.4,1.8+fi*0.2,16);scene.add(fm);flameMeshes.push(fm);
}
box(0.3,1,0.3,0xcc2200,-16,0.5,15.5,null,'fireZone');
box(0.3,0.3,0.3,0x888888,-16,1.15,15.5,null,'fireZone');
const fireGlow=new THREE.PointLight(0xff4400,1.5,10);fireGlow.position.set(-18,3,16);scene.add(fireGlow);

// ── NIGHT TOWER ───────────────────────────────────────────────────────────────
cyl(0.3,0.3,8,8,0x1a3050,18,4,16,'nightTower');
box(3,0.2,3,0x1a3050,18,8.2,16,null,'nightTower');
box(2.5,2,2.5,0x112030,18,9.2,16,null,'nightTower');
const spot=new THREE.SpotLight(0xffffcc,2,30,Math.PI/8,0.5);
spot.position.set(18,9.5,16);spot.target.position.set(18,0,10);scene.add(spot);scene.add(spot.target);

// ── RESIDENTIAL ───────────────────────────────────────────────────────────────
[[28,-12],[33,-8],[38,-14],[30,-18]].forEach(([hx,hz])=>{
  box(3.5,3,3.5,0x0e2035,hx,1.5,hz,null,'residential');
  const roof=new THREE.Mesh(new THREE.ConeGeometry(2.8,1.5,4),new THREE.MeshLambertMaterial({color:0x1a3a5f}));
  roof.position.set(hx,3.75,hz);roof.rotation.y=Math.PI/4;roof.castShadow=true;scene.add(roof);
  themeMats.residentialRoof.push(roof.material);
});

// ── INDUSTRIAL ────────────────────────────────────────────────────────────────
box(12,8,10,0x0c1a28,-28,4,-20,null,'industrial');
cyl(0.4,0.5,6,8,0x1a2a3a,-25,7,-18,'industrialChimney');
cyl(0.4,0.5,8,8,0x1a2a3a,-22,8,-22,'industrialChimney');
const smokeArr=new Float32Array(60*3);
for(let s=0;s<60;s++){smokeArr[s*3]=-24+Math.random()*4;smokeArr[s*3+1]=12+Math.random()*8;smokeArr[s*3+2]=-20+Math.random()*4;}
const smokeGeo=new THREE.BufferGeometry();smokeGeo.setAttribute('position',new THREE.BufferAttribute(smokeArr,3));
const smoke=new THREE.Points(smokeGeo,new THREE.PointsMaterial({color:0x445566,size:0.5,transparent:true,opacity:0.35}));
scene.add(smoke);

// ── TREES ────────────────────────────────────────────────────────────────────
const treeTrunkMats=[],treeTopMats=[];
[[-5,-5],[5,-5],[-8,5],[8,5],[-3,20],[3,20],[10,-20],[-10,-20],[25,5],[-25,5]].forEach(([x,z])=>{
  const trunk=cyl(0.15,0.2,2,6,0x4a3520,x,1,z,'trees');
  treeTrunkMats.push(trunk.material);
  const top=new THREE.Mesh(new THREE.SphereGeometry(0.8,8,6),new THREE.MeshLambertMaterial({color:0x0d2d18}));
  top.position.set(x,2.5,z);top.castShadow=true;scene.add(top);
  treeTopMats.push(top.material);
  themeMats.treeTops.push(top.material);
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
guardGroup.position.set(0,0,8);

// ── ZONES ────────────────────────────────────────────────────────────────────
const zones=[
  {id:'gate',       label:'🚪 Gate Security',     pos:[-2,0,12],  r:5, icon:'🚪',tag:'ENTRANCE CONTROL',   title:'Securing the <em>Gate</em>',          text:'Our guards maintain <strong>strict access control</strong> at every entry — visitor logging, vehicle checks, zero-tolerance entry.',  list:['✓ Visitor management','✓ Vehicle checking','✓ 24/7 manned entry'],         night:false,walkie:true, torch:false,lc:0xffffaa,li:0.5},
  {id:'hq',         label:'🏛 Abhedya HQ',         pos:[-18,0,-5], r:6, icon:'🛡️',tag:'OUR FOUNDATION',     title:'What is <em>Abhedya</em>?',           text:'Abhedya means <strong>Impenetrable</strong>. Founded on armed forces values — discipline, vigilance, zero compromise.',           list:['✓ Background verified','✓ Military supervisors','✓ 24×7 command'],          night:false,walkie:true, torch:false,lc:0xD4AF37,li:0.8},
  {id:'corporate',  label:'🏢 Corporate Security', pos:[18,0,-5],  r:6, icon:'🏢',tag:'CORPORATE PATROL',   title:'Office & IT Park <em>Security</em>',  text:'Disciplined floor patrols, RFID access, and professional protocols for <strong>corporate campuses</strong> and IT parks.',         list:['✓ Access control','✓ CCTV coordination','✓ Visitor mgmt'],                  night:false,walkie:true, torch:false,lc:0x4466ff,li:0.4},
  {id:'fire',       label:'🔥 Fire Training Zone', pos:[-18,0,16], r:5, icon:'🔥',tag:'EMERGENCY TRAINING', title:'Fire & Emergency <em>Response</em>',  text:'Every guard is <strong>fire safety certified</strong>. Evacuation, extinguisher use, and first response — drilled to instinct.',  list:['✓ Fire extinguisher cert.','✓ Evacuation drills','✓ First aid trained'],    night:true, walkie:false,torch:false,lc:0xff4400,li:1.2},
  {id:'nightwatch', label:'🌙 Night Watch Tower',  pos:[18,0,16],  r:5, icon:'🌙',tag:'NIGHT SHIFT',        title:'On Guard <em>Through the Night</em>', text:'Night guards carry torches, radios and <strong>heightened vigilance</strong>. Threats don\'t sleep — neither do we.',             list:['✓ Night patrol rotations','✓ Intruder detection','✓ Digital logs'],         night:true, walkie:false,torch:true, lc:0x4488cc,li:0.6},
  {id:'residential',label:'🏠 Residential',        pos:[32,0,-13], r:7, icon:'🏠',tag:'GATED COMMUNITIES',  title:'Protecting <em>Homes</em>',           text:'From gated societies to apartments — resident safety, vehicle entry and <strong>community watch patrols</strong>.',               list:['✓ Gate management','✓ Resident verification','✓ Emergency response'],       night:false,walkie:true, torch:false,lc:0x44cc88,li:0.5},
  {id:'industrial', label:'🏭 Industrial Zone',    pos:[-28,0,-20],r:7, icon:'🏭',tag:'INDUSTRIAL SECURITY',title:'Factory & Plant <em>Protection</em>', text:'<strong>High-security perimeter control</strong> for plants — shift guards, asset tracking, safety enforcement.',                list:['✓ Perimeter surveillance','✓ Asset protection','✓ Shift deployment'],       night:false,walkie:true, torch:false,lc:0xff8800,li:0.6},
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
// DARK colours for all building mats
const DARK={
  ground:0x0a1520, gridA:0x1a3050, gridB:0x0d1f35,
  hqMain:0x0c1e38, hqAccent:0x0e2244, hqSide:0x0b1c32,
  corporate:0x0d2040, corporateTop:0x0f2550, corpGlass:0x1a4060,
  booth:0x1a3050,
  fire:0x333333,
  tower:0x1a3050, towerTop:0x112030,
  house:0x0e2035, roof:0x1a3a5f,
  factory:0x0c1a28, chimney:0x1a2a3a,
  trunk:0x4a3520, treetop:0x0d2d18,
};
// LIGHT colours — Vibrant Aesthetic Pastel-Pop Palette
const LIGHT={
  // Ground: warm golden meadow
  ground:0xf5c842,
  // Grid: soft coral + peach
  gridA:0xff6b6b, gridB:0xffaa88,
  // HQ: rich coral-pink facade
  hqMain:0xff8c69, hqAccent:0xff6f61, hqSide:0xf4a261,
  // Corporate: sky teal glass tower
  corporate:0x00b4d8, corporateTop:0x0096c7, corpGlass:0x48cae4,
  // Gate booth: warm saffron
  booth:0xffd166,
  // Fire zone: bright orange-red brick
  fire:0xe63946,
  // Night tower: deep violet-blue (still bold in day)
  tower:0x7209b7, towerTop:0x560bad,
  // Houses: pastel mint + vivid coral roof
  house:0xb7e4c7, roof:0xef233c,
  // Factory: lavender steel
  factory:0xc77dff, chimney:0x9d4edd,
  // Trees: rich earthy trunk + vivid leaf green
  trunk:0x9c6644, treetop:0x52b788,
};

// Collect all material references once after scene is built
// We walk the scene and tag materials by the mesh userData.tag set during creation
// Simpler: we just keep explicit references
let allBuildingMats=[];  // filled below after scene build

function applyTheme(light){
  isLight=light;
  const C=light?LIGHT:DARK;
  // Sky / fog
  // Sky: lavender-pink gradient sky vs deep navy
  const skyCol = light ? 0xffd6e7 : 0x07111f;
  renderer.setClearColor(skyCol);
  scene.fog.color.set(light ? 0xffe8f0 : 0x07111f);
  scene.fog.near = light ? 50 : 40;
  scene.fog.far  = light ? 140 : 120;
  // Ground
  ground.material.color.set(C.ground);
  // Grid — coral + peach crosshatch
  if(grid.material.length){grid.material[0].color.set(C.gridA);grid.material[1].color.set(C.gridB);}
  // Stars / moon / sun
  stars.visible=!light; moonMesh.visible=!light; haloMesh.visible=!light;
  sunSphere.visible=light;
  // Lights — warm golden-pink sunlight in day
  ambient.color.set(light?0xfff0f5:0x223355);
  ambient.intensity=light?2.0:0.8;
  sun.color.set(light?0xffcc88:0xfff5e0);
  sun.intensity=light?2.4:1.2;
  moonLight.intensity=light?0:0.6;
  // Tint fog to match sky colour
  if(light){ scene.fog.color.set(0xffdde8); }
  // Apply to all registered mats
  allBuildingMats.forEach(o=>{ if(o&&o.mat&&o.mat.color) o.mat.color.set(light?o.lightCol:o.darkCol); });
  // Tree tops specially (they are separate)
  treeTopMats.forEach(m=>m.color.set(light?LIGHT.treetop:DARK.treetop));
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
let orbitTheta=0,orbitPhi=0.55,orbitRadius=26;
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
const MMS=130/120;
function worldToMM(x,z){return[(x+60)*MMS,(z+60)*MMS];}
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
    guardGroup.position.x=Math.max(-55,Math.min(55,guardGroup.position.x+dir.x*spd*delta));
    guardGroup.position.z=Math.max(-55,Math.min(55,guardGroup.position.z+dir.z*spd*delta));
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

setTimeout(()=>showSpeech(isMobile()?'Use joystick to move!':'Arrow keys to move!'),1200);
animate();

}catch(err){
  console.error('Scene error:',err);
  startWorld();
}