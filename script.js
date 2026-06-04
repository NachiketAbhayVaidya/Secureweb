/* =====================================================
   ABHEDYA SECURITY SOLUTIONS — TACTICAL CORE V4.6
   AESTHETIC: Dark But Playful Retro Arcade Game
   FEATURES: Cute Waddling Robot Guard (with Mustache & Cap),
             Vibrant Neon Wireframe Town, Proximity Bug Fix,
             Radar Minimap Sweep, Pastel Candy Theme Transition.
   ===================================================== */

// ── EMAILJS INITIALIZATION ───────────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';
try {
  if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }
} catch (e) {
  console.warn("EmailJS init failed: ", e);
}

// ── SYSTEM LOADING SEQUENCE ──────────────────────────────────────────────────
const FORCE_DISMISS = setTimeout(startWorld, 5500);
const lsBar = document.getElementById('lsBar');
const lsHint = document.getElementById('lsHint');
const HINTS = [
  'BOOTING PLAYFUL SENTINEL OS… 🤖',
  'ATTACHING SECURITY MUSTACHE… 🥸',
  'CHARGING NEON POWER CORE… ⚡',
  'READY TO ROAM! GO GO GO!'
];
let loadPct = 0;
const loadTick = setInterval(() => {
  loadPct += Math.random() * 20 + 8;
  if (loadPct >= 100) {
    loadPct = 100;
    clearInterval(loadTick);
    startWorld();
  }
  if (lsBar) lsBar.style.width = loadPct + '%';
  if (lsHint) lsHint.textContent = HINTS[Math.min(3, Math.floor(loadPct / 26))];
}, 110);

function startWorld() {
  clearTimeout(FORCE_DISMISS);
  clearInterval(loadTick);
  const ls = document.getElementById('loadingScreen');
  if (!ls || ls.style.display === 'none') return;
  ls.classList.add('fade-out');
  setTimeout(() => { ls.style.display = 'none'; }, 900);
}

// ── MOBILE DETECTION ──────────────────────────────────────────────────────────
const isMobile = () => window.innerWidth <= 900 || ('ontouchstart' in window);

try {
  // ── THREE.JS ENGINE SETUP ───────────────────────────────────────────────────
  const canvas = document.getElementById('threeCanvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x0e0722);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0e0722, 35, 115);

  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 18, 30);
  camera.lookAt(0, 0, 0);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ── LIGHTS ──────────────────────────────────────────────────────────────────
  const ambient = new THREE.AmbientLight(0x221544, 0.85); // Warm purple ambient
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xfff0fa, 1.2);
  sun.position.set(20, 45, 15);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -40;
  sun.shadow.camera.right = 40;
  sun.shadow.camera.top = 40;
  sun.shadow.camera.bottom = -40;
  sun.shadow.camera.far = 110;
  scene.add(sun);

  // Soft glowing pointlight to lit up the center play area
  const mainCenterGlow = new THREE.PointLight(0xff2e93, 1.2, 45);
  mainCenterGlow.position.set(0, 15, 0);
  scene.add(mainCenterGlow);

  // ── MATERIAL THEME RECOLOUR REGISTRY ───────────────────────────────────────
  const themeMats = {
    ground: null,
    grid: null,
    buildings: [],
    wires: [],
    glows: [],
    starPoints: null,
    sunMesh: null
  };

  const treeTopMats = [];

  function regBuilding(mat, darkCol, lightCol) {
    themeMats.buildings.push({ mat, darkCol, lightCol });
  }
  function regWire(mat, darkCol, lightCol) {
    themeMats.wires.push({ mat, darkCol, lightCol });
  }
  function regGlow(light, darkInt, lightInt, darkCol, lightCol) {
    themeMats.glows.push({ light, darkInt, lightInt, darkCol, lightCol });
  }

  // ── PLAYFUL NEON CYBER BUILD HELPERS ────────────────────────────────────────
  function createPlayfulBuilding(w, h, d, x, y, z, baseColor, wireColor, tag) {
    const geom = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshPhongMaterial({
      color: baseColor,
      transparent: true,
      opacity: 0.82,
      shininess: 65,
      specular: 0xff2e93
    });
    const m = new THREE.Mesh(geom, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    scene.add(m);

    // Vibrant Neon Edge Wireframe
    const edges = new THREE.EdgesGeometry(geom);
    const edgeMat = new THREE.LineBasicMaterial({
      color: wireColor,
      transparent: true,
      opacity: 0.75
    });
    const lines = new THREE.LineSegments(edges, edgeMat);
    m.add(lines);

    const lightColorMap = {
      0x1c0f3a: 0xe3daf5, // HQ Base
      0x27164f: 0xd8c8f0, // HQ Cap
      0x130b26: 0xc8bde0, // HQ Annex
      0x161c47: 0xd8dfeb, // Corporate
      0x202b66: 0xc8cfeb, // Corporate Top
      0x1a1230: 0xd5cfe0, // Gate Booth
      0x12243d: 0xd2dfeb, // Residential Base
      0x1c102c: 0xecdcf0, // Industrial
    };
    const targetL = lightColorMap[baseColor] || 0xffffff;

    regBuilding(mat, baseColor, targetL);
    regWire(edgeMat, wireColor, 0x007bb0); // Swaps to cobalt blue in light mode

    return m;
  }

  function createPlayfulCyl(rt, rb, h, s, baseColor, wireColor, x, y, z) {
    const geom = new THREE.CylinderGeometry(rt, rb, h, s);
    const mat = new THREE.MeshPhongMaterial({
      color: baseColor,
      transparent: true,
      opacity: 0.85,
      shininess: 50
    });
    const m = new THREE.Mesh(geom, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    scene.add(m);

    const edges = new THREE.EdgesGeometry(geom);
    const edgeMat = new THREE.LineBasicMaterial({
      color: wireColor,
      transparent: true,
      opacity: 0.7
    });
    const lines = new THREE.LineSegments(edges, edgeMat);
    m.add(lines);

    const lightColorMap = {
      0x1e153d: 0xdbd5eb, // Tower base
      0x150e2b: 0xcbc4de, // Tower cap
      0x2c2c2c: 0x9c9c9c, // Fire pot
      0x1c1e30: 0xadb0c8, // Chimney
    };
    const targetL = lightColorMap[baseColor] || 0xffffff;

    regBuilding(mat, baseColor, targetL);
    regWire(edgeMat, wireColor, 0x007bb0);

    return m;
  }

  // ── GROUND PLANE & ARCADE INTERSECTION GRIDS ───────────────────────────────
  const groundMat = new THREE.MeshLambertMaterial({ color: 0x110a26 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  themeMats.ground = groundMat;

  // Concentric Neon Circular Radar Rings
  const circularGrids = [];
  for (let r = 12; r <= 72; r += 12) {
    const ringGeom = new THREE.RingGeometry(r - 0.08, r + 0.08, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    scene.add(ring);
    circularGrids.push(ring);
    regWire(ringMat, 0x00f0ff, 0x007bb0);
  }

  // Neon Grid Helper
  const grid = new THREE.GridHelper(150, 30, 0xff2e93, 0x221347);
  grid.position.y = 0.01;
  scene.add(grid);
  if (grid.material.length) {
    regWire(grid.material[0], 0xff2e93, 0x007bb0);
    regWire(grid.material[1], 0x221347, 0xccaaff);
  }

  // ── FLOATING STAR DUST particles ────────────────────────────────────────────
  const starArr = new Float32Array(500 * 3);
  for (let i = 0; i < 500; i++) {
    starArr[i * 3] = (Math.random() - .5) * 250;
    starArr[i * 3 + 1] = Math.random() * 55 + 20;
    starArr[i * 3 + 2] = (Math.random() - .5) * 250;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starArr, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xff2e93, size: 0.5, transparent: true, opacity: 0.85 }));
  scene.add(stars);
  themeMats.starPoints = stars;

  // Floating Cyber Sun (Light Mode only)
  const sunSphere = new THREE.Mesh(new THREE.SphereGeometry(2.5, 16, 16), new THREE.MeshBasicMaterial({ color: 0xff8c00, transparent: true, opacity: 0 }));
  sunSphere.position.set(30, 48, -30);
  scene.add(sunSphere);
  themeMats.sunMesh = sunSphere;

  // ── CREATE PLAYFUL TOY TOWN BUILDINGS ───────────────────────────────────────
  // HQ Complex (Neon Cyan Wireframes)
  createPlayfulBuilding(9, 20, 9, -18, 10, -8, 0x1c0f3a, 0x00f0ff);
  createPlayfulBuilding(5.5, 6, 5.5, -18, 23, -8, 0x27164f, 0x00f0ff);
  createPlayfulBuilding(5.5, 12, 6.5, -26, 6, -8, 0x130b26, 0x00f0ff);
  
  // Neon-lit Windows
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.9), new THREE.MeshBasicMaterial({ color: 0x00f0ff, opacity: 0.85, transparent: true }));
      w.position.set(-14 + c * 2, 4.5 + r * 3.8, -3.4);
      scene.add(w);
      regBuilding(w.material, 0x00f0ff, 0x005bc0);
    }
  }

  // Mustache HQ Holographic Banner
  const signC = document.createElement('canvas');
  signC.width = 512;
  signC.height = 128;
  const sx = signC.getContext('2d');
  sx.fillStyle = 'rgba(255, 46, 147, 0.1)';
  sx.fillRect(0, 0, 512, 128);
  sx.strokeStyle = '#ff2e93';
  sx.lineWidth = 4;
  sx.strokeRect(4, 4, 504, 120);
  sx.fillStyle = '#00f0ff';
  sx.font = 'bold 50px Courier';
  sx.textAlign = 'center';
  sx.fillText('[ ABHEDYA BOT HQ ]', 256, 80);
  
  const signM = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 1.3), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(signC), transparent: true, side: THREE.DoubleSide }));
  signM.position.set(-18, 21.5, -3.4);
  scene.add(signM);

  // Security Gate Booth (Cyan Wireframe)
  createPlayfulBuilding(0.6, 5.5, 0.6, -2.5, 2.75, 12, 0x1a1230, 0x00f0ff);
  createPlayfulBuilding(0.6, 5.5, 0.6, 2.5, 2.75, 12, 0x1a1230, 0x00f0ff);
  createPlayfulBuilding(5.6, 0.3, 0.3, 0, 5.5, 12, 0x1a1230, 0x00f0ff);
  createPlayfulBuilding(2.2, 3.2, 2.2, 5, 1.6, 12, 0x1a1230, 0x00f0ff);
  createPlayfulBuilding(2.4, 0.15, 2.4, 5, 3.25, 12, 0x1a1230, 0x00f0ff);

  // Corporate Plaza (Pink Wireframes)
  createPlayfulBuilding(11, 17, 9, 18, 8.5, -5, 0x161c47, 0xff2e93);
  createPlayfulBuilding(7.5, 4.5, 6.5, 18, 19.25, -5, 0x202b66, 0xff2e93);
  
  for (let f = 0; f < 5; f++) {
    const fac = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.7), new THREE.MeshBasicMaterial({ color: 0xff2e93, opacity: 0.25, transparent: true }));
    fac.position.set(18, 3.0 + f * 3.3, -0.4);
    scene.add(fac);
    regBuilding(fac.material, 0xff2e93, 0xcc0066);
  }

  // Disaster Countermeasures Fire Zone (Red/Orange Wireframes)
  createPlayfulCyl(0.6, 0.7, 1.6, 8, 0x2c2c2c, 0xff5500, -18, 0.8, 16);
  // Holographic cartoon flames
  const flameMeshes = [];
  const flameColors = [0xff2e93, 0xffd200, 0x00f0ff];
  for (let fi = 0; fi < 3; fi++) {
    const fm = new THREE.Mesh(
      new THREE.ConeGeometry(0.35 + fi * 0.12, 1.3 + fi * 0.3, 6),
      new THREE.MeshBasicMaterial({ color: flameColors[fi], transparent: true, opacity: 0.85 })
    );
    fm.position.set(-18 + (fi - 1) * 0.4, 1.9 + fi * 0.2, 16);
    scene.add(fm);
    flameMeshes.push(fm);
  }
  const fireGlow = new THREE.PointLight(0xff5500, 1.8, 14);
  fireGlow.position.set(-18, 3.5, 16);
  scene.add(fireGlow);
  regGlow(fireGlow, 1.8, 0.5, 0xff5500, 0xff3300);

  // Overwatch Observation Tower (Pink Wireframe)
  createPlayfulCyl(0.3, 0.3, 8.5, 8, 0x1e153d, 0xff2e93, 18, 4.25, 16);
  createPlayfulBox(3.2, 0.25, 3.2, 18, 8.6, 16, 0x1e153d);
  createPlayfulBox(2.6, 2.2, 2.6, 18, 9.7, 16, 0x150e2b);

  function createPlayfulBox(w, h, d, x, y, z, color) {
    return createPlayfulBuilding(w, h, d, x, y, z, color, 0xff2e93);
  }

  // SpotLight Search beam (yellow cone)
  const spot = new THREE.SpotLight(0xffea00, 2.5, 35, Math.PI / 8, 0.5, 0.6);
  spot.position.set(18, 10, 16);
  spot.target.position.set(15, 0, 8);
  scene.add(spot);
  scene.add(spot.target);
  regGlow(spot, 2.5, 0.2, 0xffea00, 0xffbb00);

  // Residential Neighborhood (Yellow/Orange Wireframes)
  const resCoords = [[28, -12], [34, -7], [39, -13], [30, -19]];
  resCoords.forEach(([hx, hz]) => {
    createPlayfulBuilding(3.6, 3.2, 3.6, hx, 1.6, hz, 0x12243d, 0xffea00);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.9, 1.6, 4), new THREE.MeshLambertMaterial({ color: 0x1a2e4c }));
    roof.position.set(hx, 4.0, hz);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    scene.add(roof);
    regBuilding(roof.material, 0x1a2e4c, 0xff7b25);
  });

  // Heavy Industrial Sector (Orange Wireframes)
  createPlayfulBuilding(13, 8.5, 10.5, -28, 4.25, -20, 0x1c102c, 0xff8c00);
  createPlayfulCyl(0.4, 0.5, 6.5, 8, 0x1c1e30, 0xff8c00, -25, 7.5, -18);
  createPlayfulCyl(0.4, 0.5, 8.5, 8, 0x1c1e30, 0xff8c00, -21.5, 8.5, -21.5);
  
  // Pink Cyber Smoke
  const smokeArr = new Float32Array(50 * 3);
  for (let s = 0; s < 50; s++) {
    smokeArr[s * 3] = -24 + Math.random() * 4;
    smokeArr[s * 3 + 1] = 12 + Math.random() * 9;
    smokeArr[s * 3 + 2] = -20 + Math.random() * 4;
  }
  const smokeGeo = new THREE.BufferGeometry();
  smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokeArr, 3));
  const smoke = new THREE.Points(smokeGeo, new THREE.PointsMaterial({ color: 0xff2e93, size: 0.7, transparent: true, opacity: 0.55 }));
  scene.add(smoke);

  // Playful Lego Trees
  const treeCoords = [
    [-6, -6], [6, -6], [-9, 6], [9, 6], [-3, 22], [3, 22],
    [10, -22], [-10, -22], [26, 6], [-26, 6]
  ];
  treeCoords.forEach(([tx, tz]) => {
    createPlayfulCyl(0.12, 0.18, 2.2, 6, 0x1e123a, 0x00f0ff, tx, 1.1, tz);
    
    // Colorful foliage spheres
    const topGeom = new THREE.DodecahedronGeometry(0.95, 0);
    const topMat = new THREE.MeshPhongMaterial({
      color: 0x0d3c26,
      transparent: true,
      opacity: 0.78,
      shininess: 30
    });
    const top = new THREE.Mesh(topGeom, topMat);
    top.position.set(tx, 2.8, tz);
    top.castShadow = true;
    scene.add(top);
    treeTopMats.push(topMat);
    
    const edges = new THREE.EdgesGeometry(topGeom);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0xff2e93, transparent: true, opacity: 0.55 });
    const lines = new THREE.LineSegments(edges, edgeMat);
    top.add(lines);

    regBuilding(topMat, 0x0d3c26, 0x3ac58a);
    regWire(edgeMat, 0xff2e93, 0x007bb0);
  });

  // ── THEME TRANSITION CONTROLLER ──
  let isLight = false;

  function applyTheme(lightMode) {
    isLight = lightMode;

    const skyCol = lightMode ? 0xe4def4 : 0x0e0722; // Pastel lavender vs Dark Indigo
    renderer.setClearColor(skyCol);
    scene.fog.color.setHex(skyCol);

    ambient.color.setHex(lightMode ? 0xffffff : 0x221544);
    ambient.intensity = lightMode ? 1.6 : 0.85;
    sun.color.setHex(lightMode ? 0xffffff : 0xfff0fa);
    sun.intensity = lightMode ? 2.0 : 1.2;

    stars.visible = !lightMode;
    themeMats.sunMesh.material.opacity = lightMode ? 0.9 : 0.0;
    
    ground.material.color.setHex(lightMode ? 0xccbfe8 : 0x110a26);

    themeMats.buildings.forEach(item => {
      item.mat.color.setHex(lightMode ? item.lightCol : item.darkCol);
    });

    themeMats.wires.forEach(item => {
      item.mat.color.setHex(lightMode ? item.lightCol : item.darkCol);
    });

    themeMats.glows.forEach(item => {
      item.light.intensity = lightMode ? item.lightInt : item.darkInt;
      if (item.light.color) {
        item.light.color.setHex(lightMode ? item.lightCol : item.darkCol);
      }
    });

    drawMiniMap();
  }

  document.getElementById('themeToggle').addEventListener('click', () => {
    applyTheme(!isLight);
    document.getElementById('themeToggle').textContent = isLight ? '🌙' : '☀️';
    document.body.classList.toggle('light', isLight);
  });

  // ── CUTE SECURITY GUARD ROBOT (WITH MUSTACHE & CAP) ────────────────────────
  const guardGroup = new THREE.Group();
  scene.add(guardGroup);

  function makePart(w, h, d, col, x, y, z, parent) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshPhongMaterial({
      color: col,
      shininess: 60,
      specular: 0x00f0ff
    }));
    m.position.set(x, y, z);
    m.castShadow = true;
    (parent || guardGroup).add(m);
    return m;
  }

  // WADDLE SUB-GROUPS for animation waddling
  const bodyGroup = new THREE.Group();
  bodyGroup.position.set(0, 1.0, 0); // elevated base
  guardGroup.add(bodyGroup);

  // Torso (cute boxy blue security coat)
  const bodyMesh = makePart(0.8, 0.9, 0.5, 0x162c6b, 0, 0.35, 0, bodyGroup);
  // Gold badge on chest
  const badge = makePart(0.18, 0.18, 0.05, 0xffd200, 0, 0.45, 0.26, bodyGroup);
  // Gold belt buckle
  const belt = makePart(0.82, 0.1, 0.52, 0x111111, 0, 0.05, 0, bodyGroup);
  const buckle = makePart(0.2, 0.14, 0.54, 0xffd200, 0, 0.05, 0.01, bodyGroup);

  // Dome Robot Head
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.85, 0);
  bodyGroup.add(headGroup);

  // Neck
  makePart(0.2, 0.12, 0.2, 0x777777, 0, -0.02, 0, headGroup);
  // Round Head box/cylinder
  const headMesh = makePart(0.68, 0.55, 0.55, 0xd0ccd6, 0, 0.28, 0, headGroup);

  // EYES: Big glowing yellow robot eyes (very playful!)
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffd200 }));
  eyeL.position.set(-0.16, 0.32, 0.27);
  headGroup.add(eyeL);

  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffd200 }));
  eyeR.position.set(0.16, 0.32, 0.27);
  headGroup.add(eyeR);

  // MUSTACHE (Hilarious playful element)
  const mustache = makePart(0.32, 0.08, 0.06, 0x472d17, 0, 0.18, 0.28, headGroup);

  // Security Captain Hat (Police Cap)
  const capBase = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.08, 16), new THREE.MeshPhongMaterial({ color: 0x162c6b }));
  capBase.position.set(0, 0.58, 0.02);
  capBase.rotation.x = 0.05; // Tilted slightly forward
  headGroup.add(capBase);

  const capBrim = makePart(0.48, 0.03, 0.15, 0x111111, 0, 0.55, 0.16, headGroup);
  capBrim.rotation.x = 0.15; // angled brim

  const capGoldBadge = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffd200 }));
  capGoldBadge.position.set(0, 0.62, 0.19);
  headGroup.add(capGoldBadge);

  // SWINGABLE LEGS
  const legLGroup = new THREE.Group();
  legLGroup.position.set(-0.24, 0.5, 0); // pivot at hip joint
  guardGroup.add(legLGroup);
  const legLJoint = makePart(0.24, 0.5, 0.24, 0xd0ccd6, 0, -0.25, 0, legLGroup);
  const bootL = makePart(0.3, 0.18, 0.42, 0x111111, 0, -0.5, 0.06, legLGroup);

  const legRGroup = new THREE.Group();
  legRGroup.position.set(0.24, 0.5, 0);
  guardGroup.add(legRGroup);
  const legRJoint = makePart(0.24, 0.5, 0.24, 0xd0ccd6, 0, -0.25, 0, legRGroup);
  const bootR = makePart(0.3, 0.18, 0.42, 0x111111, 0, -0.5, 0.06, legRGroup);

  // SWINGABLE ARMS
  const armLGroup = new THREE.Group();
  armLGroup.position.set(-0.52, 0.8, 0); // pivot at shoulder
  bodyGroup.add(armLGroup);
  const armLJoint = makePart(0.2, 0.6, 0.2, 0x162c6b, 0, -0.3, 0, armLGroup);
  
  // Left arm holding Walkie-talkie
  const handL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshPhongMaterial({ color: 0xd0ccd6 }));
  handL.position.set(0, -0.62, 0);
  armLGroup.add(handL);
  
  const walkieG = new THREE.Group();
  walkieG.position.set(0, -0.7, 0.05);
  armLGroup.add(walkieG);
  const wBody = makePart(0.08, 0.18, 0.08, 0x222222, 0, 0, 0, walkieG);
  const wAntenna = makePart(0.015, 0.12, 0.015, 0x666666, 0.02, 0.12, 0, walkieG);

  const armRGroup = new THREE.Group();
  armRGroup.position.set(0.52, 0.8, 0);
  bodyGroup.add(armRGroup);
  const armRJoint = makePart(0.2, 0.6, 0.2, 0x162c6b, 0, -0.3, 0, armRGroup);
  
  // Right arm holding Flashlight (Flashlight projects a yellow cone)
  const handR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshPhongMaterial({ color: 0xd0ccd6 }));
  handR.position.set(0, -0.62, 0);
  armRGroup.add(handR);

  const torchG = new THREE.Group();
  torchG.position.set(0, -0.68, 0.08);
  torchG.rotation.x = Math.PI / 2; // point forward
  armRGroup.add(torchG);
  const torchBody = makePart(0.08, 0.22, 0.08, 0x555555, 0, 0, 0, torchG);
  const torchGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.05, 8), new THREE.MeshPhongMaterial({ color: 0xffea00 }));
  torchGlass.position.set(0, 0.11, 0);
  torchGlass.rotation.x = Math.PI / 2;
  torchG.add(torchGlass);

  // Active yellow guard flashlight beam
  const guardFlashLight = new THREE.PointLight(0xffea00, 1.8, 15);
  guardFlashLight.position.set(0, 1.1, 1.5);
  guardGroup.add(guardFlashLight);

  // SpotLight target for torch cone
  const torchTarget = new THREE.Object3D();
  scene.add(torchTarget);
  
  const torchSpot = new THREE.SpotLight(0xffea00, 2.8, 22, Math.PI / 7, 0.5, 0.6);
  torchSpot.castShadow = true;
  guardGroup.add(torchSpot);
  torchSpot.target = torchTarget;

  // ── PATROL SITES CHECKPOINTS CONTROLS ───────────────────────────────────────
  const zones = [
    { id: 'gate',        label: '🚪 Gate Security Sector',     pos: [-2, 0, 12],  r: 6, icon: '🚪', tag: 'ACCESS POINT STATUS',      title: 'Active <em>Visitor Verification</em>',       text: 'Our sentinel system monitors entry points continuously. Physical logging, license scanner arrays, and credentials checks ensure zero breach allowance.', list: ['✓ Triple-factor biometric gates', '✓ Live telemetry plate recognition', '✓ Direct terminal operator integration'], night: false, lc: 0x00f0ff, li: 1.0 },
    { id: 'hq',          label: '🏛 Abhedya Tactical HQ',         pos: [-18, 0, -5], r: 7, icon: '🛡️', tag: 'TACTICAL CELL COMMAND',     title: 'Quantum Shielding <em>H.Q.</em>',            text: 'Abhedya translates to <strong>Impenetrable</strong>. Guided by military standards and supervised by combat-hardened officers, HQ coordinates decentralized defenses.', list: ['✓ Encrypted communications grid', '✓ Military operational veteran advisors', '✓ 24/7 response team'], night: false, lc: 0xff2e93, li: 1.4 },
    { id: 'corporate',   label: '🏢 Corporate IT Campus',      pos: [18, 0, -5],  r: 7, icon: '🏢', tag: 'CORPORATE SECTOR',          title: 'Facility Patrolling <em>Matrix</em>',        text: 'Seamless professional integration with modern offices. Deploying key-card management, CCTV control centers, and disciplined indoor sentinels.', list: ['✓ Multi-level access clearances', '✓ Zero-compromise executive support', '✓ Incident reporting database'], night: false, lc: 0xff2e93, li: 1.0 },
    { id: 'fire',        label: '🔥 Threat Assessment Zone',  pos: [-18, 0, 16], r: 6, icon: '🔥', tag: 'DISASTER COUNTERMEASURES',   title: 'Fire Safety & <em>Tactics</em>',             text: 'All operational staff undergo emergency drills. Fire safety certification, hazard containment, and immediate medical emergency routing systems.', list: ['✓ Complete fire containment certified', '✓ Life support and trauma first response', '✓ Disaster evacuation coordinates'], night: true,  lc: 0xff8c00, li: 1.5 },
    { id: 'nightwatch',  label: '🌙 Cyber Observation Tower',  pos: [18, 0, 16],  r: 6, icon: '🌙', tag: 'OVERWATCH SYSTEM',          title: 'Perimeter Night <em>Surveillance</em>', text: 'Scanning through darkness. Utilizing night-vision cameras, localized LiDAR radar sweeps, and thermal sensory arrays to negate stealth intrusions.', list: ['✓ Thermal scanner sweeps', '✓ Real-time telemetry linkage', '✓ Scheduled high-vigilance intervals'], night: true,  lc: 0x00f0ff, li: 1.2 },
    { id: 'residential', label: '🏠 Residential Safe-Zone',     pos: [32, 0, -13], r: 7, icon: '🏠', tag: 'DOMESTIC ENVELOPE',         title: 'Securing Domestic <em>Perimeters</em>',     text: 'Protecting civilian residential clusters and housing estates. Meticulous visitor registration, community patrolling, and rapid-dispatch distress response.', list: ['✓ Local safety checks on schedule', '✓ Smart visitor credentials dispatch', '✓ Immediate emergency intercom hubs'], night: false, lc: 0xffd200, li: 1.1 },
    { id: 'industrial',  label: '🏭 Industrial Plant Zone',    pos: [-28, 0, -20],r: 8, icon: '🏭', tag: 'HEAVY SECTOR COMMAND',      title: 'Heavy Industry <em>Overwatch</em>',        text: 'High-hazard facility security. Protecting pipelines, machinery assets, and warehouses. Enforcing strict safety protocols, shift tracking, and access logs.', list: ['✓ Asset risk mitigation audits', '✓ Toxic hazard warning detection', '✓ Multi-shift security logistics'], night: false, lc: 0xff8c00, li: 1.1 }
  ];

  let activeZone = null;
  let manuallyClosedZone = null;

  zones.forEach((z, i) => {
    z.position = new THREE.Vector3(...z.pos);
    
    // Rotating holographic scan ring
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(z.r - 0.2, z.r, 32),
      new THREE.MeshBasicMaterial({ color: z.lc, transparent: true, opacity: 0.28, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(z.pos[0], 0.05, z.pos[2]);
    scene.add(ring);
    z.ring = ring;

    // Glowing lights
    const zl = new THREE.PointLight(z.lc, z.li, 15);
    zl.position.set(z.pos[0], 5, z.pos[2]);
    scene.add(zl);
    z.zlight = zl;

    // Playful billboard tags
    const canvasH = document.createElement('canvas');
    canvasH.width = 288;
    canvasH.height = 72;
    const ctxH = canvasH.getContext('2d');
    ctxH.fillStyle = 'rgba(20, 10, 48, 0.9)';
    ctxH.beginPath();
    ctxH.roundRect(0, 0, 288, 72, 12);
    ctxH.fill();
    ctxH.strokeStyle = '#ff2e93';
    ctxH.lineWidth = 2;
    ctxH.strokeRect(2, 2, 284, 68);
    ctxH.fillStyle = '#ffcc00';
    ctxH.font = 'bold 20px "Share Tech Mono"';
    ctxH.textAlign = 'center';
    ctxH.fillText(z.label, 144, 44);

    const sp = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 0.9),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvasH), transparent: true, depthWrite: false })
    );
    sp.position.set(z.pos[0], 4.8, z.pos[2]);
    sp.scale.set(0, 0, 0);
    scene.add(sp);
    z.sprite = sp;
  });

  const zoneLabel = document.getElementById('zoneLabel');
  const infoPanel = document.getElementById('infoPanel');

  function openZone(z) {
    document.getElementById('ipIcon').textContent = z.icon;
    document.getElementById('ipTag').textContent = `⚡ [ ${z.tag} ]`;
    document.getElementById('ipTitle').innerHTML = z.title;
    document.getElementById('ipText').innerHTML = z.text;
    document.getElementById('ipList').innerHTML = (z.list || []).map(l => `<li>${l}</li>`).join('');
    
    infoPanel.classList.remove('hidden');
    requestAnimationFrame(() => infoPanel.classList.add('visible'));
    
    zoneLabel.textContent = z.label;
    zoneLabel.classList.add('visible');

    torchSpot.color.setHex(z.lc);
    torchSpot.intensity = 3.5;
    
    if (z.ring) z.ring.material.opacity = 0.8;
    if (z.sprite) z.sprite.scale.set(1.0, 1.0, 1.0);
    
    showSpeech(getSpeech(z.id));
  }

  function closeZone(prev) {
    infoPanel.classList.remove('visible');
    zoneLabel.classList.remove('visible');
    setTimeout(() => {
      if (!infoPanel.classList.contains('visible')) {
        infoPanel.classList.add('hidden');
      }
    }, 450);

    torchSpot.color.setHex(0xffea00);
    torchSpot.intensity = 2.8;

    if (prev) {
      if (prev.ring) prev.ring.material.opacity = 0.28;
      if (prev.sprite) prev.sprite.scale.set(0, 0, 0);
    }
  }

  // Cross Button Handler
  document.getElementById('ipClose').addEventListener('click', () => {
    if (activeZone) {
      manuallyClosedZone = activeZone; // block retrigger
      closeZone(activeZone);
      activeZone = null;
    }
  });

  // ── SPEECH CHAT BUBBLER ─────────────────────────────────────────────────────
  let speechMesh = null, speechTm = null;
  function showSpeech(text) {
    if (speechMesh) {
      guardGroup.remove(speechMesh);
      speechMesh = null;
    }
    clearTimeout(speechTm);
    
    const sc = document.createElement('canvas');
    sc.width = 300;
    sc.height = 70;
    const cx = sc.getContext('2d');
    cx.fillStyle = 'rgba(20, 10, 48, 0.95)';
    cx.beginPath();
    cx.roundRect(0, 0, 300, 70, 12);
    cx.fill();
    cx.strokeStyle = '#ff2e93';
    cx.lineWidth = 2;
    cx.strokeRect(2, 2, 296, 66);
    cx.fillStyle = '#00f0ff';
    cx.font = 'bold 16px "Share Tech Mono"';
    cx.textAlign = 'center';
    cx.fillText(text, 150, 42);

    speechMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5, 0.58),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false })
    );
    speechMesh.position.set(0, 2.3, 0);
    guardGroup.add(speechMesh);
    
    speechTm = setTimeout(() => {
      if (speechMesh) {
        guardGroup.remove(speechMesh);
        speechMesh = null;
      }
    }, 3500);
  }

  // Playful, cheerful bot messages!
  function getSpeech(id) {
    return {
      gate: 'Beep boop! Access granted! 🔑',
      hq: 'Welcome to Abhedya! Safe & sound! 🛡️',
      corporate: 'Patrolling the office. No paperclips stolen! 🏢',
      fire: 'Training mode! Fire is hot! 🧯',
      nightwatch: 'Scanning for night ghosts... 👻',
      residential: 'Cozy neighborhood secured! 🏡',
      industrial: 'Watching the factories. Beep! 🏭'
    }[id] || 'All clear! Happy patrolling! 😄';
  }

  // ── ARCADE RADAR MINIMAP ────────────────────────────────────────────────────
  const mmC = document.getElementById('miniMapCanvas');
  const mmCtx = mmC ? mmC.getContext('2d') : null;
  const MMS = 130 / 150;
  let radarAngle = 0;

  function worldToMM(x, z) {
    return [(x + 75) * MMS, (z + 75) * MMS];
  }

  function drawMiniMap() {
    if (!mmCtx) return;
    
    mmCtx.fillStyle = isLight ? 'rgba(252, 250, 255, 0.95)' : 'rgba(14, 7, 34, 0.95)';
    mmCtx.fillRect(0, 0, 130, 130);
    
    // Draw rings
    mmCtx.strokeStyle = isLight ? 'rgba(0, 123, 176, 0.15)' : 'rgba(255, 46, 147, 0.15)';
    mmCtx.lineWidth = 1;
    for (let r = 20; r <= 60; r += 20) {
      mmCtx.beginPath();
      mmCtx.arc(65, 65, r, 0, Math.PI * 2);
      mmCtx.stroke();
    }

    // Crosshairs
    mmCtx.beginPath();
    mmCtx.moveTo(65, 10); mmCtx.lineTo(65, 120);
    mmCtx.moveTo(10, 65); mmCtx.lineTo(120, 65);
    mmCtx.stroke();

    // Radar Sweeper Wedge
    radarAngle += 0.045;
    mmCtx.save();
    mmCtx.translate(65, 65);
    mmCtx.rotate(radarAngle);
    const gradSweep = mmCtx.createLinearGradient(0, 0, 80, 0);
    gradSweep.addColorStop(0, 'rgba(255, 46, 147, 0)');
    gradSweep.addColorStop(1, isLight ? 'rgba(0, 123, 176, 0.25)' : 'rgba(255, 46, 147, 0.35)');
    mmCtx.fillStyle = gradSweep;
    mmCtx.beginPath();
    mmCtx.moveTo(0, 0);
    mmCtx.arc(0, 0, 75, -0.25, 0);
    mmCtx.closePath();
    mmCtx.fill();
    mmCtx.restore();

    // Draw active zone centers
    zones.forEach(z => {
      const [mx, mz] = worldToMM(z.pos[0], z.pos[2]);
      mmCtx.beginPath();
      mmCtx.arc(mx, mz, z.r * MMS, 0, Math.PI * 2);
      mmCtx.strokeStyle = isLight ? 'rgba(0, 123, 176, 0.3)' : 'rgba(0, 240, 255, 0.3)';
      mmCtx.lineWidth = 1;
      mmCtx.stroke();
      mmCtx.fillStyle = activeZone === z ? 'rgba(255, 46, 147, 0.15)' : 'rgba(0, 240, 255, 0.05)';
      mmCtx.fill();
    });

    // Draw Robot Guard Marker
    const [gx, gz] = worldToMM(guardGroup.position.x, guardGroup.position.z);
    
    // Aura
    const auraGrad = mmCtx.createRadialGradient(gx, gz, 0, gx, gz, 8);
    auraGrad.addColorStop(0, 'rgba(255, 46, 147, 0.8)');
    auraGrad.addColorStop(1, 'rgba(255, 46, 147, 0)');
    mmCtx.beginPath();
    mmCtx.arc(gx, gz, 8, 0, Math.PI * 2);
    mmCtx.fillStyle = auraGrad;
    mmCtx.fill();

    // Dot
    mmCtx.beginPath();
    mmCtx.arc(gx, gz, 4, 0, Math.PI * 2);
    mmCtx.fillStyle = isLight ? '#e01b6d' : '#00f0ff';
    mmCtx.fill();

    // Face direction indicator
    mmCtx.save();
    mmCtx.translate(gx, gz);
    mmCtx.rotate(guardGroup.rotation.y + Math.PI);
    mmCtx.beginPath();
    mmCtx.moveTo(0, -6);
    mmCtx.lineTo(-3, 2);
    mmCtx.lineTo(3, 2);
    mmCtx.closePath();
    mmCtx.fillStyle = '#ffd200';
    mmCtx.fill();
    mmCtx.restore();
  }

  // ── MENU OVERLAYS CONTROLLER ───────────────────────────────────────────────
  let openPanelId = null;

  function openPanel(id) {
    if (openPanelId && openPanelId !== id) {
      const prev = document.getElementById(openPanelId);
      if (prev) prev.classList.remove('open');
    }
    openPanelId = id;
    const p = document.getElementById(id);
    if (!p) return;
    requestAnimationFrame(() => requestAnimationFrame(() => p.classList.add('open')));
  }

  function closePanel(id) {
    const p = document.getElementById(id);
    if (!p) return;
    p.classList.remove('open');
    if (openPanelId === id) openPanelId = null;
    document.querySelectorAll('.bn-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.section === 'world');
    });
  }

  window.closePanel = closePanel;
  document.getElementById('closeServices').addEventListener('click', () => closePanel('servicesPanel'));
  document.getElementById('closeTeam').addEventListener('click', () => closePanel('teamPanel'));
  document.getElementById('closeContact').addEventListener('click', () => closePanel('contactPanel'));

  document.querySelectorAll('.bn-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.bn-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const sec = btn.dataset.section;
      if (sec === 'world') {
        if (openPanelId) {
          document.getElementById(openPanelId).classList.remove('open');
          openPanelId = null;
        }
        return;
      }
      openPanel(sec + 'Panel');
    });
  });

  // ── AUDIT FORM HANDLER ──────────────────────────────────────────────────────
  document.getElementById('contactForm').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('sendBtn');
    const status = document.getElementById('formStatus');
    const name = document.getElementById('cf_name').value.trim();
    const phone = document.getElementById('cf_phone').value.trim();
    const email = document.getElementById('cf_email').value.trim();
    const service = document.getElementById('cf_service').value;
    const message = document.getElementById('cf_message').value.trim();

    if (!name || !phone || !message) {
      status.textContent = '⚠ Beep! Fill out Name, Phone & Message please!';
      status.className = 'form-status error';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'TRANSMITTING MESSAGE TELEMETRY…';
    status.textContent = '';
    status.className = 'form-status';

    const params = {
      from_name: name,
      phone_number: phone,
      email_address: email || 'Playful anonymous user',
      service_required: service || 'General Audit',
      message,
      to_name: 'Abhedya Team'
    };

    try {
      if (typeof emailjs !== 'undefined' && EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID') {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
        status.textContent = '✓ Message sent! We will waddle back with an answer in 24 hours.';
        status.className = 'form-status success';
        e.target.reset();
      } else {
        const payload = `Hello Abhedya Security!\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email || 'N/A'}\nService: ${service || 'N/A'}\nMessage: ${message}`;
        window.open(`https://wa.me/917666793286?text=${encodeURIComponent(payload)}`, '_blank');
        status.textContent = '✓ Beep! Redirected to WhatsApp Chat operator!';
        status.className = 'form-status success';
        e.target.reset();
      }
    } catch (err) {
      status.textContent = '✗ Beep boop! Send failed. Call us instead: +91 76667 93286';
      status.className = 'form-status error';
    } finally {
      btn.disabled = false;
      btn.textContent = 'INITIALIZE DEPLOYMENT REQUEST →';
    }
  });

  // ── CAMERA ORBIT SYSTEM CONTROLLERS ──────────────────────────────────────────
  let orbitTheta = 0, orbitPhi = 0.58, orbitRadius = 26;
  let isDrag = false, lastMX = 0, lastMY = 0;
  const camSmooth = new THREE.Vector3(0, 0, 0);

  let pinchStart = null;

  canvas.addEventListener('mousedown', e => {
    isDrag = true;
    lastMX = e.clientX;
    lastMY = e.clientY;
  });
  window.addEventListener('mouseup', () => { isDrag = false; });
  window.addEventListener('mousemove', e => {
    if (!isDrag) return;
    orbitTheta -= (e.clientX - lastMX) * 0.005;
    orbitPhi = Math.max(0.12, Math.min(1.4, orbitPhi - (e.clientY - lastMY) * 0.005));
    lastMX = e.clientX;
    lastMY = e.clientY;
  });
  canvas.addEventListener('wheel', e => {
    orbitRadius = Math.max(10, Math.min(60, orbitRadius + e.deltaY * 0.035));
  }, { passive: true });

  // ── MOBILE TOUCH ZOOM + PAN CONTROLS ────────────────────────────────────────
  function distBetweenTouches(t) {
    return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  }

  canvas.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      isDrag = true;
      lastMX = e.touches[0].clientX;
      lastMY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      pinchStart = distBetweenTouches(e.touches);
      isDrag = false;
    }
  }, { passive: true });

  canvas.addEventListener('touchmove', e => {
    if (e.touches.length === 1 && isDrag) {
      orbitTheta -= (e.touches[0].clientX - lastMX) * 0.006;
      orbitPhi = Math.max(0.12, Math.min(1.4, orbitPhi - (e.touches[0].clientY - lastMY) * 0.006));
      lastMX = e.touches[0].clientX;
      lastMY = e.touches[0].clientY;
    } else if (e.touches.length === 2 && pinchStart !== null) {
      e.preventDefault();
      const d = distBetweenTouches(e.touches);
      orbitRadius = Math.max(10, Math.min(60, orbitRadius - (d - pinchStart) * 0.04));
      pinchStart = d;
    }
  }, { passive: false });

  canvas.addEventListener('touchend', () => {
    isDrag = false;
    pinchStart = null;
  }, { passive: true });

  // ── KEYBOARD CONTROL EVENTS ─────────────────────────────────────────────────
  const keys = {};
  window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', e => { keys[e.code] = false; });

  // ── TACTICAL MOBILE JOYSTICK CONTROLLER ──────────────────────────────────────
  const joyBase = document.getElementById('joystickBase');
  const joyKnob = document.getElementById('joystickKnob');
  const JOY_RADIUS = 33;
  let joyActive = false;
  let joyVec = { x: 0, y: 0 };
  let joyId = null;

  function joyStart(cx, cy) {
    joyActive = true;
    joyMove(cx, cy);
  }
  function joyMove(cx, cy) {
    const rect = joyBase.getBoundingClientRect();
    const ox = cx - (rect.left + rect.width / 2);
    const oy = cy - (rect.top + rect.height / 2);
    const mag = Math.min(JOY_RADIUS, Math.hypot(ox, oy));
    const angle = Math.atan2(oy, ox);
    const nx = Math.cos(angle) * mag;
    const ny = Math.sin(angle) * mag;
    joyKnob.style.transform = `translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`;
    joyVec = { x: nx / JOY_RADIUS, y: ny / JOY_RADIUS };
  }
  function joyEnd() {
    joyActive = false;
    joyVec = { x: 0, y: 0 };
    joyKnob.style.transform = 'translate(-50%, -50%)';
  }

  joyBase.addEventListener('touchstart', e => {
    e.stopPropagation();
    e.preventDefault();
    joyId = e.changedTouches[0].identifier;
    joyStart(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
  }, { passive: false });
  joyBase.addEventListener('touchmove', e => {
    e.stopPropagation();
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.identifier === joyId) { joyMove(t.clientX, t.clientY); break; }
    }
  }, { passive: false });
  joyBase.addEventListener('touchend', e => {
    e.stopPropagation();
    for (const t of e.changedTouches) {
      if (t.identifier === joyId) { joyEnd(); break; }
    }
  }, { passive: true });

  joyBase.addEventListener('mousedown', e => { e.stopPropagation(); joyStart(e.clientX, e.clientY); });
  window.addEventListener('mousemove', e => { if (joyActive) joyMove(e.clientX, e.clientY); });
  window.addEventListener('mouseup', () => { if (joyActive) joyEnd(); });

  // ── MAIN CORE GAME LOOP (ANIMATION ENGINE) ──────────────────────────────────
  const clock = new THREE.Clock();
  let tick = 0;
  let walkCycle = 0;

  function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.05);
    const elapsed = clock.getElapsedTime();
    tick++;

    // Translate Inputs (WASD / Arrows / Touch Joysticks)
    let moving = false;
    const inputDir = new THREE.Vector3();

    if (keys['ArrowUp'] || keys['KeyW']) { inputDir.z -= 1; moving = true; }
    if (keys['ArrowDown'] || keys['KeyS']) { inputDir.z += 1; moving = true; }
    if (keys['ArrowLeft'] || keys['KeyA']) { inputDir.x -= 1; moving = true; }
    if (keys['ArrowRight'] || keys['KeyD']) { inputDir.x += 1; moving = true; }

    if (joyActive && (Math.abs(joyVec.x) > 0.08 || Math.abs(joyVec.y) > 0.08)) {
      inputDir.x += joyVec.x;
      inputDir.z += joyVec.y;
      moving = true;
    }

    if (moving) {
      inputDir.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), orbitTheta);
      const patrolSpeed = 5.8;
      
      // Update coordinates
      guardGroup.position.x = Math.max(-60, Math.min(60, guardGroup.position.x + inputDir.x * patrolSpeed * delta));
      guardGroup.position.z = Math.max(-60, Math.min(60, guardGroup.position.z + inputDir.z * patrolSpeed * delta));
      
      // Face heading smoothly
      const targetRot = Math.atan2(inputDir.x, inputDir.z);
      guardGroup.rotation.y = targetRot;
      
      walkCycle += delta * 9;
      
      // Playful waddling animation
      const sw = Math.sin(walkCycle) * 0.65;
      legLGroup.rotation.x = sw;
      legRGroup.rotation.x = -sw;
      armLGroup.rotation.x = -sw * 0.5;
      armRGroup.rotation.x = sw * 0.5;
      
      // Funny sideways body tilting (adds waddle charm)
      bodyGroup.rotation.z = Math.sin(walkCycle) * 0.12;
      bodyGroup.position.y = 1.0 + Math.abs(Math.sin(walkCycle * 2)) * 0.05;
      
      // Hat bobbing
      capBase.rotation.x = 0.05 + Math.sin(walkCycle * 2) * 0.05;
    } else {
      // Gentle breathing idle state
      const breathe = Math.sin(elapsed * 2.0) * 0.025;
      bodyGroup.position.y = 1.0 + breathe;
      bodyGroup.rotation.z = 0;
      
      legLGroup.rotation.x = THREE.MathUtils.lerp(legLGroup.rotation.x, 0, 0.1);
      legRGroup.rotation.x = THREE.MathUtils.lerp(legRGroup.rotation.x, 0, 0.1);
      armLGroup.rotation.x = THREE.MathUtils.lerp(armLGroup.rotation.x, 0, 0.1);
      armRGroup.rotation.x = THREE.MathUtils.lerp(armRGroup.rotation.x, 0, 0.1);
      
      // Curious idle head tilts
      headGroup.rotation.z = Math.sin(elapsed * 0.8) * 0.04;
      capBase.rotation.x = 0.05 + Math.sin(elapsed * 1.5) * 0.02;
    }

    // Dynamic torch flashlight position target
    torchTarget.position.set(
      guardGroup.position.x + Math.sin(guardGroup.rotation.y) * 6,
      0.5,
      guardGroup.position.z + Math.cos(guardGroup.rotation.y) * 6
    );
    torchSpot.position.set(guardGroup.position.x + Math.sin(guardGroup.rotation.y) * 0.5, 1.2, guardGroup.position.z + Math.cos(guardGroup.rotation.y) * 0.5);

    // Speak bubbles face camera
    if (speechMesh) speechMesh.rotation.y = -guardGroup.rotation.y + orbitTheta;
    zones.forEach(z => {
      if (z.sprite && z.sprite.scale.x > 0) z.sprite.rotation.y = orbitTheta;
    });

    // Hologram circles rotation
    zones.forEach((z, idx) => {
      if (z.ring) {
        z.ring.rotation.z += 0.005;
        z.ring.material.opacity = (activeZone === z ? 0.8 : 0.28) + Math.sin(elapsed * 2 + idx) * 0.06;
      }
      if (z.zlight) {
        z.zlight.intensity = z.li * (0.85 + Math.sin(elapsed * 4 + idx) * 0.15);
      }
    });

    // Flames ( assesses Assessment Zone)
    flameMeshes.forEach((fm, idx) => {
      fm.scale.y = 0.8 + Math.sin(elapsed * 9 + idx * 1.5) * 0.22;
      fm.position.y = 1.9 + idx * 0.2 + Math.sin(elapsed * 11 + idx) * 0.04;
    });

    // Smoke
    const smokePos = smoke.geometry.attributes.position;
    for (let s = 0; s < 50; s++) {
      smokePos.array[s * 3 + 1] += 0.035;
      if (smokePos.array[s * 3 + 1] > 20) {
        smokePos.array[s * 3 + 1] = 12;
      }
      smokePos.array[s * 3] += Math.sin(elapsed * 1.2 + s) * 0.005;
    }
    smokePos.needsUpdate = true;

    // Zone triggers (with manual closing guard check)
    let nearest = null;
    let nd = Infinity;
    zones.forEach(z => {
      const d = guardGroup.position.distanceTo(z.position);
      if (d < z.r && d < nd) {
        nd = d;
        nearest = z;
      }
    });

    if (nearest) {
      if (nearest !== activeZone) {
        if (nearest !== manuallyClosedZone) {
          if (activeZone) closeZone(activeZone);
          activeZone = nearest;
          openZone(nearest);
        }
      }
    } else {
      if (activeZone) {
        closeZone(activeZone);
        activeZone = null;
      }
      manuallyClosedZone = null;
    }

    // Camera follow physics
    camSmooth.lerp(guardGroup.position, 0.06);
    camera.position.set(
      camSmooth.x + orbitRadius * Math.sin(orbitTheta) * Math.cos(orbitPhi),
      camSmooth.y + orbitRadius * Math.sin(orbitPhi),
      camSmooth.z + orbitRadius * Math.cos(orbitTheta) * Math.cos(orbitPhi)
    );
    camera.lookAt(camSmooth.x, camSmooth.y + 1.2, camSmooth.z);

    if (tick % 3 === 0) {
      drawMiniMap();
    }
    renderer.render(scene, camera);
  }

  // Playful boot prompt
  setTimeout(() => {
    showSpeech(isMobile() ? 'Waddle with the joystick! 🤖' : 'Move me with WASD keys! 🥸');
  }, 1200);

  // Run loop
  animate();

} catch (err) {
  console.error("ThreeJS Engine failed: ", err);
  startWorld();
}