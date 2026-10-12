# Assets and tools

Everything here is free. Licences were checked on the creators' own pages in October 2026. Re-check when you download, and keep the licence file with the download.

**Rule:** grey-box with primitives until M7. No models before then.

## 1. The complete asset list

If it isn't listed, the MVP doesn't need it.

### A. Made in code (no files)

| Asset | How |
| --- | --- |
| Island ground, batas, canal, longkang | Boxes and extrusions, flat colours |
| Plot soil and water | A box per plot; a water plane whose height follows the sim |
| Padi, 5 growth stages | `InstancedMesh` blades; stage changes height and colour (green → gold) |
| Weeds and snails | Small instanced tufts and shells on the plot |
| Sky, day and night lighting | One directional light, a sky gradient |
| Problem icons over plots, the action prompt | drei `<Html>` with the 2D icons below |
| All UI panels | CSS; no image files |

### B. Characters (1 base body, 6 looks)

| Asset | Source | Work needed |
| --- | --- | --- |
| Base humanoid + animations | [Quaternius — Universal Animation Library](https://quaternius.com/packs/universalanimationlibrary.html) (CC0, glTF, 120+ animations on one rig) | Pick 5 clips: idle, walk, work (one loop for every farm job), cast (fishing), wave (Tok Wan) |
| 4 player presets | Same base | Recolour clothes and skin; add one headwear each (songkok, tudung, cap, terendak) |
| Tok Wan | Same base | Older look: white hair, kopiah, kain pelikat colours, a tongkat |
| Raya (Gen Z hantu raya) | Same base | Translucent material, hoodie, phone in hand, floats a little off the ground. Friendly, never scary |

### C. World models

| Asset | Source | Work needed |
| --- | --- | --- |
| Cottage on stilts (your home) | Make in Blender | The hero model. Spend the most time here |
| Pintu air (×2, one model) | Make in Blender | Open and closed states |
| Trees: coconut palm, banana, one round tree | Quaternius or Kenney nature packs (CC0) | Pick one pack so the style matches; make the palm in Blockbench if no pack has one |
| Rocks, bushes, grass clumps | Same nature pack | Recolour to the palette |
| Sacks, crates, bucket, fence posts | [Kenney — Survival Kit](https://kenney-assets.itch.io/survival-kit) (CC0, glTF) | Recolour |
| Handheld tools: cangkul, sabit, joran, serkap | Make in Blockbench | 4 tiny models attached to the hand bone during the work and cast animations |

### D. 2D icons (about 25)

| Asset | Source |
| --- | --- |
| Coin, benih bag, baja bag, clock, moon (Tidur) | Kenney Game Icons (CC0), or draw in Inkscape |
| Starter seed cards: MR297, MR220 CL2, MRQ76 | Draw in Inkscape: one seed-bag icon in 3 colours |
| Rail: Fon, Kitab, Tetapan; phone apps: Kedai Tani, Agribank, Jual Ikan, Live | Same |
| Problem icons: water low, water high, weeds, snails, baja due | Draw in Inkscape (they must read at a glance) |
| Card frames: Bala (purple), Rezeki (green) | Our own design in Inkscape. No Yu-Gi-Oh frame, logo or fonts |
| 10 card illustrations | Small flat drawings at M7; until then the art window shows a Bala or Rezeki icon |
| Fish ×5: keli, haruan, puyu, sepat, tilapia | Draw in Inkscape. Fish are never 3D |

### E. Audio

| Asset | Source |
| --- | --- |
| Day ambience (frogs, birds, wind) and night ambience (crickets, frogs) | [Freesound](https://freesound.org), filtered to CC0 only; trim and loop in Audacity. Record your own later if you get to a bendang |
| About 10 sound effects: footsteps, splash, gate creak, work, harvest swish, coin, card flip, fish bite, UI click, rooster | Kenney audio packs (CC0), or jsfxr |
| Music: one day loop, one night loop | CC0 tracks from OpenGameArt (check each), or make in LMMS |

### F. Text and store

| Asset | Source |
| --- | --- |
| Fonts: Grandstander (headings), Nunito (body) | OFL, bundled via `@fontsource` |
| itch.io cover (630 × 500) and 3–5 screenshots | Screenshots of the game at M7 |

### Not made, on purpose

A shop and a jetty (the phone replaces both); tractors, harvesters and hired workers (no hiring in the MVP); the cat, ducks and rats (they live on night cards only); 3D fish; per-card illustrations; Tok Wan's house.

## 2. Tools to install

| Tool | Licence | Job | When |
| --- | --- | --- | --- |
| Node.js LTS (22 or 24), git | Free and open source | Build and repo | M0 |
| Blender | GPL | Recolour and export every model (scripted), make the cottage and pintu air | M7 |
| Blockbench (or its web version) | GPL | Small props: palm, handheld tools. Easier than Blender | M7 |
| Inkscape | GPL | 2D icons as SVG | M7 |
| Audacity | GPL | Trim, loop and level sounds | M7 |
| `@gltf-transform/cli`, `gltfjsx` (via `npx`) | MIT | Compress `.glb`; turn it into a React component | M7 |

No connectors or MCP servers are needed. A Blender MCP server (mcp-for-blender, MIT) can help with one-off modelling if Claude Code runs on your own computer; it is optional.

## 3. npm packages (the agent installs these)

**Runtime:** `react`, `react-dom`, `three`, `@react-three/fiber`, `@react-three/drei`, `zustand`, `@fontsource/grandstander`, `@fontsource/nunito`, `howler` (M7).

**Dev:** `typescript`, `vite`, `@vitejs/plugin-react`, `@types/three`, `@types/react`, `@types/react-dom`, `@rollup/plugin-yaml`, `vitest`, `eslint`, `typescript-eslint`, `prettier`, `r3f-perf` (draw-call overlay in the debug panel). Optional: `@playwright/test` for a screenshot smoke test.

The phone joystick is about 80 lines of React; no package.

## 4. Pipeline for every model

1. Download from the creator's official page only. Keep the zip and its licence in `assets/source/<pack>/` (in git, not shipped).
2. Run `blender -b <file> -P scripts/blender/prep.py`. The script, written by the agent at M7, applies the shared palette, sets 1 unit = 1 m, applies transforms, joins static parts and exports `.glb` to `assets/export/`. Rerun it whenever the palette changes.
3. Make one-off models (cottage, pintu air) in Blender or Blockbench by hand, saved to `assets/source/own/`, then run the same script.
4. Optimise:
   ```bash
   npx @gltf-transform/cli optimize assets/export/cottage.glb public/models/cottage.glb --compress meshopt --texture-size 1024
   ```
5. Generate a component:
   ```bash
   npx gltfjsx public/models/cottage.glb --types --output src/scene/models/Cottage.tsx
   ```
6. Add a row to `CREDITS.md`: asset, author, licence, link.

**Compression:** meshopt, not Draco. drei's Draco loader fetches its decoder from a CDN, which breaks the no-network rule. Load with `useGLTF(url, false, true)`.

**Licences:** use only CC0, CC-BY (credit the author) or OFL. Never NC (non-commercial): a Ko-fi link may count as commercial.

## 5. Accounts (before M8)

| Account | Setting |
| --- | --- |
| itch.io | Kind: HTML → upload `bendang-life-web.zip` → "This file will be played in the browser" → viewport 1280 × 720 → "Mobile friendly", Landscape → "Fullscreen button" → Pricing: No payments |
| Ko-fi | Free page. Link it in the itch.io description and on the credits screen |
| GitHub | Public or private repo; nothing secret is in it |
