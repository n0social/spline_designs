import * as THREE from 'three';

const container = document.getElementById('canvas-container');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  200,
);
camera.position.set(0, 0, 28);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

const pointer = new THREE.Vector2(0, 0);
const targetPointer = new THREE.Vector2(0, 0);

window.addEventListener('pointermove', (e) => {
  targetPointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  targetPointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

function createDottedWave({
  color,
  yOffset,
  amplitude,
  phaseOffset,
  dotSize,
  opacity,
}) {
  const cols = 140;
  const rows = 3;
  const xSpan = 42;
  const zStep = 0.35;

  const count = cols * rows;
  const positions = new Float32Array(count * 3);
  const baseX = new Float32Array(count);
  const baseZ = new Float32Array(count);

  let i = 0;
  for (let row = 0; row < rows; row++) {
    const z = (row - (rows - 1) / 2) * zStep;
    for (let col = 0; col < cols; col++) {
      const t = col / (cols - 1);
      const x = (t - 0.5) * xSpan;
      const idx = i * 3;
      positions[idx] = x;
      positions[idx + 1] = yOffset;
      positions[idx + 2] = z;
      baseX[i] = x;
      baseZ[i] = z;
      i++;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color,
    size: dotSize,
    sizeAttenuation: true,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);

  return {
    points,
    geometry,
    baseX,
    baseZ,
    amplitude,
    phaseOffset,
    yOffset,
    cols,
    rows,
    xSpan,
  };
}

const waveFront = createDottedWave({
  color: 0xffffff,
  yOffset: 1.35,
  amplitude: 1.85,
  phaseOffset: 0,
  dotSize: 0.11,
  opacity: 0.95,
});

const waveBack = createDottedWave({
  color: 0x6a6a6a,
  yOffset: -0.15,
  amplitude: 1.55,
  phaseOffset: Math.PI * 0.35,
  dotSize: 0.1,
  opacity: 0.55,
});

scene.add(waveBack.points);
scene.add(waveFront.points);

const waves = [waveFront, waveBack];

const WAVE_LENGTH = 9.5;
const FLOW_SPEED = 1.35;

function updateWave(wave, time) {
  const pos = wave.geometry.attributes.position.array;
  const { baseX, baseZ, amplitude, phaseOffset, yOffset, cols, rows } = wave;

  const pointerInfluence = pointer.x * 0.35;
  const amp = amplitude * (1 + pointer.y * 0.12);

  let i = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = baseX[i];
      const z = baseZ[i];
      const phase =
        (x / WAVE_LENGTH) * Math.PI * 2 -
        time * FLOW_SPEED +
        phaseOffset +
        pointerInfluence;

      const y =
        yOffset +
        Math.sin(phase) * amp +
        Math.sin(phase * 0.5 + z) * 0.15;

      const idx = i * 3;
      pos[idx + 1] = y;
      i++;
    }
  }

  wave.geometry.attributes.position.needsUpdate = true;
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  pointer.lerp(targetPointer, 0.06);
  const t = clock.getElapsedTime();

  for (const wave of waves) {
    updateWave(wave, t);
  }

  camera.position.x = pointer.x * 0.8;
  camera.position.y = pointer.y * 0.4;
  camera.lookAt(0, 0.4, 0);

  renderer.render(scene, camera);
}

animate();

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

window.addEventListener('resize', onResize);
