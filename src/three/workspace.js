import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

/*
 * Stylised 3D workspace: desk, monitor, MacBook-style laptop and iPhone-style phone.
 * Toon shading with inverted-hull outlines keeps it in line with the site's neo-brutalist look.
 * Screens are live canvas textures: the laptop types code, the monitor "hot reloads" the page
 * being built, and the phone pops a build notification.
 */

const OUTLINE = 0.014;
const INK = '#111111';

const PALETTE = {
  wood: 0xe0a96d,
  woodDark: 0xb7794a,
  metal: 0xc9ccd3,
  metalDark: 0x8b9099,
  graphite: 0x2b2d33,
  phone: 0x3a3f4b,
  mat: 0x22252c,
  pot: 0xff3366,
  leaf: 0x34c759,
  leafDark: 0x1f9e45,
  mug: 0xfde047,
  coffee: 0x5b3a1e,
  note: [0xfde047, 0x67e8f9, 0xf9a8d4],
  lamp: 0x111111,
};

const CODE_LINES = [
  "import { useState } from 'react';",
  "import { motion } from './anim';",
  '',
  'export default function Hero() {',
  '  const [coffee, setCoffee] = useState(3);',
  '',
  '  return (',
  '    <section className="hero brutal">',
  '      <h1>Build. Ship. Repeat.</h1>',
  '      <p>Full-stack apps, IoT & ML.</p>',
  '      <button onClick={() => setCoffee(c => c + 1)}>',
  '        Coffee #{coffee}',
  '      </button>',
  '      <ProjectGrid items={projects} />',
  '    </section>',
  '  );',
  '}',
];

const KEYWORDS = new Set(['import', 'from', 'export', 'default', 'function', 'const', 'return']);
const TOKEN_RE = /('[^']*'?|"[^"]*"?|\s+|[A-Za-z_$][\w$]*|\d+|.)/g;

function tokenColor(token, prev) {
  if (KEYWORDS.has(token)) return '#c792ea';
  if (/^['"]/.test(token)) return '#c3e88d';
  if (/^\d/.test(token)) return '#f78c6c';
  if (/^[A-Z]/.test(token)) return '#ffcb6b';
  if (prev === '<' || prev === '</') return '#f07178';
  if (/^[{}()[\]]$/.test(token)) return '#89ddff';
  if (/^[<>/=+#&.,;:]$/.test(token)) return '#89ddff';
  if (/^\w/.test(token)) return '#82aaff';
  return '#d6deeb';
}

const TOTAL_CHARS = CODE_LINES.reduce((n, line) => n + line.length + 1, 0);

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function makeScreen(width, height, renderer) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return { canvas, ctx, texture };
}

/* ---------- Screen painters ---------- */

function drawCode(ctx, w, h, typed, cursorOn) {
  ctx.fillStyle = '#1e2130';
  ctx.fillRect(0, 0, w, h);

  // Title bar
  ctx.fillStyle = '#161825';
  ctx.fillRect(0, 0, w, 44);
  ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(26 + i * 24, 22, 7, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = '#8a91b4';
  ctx.font = '600 18px Menlo, Consolas, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('fikri-rivandi — Hero.jsx', w / 2, 29);
  ctx.textAlign = 'left';

  // Sidebar
  ctx.fillStyle = '#181a28';
  ctx.fillRect(0, 44, 200, h - 44);
  ctx.font = '16px Menlo, Consolas, monospace';
  const files = ['▾ src', '  ▾ components', '    Hero.jsx', '    About.jsx', '    Projects.jsx', '  App.jsx', '  data.js', 'package.json'];
  files.forEach((f, i) => {
    const active = f.includes('Hero');
    if (active) {
      ctx.fillStyle = '#2a2f4a';
      ctx.fillRect(0, 60 + i * 30 - 20, 200, 28);
    }
    ctx.fillStyle = active ? '#ffffff' : '#7d84a8';
    ctx.fillText(f, 14, 60 + i * 30);
  });

  // Tab
  ctx.fillStyle = '#1e2130';
  ctx.fillRect(200, 44, w - 200, 40);
  ctx.fillStyle = '#272b40';
  ctx.fillRect(200, 44, 150, 40);
  ctx.fillStyle = '#ff3366';
  ctx.fillRect(200, 81, 150, 3);
  ctx.fillStyle = '#e6e9f5';
  ctx.font = '16px Menlo, Consolas, monospace';
  ctx.fillText('Hero.jsx', 230, 70);

  // Code
  const lineH = 30;
  const top = 120;
  ctx.font = '19px Menlo, Consolas, monospace';
  let remaining = typed;
  let cursor = null;
  CODE_LINES.forEach((line, i) => {
    const y = top + i * lineH;
    ctx.fillStyle = '#4b5272';
    ctx.textAlign = 'right';
    ctx.fillText(String(i + 1), 250, y);
    ctx.textAlign = 'left';
    if (remaining <= 0) return;
    const visible = line.slice(0, Math.max(0, Math.min(line.length, remaining)));
    remaining -= line.length + 1;
    let x = 272;
    let prev = '';
    for (const token of visible.match(TOKEN_RE) ?? []) {
      ctx.fillStyle = tokenColor(token, prev);
      ctx.fillText(token, x, y);
      x += ctx.measureText(token).width;
      if (token.trim()) prev = token;
    }
    cursor = { x, y };
  });
  if (cursor && cursorOn) {
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(cursor.x + 1, cursor.y - 19, 3, 24);
  }

  // Status bar
  ctx.fillStyle = '#ff3366';
  ctx.fillRect(0, h - 30, w, 30);
  ctx.fillStyle = '#111';
  ctx.font = '600 15px Menlo, Consolas, monospace';
  ctx.fillText('⎇ neo-brutalism   ✓ 0 problems', 14, h - 10);
  ctx.textAlign = 'right';
  ctx.fillText('JavaScript JSX   UTF-8', w - 14, h - 10);
  ctx.textAlign = 'left';
}

function brutalBox(ctx, x, y, w, h, fill, shadow = 6) {
  ctx.fillStyle = INK;
  ctx.fillRect(x + shadow, y + shadow, w, h);
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
  ctx.lineWidth = 4;
  ctx.strokeStyle = INK;
  ctx.strokeRect(x, y, w, h);
}

function drawWeb(ctx, w, h, progress, mouse, toast) {
  ctx.fillStyle = '#e8e8ea';
  ctx.fillRect(0, 0, w, h);

  // Browser chrome
  ctx.fillStyle = '#d5d6da';
  ctx.fillRect(0, 0, w, 58);
  ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(28 + i * 26, 29, 8, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, 140, 13, w - 280, 32, 16);
  ctx.fill();
  ctx.fillStyle = '#5f6370';
  ctx.font = '500 17px "Space Grotesk", Arial, sans-serif';
  ctx.fillText('localhost:5173', 166, 35);

  // Page
  const px = 0;
  const py = 58;
  ctx.fillStyle = '#f4f4f0';
  ctx.fillRect(px, py, w, h - py);

  // Nav
  ctx.fillStyle = INK;
  ctx.font = '800 30px "Space Grotesk", Arial, sans-serif';
  ctx.fillText('Fikri', 50, py + 52);
  ctx.fillStyle = '#ff3366';
  ctx.fillText('.', 50 + ctx.measureText('Fikri').width, py + 52);
  ctx.fillStyle = INK;
  ctx.font = '700 18px "Space Grotesk", Arial, sans-serif';
  ['ABOUT', 'WORK', 'CONTACT'].forEach((l, i) => ctx.fillText(l, w - 420 + i * 110, py + 48));
  ctx.fillRect(0, py + 80, w, 4);

  // Hero heading
  if (progress > 0.45) {
    ctx.font = '900 84px "Space Grotesk", Arial, sans-serif';
    ctx.fillStyle = INK;
    ctx.fillText('BUILD. SHIP.', 50, py + 190);
    const word = 'REPEAT.';
    const wx = 50;
    const wy = py + 280;
    const ww = ctx.measureText(word).width;
    ctx.fillStyle = '#fde047';
    ctx.fillRect(wx - 8, wy - 72, ww + 16, 88);
    ctx.fillStyle = INK;
    ctx.fillText(word, wx, wy);
  } else {
    ctx.fillStyle = '#d4d4cf';
    ctx.fillRect(50, py + 120, 520, 70);
    ctx.fillRect(50, py + 210, 380, 70);
  }

  if (progress > 0.55) {
    ctx.font = '600 26px "Space Grotesk", Arial, sans-serif';
    ctx.fillStyle = '#333';
    ctx.fillText('Full-stack apps, IoT & ML.', 50, py + 340);
  }

  if (progress > 0.68) {
    const coffee = progress > 0.92 ? 4 : 3;
    brutalBox(ctx, 50, py + 380, 290, 70, '#ff3366');
    ctx.fillStyle = INK;
    ctx.font = '800 26px "Space Grotesk", Arial, sans-serif';
    ctx.fillText(`COFFEE #${coffee}`, 88, py + 425);
  }

  // Side art block
  brutalBox(ctx, w - 520, py + 130, 440, 330, '#67e8f9', 10);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(w - 490, py + 160, 380, 270);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.strokeRect(w - 490, py + 160, 380, 270);
  // simple chart inside
  const bars = [0.4, 0.7, 0.55, 0.9, 0.65, 1];
  bars.forEach((b, i) => {
    const bh = 200 * b * Math.min(1, progress * 1.4);
    brutalBox(ctx, w - 465 + i * 60, py + 410 - bh, 40, bh, i % 2 ? '#fde047' : '#ff3366', 0);
  });

  // Project cards
  if (progress > 0.82) {
    const colors = ['#f9a8d4', '#a3e635', '#fde047', '#67e8f9'];
    const cw = (w - 100 - 3 * 30) / 4;
    colors.forEach((c, i) => {
      brutalBox(ctx, 50 + i * (cw + 30), py + 510, cw, 150, c);
      ctx.fillStyle = INK;
      ctx.fillRect(70 + i * (cw + 30), py + 540, cw * 0.6, 14);
      ctx.fillRect(70 + i * (cw + 30), py + 570, cw * 0.4, 10);
    });
  }

  // HMR toast
  if (toast > 0) {
    ctx.globalAlpha = Math.min(1, toast * 3);
    brutalBox(ctx, w - 380, h - 100, 330, 56, '#a3e635', 5);
    ctx.fillStyle = INK;
    ctx.font = '700 20px "Space Grotesk", Arial, sans-serif';
    ctx.fillText('⚡ hmr update /Hero.jsx', w - 362, h - 64);
    ctx.globalAlpha = 1;
  }

  // Mouse pointer
  ctx.save();
  ctx.translate(mouse.x, mouse.y);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 34);
  ctx.lineTo(9, 26);
  ctx.lineTo(16, 40);
  ctx.lineTo(22, 37);
  ctx.lineTo(15, 23);
  ctx.lineTo(27, 23);
  ctx.closePath();
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.restore();
}

function drawPhone(ctx, w, h, banner) {
  ctx.fillStyle = '#f4f4f0';
  ctx.fillRect(0, 0, w, h);

  // Status bar + Dynamic Island
  ctx.fillStyle = INK;
  ctx.font = '700 24px "Space Grotesk", Arial, sans-serif';
  ctx.fillText('9:41', 46, 52);
  ctx.fillRect(w - 92, 34, 44, 20);
  roundRect(ctx, w / 2 - 70, 22, 140, 40, 20);
  ctx.fill();

  // App header
  ctx.font = '900 44px "Space Grotesk", Arial, sans-serif';
  ctx.fillText('Tasks', 36, 140);
  brutalBox(ctx, w - 100, 98, 60, 60, '#ff3366', 4);
  ctx.fillStyle = INK;
  ctx.fillRect(w - 80, 125, 20, 6);
  ctx.fillRect(w - 73, 118, 6, 20);

  const items = [
    ['Fix navbar ARIA', '#a3e635', true],
    ['Ship 3D workspace', '#fde047', false],
    ['Pet the cat', '#f9a8d4', false],
    ['Deploy to VPS', '#67e8f9', false],
  ];
  items.forEach(([label, color, done], i) => {
    const y = 190 + i * 120;
    brutalBox(ctx, 36, y, w - 80, 96, color, 5);
    ctx.fillStyle = '#fff';
    ctx.fillRect(56, y + 30, 36, 36);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.strokeRect(56, y + 30, 36, 36);
    if (done) {
      ctx.beginPath();
      ctx.moveTo(62, y + 48);
      ctx.lineTo(72, y + 58);
      ctx.lineTo(88, y + 36);
      ctx.stroke();
    }
    ctx.fillStyle = INK;
    ctx.font = '700 26px "Space Grotesk", Arial, sans-serif';
    ctx.fillText(label, 110, y + 58);
  });

  // Tab bar
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, h - 110, w, 110);
  ctx.fillStyle = INK;
  ctx.fillRect(0, h - 110, w, 4);
  [0, 1, 2].forEach((i) => {
    const cx = w / 6 + (i * w) / 3;
    brutalBox(ctx, cx - 22, h - 82, 44, 44, i === 0 ? '#ff3366' : '#fff', 3);
  });
  roundRect(ctx, w / 2 - 70, h - 22, 140, 8, 4);
  ctx.fill();

  // Build notification banner
  if (banner > 0) {
    const y = -120 + banner * 200;
    brutalBox(ctx, 24, y, w - 56, 100, '#ffffff', 5);
    brutalBox(ctx, 44, y + 22, 56, 56, '#a3e635', 0);
    ctx.fillStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(56, y + 50);
    ctx.lineTo(68, y + 62);
    ctx.lineTo(88, y + 38);
    ctx.stroke();
    ctx.font = '800 24px "Space Grotesk", Arial, sans-serif';
    ctx.fillText('Build passed', 118, y + 46);
    ctx.font = '500 20px "Space Grotesk", Arial, sans-serif';
    ctx.fillStyle = '#444';
    ctx.fillText('deploy ready · 12s', 118, y + 76);
  }
}

/* ---------- Scene ---------- */

export function createWorkspace(container, { reducedMotion = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(27, 1, 0.1, 60);
  const cameraBase = new THREE.Vector3(3.6, 3.5, 4.6);
  const lookAt = new THREE.Vector3(-0.05, 0.4, -0.1);

  // Toon shading ramp
  const ramp = new THREE.DataTexture(new Uint8Array([110, 190, 255]), 3, 1, THREE.RedFormat);
  ramp.minFilter = THREE.NearestFilter;
  ramp.magFilter = THREE.NearestFilter;
  ramp.needsUpdate = true;

  const materials = new Map();
  const toon = (color) => {
    if (!materials.has(color)) materials.set(color, new THREE.MeshToonMaterial({ color, gradientMap: ramp }));
    return materials.get(color);
  };
  const outlineMat = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });

  const withOutline = (mesh, sx, sy, sz) => {
    const hull = new THREE.Mesh(mesh.geometry, outlineMat);
    hull.scale.set(sx, sy, sz);
    mesh.add(hull);
    return mesh;
  };

  function box(w, h, d, color, { radius, outline = OUTLINE, parent = scene } = {}) {
    const min = Math.min(w, h, d);
    const r = Math.min(radius ?? min * 0.3, min / 2 - 1e-4);
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), toon(color));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    if (outline) withOutline(mesh, (w + 2 * outline) / w, (h + 2 * outline) / h, (d + 2 * outline) / d);
    parent.add(mesh);
    return mesh;
  }

  function cylinder(rTop, rBottom, h, color, { parent = scene, outline = OUTLINE, segments = 28, open = false } = {}) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, h, segments, 1, open), toon(color));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    if (outline) {
      const r = Math.max(rTop, rBottom);
      withOutline(mesh, (r + outline) / r, (h + 2 * outline) / h, (r + outline) / r);
    }
    parent.add(mesh);
    return mesh;
  }

  function screen(w, h, texture, parent) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }),
    );
    parent.add(mesh);
    return mesh;
  }

  // Lights
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8cbb8, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(2.5, 6, 3.5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -3;
  sun.shadow.camera.right = 3;
  sun.shadow.camera.top = 3;
  sun.shadow.camera.bottom = -3;
  sun.shadow.bias = -0.0008;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);

  // Floor shadow catcher
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.18 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.12;
  floor.receiveShadow = true;
  scene.add(floor);

  /* Desk (top surface at y = 0) */
  const desk = new THREE.Group();
  scene.add(desk);
  box(3.6, 0.1, 1.7, PALETTE.wood, { parent: desk, radius: 0.03 }).position.y = -0.05;
  [[-1.65, -0.7], [1.65, -0.7], [-1.65, 0.7], [1.65, 0.7]].forEach(([x, z]) => {
    box(0.1, 1.02, 0.1, PALETTE.graphite, { parent: desk, radius: 0.02 }).position.set(x, -0.61, z);
  });
  box(3.2, 0.08, 0.06, PALETTE.graphite, { parent: desk, radius: 0.02 }).position.set(0, -0.9, -0.7);

  // Desk mat
  const mat = box(1.9, 0.012, 0.75, PALETTE.mat, { parent: desk, radius: 0.005, outline: 0.008 });
  mat.position.set(0.1, 0.006, 0.28);

  /* Monitor */
  const webScreen = makeScreen(1280, 760, renderer);
  const monitor = new THREE.Group();
  monitor.position.set(0.1, 0, -0.5);
  monitor.rotation.y = 0.12;
  desk.add(monitor);
  box(0.6, 0.03, 0.34, PALETTE.metal, { parent: monitor, radius: 0.012 }).position.set(0, 0.015, 0.02);
  box(0.12, 0.62, 0.05, PALETTE.metal, { parent: monitor, radius: 0.02 }).position.set(0, 0.33, -0.06);
  const panel = box(1.86, 1.1, 0.05, PALETTE.graphite, { parent: monitor, radius: 0.02 });
  panel.position.set(0, 0.95, 0);
  screen(1.78, 1.02, webScreen.texture, panel).position.z = 0.027;
  // Sticky notes on the bezel
  PALETTE.note.forEach((color, i) => {
    const note = box(0.14, 0.14, 0.006, color, { parent: panel, radius: 0.002, outline: 0.006 });
    note.position.set(0.98, 0.3 - i * 0.17, 0.03);
    note.rotation.z = (i - 1) * 0.12;
  });

  /* Laptop (MacBook style) */
  const codeScreen = makeScreen(1100, 690, renderer);
  const laptop = new THREE.Group();
  laptop.position.set(-1.05, 0.012, 0.18);
  laptop.rotation.y = 0.5;
  desk.add(laptop);
  const base = box(1.1, 0.035, 0.74, PALETTE.metal, { parent: laptop, radius: 0.015 });
  base.position.y = 0.0175;
  // Keyboard well and trackpad
  const keys = new THREE.Group();
  keys.position.set(0, 0.036, -0.07);
  base.parent.add(keys);
  const keyMat = toon(PALETTE.graphite);
  const keyGeo = new RoundedBoxGeometry(0.062, 0.008, 0.055, 2, 0.003);
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 13; col += 1) {
      const key = new THREE.Mesh(keyGeo, keyMat);
      key.position.set(-0.42 + col * 0.07, 0, -0.17 + row * 0.068);
      keys.add(key);
    }
  }
  const space = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.008, 0.055, 2, 0.003), keyMat);
  space.position.set(0, 0, -0.17 + 5 * 0.068);
  keys.add(space);
  box(0.42, 0.004, 0.2, PALETTE.metalDark, { parent: laptop, radius: 0.002, outline: 0.004 }).position.set(0, 0.036, 0.24);
  // Lid, hinged at the back edge
  const hinge = new THREE.Group();
  hinge.position.set(0, 0.035, -0.37);
  hinge.rotation.x = -0.22;
  laptop.add(hinge);
  const lid = box(1.1, 0.72, 0.02, PALETTE.metal, { parent: hinge, radius: 0.01 });
  lid.position.set(0, 0.36, 0);
  const bezel = new THREE.Mesh(new THREE.PlaneGeometry(1.06, 0.68), new THREE.MeshBasicMaterial({ color: 0x0b0c10 }));
  bezel.position.z = 0.0105;
  lid.add(bezel);
  screen(1.0, 0.627, codeScreen.texture, lid).position.set(0, -0.005, 0.011);

  /* Keyboard + mouse for the monitor */
  const kb = box(0.95, 0.03, 0.3, 0xf4f4f0, { parent: desk, radius: 0.012 });
  kb.position.set(0.15, 0.027, 0.3);
  kb.rotation.x = 0.03;
  const kbKeys = new THREE.Mesh(
    new THREE.PlaneGeometry(0.88, 0.24),
    new THREE.MeshToonMaterial({ color: 0xd8d8d2, gradientMap: ramp }),
  );
  kbKeys.rotation.x = -Math.PI / 2;
  kbKeys.position.y = 0.0155;
  kb.add(kbKeys);
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 14; col += 1) {
      const key = new THREE.Mesh(keyGeo, toon(row === 0 && col < 2 ? 0xff3366 : 0xffffff));
      key.scale.set(0.85, 1, 0.85);
      key.position.set(-0.4 + col * 0.0615, 0.02, -0.09 + row * 0.06);
      kb.add(key);
    }
  }
  const mouse = new THREE.Mesh(new THREE.SphereGeometry(0.07, 24, 16), toon(0xf4f4f0));
  mouse.scale.set(0.75, 0.38, 1.1);
  mouse.position.set(0.85, 0.028, 0.32);
  mouse.castShadow = true;
  withOutline(mouse, 1.18, 1.3, 1.12);
  desk.add(mouse);

  /* Phone (iPhone style) on a stand */
  const phoneScreen = makeScreen(440, 920, renderer);
  const phoneStand = new THREE.Group();
  phoneStand.position.set(1.12, 0, -0.05);
  phoneStand.rotation.y = -0.35;
  desk.add(phoneStand);
  box(0.34, 0.03, 0.26, PALETTE.graphite, { parent: phoneStand, radius: 0.01 }).position.y = 0.015;
  const standBack = box(0.3, 0.32, 0.03, PALETTE.graphite, { parent: phoneStand, radius: 0.01 });
  standBack.position.set(0, 0.16, -0.08);
  standBack.rotation.x = -0.3;
  box(0.3, 0.05, 0.05, PALETTE.graphite, { parent: phoneStand, radius: 0.01 }).position.set(0, 0.055, 0.06);
  const phone = box(0.34, 0.7, 0.035, PALETTE.phone, { parent: phoneStand, radius: 0.016 });
  phone.position.set(0, 0.4, -0.02);
  phone.rotation.x = -0.28;
  const phoneGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.68), new THREE.MeshBasicMaterial({ color: 0x050507 }));
  phoneGlass.position.z = 0.0181;
  phone.add(phoneGlass);
  screen(0.305, 0.66, phoneScreen.texture, phone).position.z = 0.0185;

  /* Mug with steam */
  const mug = new THREE.Group();
  mug.position.set(-0.25, 0, 0.52);
  desk.add(mug);
  cylinder(0.1, 0.09, 0.22, PALETTE.mug, { parent: mug }).position.y = 0.11;
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.088, 24), toon(PALETTE.coffee));
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.y = 0.2;
  mug.add(coffee);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.018, 10, 20), toon(PALETTE.mug));
  handle.position.set(0.11, 0.11, 0);
  handle.castShadow = true;
  withOutline(handle, 1.12, 1.12, 1.6);
  mug.add(handle);
  const steamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false });
  const steam = [0, 1, 2].map((i) => {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), steamMat.clone());
    puff.userData.offset = i / 3;
    mug.add(puff);
    return puff;
  });

  /* Plant */
  const plant = new THREE.Group();
  plant.position.set(-1.5, 0, 0.6);
  desk.add(plant);
  cylinder(0.14, 0.11, 0.24, PALETTE.pot, { parent: plant }).position.y = 0.12;
  const leaves = [];
  for (let i = 0; i < 7; i += 1) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), toon(i % 2 ? PALETTE.leaf : PALETTE.leafDark));
    const angle = (i / 7) * Math.PI * 2;
    leaf.scale.set(0.55, 1.6, 0.3);
    leaf.position.set(Math.cos(angle) * 0.07, 0.38 + (i % 3) * 0.04, Math.sin(angle) * 0.07);
    leaf.rotation.set(Math.sin(angle) * 0.6, -angle, Math.cos(angle) * -0.6);
    leaf.castShadow = true;
    withOutline(leaf, 1.2, 1.08, 1.4);
    leaf.userData.base = leaf.rotation.z;
    plant.add(leaf);
    leaves.push(leaf);
  }

  /* Desk lamp */
  const lamp = new THREE.Group();
  lamp.position.set(1.45, 0, -0.6);
  desk.add(lamp);
  cylinder(0.14, 0.15, 0.03, PALETTE.lamp, { parent: lamp }).position.y = 0.015;
  const arm = box(0.035, 0.7, 0.035, PALETTE.lamp, { parent: lamp, radius: 0.012 });
  arm.position.set(0, 0.37, 0);
  arm.rotation.z = 0.25;
  const shade = cylinder(0.05, 0.14, 0.16, 0xff3366, { parent: lamp });
  shade.position.set(-0.2, 0.72, 0.02);
  shade.rotation.z = 0.9;
  const bulbLight = new THREE.PointLight(0xffd27a, 1.2, 2.2, 2);
  bulbLight.position.set(-0.3, 0.6, 0.05);
  lamp.add(bulbLight);

  /* ---------- Animation state ---------- */
  let typed = reducedMotion ? TOTAL_CHARS : 0;
  let holdTimer = 0;
  let lastPaint = -1;
  let pointerX = 0;
  let pointerY = 0;
  let camX = 0;
  let camY = 0;
  let frame = 0;
  let running = false;
  let lastTime = 0;
  let elapsed = 0;

  const paint = (time) => {
    const progress = typed / TOTAL_CHARS;
    const cursorOn = reducedMotion || Math.floor(time * 2) % 2 === 0;
    drawCode(codeScreen.ctx, codeScreen.canvas.width, codeScreen.canvas.height, typed, cursorOn);
    codeScreen.texture.needsUpdate = true;

    const mouseX = 760 + Math.sin(time * 0.7) * 260;
    const mouseY = 470 + Math.sin(time * 1.1) * 140;
    const toast = progress >= 1 ? Math.max(0, 1 - holdTimer / 2.5) : 0;
    drawWeb(webScreen.ctx, webScreen.canvas.width, webScreen.canvas.height, progress, { x: mouseX, y: mouseY }, toast);
    webScreen.texture.needsUpdate = true;

    const cycle = time % 8;
    const banner = reducedMotion ? 0 : cycle < 0.4 ? cycle / 0.4 : cycle < 3 ? 1 : cycle < 3.4 ? 1 - (cycle - 3) / 0.4 : 0;
    drawPhone(phoneScreen.ctx, phoneScreen.canvas.width, phoneScreen.canvas.height, banner);
    phoneScreen.texture.needsUpdate = true;
  };

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = container;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Pull the camera back on narrow (portrait) frames so the whole desk fits.
    camera.zoom = Math.min(1, camera.aspect / 1.25);
    camera.updateProjectionMatrix();
  };

  const updateCamera = () => {
    camX += (pointerX - camX) * 0.05;
    camY += (pointerY - camY) * 0.05;
    camera.position.set(cameraBase.x + camX * 0.6, cameraBase.y + camY * 0.35, cameraBase.z - camX * 0.25);
    camera.lookAt(lookAt);
  };

  const tick = (now) => {
    if (!running) return;
    frame = requestAnimationFrame(tick);
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    elapsed += dt;

    if (typed < TOTAL_CHARS) {
      typed = Math.min(TOTAL_CHARS, typed + dt * 22);
    } else {
      holdTimer += dt;
      if (holdTimer > 6) {
        typed = 0;
        holdTimer = 0;
      }
    }

    if (elapsed - lastPaint > 1 / 24) {
      paint(elapsed);
      lastPaint = elapsed;
    }

    steam.forEach((puff) => {
      const t = (elapsed * 0.45 + puff.userData.offset) % 1;
      puff.position.set(Math.sin((t + puff.userData.offset) * 6) * 0.03, 0.25 + t * 0.4, 0);
      puff.scale.setScalar(0.6 + t * 1.2);
      puff.material.opacity = 0.55 * (1 - t);
    });
    leaves.forEach((leaf, i) => {
      leaf.rotation.z = leaf.userData.base + Math.sin(elapsed * 1.3 + i) * 0.04;
    });

    updateCamera();
    renderer.render(scene, camera);
  };

  const onPointerMove = (event) => {
    const rect = container.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointerY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
  };
  const onPointerLeave = () => {
    pointerX = 0;
    pointerY = 0;
  };

  const renderStill = () => {
    paint(0);
    camera.position.copy(cameraBase);
    camera.lookAt(lookAt);
    steam.forEach((puff) => {
      puff.visible = false;
    });
    renderer.render(scene, camera);
  };

  const resizeObserver = new ResizeObserver(() => {
    resize();
    if (!running) renderStill();
  });
  resizeObserver.observe(container);
  resize();

  if (!reducedMotion) {
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerleave', onPointerLeave);
  }

  // Repaint once web fonts are ready so canvas text uses Space Grotesk.
  document.fonts?.ready.then(() => {
    if (!running) renderStill();
  });
  renderStill();

  return {
    setActive(active) {
      if (reducedMotion || active === running) return;
      running = active;
      if (running) {
        steam.forEach((puff) => {
          puff.visible = true;
        });
        lastTime = performance.now();
        frame = requestAnimationFrame(tick);
      } else {
        cancelAnimationFrame(frame);
      }
    },
    dispose() {
      running = false;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => {
          if (!m) return;
          if (m.map) m.map.dispose();
          m.dispose();
        });
      });
      ramp.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
