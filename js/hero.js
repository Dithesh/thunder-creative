// Kinetic-type hero rendered with three.js.
// Every word / image is a subdivided plane; a shared vertex shader ripples them in world
// space so the whole composition waves as one surface (like the reference reel).
import * as THREE from 'three';

const gsap = window.gsap;

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uWave;
  uniform float uPhase;
  uniform vec2  uMouse;
  uniform float uHover;
  varying vec2  vUv;
  varying float vShade;
  void main() {
    vUv = uv;
    vec3 p = position;
    vec4 w = modelMatrix * vec4(p, 1.0);
    float a = sin(w.x * 0.0042 + uTime * 1.35 + uPhase);
    float b = cos(w.x * 0.0019 - uTime * 0.85 + uPhase * 1.7);
    p.z += (a * 34.0 + b * 20.0) * uWave;
    p.y += sin(w.x * 0.0031 + uTime * 1.05 + uPhase) * 12.0 * uWave;
    float d = distance(w.xy, uMouse);
    p.z += exp(-(d * d) / 52000.0) * 110.0 * uHover;
    vShade = a * 0.5 + 0.5;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uReveal;
  uniform float uOpacity;
  uniform float uShift;
  uniform float uIsText;
  uniform float uRaw;
  uniform vec3  uTint;
  uniform vec2  uCover;
  uniform vec2  uPan;
  varying vec2  vUv;
  varying float vShade;
  void main() {
    if (vUv.y > uReveal) discard;
    vec2 uv = (vUv - 0.5) * uCover + 0.5 + uPan;
    vec2 s = vec2(uShift, 0.0);
    vec4 c = texture2D(uMap, uv);
    float shade = 0.82 + 0.18 * vShade;
    if (uIsText > 0.5) {
      float ar = texture2D(uMap, uv + s).a;
      float ab = texture2D(uMap, uv - s).a;
      vec3 col = mix(uTint * vec3(max(ar, c.a * 0.4), c.a, max(ab, c.a * 0.4)), c.rgb, uRaw);
      gl_FragColor = vec4(col * shade, max(max(ar, ab), c.a) * uOpacity);
    } else {
      vec3 col = vec3(texture2D(uMap, uv + s).r, c.g, texture2D(uMap, uv - s).b);
      gl_FragColor = vec4(col * shade, uOpacity);
    }
  }
`;

const P_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform float uRange;
  uniform float uPR;
  attribute float aSize;
  attribute float aRed;
  varying float vRed;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    float depth = (p.z + 600.0) / 900.0;
    p.y = mod(p.y + uScroll * (0.25 + depth * 0.5) + uTime * (6.0 + depth * 14.0), uRange) - uRange * 0.5;
    p.x += sin(uTime * 0.3 + p.y * 0.004) * 18.0;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPR * (900.0 / -mv.z);
    vRed = aRed;
    vAlpha = 0.25 + depth * 0.55;
  }
`;
const P_FRAG = /* glsl */ `
  varying float vRed;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    vec3 col = mix(vec3(0.95, 0.94, 0.92), vec3(0.92, 0.08, 0.08), vRed);
    gl_FragColor = vec4(col, a * vAlpha * 0.55);
  }
`;

const WHITE = new THREE.Color(0.953, 0.941, 0.918);
const RED = new THREE.Color(0.918, 0.075, 0.075);
const FONT = 'Archivo';
const STRETCH = 1.14; // horizontal stretch for an "expanded" look on canvas

function textTexture(text, fs, dpr) {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  ctx.font = `italic 900 ${fs}px ${FONT}`;
  const tw = ctx.measureText(text).width * STRETCH;
  const padX = fs * 0.22, padY = fs * 0.12;
  const w = tw + padX * 2, h = fs * 0.86 + padY * 2;
  const scale = Math.min(dpr, 4096 / w);
  c.width = Math.ceil(w * scale); c.height = Math.ceil(h * scale);
  ctx.scale(scale, scale);
  ctx.font = `italic 900 ${fs}px ${FONT}`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#fff';
  ctx.save();
  ctx.translate(padX, padY + fs * 0.76);
  ctx.scale(STRETCH, 1);
  ctx.fillText(text, 0, 0);
  ctx.restore();
  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return { tex, w, h };
}

function boltTexture(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const k = size / 256;
  ctx.scale(k, k);
  ctx.translate(128, 128); ctx.scale(0.78, 0.78); ctx.translate(-128, -128);
  const pts = [[123.1,116.07],[65.65,72.23],[65.65,256],[132.9,139.16],[190.35,183.77],[190.35,0]];
  ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
  ctx.lineJoin = 'round'; ctx.lineWidth = 20; ctx.strokeStyle = '#f3f0ea'; ctx.stroke();
  ctx.fillStyle = '#ea1313'; ctx.fill();
  const tex = new THREE.CanvasTexture(c); tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter;
  return tex;
}

function squiggleTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const ctx = c.getContext('2d');
  ctx.strokeStyle = '#f3f0ea'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(40, 220); ctx.bezierCurveTo(90, 150, 160, 190, 150, 120);
  ctx.bezierCurveTo(140, 60, 200, 70, 220, 30);
  ctx.stroke();
  const tex = new THREE.CanvasTexture(c); tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter;
  return tex;
}

export async function createHero(canvas, { reducedMotion = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setClearColor(0x070707, 1);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 1, 6000);
  const heroGroup = new THREE.Group();
  scene.add(heroGroup);

  const shared = {
    uTime: { value: 0 },
    uWave: { value: reducedMotion ? 0.25 : 1 },
    uMouse: { value: new THREE.Vector2(9999, 9999) },
    uHover: { value: 0 },
  };

  const loader = new THREE.TextureLoader();
  const [imgA, imgB] = await Promise.all([
    loader.loadAsync('assets/img/toyota-ad.jpg'),
    loader.loadAsync('assets/img/chings.jpg'),
  ]);
  [imgA, imgB].forEach((t) => { t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; });
  const bolt = boltTexture(512);
  const squiggle = squiggleTexture();
  await document.fonts.load(`italic 900 200px ${FONT}`);

  const makeMaterial = (map, { isText = false, raw = false, tint = WHITE, phase = 0, cover = [1, 1] } = {}) =>
    new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false,
      uniforms: {
        ...shared,
        uMap: { value: map }, uReveal: { value: 0 }, uOpacity: { value: 1 }, uShift: { value: 0 },
        uIsText: { value: isText ? 1 : 0 }, uRaw: { value: raw ? 1 : 0 }, uTint: { value: tint.clone() }, uPhase: { value: phase },
        uCover: { value: new THREE.Vector2(...cover) }, uPan: { value: new THREE.Vector2() },
      },
    });

  let items = []; // { mesh, kind, base:{x,y,rz,ry}, spread }
  let W = 0, H = 0;

  function cover(planeW, planeH, tex) {
    const ia = tex.image.width / tex.image.height, pa = planeW / planeH;
    return pa > ia ? [1, ia / pa] : [pa / ia, 1];
  }

  function clear() {
    items.forEach(({ mesh, ownTex }) => {
      heroGroup.remove(mesh); mesh.geometry.dispose(); mesh.material.dispose();
      if (ownTex) mesh.material.uniforms.uMap.value.dispose();
    });
    items = [];
  }

  function build() {
    clear();
    const mobile = W < 760;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const LINES = [
      { text: 'WE CAUSE', frac: mobile ? 0.9 : 0.66, tint: WHITE },
      { text: 'CREATIVE', frac: mobile ? 0.84 : 0.5, tint: WHITE },
      { text: 'STORMS', frac: mobile ? 0.92 : 0.7, tint: RED },
    ];
    const probe = document.createElement('canvas').getContext('2d');
    probe.font = `italic 900 100px ${FONT}`;
    let sizes = LINES.map((l) => (100 * Math.min(l.frac * W, 1700)) / (probe.measureText(l.text).width * STRETCH));
    const stackH = sizes.reduce((s, f) => s + f * 0.8, 0);
    const maxH = H * (mobile ? 0.5 : 0.7);
    if (stackH > maxH) sizes = sizes.map((f) => (f * maxH) / stackH);

    // stack lines top → bottom, tightly overlapped
    const total = sizes.reduce((s, f) => s + f * 0.8, 0);
    let y = total / 2 + H * (mobile ? 0.02 : -0.01);
    const lineBoxes = [];
    LINES.forEach((l, i) => {
      const fs = sizes[i];
      const { tex, w, h } = textTexture(l.text, fs, dpr);
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 96, 12), makeMaterial(tex, { isText: true, tint: l.tint, phase: i * 0.6 }));
      const cy = y - fs * 0.4;
      // nudge lines slightly off-centre so the stack reads as hand-set, like the reference
      const cx = mobile ? 0 : [-W * 0.015, W * 0.035, 0][i];
      mesh.position.set(cx, cy, i * 2);
      heroGroup.add(mesh);
      items.push({ mesh, kind: 'line', ownTex: true, i, base: { x: cx, y: cy, rz: 0, ry: 0 } });
      lineBoxes.push({ x: cx, y: cy, w: w - fs * 0.44, h: fs * 0.8, fs });
      y -= fs * 0.8;
    });

    // tilted image panels slotted into the type
    const [L1, L2, L3] = lineBoxes;
    const panels = mobile
      ? [
          { tex: imgA, w: W * 0.34, h: W * 0.26, x: -W * 0.27, y: L1.y + L1.h * 1.75, rz: 0.06, ry: 0.35 },
          { tex: imgB, w: W * 0.28, h: W * 0.32, x: W * 0.28, y: L3.y - L3.h * 1.75, rz: -0.07, ry: -0.35 },
        ]
      : [
          { tex: imgA, w: L2.h * 2.05, h: L2.h * 1.55, x: L2.x - L2.w / 2 - L2.h * 1.35, y: (L2.y + L3.y) / 2 + L2.h * 0.1, rz: 0.05, ry: 0.42 },
          { tex: imgB, w: L2.h * 1.25, h: L2.h * 1.6, x: L2.x + L2.w / 2 + L2.h * 0.8, y: (L2.y + L3.y) / 2 + L2.h * 0.18, rz: -0.06, ry: -0.42 },
        ];
    panels.forEach((p, k) => {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(p.w, p.h, 32, 32), makeMaterial(p.tex, { phase: 1 + k, cover: cover(p.w, p.h, p.tex) }));
      mesh.position.set(p.x, p.y, -10);
      mesh.rotation.set(0, p.ry, p.rz);
      heroGroup.add(mesh);
      items.push({ mesh, kind: 'img', k, base: { x: p.x, y: p.y, rz: p.rz, ry: p.ry } });
    });

    // brand bolt perched on the end of line 1 + a hand-drawn squiggle
    const bs = L1.fs * 1.05;
    const boltMesh = new THREE.Mesh(new THREE.PlaneGeometry(bs, bs, 8, 8), makeMaterial(bolt, { isText: true, raw: true, phase: 2 }));
    const bx = L1.x + L1.w / 2 + bs * (mobile ? -0.25 : 0.05), by = L1.y + L1.h * (mobile ? 1.05 : 0.42);
    boltMesh.position.set(bx, by, 20);
    heroGroup.add(boltMesh);
    items.push({ mesh: boltMesh, kind: 'bolt', base: { x: bx, y: by, rz: -0.15, ry: 0 } });

    const ss = L2.h * 1.1;
    const sq = new THREE.Mesh(new THREE.PlaneGeometry(ss, ss), makeMaterial(squiggle, { isText: true, tint: WHITE, phase: 3 }));
    const sx = mobile ? -W * 0.36 : L3.x + L3.w / 2 + ss * 0.45, sy = mobile ? L3.y - L3.h * 1.2 : L3.y + L3.h * 0.3;
    sq.position.set(sx, sy, 10);
    heroGroup.add(sq);
    items.push({ mesh: sq, kind: 'squiggle', ownTex: false, base: { x: sx, y: sy, rz: 0, ry: 0 } });
  }

  // ---------- particles ----------
  let particles;
  function buildParticles() {
    if (particles) { scene.remove(particles); particles.geometry.dispose(); particles.material.dispose(); }
    const n = W < 760 ? 260 : 620;
    const pos = new Float32Array(n * 3), size = new Float32Array(n), red = new Float32Array(n);
    const range = H * 2.4;
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * W * 1.6;
      pos[i * 3 + 1] = Math.random() * range;
      pos[i * 3 + 2] = -600 + Math.random() * 900;
      size[i] = 1.5 + Math.random() * 3.5;
      red[i] = Math.random() < 0.14 ? 1 : 0;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    g.setAttribute('aRed', new THREE.BufferAttribute(red, 1));
    particles = new THREE.Points(g, new THREE.ShaderMaterial({
      vertexShader: P_VERT, fragmentShader: P_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: shared.uTime, uScroll: { value: 0 }, uRange: { value: range }, uPR: { value: renderer.getPixelRatio() } },
    }));
    particles.frustumCulled = false;
    scene.add(particles);
  }

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.position.z = (H / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    camera.far = camera.position.z * 4;
    camera.updateProjectionMatrix();
    build();
    buildParticles();
    if (introStarted) items.forEach(({ mesh }) => (mesh.material.uniforms.uReveal.value = 1));
  }

  // ---------- state driven from main.js ----------
  const state = { scroll: 0, vel: 0, mx: 0, my: 0, tmx: 0, tmy: 0, hover: 0 };
  let introDone = false, introStarted = false;

  window.addEventListener('pointermove', (e) => {
    state.tmx = (e.clientX / W) * 2 - 1;
    state.tmy = (e.clientY / H) * 2 - 1;
    state.hover = 1;
  });
  document.addEventListener('pointerleave', () => (state.hover = 0));

  let resizeT;
  window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(resize, 180); });
  resize();

  function intro() {
    introStarted = true;
    const tl = gsap.timeline({ onComplete: () => (introDone = true) });
    items.forEach((it, idx) => {
      const u = it.mesh.material.uniforms;
      if (it.kind === 'line') {
        it.mesh.position.y = it.base.y - 160;
        tl.to(u.uReveal, { value: 1, duration: 1.3, ease: 'expo.out' }, 0.1 + it.i * 0.12)
          .to(it.mesh.position, { y: it.base.y, duration: 1.4, ease: 'expo.out' }, 0.1 + it.i * 0.12);
      } else {
        u.uReveal.value = 1;
        it.mesh.scale.setScalar(0.001);
        tl.to(it.mesh.scale, { x: 1, y: 1, z: 1, duration: 1.4, ease: 'elastic.out(1, 0.6)' }, 0.55 + idx * 0.05);
      }
    });
    shared.uWave.value = reducedMotion ? 0.25 : 3;
    tl.to(shared.uWave, { value: reducedMotion ? 0.25 : 1, duration: 2.4, ease: 'power3.out' }, 0);
    return tl;
  }

  const clock = new THREE.Clock();
  function tick() {
    const t = clock.getElapsedTime();
    if (!reducedMotion) shared.uTime.value = t;
    state.mx += (state.tmx - state.mx) * 0.06;
    state.my += (state.tmy - state.my) * 0.06;
    shared.uHover.value += ((reducedMotion ? 0 : state.hover) - shared.uHover.value) * 0.05;

    const p = Math.min(state.scroll / H, 1.4); // 0 → hero fully on screen, 1 → scrolled past
    heroGroup.visible = p < 1.3;
    heroGroup.position.y = state.scroll;
    heroGroup.rotation.x = state.my * 0.1 + p * 0.5;
    heroGroup.rotation.y = state.mx * 0.16;
    shared.uMouse.value.set(state.mx * W * 0.5, -state.my * H * 0.5);

    const shift = THREE.MathUtils.clamp(state.vel * 0.00025, -0.03, 0.03);
    state.vel *= 0.9;

    items.forEach((it) => {
      const u = it.mesh.material.uniforms;
      u.uShift.value = shift;
      u.uOpacity.value = 1 - THREE.MathUtils.smoothstep(p, 0.55, 1.05);
      if (!introDone && it.kind === 'line') return;
      const dir = it.kind === 'line' ? (it.i % 2 ? 1 : -1) : it.base.x < 0 ? -1 : 1;
      const tx = it.base.x + dir * p * W * 0.35;
      const ty = it.base.y + (it.kind === 'line' ? 0 : p * 140);
      it.mesh.position.x += (tx - it.mesh.position.x) * 0.12;
      it.mesh.position.y += (ty - it.mesh.position.y) * 0.12;
      if (it.kind === 'img') {
        it.mesh.rotation.z = it.base.rz + Math.sin(t * 0.8 + it.k) * 0.02 + dir * p * 0.3;
        u.uPan.value.set(-state.mx * 0.03, state.my * 0.03);
      }
      if (it.kind === 'bolt') it.mesh.rotation.z = it.base.rz + Math.sin(t * 2.2) * 0.12;
      if (it.kind === 'squiggle') it.mesh.rotation.z = Math.sin(t * 1.4) * 0.1;
    });

    particles.material.uniforms.uScroll.value = state.scroll;
    renderer.render(scene, camera);
  }
  gsap.ticker.add(tick);

  return {
    intro,
    setScroll(y, velocity) { state.scroll = y; state.vel = velocity; },
  };
}
