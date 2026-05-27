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
const BAKED_SPINE_VIEW = false;
const RESTORE_SCENE_CARDS = true;
const USE_SCENE_CARD_SOURCE_MATERIALS = false;
const USE_BAKED_SCENE_CAMERA = true;
const MATCH_PUBLISHED_CARD_LAYOUT = true;
const USE_JELLYFISH_CARD_MODE = true;
const USE_BAKED_GEONODES_JELLYFISH = true;
const PUBLISHED_CARD_TARGET_WIDTH = 1.02;
const PUBLISHED_CARD_DISTANCE_OFFSET = 3.45;
const CARD_MOTION_SPEED = 0.78;
const BASE_VIEW_HEIGHT = 12.2;
const ASSET_VERSION = 'jelly-glass-chrome-dim-v13';

function getResponsiveSettings() {
  const width = window.innerWidth || 1440;
  const height = window.innerHeight || 900;
  const portrait = height > width;
  if (width <= 640) {
    return {
      viewHeight: portrait ? 17.2 : 13.4,
      cardTargetWidth: PUBLISHED_CARD_TARGET_WIDTH * 0.78,
      cardDistanceOffset: 2.55,
      railZoomScale: portrait ? 0.76 : 0.88,
      cameraDistanceScale: portrait ? 1.16 : 1.05,
      focusPull: portrait ? 2.15 : 2.45,
      focusScaleBoost: 0.34,
      textScale: 0.82,
    };
  }
  if (width <= 1024) {
    return {
      viewHeight: portrait ? 14.8 : 12.8,
      cardTargetWidth: PUBLISHED_CARD_TARGET_WIDTH * 0.9,
      cardDistanceOffset: 3.0,
      railZoomScale: portrait ? 0.88 : 0.96,
      cameraDistanceScale: 1.08,
      focusPull: 2.75,
      focusScaleBoost: 0.40,
      textScale: 0.92,
    };
  }
  return {
    viewHeight: BASE_VIEW_HEIGHT,
    cardTargetWidth: PUBLISHED_CARD_TARGET_WIDTH,
    cardDistanceOffset: PUBLISHED_CARD_DISTANCE_OFFSET,
    railZoomScale: 1,
    cameraDistanceScale: 1,
    focusPull: 3.35,
    focusScaleBoost: 0.48,
    textScale: 1,
  };
}

function getViewWidth(height) {
  return height * (window.innerWidth / Math.max(window.innerHeight, 1));
}

function publishResponsiveView() {
  const settings = getResponsiveSettings();
  window.__RESPONSIVE_VIEW = {
    width: window.innerWidth,
    height: window.innerHeight,
    viewHeight: settings.viewHeight,
    cardTargetWidth: settings.cardTargetWidth,
    railZoomScale: settings.railZoomScale,
  };
}
const REFERENCE_CARD_LAYOUT = [
    {
        "name":  "spiral_project_card_00_edge",
        "position":  [
                         -1.240546703338623,
                         6.699999809265137,
                         2.9969980716705322
                     ],
        "quaternion":  [
                           0,
                           -0.20791159570217133,
                           0,
                           0.9781476259231567
                       ],
        "scale":  [
                      1,
                      1,
                      1
                  ]
    },
    {
        "name":  "spiral_project_card_00_image",
        "position":  [
                         -1.240546703338623,
                         6.699999809265137,
                         2.9869980812072754
                     ],
        "quaternion":  [
                           0,
                           -0.20791159570217133,
                           0,
                           0.9781476259231567
                       ],
        "scale":  [
                      1,
                      1,
                      1
                  ]
    },
    {
        "name":  "spiral_project_card_01_edge",
        "position":  [
                         2.266591787338257,
                         5.742856979370117,
                         2.2888059616088867
                     ],
        "quaternion":  [
                           0,
                           0.4067367613315582,
                           0,
                           0.9135454297065735
                       ],
        "scale":  [
                      1,
                      1,
                      1
                  ]
    },
    {
        "name":  "spiral_project_card_01_image",
        "position":  [
                         2.266591787338257,
                         5.742856979370117,
                         2.27880597114563
                     ],
        "quaternion":  [
                           0,
                           0.4067367613315582,
                           0,
                           0.9135454297065735
                       ],
        "scale":  [
                      1,
                      1,
                      1
                  ]
    },
    {
        "name":  "spiral_project_card_02_edge",
        "position":  [
                         2.6413774490356445,
                         4.785714149475098,
                         -1.0987499952316284
                     ],
        "quaternion":  [
                           0,
                           0.866025447845459,
                           0,
                           0.4999999701976776
                       ],
        "scale":  [
                      1,
                      1,
                      1
                  ]
    },
    {
        "name":  "spiral_project_card_02_image",
        "position":  [
                         2.6413774490356445,
                         4.785714149475098,
                         -1.1087499856948853
                     ],
        "quaternion":  [
                           0,
                           0.866025447845459,
                           0,
                           0.4999999701976776
                       ],
        "scale":  [
                      1,
                      1,
                      1
                  ]
    },
    {
        "name":  "spiral_project_card_03_edge",
        "position":  [
                         -0.6341306567192078,
                         3.828571319580078,
                         -2.484182596206665
                     ],
        "quaternion":  [
                           0,
                           -0.9945219159126282,
                           0,
                           0.10452836751937866
                       ],
        "scale":  [
                      1,
                      1,
                      1
                  ]
    },
    {
        "name":  "spiral_project_card_03_image",
        "position":  [
                         -0.6341306567192078,
                         3.828571319580078,
                         -2.494182586669922
                     ],
        "quaternion":  [
                           0,
                           -0.9945219159126282,
                           0,
                           0.10452836751937866
                       ],
        "scale":  [
                      1,
                      1,
                      1
                  ]
    },
    {
        "name":  "spiral_project_card_04_edge",
        "position":  [
                         -3.033291816711426,
                         2.8714284896850586,
                         0.04712877795100212
                     ],
        "quaternion":  [
                           0,
                           -0.7431447505950928,
                           0,
                           0.669130802154541
                       ],
        "scale":  [
                      1,
                      1,
                      1
                  ]
    },
    {
        "name":  "spiral_project_card_04_image",
        "position":  [
                         -3.033291816711426,
                         2.8714284896850586,
                         0.03712877631187439
                     ],
        "quaternion":  [
                           0,
                           -0.7431447505950928,
                           0,
                           0.669130802154541
                       ],
        "scale":  [
                      1,
                      1,
                      1
                  ]
    },
    {
        "name":  "spiral_project_card_05_edge",
        "position":  [
                         -1.240546703338623,
                         1.914285659790039,
                         2.9969980716705322
                     ],
        "quaternion":  [
                           0,
                           -0.20791175961494446,
                           0,
                           0.978147566318512
                       ],
        "scale":  [
                      1,
                      1,
                      1
                  ]
    },
    {
        "name":  "spiral_project_card_05_image",
        "position":  [
                         -1.240546703338623,
                         1.914285659790039,
                         2.9869980812072754
                     ],
        "quaternion":  [
                           0,
                           -0.20791175961494446,
                           0,
                           0.978147566318512
                       ],
        "scale":  [
                      1,
                      1,
                      1
                  ]
    },
    {
        "name":  "spiral_project_card_06_edge",
        "position":  [
                         2.266591787338257,
                         0.9571428298950195,
                         2.2888059616088867
                     ],
        "quaternion":  [
                           0,
                           0.406736820936203,
                           0,
                           0.9135453701019287
                       ],
        "scale":  [
                      1,
                      1,
                      1
                  ]
    },
    {
        "name":  "spiral_project_card_06_image",
        "position":  [
                         2.266591787338257,
                         0.9571428298950195,
                         2.27880597114563
                     ],
        "quaternion":  [
                           0,
                           0.406736820936203,
                           0,
                           0.9135453701019287
                       ],
        "scale":  [
                      1,
                      1,
                      1
                  ]
    },
    {
        "name":  "spiral_project_card_07_edge",
        "position":  [
                         2.6413774490356445,
                         0,
                         -1.0987499952316284
                     ],
        "quaternion":  [
                           0,
                           0.8660253882408142,
                           0,
                           0.5
                       ],
        "scale":  [
                      1,
                      1,
                      1
                  ]
    },
    {
        "name":  "spiral_project_card_07_image",
        "position":  [
                         2.6413774490356445,
                         0,
                         -1.1087499856948853
                     ],
        "quaternion":  [
                           0,
                           0.8660253882408142,
                           0,
                           0.5
                       ],
        "scale":  [
                      1,
                      1,
                      1
                  ]
    },
    {
        "name":  "spiral_project_card_08_edge",
        "position":  [
                         -0.6341306567192078,
                         -0.9571428298950195,
                         -2.484182596206665
                     ],
        "quaternion":  [
                           0,
                           -0.994521975517273,
                           0,
                           0.10452869534492493
                       ],
        "scale":  [
                      1,
                      1,
                      1
                  ]
    },
    {
        "name":  "spiral_project_card_08_image",
        "position":  [
                         -0.6341306567192078,
                         -0.9571428298950195,
                         -2.494182586669922
                     ],
        "quaternion":  [
                           0,
                           -0.994521975517273,
                           0,
                           0.10452869534492493
                       ],
        "scale":  [
                      1,
                      1,
                      1
                  ]
    },
    {
        "name":  "spiral_project_card_09_edge",
        "position":  [
                         -3.033291816711426,
                         -1.914285659790039,
                         0.04712877795100212
                     ],
        "quaternion":  [
                           0,
                           -0.7431448101997375,
                           0,
                           0.6691306233406067
                       ],
        "scale":  [
                      1,
                      1,
                      1
                  ]
    },
    {
        "name":  "spiral_project_card_09_image",
        "position":  [
                         -3.033291816711426,
                         -1.914285659790039,
                         0.03712877631187439
                     ],
        "quaternion":  [
                           0,
                           -0.7431448101997375,
                           0,
                           0.6691306233406067
                       ],
        "scale":  [
                      1,
                      1,
                      1
                  ]
    },
    {
        "name":  "spiral_project_card_10_edge",
        "position":  [
                         -1.240546703338623,
                         -2.8714284896850586,
                         2.9969980716705322
                     ],
        "quaternion":  [
                           0,
                           -0.20791146159172058,
                           0,
                           0.9781477451324463
                       ],
        "scale":  [
                      1,
                      1,
                      1
                  ]
    },
    {
        "name":  "spiral_project_card_10_image",
        "position":  [
                         -1.240546703338623,
                         -2.8714284896850586,
                         2.9869980812072754
                     ],
        "quaternion":  [
                           0,
                           -0.20791146159172058,
                           0,
                           0.9781477451324463
                       ],
        "scale":  [
                      1,
                      1,
                      1
                  ]
    },
    {
        "name":  "spiral_project_card_11_edge",
        "position":  [
                         2.266591787338257,
                         -3.828571319580078,
                         2.2888059616088867
                     ],
        "quaternion":  [
                           0,
                           0.40673622488975525,
                           0,
                           0.9135456681251526
                       ],
        "scale":  [
                      1,
                      1,
                      1
                  ]
    },
    {
        "name":  "spiral_project_card_11_image",
        "position":  [
                         2.266591787338257,
                         -3.828571319580078,
                         2.27880597114563
                     ],
        "quaternion":  [
                           0,
                           0.40673622488975525,
                           0,
                           0.9135456681251526
                       ],
        "scale":  [
                      1,
                      1,
                      1
                  ]
    },
    {
        "name":  "spiral_project_card_12_edge",
        "position":  [
                         2.6413774490356445,
                         -4.785714149475098,
                         -1.0987499952316284
                     ],
        "quaternion":  [
                           0,
                           0.8660253286361694,
                           0,
                           0.5000001192092896
                       ],
        "scale":  [
                      1,
                      1,
                      1
                  ]
    },
    {
        "name":  "spiral_project_card_12_image",
        "position":  [
                         2.6413774490356445,
                         -4.785714149475098,
                         -1.1087499856948853
                     ],
        "quaternion":  [
                           0,
                           0.8660253286361694,
                           0,
                           0.5000001192092896
                       ],
        "scale":  [
                      1,
                      1,
                      1
                  ]
    },
    {
        "name":  "spiral_project_card_13_edge",
        "position":  [
                         -0.6341306567192078,
                         -5.742856979370117,
                         -2.484182596206665
                     ],
        "quaternion":  [
                           0,
                           -0.994521975517273,
                           0,
                           0.10452855378389359
                       ],
        "scale":  [
                      1,
                      1,
                      1
                  ]
    },
    {
        "name":  "spiral_project_card_13_image",
        "position":  [
                         -0.6341306567192078,
                         -5.742856979370117,
                         -2.494182586669922
                     ],
        "quaternion":  [
                           0,
                           -0.994521975517273,
                           0,
                           0.10452855378389359
                       ],
        "scale":  [
                      1,
                      1,
                      1
                  ]
    },
    {
        "name":  "spiral_project_card_14_edge",
        "position":  [
                         -3.033291816711426,
                         -6.699999809265137,
                         0.04712877795100212
                     ],
        "quaternion":  [
                           0,
                           -0.743144690990448,
                           0,
                           0.6691308617591858
                       ],
        "scale":  [
                      1,
                      1,
                      1
                  ]
    },
    {
        "name":  "spiral_project_card_14_image",
        "position":  [
                         -3.033291816711426,
                         -6.699999809265137,
                         0.03712877631187439
                     ],
        "quaternion":  [
                           0,
                           -0.743144690990448,
                           0,
                           0.6691308617591858
                       ],
        "scale":  [
                      1,
                      1,
                      1
                  ]
    }
];

const scene = new THREE.Scene();
window.__THREE = THREE;
window.__THREE_SCENE = scene;
scene.background = new THREE.Color(0x010607);
scene.fog = new THREE.FogExp2(0x010607, 0.0058);

publishResponsiveView();
let viewHeight = getResponsiveSettings().viewHeight;
let viewWidth = getViewWidth(viewHeight);
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
window.__THREE_CAMERA = camera;

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.54;
stage.appendChild(renderer.domElement);
renderer.domElement.style.cursor = 'default';

const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let pointerInsideScene = false;
let hoveredCardIndex = null;
let pointerNeedsRaycast = false;
const pointerScreen = { x: 0, y: 0 };

const composer = new EffectComposer(renderer);
composer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
composer.setSize(window.innerWidth, window.innerHeight);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.09, 0.24, 0.88);
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
  if (BAKED_SPINE_VIEW && USE_BAKED_SCENE_CAMERA) {
    if (railCount) railCount.textContent = RESTORE_SCENE_CARDS ? 'SCENE CARDS' : 'BAKED SPINE';
    if (railPrev) railPrev.disabled = true;
    if (railNext) railNext.disabled = true;
    return;
  }
  if (!railCount || !cardRail.stops.length) return;
  const index = String(cardRail.targetIndex + 1).padStart(2, '0');
  const title = cardTitles[cardRail.targetIndex % cardTitles.length].split('\n')[0];
  railCount.textContent = `${index} - ${title}`;
}

function applyPublishedCardLayout(model) {
  if (!MATCH_PUBLISHED_CARD_LAYOUT) return;
  const transforms = new Map(REFERENCE_CARD_LAYOUT.map((item) => [item.name, item]));
  const cardObjectsByIndex = new Map();
  floatingCards.length = 0;
  cardBodies.length = 0;
  cardHoverObjects.length = 0;
  model.updateMatrixWorld(true);
  model.traverse((object) => {
    const transform = transforms.get(object.name);
    if (!transform) return;
    const position = new THREE.Vector3().fromArray(transform.position);
    const radial = new THREE.Vector3(position.x, 0, position.z);
    if (radial.lengthSq() < 0.001) {
      radial.set(position.x >= 0 ? 1 : -1, 0, 0.25);
    }
    radial.normalize();
    position.add(radial.multiplyScalar(getResponsiveSettings().cardDistanceOffset));

    object.position.copy(position);
    object.quaternion.fromArray(transform.quaternion);
    if (USE_JELLYFISH_CARD_MODE && /^spiral_project_card_\d+_image$/i.test(object.name)) {
      object.quaternion.copy(camera.quaternion);
    }
    object.scale.fromArray(transform.scale);
    object.visible = true;
    object.updateMatrix();
    object.updateMatrixWorld(true);

    const match = object.name.match(/^spiral_project_card_(\d+)_(image|edge)$/i);
    if (match) {
      if (USE_BAKED_GEONODES_JELLYFISH && match[2] === 'edge') {
        object.visible = false;
        return;
      }
      const index = Number(match[1]);
      if (!cardObjectsByIndex.has(index)) cardObjectsByIndex.set(index, []);
      cardObjectsByIndex.get(index).push(object);
      floatingCards.push({
        object,
        index,
        basePosition: object.position.clone(),
        baseQuaternion: object.quaternion.clone(),
        baseScale: object.scale.clone(),
        baseRenderOrder: object.renderOrder,
        phase: index * 0.73 + (match[2] === 'edge' ? 0.04 : 0)
      });
      cardHoverObjects.push(object);
    }
  });

  cardObjectsByIndex.forEach((objects) => {
    const image = objects.find((object) => /_image$/i.test(object.name));
    if (!image?.geometry) return;
    image.geometry.computeBoundingBox();
    const localSize = image.geometry.boundingBox.getSize(new THREE.Vector3());
    const localWidth = Math.max(localSize.x, localSize.y, 0.001);
    const scaleFactor = getResponsiveSettings().cardTargetWidth / localWidth;
    objects.forEach((object) => {
      object.scale.multiplyScalar(scaleFactor);
      object.updateMatrix();
      object.updateMatrixWorld(true);
      const floating = floatingCards.find((item) => item.object === object);
      if (floating) {
        floating.baseScale = object.scale.clone();
      }
    });
  });

  cardObjectsByIndex.forEach((objects, index) => {
    const image = objects.find((object) => /_image$/i.test(object.name)) || objects[0];
    if (!image) return;
    cardBodies.push({
      index,
      objects,
      basePosition: image.position.clone(),
      collisionOffset: new THREE.Vector3(),
      collisionVelocity: new THREE.Vector3(),
      targetPosition: image.position.clone(),
      radius: 2.42,
      hoverAmount: 0,
      hoverTarget: 0
    });
  });

  model.updateMatrixWorld(true);
  window.__FLOATING_CARDS = floatingCards.map(({ object, index }) => ({
    name: object.name,
    index
  }));
}

function registerBlenderJellyfishAnimations(model, animations = []) {
  sceneAnimationMixers.length = 0;
  jellyfishAnimationActions.clear();
  window.__GLTF_ANIMATIONS = animations.map((clip) => clip.name);
  window.__JELLYFISH_ANIMATION_ACTIONS = [];
  if (!animations.length) return;

  const mixer = new THREE.AnimationMixer(model);
  sceneAnimationMixers.push(mixer);
  animations.forEach((clip) => {
    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.enabled = true;
    action.setEffectiveWeight(1);
    action.play();

    const match = clip.name.match(/^jellyfish_swim_(\d+)/i);
    if (!match) return;
    const index = Number(match[1]);
    if (!jellyfishAnimationActions.has(index)) {
      jellyfishAnimationActions.set(index, []);
    }
    jellyfishAnimationActions.get(index).push(action);
  });

  window.__JELLYFISH_ANIMATION_ACTIONS = Array.from(jellyfishAnimationActions.entries()).map(([index, actions]) => ({
    index,
    clips: actions.map((action) => action.getClip().name)
  }));
}

function makeBakedJellyfishMaterial(index) {
  const palette = [
    { color: 0xb7f4ff, emissive: 0x0ed8ff },
    { color: 0xd7c6ff, emissive: 0x7b42ff },
    { color: 0xf4d8ff, emissive: 0xff4bd8 },
    { color: 0xc4fff1, emissive: 0x00f5c8 }
  ];
  const tint = palette[index % palette.length];
  const material = new THREE.MeshPhysicalMaterial({
    color: tint.color,
    emissive: tint.emissive,
    emissiveIntensity: 0.035,
    metalness: 0.66,
    roughness: 0.24,
    clearcoat: 1,
    clearcoatRoughness: 0.16,
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: true,
    blending: THREE.NormalBlending,
    toneMapped: false
  });
  material.ior = 1.42;
  material.reflectivity = 0.46;
  material.iridescence = 0.42;
  material.iridescenceIOR = 1.34;
  material.iridescenceThicknessRange = [120, 520];
  material.userData.baseDepthTest = material.depthTest;
  return material;
}

function remapMorphClipForObject(clip, objectName, phaseOffset = 0) {
  const tracks = clip.tracks.map((track) => {
    const cloned = track.clone();
    cloned.name = cloned.name.replace(/^[^.]+(?=\.morphTargetInfluences)/, objectName);
    return cloned;
  });
  const remapped = new THREE.AnimationClip(`${objectName}_${clip.name}`, clip.duration, tracks);
  remapped.userData = { phaseOffset };
  return remapped;
}

function replaceCardsWithBakedJellyfish(model, bakedGltf) {
  if (!USE_BAKED_GEONODES_JELLYFISH || !USE_JELLYFISH_CARD_MODE) return;
  const sourceMesh = bakedGltf.scene.getObjectByProperty('type', 'Mesh')
    || bakedGltf.scene.getObjectByProperty('isMesh', true);
  if (!sourceMesh?.geometry) return;

  const sourceGeometry = sourceMesh.geometry;
  const clips = bakedGltf.animations || [];
  let replaced = 0;
  const box = new THREE.Box3();
  const size = new THREE.Vector3();

  model.traverse((object) => {
    const match = object.name.match(/^spiral_project_card_(\d+)_image$/i);
    if (!object.isMesh || !match) return;
    const index = Number(match[1]);
    object.geometry = sourceGeometry;
    object.geometry.computeBoundingBox();
    object.updateMorphTargets?.();
    object.material = makeBakedJellyfishMaterial(index);
    if (sourceMesh.morphTargetDictionary) {
      object.morphTargetDictionary = { ...sourceMesh.morphTargetDictionary };
    }
    if (!object.morphTargetInfluences?.length) {
      object.morphTargetInfluences = new Array(object.geometry.morphAttributes?.position?.length || 0).fill(0);
    }
    object.frustumCulled = false;
    object.renderOrder = 2;
    object.userData.isBakedGeonodesJellyfish = true;
    object.userData.jellyfishTopDrift = false;
    object.userData.jellyfishAnimationWeight = 1;

    box.setFromObject(object);
    box.getSize(size);
    const localHeight = Math.max(size.y, size.x, 0.001);
    const targetHeight = (getResponsiveSettings().portrait ? 3.35 : 2.85) * 2;
    const scaleFactor = targetHeight / localHeight;
    object.scale.multiplyScalar(scaleFactor);
    object.userData.baseVisualHeight = targetHeight;
    object.userData.jellyfishHoodHeightRatio = 0.28;
    object.updateMatrix();
    object.updateMatrixWorld(true);

    const mixer = new THREE.AnimationMixer(object);
    sceneAnimationMixers.push(mixer);
    const actions = clips.map((clip, clipIndex) => {
      const remapped = remapMorphClipForObject(clip, object.name, index * 0.19 + clipIndex * 0.03);
      const action = mixer.clipAction(remapped);
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.enabled = true;
      action.setEffectiveWeight(1);
      action.play();
      action.time = (index * 0.19) % Math.max(remapped.duration, 0.001);
      return action;
    });
    if (actions.length) {
      jellyfishAnimationActions.set(index, actions);
    }
    replaced += 1;
  });

  floatingCards.forEach((card) => {
    if (!card.object.userData.isBakedGeonodesJellyfish) return;
    card.baseScale = card.object.scale.clone();
  });
  window.__BAKED_GEONODES_JELLYFISH = {
    replaced,
    clips: clips.map((clip) => clip.name),
    sourceVertices: sourceGeometry.attributes.position?.count || 0
  };
}

function updateJellyfishAnimationForHeight(object, index) {
  if (!USE_JELLYFISH_CARD_MODE || !/_image$/i.test(object.name)) return;
  const actions = jellyfishAnimationActions.get(index);
  if (!actions?.length) return;
  const topDrift = object.userData.jellyfishTopDrift
    ? object.position.y > 3.25
    : object.position.y > 4.55;
  object.userData.jellyfishTopDrift = topDrift;
  const currentWeight = object.userData.jellyfishAnimationWeight ?? 1;
  const targetWeight = topDrift ? 0 : 1;
  const nextWeight = THREE.MathUtils.lerp(currentWeight, targetWeight, topDrift ? 0.08 : 0.16);
  object.userData.jellyfishAnimationWeight = nextWeight;
  actions.forEach((action) => {
    action.enabled = true;
    action.paused = false;
    action.setEffectiveWeight(nextWeight);
  });
}

function getCardFloatOffset(index, elapsed, basePosition = new THREE.Vector3()) {
  const target = getJellyfishSpiralTargetPosition(index, elapsed, basePosition);
  return target.sub(basePosition);
}

function getJellyfishSpiralTargetPosition(index, elapsed, basePosition = new THREE.Vector3()) {
  const spineCenter = new THREE.Vector3(0.18, 0, 0.10);
  const baseRadial = new THREE.Vector3(basePosition.x - spineCenter.x, 0, basePosition.z - spineCenter.z);
  if (baseRadial.lengthSq() < 0.01) {
    baseRadial.set(index % 2 === 0 ? 1 : -1, 0, 0.35);
  }
  const baseAngle = Math.atan2(baseRadial.z, baseRadial.x);
  const radiusBand = 4.45 + ((index % 5) - 2) * 0.23;
  const baseRadius = THREE.MathUtils.lerp(THREE.MathUtils.clamp(baseRadial.length(), 3.9, 5.2), radiusBand, 0.62);
  const phase = index * 0.173 + (index % 5) * 0.071;
  const motionTime = elapsed * CARD_MOTION_SPEED * 0.055;
  const direction = index % 2 === 0 ? 1 : -1;
  const rawProgress = phase + motionTime * direction;
  const cycle = ((rawProgress % 2) + 2) % 2;
  const wrapped = cycle <= 1 ? cycle : 2 - cycle;
  const vertical = THREE.MathUtils.lerp(-5.35, 5.35, wrapped);
  const helixTurns = 1.85;
  const angle = baseAngle + direction * rawProgress * Math.PI * 2 * helixTurns;
  const radius = baseRadius + Math.sin(wrapped * Math.PI * 2 + index * 0.9) * 0.08;
  return new THREE.Vector3(
    spineCenter.x + Math.cos(angle) * radius,
    vertical,
    spineCenter.z + Math.sin(angle) * radius
  );
}

function getCardFloatRotation(index, elapsed) {
  const phase = index * 0.73;
  const motionTime = elapsed * CARD_MOTION_SPEED;
  return new THREE.Euler(
    Math.sin(motionTime * 0.68 + phase) * 0.035,
    Math.sin(motionTime * 0.60 + phase * 1.4) * 0.050,
    Math.cos(motionTime * 0.72 + phase * 0.8) * 0.031,
    'XYZ'
  );
}

function getJellyfishPathQuaternion(index, elapsed, basePosition, baseQuaternion) {
  if (!USE_BAKED_GEONODES_JELLYFISH || !USE_JELLYFISH_CARD_MODE) {
    return baseQuaternion.clone().multiply(new THREE.Quaternion().setFromEuler(getCardFloatRotation(index, elapsed)));
  }
  const current = getJellyfishSpiralTargetPosition(index, elapsed, basePosition);
  const next = getJellyfishSpiralTargetPosition(index, elapsed + 0.42, basePosition);
  const direction = next.sub(current).normalize();
  if (direction.lengthSq() < 0.001) {
    return baseQuaternion.clone();
  }
  const localBellAxis = new THREE.Vector3(0, 1, 0).applyQuaternion(baseQuaternion).normalize();
  const swimQuaternion = new THREE.Quaternion().setFromUnitVectors(localBellAxis, direction);
  const targetQuaternion = swimQuaternion.multiply(baseQuaternion);
  const readableQuaternion = baseQuaternion.clone().slerp(targetQuaternion, 0.46);
  const waterRoll = new THREE.Quaternion().setFromAxisAngle(direction, Math.sin(elapsed * 0.42 + index) * 0.055);
  return waterRoll.multiply(readableQuaternion);
}

function getBodyForCard(index) {
  return cardBodies.find((body) => body.index === index);
}

function getCardRouteOffset(index, elapsed, basePosition) {
  const body = getBodyForCard(index);
  const collisionOffset = body && !USE_BAKED_GEONODES_JELLYFISH ? body.collisionOffset : new THREE.Vector3();
  const swimImpulse = USE_BAKED_GEONODES_JELLYFISH
    ? new THREE.Vector3()
    : getJellyfishSwimImpulseOffset(index, elapsed, basePosition);
  return getCardFloatOffset(index, elapsed, basePosition)
    .add(swimImpulse)
    .add(collisionOffset);
}

function swimPulseShape(edge0, edge1, value) {
  const x = THREE.MathUtils.clamp((value - edge0) / Math.max(edge1 - edge0, 0.0001), 0, 1);
  return x * x * (3 - 2 * x);
}

function getJellyfishSwimImpulseOffset(index, elapsed, basePosition) {
  if (!USE_BAKED_GEONODES_JELLYFISH || !USE_JELLYFISH_CARD_MODE) {
    return new THREE.Vector3();
  }
  const clipDuration = 76 / 24;
  const phase = ((elapsed + index * 0.19) / clipDuration) % 1;
  const contraction = swimPulseShape(0.12, 0.18, phase) * (1 - swimPulseShape(0.20, 0.29, phase));
  const recoilRise = swimPulseShape(0.17, 0.28, phase) * (1 - swimPulseShape(0.31, 0.58, phase));
  const passiveSink = swimPulseShape(0.46, 0.92, phase) * (1 - swimPulseShape(0.92, 1.0, phase));
  const topFade = 1 - swimPulseShape(3.65, 5.1, basePosition.y);
  const impulse = (contraction * 0.36 + recoilRise * 0.58 - passiveSink * 0.16) * topFade;
  const lateralLag = Math.sin(phase * Math.PI * 2 + index * 0.6) * 0.045 * topFade;
  return new THREE.Vector3(lateralLag, impulse, 0);
}

function keepJellyfishAwayFromUi(position) {
  if (!USE_JELLYFISH_CARD_MODE) return position;
  if (USE_BAKED_GEONODES_JELLYFISH) return position;
  const settings = getResponsiveSettings();
  const leftLimit = window.innerWidth < 700 ? -2.55 : -2.85;
  const rightLimit = window.innerWidth < 700 ? 3.35 : 5.35;
  const lowerLimit = settings.portrait ? -4.65 : -4.80;
  const upperLimit = settings.portrait ? 5.55 : 5.85;
  position.x = THREE.MathUtils.clamp(position.x, leftLimit, rightLimit);
  position.y = THREE.MathUtils.clamp(position.y, lowerLimit, upperLimit);
  if (window.innerWidth >= 700 && position.x < 1.05 && position.y < 0.35) {
    position.x = 1.05;
  }
  if (window.innerWidth >= 700) {
    const projected = position.clone().project(camera);
    const screenX = (projected.x * 0.5 + 0.5) * window.innerWidth;
    const screenY = (-projected.y * 0.5 + 0.5) * window.innerHeight;
    if (screenX < 285 && screenY > 500) {
      position.x += 3.8;
    }
  }
  return position;
}

function keepJellyfishOrbitDistance(position) {
  if (!USE_BAKED_GEONODES_JELLYFISH || !USE_JELLYFISH_CARD_MODE) return position;
  const spineCenter = new THREE.Vector3(0.18, 0, 0.10);
  const radial = new THREE.Vector3(position.x - spineCenter.x, 0, position.z - spineCenter.z);
  const distance = radial.length();
  if (distance < 0.01) {
    radial.set(1, 0, 0);
  } else {
    radial.normalize();
  }
  const targetDistance = THREE.MathUtils.clamp(distance, 3.55, 5.35);
  position.x = spineCenter.x + radial.x * targetDistance;
  position.z = spineCenter.z + radial.z * targetDistance;
  return position;
}

function captureHoveredCardPose(index) {
  floatingCards.forEach(({ object, index: cardIndex }) => {
    if (cardIndex !== index) return;
    object.userData.hoverFreezePosition = object.position.clone();
    object.userData.hoverFreezeQuaternion = object.quaternion.clone();
  });
  cardTextSprites.forEach((sprite) => {
    if ((sprite.userData.railIndex ?? 0) !== index) return;
    sprite.userData.hoverFreezePosition = sprite.position.clone();
  });
}

function setHoveredCardIndex(index) {
  if (index !== null && index !== hoveredCardIndex) {
    captureHoveredCardPose(index);
  }
  hoveredCardIndex = index;
  cardBodies.forEach((body) => {
    body.hoverTarget = body.index === index ? 1 : 0;
  });
  renderer.domElement.style.cursor = index === null ? 'default' : 'pointer';
  window.__HOVERED_CARD_INDEX = hoveredCardIndex;
}

function updateHoveredCardFromPointer() {
  if (!pointerInsideScene || !cardHoverObjects.length) {
    if (hoveredCardIndex !== null) setHoveredCardIndex(null);
    return;
  }
  raycaster.setFromCamera(pointer, camera);
  const intersections = raycaster.intersectObjects(cardHoverObjects, false);
  const cardHit = intersections.find((hit) => /^spiral_project_card_(\d+)_(image|edge)$/i.test(hit.object.name));
  const nextIndex = cardHit ? Number(cardHit.object.name.match(/^spiral_project_card_(\d+)_/i)[1]) : null;
  if (nextIndex !== null) {
    if (nextIndex !== hoveredCardIndex) setHoveredCardIndex(nextIndex);
    return;
  }
  if (hoveredCardIndex !== null) {
    const hovered = floatingCards.find((card) => card.index === hoveredCardIndex)?.object;
    if (hovered) {
      const rect = renderer.domElement.getBoundingClientRect();
      const projected = hovered.getWorldPosition(new THREE.Vector3()).project(camera);
      const screenX = (projected.x * 0.5 + 0.5) * rect.width;
      const screenY = (-projected.y * 0.5 + 0.5) * rect.height;
      const distance = Math.hypot(screenX - pointerScreen.x, screenY - pointerScreen.y);
      const hoverHoldRadius = hovered.userData.isBakedGeonodesJellyfish ? 920 : 330;
      if (distance < hoverHoldRadius) return;
    }
  }
  setHoveredCardIndex(null);
}

function getCardFocusPosition(sourcePosition) {
  const cameraDirection = new THREE.Vector3();
  camera.getWorldDirection(cameraDirection).normalize();
  const depth = sourcePosition.clone().sub(camera.position).dot(cameraDirection);
  const screenCenter = camera.position.clone().add(cameraDirection.clone().multiplyScalar(depth));
  const approachPull = USE_BAKED_GEONODES_JELLYFISH ? getResponsiveSettings().focusPull * 4.0 : getResponsiveSettings().focusPull;
  return screenCenter.add(cameraDirection.clone().multiplyScalar(-approachPull));
}

function getCardFocusQuaternion() {
  return camera.getWorldQuaternion(new THREE.Quaternion());
}

function getJellyfishScreenFacingQuaternion(objectPosition, baseQuaternion) {
  const toCamera = camera.position.clone().sub(objectPosition).normalize();
  if (toCamera.lengthSq() < 0.001) {
    return getCardFocusQuaternion();
  }
  const localBellAxis = new THREE.Vector3(0, 1, 0).applyQuaternion(baseQuaternion).normalize();
  return new THREE.Quaternion().setFromUnitVectors(localBellAxis, toCamera).multiply(baseQuaternion);
}

function getJellyfishHoverScaleBoost(object, baseScale) {
  if (!USE_BAKED_GEONODES_JELLYFISH || !object.userData.isBakedGeonodesJellyfish) {
    return getResponsiveSettings().focusScaleBoost;
  }
  const baseHeight = object.userData.baseVisualHeight || 1;
  const screenWorldHeight = viewHeight / Math.max(camera.zoom, 0.001);
  const targetHoodHeight = screenWorldHeight * 0.72;
  const hoodRatio = object.userData.jellyfishHoodHeightRatio || 0.28;
  const currentHoodHeight = Math.max(baseHeight * hoodRatio, 0.001);
  const targetMultiplier = THREE.MathUtils.clamp(targetHoodHeight / currentHoodHeight, 2.8, 4.2);
  return Math.max(0, targetMultiplier - 1);
}

function setObjectDepthTest(object, enabled) {
  const materials = Array.isArray(object.material) ? object.material : [object.material];
  materials.forEach((material) => {
    if (!material) return;
    if (material.userData.baseDepthTest === undefined) {
      material.userData.baseDepthTest = material.depthTest;
    }
    material.depthTest = enabled;
    material.needsUpdate = true;
  });
}

function restoreObjectDepthTest(object) {
  const materials = Array.isArray(object.material) ? object.material : [object.material];
  materials.forEach((material) => {
    if (!material || material.userData.baseDepthTest === undefined) return;
    material.depthTest = material.userData.baseDepthTest;
    material.needsUpdate = true;
  });
}

function updateCardHoverTargets() {
  cardBodies.forEach((body) => {
    const approachEase = USE_BAKED_GEONODES_JELLYFISH ? 0.18 : 0.24;
    body.hoverAmount = THREE.MathUtils.lerp(body.hoverAmount, body.hoverTarget, approachEase);
    if (body.hoverTarget === 1 && body.hoverAmount > 0.985) {
      body.hoverAmount = 1;
    }
    if (body.hoverTarget === 0 && body.hoverAmount < 0.018) {
      body.hoverAmount = 0;
    }
  });
}

function resolveFloatingCardCollisions(elapsed) {
  if (!cardBodies.length) return;
  const spineCenter = new THREE.Vector3(0.18, 0, 0.10);
  const spineRadius = 2.45;
  const spineYMin = -6.15;
  const spineYMax = 6.15;

  cardBodies.forEach((body) => {
    body.collisionVelocity.add(body.collisionOffset.clone().multiplyScalar(-0.024));
    body.collisionVelocity.multiplyScalar(0.82);
    body.collisionOffset.add(body.collisionVelocity);
    if (body.collisionOffset.length() > 2.85) {
      body.collisionOffset.setLength(2.85);
    }
    body.targetPosition.copy(body.basePosition)
      .add(getCardFloatOffset(body.index, elapsed, body.basePosition))
      .add(body.collisionOffset);
  });

  for (let first = 0; first < cardBodies.length; first += 1) {
    const a = cardBodies[first];
    for (let second = first + 1; second < cardBodies.length; second += 1) {
      const b = cardBodies[second];
      const delta = a.targetPosition.clone().sub(b.targetPosition);
      delta.y *= 0.82;
      delta.z *= 0.58;
      const distance = Math.max(delta.length(), 0.001);
      const minDistance = a.radius + b.radius;
      if (distance < minDistance) {
        const direction = delta.normalize();
        const strength = (minDistance - distance) * 0.082;
        a.collisionVelocity.add(direction.clone().multiplyScalar(strength));
        b.collisionVelocity.add(direction.clone().multiplyScalar(-strength));
      }

      const screenDelta = new THREE.Vector3(
        a.targetPosition.x - b.targetPosition.x,
        (a.targetPosition.y - b.targetPosition.y) * 0.86,
        0
      );
      const screenDistance = Math.max(screenDelta.length(), 0.001);
      const minScreenDistance = Math.max(a.radius, b.radius) * 1.55;
      if (screenDistance < minScreenDistance) {
        const screenDirection = screenDelta.normalize();
        const screenStrength = (minScreenDistance - screenDistance) * 0.055;
        const screenCorrection = screenDirection.clone().multiplyScalar((minScreenDistance - screenDistance) * 0.075);
        a.collisionOffset.add(screenCorrection);
        b.collisionOffset.add(screenCorrection.clone().multiplyScalar(-1));
        a.collisionVelocity.add(screenDirection.clone().multiplyScalar(screenStrength));
        b.collisionVelocity.add(screenDirection.clone().multiplyScalar(-screenStrength));
      }
    }
  }

  cardBodies.forEach((body) => {
    const position = body.targetPosition;
    if (position.y < spineYMin - body.radius || position.y > spineYMax + body.radius) return;
    const flatDelta = new THREE.Vector3(position.x - spineCenter.x, 0, position.z - spineCenter.z);
    const flatDistance = Math.max(flatDelta.length(), 0.001);
    const minDistance = spineRadius + body.radius * 0.88;
    const yPush = position.y > 0 ? 0.035 : -0.035;
    if (flatDistance < minDistance) {
      const direction = flatDelta.normalize();
      const strength = (minDistance - flatDistance) * 0.168;
      body.collisionVelocity.add(new THREE.Vector3(direction.x, yPush, direction.z).multiplyScalar(strength));
    }

    const screenDistanceFromSpine = Math.abs(position.x - spineCenter.x);
    const minScreenSpineDistance = body.radius * 1.45 + 1.40;
    if (screenDistanceFromSpine < minScreenSpineDistance) {
      const side = position.x >= spineCenter.x ? 1 : -1;
      const screenStrength = (minScreenSpineDistance - screenDistanceFromSpine) * 0.150;
      const screenCorrection = new THREE.Vector3(
        side * (minScreenSpineDistance - screenDistanceFromSpine) * 0.220,
        yPush * 0.55,
        0
      );
      body.collisionOffset.add(screenCorrection);
      body.collisionVelocity.add(new THREE.Vector3(side * screenStrength, yPush * 0.55, 0));
    }
  });

  window.__CARD_COLLISION_STATE = cardBodies.map((body) => ({
    index: body.index,
    offset: body.collisionOffset.toArray(),
    velocity: body.collisionVelocity.toArray()
  }));
}

function updateFloatingCards(elapsed) {
  if (!floatingCards.length) return;
  if (pointerInsideScene && pointerNeedsRaycast) {
    updateHoveredCardFromPointer();
    pointerNeedsRaycast = false;
  }
  if (USE_BAKED_GEONODES_JELLYFISH) {
    cardBodies.forEach((body) => {
      body.collisionOffset.multiplyScalar(0.88);
      body.collisionVelocity.multiplyScalar(0.72);
    });
  } else {
    resolveFloatingCardCollisions(elapsed);
  }
  updateCardHoverTargets();
  floatingCards.forEach(({ object, index, basePosition, baseQuaternion, baseScale, baseRenderOrder }) => {
    const body = getBodyForCard(index);
    const hoverAmount = body ? body.hoverAmount : 0;
    let routePosition = basePosition.clone().add(getCardRouteOffset(index, elapsed, basePosition));
    keepJellyfishAwayFromUi(routePosition);
    keepJellyfishOrbitDistance(routePosition);
    if (USE_BAKED_GEONODES_JELLYFISH) {
      if (!object.userData.smoothRoutePosition) {
        object.userData.smoothRoutePosition = object.position.clone();
      }
      object.userData.smoothRoutePosition.lerp(routePosition, 0.075);
      routePosition = object.userData.smoothRoutePosition.clone();
    }
    const routeQuaternion = getJellyfishPathQuaternion(index, elapsed, basePosition, baseQuaternion);
    const freezePosition = object.userData.hoverFreezePosition;
    if (freezePosition && hoverAmount > 0.001) {
      const focusPosition = getCardFocusPosition(freezePosition);
      object.position.copy(routePosition).lerp(focusPosition, hoverAmount);
      const focusQuaternion = object.userData.isBakedGeonodesJellyfish
        ? getJellyfishScreenFacingQuaternion(object.position, baseQuaternion)
        : getCardFocusQuaternion();
      object.quaternion.copy(routeQuaternion).slerp(focusQuaternion, hoverAmount);
    } else {
      object.position.copy(routePosition);
      object.quaternion.copy(routeQuaternion);
    }
    if (body?.hoverTarget === 0 && hoverAmount < 0.015) {
      delete object.userData.hoverFreezePosition;
      delete object.userData.hoverFreezeQuaternion;
    }
    object.scale.copy(baseScale);
    object.scale.multiplyScalar(1 + hoverAmount * getJellyfishHoverScaleBoost(object, baseScale));
    updateJellyfishAnimationForHeight(object, index);
    if (hoverAmount > 0.02) {
      object.renderOrder = 120 + (object.name.includes('_edge') ? 1 : 2);
      setObjectDepthTest(object, false);
    } else {
      object.renderOrder = baseRenderOrder;
      restoreObjectDepthTest(object);
    }
    object.updateMatrix();
  });
}

function getReferenceCardRailCards() {
  const cards = [];
  const settings = getResponsiveSettings();
  REFERENCE_CARD_LAYOUT.forEach((item) => {
    const match = item.name.match(/^spiral_project_card_(\d+)_image$/i);
    if (!match) {
      return;
    }
    const center = new THREE.Vector3().fromArray(item.position);
    const radial = new THREE.Vector3(center.x, 0, center.z);
    if (radial.lengthSq() < 0.01) {
      radial.set(0, 0, 1);
    }
    radial.normalize();
    center.add(radial.multiplyScalar(settings.cardDistanceOffset));
    cards.push({
      index: Number(match[1]),
      center,
      size: new THREE.Vector3(PUBLISHED_CARD_TARGET_WIDTH, PUBLISHED_CARD_TARGET_WIDTH, PUBLISHED_CARD_TARGET_WIDTH)
    });
  });
  cards.sort((a, b) => a.index - b.index);
  return cards;
}

function buildCardRail(model) {
  if (BAKED_SPINE_VIEW && USE_BAKED_SCENE_CAMERA) {
    cardRail.stops = [];
    cardRail.ready = false;
    window.__CARD_RAIL = [];
    updateRailControl();
    return;
  }
  const cards = USE_BAKED_GEONODES_JELLYFISH ? getReferenceCardRailCards() : [];
  if (!cards.length) {
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
  }
  cards.sort((a, b) => a.index - b.index);
  if (!BAKED_SPINE_VIEW && !USE_JELLYFISH_CARD_MODE) {
    addReadableCardText(cards);
  }
  cardRail.stops = cards.map(({ center }, index) => {
    const radial = new THREE.Vector3(center.x, 0, center.z);
    if (radial.lengthSq() < 0.01) {
      radial.set(0, 0, 1);
    }
    radial.normalize();
    const cameraPosition = center.clone()
      .add(radial.multiplyScalar((index % 2 ? 7.05 : 6.65) * getResponsiveSettings().cameraDistanceScale))
      .add(new THREE.Vector3(index % 2 ? -0.22 : 0.18, 0.08, 0));
    const target = center.clone().add(new THREE.Vector3(index % 2 ? -0.18 : 0.14, -0.06, 0));
    return {
      camera: cameraPosition,
      target,
      baseZoom: index === 0 ? 1.62 : 1.54,
      zoom: (index === 0 ? 1.62 : 1.54) * getResponsiveSettings().railZoomScale
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
    const width = Math.max(size.x, size.z, 2.2) * (order === 0 ? 1.08 : 0.82) * getResponsiveSettings().textScale;
    sprite.scale.set(width, width * 0.60, 1);
    sprite.userData.railIndex = order;
    sprite.userData.floatBasePosition = sprite.position.clone();
    sprite.userData.floatBaseScale = sprite.scale.clone();
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
    const body = getBodyForCard(sprite.userData.railIndex ?? 0);
    const hoverAmount = body ? body.hoverAmount : 0;
    sprite.material.opacity = THREE.MathUtils.lerp(sprite.material.opacity, Math.max(targetOpacity, hoverAmount * 0.92), 0.12);
    if (sprite.userData.floatBasePosition) {
      const routePosition = sprite.userData.floatBasePosition.clone().add(
        getCardRouteOffset(sprite.userData.railIndex ?? 0, shaderClock.value, sprite.userData.floatBasePosition)
      );
      const freezePosition = sprite.userData.hoverFreezePosition;
      if (freezePosition && hoverAmount > 0.001) {
        const focusPosition = getCardFocusPosition(freezePosition);
        sprite.position.copy(routePosition).lerp(focusPosition, hoverAmount);
      } else {
        sprite.position.copy(routePosition);
      }
      if (body?.hoverTarget === 0 && hoverAmount < 0.015) {
        delete sprite.userData.hoverFreezePosition;
      }
      if (sprite.userData.floatBaseScale) {
        sprite.scale.copy(sprite.userData.floatBaseScale).multiplyScalar(1 + hoverAmount * 0.12);
        sprite.renderOrder = hoverAmount > 0.02 ? 130 : 5;
      }
    }
  });
}

function moveRail(direction) {
  if (!cardRail.ready) {
    return;
  }
  setRailTarget(cardRail.targetIndex + direction);
}

function updatePointerFromEvent(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointerScreen.x = event.clientX - rect.left;
  pointerScreen.y = event.clientY - rect.top;
  pointer.x = (pointerScreen.x / rect.width) * 2 - 1;
  pointer.y = -(pointerScreen.y / rect.height) * 2 + 1;
  pointerInsideScene = true;
  pointerNeedsRaycast = true;
}

function clearHoveredCard() {
  pointerInsideScene = false;
  pointerNeedsRaycast = false;
  setHoveredCardIndex(null);
  renderer.domElement.style.cursor = 'default';
}

railPrev?.addEventListener('click', () => moveRail(-1));
railNext?.addEventListener('click', () => moveRail(1));

renderer.domElement.addEventListener('pointermove', updatePointerFromEvent, { passive: true });
renderer.domElement.addEventListener('pointerleave', clearHoveredCard, { passive: true });
renderer.domElement.addEventListener('pointercancel', clearHoveredCard, { passive: true });

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
const floatingCards = [];
const cardBodies = [];
const cardHoverObjects = [];
const sceneAnimationMixers = [];
const jellyfishAnimationActions = new Map();
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

function makeNebulaTexture(seedColorA, seedColorB) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 512, 512);
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 46; i++) {
    const x = 150 + Math.random() * 260;
    const y = 80 + Math.random() * 360;
    const r = 55 + Math.random() * 150;
    const color = Math.random() > 0.5 ? seedColorA : seedColorB;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color.replace('ALPHA', String(0.035 + Math.random() * 0.05)));
    g.addColorStop(1, color.replace('ALPHA', '0'));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeParticleClusterTexture(seedColorA, seedColorB, seedColorC) {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'screen';

  for (let i = 0; i < 240; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.pow(Math.random(), 1.9) * 270;
    const x = 320 + Math.cos(angle) * radius * (0.68 + Math.random() * 0.46);
    const y = 320 + Math.sin(angle) * radius * (0.42 + Math.random() * 0.64);
    const dot = 1.2 + Math.random() * 4.2;
    const color = i % 3 === 0 ? seedColorA : i % 3 === 1 ? seedColorB : seedColorC;
    ctx.fillStyle = color.replace('ALPHA', String(0.16 + Math.random() * 0.42));
    ctx.beginPath();
    ctx.arc(x, y, dot, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 12; i++) {
    const x = 190 + Math.random() * 260;
    const y = 140 + Math.random() * 360;
    const r = 80 + Math.random() * 140;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
    glow.addColorStop(0, seedColorA.replace('ALPHA', '0.08'));
    glow.addColorStop(1, seedColorB.replace('ALPHA', '0'));
    ctx.fillStyle = glow;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
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

  centralDust(2100, 17.6, 2.55, 3.55, 5.7, 0.46);
  centralDust(900, 18.8, 4.15, 2.2, 3.7, 0.26, 0.25);
  dustCloud(900, [-2.9, 3.6, 1.4], [2.0, 4.8, 1.5], 6.2, 0.50, violetTeal, [0.16, 0, 0]);
  dustCloud(760, [2.55, 2.9, -1.2], [2.4, 5.4, 1.7], 5.4, 0.46, violetTeal, [-0.12, 0, 0]);
  dustCloud(760, [-2.6, -3.1, 1.9], [2.2, 4.0, 1.6], 5.0, 0.40, deepGreen, [0.20, 0, 0]);
  dustCloud(700, [3.1, -2.7, 1.6], [2.1, 3.8, 1.5], 5.5, 0.42, deepGreen, [-0.18, 0, 0]);
  dustCloud(880, [0.4, 6.25, 2.4], [5.2, 1.8, 1.8], 4.4, 0.48, violetTeal);
  dustCloud(680, [-1.0, 1.2, 4.6], [5.8, 8.4, 0.7], 2.9, 0.22, violetTeal, [0.05, 0, 0], true);
  dustCloud(520, [3.1, -0.8, 4.2], [3.4, 6.4, 0.6], 3.2, 0.25, deepGreen, [-0.10, 0, 0], true);
  dustCloud(760, [4.9, 5.2, 0.8], [3.8, 3.2, 1.2], 4.8, 0.54, violetTeal, [-0.22, 0, 0]);
  dustCloud(560, [-4.6, 5.7, 1.8], [3.0, 2.8, 1.1], 4.2, 0.42, violetTeal, [0.16, 0, 0]);
  dustCloud(520, [5.2, -0.1, 2.8], [2.2, 5.2, 0.9], 4.1, 0.36, deepGreen, [-0.12, 0, 0], true);
  verticalStream(720, -3.8, 1.0, -5.7, 6.6, 0.72, 3.9, 0.44, violetTeal);
  verticalStream(640, 3.8, -1.4, -5.4, 6.2, 0.68, 3.7, 0.40, deepGreen);
  verticalStream(420, 0.25, 4.4, -4.4, 5.6, 1.2, 2.6, 0.18, violetTeal, true);

  const clusterTexA = makeParticleClusterTexture('rgba(40,230,255,ALPHA)', 'rgba(206,68,255,ALPHA)', 'rgba(50,255,168,ALPHA)');
  const clusterTexB = makeParticleClusterTexture('rgba(50,255,156,ALPHA)', 'rgba(54,96,255,ALPHA)', 'rgba(255,150,78,ALPHA)');
  const clusterTexC = makeParticleClusterTexture('rgba(155,86,255,ALPHA)', 'rgba(39,219,255,ALPHA)', 'rgba(255,82,178,ALPHA)');
  [
    { tex: clusterTexA, pos: [-3.9, 4.7, 3.2], rot: [0.12, -0.18, -0.22], scale: [4.9, 3.2, 1], opacity: 0.58, order: 4 },
    { tex: clusterTexB, pos: [4.9, 3.9, 2.8], rot: [-0.06, 0.22, 0.18], scale: [5.8, 3.7, 1], opacity: 0.52, order: 4 },
    { tex: clusterTexC, pos: [4.8, -1.6, 4.4], rot: [0.08, -0.12, -0.28], scale: [3.4, 5.0, 1], opacity: 0.34, order: 7 },
    { tex: clusterTexA, pos: [-2.2, -4.2, 4.1], rot: [-0.10, 0.18, 0.18], scale: [3.9, 2.4, 1], opacity: 0.28, order: 7 },
    { tex: clusterTexB, pos: [0.2, 6.4, 3.6], rot: [0.02, 0.02, 0.02], scale: [6.4, 2.3, 1], opacity: 0.40, order: 4 },
    { tex: clusterTexC, pos: [1.9, 5.8, 4.8], rot: [0.06, -0.18, 0.36], scale: [3.8, 3.0, 1], opacity: 0.30, order: 7 }
  ].forEach((cluster) => {
    const material = new THREE.MeshBasicMaterial({
      map: cluster.tex,
      transparent: true,
      opacity: cluster.opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: cluster.order < 7,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    mesh.position.set(...cluster.pos);
    mesh.rotation.set(...cluster.rot);
    mesh.scale.set(...cluster.scale);
    mesh.renderOrder = cluster.order;
    scene.add(mesh);
  });

  const nebulaTexA = makeNebulaTexture('rgba(0,185,255,ALPHA)', 'rgba(160,45,255,ALPHA)');
  const nebulaTexB = makeNebulaTexture('rgba(0,255,145,ALPHA)', 'rgba(30,120,255,ALPHA)');
  [
    { tex: nebulaTexA, pos: [-5.2, -5.6, 2.9], rot: [0.3, 0.2, -0.55], scale: [7.0, 1.74, 1], opacity: 0.18 },
    { tex: nebulaTexB, pos: [4.8, 4.5, -2.4], rot: [-0.2, 0.45, 0.72], scale: [6.4, 1.55, 1], opacity: 0.15 },
    { tex: nebulaTexA, pos: [0.2, 7.1, 4.2], rot: [0.2, -0.35, 1.0], scale: [5.8, 1.36, 1], opacity: 0.12 },
    { tex: nebulaTexB, pos: [3.8, -4.2, 3.8], rot: [-0.26, -0.24, 0.18], scale: [5.6, 1.34, 1], opacity: 0.12 }
  ].forEach((cloud) => {
    const material = new THREE.MeshBasicMaterial({
      map: cloud.tex,
      transparent: true,
      opacity: cloud.opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    mesh.position.set(...cloud.pos);
    mesh.rotation.set(...cloud.rot);
    mesh.scale.set(...cloud.scale);
    mesh.renderOrder = 0;
    scene.add(mesh);
  });

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

function makeBakedSceneCardMaterial(label, source) {
  const isEdge = label.includes('edge') || label.includes('thin_cyan_edge');
  const material = new THREE.MeshBasicMaterial({
    name: source.name,
    map: source.map || null,
    color: isEdge ? new THREE.Color(0x1aa6aa) : new THREE.Color(0x6f9698),
    transparent: true,
    opacity: isEdge ? 0.34 : 0.46,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
    fog: true
  });
  if (material.map) {
    material.map.colorSpace = THREE.SRGBColorSpace;
    material.map.needsUpdate = true;
  }
  return material;
}
function toDisplayMaterial(label, source) {
  const isSpaceDust = /star|dust|constellation|milky|deep_space/.test(label);
  const isJellyfish = /jellyfish/.test(label);
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
    const isReferenceParticle = /reference_volume_dust|reference_spine_spark|reference_particle/.test(label);
    const isReferenceRibbon = /reference_depth_ribbon|reference_ribbon|milky_way_ribbon/.test(label);
    if (isSpaceDust) {
      displayColor.offsetHSL(0.0, 0.22, 0.04);
    }
    const material = new THREE.MeshBasicMaterial({
      name: source.name,
      map: source.map || null,
      color: displayColor,
      transparent: true,
      opacity: isReferenceParticle ? 0.58 : isReferenceRibbon ? 0.10 : isSpaceDust ? 0.14 : 0.72,
      blending: isSpaceDust ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    return material;
  }

  if (isJellyfish) {
    const color = /fine_pink_tentacles|pink_fine|fine_strands/.test(label)
      ? 0xff6fae
      : /orange_ruffle|orange_tentacles|real_orange/.test(label)
        ? 0xff6f96
        : /peach_oral|warm_inner/.test(label)
          ? 0xff8a62
          : /lilac/.test(label)
            ? 0xa58cff
            : /rose/.test(label)
              ? 0xff6da8
              : (source.color || new THREE.Color(0x72d9ea));
    const opacity = /fine_pink_tentacles|pink_fine|fine_strands/.test(label)
      ? 0.34
      : /orange_ruffle|orange_tentacles|real_orange/.test(label)
        ? 0.42
        : /peach_oral|warm_inner/.test(label)
          ? 0.44
          : 0.38;
    return new THREE.MeshBasicMaterial({
      name: source.name,
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending
    });
  }

  if (isCard) {
    if (BAKED_SPINE_VIEW && RESTORE_SCENE_CARDS && !USE_SCENE_CARD_SOURCE_MATERIALS) {
      return makeBakedSceneCardMaterial(label, source);
    }
    if (BAKED_SPINE_VIEW && RESTORE_SCENE_CARDS && USE_SCENE_CARD_SOURCE_MATERIALS) {
      source.side = THREE.DoubleSide;
      source.transparent = source.transparent || source.opacity < 1;
      source.depthWrite = !source.transparent;
      return source;
    }
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

function loadBakedGeonodesJellyfishAsset() {
  return new Promise((resolve, reject) => {
    loader.load(
      `./assets/baked_geonodes_jellyfish.glb?v=${ASSET_VERSION}`,
      resolve,
      undefined,
      reject
    );
  });
}

loadBlenderMaterialOverrides().then((materialOverrides) => loader.load(
  `./assets/scene.glb?v=${ASSET_VERSION}`,
  async (gltf) => {
    const model = gltf.scene;
    window.__THREE_MODEL = model;
    model.traverse((object) => {
      if (/^ui_prompt|^ui_option_|^ui_top/.test(object.name)) {
        object.visible = false;
        return;
      }
      if (/^hidden_nih_source/i.test(object.name)) {
        object.visible = false;
        return;
      }
      const repeatedVertebraMatch = object.name.match(/^real_nih_lumbar_vertebra_(\d+)_/i);
      if (repeatedVertebraMatch && Number(repeatedVertebraMatch[1]) >= 12) {
        object.visible = false;
        return;
      }
      if (BAKED_SPINE_VIEW && !RESTORE_SCENE_CARDS && /spiral_project_card|reference_card/i.test(object.name)) {
        object.visible = false;
        return;
      }
      if (/constellation/i.test(object.name)) {
        object.visible = false;
        return;
      }
      if (/reference_depth_ribbon/i.test(object.name)) {
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

    applyPublishedCardLayout(model);
    if (USE_BAKED_GEONODES_JELLYFISH) {
      const bakedJellyfish = await loadBakedGeonodesJellyfishAsset();
      registerBlenderJellyfishAnimations(model, []);
      replaceCardsWithBakedJellyfish(model, bakedJellyfish);
    } else {
      registerBlenderJellyfishAnimations(model, gltf.animations);
    }
    scene.add(model);
    buildCardRail(model);

    const box = new THREE.Box3().setFromObject(model);
    window.__SCENE_BOUNDS = {
      min: box.min.toArray(),
      max: box.max.toArray(),
      size: box.getSize(new THREE.Vector3()).toArray()
    };
    if (BAKED_SPINE_VIEW && USE_BAKED_SCENE_CAMERA) {
      const importedCamera = gltf.cameras?.find((item) => item.isOrthographicCamera) || null;
      const cameraTarget = new THREE.Vector3(0.02, 0.42, 0.02);
      if (importedCamera) {
        importedCamera.updateMatrixWorld(true);
        importedCamera.getWorldPosition(camera.position);
        importedCamera.getWorldQuaternion(camera.quaternion);
        const importedHeight = Math.max(0.001, importedCamera.top - importedCamera.bottom);
        camera.zoom = viewHeight / importedHeight;
      } else {
        camera.position.set(1.82, 0.60, 7.05);
        camera.lookAt(cameraTarget);
        camera.zoom = viewHeight / 9.84375;
      }
      cardRail.currentPosition.copy(camera.position);
      cardRail.targetPosition.copy(camera.position);
      cardRail.currentTarget.copy(cameraTarget);
      cardRail.targetTarget.copy(cameraTarget);
      cardRail.currentZoom = camera.zoom;
      cardRail.targetZoom = camera.zoom;
      camera.updateProjectionMatrix();
      controls.target.copy(cameraTarget);
      controls.update();
      window.__BAKED_SPINE_VIEW = {
        mode: importedCamera ? 'imported-blender-camera' : 'converted-blender-camera-fallback',
        position: camera.position.toArray(),
        target: cameraTarget.toArray(),
        importedHeight: importedCamera ? importedCamera.top - importedCamera.bottom : 9.84375,
        zoom: camera.zoom
      };
    } else {
      camera.lookAt(cardRail.currentTarget);
    }

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
  const delta = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.elapsedTime;
  shaderClock.value = elapsed;
  sceneAnimationMixers.forEach((mixer) => mixer.update(delta));
  cyanLight.intensity = 5.2 + Math.sin(elapsed * 0.7) * 0.4;
  magentaLight.intensity = 5.0 + Math.cos(elapsed * 0.58) * 0.45;
  violetLight.intensity = 5.0 + Math.sin(elapsed * 0.43) * 0.35;
  spineMagenta.intensity = 5.8 + Math.sin(elapsed * 0.9) * 0.6;
  spineBlue.intensity = 5.2 + Math.cos(elapsed * 0.72) * 0.5;
  updateFloatingCards(elapsed);
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
  const settings = getResponsiveSettings();
  publishResponsiveView();
  viewHeight = settings.viewHeight;
  viewWidth = getViewWidth(viewHeight);
  camera.left = viewWidth / -2;
  camera.right = viewWidth / 2;
  camera.top = viewHeight / 2;
  camera.bottom = viewHeight / -2;
  if (cardRail.ready) {
    cardRail.stops.forEach((stop) => {
      if (typeof stop.baseZoom === 'number') {
        stop.zoom = stop.baseZoom * settings.railZoomScale;
      }
    });
    const activeStop = cardRail.stops[cardRail.targetIndex];
    if (activeStop) {
      cardRail.targetZoom = activeStop.zoom;
      cardRail.currentZoom = activeStop.zoom;
      camera.zoom = activeStop.zoom;
    }
  }
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  composer.setSize(window.innerWidth, window.innerHeight);
  bloomPass.setSize(window.innerWidth, window.innerHeight);
});
















