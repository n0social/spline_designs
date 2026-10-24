# A-Frame for 3D Graphic Web Design (Portfolio Context)

**Research date:** October 2026  
**Repo context:** `spline_designs` — Vite + Three.js welcome wave hero; planned Spline integration.

## Interpretation note

The phrase **“using a frame”** is read here as **[Mozilla A-Frame](https://aframe.io)** (the WebXR/HTML 3D framework), which matches portfolio tooling discussions alongside Three.js and Spline.

If the intent was **compositional framing** in 3D design (camera framing, matte borders, portal windows, picture-in-scene), that is a separate art-direction topic. A-Frame can support it (`<a-camera>`, curved planes, masked viewports, embedded scenes), but this document focuses on the **A-Frame framework**.

---

## What A-Frame Is

[A-Frame](https://aframe.io) is an open-source web framework for **browser-based 3D, AR, and VR**. It is built on **three.js** and exposes scenes through **declarative HTML** (`<a-scene>`, `<a-entity>`, primitives like `<a-box>`).

### Entity–component–system (ECS)

A-Frame follows the [entity-component-system](https://github.com/aframevr/aframe/blob/master/docs/introduction/entity-component-system.md) pattern common in game engines:

| Concept | Role in A-Frame |
|--------|------------------|
| **Entity** | Empty container (`<a-entity>`); no behavior until components attach |
| **Component** | Reusable module (geometry, material, light, animation, `gltf-model`, custom JS) — usually HTML attributes |
| **System** | Global services for a class of components (render loop, asset loading) |

ECS favors **composition over inheritance**: you define “kinds” of objects by mixing components rather than deep class hierarchies. A-Frame maps ECS onto the **DOM**, so you get query selectors, events, and familiar lifecycle APIs alongside WebGL rendering ([Mozilla Hacks intro](https://hacks.mozilla.org/2016/03/build-the-virtual-reality-web-with-a-frame/)).

### HTML-first 3D

A minimal scene is literally markup:

```html
<script src="https://aframe.io/releases/1.8.0/aframe.min.js"></script>
<a-scene>
  <a-box position="0 0.5 -3" rotation="0 45 0" color="#4CC3D9"></a-box>
  <a-sky color="#111"></a-sky>
</a-scene>
```

Custom behavior lives in **`AFRAME.registerComponent()`**; the docs recommend keeping most application logic in components, not in ad-hoc scene scripts ([writing a component](https://github.com/aframevr/aframe/blob/master/docs/introduction/writing-a-component.md)).

### Relationship to three.js

A-Frame is a **thin abstraction** on three.js: you retain access to `entity.object3D`, materials, shaders, and the renderer. Performance-sensitive code often updates `object3D` directly instead of calling `.setAttribute()` on every frame ([best practices](https://github.com/aframevr/aframe/blob/master/docs/introduction/best-practices.md)).

### VR / XR (optional for portfolios)

WebXR headset support, magic-window gyro modes, and controller components are **first-class** but **not required**. Desktop and mobile browsers run the same scenes in “flat” 3D. For a marketing or portfolio site, XR is a **differentiator** (e.g. “view my work in VR”) rather than a default requirement. HTTPS is required for WebXR ([FAQ](https://aframe.io/docs/1.6.0/introduction/faq.html)).

---

## Strengths & Limits

### Strengths

- **Fast authoring** for spatial layouts, 360° galleries, model viewers, and interactive demos without hand-rolling a three.js bootstrap ([MDN A-Frame guide](https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_on_the_web/Building_up_a_basic_demo_with_A-Frame)).
- **Built-in components**: lights, shadows, animations, `gltf-model`, text, raycaster/cursor, positional audio, inspector (`Ctrl+Alt+I`).
- **Embedded scenes** (`embedded` attribute): treat 3D as a **section** inside a normal page, with HTML/CSS above or below via `z-index` ([embedded component](https://github.com/aframevr/aframe/blob/master/docs/components/embedded.md)).
- **Ecosystem**: community components (particles, physics, post-processing); official [showcase examples](https://aframe.io/aframe/examples/).
- **Inspectable workflow** similar to game editors — useful for designers pairing with developers.

### Limits (especially marketing / portfolio sites)

- **Bundle weight**: A-Frame ships three.js plus framework code. For a **minimal 2D hero** (e.g. point sprites on a canvas), raw Three.js or CSS is often smaller and simpler.
- **DOM + entity count**: Each entity has overhead. Official guidance: minimize entities, merge static meshes, aim for **&lt; ~300 draw calls**, monitor with the [`stats` component](https://github.com/aframevr/aframe/blob/master/docs/components/stats.md).
- **Mobile reality**: Mozilla’s mobile optimization write-up notes texture power-of-two issues, **~70 MB asset** practical ceilings on phones, and vertex counts that can crash browsers in heavy scenes ([Mozilla Hacks, 2017](https://hacks.mozilla.org/2017/07/optimizing-performance-of-a-frame-scenes-for-mobile-devices/)).
- **HTML UI inside WebGL**: Normal `<div>` elements do not render *inside* the 3D view. Portfolio **typography and CTAs** stay as **DOM overlays** (as this repo already does for “Welcome”) or as textured quads / `a-text` with limited richness ([FAQ — HTML in A-Frame](https://aframe.io/docs/1.6.0/introduction/faq.html)).
- **LCP / Core Web Vitals**: Heavy 3D on first paint hurts Largest Contentful Paint. Industry pattern: **defer** 3D until after hero text or idle time (see e.g. portfolio audits deferring R3F/Three chunks).
- **React integration caution**: Maintainers of `aframe-react` recommend **vanilla A-Frame + components** for real-time loops; driving the scene from React `render` on every tick causes garbage and jank ([aframe-react README](https://github.com/aframevr/aframe-react)).

### When A-Frame is appropriate vs raw Three.js vs Spline

| Dimension | **A-Frame** | **Raw Three.js** (this repo) | **Spline** |
|-----------|-------------|------------------------------|------------|
| **Authoring** | HTML + components; inspector | Code-first (JS/TS) | Visual editor; designer-led |
| **Learning curve** | Low–moderate for scenes | Moderate–high | Low for published scenes |
| **VR / AR** | Native path | Manual WebXR wiring | Viewer/runtime; not VR-first |
| **Custom shaders / procedural motion** | Possible via three.js | Full control | Limited vs code |
| **Page integration** | `embedded` + DOM overlay | Full control (canvas placement) | `<spline-viewer>` or runtime embed; strong scroll/global events |
| **Perf tuning** | Same GPU limits as three.js + entity overhead | Direct, minimal layers | Runtime/WebGPU; less code control |
| **Team fit** | Devs + occasional HTML scene edits | Engineering-owned | Design-owned heroes |
| **Licensing / cost** | MIT, self-host | MIT | Subscription for production features |

**Rule of thumb for portfolios:**

- **Three.js** — bespoke motion (sine wave dots, scroll-linked cameras, data-driven art), tight bundle, shared state with the rest of the site ([comparison notes](https://svilenkovic.com/3d/three-js-vs-a-frame)).
- **A-Frame** — spatial **showcases** (gallery, room of work, 360° case studies, optional VR), rapid ECS-based prototypes, teaching/demos.
- **Spline** — polished **designed** objects and hero moments exported as Viewer or React; animations/events in editor ([Spline export docs](https://docs.spline.design/exporting-your-scene/web/exporting-as-spline-viewer)).

Many production sites **hybridize**: Spline or A-Frame for the “exhibit,” Three.js for procedural or metric-sensitive pieces ([Opal Interactive comparison](https://www.opalinteractive.io/resources/threejs-vs-spline-vs-unity/)).

---

## Design Workflow

1. **Define the layer** — Full-page immersive vs **embedded** hero (fixed height, `embedded` scene).
2. **Block in HTML** — Primitives, `gltf-model`, lighting; use **baked lighting** in textures for marketing scenes when possible.
3. **Behavior in components** — Pointer parallax, state machines, and `tick()` handlers; avoid per-frame React re-renders.
4. **2D UI outside the canvas** — Navigation, headlines, case-study copy as DOM with `pointer-events` and `z-index` over `<a-scene embedded>`.
5. **Assets** — Prefer **glTF**; power-of-two textures; preload via [asset management system](https://aframe.io/docs/1.6.0/core/asset-management-system.html); lazy-load secondary scenes.
6. **QA** — Enable `stats`, test mid-tier Android, defer non-critical 3D until after LCP element (often typography or poster image).
7. **Optional XR** — Add `vr-mode-ui`, test HTTPS staging; treat VR as enhancement.

### Tooling with Vite (this repo)

Current stack: **Vite 6 + vanilla Three.js** (`package.json`). A-Frame integration options:

| Approach | Notes |
|----------|--------|
| **Script tag / CDN** | Fastest prototype; no bundler required (A-Frame’s default docs path). |
| **npm `aframe` + Vite** | `import 'aframe'` as side effect; use import maps or `AFRAME_ASYNC` if registering components before init ([FAQ ES modules](https://aframe.io/docs/1.6.0/introduction/faq.html)). Community [aframe-vite-template](https://github.com/Omegahed/aframe-vite-template) shows HTTPS dev server patterns for WebXR. |
| **React + `aframe-react`** | Wrap `<Scene>` / `<Entity>` for app shell; keep animation in A-Frame components ([aframe-react](https://github.com/aframevr/aframe-react)). |
| **Coexist with Three.js** | Possible but awkward (two renderers). Prefer **one** primary 3D path per route: keep wave hero in Three.js, use A-Frame on a `/gallery` or `/vr` route. |

---

## Portfolio Patterns

### Reference examples (A-Frame ecosystem)

| Example | Portfolio pattern |
|---------|-------------------|
| [Model Viewer](https://aframe.io/aframe/examples/) | Single hero object; case-study product spin |
| [Comic Book](https://aframe.io/aframe/examples/showcase/comicbook/) | Sequential **panels** → project slides |
| [Curved Mockups](https://aframe.io/aframe/examples/) | Device frames around work samples |
| [Spatial UI](https://aframe.io/aframe/examples/) / [Anime UI](https://aframe.io/aframe/examples/showcase/anime-UI/) | Stylized HUD around 3D focal point |
| [360° Image / Video](https://aframe.io/aframe/examples/) | Environment reels, behind-the-scenes |
| [Wikipedia](https://aframe.io/aframe/examples/) | Informational spatial layout |
| AR portfolio (e.g. [Parallel Thesis Show](https://sketchysketchy.cargo.site/parallel-thesis-show) — A-Frame + AR.js) | Physical postcard → WebAR project cards |

### Heroes

- **Full-viewport `<a-scene>`** with dark `background` or minimal sky; single focal model or particle field.
- **Camera rig** parented to entity with subtle mouse-parallax component (same idea as `waveGroup` tilt in `src/main.js`).
- **Poster-first**: static image or CSS typography visible immediately; scene `loaded` event fades in WebGL.

### Environments

- Low-poly room with **image planes** (project thumbnails on walls).
- **Fog + limited draw distance** for depth without heavy geometry ([Spheres and Fog](https://aframe.io/aframe/examples/)).
- **360° sky** for mood reels; swap textures per project (preload to avoid first-switch stutter per [best practices](https://github.com/aframevr/aframe/blob/master/docs/introduction/best-practices.md)).

### UI overlay (critical for portfolios)

Pattern used in this repo and recommended for A-Frame:

```
┌─────────────────────────────────────┐
│  DOM: nav, H1, CTAs (z-index: 2)   │
├─────────────────────────────────────┤
│  <a-scene embedded> (z-index: 0)    │
│  or <canvas> Three.js               │
└─────────────────────────────────────┘
```

- `pointer-events: none` on decorative text; enable on buttons.
- `aria-live` / semantic headings in DOM, not only `a-text`.
- Link out to case studies as normal `<a href>` — better for SEO and accessibility than 3D-only navigation.

---

## Fit for Wave / Welcome Style Sites

This repository’s **Welcome — Wave** experience (`index.html`, `src/main.js`) is:

- Black full-screen field
- **Procedural** dotted sine waves (BufferGeometry + PointsMaterial)
- Pointer-driven group tilt
- Centered **serif “Welcome”** with CSS keyframe fade (DOM overlay)

| Aspect | A-Frame fit |
|--------|-------------|
| Procedural wave dots | **Poor default fit** — easier and lighter in raw Three.js (current approach) |
| Typography-led hero | **Keep DOM/CSS**; A-Frame does not improve this |
| Future Spline object in scene | **Spline Viewer/runtime** aligns with README; parallel to A-Frame, not a replacement |
| “Walk through my work” VR reel | **Strong A-Frame fit** as a **second route** or optional mode |
| Performance / LCP | Staying on minimal Three.js or deferring A-Frame scene load preserves vitals |

**Conclusion:** For the **wave welcome** aesthetic, **continue Three.js** (or add Spline for authored objects). **Introduce A-Frame** if the product roadmap adds spatial galleries, 360° project viewers, or WebXR — not to recreate the sine wave.

---

## Recommendations

1. **Default stack for this repo** — Keep Vite + Three.js for the wave hero; add Spline via Viewer or `@splinetool/runtime` when designed assets land (per README).
2. **If adopting A-Frame** — Use a **separate page or lazy-loaded chunk** (`import('aframe')` after idle) to protect LCP; use `embedded` + fixed aspect hero, not full replacement of the HTML shell.
3. **Author in components** — Register `wave-parallax`, `project-hotspot`, etc., instead of inline scene scripts.
4. **Measure** — `stats` during development; budget draw calls and texture memory on mobile.
5. **Skip `aframe-react` unless the app shell is already React** — If React is added later, use components for ticks; React only for routing and data.
6. **XR as optional** — Ship flat 3D first; add “Enter VR” when content benefits (gallery scale, spatial audio).
7. **Document the “frame” vocabulary** — In design reviews, distinguish **A-Frame** (tech) from **camera framing** (layout) to avoid toolchain confusion.

---

## Sources

### Official A-Frame

- [A-Frame home](https://aframe.io)
- [Entity–component system](https://github.com/aframevr/aframe/blob/master/docs/introduction/entity-component-system.md)
- [Writing a component](https://github.com/aframevr/aframe/blob/master/docs/introduction/writing-a-component.md)
- [Best practices (performance)](https://github.com/aframevr/aframe/blob/master/docs/introduction/best-practices.md)
- [FAQ (performance, HTML, modules)](https://aframe.io/docs/1.6.0/introduction/faq.html)
- [Embedded component](https://github.com/aframevr/aframe/blob/master/docs/components/embedded.md)
- [Stats component](https://github.com/aframevr/aframe/blob/master/docs/components/stats.md)
- [Examples / showcase](https://aframe.io/aframe/examples/)

### Mozilla & MDN

- [Build the Virtual Reality Web with A-Frame](https://hacks.mozilla.org/2016/03/build-the-virtual-reality-web-with-a-frame/)
- [Optimizing A-Frame on mobile](https://hacks.mozilla.org/2017/07/optimizing-performance-of-a-frame-scenes-for-mobile-devices/)
- [MDN: Building a basic demo with A-Frame](https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_on_the_web/Building_up_a_basic_demo_with_A-Frame)

### Integrations & comparisons

- [aframe-react](https://github.com/aframevr/aframe-react)
- [aframe-vite-template](https://github.com/Omegahed/aframe-vite-template)
- [Three.js vs A-Frame (Svilenković)](https://svilenkovic.com/3d/three-js-vs-a-frame)
- [Three.js vs Spline vs Unity (Opal Interactive)](https://www.opalinteractive.io/resources/threejs-vs-spline-vs-unity/)
- [Spline Viewer export](https://docs.spline.design/exporting-your-scene/web/exporting-as-spline-viewer)
- [Spline code export](https://docs.spline.design/exporting-your-scene/web/exporting-as-code)

### Portfolio / creative

- [Parallel Thesis Show — A-Frame + AR.js](https://sketchysketchy.cargo.site/parallel-thesis-show)

### This repository

- `README.md` — wave welcome concept and stack direction
- `src/main.js`, `index.html`, `src/style.css` — DOM overlay + Three.js wave implementation
