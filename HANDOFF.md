# Handoff

## State
- M0–M3 on `main` (darthyon/bendang-life, private). M4 (night and season end) done on `m4-night`, not merged.
- M4 sim: `events.ts` (deck, one card a night from night 2, every 2–3 nights, stage filter, no two Bala in a row, timed effects), `facts.ts` (unlock triggers), `recap.ts` (night recap), `season.ts` (season end, report, verdict, Musim Baru, Balik KL), `kitab.ts` (Buka tab).
- M4 UI: night scene (card, then recap, then morning), Kitab (rail + Tanya Kitab), season report with Tok Wan at the door, choice, ending card. Night mood switches the world lighting.
- 115 tests; typecheck, lint, test, build pass. Debug panel Sleep/Jump play through nights (free option or decline).

## Next
- M5: fishing (pancing, serkap), Jual Ikan, Live (day 8), Raya (day 14). Add Kucing Oren and Pasar Malam back to the deck (they are filtered by `NOT_YET` in `events.ts`), Raya's free option on Tikus Malam, followers from Kenduri.

## Decisions
- One card a night (owner). `cards_per_draw` in rules.yaml is unused.
- Night order: card first, then the recap, so the recap includes the card's effects. Recap added to spec §4.2.
- Season end: morning after day 20 if nothing is growing; otherwise continues to `season.last_day` (24), then unharvested plots are lost. `season.verdict_margin` (100) for Tok's verdict. Both added to rules.yaml.
- Report shows a neutral "net" line with a signed amount so it never contradicts the verdict.
- Musim Baru keeps coins, loan (interest resets), bags, Kitab facts; plots reset per `plots_by_season`.

## Open questions for the owner
- `tasks.yaml`: `bajak` only appears on day 1 (`day_at_most: 1`); a player who skips day 1 gets no plough task. `naik_air`/`kering` tick only after water changes overnight.
- Water balance: day-2 band unreachable until day 4 (see `health.test.ts`).
- Kedah drafts marked `# TODO proofread` (recap, card effects, report lines, phone no-signal).
