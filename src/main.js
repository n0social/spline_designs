import * as THREE from "three";

const canvas = document.getElementById("wave-canvas");

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 1);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
camera.position.set(0, 0, 9.5);
camera.lookAt(0, 0, 0);

const pointer = new THREE.Vector2(0, 0);
const targetTilt = new THREE.Vector2(0, 0);
const currentTilt = new THREE.Vector2(0, 0);

function onPointerMove(event) {
  const x = event.clientX / window.innerWidth;
  const y = event.clientY / window.innerHeight;
  pointer.set(x * 2 - 1, -(y * 2 - 1));
  targetTilt.set(pointer.x * 0.35, pointer.y * 0.2);
}

window.addEventListener("pointermove", onPointerMove, { passive: true });

function createDotTexture() {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.85)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(c);
  texture.needsUpdate = true;
  return texture;
}

const dotTexture = createDotTexture();

/**
 * Builds a row of dots that follow a traveling sine wave along X.
 */
function createWavePoints({
  color,
  yOffset,
  amplitude,
  dotSize,
  opacity,
  phaseOffset = 0,
}) {
  const countX = 220;
  const spanX = 52;
  const positions = new Float32Array(countX * 3);

  for (let i = 0; i < countX; i++) {
    const t = i / (countX - 1);
    const x = (t - 0.5) * spanX;
    positions[i * 3] = x;
    positions[i * 3 + 1] = yOffset;
    positions[i * 3 + 2] = 0;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color,
    size: dotSize,
    map: dotTexture,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, material);
  points.userData = {
    countX,
    spanX,
    yOffset,
    amplitude,
    phaseOffset,
    positions,
  };
  return points;
}

const waveFront = createWavePoints({
  color: 0xffffff,
  yOffset: 1.65,
  amplitude: 2.85,
  dotSize: 0.52,
  opacity: 0.92,
  phaseOffset: 0,
});

const waveBack = createWavePoints({
  color: 0x5c5c5c,
  yOffset: -1.65,
  amplitude: 2.65,
  dotSize: 0.46,
  opacity: 0.5,
  phaseOffset: Math.PI * 0.35,
});

const waveGroup = new THREE.Group();
waveGroup.scale.set(1.08, 1.08, 1);
waveGroup.add(waveBack);
waveGroup.add(waveFront);
scene.add(waveGroup);

function updateWaveGeometry(points, time) {
  const { countX, spanX, yOffset, amplitude, phaseOffset, positions } =
    points.userData;
  const wavelength = 7.5;
  const speed = 1.05;

  for (let i = 0; i < countX; i++) {
    const t = i / (countX - 1);
    const x = (t - 0.5) * spanX;
    const phase = (x / wavelength) * Math.PI * 2 - time * speed + phaseOffset;
    const y = yOffset + Math.sin(phase) * amplitude;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = 0;
  }

  points.geometry.attributes.position.needsUpdate = true;
}

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resize);
resize();

const clock = new THREE.Clock();

function animate() {
  const elapsed = clock.getElapsedTime();

  currentTilt.lerp(targetTilt, 0.06);
  waveGroup.rotation.x = currentTilt.y * 0.15;
  waveGroup.rotation.y = currentTilt.x * 0.12;
  waveGroup.position.x = currentTilt.x * 0.25;
  waveGroup.position.y = currentTilt.y * 0.15;

  updateWaveGeometry(waveFront, elapsed);
  updateWaveGeometry(waveBack, elapsed);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
