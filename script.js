/* =====================================================
   ABHEDYA SECURITY — Three.js World v5 (Continuous World)
   + Infinite Grid Chunking System (Sliding Window)
   + Aggressive Garbage Collection & Memory Management
   + Procedural Building Generation & Seeded Random
   + Non-Penetrable Rigid Collision Physics (Wall Sliding)
   + Stationary Sentinel Guards with Sweeping Lights
   + Mobile Joystick & Responsive UI Controls
   ===================================================== */

// ── EMAILJS ───────────────────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';
try {
  if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }
} catch (e) {
  console.warn('EmailJS load failed:', e);
}

// ── LOADING SCREEN ────────────────────────────────────────────────────────────
const FORCE_DISMISS = setTimeout(startWorld, 5000);
const lsBar = document.getElementById('lsBar');
const lsHint = document.getElementById('lsHint');
const HINTS = ['Building infinite world…', 'Deploying patrolling sentinels…', 'Initializing neon grids…', 'Ready to patrol!'];
let loadPct = 0;
const loadTick = setInterval(() => {
  loadPct += Math.random() * 20 + 10;
  if (loadPct >= 100) {
    loadPct = 100;
    clearInterval(loadTick);
    startWorld();
  }
  if (lsBar) lsBar.style.width = loadPct + '%';
  if (lsHint) lsHint.textContent = HINTS[Math.min(3, Math.floor(loadPct / 26))];
}, 180);

function startWorld() {
  clearTimeout(FORCE_DISMISS);
  clearInterval(loadTick);
  const ls = document.getElementById('loadingScreen');
  if (!ls || ls.style.display === 'none') return;
  ls.classList.add('fade-out');
  setTimeout(() => { ls.style.display = 'none'; }, 900);
}

// ── DETECT MOBILE ─────────────────────────────────────────────────────────────
const isMobile = () => window.innerWidth <= 900 || ('ontouchstart' in window);

try {

// ── SCENE & RENDERER SETUP ────────────────────────────────────────────────────
const canvas = document.getElementById('threeCanvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x0f1f38);
// Filmic tone mapping keeps bright daylight from washing out to flat white
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0f1f38, 55, 200);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 300);
camera.position.set(0, 28, 105);
camera.lookAt(0, 2, 80);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── GLOBAL LIGHTS ─────────────────────────────────────────────────────────────
const ambient = new THREE.AmbientLight(0x223355, 0.8);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xfff5e0, 1.2);
sun.position.set(50, 100, 50);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -100;
sun.shadow.camera.right = 100;
sun.shadow.camera.top = 100;
sun.shadow.camera.bottom = -100;
sun.shadow.camera.far = 250;
scene.add(sun);

const moonLight = new THREE.PointLight(0x6688cc, 0.6, 120);
moonLight.position.set(-50, 45, -50);
scene.add(moonLight);

// PointLights attached to player for surrounding illumination
const guardLight = new THREE.PointLight(0xfff8e0, 1.5, 14);
guardLight.castShadow = false;
scene.add(guardLight);

const guardFill = new THREE.PointLight(0xffeedd, 0.5, 22);
scene.add(guardFill);

// ── THEME COLORS MAPPING ──────────────────────────────────────────────────────
const DARK_COLORS = {
  ground: 0x111e2e, gridA: 0x2a4878, gridB: 0x182840,
  hqMain: 0x142438, hqAccent: 0x1a3050, hqSide: 0x112030,
  corporate: 0x162040, corporateTop: 0x101828, corpGlass: 0x204070,
  booth: 0x1e3048, fire: 0x333a44,
  tower: 0x182030, towerTop: 0x101820,
  house: 0x1e2e40, roof: 0x3a1a10,
  factory: 0x182028, chimney: 0x1e2a38,
  trunk: 0x4a3520, treetop: 0x0e3018,
  treetop2: 0x123a1c, treetop3: 0x0a2814,
  grassPatch: 0x143420, grassBlade: 0x1c4a28, bush: 0x103420,
  neonPink: 0xff2e93, neonCyan: 0x00f0ff, neonYellow: 0xffd200
};

const LIGHT_COLORS = {
  ground: 0x6b9457, gridA: 0x4a7340, gridB: 0x3f6638,
  hqMain: 0xb8b0a0, hqAccent: 0xa8a090, hqSide: 0xa0988a,
  corporate: 0x78889a, corporateTop: 0x687080, corpGlass: 0x6090c0,
  booth: 0xd8d0c0, fire: 0x6a6a62,
  tower: 0x7a8890, towerTop: 0x6a7880,
  house: 0xc8aa80, roof: 0x8a3020,
  factory: 0x80888a, chimney: 0x6a7070,
  trunk: 0x7a5230, treetop: 0x3a8228,
  treetop2: 0x478f34, treetop3: 0x2f7a26,
  grassPatch: 0x5c9248, grassBlade: 0x6dac56, bush: 0x49823a,
  neonPink: 0xd6005f, neonCyan: 0x0077a8, neonYellow: 0xc97a00
};

// ── MESH CREATION HELPERS ─────────────────────────────────────────────────────
function createBox(w, h, d, col, x, y, z, parent) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshLambertMaterial({ color: col });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.originalColor = col;
  parent.add(mesh);
  return mesh;
}

function createCylinder(rt, rb, h, s, col, x, y, z, parent) {
  const geo = new THREE.CylinderGeometry(rt, rb, h, s);
  const mat = new THREE.MeshLambertMaterial({ color: col });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.originalColor = col;
  parent.add(mesh);
  return mesh;
}

function makeSign(text, bg, fg, w = 256, h = 48) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, w, h);
  x.fillStyle = fg; x.font = `bold ${Math.floor(h * 0.55)}px Arial`;
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(text, w / 2, h / 2);
  return new THREE.CanvasTexture(c);
}

// ── SKY OBJECTS ───────────────────────────────────────────────────────────────
const starArr = new Float32Array(800 * 3);
for (let i = 0; i < 800; i++) {
  starArr[i * 3]     = (Math.random() - .5) * 400;
  starArr[i * 3 + 1] = Math.random() * 80 + 30;
  starArr[i * 3 + 2] = (Math.random() - .5) * 400;
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.BufferAttribute(starArr, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, transparent: true, opacity: 0.7 }));
scene.add(stars);

const moonMesh = new THREE.Mesh(new THREE.SphereGeometry(2.5, 16, 16), new THREE.MeshBasicMaterial({ color: 0xfff5c0 }));
moonMesh.position.set(-50, 60, -80);
scene.add(moonMesh);

const sunSphere = new THREE.Mesh(new THREE.SphereGeometry(2.5, 12, 12), new THREE.MeshBasicMaterial({ color: 0xfffaaa }));
sunSphere.position.set(50, 65, -70);
scene.add(sunSphere);
sunSphere.visible = false;

// ── DYNAMIC CHUNKING STATE ────────────────────────────────────────────────────
const chunkSize = 200;
const renderDistance = 1; // 3x3 chunk grid around player
let currentChunkX = 0;
let currentChunkZ = 0;
const loadedChunks = new Map(); // key: 'cx,cz' -> chunk data
const globalColliders = [];    // active THREE.Box3 objects
let activeZones = [];          // currently active Zone structures

// Animated features tracked globally
let activeFlames = [];
let activeSmoke = null;
let spot = null; // Watchtower searchlight

// ── PROCEDURAL SEED SYSTEM ────────────────────────────────────────────────────
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  range(min, max) {
    return min + this.next() * (max - min);
  }
  choice(arr) {
    return arr[Math.floor(this.next() * arr.length)];
  }
}

// ── CHUNK UPDATER ─────────────────────────────────────────────────────────────
function updateChunks(playerX, playerZ) {
  const cx = Math.floor((playerX + chunkSize / 2) / chunkSize);
  const cz = Math.floor((playerZ + chunkSize / 2) / chunkSize);

  if (cx !== currentChunkX || cz !== currentChunkZ || loadedChunks.size === 0) {
    currentChunkX = cx;
    currentChunkZ = cz;

    const activeKeys = new Set();

    // Load / verify surrounding chunks
    for (let dx = -renderDistance; dx <= renderDistance; dx++) {
      for (let dz = -renderDistance; dz <= renderDistance; dz++) {
        const nx = cx + dx;
        const nz = cz + dz;
        const key = `${nx},${nz}`;
        activeKeys.add(key);

        if (!loadedChunks.has(key)) {
          loadChunk(nx, nz);
        }
      }
    }

    // Unload chunks out of range
    for (const [key, chunk] of loadedChunks.entries()) {
      if (!activeKeys.has(key)) {
        unloadChunk(key);
      }
    }
  }
}

// ── CHUNK GENERATOR ───────────────────────────────────────────────────────────
function loadChunk(cx, cz) {
  const group = new THREE.Group();
  const centerX = cx * chunkSize;
  const centerZ = cz * chunkSize;
  group.position.set(centerX, 0, centerZ);
  scene.add(group);

  const chunk = {
    cx, cz,
    group,
    colliders: [],
    zones: [],
    guards: []
  };

  // 1. Terrain Ground
  const chunkGround = new THREE.Mesh(
    new THREE.PlaneGeometry(chunkSize, chunkSize),
    new THREE.MeshLambertMaterial({ color: isLight ? LIGHT_COLORS.ground : DARK_COLORS.ground })
  );
  chunkGround.rotation.x = -Math.PI / 2;
  chunkGround.receiveShadow = true;
  chunkGround.userData.isGround = true;
  chunkGround.userData.originalColor = DARK_COLORS.ground;
  group.add(chunkGround);

  // 2. Faint ground grid — kept subtle so it reads as a soft lawn/pavement
  // pattern rather than a harsh CAD grid, especially in bright daylight.
  const chunkGrid = new THREE.GridHelper(
    chunkSize, 20,
    isLight ? LIGHT_COLORS.gridA : DARK_COLORS.gridA,
    isLight ? LIGHT_COLORS.gridB : DARK_COLORS.gridB
  );
  chunkGrid.position.y = 0.01;
  chunkGrid.userData.isGrid = true;
  chunkGrid.material.transparent = true;
  chunkGrid.material.opacity = isLight ? 0.32 : 0.55;
  group.add(chunkGrid);

  // 3. Road Network
  // Tarmac roads
  createBox(16, 0.02, chunkSize, 0x1a1a22, 0, 0.01, 0, group);       // NS Road
  createBox(chunkSize, 0.02, 16, 0x1a1a22, 0, 0.01, 0, group);       // EW Road

  // NS Center dashes
  for (let lz = -chunkSize / 2 + 5; lz < chunkSize / 2; lz += 10) {
    if (Math.abs(lz) < 10) continue;
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 4), new THREE.MeshBasicMaterial({ color: 0xd4b800 }));
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(0, 0.03, lz);
    group.add(dash);
  }
  // EW Center dashes
  for (let lx = -chunkSize / 2 + 5; lx < chunkSize / 2; lx += 10) {
    if (Math.abs(lx) < 10) continue;
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.3), new THREE.MeshBasicMaterial({ color: 0xd4b800 }));
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(lx, 0.03, 0);
    group.add(dash);
  }

  // Road edges (White lines)
  [-8, 8].forEach(ex => {
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(0.2, chunkSize), new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.3, transparent: true }));
    edge.rotation.x = -Math.PI / 2;
    edge.position.set(ex, 0.02, 0);
    group.add(edge);
  });
  [-8, 8].forEach(ez => {
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(chunkSize, 0.2), new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.3, transparent: true }));
    edge.rotation.x = -Math.PI / 2;
    edge.position.set(0, 0.02, ez);
    group.add(edge);
  });

  // Sidewalk curb strips
  [-8.8, 8.8].forEach(kx => {
    const curb = new THREE.Mesh(new THREE.PlaneGeometry(1.6, chunkSize), new THREE.MeshLambertMaterial({ color: 0x1e2535 }));
    curb.rotation.x = -Math.PI / 2;
    curb.position.set(kx, 0.015, 0);
    curb.receiveShadow = true;
    group.add(curb);
  });
  [-8.8, 8.8].forEach(kz => {
    const curb = new THREE.Mesh(new THREE.PlaneGeometry(chunkSize, 1.6), new THREE.MeshLambertMaterial({ color: 0x1e2535 }));
    curb.rotation.x = -Math.PI / 2;
    curb.position.set(0, 0.015, kz);
    curb.receiveShadow = true;
    group.add(curb);
  });

  // Street lamps (Intersections & along roads)
  const lampPositions = [
    { lx: -9.5, lz: -9.5, ax: true }, { lx: 9.5, lz: -9.5, ax: true },
    { lx: -9.5, lz: 9.5, ax: false }, { lx: 9.5, lz: 9.5, ax: false },
    { lx: -50, lz: 9.5, ax: false },  { lx: 50, lz: -9.5, ax: false },
    { lx: 9.5, lz: -50, ax: true },   { lx: -9.5, lz: 50, ax: true }
  ];
  lampPositions.forEach(p => spawnStreetLamp(group, p.lx, p.lz, p.ax));

  // 4. Populate Elements (Static or Procedural)
  if (cx === 0 && cz === 0) {
    loadStaticStartingWorld(chunk, group);
  } else {
    loadProceduralChunkWorld(chunk, group, cx, cz, centerX, centerZ);
  }

  // Push new colliders to physics loop
  chunk.colliders.forEach(c => globalColliders.push(c));
  // Push new zones to patrol list
  chunk.zones.forEach(z => activeZones.push(z));

  // Sync colors to theme
  applyThemeToGroup(group, isLight);

  loadedChunks.set(`${cx},${cz}`, chunk);
}

// ── CHUNK UNLOADER ────────────────────────────────────────────────────────────
function unloadChunk(key) {
  const chunk = loadedChunks.get(key);
  if (!chunk) return;

  // 1. Remove colliders from loop
  chunk.colliders.forEach(c => {
    const idx = globalColliders.indexOf(c);
    if (idx !== -1) globalColliders.splice(idx, 1);
  });

  // 2. Remove zones from loop & dispose materials
  chunk.zones.forEach(z => {
    if (z.sprite) {
      if (z.sprite.material) z.sprite.material.dispose();
      if (z.sprite.material.map) z.sprite.material.map.dispose();
    }
    const idx = activeZones.indexOf(z);
    if (idx !== -1) activeZones.splice(idx, 1);
  });

  // 3. Clear special global references if chunk 0,0 unmounts
  if (chunk.cx === 0 && chunk.cz === 0) {
    activeFlames = [];
    activeSmoke = null;
    spot = null;
  }

  // 4. Clean up scene and trigger aggressive garbage collection
  scene.remove(chunk.group);
  disposeHierarchy(chunk.group);

  loadedChunks.delete(key);
}

// ── RECURSIVE DISPOSAL ROUTINE ────────────────────────────────────────────────
function disposeHierarchy(obj) {
  obj.traverse(child => {
    if (child.isMesh || child.isPoints || child.isLineSegments) {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => {
            if (m.map) m.map.dispose();
            m.dispose();
          });
        } else {
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
        }
      }
    }
  });
}

// ── STREET LIGHT SPAWNER ──────────────────────────────────────────────────────
function spawnStreetLamp(group, lx, lz, alignX) {
  // Post
  createBox(0.15, 5, 0.15, 0x334455, lx, 2.5, lz, group);
  // Arm
  const direction = (alignX ? lx : lz) < 0 ? 1 : -1;
  const bx = alignX ? lx + direction * 0.6 : lx;
  const bz = alignX ? lz : lz + direction * 0.6;
  createBox(alignX ? 1.2 : 0.12, 0.12, alignX ? 0.12 : 1.2, 0x334455, bx, 5, bz, group);

  // Glow Bulb
  const blx = alignX ? lx + direction * 1.2 : lx;
  const blz = alignX ? lz : lz + direction * 1.2;
  const bulb = createBox(0.25, 0.15, 0.25, 0xffe8a0, blx, 4.9, blz, group);
  bulb.userData.originalColor = 0xffe8a0;

  // Real Light Source (intensity adjusted on theme switch)
  const light = new THREE.PointLight(0xffe8a0, 0.8, 15);
  light.position.set(blx, 4.8, blz);
  group.add(light);
}

// ── REALISTIC TREE SPAWNER ────────────────────────────────────────────────────
// Builds a natural-looking tree with a tapered trunk, a few branches and
// layered, irregular foliage clumps so it reads as a real tree rather than
// a single lollipop sphere. Adds a slim collider so the player can't walk
// through the trunk. Returns the tree group.
function spawnTree(group, tx, tz, chunkColliders, opts = {}) {
  const rng = opts.rng || null;
  const rnd = (a, b) => rng ? rng.range(a, b) : (a + Math.random() * (b - a));

  const scale = opts.scale || rnd(0.85, 1.35);
  const trunkH = 2.6 * scale;
  const tree = new THREE.Group();
  tree.position.set(tx, 0, tz);
  group.add(tree);

  // Tapered trunk (two stacked cylinders for a natural narrowing taper)
  const trunkLower = createCylinder(0.16 * scale, 0.24 * scale, trunkH * 0.65, 6, DARK_COLORS.trunk, 0, trunkH * 0.325, 0, tree);
  const trunkUpper = createCylinder(0.1 * scale, 0.17 * scale, trunkH * 0.4, 6, DARK_COLORS.trunk, 0, trunkH * 0.65 + trunkH * 0.2, 0, tree);
  trunkLower.rotation.y = rnd(0, Math.PI * 2);
  trunkUpper.rotation.y = rnd(0, Math.PI * 2);

  // A couple of small angled branches breaking the silhouette
  const branchCount = 2;
  for (let b = 0; b < branchCount; b++) {
    const ang = rnd(0, Math.PI * 2);
    const branch = createCylinder(0.05 * scale, 0.08 * scale, 0.9 * scale, 5, DARK_COLORS.trunk, 0, 0, 0, tree);
    branch.position.set(Math.cos(ang) * 0.18 * scale, trunkH * 0.62, Math.sin(ang) * 0.18 * scale);
    branch.rotation.z = Math.cos(ang) * 0.9;
    branch.rotation.x = Math.sin(ang) * 0.9;
  }

  // Layered foliage — three offset, irregularly-sized clumps using slightly
  // different greens (and low-poly icosahedrons instead of spheres) so the
  // canopy looks organic rather than a perfect ball.
  const foliageColors = [DARK_COLORS.treetop, DARK_COLORS.treetop2, DARK_COLORS.treetop3];
  const clumpCount = 3 + (rng ? Math.floor(rng.next() * 2) : Math.floor(Math.random() * 2));
  for (let c = 0; c < clumpCount; c++) {
    const r = rnd(0.85, 1.25) * scale;
    const ang = rnd(0, Math.PI * 2);
    const dist = c === 0 ? 0 : rnd(0.25, 0.55) * scale;
    const fx = Math.cos(ang) * dist;
    const fz = Math.sin(ang) * dist;
    const fy = trunkH + rnd(0.3, 0.85) * scale - (c === 0 ? 0 : 0.2);
    const col = foliageColors[c % foliageColors.length];
    const clump = new THREE.Mesh(
      new THREE.IcosahedronGeometry(r, 0),
      new THREE.MeshLambertMaterial({ color: col })
    );
    clump.position.set(fx, fy, fz);
    clump.rotation.set(rnd(0, Math.PI), rnd(0, Math.PI), rnd(0, Math.PI));
    clump.castShadow = true;
    clump.receiveShadow = true;
    clump.userData.originalColor = col;
    tree.add(clump);
  }

  if (chunkColliders) {
    const cr = 0.28 * scale;
    chunkColliders.push(new THREE.Box3(
      new THREE.Vector3(tx - cr, 0, tz - cr),
      new THREE.Vector3(tx + cr, trunkH + 1.2, tz + cr)
    ));
  }

  return tree;
}

// ── BUSH / SHRUB SPAWNER ──────────────────────────────────────────────────────
function spawnBush(group, bx, bz, rng) {
  const rnd = (a, b) => rng ? rng.range(a, b) : (a + Math.random() * (b - a));
  const scale = rnd(0.5, 0.9);
  const bush = new THREE.Group();
  bush.position.set(bx, 0, bz);
  group.add(bush);

  const lumps = 2 + Math.round(rnd(0, 1));
  for (let i = 0; i < lumps; i++) {
    const r = rnd(0.35, 0.55) * scale;
    const ang = rnd(0, Math.PI * 2);
    const dist = i === 0 ? 0 : rnd(0.2, 0.4) * scale;
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), new THREE.MeshLambertMaterial({ color: DARK_COLORS.bush }));
    m.position.set(Math.cos(ang) * dist, r * 0.85, Math.sin(ang) * dist);
    m.castShadow = true;
    m.receiveShadow = true;
    m.userData.originalColor = DARK_COLORS.bush;
    bush.add(m);
  }
  return bush;
}

// ── GRASS PATCH SPAWNER ───────────────────────────────────────────────────────
// Scatters thin double-sided blade quads over a roughly circular patch using
// a low-cost merged BufferGeometry so large numbers of blades stay cheap,
// plus a soft tinted ground disc beneath them for a richer turf base.
function spawnGrassPatch(group, gx, gz, radius, density, rng) {
  const rnd = (a, b) => rng ? rng.range(a, b) : (a + Math.random() * (b - a));

  // Soft turf disc under the blades
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 10),
    new THREE.MeshLambertMaterial({ color: DARK_COLORS.grassPatch })
  );
  disc.rotation.x = -Math.PI / 2;
  disc.position.set(gx, 0.012, gz);
  disc.receiveShadow = true;
  disc.userData.originalColor = DARK_COLORS.grassPatch;
  group.add(disc);

  // Merge many thin blade quads into one BufferGeometry for performance
  const bladeCount = density;
  const positions = [];
  const indices = [];
  let vi = 0;
  for (let i = 0; i < bladeCount; i++) {
    const ang = rnd(0, Math.PI * 2);
    const dist = Math.sqrt(rnd(0, 1)) * radius;
    const cx = Math.cos(ang) * dist;
    const cz = Math.sin(ang) * dist;
    const h = rnd(0.18, 0.4);
    const w = rnd(0.05, 0.09);
    const rot = rnd(0, Math.PI);
    const dx = Math.cos(rot) * w / 2;
    const dz = Math.sin(rot) * w / 2;
    const lean = rnd(-0.06, 0.06);

    // base-left, base-right, tip (single triangle blade)
    positions.push(cx - dx, 0, cz - dz);
    positions.push(cx + dx, 0, cz + dz);
    positions.push(cx + lean, h, cz + lean);

    indices.push(vi, vi + 1, vi + 2);
    vi += 3;
  }

  const bladeGeo = new THREE.BufferGeometry();
  bladeGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  bladeGeo.setIndex(indices);
  bladeGeo.computeVertexNormals();

  const bladeMat = new THREE.MeshLambertMaterial({ color: DARK_COLORS.grassBlade, side: THREE.DoubleSide });
  const blades = new THREE.Mesh(bladeGeo, bladeMat);
  blades.position.set(gx, 0.015, gz);
  blades.userData.originalColor = DARK_COLORS.grassBlade;
  blades.userData.isGrassBlades = true;
  group.add(blades);

  return { disc, blades };
}

// ── STATIC STARTING WORLD (CHUNK 0,0) ─────────────────────────────────────────
let gateLeftDoor = null;
let gateRightDoor = null;
let gateRoadCollider = null;
const GZ = 80; // Gate Z position

function loadStaticStartingWorld(chunk, group) {
  // ── GATE SECURITY (Z = 80) ──
  createBox(1.5, 7, 1.5, 0xb0a888, -9, 3.5, GZ, group);
  createBox(1.5, 7, 1.5, 0xb0a888, 9, 3.5, GZ, group);
  createBox(1.8, 0.4, 1.8, 0x988870, -9, 7.2, GZ, group);
  createBox(1.8, 0.4, 1.8, 0x988870, 9, 7.2, GZ, group);
  createBox(19.8, 0.6, 0.6, 0xa09878, 0, 7.2, GZ, group);
  createBox(19.8, 0.25, 1.0, 0x887860, 0, 6.85, GZ, group);

  const gSignMat = new THREE.MeshBasicMaterial({ map: makeSign('ABHEDYA SECURITY', '#c8a030', '#0a0800', 512, 64) });
  const gSign = new THREE.Mesh(new THREE.PlaneGeometry(10, 1.1), gSignMat);
  gSign.position.set(0, 7.2, GZ + 0.52);
  group.add(gSign);

  // Sliding entrance doors
  gateLeftDoor  = createBox(8, 4, 0.12, 0x888870, -4.5, 2.1, GZ, group);
  gateRightDoor = createBox(8, 4, 0.12, 0x888870, 4.5, 2.1, GZ, group);

  if (securedZones.has('gate')) {
    gateLeftDoor.position.x = -12.5;
    gateRightDoor.position.x = 12.5;
  } else {
    // Add central road barrier collider (removed on secure)
    gateRoadCollider = new THREE.Box3(new THREE.Vector3(-8, 0, GZ - 0.5), new THREE.Vector3(8, 6, GZ + 0.5));
    chunk.colliders.push(gateRoadCollider);
  }

  // Booth
  createBox(3, 3.8, 3, 0xc8c0b0, 12, 1.9, GZ, group);
  createBox(3.4, 0.25, 3.4, 0xa8a090, 12, 3.85, GZ, group);
  createBox(3, 0.1, 3, 0x585048, 12, 3.98, GZ, group);
  const bw = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.8), new THREE.MeshBasicMaterial({ color: 0x8ab8cc, opacity: 0.55, transparent: true }));
  bw.position.set(10.45, 2.2, GZ + 0.01);
  group.add(bw);

  // Boom barrier
  createBox(0.3, 2.5, 0.3, 0xccbba8, -10.5, 1.25, GZ + 1.5, group);
  createBox(6, 0.14, 0.14, 0xdd2222, -13.5, 2.52, GZ + 1.5, group);

  // Colliders
  chunk.colliders.push(new THREE.Box3(new THREE.Vector3(-10, 0, GZ - 1), new THREE.Vector3(-8, 7.5, GZ + 1))); // Left pillar
  chunk.colliders.push(new THREE.Box3(new THREE.Vector3(8, 0, GZ - 1), new THREE.Vector3(10, 7.5, GZ + 1)));   // Right pillar
  chunk.colliders.push(new THREE.Box3(new THREE.Vector3(10.5, 0, GZ - 2), new THREE.Vector3(13.5, 4.5, GZ + 2))); // Booth

  // ── HQ TOWER (X = -20, Z = 50) ──
  const HX = -20, HZ = 50;
  createBox(10, 24, 9, 0x142438, HX, 12, HZ, group);
  createBox(11, 3.5, 10, 0x1a3050, HX, 1.75, HZ, group);
  createBox(7, 5, 7, 0x0e1e32, HX, 27.5, HZ, group);
  createBox(4, 2, 4, 0x0c1828, HX, 31, HZ, group);
  createBox(5, 14, 7, 0x112030, HX - 7.5, 7, HZ, group);
  [-2, 0, 2].forEach(cx => createBox(0.4, 24, 0.4, 0x1e3a5a, HX + cx, 12, HZ + 4.55, group));

  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 4; c++) {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.1), new THREE.MeshBasicMaterial({ color: 0xaad4f8, opacity: 0.75, transparent: true }));
      w.position.set(HX - 4.5 + c * 3.0, 3.5 + r * 3.5, HZ + 4.56);
      group.add(w);
    }
  }
  const hqSgn = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 1.1), new THREE.MeshBasicMaterial({ map: makeSign('ABHEDYA SOLUTIONS', '#182e4a', '#D4AF37', 384, 64) }));
  hqSgn.position.set(HX, 3.8, HZ + 5.01);
  group.add(hqSgn);

  // Flagpole
  createBox(0.1, 8, 0.1, 0xaaaaaa, HX + 5.5, 4, HZ + 4, group);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(2, 1), new THREE.MeshBasicMaterial({ color: 0xff9900, side: THREE.DoubleSide }));
  flag.position.set(HX + 4.5, 8, HZ + 4);
  group.add(flag);

  chunk.colliders.push(new THREE.Box3(new THREE.Vector3(HX - 10, 0, HZ - 6), new THREE.Vector3(HX + 6, 30, HZ + 5))); // HQ main block

  // ── FIRE DRILL AREA (X = -20, Z = 20) ──
  const FX = -20, FZ = 20;
  createBox(10, 4, 8, 0x222830, FX, 2, FZ, group);
  createBox(10.4, 0.4, 8.4, 0x1a2028, FX, 4.2, FZ, group);
  createBox(6, 0.1, 6, 0x2a1a10, FX, 0.06, FZ + 7, group); // drill platform
  createCylinder(0.6, 0.7, 1.8, 8, 0x444444, FX, 0.9, FZ + 6, group); // barrel

  // Extinguisher rack
  createBox(0.3, 1.2, 0.3, 0xcc2200, FX + 2, 0.6, FZ + 6, group);
  createBox(0.3, 0.3, 0.3, 0x888888, FX + 2, 1.35, FZ + 6, group);
  createBox(0.3, 1.2, 0.3, 0xcc2200, FX + 2.8, 0.6, FZ + 6, group);

  const fsgn = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 0.8), new THREE.MeshBasicMaterial({ map: makeSign('⚠ FIRE ZONE', '#8b1a00', '#ffcc00', 280, 48) }));
  fsgn.position.set(FX, 4.6, FZ + 4.06);
  group.add(fsgn);

  // Animated Flames spawner
  const flameColors = [0xff4400, 0xff8800, 0xffcc00];
  for (let fi = 0; fi < 3; fi++) {
    const fm = new THREE.Mesh(new THREE.ConeGeometry(0.38 + fi * 0.1, 1.4 + fi * 0.35, 6), new THREE.MeshBasicMaterial({ color: flameColors[fi], transparent: true, opacity: 0.88 }));
    fm.position.set(FX + (fi - 1) * 0.5, 1.9 + fi * 0.22, FZ + 6);
    group.add(fm);
    activeFlames.push(fm);
  }

  const fireGlow = new THREE.PointLight(0xff5500, 2.0, 14);
  fireGlow.position.set(FX, 3, FZ + 6);
  group.add(fireGlow);

  chunk.colliders.push(new THREE.Box3(new THREE.Vector3(FX - 5.5, 0, FZ - 4.5), new THREE.Vector3(FX + 5.5, 5, FZ + 4.5)));

  // ── CORPORATE TOWER (X = 20, Z = -10) ──
  const CX = 20, CZ = -10;
  createBox(11, 20, 9, 0x162040, CX, 10, CZ, group);
  createBox(13, 3, 11, 0x1c2a48, CX, 1.5, CZ, group);
  createBox(8, 3, 7, 0x101828, CX, 22.5, CZ, group);
  [-5, 5].forEach(cx => createBox(0.5, 20, 0.5, 0x1a2848, CX + cx, 10, CZ, group));

  for (let f = 0; f < 6; f++) {
    const fac = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.8), new THREE.MeshBasicMaterial({ color: 0x2060a0, opacity: 0.45, transparent: true }));
    fac.position.set(CX, 3.0 + f * 3.0, CZ + 4.51);
    group.add(fac);
  }
  const csgn = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.0), new THREE.MeshBasicMaterial({ map: makeSign('CORPORATE CAMPUS', '#101828', '#4aafff', 320, 56) }));
  csgn.position.set(CX, 3.7, CZ + 4.52);
  group.add(csgn);

  chunk.colliders.push(new THREE.Box3(new THREE.Vector3(CX - 7, 0, CZ - 6), new THREE.Vector3(CX + 7, 25, CZ + 6)));

  // ── NIGHT WATCH TOWER (X = 32, Z = -10) ──
  const NX = 32, NZ = -10;
  createBox(2.5, 2, 2.5, 0x1a2838, NX, 1, NZ, group);
  createCylinder(0.45, 0.55, 14, 10, 0x182030, NX, 7, NZ, group);
  createBox(4, 0.3, 4, 0x1a2838, NX, 14.15, NZ, group);
  createBox(3, 2.5, 3, 0x101828, NX, 15.65, NZ, group);
  createBox(3.4, 0.2, 3.4, 0x141e2e, NX, 16.95, NZ, group);
  createCylinder(0.35, 0.45, 0.6, 8, 0x888888, NX, 17.3, NZ, group);

  // Watchtower searchlight (Spotlight tracking)
  spot = new THREE.SpotLight(0xffffcc, 2.5, 35, Math.PI / 7, 0.45);
  spot.position.set(NX, 17.5, NZ);
  spot.target = new THREE.Object3D();
  spot.target.position.set(NX, 0, NZ - 12);
  group.add(spot);
  group.add(spot.target);

  for (let l = 0; l < 7; l++) {
    createBox(0.6, 0.08, 0.08, 0x446688, NX + 0.5, 1.5 + l * 1.8, NZ + 0.5, group);
  }

  chunk.colliders.push(new THREE.Box3(new THREE.Vector3(NX - 1.5, 0, NZ - 1.5), new THREE.Vector3(NX + 1.5, 18, NZ + 1.5)));

  // ── RESIDENTIAL AREA (Z = -45) ──
  const RZ = -45;
  const housePos = [[16, RZ], [22, RZ], [19, RZ - 7], [25, RZ - 4]];
  housePos.forEach(([hx, hz]) => {
    createBox(5, 4.5, 5, 0x1e2e40, hx, 2.25, hz, group);
    // Windows
    const w1 = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ color: 0xffe8a0, opacity: 0.8, transparent: true }));
    w1.position.set(hx - 1.2, 2.5, hz + 2.51);
    group.add(w1);
    const w2 = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ color: 0xffe8a0, opacity: 0.8, transparent: true }));
    w2.position.set(hx + 1.2, 2.5, hz + 2.51);
    group.add(w2);

    // Door
    createBox(0.7, 1.5, 0.08, 0x3a2810, hx, 0.75, hz + 2.52, group);

    // Gabled roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(4.0, 2.2, 4), new THREE.MeshLambertMaterial({ color: 0x3a1a10 }));
    roof.position.set(hx, 5.7, hz);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    roof.userData.originalColor = 0x3a1a10;
    group.add(roof);

    chunk.colliders.push(new THREE.Box3(new THREE.Vector3(hx - 2.6, 0, hz - 2.6), new THREE.Vector3(hx + 2.6, 7, hz + 2.6)));
  });

  // Perimeter wall
  createBox(14, 1.2, 0.3, 0x2a3848, 21, 0.6, RZ + 3.5, group);
  createBox(0.3, 1.2, 12, 0x2a3848, 14, 0.6, RZ - 5, group);
  chunk.colliders.push(new THREE.Box3(new THREE.Vector3(14, 0, RZ - 11), new THREE.Vector3(28, 1.5, RZ + 4)));

  // ── INDUSTRIAL SECTOR (X = -20, Z = -70) ──
  const IX = -20, IZ = -70;
  createBox(16, 9, 12, 0x182028, IX, 4.5, IZ, group);
  createBox(8, 3, 4, 0x141c22, IX, 1.5, IZ + 8, group); // loading bay
  createBox(16.5, 0.5, 12.5, 0x101820, IX, 9.25, IZ, group);
  createCylinder(0.55, 0.65, 10, 8, 0x1e2a38, IX - 4, 5, IZ - 3, group);
  createCylinder(0.55, 0.65, 13, 8, 0x1e2a38, IX + 4, 6.5, IZ - 3, group);

  // Animated smoke particles
  const smokeArr = new Float32Array(80 * 3);
  for (let s = 0; s < 80; s++) {
    smokeArr[s * 3]     = IX + (s % 2 === 0 ? -4 : 4) + (Math.random() - .5) * 1.5;
    smokeArr[s * 3 + 1] = 14 + Math.random() * 10;
    smokeArr[s * 3 + 2] = IZ - 3 + (Math.random() - .5) * 1.5;
  }
  const smokeGeo = new THREE.BufferGeometry();
  smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokeArr, 3));
  activeSmoke = new THREE.Points(smokeGeo, new THREE.PointsMaterial({ color: 0x556677, size: 0.6, transparent: true, opacity: 0.4 }));
  group.add(activeSmoke);

  const isgn = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 0.9), new THREE.MeshBasicMaterial({ map: makeSign('INDUSTRIAL ZONE', '#101820', '#ff8800', 320, 56) }));
  isgn.position.set(IX, 9.7, IZ + 6.01);
  group.add(isgn);

  [IX - 4, IX + 4].forEach(cx => {
    const wl = new THREE.PointLight(0xff4400, 0.6, 8);
    wl.position.set(cx, 16, IZ - 3);
    group.add(wl);
  });

  chunk.colliders.push(new THREE.Box3(new THREE.Vector3(IX - 8.5, 0, IZ - 6.5), new THREE.Vector3(IX + 8.5, 12, IZ + 10)));

  // ── TREES ALONG MAIN NS ROAD ──
  [-65, -50, -35, -20, -5, 5, 20, 35, 50, 65].forEach(tz => {
    if (Math.abs(tz) < 10) return; // keep gate area clear
    [-11.5, 11.5].forEach(tx => {
      spawnTree(group, tx + (Math.random() - 0.5) * 1.5, tz + (Math.random() - 0.5) * 4, chunk.colliders);
    });
  });

  // ── TREES ALONG MAIN EW ROAD ──
  [-65, -50, -35, 35, 50, 65].forEach(tx => {
    [-11.5, 11.5].forEach(tz => {
      spawnTree(group, tx + (Math.random() - 0.5) * 4, tz + (Math.random() - 0.5) * 1.5, chunk.colliders);
    });
  });

  // ── GRASS & SHRUBS — soften building perimeters with real-world greenery ──
  const grassSpots = [
    [HX + 9, HZ - 3, 4.5, 70],   // beside HQ tower
    [HX - 11, HZ + 3, 4, 60],    // HQ flank
    [CX + 9, CZ + 4, 4.5, 70],   // beside corporate tower
    [CX - 9, CZ - 3, 4, 55],     // corporate flank
    [21, RZ + 7, 6, 90],         // residential front lawn
    [29, RZ - 6, 5, 70],         // residential side
    [IX + 10, IZ + 4, 4.5, 60],  // industrial fringe
    [14, GZ + 4, 4, 55],         // near guard booth
    [NX + 4, NZ + 5, 4, 55],     // around watchtower
  ];
  grassSpots.forEach(([gx, gz, r, density]) => spawnGrassPatch(group, gx, gz, r, density));

  // Scattered shrubs dotted near pathways and building corners
  const bushSpots = [
    [HX + 6, HZ + 6], [HX - 6, HZ - 6], [CX + 6, CZ + 6], [CX - 6, CZ - 5],
    [18, RZ + 4], [27, RZ - 1], [IX + 9, IZ - 2], [IX - 9, IZ + 8],
    [3, GZ - 3], [-3, GZ - 3], [NX - 4, NZ + 4]
  ];
  bushSpots.forEach(([bx, bz]) => spawnBush(group, bx, bz));

  // ── STATIC SECURING ZONES (Transferred to Chunk 0,0) ──
  const staticZones = [
    { id: 'gate', label: '🚪 Gate Security', pos: [0, 0, 80], r: 10, icon: '🚪', tag: 'ENTRANCE CONTROL', title: 'Securing the <em>Gate</em>', text: 'Our guards maintain <strong>strict access control</strong> at every entry — visitor logging, vehicle checks, zero-tolerance entry.', list: [' Visitor management', ' Vehicle checking', ' 24/7 manned entry'], night: false, walkie: true, torch: false, lc: 0xffffaa, li: 0.6 },
    { id: 'hq', label: '🏛 Abhedya HQ', pos: [-20, 0, 50], r: 12, icon: '🛡️', tag: 'OUR FOUNDATION', title: 'What is <em>Abhedya</em>?', text: 'Abhedya means <strong>Impenetrable</strong>. Founded on armed forces values — discipline, vigilance, zero compromise.', list: [' Background verified', ' Military supervisors', ' 24×7 command'], night: false, walkie: true, torch: false, lc: 0xD4AF37, li: 0.8 },
    { id: 'fire', label: '🔥 Fire Zone', pos: [-20, 0, 20], r: 10, icon: '🔥', tag: 'EMERGENCY TRAINING', title: 'Fire & Emergency <em>Response</em>', text: 'Every guard is <strong>fire safety certified</strong>. Evacuation, extinguisher use, and first response — drilled to instinct.', list: [' Fire extinguisher cert.', ' Evacuation drills', ' First aid trained'], night: true, walkie: false, torch: false, lc: 0xff5500, li: 1.3 },
    { id: 'corporate', label: '🏢 Corporate Security', pos: [20, 0, -10], r: 12, icon: '🏢', tag: 'CORPORATE PATROL', title: 'Office & IT Park <em>Security</em>', text: 'Disciplined floor patrols, RFID access, and professional protocols for <strong>corporate campuses</strong> and IT parks.', list: [' Access control', ' CCTV coordination', ' Visitor mgmt'], night: false, walkie: true, torch: false, lc: 0x4488ff, li: 0.5 },
    { id: 'nightwatch', label: '🌙 Night Watch Tower', pos: [32, 0, -10], r: 10, icon: '🌙', tag: 'NIGHT SHIFT', title: 'On Guard <em>Through the Night</em>', text: 'Night guards carry torches, radios and <strong>heightened vigilance</strong>. Threats dont sleep — neither do we.', list: [' Night patrol rotations', ' Intruder detection', ' Digital logs'], night: true, walkie: false, torch: true, lc: 0x44aaee, li: 0.7 },
    { id: 'residential', label: '🏠 Residential', pos: [22, 0, -45], r: 12, icon: '🏠', tag: 'GATED COMMUNITIES', title: 'Protecting <em>Homes</em>', text: 'From gated societies to apartments — resident safety, vehicle entry and <strong>community watch patrols</strong>.', list: [' Gate management', ' Resident verification', ' E-response patrols'],   night: false, walkie: true, torch: false, lc: 0x44dd88, li: 0.5 },
    { id: 'industrial', label: '🏭 Industrial Zone', pos: [-20, 0, -70], r: 12, icon: '🏭', tag: 'INDUSTRIAL SECURITY', title: 'Factory & Plant <em>Protection</em>', text: '<strong>High-security perimeter control</strong> for plants — shift guards, asset tracking, safety enforcement.', list: [' Perimeter surveillance', ' Asset protection', ' Shift deployment'], night: false, walkie: true, torch: false, lc: 0xff8800, li: 0.6 }
  ];

  staticZones.forEach(z => {
    z.position = new THREE.Vector3(...z.pos);

    // Glowing pillar zone light
    const zl = new THREE.PointLight(z.lc, z.li, 15);
    zl.position.set(z.pos[0], 6, z.pos[2]);
    group.add(zl);
    z.zlight = zl;

    // Floating text label sprite
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 420; spriteCanvas.height = 108;
    const sCtx = spriteCanvas.getContext('2d');
    sCtx.fillStyle = 'rgba(7,17,31,0.9)'; sCtx.beginPath(); sCtx.roundRect(0, 0, 420, 108, 14); sCtx.fill();
    sCtx.strokeStyle = '#D4AF37'; sCtx.lineWidth = 3; sCtx.beginPath(); sCtx.roundRect(2, 2, 416, 104, 14); sCtx.stroke();
    sCtx.fillStyle = '#D4AF37'; sCtx.font = 'bold 30px Arial'; sCtx.textAlign = 'center'; sCtx.fillText(z.label, 210, 60);

    const spriteMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(spriteCanvas), transparent: true, depthWrite: false });
    const sprite = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 1.35), spriteMat);
    sprite.position.set(z.pos[0], 5.5, z.pos[2]);
    sprite.scale.set(0, 0, 0);
    group.add(sprite);
    z.sprite = sprite;

    chunk.zones.push(z);
  });

  // Spawn Stationary Guards for Static Buildings
  spawnGuardPair(group, HX, HZ + 5.5, Math.PI, chunk.guards);   // HQ
  spawnGuardPair(group, FX, FZ + 6.5, Math.PI, chunk.guards);   // Fire Zone
  spawnGuardPair(group, CX, CZ - 5.5, 0, chunk.guards);         // Corp
  spawnGuardPair(group, NX, NZ - 3, 0, chunk.guards);           // Tower
  spawnGuardPair(group, 21, RZ + 4, 0, chunk.guards);           // Residential
  spawnGuardPair(group, IX, IZ + 10.5, 0, chunk.guards);        // Industrial

  // Main gate — didn't have a guard before, adding a pair here too
  spawnGuardPair(group, 0, GZ + 3, 0, chunk.guards);      // Industrial

  // ── DISTANT SKYLINE — fills the horizon around the starting chunk so it
  // never reads as a flat empty plane, in either light or dark theme. Kept
  // well outside the 100x100 playable footprint (roads run to ±100) so it
  // never blocks movement or gate views; it's a backdrop only.
  const skylineRng = new SeededRandom(909090);
  spawnSkylineBackdrop(group, skylineRng, 26, 95, 170);
}

// ── PROCEDURAL CHUNK WORLD GENERATOR ──────────────────────────────────────────
const quadOffsets = [
  { id: 'Q1', bx: 40, bz: 40, gx: 22, gz: 40, face: -Math.PI / 2 },
  { id: 'Q2', bx: -40, bz: 40, gx: -22, gz: 40, face: Math.PI / 2 },
  { id: 'Q3', bx: -40, bz: -40, gx: -22, gz: -40, face: Math.PI / 2 },
  { id: 'Q4', bx: 40, bz: -40, gx: 22, gz: -40, face: -Math.PI / 2 }
];

const zoneNames = ["Security Annex", "Cyber Depot", "Network Hub", "Sentinel Outpost", "Crypto Center", "Automation Facility", "Research Node"];
const zoneDescs = [
  "Monitor terminal matrices and maintain secure mainframe perimeters.",
  "Check shipping logs, lock storage bays and secure perimeter docks.",
  "Verify data stream sync relays and prevent unauthorized network taps.",
  "Check sentinel drone diagnostics and calibrate sensor sweeps.",
  "Patrol crypto-node array grids and verify liquid-cooling channels.",
  "Verify automated machinery safeguards and scan for hazard bypasses.",
  "Ensure biotech containment arrays are online and audit access keys."
];
const zoneIcons = ["🏢", "🏭", "📡", "🛡️", "🧬", "💾", "🔌"];

function loadProceduralChunkWorld(chunk, group, cx, cz, centerX, centerZ) {
  const seed = Math.abs(cx * 73856093 ^ cz * 19349663);
  const rng = new SeededRandom(seed);

  let spawnedAny = false;

  quadOffsets.forEach(q => {
    // 55% chance to spawn building in this quadrant
    if (rng.next() < 0.55 || (!spawnedAny && q.id === 'Q4')) {
      spawnedAny = true;
      const type = rng.choice(['corporate', 'industrial', 'residential', 'hq', 'lab']);
      
      const px = q.bx;
      const pz = q.bz;
      let result = null;

      if (type === 'corporate') {
        result = spawnCorporateBuilding(group, px, pz, rng);
      } else if (type === 'industrial') {
        result = spawnIndustrialBuilding(group, px, pz, rng);
      } else if (type === 'residential') {
        result = spawnResidentialBuilding(group, px, pz, rng);
      } else if (type === 'hq') {
        result = spawnHQBuilding(group, px, pz, rng);
      } else {
        result = spawnLabBuilding(group, px, pz, rng);
      }

      // Add Box3 collider
      chunk.colliders.push(result.bbox);

      // Create Guard position (Global coordinates)
      const gx = centerX + q.gx;
      const gz = centerZ + q.gz;

      // Spawn Stationary Sentinel Guard
      // Spawn Stationary Sentinel Guard Pair
      spawnGuardPair(group, q.gx, q.gz, q.face, chunk.guards);

      // Construct a Procedural Zone
      const zName = rng.choice(zoneNames);
      const zDesc = rng.choice(zoneDescs);
      const zIcon = rng.choice(zoneIcons);
      const zColor = rng.choice([0x00f0ff, 0xff2e93, 0xffd200]);

      const pZone = {
        id: `zone_${cx}_${cz}_${q.id}`,
        label: `🛡️ ${zName} ${cx},${cz}`,
        pos: [gx, 0, gz],
        r: 10,
        icon: zIcon,
        tag: `SECTOR PATROL`,
        title: `Sector Outpost <em>${cx},${cz}</em>`,
        text: `${zDesc} Patrol this procedural quadrant.`,
        list: [' Scan security nodes', ' Verify gate lockups', ' Audit access codes'],
        night: rng.next() > 0.5,
        walkie: true,
        torch: false,
        lc: zColor,
        li: 0.8,
        position: new THREE.Vector3(gx, 0, gz)
      };

      // Zone Light
      const zl = new THREE.PointLight(pZone.lc, pZone.li, 15);
      zl.position.set(q.gx, 6, q.gz);
      group.add(zl);
      pZone.zlight = zl;

      // Zone Label Sprite
      const spriteCanvas = document.createElement('canvas');
      spriteCanvas.width = 420; spriteCanvas.height = 108;
      const sCtx = spriteCanvas.getContext('2d');
      sCtx.fillStyle = 'rgba(7,17,31,0.9)'; sCtx.beginPath(); sCtx.roundRect(0, 0, 420, 108, 14); sCtx.fill();
      sCtx.strokeStyle = '#D4AF37'; sCtx.lineWidth = 3; sCtx.beginPath(); sCtx.roundRect(2, 2, 416, 104, 14); sCtx.stroke();
      sCtx.fillStyle = '#D4AF37'; sCtx.font = 'bold 26px Arial'; sCtx.textAlign = 'center'; sCtx.fillText(pZone.label, 210, 60);

      const spriteMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(spriteCanvas), transparent: true, depthWrite: false });
      const sprite = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 1.35), spriteMat);
      sprite.position.set(q.gx, 5.5, q.gz);
      sprite.scale.set(0, 0, 0);
      group.add(sprite);
      pZone.sprite = sprite;

      chunk.zones.push(pZone);

      // ── GREENERY around this building quadrant ──
      // A grass lawn skirting the building base, a few scattered trees
      // around its perimeter, and a couple of low shrubs near the entrance.
      const lawnDX = q.bx > 0 ? -1 : 1;
      const lawnDZ = q.bz > 0 ? -1 : 1;
      spawnGrassPatch(group, q.bx + lawnDX * 11, q.bz + lawnDZ * 11, 6, 70, rng);

      const treesAround = 2 + Math.floor(rng.next() * 2);
      for (let t = 0; t < treesAround; t++) {
        const ang = rng.range(0, Math.PI * 2);
        const dist = rng.range(13, 18);
        spawnTree(group, q.bx + Math.cos(ang) * dist, q.bz + Math.sin(ang) * dist, chunk.colliders, { rng });
      }

      const bushAng = rng.range(0, Math.PI * 2);
      spawnBush(group, q.bx + Math.cos(bushAng) * 9, q.bz + Math.sin(bushAng) * 9, rng);
      spawnBush(group, q.bx + Math.cos(bushAng + 1) * 9.5, q.bz + Math.sin(bushAng + 1) * 9.5, rng);
    } else {
      // ── EMPTY QUADRANT — turn it into a small green patch / mini park ──
      if (rng.next() < 0.7) {
        spawnGrassPatch(group, q.bx, q.bz, rng.range(8, 13), 110, rng);
        const wildTrees = 3 + Math.floor(rng.next() * 4);
        for (let t = 0; t < wildTrees; t++) {
          const ang = rng.range(0, Math.PI * 2);
          const dist = rng.range(2, 16);
          spawnTree(group, q.bx + Math.cos(ang) * dist, q.bz + Math.sin(ang) * dist, chunk.colliders, { rng });
        }
        const wildBushes = 1 + Math.floor(rng.next() * 3);
        for (let b = 0; b < wildBushes; b++) {
          const ang = rng.range(0, Math.PI * 2);
          const dist = rng.range(2, 14);
          spawnBush(group, q.bx + Math.cos(ang) * dist, q.bz + Math.sin(ang) * dist, rng);
        }
      }
    }
  });

  // ── DISTANT SKYLINE — a sparse backdrop ring near the chunk's outer edge
  // (chunk is 200 units wide) so the horizon stays filled in as the player
  // roams outward, without crowding the playable quadrant footprints.
  spawnSkylineBackdrop(group, rng, 8, 92, 99);
}

// ── DISTANT SKYLINE SPAWNER ──────────────────────────────────────────────────
// Purely decorative, non-collidable background buildings used to fill the
// horizon so the world doesn't read as a flat, empty plane — especially
// noticeable in bright light mode where fog used to erase everything past
// a short distance. These are cheap boxes with no shadow-casting to keep
// frame rate steady even when many are on screen at once.
function spawnSkylineBuilding(group, px, pz, rng) {
  const width  = rng.range(7, 13);
  const depth  = rng.range(7, 13);
  const height = rng.range(14, 46);
  const colorSet = rng.choice([
    [DARK_COLORS.tower, LIGHT_COLORS.tower],
    [DARK_COLORS.corporate, LIGHT_COLORS.corporate],
    [DARK_COLORS.hqSide, LIGHT_COLORS.hqSide],
    [DARK_COLORS.factory, LIGHT_COLORS.factory]
  ]);
  const col = isLight ? colorSet[1] : colorSet[0];

  const mat = new THREE.MeshLambertMaterial({ color: col });
  const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), mat);
  body.position.set(px, height / 2, pz);
  body.castShadow = false;
  body.receiveShadow = false;
  body.userData.originalColor = isLight ? colorSet[0] : colorSet[0];
  body.userData.skylineDark = colorSet[0];
  body.userData.skylineLight = colorSet[1];
  group.add(body);

  // Cap / roof block for a bit of silhouette variety
  const capMat = new THREE.MeshLambertMaterial({ color: col });
  const cap = new THREE.Mesh(new THREE.BoxGeometry(width * 0.6, height * 0.08, depth * 0.6), capMat);
  cap.position.set(px, height + height * 0.04, pz);
  cap.userData.skylineDark = colorSet[0];
  cap.userData.skylineLight = colorSet[1];
  group.add(cap);

  // Sprinkle a few lit window squares so it isn't a flat silhouette
  const winCols = Math.max(2, Math.floor(width / 2.6));
  const winRows = Math.max(2, Math.floor(height / 4));
  const winMat = new THREE.MeshBasicMaterial({ color: 0xffe8a0, transparent: true, opacity: isLight ? 0.35 : 0.75 });
  for (let r = 0; r < winRows; r++) {
    for (let c = 0; c < winCols; c++) {
      if (rng.next() < 0.55) continue; // sparse, irregular windows
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.9), winMat.clone());
      const wx = px - width / 2 + (c + 0.5) * (width / winCols);
      const wy = 2 + r * (height / winRows);
      win.position.set(wx, wy, pz + depth / 2 + 0.02);
      win.userData.isSkylineWindow = true;
      group.add(win);
    }
  }

  return body;
}

// Scatters a ring/backdrop of distant skyline buildings around a chunk
// center, kept outside the playable footprint (radius >= minR) so they
// never block roads, gates or guard posts — just fill the horizon behind
// everything else.
function spawnSkylineBackdrop(group, rng, count, minR, maxR) {
  for (let i = 0; i < count; i++) {
    const ang = rng.range(0, Math.PI * 2);
    const dist = rng.range(minR, maxR);
    const px = Math.cos(ang) * dist;
    const pz = Math.sin(ang) * dist;
    spawnSkylineBuilding(group, px, pz, rng);
  }
}

// ── PROCEDURAL BUILDING TYPES ────────────────────────────────────────────────
function spawnCorporateBuilding(group, px, pz, rng) {
  const height = rng.range(22, 34);
  const width = rng.range(10, 14);
  const depth = rng.range(10, 14);
  createBox(width + 2, 4, depth + 2, DARK_COLORS.corporateTop, px, 2, pz, group);
  createBox(width, height, depth, DARK_COLORS.corporate, px, height / 2 + 4, pz, group);

  const glass = new THREE.Mesh(new THREE.PlaneGeometry(width - 1, height - 4), new THREE.MeshBasicMaterial({ color: DARK_COLORS.corpGlass, transparent: true, opacity: 0.55 }));
  glass.position.set(px, height / 2 + 4, pz + depth / 2 + 0.05);
  group.add(glass);

  createBox(width - 2, 2, depth - 2, DARK_COLORS.corporateTop, px, height + 5, pz, group);

  const bbox = new THREE.Box3(new THREE.Vector3(px - (width + 2) / 2, 0, pz - (depth + 2) / 2), new THREE.Vector3(px + (width + 2) / 2, height + 6, pz + (depth + 2) / 2));
  bbox.translate(group.position); // translate coordinates to global context
  return { bbox };
}

function spawnIndustrialBuilding(group, px, pz, rng) {
  const width = rng.range(13, 17);
  const height = rng.range(8, 12);
  const depth = rng.range(10, 14);
  createBox(width, height, depth, DARK_COLORS.factory, px, height / 2, pz, group);
  createBox(width + 0.6, 0.5, depth + 0.6, DARK_COLORS.factory, px, height + 0.25, pz, group);

  const chimHeight = rng.range(11, 15);
  createCylinder(0.5, 0.65, chimHeight, 8, DARK_COLORS.chimney, px - width / 3, chimHeight / 2, pz - depth / 3, group);
  createCylinder(0.5, 0.65, chimHeight + 2, 8, DARK_COLORS.chimney, px + width / 3, chimHeight / 2 + 1, pz - depth / 3, group);

  const tube = createCylinder(0.2, 0.2, width - 2, 6, DARK_COLORS.neonCyan, px, height - 1, pz + depth / 2 + 0.1, group);
  tube.rotation.z = Math.PI / 2;

  const bbox = new THREE.Box3(new THREE.Vector3(px - width / 2 - 0.5, 0, pz - depth / 2 - 0.5), new THREE.Vector3(px + width / 2 + 0.5, height + 1, pz + depth / 2 + 0.5));
  bbox.translate(group.position);
  return { bbox };
}

function spawnHQBuilding(group, px, pz, rng) {
  createBox(16, 4, 16, DARK_COLORS.hqAccent, px, 2, pz, group);
  createBox(13, 14, 13, DARK_COLORS.hqMain, px, 13, pz, group);
  createBox(10, 6, 10, DARK_COLORS.hqSide, px, 23, pz, group);

  [-1, 1].forEach(dx => {
    createBox(0.3, 24, 0.3, DARK_COLORS.neonPink, px + dx * 6.2, 12, pz + 6.2, group);
  });

  const bbox = new THREE.Box3(new THREE.Vector3(px - 8, 0, pz - 8), new THREE.Vector3(px + 8, 26, pz + 8));
  bbox.translate(group.position);
  return { bbox };
}

function spawnResidentialBuilding(group, px, pz, rng) {
  // Spawn a double cluster
  createBox(6, 4.5, 6, DARK_COLORS.house, px - 3.5, 2.25, pz, group);
  const r1 = new THREE.Mesh(new THREE.ConeGeometry(4.5, 2, 4), new THREE.MeshLambertMaterial({ color: DARK_COLORS.roof }));
  r1.position.set(px - 3.5, 5.5, pz); r1.rotation.y = Math.PI / 4; r1.castShadow = true; r1.userData.originalColor = DARK_COLORS.roof;
  group.add(r1);

  createBox(6, 4.5, 6, DARK_COLORS.house, px + 3.5, 2.25, pz + 1.5, group);
  const r2 = new THREE.Mesh(new THREE.ConeGeometry(4.5, 2, 4), new THREE.MeshLambertMaterial({ color: DARK_COLORS.roof }));
  r2.position.set(px + 3.5, 5.5, pz + 1.5); r2.rotation.y = Math.PI / 4; r2.castShadow = true; r2.userData.originalColor = DARK_COLORS.roof;
  group.add(r2);

  const bbox = new THREE.Box3(new THREE.Vector3(px - 7, 0, pz - 3.5), new THREE.Vector3(px + 7, 7, pz + 5));
  bbox.translate(group.position);
  return { bbox };
}

function spawnLabBuilding(group, px, pz, rng) {
  createCylinder(5.5, 6, 8, 8, DARK_COLORS.corporate, px, 4, pz, group);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(5.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: DARK_COLORS.neonPink, emissive: DARK_COLORS.neonPink, emissiveIntensity: 0.25 }));
  dome.position.set(px, 8, pz);
  dome.userData.originalColor = DARK_COLORS.neonPink;
  group.add(dome);

  const bbox = new THREE.Box3(new THREE.Vector3(px - 6.2, 0, pz - 6.2), new THREE.Vector3(px + 6.2, 13, pz + 6.2));
  bbox.translate(group.position);
  return { bbox };
}

// ── STATIONARY SENTINEL GUARD SPAWNER ─────────────────────────────────────────
function spawnStationaryGuard(group, gx, gz, facingAngle, chunkGuards) {
  const guard = new THREE.Group();
  guard.position.set(gx, 0, gz);
  guard.rotation.y = facingAngle;
  guard.scale.set(2, 2, 2);  
  group.add(guard);

  // Chassis base
  createCylinder(0.8, 0.8, 0.08, 12, DARK_COLORS.neonCyan, 0, 0.04, 0, guard);
  // Armor body
  createBox(0.6, 0.9, 0.3, 0x112233, 0, 0.6, 0, guard);
  createBox(0.5, 0.5, 0.1, 0x1e3a5f, 0, 0.7, 0.11, guard);
  // Head
  createBox(0.35, 0.35, 0.35, 0x223344, 0, 1.25, 0, guard);
  // Glowing pink eye visor
  createBox(0.26, 0.06, 0.05, DARK_COLORS.neonPink, 0, 1.3, 0.16, guard);
  createBox(0.38, 0.1, 0.38, 0x1e3a5f, 0, 1.45, 0, guard); // cap helmet

  // Head mounted visual light cone (volumetric mesh representation)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.25, 0.1);
  guard.add(headGroup);

  const coneGeo = new THREE.ConeGeometry(2, 12, 16, 1, true);
  const coneMat = new THREE.MeshBasicMaterial({ color: DARK_COLORS.neonCyan, transparent: true, opacity: 0.15, side: THREE.DoubleSide, depthWrite: false });
  const lightCone = new THREE.Mesh(coneGeo, coneMat);
  lightCone.rotation.x = Math.PI / 3.5; // angle scan downwards
  lightCone.position.set(0, -5, 3.5);
  lightCone.userData.originalColor = DARK_COLORS.neonCyan;
  headGroup.add(lightCone);

  // Spotlight sweep beam
  const sweep = new THREE.SpotLight(DARK_COLORS.neonCyan, 1.5, 18, Math.PI / 6, 0.5, 1);
  sweep.position.set(0, 0.05, 0.15);
  const target = new THREE.Object3D();
  target.position.set(0, -8, 6);
  headGroup.add(sweep);
  headGroup.add(target);
  sweep.target = target;

  chunkGuards.push({
    headGroup,
    phase: Math.random() * Math.PI * 2
  });
}

// ── GUARD PAIR SPAWNER — flanks an entrance with two sentinels ──────────────
function spawnGuardPair(group, gx, gz, facingAngle, chunkGuards, offset = 2.2) {
  // perpendicular to the facing direction, so guards stand on either side
  const perpX = Math.cos(facingAngle) * offset;
  const perpZ = -Math.sin(facingAngle) * offset;
  spawnStationaryGuard(group, gx - perpX, gz - perpZ, facingAngle, chunkGuards);
  spawnStationaryGuard(group, gx + perpX, gz + perpZ, facingAngle, chunkGuards);
}

// ── PLAYABLE GUARD CHARACTER (PLAYER) ─────────────────────────────────────────
const guardGroup = new THREE.Group();
scene.add(guardGroup);

function gb(w, h, d, col, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color: col }));
  m.position.set(x, y, z);
  m.castShadow = true;
  m.userData.originalColor = col;
  guardGroup.add(m);
  return m;
}

const bootL = gb(0.35, 0.4, 0.6, 0x0d1a2e, -0.15, 0.2, 0.05);
const bootR = gb(0.35, 0.4, 0.6, 0x0d1a2e, 0.15, 0.2, 0.05);
const legLP = new THREE.Group(); legLP.position.set(-0.13, 1.1, 0); guardGroup.add(legLP);
const legLM = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.8, 0.28), new THREE.MeshLambertMaterial({ color: 0x1a2540 }));
legLM.position.set(0, -0.4, 0); legLM.castShadow = true; legLM.userData.originalColor = 0x1a2540; legLP.add(legLM);

const legRP = new THREE.Group(); legRP.position.set(0.13, 1.1, 0); guardGroup.add(legRP);
const legRM = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.8, 0.28), new THREE.MeshLambertMaterial({ color: 0x1a2540 }));
legRM.position.set(0, -0.4, 0); legRM.castShadow = true; legRM.userData.originalColor = 0x1a2540; legRP.add(legRM);

const body = gb(0.72, 0.95, 0.42, 0x1e3a5f, 0, 1.67, 0);
gb(0.74, 0.1, 0.44, 0xD4AF37, 0, 1.27, 0);
const badge = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.18), new THREE.MeshBasicMaterial({ color: 0xD4AF37 }));
badge.position.set(0, 1.78, 0.22);
guardGroup.add(badge);

gb(0.22, 0.22, 0.44, 0x1e3a5f, -0.47, 2.08, 0);
gb(0.22, 0.22, 0.44, 0x1e3a5f, 0.47, 2.08, 0);

const armLP = new THREE.Group(); armLP.position.set(-0.47, 2.05, 0); guardGroup.add(armLP);
const armLM = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.72, 0.24), new THREE.MeshLambertMaterial({ color: 0x1e3a5f }));
armLM.position.set(0, -0.36, 0); armLM.castShadow = true; armLM.userData.originalColor = 0x1e3a5f; armLP.add(armLM);
const glL = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshLambertMaterial({ color: 0x0d1a2e }));
glL.position.set(0, -0.76, 0); glL.userData.originalColor = 0x0d1a2e; armLP.add(glL);

const armRP = new THREE.Group(); armRP.position.set(0.47, 2.05, 0); guardGroup.add(armRP);
const armRM = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.72, 0.24), new THREE.MeshLambertMaterial({ color: 0x1e3a5f }));
armRM.position.set(0, -0.36, 0); armRM.castShadow = true; armRM.userData.originalColor = 0x1e3a5f; armRP.add(armRM);
const glR = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshLambertMaterial({ color: 0x0d1a2e }));
glR.position.set(0, -0.76, 0); glR.userData.originalColor = 0x0d1a2e; armRP.add(glR);

gb(0.2, 0.28, 0.2, 0xc8a882, 0, 2.22, 0);
const headM = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 12), new THREE.MeshLambertMaterial({ color: 0xc8a882 }));
headM.position.set(0, 2.62, 0); headM.castShadow = true; headM.userData.originalColor = 0xc8a882; guardGroup.add(headM);

const capT = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.30, 0.15, 8), new THREE.MeshLambertMaterial({ color: 0x1e3a5f }));
capT.position.set(0, 2.92, 0); capT.userData.originalColor = 0x1e3a5f; guardGroup.add(capT);
const capB = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.05, 16), new THREE.MeshLambertMaterial({ color: 0x1e3a5f }));
capB.position.set(0, 2.82, 0.05); capB.userData.originalColor = 0x1e3a5f; guardGroup.add(capB);

const capBadge = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshLambertMaterial({ color: 0xD4AF37, emissive: 0xD4AF37, emissiveIntensity: 0.4 }));
capBadge.position.set(0, 2.88, 0.29);
guardGroup.add(capBadge);

[[-0.1, 2.66, 0.26], [0.1, 2.66, 0.26]].forEach(([x, y, z]) => {
  const e = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 6), new THREE.MeshLambertMaterial({ color: 0x111122 }));
  e.position.set(x, y, z);
  e.userData.originalColor = 0x111122;
  guardGroup.add(e);
});

const must = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.035, 0.04), new THREE.MeshLambertMaterial({ color: 0x3a2010 }));
must.position.set(0, 2.56, 0.27); must.userData.originalColor = 0x3a2010;
guardGroup.add(must);

// Walkie Talkie accessory
const walkieG = new THREE.Group();
walkieG.position.set(0, -0.82, 0);
armLP.add(walkieG);
const wBody = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 0.06), new THREE.MeshLambertMaterial({ color: 0x333333 }));
wBody.castShadow = true; wBody.userData.originalColor = 0x333333;
walkieG.add(wBody);
const wAnt = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.14, 4), new THREE.MeshLambertMaterial({ color: 0x888888 }));
wAnt.position.set(0.04, 0.18, 0);
walkieG.add(wAnt);
walkieG.visible = false;

// Flashlight accessory with volumetric Spotlight cone
const torchG = new THREE.Group();
torchG.position.set(0, -0.82, 0);
armRP.add(torchG);
const tBody = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.35, 8), new THREE.MeshLambertMaterial({ color: 0x888888 }));
tBody.castShadow = true; tBody.userData.originalColor = 0x888888;
torchG.add(tBody);
const torchHead = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.06, 0.1, 8), new THREE.MeshLambertMaterial({ color: 0xaaaaaa }));
torchHead.position.set(0, 0.22, 0);
torchG.add(torchHead);

// Player flashlight SpotLight
const playerSpot = new THREE.SpotLight(0xffffff, 4.0, 32, Math.PI / 5.5, 0.45, 1);
playerSpot.position.set(0, 0.22, 0);
playerSpot.castShadow = true;
playerSpot.shadow.mapSize.set(1024, 1024);
const playerSpotTarget = new THREE.Object3D();
playerSpotTarget.position.set(0, 6, 0); // Pointing forward from flashlight head
torchG.add(playerSpot);
torchG.add(playerSpotTarget);
playerSpot.target = playerSpotTarget;

// Start position
guardGroup.position.set(0, 0, 90);

// ── RIGID PHYSICS COLLISION DETECTOR ──────────────────────────────────────────
const playerRadius = 0.85;
const playerHeight = 3.0;

function checkCollisions(newPos) {
  // Build dynamic player AABB Box3
  const playerBox = new THREE.Box3(
    new THREE.Vector3(newPos.x - playerRadius, 0, newPos.z - playerRadius),
    new THREE.Vector3(newPos.x + playerRadius, playerHeight, newPos.z + playerRadius)
  );

  for (let i = 0; i < globalColliders.length; i++) {
    if (playerBox.intersectsBox(globalColliders[i])) {
      return true;
    }
  }
  return false;
}

// ── ORBIT CAMERA CONTROLS ─────────────────────────────────────────────────────
let orbitTheta = 0, orbitPhi = 0.45, orbitRadius = 38;
let isDrag = false, lastMX = 0, lastMY = 0;
const camSmooth = new THREE.Vector3(0, 0, 0);
let touchStart = null, pinchStart = null;

canvas.addEventListener('mousedown', e => { isDrag = true; lastMX = e.clientX; lastMY = e.clientY; });
window.addEventListener('mouseup', () => isDrag = false);
window.addEventListener('mousemove', e => {
  if (!isDrag) return;
  orbitTheta -= (e.clientX - lastMX) * 0.005;
  orbitPhi = Math.max(0.15, Math.min(1.4, orbitPhi - (e.clientY - lastMY) * 0.005));
  lastMX = e.clientX; lastMY = e.clientY;
});
canvas.addEventListener('wheel', e => {
  orbitRadius = Math.max(10, Math.min(60, orbitRadius + e.deltaY * 0.04));
}, { passive: true });

// Mobile touch mechanics (orbit & pinch zoom)
function distBetweenTouches(t) { return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY); }

canvas.addEventListener('touchstart', e => {
  if (e.touches.length === 1) {
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    isDrag = true; lastMX = e.touches[0].clientX; lastMY = e.touches[0].clientY;
  } else if (e.touches.length === 2) {
    pinchStart = distBetweenTouches(e.touches);
    isDrag = false;
  }
}, { passive: true });

canvas.addEventListener('touchmove', e => {
  if (e.touches.length === 1 && isDrag) {
    orbitTheta -= (e.touches[0].clientX - lastMX) * 0.006;
    orbitPhi = Math.max(0.15, Math.min(1.4, orbitPhi - (e.touches[0].clientY - lastMY) * 0.006));
    lastMX = e.touches[0].clientX; lastMY = e.touches[0].clientY;
  } else if (e.touches.length === 2 && pinchStart !== null) {
    const d = distBetweenTouches(e.touches);
    orbitRadius = Math.max(10, Math.min(60, orbitRadius - (d - pinchStart) * 0.05));
    pinchStart = d;
  }
}, { passive: true });

canvas.addEventListener('touchend', () => { isDrag = false; pinchStart = null; }, { passive: true });

// ── KEYBOARD EVENTS ───────────────────────────────────────────────────────────
const keys = {};
window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
});
window.addEventListener('keyup', e => {
  keys[e.code] = false;
});
window.addEventListener('blur', () => {
  for (const k in keys) {
    keys[k] = false;
  }
  if (joyActive) joyEnd();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    for (const k in keys) {
      keys[k] = false;
    }
    if (joyActive) joyEnd();
  }
});

// ── MOBILE JOYSTICK ───────────────────────────────────────────────────────────
const joyWrap = document.getElementById('joystickWrap');
const joyBase = document.getElementById('joystickBase');
const joyKnob = document.getElementById('joystickKnob');
const JOY_RADIUS = 33;
let joyActive = false;
let joyVec = { x: 0, y: 0 };
let joyId = null;

function joyStart(cx, cy) { joyActive = true; joyMove(cx, cy); }
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
function joyEnd() { joyActive = false; joyVec = { x: 0, y: 0 }; joyKnob.style.transform = 'translate(-50%,-50%)'; }

joyBase.addEventListener('touchstart', e => {
  e.stopPropagation(); e.preventDefault();
  joyId = e.changedTouches[0].identifier;
  joyStart(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
}, { passive: false });
joyBase.addEventListener('touchmove', e => {
  e.stopPropagation(); e.preventDefault();
  for (const t of e.changedTouches) {
    if (t.identifier === joyId) { joyMove(t.clientX, t.clientY); break; }
  }
}, { passive: false });
joyBase.addEventListener('touchend', e => {
  e.stopPropagation();
  for (const t of e.changedTouches) { if (t.identifier === joyId) { joyEnd(); break; } }
}, { passive: false });

joyBase.addEventListener('mousedown', e => { e.stopPropagation(); joyStart(e.clientX, e.clientY); });
window.addEventListener('mousemove', e => { if (joyActive) joyMove(e.clientX, e.clientY); });
window.addEventListener('mouseup', () => { if (joyActive) joyEnd(); });

// ── PATROL SECURITY ZONE CHECKER ──────────────────────────────────────────────
let activeZone = null;
let userClosedZoneId = null;
const securedZones = new Set();
let zoneTimer = null;
let zoneTimerEl = null;
const zoneLabel = document.getElementById('zoneLabel');
const infoPanel = document.getElementById('infoPanel');

function openZone(z) {
  if (userClosedZoneId === z.id) return;
  document.getElementById('ipIcon').textContent = z.icon;
  document.getElementById('ipTag').textContent = z.tag;
  document.getElementById('ipTitle').innerHTML = z.title;
  document.getElementById('ipText').innerHTML = z.text;
  document.getElementById('ipList').innerHTML = (z.list || []).map(l => `<li>${l}</li>`).join('');

  if (!isMobile()) {
    infoPanel.style.display = '';
    infoPanel.classList.remove('hidden');
    requestAnimationFrame(() => infoPanel.classList.add('visible'));
  }
  zoneLabel.textContent = z.label; zoneLabel.classList.add('visible');

  // Flashlight & walkie visibility depends on zone requirements
  torchG.visible = !isLight;
  walkieG.visible = z.walkie;
  if (!isLight) {
    ambient.intensity = z.night ? 0.3 : 0.8;
  }
  if (z.ring) z.ring.material.opacity = 0.65;
  if (z.sprite) z.sprite.scale.set(1, 1, 1);
  showSpeech(getSpeech(z.id));
}

function closeZone(prev, userInitiated = false) {
  infoPanel.classList.remove('visible');
  zoneLabel.classList.remove('visible');
  setTimeout(() => {
    if (!infoPanel.classList.contains('visible')) {
      infoPanel.classList.add('hidden');
    }
  }, 500);
  torchG.visible = !isLight;
  walkieG.visible = false;
  if (!isLight) {
    ambient.intensity = 0.8;
  }
  if (prev && prev.ring) prev.ring.material.opacity = 0.22;
  if (prev && prev.sprite) prev.sprite.scale.set(0, 0, 0);
  if (userInitiated && prev) userClosedZoneId = prev.id;
}

document.getElementById('ipClose').addEventListener('click', () => {
  closeZone(activeZone, true);
  activeZone = null;
});

// ── SPEECH SYNC ───────────────────────────────────────────────────────────────
let speechMesh = null, speechTm = null;
function showSpeech(text) {
  if (speechMesh) { guardGroup.remove(speechMesh); speechMesh = null; }
  clearTimeout(speechTm);
  const sc = document.createElement('canvas'); sc.width = 480; sc.height = 110;
  const cx = sc.getContext('2d');
  cx.fillStyle = 'rgba(7,17,31,0.95)'; cx.beginPath(); cx.roundRect(0, 0, 480, 110, 14); cx.fill();
  cx.strokeStyle = '#D4AF37'; cx.lineWidth = 3; cx.beginPath(); cx.roundRect(2, 2, 476, 106, 14); cx.stroke();
  cx.fillStyle = '#D4AF37'; cx.font = 'bold 28px Arial'; cx.textAlign = 'center'; cx.fillText(text, 240, 65);

  speechMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.96), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  speechMesh.position.set(0, 4.1, 0);
  guardGroup.add(speechMesh);
  speechTm = setTimeout(() => { if (speechMesh) { guardGroup.remove(speechMesh); speechMesh = null; } }, 3500);
}

function getSpeech(id) {
  if (id.startsWith('zone_')) return 'Securing sector outpost!';
  return {
    gate: 'Checking all access!',
    hq: 'Abhedya — Impenetrable!',
    corporate: 'Floor patrol active.',
    fire: 'Fire training certified!',
    nightwatch: 'Night watch on duty!',
    residential: 'Community secured!',
    industrial: 'Perimeter locked!'
  }[id] || 'On patrol!';
}

// ── PLAYER-CENTRIC MINI MAP ───────────────────────────────────────────────────
const mmC = document.getElementById('miniMapCanvas');
const mmCtx = mmC ? mmC.getContext('2d') : null;
const MMS = 130 / 120; // Scale factor: pixels per meter (120 meters viewport)

function drawMiniMap() {
  if (!mmCtx) return;
  mmCtx.fillStyle = isLight ? 'rgba(255,210,235,0.97)' : 'rgba(7,17,31,0.95)';
  mmCtx.fillRect(0, 0, 130, 130);

  const px = guardGroup.position.x;
  const pz = guardGroup.position.z;

  // Draw active zones relative to player coordinates
  activeZones.forEach(z => {
    const dx = z.position.x - px;
    const dz = z.position.z - pz;
    const mx = 130 / 2 + dx * MMS;
    const mz = 130 / 2 + dz * MMS;

    // Draw only if fits in mini map canvas viewport
    if (mx >= 0 && mx <= 130 && mz >= 0 && mz <= 130) {
      mmCtx.beginPath();
      mmCtx.arc(mx, mz, z.r * MMS, 0, Math.PI * 2);
      mmCtx.strokeStyle = isLight ? '#e91e63' : '#D4AF37';
      mmCtx.lineWidth = 1;
      mmCtx.globalAlpha = 0.55;
      mmCtx.stroke();
      mmCtx.fillStyle = isLight ? 'rgba(233,30,99,0.12)' : 'rgba(212,175,55,0.12)';
      mmCtx.fill();
      mmCtx.globalAlpha = 1;
    }
  });

  // Draw player sentinel in center (always centered)
  const gx = 130 / 2;
  const gz = 130 / 2;
  const grad = mmCtx.createRadialGradient(gx, gz, 0, gx, gz, 10);
  grad.addColorStop(0, isLight ? 'rgba(233,30,99,0.75)' : 'rgba(212,175,55,0.7)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');

  mmCtx.beginPath(); mmCtx.arc(gx, gz, 10, 0, Math.PI * 2); mmCtx.fillStyle = grad; mmCtx.fill();
  mmCtx.beginPath(); mmCtx.arc(gx, gz, 4, 0, Math.PI * 2); mmCtx.fillStyle = isLight ? '#e91e63' : '#D4AF37'; mmCtx.fill();

  mmCtx.save();
  mmCtx.translate(gx, gz);
  mmCtx.rotate(guardGroup.rotation.y + Math.PI);
  mmCtx.beginPath(); mmCtx.moveTo(0, -6); mmCtx.lineTo(-3, 2); mmCtx.lineTo(3, 2); mmCtx.closePath();
  mmCtx.fillStyle = '#fff'; mmCtx.fill();
  mmCtx.restore();
}

// ── INTERACTIVE OVERLAY PANELS ────────────────────────────────────────────────
let openPanelId = null;
function openPanel(id) {
  if (openPanelId && openPanelId !== id) {
    const prev = document.getElementById(openPanelId);
    if (prev) prev.classList.remove('open');
  }
  openPanelId = id;
  const p = document.getElementById(id); if (!p) return;
  requestAnimationFrame(() => requestAnimationFrame(() => p.classList.add('open')));
}
function closePanel(id) {
  const p = document.getElementById(id); if (!p) return;
  p.classList.remove('open');
  if (openPanelId === id) openPanelId = null;
  document.querySelectorAll('.bn-btn').forEach(b => b.classList.toggle('active', b.dataset.section === 'world'));
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
      if (openPanelId) { document.getElementById(openPanelId).classList.remove('open'); openPanelId = null; }
      return;
    }
    openPanel(sec + 'Panel');
  });
});

// ── CONTACT FORM VALIDATOR & REDIRECTOR ───────────────────────────────────────
document.getElementById('contactForm').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('sendBtn'), status = document.getElementById('formStatus');
  const name = document.getElementById('cf_name').value.trim();
  const phone = document.getElementById('cf_phone').value.trim();
  const email = document.getElementById('cf_email').value.trim();
  const service = document.getElementById('cf_service').value;
  const message = document.getElementById('cf_message').value.trim();

  if (!name || !phone || !message) {
    status.textContent = '⚠ Please fill in Name, Phone and Message.';
    status.className = 'form-status error';
    return;
  }
  btn.disabled = true; btn.textContent = 'Sending…'; status.textContent = ''; status.className = 'form-status';
  const params = { from_name: name, phone_number: phone, email_address: email || 'Not provided', service_required: service || 'Not specified', message, to_name: 'Abhedya Security' };

  try {
    if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
      status.textContent = ' Message sent! We will contact you within 24 hours.';
      status.className = 'form-status success'; e.target.reset();
    } else {
      const msg = encodeURIComponent(`Hello Abhedya Security!\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email || 'N/A'}\nService: ${service || 'N/A'}\nMessage: ${message}`);
      window.open(`https://wa.me/917666793286?text=${msg}`, '_blank');
      status.textContent = ' Redirected to WhatsApp with your details!';
      status.className = 'form-status success'; e.target.reset();
    }
  } catch (err) {
    status.textContent = '✗ Could not send. WhatsApp us: +91 76667 93286';
    status.className = 'form-status error';
  } finally { btn.disabled = false; btn.textContent = 'Send Request →'; }
});

// ── SYSTEM THEME CONTROLLER ───────────────────────────────────────────────────
let isLight = false;

function applyTheme(light) {
  isLight = light;
  // Crisp, slightly desaturated daytime sky-blue — avoids the hazy pink/lilac
  // cast and keeps distant buildings readable instead of fog-washed white.
  const skyCol = light ? 0x9fc3e0 : 0x0f1f38;
  renderer.setClearColor(skyCol);
  scene.fog.color.set(light ? 0xaed0ea : 0x0f1f38);
  scene.fog.near = light ? 70 : 55;
  scene.fog.far = light ? 280 : 200;

  // Sky objects
  stars.visible = !light;
  moonMesh.visible = !light;
  sunSphere.visible = light;

  // Lights — tuned down from their original blown-out values so daytime
  // keeps visible shading/contrast instead of flattening to white.
  ambient.color.set(light ? 0xeef2f6 : 0x223355);
  ambient.intensity = light ? 0.75 : 0.8;
  sun.color.set(light ? 0xfff4e0 : 0xfff5e0);
  sun.intensity = light ? 1.5 : 1.2;
  moonLight.intensity = light ? 0 : 0.6;

  // Flashlight visibility
  torchG.visible = !light;

  // Traverse and update colors for meshes in the main scene
  scene.traverse(child => {
    if (child.isMesh) {
      updateMeshColorForTheme(child, light);
    }
  });

  // Traverse loaded chunks to apply theme parameters
  loadedChunks.forEach(chunk => {
    applyThemeToGroup(chunk.group, light);
  });

  drawMiniMap();
}

function updateMeshColorForTheme(mesh, light) {
  if (!mesh.material || !mesh.material.color) return;

  // Decorative skyline buildings carry explicit dark/light hex pairs since
  // they're chosen randomly from a palette rather than a single fixed color.
  if (mesh.userData.skylineDark !== undefined) {
    mesh.material.color.setHex(light ? mesh.userData.skylineLight : mesh.userData.skylineDark);
    return;
  }

  if (mesh.userData.originalColor === undefined) {
    mesh.userData.originalColor = mesh.material.color.getHex();
  }

  const orig = mesh.userData.originalColor;
  let targetHex = orig;

  const map = {
    [DARK_COLORS.ground]: LIGHT_COLORS.ground,
    [DARK_COLORS.gridA]: LIGHT_COLORS.gridA,
    [DARK_COLORS.gridB]: LIGHT_COLORS.gridB,
    [DARK_COLORS.hqMain]: LIGHT_COLORS.hqMain,
    [DARK_COLORS.hqAccent]: LIGHT_COLORS.hqAccent,
    [DARK_COLORS.hqSide]: LIGHT_COLORS.hqSide,
    [DARK_COLORS.corporate]: LIGHT_COLORS.corporate,
    [DARK_COLORS.corporateTop]: LIGHT_COLORS.corporateTop,
    [DARK_COLORS.corpGlass]: LIGHT_COLORS.corpGlass,
    [DARK_COLORS.booth]: LIGHT_COLORS.booth,
    [DARK_COLORS.fire]: LIGHT_COLORS.fire,
    [DARK_COLORS.tower]: LIGHT_COLORS.tower,
    [DARK_COLORS.towerTop]: LIGHT_COLORS.towerTop,
    [DARK_COLORS.house]: LIGHT_COLORS.house,
    [DARK_COLORS.roof]: LIGHT_COLORS.roof,
    [DARK_COLORS.factory]: LIGHT_COLORS.factory,
    [DARK_COLORS.chimney]: LIGHT_COLORS.chimney,
    [DARK_COLORS.trunk]: LIGHT_COLORS.trunk,
    [DARK_COLORS.treetop]: LIGHT_COLORS.treetop,
    [DARK_COLORS.treetop2]: LIGHT_COLORS.treetop2,
    [DARK_COLORS.treetop3]: LIGHT_COLORS.treetop3,
    [DARK_COLORS.grassPatch]: LIGHT_COLORS.grassPatch,
    [DARK_COLORS.grassBlade]: LIGHT_COLORS.grassBlade,
    [DARK_COLORS.bush]: LIGHT_COLORS.bush,
    [DARK_COLORS.neonPink]: LIGHT_COLORS.neonPink,
    [DARK_COLORS.neonCyan]: LIGHT_COLORS.neonCyan,
    [DARK_COLORS.neonYellow]: LIGHT_COLORS.neonYellow,
  };

  if (light) {
    if (map[orig] !== undefined) targetHex = map[orig];
  }

  mesh.material.color.setHex(targetHex);
}

function applyThemeToGroup(group, light) {
  group.traverse(child => {
    if (child.isMesh) {
      updateMeshColorForTheme(child, light);
      if (child.userData.isSkylineWindow && child.material) {
        child.material.opacity = light ? 0.35 : 0.75;
      }
    } else if (child.isLineSegments && child.userData.isGrid) {
      const mat = child.material;
      const cA = light ? LIGHT_COLORS.gridA : DARK_COLORS.gridA;
      const cB = light ? LIGHT_COLORS.gridB : DARK_COLORS.gridB;
      if (Array.isArray(mat)) {
        mat[0].color.set(cA); mat[1].color.set(cB);
        mat.forEach(m => { m.transparent = true; m.opacity = light ? 0.32 : 0.55; });
      } else if (mat) {
        mat.color.set(cA);
        mat.transparent = true;
        mat.opacity = light ? 0.32 : 0.55;
      }
    } else if (child.isPointLight || child.isSpotLight) {
      // Don't switch global spotlights / player pointlights
      if (child === sun || child === ambient || child === moonLight || child === guardLight || child === guardFill || child === spot) {
        return;
      }
      if (child.userData.originalIntensity === undefined) {
        child.userData.originalIntensity = child.intensity;
      }
      child.intensity = light ? 0.05 : child.userData.originalIntensity;
    }
  });
}

document.getElementById('themeToggle').addEventListener('click', () => {
  applyTheme(!isLight);
  document.getElementById('themeToggle').textContent = isLight ? '🌙' : '☀️';
  document.body.classList.toggle('light', isLight);
});

// ── TIMER / SECURING SYSTEM ──────────────────────────────────────────────────
function startZoneTimer(z, elapsed) {
  cancelZoneTimer();
  zoneTimer = { zone: z, startTime: elapsed, duration: 2.0 };

  const el = document.createElement('div');
  el.id = 'zoneTimerUI';
  el.innerHTML = `
    <svg viewBox="0 0 88 88" width="88" height="88">
      <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="6"/>
      <circle class="zt-arc" cx="44" cy="44" r="36" fill="none"
        stroke="#${z.lc.toString(16).padStart(6, '0')}"
        stroke-width="6" stroke-linecap="round"
        stroke-dasharray="${2 * Math.PI * 36}"
        stroke-dashoffset="${2 * Math.PI * 36}"
        transform="rotate(-90 44 44)"
        style="transition:stroke-dashoffset 0.05s linear"/>
      <text x="44" y="50" text-anchor="middle" fill="white"
        font-family="monospace" font-size="14" font-weight="bold">SEC</text>
    </svg>
    <div class="zt-label">SECURING…</div>
  `;
  document.body.appendChild(el);
  zoneTimerEl = el;
}

function cancelZoneTimer() {
  zoneTimer = null;
  if (zoneTimerEl) { zoneTimerEl.remove(); zoneTimerEl = null; }
}

function completeZoneTimer() {
  const z = zoneTimer.zone;
  cancelZoneTimer();
  securedZones.add(z.id);

  // Door opening animation trigger for Gate
  if (z.id === 'gate') {
    if (gateRoadCollider) {
      const idx = globalColliders.indexOf(gateRoadCollider);
      if (idx !== -1) globalColliders.splice(idx, 1);
      gateRoadCollider = null;
    }
  }

  showSpeech('✅ ' + z.label.replace(/🚪|🏛|🔥|🏢|🌙|🏠|🏭/g, '').trim().toUpperCase() + ' SECURED!');

  const flash = document.createElement('div');
  flash.style.cssText = 'position:fixed;inset:0;z-index:340;pointer-events:none;background:radial-gradient(circle,rgba(0,255,136,0.18) 0%,transparent 70%);animation:flashGreen 0.8s ease forwards;';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 900);

  showSecuredBadge(z);
}

function showSecuredBadge(z) {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;left:50%;bottom:95px;transform:translateX(-50%);z-index:350;pointer-events:none;background:rgba(0,255,136,0.15);border:2px solid #00ff88;border-radius:12px;padding:8px 20px;font-family:monospace;font-size:13px;letter-spacing:2px;color:#00ff88;text-transform:uppercase;text-shadow:0 0 10px rgba(0,255,136,0.7);backdrop-filter:blur(8px);animation:ztFadeIn 0.3s ease;box-shadow:0 0 20px rgba(0,255,136,0.3);';
  el.textContent = ' SITE SECURED';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

// ── MAIN ANIMATION LOOP ───────────────────────────────────────────────────────
const clock = new THREE.Clock();
let walkCycle = 0, frameN = 0;

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.getElapsedTime();
  frameN++;

  // 1. Move Player
  let moving = false;
  const dir = new THREE.Vector3();

  if (keys['ArrowUp']    || keys['KeyW']) { dir.z -= 1; }
  if (keys['ArrowDown']  || keys['KeyS']) { dir.z += 1; }
  if (keys['ArrowLeft']  || keys['KeyA']) { dir.x -= 1; }
  if (keys['ArrowRight'] || keys['KeyD']) { dir.x += 1; }

  if (joyActive && (Math.abs(joyVec.x) > 0.08 || Math.abs(joyVec.y) > 0.08)) {
    dir.x += joyVec.x;
    dir.z += joyVec.y;
  }

  if (dir.lengthSq() > 0.001) {
    moving = true;
  }

  if (moving) {
    // Rotate movement vector relative to orbit camera rotation angle
    dir.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), orbitTheta);
    const spd = 6.0;

    const stepX = dir.x * spd * delta;
    const stepZ = dir.z * spd * delta;

    const oldPos = guardGroup.position.clone();
    const nextPos = oldPos.clone().add(new THREE.Vector3(stepX, 0, stepZ));

    // AABB Collision check with slide mechanism
    if (!checkCollisions(nextPos)) {
      guardGroup.position.copy(nextPos);
    } else {
      const slideX = oldPos.clone().add(new THREE.Vector3(stepX, 0, 0));
      if (!checkCollisions(slideX)) {
        guardGroup.position.copy(slideX);
      } else {
        const slideZ = oldPos.clone().add(new THREE.Vector3(0, 0, stepZ));
        if (!checkCollisions(slideZ)) {
          guardGroup.position.copy(slideZ);
        }
      }
    }

    guardGroup.rotation.y = Math.atan2(dir.x, dir.z);
    walkCycle += delta * 9;
  }

  // 2. Animate Player limbs
  if (moving) {
    const sw = Math.sin(walkCycle) * 0.55;
    legLP.rotation.x = sw; legRP.rotation.x = -sw;
    armLP.rotation.x = -sw * 0.7; armRP.rotation.x = sw * 0.7;
    bootL.position.z = Math.sin(walkCycle) * 0.1; bootR.position.z = -Math.sin(walkCycle) * 0.1;
    body.position.y = 1.67 + Math.abs(Math.sin(walkCycle * 2)) * 0.02;
  } else {
    const br = Math.sin(elapsed * 1.4) * 0.012;
    body.position.y = 1.67 + br;
    legLP.rotation.x = 0; legRP.rotation.x = 0;
    armLP.rotation.x = 0; armRP.rotation.x = 0;
    bootL.position.z = 0; bootR.position.z = 0;
    armLP.rotation.z = 0.05 + Math.sin(elapsed * 0.8) * 0.02;
    armRP.rotation.z = -0.05 - Math.sin(elapsed * 0.8) * 0.02;
  }

  // 3. Player Light Sources tracking
  guardLight.position.set(guardGroup.position.x, guardGroup.position.y + 3, guardGroup.position.z);
  guardFill.position.set(guardGroup.position.x, guardGroup.position.y + 5, guardGroup.position.z);
  
  const inNightZone = activeZone && activeZone.night;
  guardLight.intensity = (moving ? (1.6 + Math.abs(Math.sin(walkCycle * 2)) * 0.6) : (1.5 + Math.sin(elapsed * 1.2) * 0.3)) * (isLight ? 0.4 : 1.0);
  guardLight.distance = inNightZone ? 20 : 14;
  guardFill.intensity = (inNightZone ? 0.9 : 0.5) * (isLight ? 0.35 : 1.0);

  // 4. Update dynamic chunk loading window
  updateChunks(guardGroup.position.x, guardGroup.position.z);

  // 5. Animate Sentinels sweeping searchlights in loaded chunks
  loadedChunks.forEach(chunk => {
    chunk.guards.forEach(g => {
      g.headGroup.rotation.y = Math.sin(elapsed * 1.8 + g.phase) * 0.45;
    });
  });

  // 6. Smooth Gate Door Opening if secured
  if (securedZones.has('gate')) {
    if (gateLeftDoor && gateLeftDoor.position.x > -12.5) {
      gateLeftDoor.position.x -= delta * 5.5;
    }
    if (gateRightDoor && gateRightDoor.position.x < 12.5) {
      gateRightDoor.position.x += delta * 5.5;
    }
  }

  // 7. Watchtower searchlight tracking / sweep
  if (spot && spot.parent) {
    spot.intensity = 2.0 + Math.sin(elapsed * 0.5) * 0.35;
    const dist = guardGroup.position.distanceTo(spot.position);
    if (dist < 45) {
      spot.target.position.copy(guardGroup.position);
    } else {
      // Sweep sweep cycle
      spot.target.position.set(spot.position.x + Math.sin(elapsed * 0.6) * 12, 0, spot.position.z + Math.cos(elapsed * 0.6) * 12);
    }
  }

  // 8. Static elements animations (Fire zone flames & smoke)
  activeFlames.forEach((fm, i) => {
    fm.scale.y = 0.8 + Math.sin(elapsed * 9 + i * 1.7) * 0.25;
    fm.position.y = 1.8 + i * 0.2 + Math.sin(elapsed * 11 + i) * 0.06;
    fm.rotation.y += 0.06;
  });

  if (activeSmoke) {
    const sa = activeSmoke.geometry.attributes.position;
    const count = sa.count;
    for (let s = 0; s < count; s++) {
      sa.array[s * 3 + 1] += 0.028;
      if (sa.array[s * 3 + 1] > 24) sa.array[s * 3 + 1] = 14;
      sa.array[s * 3] += Math.sin(elapsed * 0.8 + s) * 0.0035;
    }
    sa.needsUpdate = true;
  }

  // 9. Floating labels & Speech bubbles rotation lock to camera
  if (speechMesh) speechMesh.rotation.y = -guardGroup.rotation.y + orbitTheta;
  activeZones.forEach(z => {
    if (z.sprite && z.sprite.scale.x > 0) z.sprite.rotation.y = orbitTheta;
  });

  // 10. Update circular timer progress
  if (zoneTimer && zoneTimerEl) {
    const prog = Math.min(1, (elapsed - zoneTimer.startTime) / zoneTimer.duration);
    const circ = 2 * Math.PI * 36;
    const dashOffset = circ * (1 - prog);
    const arc = zoneTimerEl.querySelector('.zt-arc');
    if (arc) arc.style.strokeDashoffset = dashOffset;
    if (prog >= 1) completeZoneTimer();
  }

  // 11. Security Zone detection checks
  let nearest = null, nd = Infinity;
  activeZones.forEach(z => {
    const d = guardGroup.position.distanceTo(z.position);
    if (d < z.r && d < nd) { nd = d; nearest = z; }
  });

  if (nearest !== activeZone) {
    if (nearest) {
      closeZone(activeZone);
      cancelZoneTimer();
      activeZone = nearest;
      openZone(nearest);
      if (!securedZones.has(nearest.id)) startZoneTimer(nearest, elapsed);
    } else {
      userClosedZoneId = null;
      cancelZoneTimer();
      closeZone(activeZone);
      activeZone = null;
    }
  }

  // 12. Security zone indicators animation
  activeZones.forEach((z, i) => {
    if (z.ring) {
      if (securedZones.has(z.id)) {
        z.ring.material.color.set(0x00ff88);
        z.ring.material.opacity = 0.55 + Math.sin(elapsed * 1.5 + i) * 0.1;
      } else {
        z.ring.material.color.set(z.lc);
        z.ring.material.opacity = (activeZone === z ? 0.62 : 0.18) + Math.sin(elapsed * 2 + i) * 0.08;
      }
      z.ring.rotation.z += 0.004;
    }
    if (z.zlight) {
      if (securedZones.has(z.id)) {
        z.zlight.color.set(0x00ff88);
        z.zlight.intensity = 1.2 + Math.sin(elapsed * 2 + i) * 0.2;
      } else {
        z.zlight.color.set(z.lc);
        z.zlight.intensity = z.li * (0.85 + Math.sin(elapsed * 3 + i) * 0.15);
      }
    }
  });

  // 13. Camera orbital positioning
  camSmooth.lerp(guardGroup.position, 0.06);
  camera.position.set(
    camSmooth.x + orbitRadius * Math.sin(orbitTheta) * Math.cos(orbitPhi),
    camSmooth.y + orbitRadius * Math.sin(orbitPhi),
    camSmooth.z + orbitRadius * Math.cos(orbitTheta) * Math.cos(orbitPhi)
  );
  camera.lookAt(camSmooth.x, camSmooth.y + 1.5, camSmooth.z);

  // 14. Sky rotations
  moonMesh.rotation.y += 0.0008;

  // 15. Render minimap & viewport
  if (frameN % 3 === 0) drawMiniMap();
  renderer.render(scene, camera);
}

// ── INITIALIZE WORLD ──────────────────────────────────────────────────────────
updateChunks(0, 90);
setTimeout(() => showSpeech(isMobile() ? 'Waddle to the gate! ' : 'Walk to the gate! '), 2000);
animate();

} catch (err) {
  console.error('Scene error:', err);
  startWorld();
}
