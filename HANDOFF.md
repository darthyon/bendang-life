# Handoff

## State
- M0–M5 on `main` (darthyon/bendang-life, private). M6 (front door) on `m6-front`, not merged.
- M6: start screen, intro (Langkau after first play), 3-step onboarding with 4 presets, Tok Wan's welcome + starter seed cards, day-1 controls and day-2 phone tutorials, autosave (`src/sim/save.ts` versioned format, `src/state/persist.ts` localStorage), Tetapan (language, back to menu, delete save), Keluar goodbye card.
- M5 sim: `fishing.ts` (pancing at the longkang, serkap on drained plots, catches per spot per day, Jual Ikan value), `live.ts` (unlock day 8, pay by followers, bonuses), Raya arrival + guard option in `events.ts`, story moments (`moments` queue, `ACK_MOMENT`), Kucing Oren / Pasar Malam back in the deck.
- M5 UI: fishing minigame (`src/ui/fishing/`), Q for serkap with a two-line prompt, fish pill, Jual Ikan and Live phone apps, moment cards (Live intro, Raya arrival), Raya following with idle lines (`src/scene/Raya.tsx`), guard outcome in the recap.
- 135 tests; typecheck, lint, test, build pass. Debug panel has "Sleep with card" to force any night card.

## Next
- M7 Art pass: models, padi stages, lighting, sound, matching the refs (follow `docs/assets-and-tools.md`).

## Decisions
- M6: Keluar shows a goodbye card (web can't close the tab). Tetapan = language, save + back to menu, delete save with confirm. Saves happen each morning, after onboarding, on Musim Baru, before leaving to the menu, and quietly when a tutorial or moment is dismissed.
- Q does serkap (owner); added to AGENTS.md Controls. Touch gets a second button in M8.
- Fishing: a miss still costs the hour; only catches count against the spot's daily limit. The green zone's position is visual only (not sim RNG).
- Live pays on followers before the stream; viewers shown = followers after.
- Raya's idle line timer counts real time only while the player is moving.
- Phone and Kitab mount their contents only while open, so they reopen on their first screen.
- Earlier decisions (M2–M4) still hold; see git history and spec §4.2.

## Open questions for the owner
- `tasks.yaml`: plough task only on day 1; water tasks tick only after the overnight change.
- Water balance: day-2 band unreachable until day 4 (`health.test.ts`).
- Raya is often hidden behind the player and prompt while following (grey-box; revisit with M7 models).
- Kedah drafts marked `# TODO proofread`.
