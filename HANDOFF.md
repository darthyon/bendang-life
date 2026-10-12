# Handoff

## State
- M0, M1 merged to `main` and pushed (darthyon/bendang-life, private).
- M2 (simulation core) done on branch `m2-sim`, not merged: `src/sim/` (types, rules loader, rng, calendar, actions, day, harvest, selectors, state), `src/state/store.ts`, E runs `primaryJob`, dev-only debug panel (backtick) in `src/ui/debug/`.
- 59 tests; typecheck, lint, test, build pass. A full season plays from the debug panel.

## Next
- M3 Day HUD: real-time clock (5 s per game hour, pauses), Tidur (Z / moon), stat pills, Tugas Hari Ini (`content/tasks.yaml`), plot panel (Tab / click), problem icons, phone with Kedai Tani and Agribank.

## Decisions (M2, approved in plan)
- Loan: 2% charged once, on the balance at the first harvest; each harvest repays the loan first; the rest rolls over.
- Tuai allowed from day 17 (early factor 0.8); ideal days 19 to 18 + variety window; days continue past 20 until M4.
- One rumpai/siput job clears one patch. Health checks the day's band before the overnight water change. Locked plots ignore gates.
- Debug panel labels are English and not in i18n (dev-only, excluded from the build).
- `reasons.*` strings added; Kedah drafts marked `# TODO proofread`.

## Blockers / open questions for the owner
- Balance: a plot sown day 1 can't reach the day-2 band (5–7 cm) until day 4 at +2 cm/day, so every player loses ~12 health. Recorded in `health.test.ts`; numbers unchanged.
- fiber 8 / drei 9 log a `THREE.Clock` deprecation with three 0.186; harmless so far.
