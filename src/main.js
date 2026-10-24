import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { VignetteShader } from "three/addons/shaders/VignetteShader.js";

const LIFTED_BLACK = 0x0a0a0c;
const WAVE_VERTEX = /* glsl */ `
  attribute float aAlong;
  uniform float uTime;
  uniform float uYOffset;
  uniform float uAmplitude;
  uniform float uPhaseOffset;
  uniform float uWavelength;
  uniform float uSpeed;
  uniform float uSpanX;
  uniform float uZ;
  uniform float uPointScale;
  varying float vAlpha;

  float edgeEnvelope(float t) {
    return smoothstep(0.0, 0.12, t) * smoothstep(1.0, 0.88, t);
  }

  void main() {
    float x = (aAlong - 0.5) * uSpanX;
    float phase = (x / uWavelength) * 6.28318530718 - uTime * uSpeed + uPhaseOffset;
    float wave = sin(phase);
    float env = edgeEnvelope(aAlong);
    vec3 pos = vec3(x, uYOffset + wave * uAmplitude * env, uZ);

    float crest = 0.72 + 0.28 * max(0.0, wave);
    vAlpha = env * crest;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = uPointScale * crest * env * (300.0 / -mvPosition.z);
  }
`;

const WAVE_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    float core = smoothstep(0.5, 0.22, d);
    float alpha = core * uOpacity * vAlpha;
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

const reduceMotionQuery = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);
let reduceMotion = reduceMotionQuery.matches;
reduceMotionQuery.addEventListener("change", (event) => {
  reduceMotion = event.matches;
  if (reduceMotion) {
    targetTilt.set(0, 0);
    frozenTime = clock.getElapsedTime();
    stopLoop();
    updateScene(0);
    renderFrame();
  } else {
    startLoop();
  }
});

const canvas = document.getElementById("wave-canvas");

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2)
);
renderer.setClearColor(LIFTED_BLACK, 1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.92;

const scene = new THREE.Scene();
scene.background = new THREE.Color(LIFTED_BLACK);
scene.fog = new THREE.FogExp2(LIFTED_BLACK, 0.038);

const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
camera.position.set(0, 0.28, 10.2);
camera.lookAt(0, 0, 0);

const pointer = new THREE.Vector2(0, 0);
const targetTilt = new THREE.Vector2(0, 0);
const currentTilt = new THREE.Vector2(0, 0);

function onPointerMove(event) {
  if (reduceMotion) return;
  const x = event.clientX / window.innerWidth;
  const y = event.clientY / window.innerHeight;
  pointer.set(x * 2 - 1, -(y * 2 - 1));
  targetTilt.set(pointer.x * 0.22, pointer.y * 0.14);
}

window.addEventListener("pointermove", onPointerMove, { passive: true });

function createShaderWave(config) {
  const countX =
    window.innerWidth < 768 ? Math.floor(config.countX * 0.75) : config.countX;
  const along = new Float32Array(countX);
  for (let i = 0; i < countX; i++) {
    along[i] = i / (countX - 1);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("aAlong", new THREE.BufferAttribute(along, 1));
  geometry.setDrawRange(0, countX);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uYOffset: { value: config.yOffset },
      uAmplitude: { value: config.amplitude },
      uPhaseOffset: { value: config.phaseOffset },
      uWavelength: { value: config.wavelength },
      uSpeed: { value: config.speed },
      uSpanX: { value: config.spanX },
      uZ: { value: config.z },
      uPointScale: { value: config.pointScale },
      uColor: { value: new THREE.Color(config.color) },
      uOpacity: { value: config.opacity },
    },
    vertexShader: WAVE_VERTEX,
    fragmentShader: WAVE_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  return new THREE.Points(geometry, material);
}

const waveFront = createShaderWave({
  countX: 240,
  color: 0xe8e4df,
  yOffset: 1.72,
  amplitude: 3.05,
  phaseOffset: 0,
  wavelength: 7.4,
  speed: 0.95,
  spanX: 54,
  z: 0.35,
  pointScale: 5.2,
  opacity: 0.88,
});

const waveBack = createShaderWave({
  countX: 220,
  color: 0x6a6662,
  yOffset: -1.78,
  amplitude: 2.75,
  phaseOffset: Math.PI * 0.35,
  wavelength: 7.8,
  speed: 0.88,
  spanX: 52,
  z: -0.75,
  pointScale: 4.4,
  opacity: 0.42,
});

const waveGroup = new THREE.Group();
waveGroup.scale.set(1.12, 1.12, 1);
waveGroup.add(waveBack);
waveGroup.add(waveFront);
scene.add(waveGroup);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.35,
  0.55,
  0.82
);
composer.addPass(bloomPass);

const vignettePass = new ShaderPass(VignetteShader);
vignettePass.uniforms.offset.value = 0.92;
vignettePass.uniforms.darkness.value = 1.35;
composer.addPass(vignettePass);

composer.addPass(new OutputPass());

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, w < 768 ? 1.5 : 2)
  );
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  composer.setSize(w, h);
  bloomPass.setSize(w, h);
  renderFrame();
}

window.addEventListener("resize", resize);
resize();

const clock = new THREE.Clock();
let frozenTime = 0;
let animationId = null;
let tabVisible = !document.hidden;

document.addEventListener("visibilitychange", () => {
  tabVisible = !document.hidden;
  if (tabVisible && !reduceMotion) {
    startLoop();
  } else {
    stopLoop();
    if (tabVisible) renderFrame();
  }
});

function damp(current, target, lambda, delta) {
  return current + (target - current) * (1 - Math.exp(-lambda * delta));
}

function updateScene(delta) {
  const elapsed = reduceMotion ? frozenTime : clock.getElapsedTime();

  if (!reduceMotion) {
    currentTilt.x = damp(currentTilt.x, targetTilt.x, 7.5, delta);
    currentTilt.y = damp(currentTilt.y, targetTilt.y, 7.5, delta);
    waveGroup.rotation.x = currentTilt.y * 0.1;
    waveGroup.rotation.y = currentTilt.x * 0.08;
    waveGroup.position.x = currentTilt.x * 0.18;
    waveGroup.position.y = currentTilt.y * 0.12;
  } else {
    waveGroup.rotation.set(0, 0, 0);
    waveGroup.position.set(0, 0, 0);
  }

  waveFront.material.uniforms.uTime.value = elapsed;
  waveBack.material.uniforms.uTime.value = elapsed;
}

function renderFrame() {
  composer.render();
}

function animate() {
  if (!tabVisible) return;
  const delta = Math.min(clock.getDelta(), 0.05);
  updateScene(delta);
  renderFrame();
  if (!reduceMotion) {
    animationId = requestAnimationFrame(animate);
  }
}

function startLoop() {
  stopLoop();
  if (reduceMotion) {
    frozenTime = clock.getElapsedTime();
    updateScene(0);
    renderFrame();
    return;
  }
  clock.start();
  animationId = requestAnimationFrame(animate);
}

function stopLoop() {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

if (reduceMotion) {
  frozenTime = 0;
  updateScene(0);
  renderFrame();
} else {
  startLoop();
}
