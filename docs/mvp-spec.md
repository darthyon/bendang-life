# Bendang Life — MVP Design Doc v2.0

Snapshot of the living design doc (Oct 12, 2026). Numbers in `content/rules.yaml` are the source of truth when they differ from this file.

## 1. What we're building

**Bendang Life** is a cozy isometric browser game where you plant, flood, feed and harvest padi on Tok Wan's small Kedah bendang. Every farming rule is real; the people (and the hantu raya) around you are not.

**Pillars**

1. **Learn by doing.** Every job follows Malaysia's Rice Check guidance for granary farmers.
2. **You do the work.** Every job is yours, and a day has 13 hours. Money buys seed and baja, never help. Deciding what to do today is the game.
3. **Cozy, never punishing.** No game over. A bad season ends with Tok Wan saying "takpa".
4. **Unhinged in the writing only.** Night cards carry the jokes; the farming stays honest.

**What we take from famous games**

| Game | What works there | What we take |
| --- | --- | --- |
| Sakuna: Of Rice and Ruin | Real rice steps, and a farming manual that fills in as you learn | Real steps and the Kitab Bendang |
| Stardew Valley | A day is a budget of hours; sleeping ends it | Hours per job, sleep to end the day |
| Animal Crossing | New things unlock with time, not grinding; a collection to fill | Plots open by season; Live opens on day 8; facts to collect |
| Reigns / BitLife | Two or three choices on a card, short funny text, instant result | Night cards |
| A Short Hike | One small place you can cross in seconds; finished in an hour or two | One island, about 20 minutes a season |
| Unpacking | No fail state; the story is told through objects, not cutscenes | No game over; no cutscenes, just short scenes with Tok Wan at the cottage |

**What we avoid from them:** Stardew's energy bar, relationships and crafting; levels and XP; long cutscenes.

## 2. Story and hook

**Hook:** *Lutut Tok dah tak larat. Bendang tak boleh tunggu. Satu musim ja.* (Tok's knees are done. The bendang isn't. One season to learn real rice farming.)

You are a young Kedahan working in KL. Tok Wan (your grandfather) can't work the bendang this season and asks you to come home, or the land gets rented out. You live alone in the cottage by the bendang; Tok Wan rests his knees at his house in the kampung.

**Tok Wan appears twice a season**, as a character standing at the cottage: at the start (hands over the money and his notebook, gives the Day 1 tutorial) and at the end (reads your season report). In between he is only present through his notebook, the Kitab Bendang. Tok Wan is alive and well, so no inheritance and no faraid.

| Beat | In the game |
| --- | --- |
| Call | 3 intro text cards: KL at night, Tok's voice note, the bus home |
| Threshold | Tok Wan meets you at the cottage with RM1,250 (*duit modal Tok*), his notebook (the Kitab Bendang) and three bags of seed: you pick one |
| Trials | The season: water, baja, pests, money, night cards; Raya moves in on day 14 |
| Going public | Day 8: your KL friends ask what you're doing, so Live opens |
| Ordeal | Drain, harvest, sell |
| Reward | Tok Wan comes back to the cottage and reads your season report: untung, pulang modal or rugi |
| Return | Stay for another season (Tok Wan gives you another plot) or balik KL (ending card) |

## 3. Scope

| In the MVP | Not in the MVP |
| --- | --- |
| One island: your cottage, 4 plots, canal, 2 sluice gates, longkang | Other locations, a shop building, Tok Wan's house |
| 3-card intro, 3-step onboarding; Tok Wan at the cottage at season start and end | Cutscenes, Tok Wan walking around during the season |
| The 11 mechanics in section 4 | XP and levels, quizzes, NPC tips, hiring help (traktor, jentuai, upah orang) |
| 10 night cards | More cards, branching storylines |
| Autosave | Save codes, cloud saves, accounts |
| Kedah first (proofread by Yon), English option | Other dialects |
| | Tech unlocks (drone, IoT, solar pump), cosmetics, machine models |

## 4. Mechanics

This is the complete list. If it isn't here, it isn't in the MVP.

### 4.1 Walk and interact

WASD or arrows (joystick on a phone) to move. When you stand at something you can use, a prompt appears above you; press E or Space (action button on a phone). F opens your phone (section 4.6).

### 4.2 The day

- 6:00 AM to 7:00 PM. One game hour passes every 5 real seconds while you walk or idle.
- A job jumps the clock by its hours. If it doesn't fit before 7 PM: "Tak dan dah hari ni. Esok la."
- The clock stops while the phone, the Kitab, a night card or a menu is open.
- **Tidur** (Z, or the moon button) ends the day from anywhere. At 7 PM the day ends by itself.
- Night is a short scene. On card nights, a night card appears first.
- One season is 20 days. They stand for a real season of about 110 days.

### 4.3 Farm jobs

| Job | Where | Time | Real rule it teaches |
| --- | --- | --- | --- |
| Bajak (plough) | Empty plot | 2 h | Plough before sowing; clear weedy rice |
| Tanam (sow) | Ploughed plot | 1 h + 1 bag benih | Certified seed, sown on wet level soil |
| Pintu air (gate) | Sluice gate | 0.5 h | Water depth by stage |
| Baja (fertilise) | Planted plot | 1 h + 1 bag baja | Four fertiliser stages |
| Rumpai (weed) | Weed patch | 1 h | Weed control in the critical window |
| Siput (snails) | Snail patch | 1 h | Golden apple snails hit the first weeks |
| Tuai (harvest) | Ripe plot | 2 h | Drain first; harvest at 85–90% yellow grain |

Hours are tuning: short enough that 4 plots can be ploughed and sown on day 1.

### 4.4 Water

- Gate open: water rises 2 cm a day. Gate closed: it falls 1 cm a day. Gate A feeds Plots 1–2; Gate B feeds Plots 3–4.
- Each stage has a target band (section 5). Every day outside the band costs 6 health.
- Night cards can add water (heavy rain) or drain it (heat).

### 4.5 Plot health and yield

- Each plot has health 0–100, starting at 100. Wrong water, weeds (2 a patch a day) and snails (4 a patch a day) lower it.
- **Yield** = variety base yield × health ÷ 100 × fertiliser (−10% per missed stage) × harvest timing × card effects.
- Weeds can appear on days 1–12, snails on days 2–6. A problem shows as a small icon floating over the plot.

### 4.6 Your phone

There is no shop building. The phone is not on screen: open it with the phone icon or F. Opening it pauses the game. Everything to do with money happens here, from anywhere. Orders are delivered to the cottage steps straight away.

| App | What it does |
| --- | --- |
| Kedai Tani | Order benih and baja |
| Agribank | Request the season loan, see the balance, repay part or all of it early |
| Jual Ikan | Sell your fish (a buyer collects them) |
| Live | Go live (from day 8, section 4.9) |

**Kedai Tani prices**

| Item | Price | Notes |
| --- | --- | --- |
| Benih MR297 | RM150 | 1,700 kg base yield. Forgiving; the most popular variety in Muda |
| Benih MR220 CL2 | RM220 | 1,600 kg. Weeds barely grow (×0.4) |
| Benih MRQ76 | RM160 | 1,300 kg. Fragrant: sells for 1.4× per kg, but only a 1-day harvest window |
| Baja | RM110 a bag | One bag per stage per plot |
| Agribank loan | Up to RM2,000 | About 2% for the season on what is still owed at harvest. Whatever is left is repaid from the harvest automatically; if the harvest can't cover it, it rolls over |

Harvested padi is sold automatically.

### 4.7 Night cards

A card comes every 2–3 nights, from night 2. Cards look like trading cards, in a frame we design ourselves (no copied frame, logo or fonts). Each shows a big title, the real thing in small text under it, an art window and the options.

- **Bala** (purple frame): something happens. Pick a response: spend money, spend time, or *biar* (take the damage).
- **Rezeki** (green frame): an offer with a catch. Take it or decline.

Balance rules: every Bala has a free option; no Rezeki is purely positive; never two Bala nights in a row; cards are filtered by stage.

| Card | Real thing | Options |
| --- | --- | --- |
| 🟣 Hujan Tak Ingat Dunia | Heavy rain | Open the outlet (−1 h tomorrow) · Rent a pump (−RM80) · Biar (+4 cm water) |
| 🟣 Matahari Dua Biji | Heatwave | Pump water (−RM70) · Watch the gate (−1 h a day for 3 days) · Biar (−2 cm a day for 3 days) |
| 🟣 Geng Gondang Emas | Golden apple snails | Pick them (−2 h) · Borrow the neighbour's ducks (−RM60) · Biar (−4 health a day for 3 days) |
| 🟣 Sindiket Tikus Malam | Rats | Gotong-royong rat hunt (−3 h, unlocks a fact) · Bait (−RM70) · Biar (−5% yield) · *Raya keeps watch (free, once he has moved in)* |
| 🟣 Padi Angin Menyamar | Weedy rice | Pull it out (−2 h) · Herbicide (−RM60) · Biar (−3% yield) |
| 🟣 Fon Jatuh Dalam Bendang | Wet phone | Bury it in rice (free; works half the time, and the Kitab tells you it's a myth) · Cheap phone (−RM150) · Biar (no phone for 2 days) |
| 🟢 Ceramah PPKK | Fertiliser talk | Free bag of baja · costs 2 h tomorrow |
| 🟢 Pasar Malam | Night market | Fish sell for 1.5× tomorrow · stall costs RM20 |
| 🟢 Kucing Oren | Kampung cat | Brings you a keli · knocks a baja bag into the parit |
| 🟢 Kenduri Sebelah | Helping at a kenduri | +20 followers and a new Kitab fact · costs 3 h tomorrow |

### 4.7a Raya, the Gen Z hantu raya

A companion, not a card. Comedy only: no rituals, offerings or scares.

- **Arrives** on day 14 of the first season: a one-off scene at the cottage. He followed the Wi-Fi from your Live streams. "Salam bang. Boleh share password WiFi?" The only button is "Okey la…". He appears in the Kitab's Unlocks tab.
- **Follows you** around after that: translucent, hoodie, phone out. Every couple of minutes he says something (lines in `raya.*`).
- **One job: keeping watch.** On the Sindiket Tikus Malam card he adds a free option. 1 time in 5 he was busy streaming and forgot: you take the *biar* damage, and he says "Seen 2:14 pagi."
- He never does farm jobs. The work stays yours.

### 4.8 Fishing

- **Pancing** at the longkang, any time of day: haruan, puyu, sepat, tilapia.
- **Serkap** in a drained plot (day 1 before ploughing, days 17–20, after harvest): keli and haruan.
- **Play:** a needle swings across a bar; press E in the green zone. Bigger fish have a smaller zone. 1 hour a try; a few catches per spot per day.
- **Sell** on the phone (Jual Ikan): keli RM9, haruan RM12, puyu RM3, sepat RM2, tilapia RM5. It helps, but can't replace a harvest.

### 4.9 Live

- Opens on day 8 of the first season, with a story card from your KL friends.
- Press Live, confirm "Go live (1 h)". Once a day, anywhere outdoors.
- Pay: RM10 + RM1 per 10 followers, up to RM60.
- Followers: +8 a stream, plus bonuses for today: +6 for doing a farm job, +4 for catching a fish, +10 for harvesting. Followers carry over.
- Result: a toast with viewers, coins and bonuses. About RM300 a season against about RM3,400 from one plot.

### 4.10 Kitab Bendang and the season end

- **Kitab (Tok Wan's notebook):** opens from the left rail or "Tanya Kitab" in the plot panel, and pauses the game. Two tabs:
  - **Nota:** facts unlocked from jobs, cards and seeds, each with its Rice Check item and source.
  - **Buka:** everything you've unlocked and what's next. Locked entries show ??? with a hint: Live (day 8), Raya (day 14), Plot 2 (season 2), Plots 3–4 (season 3).
- **Season report:** yield, sale, potongan, subsidy, costs, loan repayment, net profit, what went right, what was missed, new facts.
- **Potongan** at sale: 5% always, +15% if the plot still had more than 1 cm of water at harvest, +10% if harvested after day 20; up to 30%.
- **Sale:** RM1.50 a kg plus RM0.50 subsidy.
- **Tok Wan's verdict** (he stands at the cottage door): untung (net above RM100), rugi (below −RM100) or pulang modal.
- **Choice:** Stay → Musim Baru: keep coins, loan, followers, fish and Kitab; plots reset; one more plot opens (season 1: Plot 1; season 2: Plots 1–2; season 3 onward: all 4). Balik KL → ending card with your kg and facts learned, credits, Ko-fi link.

## 5. The season calendar

| Day | Stage | Water target | Jobs |
| --- | --- | --- | --- |
| 1 | Tabur (sowing) | 0–1 cm | Plough, sow Tok Wan's seed (later seasons: order seed first) |
| 2–7 | Anak padi | 5–7 cm | Raise water; baja stage 1 (day 2) and 2 (day 6); snails |
| 8–16 | Beranak & bunting | 5–10 cm | Weeds; baja stage 3 (day 10) and 4 (day 13) |
| 17–18 | Masak | 0–1 cm | Drain the plot; serkap |
| 19–20 | Sedia tuai | 0–1 cm | Harvest at 85–90% yellow grain |

Each baja stage has a 2-day window. The cm targets are real; the day numbers are scaled.

## 6. Player flow

1. Start screen: Mula Main, Tetapan, Keluar.
2. Intro: 3 text cards (skippable after the first play).
3. Onboarding, 3 steps: pick a character (4 presets) → enter your name → ready?
4. Tok Wan at the cottage: RM1,250, the notebook, and the **starter seed**: three cards (MR297, MR220 CL2, MRQ76), each with its trait and a one-line fact, like picking a starter in Pokémon. Pick one bag.
5. Day 1 tutorial with Tok Wan: controls, then plough Plot 1 and sow the seed you picked. The phone is introduced on day 2, when the first baja is due.
6. Days 1–20.
7. Tok Wan returns: season report and his verdict.
8. Stay (Musim Baru) or balik KL (ending).

## 7. Screens and UI

Follow `docs/refs/`. The default screen stays clean; everything else opens on demand.

- **Always on:** player card (top left) with Tugas Hari Ini under it; stat pills (top right): coins, benih, baja, fish, day and time; the Tidur button; the context prompt above the player.
- **Problem icons:** float over a plot that needs attention. No panel opens by itself.
- **Plot panel (Tab or tap a plot):** variety, stage and day, water against the target, baja x of 4 and when the next is due, health, weeds, snails, the jobs with their hours, and Tanya Kitab.
- **Left rail icons:** Fon (phone), Kitab (a book), Tetapan.
- **Phone:** a phone-shaped panel with 4 app tiles (section 4.6). Pauses the game. The Agribank balance lives in its app.
- **Kitab:** a book that opens over the screen. Pauses the game.
- **Night card:** centred, one card a night; Bala shows 2–4 response buttons, Rezeki shows take or decline.
- **Phone:** landscape only; "Pusing fon hang" overlay in portrait.

## 8. Assets

Grey-box with primitives until M7. Full list and pipeline in `docs/assets-and-tools.md`.

- **Made in code:** island, plots, water, padi (5 stages), weeds, snails, lighting, all UI.
- **Characters:** one Quaternius base body with 5 animations (idle, walk, work, cast, wave); 4 player presets, Tok Wan and Raya (translucent, hoodie, phone) made by recolouring and adding headwear or props.
- **Made by hand (Blender or Blockbench):** the cottage, pintu air and 4 handheld tools.
- **From CC0 packs:** trees, rocks, bushes, sacks, crates, fences (Kenney, Quaternius).
- **2D:** about 25 icons (Inkscape or Kenney); 2 card frames (Bala, Rezeki); 10 small card illustrations at M7 (the art window shows the category icon until then). Fish are icons, never 3D.
- **Audio:** CC0 ambience (frogs, crickets, birds), about 10 sound effects, 2 music loops; all from open sources.
- **Not made, on purpose:** a shop, a jetty, machines, workers, animals, 3D fish, card illustrations, Tok Wan's house.

## 9. Milestones

| # | Milestone | Done when |
| --- | --- | --- |
| M0 | Scaffold | Stack runs; empty scene renders; all checks pass |
| M1 | Grey-box island | Island, plots, gates, longkang, cottage in primitives; walking; E prompts |
| M2 | Simulation core | Jobs, water, health, yield, orders, loan, potongan pass unit tests; a full season plays from the debug panel |
| M3 | Day HUD | Clock, Tidur, stat pills, Tugas Hari Ini, plot panel, problem icons, phone with Kedai Tani and Agribank |
| M4 | Night and season end | Night cards, Kitab, season report, Tok Wan's verdict, stay or balik KL |
| M5 | Side income and Raya | Fishing, Jual Ikan, Live, Raya's arrival, following and keeping watch |
| M6 | Front door | Start screen, intro, onboarding, Tok Wan's welcome, starter seed cards, tutorial, autosave |
| M7 | Art pass | Models, padi stages, lighting, sound, matching the refs |
| M8 | Ship | Phone controls, rotate overlay, itch.io build, credits, Ko-fi |

## 10. Backlog

Hiring help (traktor, jentuai, upah orang), tech unlocks (drone, IoT water sensor, solar pump, Rakan Tani AI), more night cards, cosmetics, save codes, the cross-section view of the plots.

## 11. Key sources

- Rice Check list: https://doi.org/10.1186/s40066-025-00524-5
- Floor price: https://www.kosmo.com.my/?p=724167 · Subsidy: https://www.bharian.com.my/amp/berita/nasional/2025/12/1481362/bhplus
- Costs per hectare: https://www.bharian.com.my/amp/berita/nasional/2026/05/1543195/bhplus
- Agrobank 2026 padi loan: https://www.bernama.com/bm/news.php?id=2555042
- Fish at ploughing (Padang Terap): https://www.kosmo.com.my/?p=34756

Disclaimer for the title screen: Bendang Life is loosely based on real research on paddy farming in Kedah. Characters, the hantu raya and some names are fictional. Figures reflect 2024–2026 reporting and may have changed.
