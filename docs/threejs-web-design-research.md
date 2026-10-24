# Three.js for Graphics-Forward Portfolio Web Design

Research notes for the **spline_designs** Vite + Three.js wave demo (`cursor/interactive-wave-design-e7c7`). Goal: elevate a dotted sine-wave hero from “tutorial demo” to “award-grade interface” without abandoning a lean vanilla stack.

---

## Executive summary

- **Three.js belongs in the hero, not the whole site.** Keep résumé content, navigation, forms, and SEO in the DOM; use WebGL as a cinematic layer or scroll-pinned stage.
- **Professional portfolios invest in composition, color science, and motion choreography**—not raw particle counts. Post-processing, restrained palettes, and scroll- or intent-driven animation read as intentional.
- **The current wave demo has a strong typographic welcome** but reads amateur in 3D: flat Z=0 layout, CPU-updated points, additive “sparkle soup,” no depth cues, no reduced-motion path for WebGL, and continuous full-screen rendering.
- **Elegant dotted / line-art waves** are usually built with **Line2 + LineMaterial**, **custom point shaders** (size/opacity along the curve), **curl-noise flow fields** (GPU), or **MeshLine** when width tapers or textures ride the stroke.
- **Vanilla Vite can match R3F portfolios** if you adopt the same production habits: capped DPR, visibility-based render pausing, `matchMedia` for motion, `EffectComposer` bloom, and GSAP/Lenis only when scroll narrative needs them.

---

## Role of Three.js in Portfolios

| Role | What it signals | When to use |
|------|-----------------|-------------|
| **Hero atmosphere** | Brand, craft, motion literacy | Landing above the fold |
| **Scroll narrative** | Story beats tied to progress | Case studies, “about” journeys |
| **Interactive proof** | Technical depth (shaders, GPU) | Developer / creative-tech portfolios |
| **Decorative background** | Texture without stealing focus | Behind typography (low contrast) |

**What top 2024–2026 examples do**

- **Multi-pass pipelines:** scene render → bloom / vignette / grain → `OutputPass` (color space + tone mapping). See [Three.js post-processing manual](https://threejs.org/manual/en/post-processing/Post-Processing.html).
- **Scroll as director:** GSAP ScrollTrigger (or Lenis-synced scroll) writes a `0→1` progress ref; the render loop reads it to move camera, morph uniforms, or swap “acts” of copy—without React re-renders per frame ([HxnDev portfolio pattern](https://github.com/HxnDev/hxndev.github.io)).
- **Shader-forward identity:** domain-warped noise backdrops, glass/refraction, particle morphs driven by `uProgress` in the vertex shader ([particle morph case study](https://jackadamczyk.vercel.app/work/particle-morph)).
- **DOM + WebGL layering:** HTML for semantics and accessibility; canvas `aria-hidden` when purely decorative; critical UI never trapped inside WebGL hit targets.

**Philosophy (from mature R3F governance):** the canvas is isolated and lazy; business state stays out of the 60 FPS loop; **aesthetics over triangle count**—lighting and postFX often matter more than geometry ([r3f-rules SKILL](https://github.com/autcir/r3f-rules/blob/main/SKILL.md)).

---

## Visual Design Principles (scale, contrast, motion)

### Scale and composition

- **Establish a clear focal hierarchy:** one primary subject (wave crest, logo mark, crystal), secondary depth layer, tertiary grain/vignette.
- **Use camera distance intentionally:** orthographic or long-lens perspective reduces “video game” distortion; slight off-center framing feels editorial.
- **Safe zones for type:** keep 40–50% of the viewport relatively calm (lower motion, lower luminance) so serif/display copy remains legible.
- **World units vs screen units:** dot/line sizes in **world units** with attenuation scale consistently across viewports; mixing huge world-space points with tiny FOV reads as blown-out blobs.

### Contrast and color

- **Avoid pure #000 + pure #FFF only:** professional dark sites use **lifted blacks** (`#0a0a0c`, `#121218`) and **tinted whites** (`#e8e4df`) so bloom and gradients have headroom.
- **Accent discipline:** one accent hue (cyan, amber, violet) at &lt;10% of pixels; greys carry structure.
- **Color management:** `renderer.outputColorSpace = THREE.SRGBColorSpace`, tone mapping (`ACESFilmicToneMapping` or `AgX`), and `OutputPass` in post—otherwise additive stacks clip harshly.

### Motion

- **Framerate-independent smoothing:** `lerp` with `1 - Math.exp(-λ * delta)` instead of fixed `0.06` per frame.
- **Motion with purpose:** parallax follows pointer only when it reinforces depth; otherwise it feels like a screensaver.
- **Choreography:** ease-in intro (CSS or GSAP), then settle to subtle ambient motion; sync text reveals to wave phase or scroll progress.
- **Reduced motion:** honor `prefers-reduced-motion` for **both** CSS and WebGL—static frame or single-phase wave, no pointer parallax ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion), [web.dev](https://web.dev/articles/prefers-reduced-motion), [IGC a11y notes](https://www.intelligentgraphicandcode.com/development/threejs-interfaces/accessibility)).

---

## Technical Patterns (portfolio-grade)

### Shaders

- **Custom `ShaderMaterial` / `Points`:** per-vertex size, opacity, or color from curve parameter `t`; fragment disc with soft falloff (better than `PointsMaterial` + canvas texture alone).
- **Flow fields:** curl noise advection for organic ribbons ([spite curl scribbles](https://github.com/spite/codevember-2017/blob/master/curl-scribbles/index.html), [GPGPU particles discourse](https://discourse.threejs.org/t/gpgpu-particles/90558)).
- **Scroll uniforms:** `uProgress` from scroll instead of `uTime` for morphs and camera ([Three.js discourse — scroll morph](https://discourse.threejs.org/t/how-to-control-a-particle-morph-custom-shader-with-mouse-scroll-instead-of-automatic-animation/86338)).

### Particles and instancing

- **`THREE.InstancedMesh`** for many identical markers (grid dots, constellation) with one draw call.
- **`THREE.Points` + custom attributes:** `aPhase`, `aRow`, `aWeight` for wave rows without duplicating logic in JS loops.
- **GPGPU (advanced):** ping-pong render targets update positions; CPU only sets uniforms ([gpuCurlRibbons](https://github.com/YuFengjie97/gpuCurlRibbons), [WebGPU particles lab](https://threesided.com/lab/webgpu-particles/)).

### Lines and dotted waves

| Technique | Strengths | Use when |
|-----------|-----------|----------|
| **`Line2` + `LineMaterial`** ([docs](https://threejs.org/docs/#api/en/lines/Line2)) | Screen- or world-width strokes, dashes, vertex colors, `alphaToCoverage` | Continuous wave **lines**, dashed “dotted” via `dashed` + `dashSize` / `gapSize` |
| **`MeshLine` / `meshline`** ([pmndrs](https://github.com/pmndrs/meshline)) | Variable width along path, textures, partial `visibility`, trail `advance()` | Tapered ribbons, textured strokes, animated dash offset |
| **`THREE.Line` + `LineDashedMaterial`** | Simplest | Prototypes only—thin, inconsistent width on many GPUs |
| **Points along curve** | True circular dots, easy density control | **Dotted** sine waves (current approach), star fields |
| **Custom point shader** | Per-dot size from curvature or depth, soft merge without additive blowout | Polished dot waves without postFX |
| **`troika-three-text`** | Crisp SDF 3D text in scene | 3D letterforms integrated with waves (not needed if HTML type is preferred) |

### Post-processing

- **`EffectComposer` → `RenderPass` → `UnrealBloomPass` → `OutputPass`** ([manual](https://threejs.org/manual/pages/post-processing.html), [unreal bloom example](https://github.com/mrdoob/three.js/blob/dev/examples/webgl_postprocessing_unreal_bloom.html)).
- **Selective bloom:** bright points on dark bg; tune `threshold` so grey back wave does not bloom equally with white front wave.
- **Light vignette / noise:** subtle; validates “cinematic” without obscuring copy.
- **Alternative:** `postprocessing` npm package (used with vanilla in [@pmndrs/timeline vanilla tutorial](https://pmndrs.github.io/timeline/tutorials/7-vanilla))—optional dependency.

### Scroll-linked animation

- **Lenis** smooth scroll + **GSAP ScrollTrigger** for pinned sections and progress ([morph-particles template](https://github.com/MisterPrada/morph-particles)).
- **Vanilla:** `scrollY / (document.height - innerHeight)` → uniform; **IntersectionObserver** to pause WebGL when off-screen.
- **Pattern:** one tall scroll container, `position: sticky` viewport, progress ref read in `animate()`—mirrors React “cinematic stage” without R3F.

### Performance on mobile

From [mobile 3D checklist](https://alphaexpansion.io/guides/mobile-performance-checklist-for-interactive-3d-websites) and community practice:

- Cap `devicePixelRatio` (already `min(dpr, 2)` in demo—consider **1.5 on mobile** or tiered quality).
- **Pause rendering** when tab hidden (`visibilitychange`) or canvas off-screen.
- **On-demand render** if scene is static under reduced motion.
- Reduce point count / row count on narrow viewports; avoid per-frame full-buffer CPU updates when a shader can displace Y.
- **Poster image** or LCP-friendly static frame until WebGL ready.
- Lazy-load Three.js if hero is below fold (not this hero, but relevant for full portfolios).

### Accessibility

- **Decorative canvas:** `aria-hidden="true"` (already in `index.html`)—ensure no essential info only in WebGL.
- **`prefers-reduced-motion`:** CSS handled for welcome text; **extend to JS:** freeze `elapsed`, disable tilt, optionally show static wave phase.
- **Pointer:** `touch-action` and don’t block scroll unless intentional; hero uses `touch-action: none` on canvas—acceptable only if page is single-screen; revisit for multi-section sites.
- **Keyboard / focus:** links and CTAs in DOM with visible focus rings.

### Layering HTML typography over WebGL

Current stack (good baseline):

```html
<div id="app">
  <canvas id="wave-canvas" aria-hidden="true"></canvas>
  <div class="welcome">…</div>
</div>
```

```css
.welcome { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
```

Enhancements:

- `mix-blend-mode: soft-light` or subtle `text-shadow` / `backdrop-filter` on a **narrow** overlay panel if contrast fails on bright blooms.
- Match WebGL grey (`0x5c5c5c`) to CSS `rgba()` for coherent depth row.
- Consider `will-change: transform` only during intro animation, then remove.

---

## Critique: Current Wave Demo (`src/main.js`, `src/style.css`)

Constructive read against professional bar.

### What already works

- **Typography:** Cormorant Garamond, wide letter-spacing, blur-to-sharp welcome animation feels editorial.
- **Reduced motion for CSS:** `@media (prefers-reduced-motion: reduce)` on `.welcome__text`.
- **Basics:** DPR cap, resize handler, separated front/back waves with phase offset, gentle pointer parallax.
- **DOM layering:** copy above canvas, decorative canvas hidden from AT.

### What reads amateur (and why)

| Area | Observation | Professional direction |
|------|-------------|------------------------|
| **Dot sizing** | `dotSize` 0.46–0.52 in world units + radial canvas texture + **additive blending** → large, mushy, overlapping halos; no per-dot variation. | Softer **normal** or **custom shader** alpha; size modulated by `sin(phase)` or depth; smaller front row, tighter gradient in texture. |
| **Camera** | `PerspectiveCamera(48°, z=9.5)` looking at origin; waves live on **Z=0 plane** only. | Slight camera Y offset, **narrower FOV** (35–42°), or mild orthographic; separate Z per row + subtle fog for depth. |
| **Color** | Binary white vs flat grey on `#000`; no tone mapping or lifted black. | Tinted background, accent on one wave only, `OutputPass` / tone mapping; optional bloom on white row only. |
| **Motion** | Infinite sine scroll at fixed speed; parallax always on; **no reduced-motion for WebGL**. | Scroll- or time-limited intro; freeze under `prefers-reduced-motion`; slower speed on mobile. |
| **Composition** | Two parallel rows, centered, equal visual weight; occupies middle band only. | Rule-of-thirds offset; amplitude envelope along X (fade at edges); third layer (particles/fine dots) for depth. |
| **Depth / postFX** | No fog, no bloom, no vignette; `alpha: false` opaque black. | Subtle fog (`FogExp2`), selective bloom, film grain at 2–3% opacity. |
| **Performance** | **440 points × 2**, CPU rewrite every frame + **continuous rAF** even when static. | Shader displacement; render on demand when reduced motion; pause when tab hidden. |
| **Code structure** | Duplicated `createWavePoints`; magic numbers inline. | Shared uniforms config; single material with instance attributes for rows. |

### Specific code hotspots

- **CPU vertex loop** (`updateWaveGeometry`): fine for hundreds of points, but pro sites move displacement to GPU for scalability and cleaner motion.
- **`AdditiveBlending` + `depthWrite: false`:** classic “glowy particles” look; without bloom pipeline it often looks **flat and milky** rather than luminous.
- **`antialias: true` on renderer** but points are alpha sprites—MSAA barely helps; **FXAA/SMAA** pass or denser dots with smaller alpha core helps more.
- **Pointer mapping:** linear map to tilt; no easing on pointer stop beyond lerp—acceptable, but combined with always-on wave feels “demo loop.”

---

## Reference Techniques: Elegant Dotted Wave / Line Art

### 1. Sine / parametric waves with `Points` (current family)

- **When:** Simple, readable, few hundred dots; full control in JS.
- **Upgrade:** custom `Points` shader: `gl_PointSize` from attribute; fragment `smoothstep` circle; **no additive** unless paired with bloom.

### 2. `Line2` + dashed `LineMaterial`

- **When:** You want **continuous** stroke with **evenly spaced dashes** that feel like line art, not billboards.
- **Note:** Update `material.resolution` on resize; `computeLineDistances()` for dashes ([LineMaterial](https://threejs.org/docs/#api/en/lines/LineMaterial)).

### 3. MeshLine / meshline package

- **When:** Tapered width, texture along stroke, animated dash offset, partial reveal.
- **Skip when:** Simple equal dots—overhead of triangle strips.

### 4. Curl noise flow fields

- **When:** Organic scribbles, ribbons, “living” line art ([curl scribbles](https://github.com/spite/codevember-2017/blob/master/curl-scribbles/index.html)).
- **Cost:** CPU integration per step (old) or GPGPU (modern). Overkill for a clean sine portfolio hero unless brand is “generative.”

### 5. Custom vertex shader displacement

- **When:** Keep `BufferGeometry` static XZ grid; displace Y in shader with `sin(x * freq + time)`—**zero CPU attribute updates**.

### 6. Instanced quads / discs

- **When:** Thousands of dots with one draw call; per-instance phase and color.

### 7. troika-three-text

- **When:** 3D text curving with the wave in world space.
- **Skip when:** HTML typography is already strong (this project)—use CSS.

### 8. Spline / glTF hero (future per README)

- **When:** Designer-owned scenes, complex lighting; export Draco-compressed glTF.
- **Tradeoff:** Heavier load; less procedural; better for product showcases than infinite waves.

---

## Anti-Patterns

1. **Full-site WebGL** with navigation and text only in textures—SEO, a11y, and maintainability suffer.
2. **Uncapped DPR** on retina mobile—GPU heat and jank.
3. **Always-on rAF** for static or off-screen scenes.
4. **Additive particles without tone mapping / bloom**—grey mud and clipped whites.
5. **Ignoring `prefers-reduced-motion`** for camera shake, parallax, and auto-rotation.
6. **Blocking scroll** (`overflow: hidden` on full portfolio) without a scroll narrative reason.
7. **Huge unoptimized glTF** on first paint—no Draco, no poster frame.
8. **`touch-action: none`** on full-page canvas when users need to scroll past the hero.
9. **Copy baked into shaders** instead of DOM—hurts localization and screen readers.
10. **OrbitControls on portfolio heroes** unless the work is explicitly 3D exploration.

---

## Upgrading the Wave Concept (concrete steps)

Ordered for maximum perceived quality per effort on **vanilla Vite + three**.

### Phase A — Quick wins (1–2 sessions)

1. **Color & renderer:** `scene.background` / CSS `#0a0a0a`; `outputColorSpace = SRGBColorSpace`; mild `toneMappingExposure`.
2. **Motion a11y:** `const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches`; if true, freeze time, zero tilt, call `render()` once or only on resize.
3. **Visibility:** `document.addEventListener('visibilitychange', …)` pause rAF when hidden.
4. **Dot material:** switch to **NormalBlending**; reduce `opacity`; shrink texture gradient falloff; optional per-row size multiplier on crest.
5. **Composition:** amplitude envelope `* smoothstep(0, 0.15, t) * smoothstep(1, 0.85, t)` so waves fade at edges.
6. **Fog:** `scene.fog = new THREE.FogExp2(0x0a0a0a, 0.04)`; darken back wave via fog factor in shader or lower contrast grey.

### Phase B — Polish (shader + post)

7. **Shader displacement:** static X positions in buffer; vertex shader sets `y = yOffset + amp * sin(...)`; remove CPU loop.
8. **PostFX:** `EffectComposer` + `UnrealBloomPass` (low strength, high threshold) + `OutputPass`.
9. **Camera:** FOV 38–42; position `(0, 0.3, 10)`; back wave `position.z = -0.8`.
10. **Intro sync:** drive welcome CSS vars or class from `elapsed` so text peaks when front wave crest hits center.

### Phase C — Portfolio narrative (optional)

11. **Lenis + GSAP** only if adding scroll sections; map scroll to `waveSpeed` or camera Z.
12. **Instancing** if adding starfield / fine grain dots (second system).
13. **Quality tiers:** `navigator.hardwareConcurrency`, `dpr`, row `countX` reduced on mobile.

### Phase D — Ecosystem (optional rewrites)

14. **React Three Fiber + drei:** declarative scene, `useFrame`, `@react-three/postprocessing`—worth it if the rest of the site is React.
15. **Spline export:** replace procedural waves for designer iterations; keep same HTML overlay pattern.

---

## Tooling

| Tool | Role | Needed for vanilla Vite wave? |
|------|------|-------------------------------|
| **three** | Core | Yes (already) |
| **vite** | Bundler, HMR | Yes |
| **vite-plugin-glsl** | Import `.glsl` | Optional when custom shaders grow |
| **@react-three/fiber** | React renderer | No unless migrating to React |
| **@react-three/drei** | Helpers (OrbitControls, Text, etc.) | No for current demo |
| **@react-three/postprocessing** | Bloom in R3F | No—use three/addons `EffectComposer` |
| **gsap** + **ScrollTrigger** | Scroll choreography | Optional until multi-section scroll |
| **lenis** | Smooth scroll | Optional; pairs with GSAP |
| **postprocessing** (vanilla lib) | Alternative composer | Optional |
| **meshline** | Fancy strokes | Only if switching from points to ribbons |
| **troika-three-text** | 3D text | Optional |
| **lil-gui** | Dev tuning | Dev only |
| **Spline** | Designer 3D | Future per project README |

---

## Learning Resources

- [Three.js Manual — Creating a scene](https://threejs.org/manual/en/introduction/Creating-a-scene.html)
- [Three.js Manual — Post-processing](https://threejs.org/manual/pages/post-processing.html)
- [Three.js examples — fat lines (`webgl_lines_fat`)](https://threejs.org/examples/?q=line#webgl_lines_fat)
- [Three.js examples — unreal bloom](https://threejs.org/examples/?q=bloom#webgl_postprocessing_unreal_bloom)
- [Three.js discourse — GPGPU particles](https://discourse.threejs.org/t/gpgpu-particles/90558)
- [web.dev — prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion)
- [Bruno Simon–style course ecosystem](https://threejs-journey.com/) (paid, industry standard for fundamentals)
- [Poimandres docs](https://docs.pmnd.rs/) — R3F, meshline, postprocessing when adopting that stack
- Reference portfolios: [Aaron Cunningham](https://aaronjcunningham.com) (R3F + GLSL), [HxnDev](https://hxndev.github.io/) (scroll-driven crystal + aurora shader)

---

## Sources

1. Three.js documentation — Lines, post-processing, manual  
2. MDN — `prefers-reduced-motion`  
3. web.dev — reduced motion article  
4. Intelligent Graphic and Code — Three.js accessibility  
5. Alpha Expansion — mobile performance checklist (2026)  
6. GitHub — HxnDev/hxndev.github.io, AaronJCunningham/portfolio, MisterPrada/morph-particles  
7. Jack Adamczyk — particle morph case study  
8. Three.js discourse — scroll-controlled morph, GPGPU particles  
9. spite — curl scribbles (Codevember 2017)  
10. pmndrs — meshline, timeline vanilla tutorial  
11. YuFengjie97 — gpuCurlRibbons  
12. threesided.com — WebGPU particles lab  
13. autcir/r3f-rules — quality governance SKILL  
14. Local codebase — `src/main.js`, `src/style.css`, `index.html` (this repo)

---

*Document generated for internal design/engineering alignment on the interactive wave hero. Last updated: 2026-10-24.*
