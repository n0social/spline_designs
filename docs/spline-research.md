# Spline Platform Research for Portfolio Web Work

Research date: October 2026. Context: the **spline_designs** repo (`/workspace`) ships a Vite + Three.js **interactive dotted wave welcome** hero (black field, dual sine-wave point clouds, pointer parallax, centered “Welcome” typography). This document evaluates whether and how [Spline](https://spline.design/) fits alongside or instead of that code-first approach.

---

## Overview

### What Spline is

[Spline](https://spline.design/) is a **browser-based, real-time 3D (and 2D via Hana) design tool** aimed at creating **interactive experiences**—not pre-rendered frames. Files live in the cloud; multiple collaborators can edit the same scene simultaneously with autosave, comments, workspaces, and version history.

Spline positions itself between traditional DCC tools (Blender, Maya, C4D) and no-code web builders:

| Dimension | Spline | Traditional 3D + render |
|-----------|--------|-------------------------|
| Output | Live, embeddable scenes | Stills, image sequences, video |
| Workflow | Real-time preview, no render farm | Offline rendering |
| Learning curve | Graphic-design-like (layered materials, states) | Steeper technical pipeline |
| Code | Optional (events, variables, Code tab, site-side Code API) | Required for web interactivity |

The product includes:

- **3D editor**: primitives, booleans, sculpting, layered materials, lights, cameras, timeline/state animation, particles, physics, Gaussian splats, AI generation.
- **Hana (2D)**: vector UI, typography, effects, with 3D shapes lifted from 2D.
- **Interactivity model**: **states + events + actions** (hover, click, scroll, follow, look-at, keyboard, collisions, game controls, drag-and-drop).
- **Publishing**: web (URL, viewer, code), native iOS/Android embeds, GLB/GLTF, USDZ, STL, video, PNG/JPG.

Official positioning: [What is Spline?](https://docs.spline.design/basics/what-is-spline), [How is Spline different?](https://docs.spline.design/basics/how-is-spline-different).

### Runtime vs “baked” exports

Understanding this split is essential for portfolio performance and licensing.

| Mode | What ships | Interactivity | Typical use on a portfolio |
|------|------------|---------------|----------------------------|
| **Runtime (live)** | `.splinecode` + Spline engine (`@splinetool/runtime`, `<spline-viewer>`, or hosted Public URL) | Full events, states, variables, Code tab HTML (on supported exports) | Hero objects, scroll-driven camera, hover reveals |
| **Semi-runtime (Three.js / R3F export)** | GLB-like scene via `@splinetool/loader` / `r3f-spline` | **Spline events not included**; you reimplement in React/Three.js | When you need your own render loop but want authored geometry |
| **Baked (static)** | PNG, JPG, WebM, MP4, image sequence | None (pre-rendered) | Fallback thumbnails, social clips, `prefers-reduced-motion` |
| **File interchange** | GLB/GLTF | Depends on how you load it; Spline material features may be lossy | AR, offline viewers, custom Three.js loaders |

**Animations and Spline-authored events are only enabled for Vanilla JS and React code exports** (runtime path), not for raw Three.js / react-three-fiber exports ([Exporting as Code](https://docs.spline.design/exporting-your-scene/web/exporting-as-code)).

Video export is explicitly **non-interactive**: Spline renders timeline/state animations to MP4/WebM at chosen resolution and FPS ([Exporting as Video](https://docs.spline.design/exporting-your-scene/files/exporting-as-video)).

### Licensing and pricing (portfolio-relevant)

| Plan | Price (USD, 2026) | Portfolio impact |
|------|-------------------|------------------|
| **Free** | $0 | Limited personal files; **web exports show Spline branding/watermark**; good for learning and internal demos |
| **Hobby** | $15/mo ($12/mo annual) | **Un watermark on web exports**, unlimited 3D/2D files, material/audio library, higher-res image export |
| **Pro** | $30/mo ($25/mo annual) | Video export, unlimited folders/projects, Apple/Android exports, more variables/APIs |
| **Max / Enterprise** | $70+/custom | Higher AI credits, team features, **self-hosted/code exports** at enterprise tier |

Sources: [spline.design/pricing](https://spline.design/pricing), [docs: Pricing](https://docs.spline.design/account/pricing), [Terms](https://spline.design/terms) (you retain ownership of your User Content).

For a **public portfolio**, plan on **Hobby minimum** to remove embed watermarks. Community remix files use **CC BY 4.0** (attribution required) when reused from [community.spline.design](https://community.spline.design/).

### Strengths vs hand-coded Three.js (summary)

| Spline strengths | Three.js strengths (this repo) |
|------------------|--------------------------------|
| Fast iteration on materials, lighting, and motion without a build step | **Procedural geometry** (sine waves, fields, data-driven layouts) |
| Designer-accessible collaboration | **Tiny runtime**: no extra engine bundle for simple effects |
| Rich object-level interactivity without writing event code | Custom shaders, instancing, compute particles at scale |
| Scroll/global mouse via `<spline-viewer events-target="global">` | Full ownership, no SaaS dependency, git-based workflow |
| WebGPU default with WebGL fallback in exports | Precise integration with DOM typography and CSS |

Third-party comparison: [Spline vs Three.js (Fabric)](https://developers.fabric.so/comparison/spline-vs-three-js).

---

## Workflow

### Typical editor workflow

1. **Create** a file in [app.spline.design](https://app.spline.design/) (3D scene or Hana 2D page).
2. **Author** in **Edit** mode: objects outliner, transform tools, material layers, lights, environment (HDRi, fog, post-processing).
3. **Animate** via state-based transitions and/or timeline; add **Events** (Start, Mouse Hover, Scroll, Follow, Look At, Key Press, etc.).
4. **Preview** in **Play** mode (events only fire in Play/export, not while editing—see [Code Tab](https://docs.spline.design/interaction-states-events-and-actions/code-tab)).
5. **Optional code** in the **Code tab**: HTML/CSS/JS overlay with injected `spline` API (variables, object transforms, custom Three.js materials in supported exports).
6. **Export** → choose Public URL, Viewer embed, or Code (React/Vanilla/Next.js/Three.js/R3F).
7. **Version exports** with **Drafts**; promote **Production** so the live URL updates ([Exporting as Code – Drafts](https://docs.spline.design/exporting-your-scene/web/exporting-as-code)).

### Collaboration

Real-time multiplayer editing, share links (viewer/editor), workspaces and projects (Pro+). Matches how design-led teams work on marketing sites without branching 3D binaries in git ([Real-time Collaboration](https://docs.spline.design/sharing-collaboration-and-workspaces/real-time-collaboration-in-3-d)).

### Performance workflow inside Spline

Before shipping:

1. Open **Export → Performance panel** (export size estimate, loading score, polygon/material/light counts).
2. Apply **Play Settings**: enable **Compression**, set **Geometry Quality** to Performance when needed, tune **Image Quality**, consider **Preload** for large scenes ([How to optimize your scene](https://docs.spline.design/exporting-your-scene/how-to-optimize-your-scene), [Play Settings](https://docs.spline.design/exporting-your-scene/play-settings)).
3. Keep **≤3 lights**, simplify materials, delete hidden geometry, limit embeds **to one or two per page**.

Post-export GLB pipelines can use Draco/KTX2 (external tools); Spline’s native web path is `.splinecode` + runtime, not automatically KTX2-compressed ([MeshGrade optimization guide](https://meshgrade.com/blog/how-to-optimize-spline-3d-exports)).

---

## Web Integration

### Integration options (web)

| Method | Integration | Best for |
|--------|-------------|----------|
| **Public URL** | iframe to `my.spline.design` | Fastest share; local events only inside iframe |
| **Spline Viewer** | `<script type="module" src="…/spline-viewer.js">` + `<spline-viewer url="…scene.splinecode">` | **Portfolio sites**: global scroll/mouse, lazy load, CSS background override ([Viewer docs](https://docs.spline.design/exporting-your-scene/web/exporting-as-spline-viewer), [viewer.spline.design](https://viewer.spline.design/)) |
| **React** | `@splinetool/react-spline` + `@splinetool/runtime` | React/Next portfolio; `react-spline/next` for blurred SSR placeholder ([react-spline](https://github.com/splinetool/react-spline)) |
| **Vanilla JS** | Download web content ZIP or host `scene.splinecode` | Vite/static sites like **spline_designs** |
| **Three.js / R3F** | `@splinetool/loader` or `r3f-spline` | Merge authored assets into an existing Three.js app **without** Spline events |

### Vite + vanilla (fits this repo)

```html
<!-- Option A: Viewer (global pointer/scroll) -->
<script type="module" src="https://unpkg.com/@splinetool/viewer/build/spline-viewer.js"></script>
<spline-viewer
  url="https://prod.spline.design/YOUR_SCENE/scene.splinecode"
  events-target="global"
  background="transparent"
></spline-viewer>
```

```js
// Option B: Runtime in main.js (if migrating to programmatic control)
import { Application } from '@splinetool/runtime';

const canvas = document.getElementById('canvas3d');
const app = new Application(canvas);
await app.load('https://prod.spline.design/YOUR_SCENE/scene.splinecode');
```

Keep **HTML typography** (e.g. the repo’s `.welcome__text`) in the DOM **above** the canvas with `pointer-events: none`—same pattern as the current wave hero.

### Runtime characteristics

- Default renderer: **WebGPU with WebGL fallback** (Auto) on code exports ([Exporting as Code](https://docs.spline.design/exporting-your-scene/web/exporting-as-code)).
- **Lazy loading** in Viewer until the canvas is visible (override with `loading="eager"` if needed).
- **Self-hosting**: download `.splinecode` from export panel to avoid CORS ([react-spline README](https://github.com/splinetool/react-spline)).
- **Code API**: external site JS can drive objects/variables when using runtime exports ([Code API for Web](https://docs.spline.design/) — linked from code export docs).

### What does *not* carry over

- **Three.js / R3F exports**: no Spline event graph; particle systems may not map cleanly to R3F ([r3f-spline discussion #19](https://github.com/splinetool/r3f-spline/discussions/19), [particle issue #22](https://github.com/splinetool/r3f-spline/issues/22)).
- **Custom Three.js materials** from Code tab: not supported in `<spline-viewer>` embeds ([Code Tab – exports table](https://docs.spline.design/interaction-states-events-and-actions/code-tab)).
- **GLTF export**: limited material layer support ([GLB export docs](https://docs.spline.design/exporting-your-scene/files/exporting-as-gtlf-glb)).

---

## Design Best Practices

Patterns observed in high-quality Spline portfolio and hero implementations:

### Composition

- **Single focal object** in the hero (product, character, abstract glass form)—not full-scene clutter. Depth via **foreground blur elements** + mid-ground hero + flat UI plane.
- **Negative space** reserved for headline and CTA; 3D often **offset** (right-weighted) so type remains legible.
- **Footer or section transitions**: second, simpler Spline embed for continuity (see Webflow × Spline templates).

### Lighting

- **Mouse-driven light** or “torch” effect: light position follows cursor (Webflow “3dfolio-spline” pattern).
- **Low light count** (≤3) for performance; rely on emissive materials and environment HDRi instead of many point lights.
- **Consistent exposure** with site background—use Viewer `background` prop or transparent scene background over CSS `#000`.

### Interaction

- **Hover state transitions** on hero mesh (scale, material swap, outline).
- **Scroll-linked camera** or object translation (Viewer global scroll events; demo on [viewer.spline.design](https://viewer.spline.design/)).
- **Follow / Look At** with `events-target="global"` so parallax works when the cursor is over typography, not only the canvas.
- **Keyboard easter eggs** (press key to reveal alternate object)—showcase: [THREE DIMENSIONS / Webflow × Spline](https://ashkans-stellar-site.webflow.io/).
- **Reduced motion**: provide static poster image or disable autoplay animations via export settings / CSS media query.

### Typography pairing with 3D

- **High-contrast, restrained type**: serif + wide letter-spacing (similar to this repo’s Cormorant Garamond) **over** dark 3D fields.
- **Uppercase micro-headlines** or editorial serif for luxury; geometric sans for tech/product scenes.
- Keep type **outside** the WebGL canvas (DOM layer) for accessibility, SEO, and crisp subpixel rendering.
- Avoid placing long body copy inside the 3D texture; use HTML for all reading text.

### Reference examples

| Example | Pattern | Link |
|---------|---------|------|
| 3D designer portfolio (Spline team) | Mouse light + scroll-driven objects | [Webflow: 3dfolio-spline](https://webflow.com/made-in-webflow/website/3dfolio-spline) |
| DimensionStudio agency landing | Hero hover + scroll 3D | [Webflow: 3d-design-agency](https://webflow.com/made-in-webflow/website/3d-design-agency) |
| Interaction catalog | Hover, click, follow, keyboard | [THREE DIMENSIONS showcase](https://ashkans-stellar-site.webflow.io/) |
| Immersive portfolio world | Game controls, variables, island layout | [LITTLE FUJI Island (Behance)](https://www.behance.net/gallery/232287463/Spline-3D-Interactive-Portfolio-LITTLE-FUJI-Island) |
| Community templates | Hero pages, mockups, badges | [Community tag: Portfolio](https://community.spline.design/tag/Portfolio) |

Spline’s own solution page: [Build a portfolio website](https://spline.design/solutions/build-a-portfolio-website).

---

## Portfolio Use Cases

Spline excels when the portfolio needs **authored 3D objects and stateful UI motion**, not algorithmic fields.

| Use case | Why Spline | Caveat |
|----------|------------|--------|
| **Product / device mockups** | Glass, reflections, turntable, hover hotspots | Watch export size on mobile |
| **Personal brand mascots** | Character animation, follow cursor | Heavier than CSS/SVG |
| **Case-study heroes** | Scroll through camera states per project | One embed per page recommended |
| **Interactive resume** | Game controls, collectible “skills” | High scope; test on phones |
| **3D badge / logo lockup** | Quick material iteration | Keep mesh count low |
| **Framer / Webflow marketing** | Native integrations, designer-owned | Less control than raw code |

Poor fit:

- **Mass particle fields** driven by custom math (fireworks, galaxy, fluid dots).
- **Data visualization** with thousands of instanced elements tied to APIs.
- **Shader art** requiring full GLSL/WGSL control.

---

## Comparison to Code-First 3D

### This repo’s dotted wave (Three.js)

The welcome hero (`src/main.js`) implements:

- ~440 **points** in two `THREE.Points` layers with a **CPU-updated sine phase** each frame.
- **Additive blended** radial gradient sprite texture.
- **Pointer parallax** via group rotation/translation.
- **DOM “Welcome”** with CSS keyframe fade (see `src/style.css`).

Properties:

- **Bundle**: only `three` dependency; no Spline runtime (~hundreds of KB avoided).
- **Performance**: trivial GPU load; 2 draw calls; ideal for LCP-sensitive landing pages.
- **Behavior**: mathematically exact, easy to tune `wavelength`, `amplitude`, `phaseOffset`.

### Could Spline replicate the dotted wave?

**Partially, poorly as a 1:1 replacement.**

| Approach in Spline | Verdict |
|--------------------|---------|
| Thousands of sphere instances along a path | Heavy scene graph, large export, editor friction |
| Particle emitter with noise | Artistic, not a clean dual sine-wave; limited procedural control ([Particles](https://docs.spline.design/designing-in-3-d/animation/particles)) |
| Code tab custom loop writing positions | Possible but fights the tool; you are reimplementing Three.js inside Spline |
| Video loop of dots | **Baked** only; loses pointer parallax unless faked |

**Conclusion:** procedural dotted waves are a **code-first sweet spot**. Spline does not offer a native “sine wave point field” primitive comparable to updating a `Float32Array` in JavaScript.

### When to choose which

```
Portfolio section need                    → Prefer
─────────────────────────────────────────────────────────
Procedural background (waves, grids)      → Three.js / shaders (this repo)
Hero product object + hover states        → Spline runtime or Viewer
Scroll storytelling with 3D               → Spline Viewer (global events)
Team: designers own 3D, devs own shell    → Spline + HTML/CSS shell
Must own 100% offline pipeline            → Three.js + GLB only
```

---

## Recommendations for This Project

### Keep the dotted wave in Three.js

The current welcome screen is **lightweight, distinctive, and procedurally precise**. Replacing it entirely with Spline would likely **increase load time and file size** without improving the core idea, unless the goal changes from “mathematical wave field” to “sculpted 3D illustration.”

### High-value Spline additions (hybrid architecture)

1. **Inner portfolio routes**  
   Use Spline for **project case-study heroes** (device mockup, abstract glass blob, character) while retaining the **code-first wave** as the site entry.

2. **Accent layer on welcome**  
   Optional transparent `<spline-viewer>` **behind or beside** the wave (low-poly monolith, subtle glass orb with Look At) with `events-target="global"` to complement—not replace—pointer parallax.

3. **Export path for this Vite app**  
   - **Preferred**: Viewer embed or Vanilla runtime + self-hosted `.splinecode` in `/public`.  
   - **Avoid**: R3F export unless migrating the whole app to React and re-wiring events.  
   - **Do not** rely on GLB alone if you need Spline scroll/hover events.

4. **Typography**  
   Continue DOM-based **Welcome** and navigation; Spline stays `aria-hidden` decorative or gets a text alternative on `prefers-reduced-motion`.

5. **Licensing**  
   Budget **Hobby** before shipping client-facing embeds without watermark.

6. **Performance budget**  
   Target **one** Spline embed on the landing page; run Performance panel before Production promote; use **Compression + Performance geometry** for mobile.

### Scene types better suited to Spline in this portfolio

- Floating **laptop / phone mockup** with screen video texture for case studies.
- **Logo or monogram** in refractive glass for about page.
- **Scroll-controlled camera** through a simplified “project gallery room.”
- **Interactive keyboard** or badge (popular community patterns) for a playful skills section.

### Suggested implementation sketch (future PR, not in scope here)

```
index.html
  ├── canvas#wave-canvas     ← existing Three.js (keep)
  ├── spline-viewer (optional, z-index below welcome)
  └── .welcome               ← existing CSS typography (keep)
```

Load Spline with **lazy** viewer default; gate with `prefers-reduced-motion: reduce` to static PNG export from Spline.

---

## Sources / Links

### Official Spline

- Product: https://spline.design/
- App: https://app.spline.design/
- Pricing: https://spline.design/pricing
- Portfolio solution: https://spline.design/solutions/build-a-portfolio-website
- Changelog (performance): https://updates.spline.design/changelog/performance-optimization-update

### Documentation (docs.spline.design)

- [What is Spline?](https://docs.spline.design/basics/what-is-spline)
- [How is Spline different?](https://docs.spline.design/basics/how-is-spline-different)
- [Understanding Spline's UI](https://docs.spline.design/basics/understanding-splines-ui)
- [FAQ – export types](https://docs.spline.design/basics/faq)
- [Real-time Collaboration](https://docs.spline.design/sharing-collaboration-and-workspaces/real-time-collaboration-in-3-d)
- [Particles](https://docs.spline.design/designing-in-3-d/animation/particles)
- [Code Tab](https://docs.spline.design/interaction-states-events-and-actions/code-tab)
- [Exporting as Code](https://docs.spline.design/exporting-your-scene/web/exporting-as-code)
- [Exporting as Spline Viewer](https://docs.spline.design/exporting-your-scene/web/exporting-as-spline-viewer)
- [Play Settings](https://docs.spline.design/exporting-your-scene/play-settings)
- [How to optimize your scene](https://docs.spline.design/exporting-your-scene/how-to-optimize-your-scene)
- [Exporting as Video](https://docs.spline.design/exporting-your-scene/files/exporting-as-video)
- [Exporting as GLB/GLTF](https://docs.spline.design/exporting-your-scene/files/exporting-as-gtlf-glb)
- [Account / Pricing (docs)](https://docs.spline.design/account/pricing)
- [Terms](https://spline.design/terms)

### Runtime & packages

- Spline Viewer demos: https://viewer.spline.design/
- `@splinetool/react-spline`: https://github.com/splinetool/react-spline
- `@splinetool/runtime` (npm): https://www.npmjs.com/package/@splinetool/runtime
- `r3f-spline`: https://github.com/splinetool/r3f-spline

### Examples & community

- [Webflow – Light source 3D interaction (3dfolio)](https://webflow.com/made-in-webflow/website/3dfolio-spline)
- [Webflow – Hover & scroll agency hero](https://webflow.com/made-in-webflow/website/3d-design-agency)
- [THREE DIMENSIONS – interaction showcase](https://ashkans-stellar-site.webflow.io/)
- [Behance – LITTLE FUJI interactive portfolio](https://www.behance.net/gallery/232287463/Spline-3D-Interactive-Portfolio-LITTLE-FUJI-Island)
- [Community – Portfolio tag](https://community.spline.design/tag/Portfolio)

### Comparisons & optimization

- [Spline vs Three.js – Fabric](https://developers.fabric.so/comparison/spline-vs-three-js)
- [Optimizing Spline GLB exports – MeshGrade](https://meshgrade.com/blog/how-to-optimize-spline-3d-exports)
- [Three.js particles guide](https://threejsresources.com/guides/particles)

### This repository

- README: `/workspace/README.md`
- Wave implementation: `/workspace/src/main.js`
- Welcome typography: `/workspace/src/style.css`, `/workspace/index.html`
