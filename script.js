/* =====================================================
   ABHEDYA SECURITY — Three.js Interactive World
   ===================================================== */

// ── EMAILJS (optional — safe even if not configured) ──────────────────────────
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';

try {
  if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }
} catch(e) { /* emailjs not ready, will fallback to WhatsApp */ }

// ── FORCE DISMISS LOADING after 4s no matter what ────────────────────────────
const FORCE_DISMISS = setTimeout(() => startWorld(), 4000);

// ── LOADING UI ───────────────────────────────────────────────────────────────
const lsBar  = document.getElementById('lsBar');
const lsHint = document.getElementById('lsHint');
const hints  = ['Building world…','Deploying guard…','Setting up zones…','Ready to patrol!'];
let loadProgress = 0;
const loadInterval = setInterval(() => {
  loadProgress += Math.random() * 22 + 10;
  if (loadProgress >= 100) {
    loadProgress = 100;
    clearInterval(loadInterval);
    startWorld();
  }
  if (lsBar)  lsBar.style.width  = loadProgress + '%';
  if (lsHint) lsHint.textContent = hints[Math.min(3, Math.floor(loadProgress / 26))];
}, 180);

function startWorld() {
  clearTimeout(FORCE_DISMISS);
  clearInterval(loadInterval);
  const ls = document.getElementById('loadingScreen');
  if (!ls || ls.style.display === 'none') return;
  ls.classList.add('fade-out');
  setTimeout(() => { ls.style.display = 'none'; }, 900);
}

// ── WRAP EVERYTHING IN TRY/CATCH so a scene error never re-freezes ────────────
try {

// ── SCENE SETUP ──────────────────────────────────────────────────────────────
const canvas = document.getElementById('threeCanvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x07111f);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x07111f, 40, 120);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 18, 28);
camera.lookAt(0, 0, 0);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── LIGHTS ───────────────────────────────────────────────────────────────────
const ambient  = new THREE.AmbientLight(0x223355, 0.8);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xfff5e0, 1.2);
sun.position.set(20, 40, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left   = -50; sun.shadow.camera.right = 50;
sun.shadow.camera.top    =  50; sun.shadow.camera.bottom = -50;
sun.shadow.camera.near   = 0.1; sun.shadow.camera.far   = 100;
scene.add(sun);

const moonLight = new THREE.PointLight(0x4466aa, 0.6, 60);
moonLight.position.set(-20, 25, -15);
scene.add(moonLight);

// ── HELPERS ──────────────────────────────────────────────────────────────────
function addBox(w, h, d, color, x, y, z) {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshLambertMaterial({ color })
  );
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  scene.add(m);
  return m;
}
function addCyl(rt, rb, h, segs, color, x, y, z) {
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(rt, rb, h, segs),
    new THREE.MeshLambertMaterial({ color })
  );
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  scene.add(m);
  return m;
}

// ── GROUND ───────────────────────────────────────────────────────────────────
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshLambertMaterial({ color: 0x0a1520 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Ground grid
const gridHelper = new THREE.GridHelper(120, 30, 0x1a3050, 0x0d1f35);
gridHelper.position.y = 0.02;
scene.add(gridHelper);

// ── STARS ────────────────────────────────────────────────────────────────────
const starGeo = new THREE.BufferGeometry();
const starArr = new Float32Array(800 * 3);
for (let i = 0; i < 800; i++) {
  starArr[i*3]   = (Math.random()-0.5)*300;
  starArr[i*3+1] = Math.random()*80+20;
  starArr[i*3+2] = (Math.random()-0.5)*300;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starArr, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color:0xffffff, size:0.3, transparent:true, opacity:0.7 }));
scene.add(stars);

// ── MOON ─────────────────────────────────────────────────────────────────────
const moonMesh = new THREE.Mesh(
  new THREE.SphereGeometry(2.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xfff5c0 })
);
moonMesh.position.set(-30, 45, -40);
scene.add(moonMesh);

// Halo around moon
const haloMesh = new THREE.Mesh(
  new THREE.RingGeometry(3, 5, 32),
  new THREE.MeshBasicMaterial({ color:0xfff5c0, transparent:true, opacity:0.08, side:THREE.DoubleSide })
);
haloMesh.position.copy(moonMesh.position);
scene.add(haloMesh);

// ── HQ BUILDING ──────────────────────────────────────────────────────────────
addBox(8, 20, 8, 0x0c1e38, -18, 10, -8);
addBox(5, 6, 5, 0x0e2244, -18, 23, -8);
addBox(5, 12, 6, 0x0b1c32, -26, 6, -8);
// Windows
for (let row = 0; row < 4; row++) for (let col = 0; col < 3; col++) {
  const w = new THREE.Mesh(
    new THREE.PlaneGeometry(0.6, 0.8),
    new THREE.MeshBasicMaterial({ color:0xD4AF37, opacity:0.7, transparent:true })
  );
  w.position.set(-14.0 + col*2, 4+row*3.5, -3.9);
  scene.add(w);
}
// HQ Sign
const signC = document.createElement('canvas');
signC.width = 512; signC.height = 128;
const sx = signC.getContext('2d');
sx.fillStyle = '#D4AF37'; sx.fillRect(0,0,512,128);
sx.fillStyle = '#0d1a2e'; sx.font = 'bold 62px Arial';
sx.textAlign = 'center'; sx.fillText('ABHEDYA HQ', 256, 88);
const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(5,1.2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(signC) }));
signMesh.position.set(-18, 21.5, -3.9);
scene.add(signMesh);

// ── GATE (zone 0) ─────────────────────────────────────────────────────────────
addBox(0.5, 5, 0.5, 0xD4AF37, -2.5, 2.5, 12);
addBox(0.5, 5, 0.5, 0xD4AF37,  2.5, 2.5, 12);
addBox(5.5, 0.3, 0.3, 0xD4AF37, 0, 5.2, 12);
for (let i = 0; i < 4; i++) addBox(0.15, 4, 0.15, 0xc8a020, -2+i*1.3, 2, 12);
addBox(2, 3, 2, 0x1a3050, 5, 1.5, 12);
addBox(2, 0.15, 2, 0xD4AF37, 5, 3.1, 12);

// ── CORPORATE BUILDING ────────────────────────────────────────────────────────
addBox(10, 16, 8, 0x0d2040, 18, 8, -5);
addBox(7, 4, 6, 0x0f2550, 18, 18, -5);
for (let f = 0; f < 5; f++) {
  const face = new THREE.Mesh(new THREE.PlaneGeometry(9,2.5), new THREE.MeshBasicMaterial({ color:0x1a4060, opacity:0.4, transparent:true }));
  face.position.set(18, 2.5+f*3, -0.9);
  scene.add(face);
}

// ── FIRE TRAINING ZONE ────────────────────────────────────────────────────────
addCyl(0.5, 0.6, 1.5, 8, 0x333333, -18, 0.75, 16);
const flameMeshes = [];
const flameColors = [0xff4400, 0xff8800, 0xffcc00];
for (let fi = 0; fi < 3; fi++) {
  const fm = new THREE.Mesh(
    new THREE.ConeGeometry(0.3+fi*0.1, 1.2+fi*0.3, 6),
    new THREE.MeshBasicMaterial({ color:flameColors[fi], transparent:true, opacity:0.85 })
  );
  fm.position.set(-18+(fi-1)*0.4, 1.8+fi*0.2, 16);
  scene.add(fm);
  flameMeshes.push(fm);
}
addBox(0.3, 1, 0.3, 0xcc2200, -16, 0.5, 15.5);
addBox(0.3, 0.3, 0.3, 0x888888, -16, 1.15, 15.5);
// fire glow light
const fireGlow = new THREE.PointLight(0xff4400, 1.5, 10);
fireGlow.position.set(-18, 3, 16);
scene.add(fireGlow);

// ── NIGHT WATCH TOWER ────────────────────────────────────────────────────────
addCyl(0.3, 0.3, 8, 8, 0x1a3050, 18, 4, 16);
addBox(3, 0.2, 3, 0x1a3050, 18, 8.2, 16);
addBox(2.5, 2, 2.5, 0x112030, 18, 9.2, 16);
const spot = new THREE.SpotLight(0xffffcc, 2, 30, Math.PI/8, 0.5);
spot.position.set(18, 9.5, 16);
spot.target.position.set(18, 0, 10);
scene.add(spot); scene.add(spot.target);

// ── RESIDENTIAL CLUSTER ───────────────────────────────────────────────────────
[[28,-12],[33,-8],[38,-14],[30,-18]].forEach(([hx,hz]) => {
  addBox(3.5, 3, 3.5, 0x0e2035, hx, 1.5, hz);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.8,1.5,4), new THREE.MeshLambertMaterial({ color:0x1a3a5f }));
  roof.position.set(hx, 3.75, hz); roof.rotation.y = Math.PI/4;
  roof.castShadow = true; scene.add(roof);
});

// ── INDUSTRIAL ZONE ───────────────────────────────────────────────────────────
addBox(12, 8, 10, 0x0c1a28, -28, 4, -20);
addCyl(0.4, 0.5, 6, 8, 0x1a2a3a, -25, 7, -18);
addCyl(0.4, 0.5, 8, 8, 0x1a2a3a, -22, 8, -22);
// Smoke
const smokeGeo = new THREE.BufferGeometry();
const smokeArr = new Float32Array(60*3);
for (let s = 0; s < 60; s++) {
  smokeArr[s*3]   = -24+Math.random()*4;
  smokeArr[s*3+1] = 12+Math.random()*8;
  smokeArr[s*3+2] = -20+Math.random()*4;
}
smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokeArr, 3));
const smoke = new THREE.Points(smokeGeo, new THREE.PointsMaterial({ color:0x445566, size:0.5, transparent:true, opacity:0.35 }));
scene.add(smoke);

// ── TREES ────────────────────────────────────────────────────────────────────
[[-5,-5],[5,-5],[-8,5],[8,5],[-3,20],[3,20],[10,-20],[-10,-20],[25,5],[-25,5]].forEach(([x,z]) => {
  addCyl(0.15, 0.2, 2, 6, 0x4a3520, x, 1, z);
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.8,8,6), new THREE.MeshLambertMaterial({ color:0x0d2d18 }));
  top.position.set(x, 2.5, z); top.castShadow = true; scene.add(top);
});

// ── GUARD CHARACTER ──────────────────────────────────────────────────────────
const guardGroup = new THREE.Group();
scene.add(guardGroup);

function guardBox(w, h, d, color, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshLambertMaterial({ color }));
  m.position.set(x, y, z);
  m.castShadow = true;
  guardGroup.add(m);
  return m;
}

// Boots
const bootL = guardBox(0.35, 0.4, 0.6, 0x0d1a2e, -0.15, 0.2, 0.05);
const bootR = guardBox(0.35, 0.4, 0.6, 0x0d1a2e,  0.15, 0.2, 0.05);

// Legs (pivot from hip)
const legLPivot = new THREE.Group(); legLPivot.position.set(-0.13, 1.1, 0); guardGroup.add(legLPivot);
const legLMesh = new THREE.Mesh(new THREE.BoxGeometry(0.28,0.8,0.28), new THREE.MeshLambertMaterial({ color:0x1a2540 }));
legLMesh.position.set(0,-0.4,0); legLMesh.castShadow=true; legLPivot.add(legLMesh);

const legRPivot = new THREE.Group(); legRPivot.position.set(0.13, 1.1, 0); guardGroup.add(legRPivot);
const legRMesh = new THREE.Mesh(new THREE.BoxGeometry(0.28,0.8,0.28), new THREE.MeshLambertMaterial({ color:0x1a2540 }));
legRMesh.position.set(0,-0.4,0); legRMesh.castShadow=true; legRPivot.add(legRMesh);

// Body
const body = guardBox(0.72, 0.95, 0.42, 0x1e3a5f, 0, 1.67, 0);
// Belt
guardBox(0.74, 0.1, 0.44, 0xD4AF37, 0, 1.27, 0);
// Chest badge
const badge = new THREE.Mesh(new THREE.PlaneGeometry(0.18,0.18), new THREE.MeshBasicMaterial({ color:0xD4AF37 }));
badge.position.set(0, 1.78, 0.22); guardGroup.add(badge);

// Shoulders
guardBox(0.22, 0.22, 0.44, 0x1e3a5f, -0.47, 2.08, 0);
guardBox(0.22, 0.22, 0.44, 0x1e3a5f,  0.47, 2.08, 0);

// Arms (pivot from shoulder)
const armLPivot = new THREE.Group(); armLPivot.position.set(-0.47, 2.05, 0); guardGroup.add(armLPivot);
const armLMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24,0.72,0.24), new THREE.MeshLambertMaterial({ color:0x1e3a5f }));
armLMesh.position.set(0,-0.36,0); armLMesh.castShadow=true; armLPivot.add(armLMesh);
const gloveL = new THREE.Mesh(new THREE.SphereGeometry(0.12,8,6), new THREE.MeshLambertMaterial({ color:0x0d1a2e }));
gloveL.position.set(0,-0.76,0); armLPivot.add(gloveL);

const armRPivot = new THREE.Group(); armRPivot.position.set(0.47, 2.05, 0); guardGroup.add(armRPivot);
const armRMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24,0.72,0.24), new THREE.MeshLambertMaterial({ color:0x1e3a5f }));
armRMesh.position.set(0,-0.36,0); armRMesh.castShadow=true; armRPivot.add(armRMesh);
const gloveR = new THREE.Mesh(new THREE.SphereGeometry(0.12,8,6), new THREE.MeshLambertMaterial({ color:0x0d1a2e }));
gloveR.position.set(0,-0.76,0); armRPivot.add(gloveR);

// Neck
guardBox(0.2, 0.28, 0.2, 0xc8a882, 0, 2.22, 0);

// Head
const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.28,14,12), new THREE.MeshLambertMaterial({ color:0xc8a882 }));
headMesh.position.set(0,2.62,0); headMesh.castShadow=true; guardGroup.add(headMesh);

// Cap (flat cylinder + brim)
const capTop = new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.30,0.15,8), new THREE.MeshLambertMaterial({ color:0x1e3a5f }));
capTop.position.set(0,2.92,0); guardGroup.add(capTop);
const capBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.38,0.05,16), new THREE.MeshLambertMaterial({ color:0x1e3a5f }));
capBrim.position.set(0,2.82,0.05); guardGroup.add(capBrim);
const capBadge = new THREE.Mesh(new THREE.SphereGeometry(0.07,8,6), new THREE.MeshLambertMaterial({ color:0xD4AF37, emissive:0xD4AF37, emissiveIntensity:0.3 }));
capBadge.position.set(0,2.88,0.29); guardGroup.add(capBadge);

// Eyes
[[-0.1,2.66,0.26],[0.1,2.66,0.26]].forEach(([x,y,z]) => {
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.042,8,6), new THREE.MeshLambertMaterial({ color:0x111122 }));
  eye.position.set(x,y,z); guardGroup.add(eye);
});

// Moustache
const must = new THREE.Mesh(new THREE.BoxGeometry(0.16,0.035,0.04), new THREE.MeshLambertMaterial({ color:0x3a2010 }));
must.position.set(0,2.56,0.27); guardGroup.add(must);

// Walkie-talkie (left hand) — hidden by default
const walkieGroup = new THREE.Group();
walkieGroup.position.set(0,-0.82,0);
armLPivot.add(walkieGroup);
const walkieMesh = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.22,0.06), new THREE.MeshLambertMaterial({ color:0xD4AF37 }));
const walkieAnt  = new THREE.Mesh(new THREE.CylinderGeometry(0.008,0.008,0.14,4), new THREE.MeshLambertMaterial({ color:0x888888 }));
walkieAnt.position.set(0.04,0.18,0);
walkieGroup.add(walkieMesh); walkieGroup.add(walkieAnt);
walkieGroup.visible = false;

// Torch (right hand) — hidden by default
const torchGroup = new THREE.Group();
torchGroup.position.set(0,-0.82,0);
armRPivot.add(torchGroup);
const torchBody = new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.05,0.35,8), new THREE.MeshLambertMaterial({ color:0x888888 }));
const torchHead = new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.06,0.1,8),  new THREE.MeshLambertMaterial({ color:0xaaaaaa }));
torchHead.position.set(0,0.22,0);
torchGroup.add(torchBody); torchGroup.add(torchHead);
const torchLight = new THREE.PointLight(0xffffaa, 0, 5);
torchGroup.add(torchLight);
torchGroup.visible = false;

// Guard start position
guardGroup.position.set(0, 0, 8);

// ── ZONE DEFINITIONS ─────────────────────────────────────────────────────────
const zones = [
  { id:'gate',        label:'🚪 Gate Security',      pos:[-2,0,12],  r:5,  icon:'🚪', tag:'ENTRANCE CONTROL',   title:'Securing the <em>Gate</em>',          text:'Our guards maintain <strong>strict access control</strong> at every entry point — visitor logging, vehicle checks, zero-tolerance unauthorized entry.',  list:['✓ Visitor management','✓ Vehicle checking','✓ 24/7 manned entry'],              night:false, walkie:true,  torch:false, lc:0xffffaa, li:0.5 },
  { id:'hq',          label:'🏛 Abhedya HQ',          pos:[-18,0,-5], r:6,  icon:'🛡️',tag:'OUR FOUNDATION',      title:'What is <em>Abhedya</em>?',            text:'Abhedya means <strong>Impenetrable</strong>. Founded on armed forces values — discipline, vigilance, and zero compromise.',                           list:['✓ Background verified','✓ Military supervisors','✓ 24×7 command'],             night:false, walkie:true,  torch:false, lc:0xD4AF37, li:0.8 },
  { id:'corporate',   label:'🏢 Corporate Security',  pos:[18,0,-5],  r:6,  icon:'🏢', tag:'CORPORATE PATROL',    title:'Office & IT Park <em>Security</em>',   text:'Disciplined floor patrols, RFID access management, and professional protocols for <strong>corporate campuses</strong> and IT parks.',               list:['✓ Access control','✓ CCTV coordination','✓ Visitor mgmt'],                     night:false, walkie:true,  torch:false, lc:0x4466ff, li:0.4 },
  { id:'fire',        label:'🔥 Fire Training Zone',  pos:[-18,0,16], r:5,  icon:'🔥', tag:'EMERGENCY TRAINING',  title:'Fire & Emergency <em>Response</em>',   text:'Every Abhedya guard is <strong>fire safety certified</strong>. We drill evacuation, extinguisher use, and first response until it is instinct.',      list:['✓ Fire extinguisher cert.','✓ Evacuation drills','✓ First aid trained'],       night:true,  walkie:false, torch:false, lc:0xff4400, li:1.2 },
  { id:'nightwatch',  label:'🌙 Night Watch Tower',   pos:[18,0,16],  r:5,  icon:'🌙', tag:'NIGHT SHIFT',         title:'On Guard <em>Through the Night</em>',  text:'Our night-shift guards carry torches, radios, and <strong>heightened vigilance training</strong>. Threats don\'t sleep — neither do we.',              list:['✓ Night patrol rotations','✓ Intruder detection','✓ Digital logs'],            night:true,  walkie:false, torch:true,  lc:0x4488cc, li:0.6 },
  { id:'residential', label:'🏠 Residential',         pos:[32,0,-13], r:7,  icon:'🏠', tag:'GATED COMMUNITIES',   title:'Protecting <em>Homes</em>',            text:'From gated societies to apartment complexes — resident safety, vehicle entry management and <strong>community watch patrols</strong>.',                list:['✓ Gate management','✓ Resident verification','✓ Emergency response'],          night:false, walkie:true,  torch:false, lc:0x44cc88, li:0.5 },
  { id:'industrial',  label:'🏭 Industrial Zone',     pos:[-28,0,-20],r:7,  icon:'🏭', tag:'INDUSTRIAL SECURITY', title:'Factory & Plant <em>Protection</em>',  text:'<strong>High-security perimeter control</strong> for manufacturing plants — shift guards, material movement tracking, and safety enforcement.',         list:['✓ Perimeter surveillance','✓ Asset protection','✓ Shift deployment'],          night:false, walkie:true,  torch:false, lc:0xff8800, li:0.6 },
];

zones.forEach(z => {
  z.position = new THREE.Vector3(...z.pos);

  // Pulsing ring
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(z.r-0.2, z.r, 32),
    new THREE.MeshBasicMaterial({ color:z.lc, transparent:true, opacity:0.25, side:THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI/2;
  ring.position.set(...z.pos).setY(0.05);
  scene.add(ring);
  z.ring = ring;

  // Zone glow light
  const zl = new THREE.PointLight(z.lc, z.li, 15);
  zl.position.set(z.pos[0], 6, z.pos[2]);
  scene.add(zl);
  z.zlight = zl;

  // Floating label billboard
  const lc2 = document.createElement('canvas');
  lc2.width = 280; lc2.height = 70;
  const lx = lc2.getContext('2d');
  lx.fillStyle='rgba(7,17,31,0.88)'; lx.beginPath(); lx.roundRect(0,0,280,70,10); lx.fill();
  lx.strokeStyle='#D4AF37'; lx.lineWidth=2; lx.beginPath(); lx.roundRect(1,1,278,68,10); lx.stroke();
  lx.fillStyle='#D4AF37'; lx.font='bold 22px Arial'; lx.textAlign='center'; lx.fillText(z.label, 140, 44);
  const lSprite = new THREE.Mesh(
    new THREE.PlaneGeometry(3.8, 0.95),
    new THREE.MeshBasicMaterial({ map:new THREE.CanvasTexture(lc2), transparent:true, depthWrite:false })
  );
  lSprite.position.set(z.pos[0], 5.5, z.pos[2]);
  lSprite.scale.set(0,0,0);
  scene.add(lSprite);
  z.sprite = lSprite;
});

// ── CAMERA ORBIT ─────────────────────────────────────────────────────────────
let orbitTheta = 0, orbitPhi = 0.55, orbitRadius = 26;
let isDragging = false, lastMX = 0, lastMY = 0;
const camSmooth = new THREE.Vector3(0,0,0);

canvas.addEventListener('mousedown', e => { isDragging=true; lastMX=e.clientX; lastMY=e.clientY; });
window.addEventListener('mouseup',   () => isDragging=false);
window.addEventListener('mousemove', e => {
  if (!isDragging) return;
  orbitTheta -= (e.clientX-lastMX)*0.005;
  orbitPhi = Math.max(0.15, Math.min(1.4, orbitPhi-(e.clientY-lastMY)*0.005));
  lastMX=e.clientX; lastMY=e.clientY;
});
canvas.addEventListener('wheel', e => {
  orbitRadius = Math.max(10, Math.min(60, orbitRadius+e.deltaY*0.04));
}, { passive:true });
// Touch
let lastTouch=null;
canvas.addEventListener('touchstart', e => { if(e.touches.length===1) lastTouch={x:e.touches[0].clientX,y:e.touches[0].clientY}; });
canvas.addEventListener('touchmove', e => {
  if(e.touches.length===1 && lastTouch){
    orbitTheta -= (e.touches[0].clientX-lastTouch.x)*0.006;
    orbitPhi = Math.max(0.15, Math.min(1.4, orbitPhi-(e.touches[0].clientY-lastTouch.y)*0.006));
    lastTouch = {x:e.touches[0].clientX,y:e.touches[0].clientY};
  }
});

// ── KEYBOARD INPUT ───────────────────────────────────────────────────────────
const keys = {};
window.addEventListener('keydown', e => { keys[e.code]=true; e.preventDefault && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code) && e.preventDefault(); });
window.addEventListener('keyup',   e => { keys[e.code]=false; });

// ── ZONE DETECTION ────────────────────────────────────────────────────────────
let activeZone = null;
const zoneLabel = document.getElementById('zoneLabel');
const infoPanel = document.getElementById('infoPanel');

function openZone(z) {
  document.getElementById('ipIcon').textContent   = z.icon;
  document.getElementById('ipTag').textContent    = z.tag;
  document.getElementById('ipTitle').innerHTML    = z.title;
  document.getElementById('ipText').innerHTML     = z.text;
  document.getElementById('ipList').innerHTML     = (z.list||[]).map(l=>`<li>${l}</li>`).join('');
  infoPanel.classList.remove('hidden');
  requestAnimationFrame(() => infoPanel.classList.add('visible'));
  zoneLabel.textContent = z.label;
  zoneLabel.classList.add('visible');
  // Guard props
  torchGroup.visible   = z.torch; torchLight.intensity = z.torch ? 2 : 0;
  walkieGroup.visible  = z.walkie;
  // Mood lighting
  ambient.intensity    = z.night ? 0.3 : 0.8;
  moonLight.intensity  = z.night ? 1.4 : 0.6;
  // Ring highlight
  if(z.ring) z.ring.material.opacity = 0.7;
  if(z.sprite) z.sprite.scale.set(1,1,1);
  showGuardSpeech(getSpeech(z.id));
}

function closeZone(prev) {
  infoPanel.classList.remove('visible');
  zoneLabel.classList.remove('visible');
  setTimeout(()=>{ if(!infoPanel.classList.contains('visible')) infoPanel.classList.add('hidden'); },500);
  torchGroup.visible=false; torchLight.intensity=0; walkieGroup.visible=false;
  ambient.intensity=0.8; moonLight.intensity=0.6;
  if(prev&&prev.ring)   prev.ring.material.opacity=0.25;
  if(prev&&prev.sprite) prev.sprite.scale.set(0,0,0);
}

document.getElementById('ipClose').addEventListener('click', ()=>{ closeZone(activeZone); activeZone=null; });

// ── SPEECH BUBBLE (3D billboard above guard head) ─────────────────────────────
let speechMesh = null, speechTimer = null;
function showGuardSpeech(text) {
  if(speechMesh){ guardGroup.remove(speechMesh); speechMesh=null; }
  clearTimeout(speechTimer);
  const sc2 = document.createElement('canvas');
  sc2.width=320; sc2.height=80;
  const ctx = sc2.getContext('2d');
  ctx.fillStyle='rgba(7,17,31,0.9)'; ctx.beginPath(); ctx.roundRect(0,0,320,80,10); ctx.fill();
  ctx.strokeStyle='#D4AF37'; ctx.lineWidth=2; ctx.beginPath(); ctx.roundRect(1,1,318,78,10); ctx.stroke();
  ctx.fillStyle='#D4AF37'; ctx.font='bold 19px Arial'; ctx.textAlign='center'; ctx.fillText(text,160,47);
  speechMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6,0.65),
    new THREE.MeshBasicMaterial({ map:new THREE.CanvasTexture(sc2), transparent:true, depthWrite:false })
  );
  speechMesh.position.set(0,4.0,0);
  guardGroup.add(speechMesh);
  speechTimer = setTimeout(()=>{ if(speechMesh){ guardGroup.remove(speechMesh); speechMesh=null; } },3500);
}

function getSpeech(id){
  return {gate:'Checking all access!',hq:'Abhedya — Impenetrable!',corporate:'Floor patrol active.',fire:'Fire training certified!',nightwatch:'Night watch on duty!',residential:'Community secured!',industrial:'Perimeter locked!'}[id]||'On patrol!';
}

// ── MINI MAP ─────────────────────────────────────────────────────────────────
const mmC   = document.getElementById('miniMapCanvas');
const mmCtx = mmC ? mmC.getContext('2d') : null;
const MMS   = 160/120;
function worldToMM(x,z){ return [(x+60)*MMS,(z+60)*MMS]; }
function drawMiniMap(){
  if(!mmCtx) return;
  mmCtx.clearRect(0,0,160,160);
  mmCtx.fillStyle='rgba(7,17,31,0.9)'; mmCtx.fillRect(0,0,160,160);
  zones.forEach(z=>{
    const[mx,mz]=worldToMM(z.pos[0],z.pos[2]);
    mmCtx.beginPath(); mmCtx.arc(mx,mz,z.r*MMS,0,Math.PI*2);
    mmCtx.strokeStyle='#D4AF37'; mmCtx.lineWidth=1; mmCtx.globalAlpha=0.4; mmCtx.stroke(); mmCtx.globalAlpha=1;
  });
  const[gx,gz]=worldToMM(guardGroup.position.x,guardGroup.position.z);
  mmCtx.beginPath(); mmCtx.arc(gx,gz,4,0,Math.PI*2); mmCtx.fillStyle='#D4AF37'; mmCtx.fill();
  mmCtx.save(); mmCtx.translate(gx,gz); mmCtx.rotate(guardGroup.rotation.y+Math.PI);
  mmCtx.beginPath(); mmCtx.moveTo(0,-7); mmCtx.lineTo(-3,2); mmCtx.lineTo(3,2); mmCtx.closePath();
  mmCtx.fillStyle='#fff'; mmCtx.fill(); mmCtx.restore();
}

// ── CLICK TO OPEN ZONE INFO ───────────────────────────────────────────────────
const raycaster = new THREE.Raycaster();
const mouse2    = new THREE.Vector2();
canvas.addEventListener('click', e=>{
  mouse2.x=(e.clientX/window.innerWidth)*2-1;
  mouse2.y=-(e.clientY/window.innerHeight)*2+1;
  raycaster.setFromCamera(mouse2,camera);
  zones.forEach(z=>{
    if(z.sprite&&z.sprite.scale.x>0){
      if(raycaster.intersectObject(z.sprite).length) openZone(z);
    }
  });
});

// ── BOTTOM NAV ────────────────────────────────────────────────────────────────
document.querySelectorAll('.bn-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.bn-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const sec=btn.dataset.section;
    if(sec==='world'){ closeAllPanels(); return; }
    openPanel(sec+'Panel');
  });
});
function openPanel(id){
  closeAllPanels();
  const p=document.getElementById(id);
  if(!p) return;
  p.classList.remove('hidden');
  requestAnimationFrame(()=>p.classList.add('open'));
}
function closePanel(id){
  const p=document.getElementById(id);
  if(!p) return;
  p.classList.remove('open');
  setTimeout(()=>p.classList.add('hidden'),400);
  document.querySelectorAll('.bn-btn').forEach(b=>{ b.classList.toggle('active', b.dataset.section==='world'); });
}
function closeAllPanels(){ ['servicesPanel','teamPanel','contactPanel'].forEach(closePanel); }
window.closePanel = closePanel;

// ── CONTACT FORM ─────────────────────────────────────────────────────────────
document.getElementById('contactForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const btn    = document.getElementById('sendBtn');
  const status = document.getElementById('formStatus');
  const name    = document.getElementById('cf_name').value.trim();
  const phone   = document.getElementById('cf_phone').value.trim();
  const email   = document.getElementById('cf_email').value.trim();
  const service = document.getElementById('cf_service').value;
  const message = document.getElementById('cf_message').value.trim();
  if(!name||!phone||!message){
    status.textContent='⚠ Please fill in Name, Phone and Message.';
    status.className='form-status error'; return;
  }
  btn.disabled=true; btn.textContent='Sending…'; status.textContent=''; status.className='form-status';
  const params={from_name:name,phone_number:phone,email_address:email||'Not provided',service_required:service||'Not specified',message,to_name:'Abhedya Security'};
  try {
    if(typeof emailjs!=='undefined' && EMAILJS_SERVICE_ID!=='YOUR_SERVICE_ID'){
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
      status.textContent='✓ Message sent! We will contact you within 24 hours.';
      status.className='form-status success';
      e.target.reset();
    } else {
      // WhatsApp fallback
      const msg=encodeURIComponent(`Hello Abhedya Security!\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email||'N/A'}\nService: ${service||'N/A'}\nMessage: ${message}`);
      window.open(`https://wa.me/917666793286?text=${msg}`,'_blank');
      status.textContent='✓ Opening WhatsApp with your message!';
      status.className='form-status success';
      e.target.reset();
    }
  } catch(err){
    status.textContent='✗ Send failed. Please WhatsApp us directly.';
    status.className='form-status error';
  } finally {
    btn.disabled=false; btn.textContent='Send Request →';
  }
});

// ── ANIMATION LOOP ────────────────────────────────────────────────────────────
const clock     = new THREE.Clock();
let   walkCycle = 0;
let   frameN    = 0;

function animate(){
  requestAnimationFrame(animate);
  const delta   = Math.min(clock.getDelta(), 0.05); // cap delta to avoid jumps
  const elapsed = clock.getElapsedTime();
  frameN++;

  // ── Movement
  let moving = false;
  const dir  = new THREE.Vector3();
  if(keys['ArrowUp']   ||keys['KeyW']){ dir.z-=1; moving=true; }
  if(keys['ArrowDown'] ||keys['KeyS']){ dir.z+=1; moving=true; }
  if(keys['ArrowLeft'] ||keys['KeyA']){ dir.x-=1; moving=true; }
  if(keys['ArrowRight']||keys['KeyD']){ dir.x+=1; moving=true; }

  if(moving){
    dir.normalize().applyAxisAngle(new THREE.Vector3(0,1,0), orbitTheta);
    const spd = 5.5;
    guardGroup.position.x = Math.max(-55, Math.min(55, guardGroup.position.x + dir.x*spd*delta));
    guardGroup.position.z = Math.max(-55, Math.min(55, guardGroup.position.z + dir.z*spd*delta));
    guardGroup.rotation.y = Math.atan2(dir.x, dir.z);
    walkCycle += delta*9;
  }

  // ── Walk / idle animation
  if(moving){
    const swing = Math.sin(walkCycle)*0.55;
    legLPivot.rotation.x =  swing;
    legRPivot.rotation.x = -swing;
    armLPivot.rotation.x = -swing*0.7;
    armRPivot.rotation.x =  swing*0.7;
    bootL.position.z = Math.sin(walkCycle)*0.1;
    bootR.position.z =-Math.sin(walkCycle)*0.1;
    body.position.y  = 1.67 + Math.abs(Math.sin(walkCycle*2))*0.02;
  } else {
    const breathe = Math.sin(elapsed*1.4)*0.012;
    body.position.y  = 1.67+breathe;
    legLPivot.rotation.x = 0;
    legRPivot.rotation.x = 0;
    armLPivot.rotation.x = 0;
    armRPivot.rotation.x = 0;
    bootL.position.z = 0;
    bootR.position.z = 0;
    // slight idle sway
    armLPivot.rotation.z =  0.05+Math.sin(elapsed*0.8)*0.02;
    armRPivot.rotation.z = -0.05-Math.sin(elapsed*0.8)*0.02;
  }

  // ── Speech billboard always faces camera
  if(speechMesh) speechMesh.rotation.y = -guardGroup.rotation.y + orbitTheta;

  // ── Zone sprite labels face camera
  zones.forEach(z=>{ if(z.sprite&&z.sprite.scale.x>0) z.sprite.rotation.y=orbitTheta; });

  // ── Flames
  flameMeshes.forEach((fm,i)=>{
    fm.scale.y = 0.8+Math.sin(elapsed*9+i*1.7)*0.25;
    fm.position.y = 1.8+i*0.2+Math.sin(elapsed*11+i)*0.06;
    fm.rotation.y += 0.06;
  });
  fireGlow.intensity = 1.2+Math.sin(elapsed*7)*0.5;

  // ── Smoke drift
  const sa = smoke.geometry.attributes.position;
  for(let s=0;s<60;s++){
    sa.array[s*3+1]+=0.025;
    if(sa.array[s*3+1]>22) sa.array[s*3+1]=12;
    sa.array[s*3]+=Math.sin(elapsed+s)*0.003;
  }
  sa.needsUpdate=true;

  // ── Ring pulse
  zones.forEach((z,i)=>{
    if(z.ring){
      z.ring.material.opacity = (activeZone===z?0.6:0.18)+Math.sin(elapsed*2+i)*0.08;
      z.ring.rotation.z += 0.004;
    }
    if(z.zlight) z.zlight.intensity = z.li*(0.85+Math.sin(elapsed*3+i)*0.15);
  });

  // ── Spot light flicker
  spot.intensity = 1.8+Math.sin(elapsed*0.5)*0.3;

  // ── Moon slow rotate
  moonMesh.rotation.y += 0.0008;
  haloMesh.rotation.z += 0.001;

  // ── Stars twinkle
  stars.material.opacity = 0.55+Math.sin(elapsed*0.4)*0.15;

  // ── Zone detection (enter / leave)
  let nearest=null, nearestDist=Infinity;
  zones.forEach(z=>{
    const d = guardGroup.position.distanceTo(z.position);
    if(d<z.r && d<nearestDist){ nearestDist=d; nearest=z; }
  });
  if(nearest!==activeZone){
    if(nearest){ closeZone(activeZone); activeZone=nearest; openZone(nearest); }
    else        { closeZone(activeZone); activeZone=null; }
  }

  // ── Camera follows guard
  camSmooth.lerp(guardGroup.position, 0.05);
  camera.position.set(
    camSmooth.x + orbitRadius*Math.sin(orbitTheta)*Math.cos(orbitPhi),
    camSmooth.y + orbitRadius*Math.sin(orbitPhi),
    camSmooth.z + orbitRadius*Math.cos(orbitTheta)*Math.cos(orbitPhi)
  );
  camera.lookAt(camSmooth.x, camSmooth.y+1.5, camSmooth.z);

  // ── Mini map every 3 frames
  if(frameN%3===0) drawMiniMap();

  renderer.render(scene,camera);
}

// ── INITIAL GREETING ─────────────────────────────────────────────────────────
setTimeout(()=>showGuardSpeech('Arrow keys to move!'), 1200);

animate();

} catch(err) {
  // If Three.js crashes for any reason, still dismiss loading
  console.error('Scene error:', err);
  startWorld();
}