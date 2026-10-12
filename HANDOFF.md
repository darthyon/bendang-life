# Handoff

## State
- M0–M4 on `main` (darthyon/bendang-life, private). M5 (side income and Raya) on `m5-side`, not merged.
- M5 sim: `fishing.ts` (pancing at the longkang, serkap on drained plots, catches per spot per day, Jual Ikan value), `live.ts` (unlock day 8, pay by followers, bonuses), Raya arrival + guard option in `events.ts`, story moments (`moments` queue, `ACK_MOMENT`), Kucing Oren / Pasar Malam back in the deck.
- M5 UI: fishing minigame (`src/ui/fishing/`), Q for serkap with a two-line prompt, fish pill, Jual Ikan and Live phone apps, moment cards (Live intro, Raya arrival), Raya following with idle lines (`src/scene/Raya.tsx`), guard outcome in the recap.
- 135 tests; typecheck, lint, test, build pass. Debug panel has "Sleep with card" to force any night card.

## Next
- M6 Front door: start screen, intro (3 cards), onboarding (character, name, ready), Tok Wan's welcome, starter seed cards, tutorial, autosave.

## Decisions
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
