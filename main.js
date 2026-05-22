import * as THREE from 'three';
import { GLTFLoader } from './vendor/loaders/GLTFLoader.js';
import { OrbitControls } from './vendor/controls/OrbitControls.js';
import { EffectComposer } from './vendor/postprocessing/EffectComposer.js';
import { RenderPass } from './vendor/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './vendor/postprocessing/UnrealBloomPass.js';
import { FilmPass } from './vendor/postprocessing/FilmPass.js';
import { OutputPass } from './vendor/postprocessing/OutputPass.js';

window.__SCENE_READY = false;
window.__SCENE_ERROR = '';

const stage = document.querySelector('#stage');
const loadState = document.querySelector('#load-state');
const railCount = document.querySelector('#rail-count');
const railPrev = document.querySelector('#rail-prev');
const railNext = document.querySelector('#rail-next');

const scene = new THREE.Scene();
window.__THREE_SCENE = scene;
scene.background = new THREE.Color(0x010607);
scene.fog = new THREE.FogExp2(0x010607, 0.0058);

const viewHeight = 12.2;
const viewWidth = viewHeight * (window.innerWidth / window.innerHeight);
const camera = new THREE.OrthographicCamera(
  viewWidth / -2,
  viewWidth / 2,
  viewHeight / 2,
  viewHeight / -2,
  0.05,
  260
);
camera.position.set(0, 0, 9.4);
camera.up.set(0, 1, 0);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.82;
stage.appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
composer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
composer.setSize(window.innerWidth, window.innerHeight);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.34, 0.42, 0.68);
composer.addPass(bloomPass);

const filmPass = new FilmPass(0.22, false);
composer.addPass(filmPass);
composer.addPass(new OutputPass());

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.enabled = false;
controls.autoRotate = false;
controls.autoRotateSpeed = 0;
controls.enablePan = false;
controls.enableZoom = false;
controls.minZoom = 0.42;
controls.maxZoom = 2.35;
controls.target.set(0, 0, 0);

const cardRail = {
  stops: [],
  activeIndex: 0,
  targetIndex: 0,
  currentPosition: camera.position.clone(),
  targetPosition: camera.position.clone(),
  currentTarget: new THREE.Vector3(),
  targetTarget: new THREE.Vector3(),
  currentZoom: camera.zoom,
  targetZoom: 1.7,
  lastWheelAt: 0,
  touchY: null,
  ready: false
};

function setRailTarget(index, immediate = false) {
  if (!cardRail.stops.length) {
    return;
  }
  const nextIndex = THREE.MathUtils.clamp(index, 0, cardRail.stops.length - 1);
  const stop = cardRail.stops[nextIndex];
  cardRail.activeIndex = nextIndex;
  cardRail.targetIndex = nextIndex;
  cardRail.targetPosition.copy(stop.camera);
  cardRail.targetTarget.copy(stop.target);
  cardRail.targetZoom = stop.zoom;
  if (immediate) {
    cardRail.currentPosition.copy(stop.camera);
    cardRail.currentTarget.copy(stop.target);
    cardRail.currentZoom = stop.zoom;
    camera.position.copy(cardRail.currentPosition);
    camera.zoom = cardRail.currentZoom;
    camera.updateProjectionMatrix();
    camera.lookAt(cardRail.currentTarget);
  }
  updateRailControl();
}

function updateRailControl() {
  if (!railCount || !cardRail.stops.length) return;
  const index = String(cardRail.targetIndex + 1).padStart(2, '0');
  const title = cardTitles[cardRail.targetIndex % cardTitles.length].split('\n')[0];
  railCount.textContent = `${index} - ${title}`;
}

function buildCardRail(model) {
  const cards = [];
  const box = new THREE.Box3();
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  model.updateMatrixWorld(true);
  model.traverse((object) => {
    const match = object.name.match(/^spiral_project_card_(\d+)_image$/i);
    if (!object.isMesh || !match) {
      return;
    }
    box.setFromObject(object);
    box.getCenter(center);
    box.getSize(size);
    cards.push({
      index: Number(match[1]),
      center: center.clone(),
      size: size.clone()
    });
  });

  cards.sort((a, b) => a.index - b.index);
  addReadableCardText(cards);
  cardRail.stops = cards.map(({ center }, index) => {
    const radial = new THREE.Vector3(center.x, 0, center.z);
    if (radial.lengthSq() < 0.01) {
      radial.set(0, 0, 1);
    }
    radial.normalize();
    const cameraPosition = center.clone()
      .add(radial.multiplyScalar(index % 2 ? 7.05 : 6.65))
      .add(new THREE.Vector3(index % 2 ? -0.22 : 0.18, 0.08, 0));
    const target = center.clone().add(new THREE.Vector3(index % 2 ? -0.18 : 0.14, -0.06, 0));
    return {
      camera: cameraPosition,
      target,
      zoom: index === 0 ? 1.62 : 1.54
    };
  });
  cardRail.ready = cardRail.stops.length > 0;
  setRailTarget(0, true);
  window.__CARD_RAIL = cardRail.stops.map((stop, index) => ({
    index,
    camera: stop.camera.toArray(),
    target: stop.target.toArray(),
    zoom: stop.zoom
  }));
}

function addReadableCardText(cards) {
  const textGroup = new THREE.Group();
  textGroup.name = 'readable_project_card_text';
  cards.forEach(({ index, center, size }, order) => {
    const texture = generatedCardTextTexture(index);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: order === 0 ? 0.96 : 0.58,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending
    });
    const sprite = new THREE.Sprite(material);
    const radial = new THREE.Vector3(center.x, 0, center.z);
    if (radial.lengthSq() < 0.01) radial.set(0, 0, 1);
    radial.normalize();
    sprite.position.copy(center).add(radial.multiplyScalar(0.11));
    const width = Math.max(size.x, size.z, 2.2) * (order === 0 ? 1.08 : 0.82);
    sprite.scale.set(width, width * 0.60, 1);
    sprite.userData.railIndex = order;
    sprite.renderOrder = 5;
    cardTextSprites.push(sprite);
    textGroup.add(sprite);
  });
  scene.add(textGroup);
}

function updateReadableCardText() {
  if (!cardTextSprites.length) return;
  const active = cardRail.targetIndex;
  cardTextSprites.forEach((sprite) => {
    const distance = Math.abs((sprite.userData.railIndex ?? 0) - active);
    const targetOpacity = distance === 0 ? 0.96 : distance === 1 ? 0.18 : 0.035;
    sprite.material.opacity = THREE.MathUtils.lerp(sprite.material.opacity, targetOpacity, 0.12);
  });
}

function moveRail(direction) {
  if (!cardRail.ready) {
    return;
  }
  setRailTarget(cardRail.targetIndex + direction);
}

railPrev?.addEventListener('click', () => moveRail(-1));
railNext?.addEventListener('click', () => moveRail(1));

window.addEventListener('wheel', (event) => {
  if (!cardRail.ready || Math.abs(event.deltaY) < 12) {
    return;
  }
  event.preventDefault();
  const now = performance.now();
  if (now - cardRail.lastWheelAt < 520) {
    return;
  }
  cardRail.lastWheelAt = now;
  moveRail(event.deltaY > 0 ? 1 : -1);
}, { passive: false });

window.addEventListener('touchstart', (event) => {
  cardRail.touchY = event.touches[0]?.clientY ?? null;
}, { passive: true });

window.addEventListener('touchmove', (event) => {
  if (!cardRail.ready || cardRail.touchY === null) {
    return;
  }
  const nextY = event.touches[0]?.clientY ?? cardRail.touchY;
  const delta = cardRail.touchY - nextY;
  if (Math.abs(delta) < 44) {
    return;
  }
  event.preventDefault();
  cardRail.touchY = nextY;
  moveRail(delta > 0 ? 1 : -1);
}, { passive: false });

scene.add(new THREE.AmbientLight(0x1a2430, 0.11));

const frontKey = new THREE.DirectionalLight(0xb6f6ff, 0.40);
frontKey.position.set(0, 3, 6);
scene.add(frontKey);

const cyanLight = new THREE.PointLight(0x21d7ff, 7.4, 44);
cyanLight.position.set(-5, 4, 7);
scene.add(cyanLight);

const magentaLight = new THREE.PointLight(0xff37d4, 7.0, 48);
magentaLight.position.set(5, 2, 4);
scene.add(magentaLight);

const greenLight = new THREE.PointLight(0x49ff7e, 5.7, 42);
greenLight.position.set(3, -5, -4);
scene.add(greenLight);

const violetLight = new THREE.PointLight(0x784bff, 6.6, 46);
violetLight.position.set(-4, -4, 3);
scene.add(violetLight);

const spineMagenta = new THREE.PointLight(0xff4bd8, 8.6, 12);
spineMagenta.position.set(-1.8, 0.8, 3.2);
scene.add(spineMagenta);

const spineBlue = new THREE.PointLight(0x16c9ff, 7.6, 13);
spineBlue.position.set(1.6, -0.9, -1.6);
scene.add(spineBlue);

const loader = new GLTFLoader();
const shaderClock = { value: 0 };
const cardTextureCache = new Map();
const cardBackTextureCache = new Map();
const cardTextTextureCache = new Map();
const cardTextSprites = [];
const cardTitles = [
  'SUSTAINABLE\nHORIZONS',
  'E.C.H.O.',
  'DISCOVER\nYOUR\nPATRONUS',
  'FRONTIER\nWITHIN',
  'SECRET\nSKY',
  'PROMETHEUS',
  'QUANTUM\nARCHIVE',
  'MUSEUM\nSIGNAL',
  'INNER\nORBIT',
  'SYNTHETIC\nDREAMS',
  'PARALLAX\nFIELD',
  'ZERO\nGRAVITY',
  'AURORA\nINDEX',
  'LUMEN\nCIRCUIT',
  'NIGHT\nCHANNEL'
];

function makeGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const glow = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  glow.addColorStop(0.0, 'rgba(255,255,255,1)');
  glow.addColorStop(0.22, 'rgba(190,245,255,0.58)');
  glow.addColorStop(0.62, 'rgba(70,120,160,0.15)');
  glow.addColorStop(1.0, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeDustTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 96;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 96, 96);
  const core = ctx.createRadialGradient(48, 48, 0, 48, 48, 46);
  core.addColorStop(0.0, 'rgba(255,255,255,1)');
  core.addColorStop(0.18, 'rgba(255,255,255,0.88)');
  core.addColorStop(0.42, 'rgba(170,235,255,0.28)');
  core.addColorStop(1.0, 'rgba(0,0,0,0)');
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, 96, 96);
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 18; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.05 + Math.random() * 0.11})`;
    ctx.fillRect(24 + Math.random() * 48, 24 + Math.random() * 48, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function addStarField() {
  const glow = makeGlowTexture();
  const dust = makeDustTexture();

  function pointsLayer(count, radiusMin, radiusMax, size, opacity) {
    const positions = [];
    const colors = [];
    const palette = [
      new THREE.Color(0x6fb6d0),
      new THREE.Color(0x315f9c),
      new THREE.Color(0x8a4fd6),
      new THREE.Color(0x244d44),
      new THREE.Color(0x9a6f55)
    ];
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
      const radius = THREE.MathUtils.lerp(radiusMin, radiusMax, Math.pow(Math.random(), 0.55));
      positions.push(
        Math.sin(phi) * Math.cos(theta) * radius,
        Math.cos(phi) * radius,
        Math.sin(phi) * Math.sin(theta) * radius
      );
      const color = palette[Math.floor(Math.random() * palette.length)].clone();
      color.offsetHSL(0, Math.random() * 0.08, -0.10 + Math.random() * 0.08);
      colors.push(color.r, color.g, color.b);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      size,
      map: dust,
      vertexColors: true,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: false
    });
    const points = new THREE.Points(geometry, material);
    points.renderOrder = 0;
    scene.add(points);
    return points;
  }

  pointsLayer(24, 13.0, 24.0, 1.0, 0.035);

  function centralDust(count, height, radius, turns, size, opacity, yOffset = 0) {
    const positions = [];
    const colors = [];
    const palette = [
      new THREE.Color(0x21d4ff),
      new THREE.Color(0x5544ff),
      new THREE.Color(0xc94fff),
      new THREE.Color(0x25ef96),
      new THREE.Color(0xe46bcf),
      new THREE.Color(0xe0a05e)
    ];
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const y = (t - 0.5) * height + yOffset + THREE.MathUtils.randFloatSpread(0.75);
      const arm = Math.floor(Math.random() * 3) * 2.094;
      const theta = t * Math.PI * 2 * turns + arm + THREE.MathUtils.randFloatSpread(0.34);
      const pinch = 0.55 + Math.pow(Math.sin(t * Math.PI), 1.6) * 0.95;
      const r = radius * pinch * (0.58 + Math.random() * 0.72);
      positions.push(
        Math.cos(theta) * r + THREE.MathUtils.randFloatSpread(0.24),
        y,
        Math.sin(theta) * r + THREE.MathUtils.randFloatSpread(0.24)
      );
      const color = palette[Math.floor(Math.random() * palette.length)].clone();
      color.multiplyScalar(0.62 + Math.random() * 0.58);
      colors.push(color.r, color.g, color.b);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      size,
      map: dust,
      vertexColors: true,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: false
    });
    const points = new THREE.Points(geometry, material);
    points.renderOrder = 0;
    scene.add(points);
  }

  function dustCloud(count, center, spread, size, opacity, palette, drift = [0, 0, 0], foreground = false) {
    const positions = [];
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hot = Math.random() < 0.62;
      const yBand = Math.floor(Math.random() * 5) - 2;
      const x = center[0] + THREE.MathUtils.randFloatSpread(spread[0]) + drift[0] * yBand;
      const y = center[1] + yBand * spread[1] * 0.22 + THREE.MathUtils.randFloatSpread(spread[1] * (hot ? 0.42 : 0.92));
      const z = center[2] + THREE.MathUtils.randFloatSpread(spread[2]);
      positions.push(x, y, z);
      const color = palette[Math.floor(Math.random() * palette.length)].clone();
      color.offsetHSL(THREE.MathUtils.randFloatSpread(0.025), Math.random() * 0.18, -0.10 + Math.random() * 0.18);
      colors.push(color.r, color.g, color.b);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      size,
      map: dust,
      vertexColors: true,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: !foreground,
      sizeAttenuation: false
    });
    const points = new THREE.Points(geometry, material);
    points.renderOrder = foreground ? 6 : 0;
    scene.add(points);
  }

  function verticalStream(count, x, z, yMin, yMax, width, size, opacity, palette, foreground = false) {
    const positions = [];
    const colors = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random();
      const lane = Math.floor(Math.random() * 4) - 1.5;
      const y = THREE.MathUtils.lerp(yMin, yMax, t) + THREE.MathUtils.randFloatSpread(0.22);
      const wave = Math.sin(t * Math.PI * 5.0 + lane) * width * 0.42;
      positions.push(
        x + lane * width * 0.42 + wave + THREE.MathUtils.randFloatSpread(width * 0.55),
        y,
        z + THREE.MathUtils.randFloatSpread(width * 0.9)
      );
      const color = palette[Math.floor(Math.random() * palette.length)].clone();
      color.multiplyScalar(0.55 + Math.random() * 0.72);
      colors.push(color.r, color.g, color.b);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      size,
      map: dust,
      vertexColors: true,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: !foreground,
      sizeAttenuation: false
    });
    const points = new THREE.Points(geometry, material);
    points.renderOrder = foreground ? 7 : 0;
    scene.add(points);
  }

  const violetTeal = [
    new THREE.Color(0x2beaff),
    new THREE.Color(0x6662ff),
    new THREE.Color(0xd251ff),
    new THREE.Color(0x26f0a1),
    new THREE.Color(0xf2a35e)
  ];
  const deepGreen = [
    new THREE.Color(0x17d78e),
    new THREE.Color(0x1e755d),
    new THREE.Color(0x257db3),
    new THREE.Color(0x7a4ff0),
    new THREE.Color(0xff5fc4)
  ];

  centralDust(1280, 17.0, 2.35, 3.35, 3.4, 0.30);
  centralDust(520, 18.1, 3.8, 2.05, 2.6, 0.16, 0.25);
  dustCloud(430, [-2.7, 3.5, 1.35], [1.7, 4.35, 1.28], 3.6, 0.30, violetTeal, [0.13, 0, 0]);
  dustCloud(360, [2.45, 2.8, -1.15], [2.0, 4.8, 1.38], 3.3, 0.28, violetTeal, [-0.10, 0, 0]);
  dustCloud(330, [-2.45, -3.0, 1.8], [1.9, 3.4, 1.32], 3.0, 0.24, deepGreen, [0.16, 0, 0]);
  dustCloud(310, [2.95, -2.65, 1.45], [1.8, 3.2, 1.25], 3.2, 0.24, deepGreen, [-0.14, 0, 0]);
  dustCloud(420, [0.2, 6.2, 2.25], [4.4, 1.45, 1.4], 2.8, 0.30, violetTeal);
  dustCloud(290, [-1.05, 1.0, 4.5], [4.9, 7.2, 0.58], 2.2, 0.14, violetTeal, [0.04, 0, 0], true);
  dustCloud(240, [3.0, -0.9, 4.05], [2.9, 5.3, 0.52], 2.3, 0.15, deepGreen, [-0.08, 0, 0], true);
  dustCloud(350, [4.75, 5.0, 0.75], [3.2, 2.65, 1.0], 3.0, 0.32, violetTeal, [-0.18, 0, 0]);
  dustCloud(250, [-4.3, 5.55, 1.65], [2.55, 2.35, 0.95], 2.8, 0.24, violetTeal, [0.13, 0, 0]);
  dustCloud(230, [5.0, -0.15, 2.6], [1.85, 4.4, 0.72], 2.6, 0.20, deepGreen, [-0.10, 0, 0], true);
  verticalStream(360, -3.65, 0.95, -5.4, 6.35, 0.58, 2.6, 0.28, violetTeal);
  verticalStream(320, 3.65, -1.35, -5.1, 5.95, 0.55, 2.5, 0.24, deepGreen);
  verticalStream(180, 0.18, 4.25, -4.1, 5.2, 1.0, 1.9, 0.11, violetTeal, true);

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x55dfff,
    transparent: true,
    opacity: 0.105,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  for (let cluster = 0; cluster < 0; cluster++) {
    const center = new THREE.Vector3(
      THREE.MathUtils.randFloatSpread(12),
      THREE.MathUtils.randFloatSpread(9),
      THREE.MathUtils.randFloatSpread(12)
    ).normalize().multiplyScalar(10 + Math.random() * 5);
    const points = [];
    const count = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      points.push(center.clone().add(new THREE.Vector3(
        THREE.MathUtils.randFloatSpread(0.95),
        THREE.MathUtils.randFloatSpread(0.95),
        THREE.MathUtils.randFloatSpread(0.95)
      )));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, lineMaterial);
    line.renderOrder = 0;
    scene.add(line);
  }
}

function generatedCardTexture(index, tint) {
  if (cardTextureCache.has(index)) return cardTextureCache.get(index);

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 614;
  const ctx = canvas.getContext('2d');
  const hue = new THREE.Color(tint);
  const c0 = `rgb(${Math.round(8 + hue.r * 58)}, ${Math.round(34 + hue.g * 118)}, ${Math.round(40 + hue.b * 126)})`;
  const c1 = `rgb(${Math.round(8 + hue.r * 54)}, ${Math.round(16 + hue.g * 70)}, ${Math.round(20 + hue.b * 82)})`;

  const base = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  base.addColorStop(0, '#071013');
  base.addColorStop(0.38, c0);
  base.addColorStop(1, c1);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 48; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = 80 + Math.random() * 220;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
    glow.addColorStop(0, `rgba(${70 + Math.random() * 130}, ${150 + Math.random() * 92}, ${190 + Math.random() * 62}, ${0.065 + Math.random() * 0.13})`);
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = 'rgba(3, 8, 10, 0.50)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalCompositeOperation = 'source-over';
  const noise = ctx.createImageData(canvas.width, canvas.height);
  for (let i = 0; i < noise.data.length; i += 4) {
    const value = Math.random() * 255;
    noise.data[i] = value;
    noise.data[i + 1] = value;
    noise.data[i + 2] = value;
    noise.data[i + 3] = 10;
  }
  ctx.putImageData(noise, 0, 0);

  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = 'rgba(40, 220, 255, 0.12)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 18; i++) {
    const y = 120 + Math.random() * 360;
    ctx.beginPath();
    ctx.moveTo(120 + Math.random() * 200, y);
    ctx.lineTo(640 + Math.random() * 260, y + THREE.MathUtils.randFloatSpread(8));
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  cardTextureCache.set(index, texture);
  return texture;
}

function generatedCardTextTexture(index) {
  if (cardTextTextureCache.has(index)) return cardTextTextureCache.get(index);

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 614;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(20, 220, 255, 0.78)';
  ctx.shadowBlur = 18;
  ctx.fillStyle = 'rgba(240, 252, 255, 0.84)';
  ctx.font = index % 3 === 1 ? '124px "Courier New", monospace' : '108px "Courier New", monospace';
  const lines = cardTitles[index % cardTitles.length].split('\n');
  const lineHeight = lines.length > 2 ? 76 : 88;
  const startY = canvas.height / 2 - (lines.length - 1) * lineHeight / 2;
  lines.forEach((line, lineIndex) => {
    ctx.fillText(line, canvas.width / 2, startY + lineIndex * lineHeight);
    ctx.fillStyle = 'rgba(255, 80, 170, 0.22)';
    ctx.fillText(line, canvas.width / 2 + 4, startY + lineIndex * lineHeight + 1);
    ctx.fillStyle = 'rgba(80, 240, 255, 0.26)';
    ctx.fillText(line, canvas.width / 2 - 5, startY + lineIndex * lineHeight - 1);
    ctx.fillStyle = 'rgba(240, 252, 255, 0.84)';
  });
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(240, 252, 255, 0.58)';
  ctx.font = '38px "Courier New", monospace';
  ctx.fillText(index % 2 ? 'AT / LAB' : 'WSJ', canvas.width / 2, canvas.height * 0.28);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  cardTextTextureCache.set(index, texture);
  return texture;
}

function generatedCardBackTexture(index, tint) {
  if (cardBackTextureCache.has(index)) return cardBackTextureCache.get(index);

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 614;
  const ctx = canvas.getContext('2d');
  const hue = new THREE.Color(tint);
  const base = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  base.addColorStop(0, `rgba(${Math.round(hue.r * 46)}, ${Math.round(hue.g * 68)}, ${Math.round(hue.b * 86)}, 1)`);
  base.addColorStop(1, '#050a0d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 18; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = 90 + Math.random() * 190;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
    glow.addColorStop(0, `rgba(${Math.round(60 + hue.r * 160)}, ${Math.round(100 + hue.g * 130)}, ${Math.round(130 + hue.b * 120)}, 0.10)`);
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = 'rgba(145, 235, 235, 0.08)';
  ctx.lineWidth = 4;
  ctx.strokeRect(34, 34, canvas.width - 68, canvas.height - 68);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  cardBackTextureCache.set(index, texture);
  return texture;
}

function findOverride(label, overrides) {
  return Object.entries(overrides).find(([name]) => label.includes(name))?.[1];
}

function applyBlenderOverride(material, override) {
  if (!override) return;
  if (override.color && material.color) {
    material.color.setRGB(...override.color);
  }
  if (override.emissive) {
    material.emissive = new THREE.Color().setRGB(...override.emissive);
  }
  if (typeof override.emissiveIntensity === 'number') {
    material.emissiveIntensity = override.emissiveIntensity;
  }
  if (typeof override.metalness === 'number') {
    material.metalness = override.metalness;
  }
  if (typeof override.roughness === 'number') {
    material.roughness = override.roughness;
  }
  if (typeof override.opacity === 'number') {
    material.opacity = override.opacity;
  }
  if (override.transparent || typeof override.opacity === 'number') {
    material.transparent = true;
    material.depthWrite = false;
  }
}

function makeCardShader(label, source) {
  const palette = [
    new THREE.Color(0x24c7d0),
    new THREE.Color(0x5f4bff),
    new THREE.Color(0x18b86d),
    new THREE.Color(0xd845a8),
    new THREE.Color(0x1456d9),
    new THREE.Color(0xb58a40)
  ];
  const match = label.match(/spiral_project_card_(\d+)/);
  const cardIndex = match ? Number(match[1]) : 0;
  const tint = palette[cardIndex % palette.length];
  const isEdge = label.includes('edge') || label.includes('thin_cyan_edge');
  const map = generatedCardTexture(cardIndex, tint);
  return new THREE.ShaderMaterial({
    name: source.name,
    uniforms: {
      tMap: { value: map },
      tBackMap: { value: map },
      uTint: { value: new THREE.Color(0x0a9688) },
      uTime: shaderClock,
      uOpacity: { value: isEdge ? 0.82 : 0.97 },
      uEdgeBoost: { value: isEdge ? 1.34 : 0.36 }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorld;
      varying vec3 vNormal;
      void main() {
        vUv = uv;
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        vNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform sampler2D tMap;
      uniform sampler2D tBackMap;
      uniform vec3 uTint;
      uniform float uTime;
      uniform float uOpacity;
      uniform float uEdgeBoost;
      varying vec2 vUv;
      varying vec3 vWorld;
      varying vec3 vNormal;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      void main() {
        vec2 uv = vUv;
        uv.x = 1.0 - uv.x;
        uv.y = 1.0 - uv.y;
        vec2 warp = vec2(
          sin(uv.y * 20.0 + uTime * 0.34),
          cos(uv.x * 17.0 - uTime * 0.30)
        ) * 0.016;
        float scan = step(0.988, fract((uv.y + uTime * 0.018) * 68.0));
        float glitch = step(0.990, hash(vec2(floor(uv.y * 34.0), floor(uTime * 2.0)))) * 0.010;
        vec2 aberr = vec2(0.0048 + glitch, 0.0);
        vec4 texBase = texture2D(tMap, uv + warp);
        vec4 texR = texture2D(tMap, uv + warp + aberr);
        vec4 texB = texture2D(tMap, uv + warp - aberr);
        vec4 tex = vec4(texR.r, texBase.g, texB.b, texBase.a);
        float border = smoothstep(0.0, 0.055, min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y)));
        float edge = (1.0 - border) * uEdgeBoost;
        float grain = (hash(uv * 720.0 + uTime) - 0.5) * 0.034;
        float cloud = sin((uv.x + uv.y) * 15.0 + uTime * 0.18) * 0.5 + 0.5;
        float vignette = smoothstep(0.0, 0.20, uv.x) * smoothstep(0.0, 0.20, uv.y) *
          smoothstep(0.0, 0.20, 1.0 - uv.x) * smoothstep(0.0, 0.20, 1.0 - uv.y);
        vec3 smoky = vec3(0.012, 0.046, 0.055);
        vec3 texGrade = vec3(tex.r * 0.36, tex.g * 0.86, tex.b * 0.96);
        vec3 base = mix(smoky, texGrade, 0.58);
        vec3 tealWash = vec3(0.00, 0.145, 0.158);
        vec3 greenWash = vec3(0.00, 0.160, 0.078);
        vec3 magentaKiss = vec3(0.160, 0.015, 0.135);
        base = mix(base, tealWash, 0.32);
        base += greenWash * smoothstep(0.30, 1.0, uv.x) * smoothstep(0.08, 0.9, uv.y) * 1.15;
        base += magentaKiss * smoothstep(0.0, 0.48, uv.x) * (1.0 - smoothstep(0.24, 0.92, uv.y)) * 0.72;
        base += vec3(0.00, 0.050, 0.060) * cloud;
        base += vec3(0.10, 0.62, 0.55) * edge;
        base += vec3(0.10, 0.03, 0.12) * scan;
        base *= mix(0.44, 1.0, vignette);
        base = pow(max(base, vec3(0.0)), vec3(1.24));
        base *= 1.08;
        base += grain;
        float alpha = max(uOpacity * tex.a * (0.94 + edge * 0.06), 0.94);
        gl_FragColor = vec4(base, alpha);
      }
    `,
    transparent: isEdge,
    depthWrite: true,
    side: THREE.DoubleSide
  });
}

function makeSpineShader(source) {
  return new THREE.ShaderMaterial({
    name: source.name,
    uniforms: {
      uTime: shaderClock,
      uBase: { value: new THREE.Color(0x050914) },
      uCyan: { value: new THREE.Color(0x24d7ff) },
      uMagenta: { value: new THREE.Color(0xb02c9c) },
      uGreen: { value: new THREE.Color(0x14a86a) }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorld;
      varying vec3 vView;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        vNormal = normalize(mat3(modelMatrix) * normal);
        vView = normalize(cameraPosition - world.xyz);
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform float uTime;
      uniform vec3 uBase;
      uniform vec3 uCyan;
      uniform vec3 uMagenta;
      uniform vec3 uGreen;
      varying vec3 vNormal;
      varying vec3 vWorld;
      varying vec3 vView;

      float hash(vec3 p) {
        return fract(sin(dot(p, vec3(17.1, 61.7, 113.5))) * 43758.5453);
      }

      void main() {
        float ndv = max(dot(normalize(vNormal), normalize(vView)), 0.0);
        float fresnel = pow(1.0 - ndv, 2.55);
        float bands = sin(vWorld.y * 9.8 + vWorld.x * 3.6 + uTime * 0.22) * 0.5 + 0.5;
        float speckle = step(0.925, hash(floor(vWorld * 22.0)));
        float glossy = pow(ndv, 12.0);
        vec3 steelViolet = vec3(0.020, 0.024, 0.055);
        vec3 oil = mix(uMagenta * 0.95, uCyan, smoothstep(0.30, 0.90, bands));
        oil = mix(oil, uGreen, smoothstep(0.58, 0.99, sin(vWorld.z * 2.4 + uTime * 0.15) * 0.5 + 0.5) * 0.16);
        float wet = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 1.65);
        vec3 color = uBase + steelViolet + oil * (0.035 + fresnel * 0.72) + glossy * mix(uMagenta, uCyan, 0.62) * 0.58 + wet * vec3(0.026, 0.062, 0.088) + speckle * vec3(0.130, 0.030, 0.120);
        color *= 0.86;
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    side: THREE.DoubleSide
  });
}

function makeAugmentMaterial(accent = 0x23d4ff) {
  return new THREE.MeshStandardMaterial({
    color: 0x07111c,
    emissive: new THREE.Color(accent),
    emissiveIntensity: 0.18,
    metalness: 0.78,
    roughness: 0.26,
    transparent: true,
    opacity: 0.86,
    side: THREE.DoubleSide
  });
}

function addReferenceSpineAugmentation(model) {
  const group = new THREE.Group();
  group.name = 'reference_spine_silhouette_augmentation';

  const cyanMat = makeAugmentMaterial(0x20d8ff);
  const magentaMat = makeAugmentMaterial(0xff3bd2);
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x02060b,
    emissive: 0x1b0d35,
    emissiveIntensity: 0.12,
    metalness: 0.55,
    roughness: 0.38,
    transparent: true,
    opacity: 0.72
  });

  const bodyGeo = new THREE.SphereGeometry(0.54, 28, 14);
  const lipGeo = new THREE.TorusGeometry(0.50, 0.055, 10, 42);
  const processGeo = new THREE.ConeGeometry(0.13, 0.86, 8, 1);
  const hookGeo = new THREE.CapsuleGeometry(0.09, 0.46, 4, 8);

  const count = 10;
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const y = THREE.MathUtils.lerp(-4.35, 4.65, t);
    const twist = t * Math.PI * 2.3 - 0.55;
    const x = Math.sin(twist) * 0.20;
    const z = Math.cos(twist) * 0.18 + 0.20;
    const mat = i % 2 ? magentaMat : cyanMat;

    const body = new THREE.Mesh(bodyGeo, mat);
    body.position.set(x, y, z);
    body.scale.set(0.84 + Math.sin(t * Math.PI) * 0.16, 0.34, 0.48);
    body.rotation.set(0.18 * Math.sin(twist), twist * 0.18, 0.08 * Math.cos(twist));
    body.renderOrder = 2;
    group.add(body);

    const upperLip = new THREE.Mesh(lipGeo, mat);
    upperLip.position.set(x, y + 0.17, z + 0.02);
    upperLip.scale.set(0.88, 0.42, 0.18);
    upperLip.rotation.set(Math.PI / 2 + 0.08 * Math.sin(twist), 0, twist * 0.12);
    group.add(upperLip);

    const lowerLip = upperLip.clone();
    lowerLip.position.y = y - 0.17;
    lowerLip.material = mat;
    group.add(lowerLip);

    const recess = new THREE.Mesh(bodyGeo, darkMat);
    recess.position.set(x, y, z + 0.13);
    recess.scale.set(0.46, 0.12, 0.10);
    recess.rotation.copy(body.rotation);
    group.add(recess);

    [-1, 1].forEach((side) => {
      const process = new THREE.Mesh(processGeo, mat);
      process.position.set(x + side * (0.58 + Math.sin(t * Math.PI) * 0.16), y + 0.03, z - 0.02);
      process.scale.set(1.0, 0.78, 1.0);
      process.rotation.set(0.0, 0.0, side * (Math.PI / 2 + 0.28));
      group.add(process);

      const hook = new THREE.Mesh(hookGeo, mat);
      hook.position.set(x + side * 0.42, y - 0.24, z + 0.18);
      hook.rotation.set(0.35, side * 0.38, side * 1.2);
      group.add(hook);
    });
  }

  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  group.position.set(center.x * 0.08, center.y * 0.04, 0.35);
  group.scale.setScalar(Math.max(0.92, Math.min(1.16, size.y / 12.5)));
  group.rotation.set(0.02, -0.08, 0.0);
  group.renderOrder = 2;
  scene.add(group);
  window.__SPINE_AUGMENT = {
    count,
    position: group.position.toArray(),
    scale: group.scale.toArray()
  };
}

function toDisplayMaterial(label, source) {
  const isSpaceDust = /star|dust|constellation|milky|deep_space/.test(label);
  const isCard = /spiral_project_card|reference_card/.test(label);
  const isSpine = /vertebra|process|lumbar|wet_iridescent/.test(label);
  const isWorld = /deep_black|world_shell|background/.test(label);
  const isUi = /dim_white_ui|soft_white_text/.test(label);

  if (isWorld) {
    return new THREE.MeshBasicMaterial({
      name: source.name,
      color: source.color || new THREE.Color(0x02090a),
      side: THREE.BackSide,
      depthWrite: false
    });
  }

  if (isSpaceDust || isUi) {
    const displayColor = source.color ? source.color.clone() : new THREE.Color(0xffffff);
    if (isSpaceDust) {
      displayColor.offsetHSL(0.0, 0.22, 0.04);
    }
    const material = new THREE.MeshBasicMaterial({
      name: source.name,
      map: source.map || null,
      color: displayColor,
      transparent: true,
      opacity: isSpaceDust ? 0.055 : 0.72,
      blending: isSpaceDust ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    return material;
  }

  if (isCard) {
    return makeCardShader(label, source);
  }

  if (isSpine) {
    return makeSpineShader(source);
  }

  return source;
}

async function loadBlenderMaterialOverrides() {
  const response = await fetch('./material-overrides.json', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Material overrides failed: ${response.status}`);
  }
  return response.json();
}

loadBlenderMaterialOverrides().then((materialOverrides) => loader.load(
  './assets/scene.glb',
  (gltf) => {
    const model = gltf.scene;
    window.__THREE_MODEL = model;
    model.traverse((object) => {
      if (/^ui_prompt|^ui_option_|^ui_top/.test(object.name)) {
        object.visible = false;
        return;
      }
      if (/constellation/i.test(object.name)) {
        object.visible = false;
        return;
      }
      if (/star|dust|milky/i.test(object.name)) {
        object.visible = false;
        return;
      }
      object.frustumCulled = false;
      if (object.isMesh && object.material) {
        const sourceMaterials = Array.isArray(object.material) ? object.material : [object.material];
        const displayMaterials = sourceMaterials.map((original) => {
          const material = original.clone();
          const label = `${object.name} ${material.name || ''}`.toLowerCase();
          if (material.map) {
            material.map.colorSpace = THREE.SRGBColorSpace;
          }
          if (material.emissiveMap) {
            material.emissiveMap.colorSpace = THREE.SRGBColorSpace;
          }
          applyBlenderOverride(material, findOverride(label, materialOverrides));
          const display = toDisplayMaterial(label, material);
          display.needsUpdate = true;
          return display;
        });
        object.material = Array.isArray(object.material) ? displayMaterials : displayMaterials[0];
        if (/star|dust|constellation|milky|deep_space/.test(object.name.toLowerCase())) {
          object.renderOrder = 3;
        }
        if (/spiral_project_card|reference_card/.test(object.name.toLowerCase())) {
          object.renderOrder = 2;
        }
        if (/vertebra|process|lumbar/.test(object.name.toLowerCase())) {
          object.renderOrder = 1;
        }
      }
    });

    scene.add(model);
    addReferenceSpineAugmentation(model);
    addStarField();
    buildCardRail(model);

    const box = new THREE.Box3().setFromObject(model);
    window.__SCENE_BOUNDS = {
      min: box.min.toArray(),
      max: box.max.toArray(),
      size: box.getSize(new THREE.Vector3()).toArray()
    };
    camera.lookAt(cardRail.currentTarget);

    loadState.classList.add('is-hidden');
    window.__SCENE_READY = true;
  },
  undefined,
  (error) => {
    window.__SCENE_ERROR = error?.message || String(error);
    loadState.textContent = 'SCENE LOAD ERROR';
    console.error(error);
  }
)).catch((error) => {
  window.__SCENE_ERROR = error?.message || String(error);
  loadState.textContent = 'SCENE LOAD ERROR';
  console.error(error);
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();
  shaderClock.value = elapsed;
  cyanLight.intensity = 5.2 + Math.sin(elapsed * 0.7) * 0.4;
  magentaLight.intensity = 5.0 + Math.cos(elapsed * 0.58) * 0.45;
  violetLight.intensity = 5.0 + Math.sin(elapsed * 0.43) * 0.35;
  spineMagenta.intensity = 5.8 + Math.sin(elapsed * 0.9) * 0.6;
  spineBlue.intensity = 5.2 + Math.cos(elapsed * 0.72) * 0.5;
  if (cardRail.ready) {
    cardRail.currentPosition.lerp(cardRail.targetPosition, 0.065);
    cardRail.currentTarget.lerp(cardRail.targetTarget, 0.065);
    cardRail.currentZoom = THREE.MathUtils.lerp(cardRail.currentZoom, cardRail.targetZoom, 0.065);
    camera.position.copy(cardRail.currentPosition);
    if (Math.abs(camera.zoom - cardRail.currentZoom) > 0.0005) {
      camera.zoom = cardRail.currentZoom;
      camera.updateProjectionMatrix();
    }
    camera.lookAt(cardRail.currentTarget);
  }
  updateReadableCardText();
  composer.render();
}

animate();

window.addEventListener('resize', () => {
  const nextWidth = viewHeight * (window.innerWidth / window.innerHeight);
  camera.left = nextWidth / -2;
  camera.right = nextWidth / 2;
  camera.top = viewHeight / 2;
  camera.bottom = viewHeight / -2;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  composer.setSize(window.innerWidth, window.innerHeight);
  bloomPass.setSize(window.innerWidth, window.innerHeight);
});
