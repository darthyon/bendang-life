# Handoff

## State
- M0–M2 on `main` (darthyon/bendang-life, private). M3 (Day HUD) done on `m3-hud`, not merged.
- M3: running clock (5 s per game hour, quarter-hour steps, pauses with the phone), 7 PM auto day end, Z/F/Tab/Esc, Tugas Hari Ini from `content/tasks.yaml` (`src/sim/tasks.ts`), plot problems + world icons, HUD (`src/ui/hud/`), plot panel (`src/ui/panels/`), phone with Kedai Tani and Agribank (`src/ui/phone/`), toasts, wake fade. Fonts: Nunito + Grandstander (latin subsets).
- 75 tests; typecheck, lint, test, build pass. Debug panel still on backtick (dev only).

## Next
- M4 Night and season end: night cards (`content/events.yaml`), Kitab (left rail + Tanya Kitab in plot panel), season report, Tok Wan's verdict, stay or balik KL.

## Decisions
- No PRODUCT.md/DESIGN.md: spec + refs are the design authority (owner's choice). UI tokens live in `src/styles.css` `:root`.
- Player card shows `hud.player_placeholder` until M6. Left rail and phone show only built features (Fon; Kedai Tani, Agribank).
- Plot panel is information only; jobs are done with E. On short screens (≤520 px high) it sits on the right.
- A finished task stays ticked for the day (`TaskRef.done`). `canApply` reports "doesn't apply here" before "no time".
- M2 decisions still hold (loan interest once at first harvest; tuai from day 17; one patch per job).

## Open questions for the owner
- `naik_air` / `kering` tasks complete only when water is in the band, which changes overnight, so they never tick on the day they appear.
- Water balance: day-2 band unreachable until day 4 (see `health.test.ts`).
- Kedah drafts marked `# TODO proofread` (reasons, HUD placeholder, AM/PM).
