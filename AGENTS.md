# AGENTS.md — Bendang Life

Instructions for coding agents (Codex, Claude Code, others). Read this file fully before writing code.

## What this project is

A cozy isometric browser game about growing one season of padi on a small Kedah bendang. Free, static build, shipped on itch.io. The full spec is `docs/mvp-spec.md`. The visual and UX target is `docs/refs/*.png`. The refs set the **look**: palette, lighting, materials, panel style, typography, card style. The **spec decides what exists** on screen. The refs predate spec v2.0, so wherever they disagree, follow the spec and `content/rules.yaml`. Known differences are listed in `docs/refs/README.md`.

## Scope guard

- Build only what `docs/mvp-spec.md` section 3 lists under "In the MVP" and section 4 describes.
- Anything in the "Not in the MVP" column or the backlog is out of scope. Do not add it, stub it or scaffold for it unless the user asks.
- If a task is ambiguous, choose the simplest reading that matches the refs, write the assumption in the PR or commit description, and continue.

## Stack (do not swap without asking)

- TypeScript (strict), Vite, React 18
- three.js via `@react-three/fiber` and `@react-three/drei`
- zustand for state
- YAML content in `content/`, imported with `@rollup/plugin-yaml`
- Vitest for tests, ESLint and Prettier for lint and format
- No backend, no accounts, no analytics, no paid services, no runtime network calls

Pin dependency versions in `package.json`. Prefer the latest stable release of each library that is at least a few weeks old.

## The architecture rule

`src/sim/` is pure TypeScript. It must not import React, three.js, zustand or anything from `src/scene`, `src/ui` or `src/state`.

- The sim exposes `applyAction(state, action) => state` and `advanceDay(state, rng) => state`, plus pure selectors (tasks for today, plot targets, yield preview).
- Randomness only through the seeded RNG in `src/sim/rng.ts`. Same seed and same actions must give the same season.
- All tuning numbers and calendar thresholds come from `content/rules.yaml` and `content/varieties.yaml`. No magic numbers in sim code.
- `src/state/` wraps the sim in a zustand store. UI and scene read from the store and dispatch actions; they never mutate game state directly.
- `src/scene/` only renders state. It may hold purely visual state (animation, camera smoothing, player position).

Player position and walking live in the scene and input layers. The sim only receives actions such as `{ type: 'SOW', plotId, variety }` when the player presses E on a valid target.

## Folder map

```text
content/        rules.yaml, varieties.yaml, events.yaml, facts.yaml, tasks.yaml, i18n/kdh.yaml, i18n/en.yaml
src/sim/        types.ts, rules.ts, calendar.ts, actions.ts, events.ts, tasks.ts, report.ts, rng.ts, save.ts, __tests__/
src/state/      store.ts
src/scene/      Island.tsx, Plot.tsx, Padi.tsx (InstancedMesh), Player.tsx, Props/, models/ (gltfjsx output, M7), Lighting.tsx, CameraRig.tsx
src/input/      keyboard.ts, Joystick.tsx, interactions.ts
src/ui/         hud/, screens/, panels/, cards/
src/i18n/       index.ts (t(), locale switch)
public/models/  optimised .glb files (M7)
assets/source/  downloaded packs and their licences, not shipped
assets/export/  Blender exports before optimising, not shipped
docs/           mvp-spec.md, assets-and-tools.md, refs/
```

## Content and text

- Every player-facing string goes through `t('key')` with entries in both `content/i18n/kdh.yaml` and `content/i18n/en.yaml`. No hardcoded UI text in components. A test must fail if the two files have different keys.
- Locales: `kdh` (Loghat Kedah, the default) and `en` (standard, formal English). Do not rewrite or "correct" the Kedah text; the project owner proofreads it. New strings get a Kedah draft marked with a `# TODO proofread` comment. NPCs refer to themselves as "saya" and to the player as "hang"; Tok is the exception and says "Tok". Never use "cheq".
- Farming facts in `content/facts.yaml` must keep their `source` URL. Do not invent statistics or facts. If a number is a game-tuning value, mark it `tuning: true` in YAML.
- Faraid, religion and real people are never used as jokes.

## Visual rules

- Fixed isometric-style camera (perspective with a narrow FOV or orthographic), light follow on the player. No camera rotation.
- Low-poly, flat-shaded, toy-like. Match the palette and mood of `docs/refs/01-day-hud.png` (day) and `02-night-hud.png` (night).
- Grey-box with primitives until M7. Do not download or add models before M7.
- At M7 follow `docs/assets-and-tools.md`: approved sources, the Blender → gltf-transform → gltfjsx pipeline, and which props are built in code. Record every asset in `CREDITS.md`. Never use an asset without a clear CC0, CC-BY or OFL licence; never NC.
- Compress models with meshopt, not Draco (drei's Draco decoder loads from a CDN). Load with `useGLTF(url, false, true)`.
- HUD layout follows the refs: player card top-left, stat pills top-right, left icon rail, context prompt above the player, night event cards centred.
- The plot panel and the Kitab Bendang open on demand only (Tab or click on a plot; Kad button or Tanya Kitab). Never show them by default. When a plot needs attention, show a small world-space icon above it instead.

## Controls

- Desktop: WASD or arrow keys move, E or Space interacts, Tab opens the plot panel, F opens the phone (pauses the game), Z sleeps (ends the day), Esc closes panels or opens the menu.
- Touch: landscape only. Virtual joystick bottom-left, action button bottom-right. Show a "Pusing fon hang" overlay in portrait. Try `screen.orientation.lock('landscape')` after entering fullscreen and ignore failures (iOS Safari does not support it).

## Performance budget

Target a mid-range Android phone in Chrome:

- Under 150 draw calls; padi blades and grass tufts are `InstancedMesh`
- One shared texture atlas where textures are used; no textures over 1024 px
- Device pixel ratio capped at 2; shadows from one directional light only
- Production build under 20 MB, under 1,000 files (itch.io HTML5 limit)

## Saves

- Autosave to `localStorage` at the start of each day, wrapped in try/catch.
- Store `{ version, state }`. Bump `version` and add a migration in `src/sim/save.ts` when the state shape changes. No save-code export in the MVP.

## Working loop

1. Work milestone by milestone (`docs/mvp-spec.md` section 9). Do not start the next milestone until the current one meets its "Done when".
2. For sim work, write or update tests first in `src/sim/__tests__/`.
3. Before saying a task is done, run:
   - `npm run typecheck`
   - `npm run lint`
   - `npm run test`
   - `npm run build`
   All four must pass.
4. Keep commits small and named by milestone, e.g. `M2: water rises 2 cm/day with gate open`.
5. Add a debug panel (toggle with backtick) that can jump days, add coins and set plot states. Exclude it from production builds.

## npm scripts to provide

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "typecheck": "tsc -b --noEmit",
  "lint": "eslint .",
  "test": "vitest run",
  "zip": "node scripts/zip-dist.mjs"
}
```

`vite.config.ts` must set `base: './'` so the build works when itch.io serves it from a subfolder. `npm run zip` creates `bendang-life-web.zip` from `dist/` with `index.html` at the root.

## Do not

- Add a backend, login, telemetry or ads
- Add physics engines, post-processing stacks or large libraries without asking (the approved list is in `docs/assets-and-tools.md` section 3)
- Add quizzes, NPC tip-givers or any mechanic not in `docs/mvp-spec.md` section 4
- Put game rules in React components or three.js code
- Hardcode text, prices or day thresholds
- Expand scope beyond the MVP list
