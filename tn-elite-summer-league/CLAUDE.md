# CLAUDE.md — TN Elite Summer League

Elite high-school summer basketball league (Nashville, Belmont University, first tip
Thu Jun 3, 2027) owned by Diamond House Media. **Read `HANDOFF.md` first** — it contains
every locked decision, all budget numbers, the file inventory, and the do-now list.
This file is the working ruleset for code sessions.

## Project shape
- Pure static HTML, zero dependencies, no build system. Do not introduce frameworks
  unless explicitly asked.
- `site/` = the 13-page website (no JS, deploy-ready, iPhone-tuned).
- `pages/` = richer standalone one-file apps (budget calculator has JS with static fallback).
- `office/` + `build/` = Excel/PowerPoint versions and their generator scripts.

## Hard rules (never violate)
- Terminology: **"Season 1 / Season 2"**, never "Session". 2027 = Year One.
- **10-man rosters** → 160 players → 10-round draft. (80 best girls + 80 best boys in TN.)
- **Sundays off, always.** No games, practices, or events on Sundays in any schedule.
- **College D2 officials** — never describe or budget AAU-level refs. League = 3-man
  crews @ $450/game; tournaments = 2-man crews (3-man finals).
- **No PTZ cameras** in any broadcast copy — real manned broadcast cameras/crews only.
- **No cash prizes to players or teams**, anywhere. Tournament winners get hardware/banner/gear.
- **Tournaments are never streamed** — broadcast is the league season's exclusive.
- Coaches are never paired with players from their own school (draft rule).
- League name + franchise names (Forge, Delta, Ridge, Rhythm, Crush, Tri-Star, Summit,
  Gold Rush) are PLACEHOLDERS — keep them clearly swappable.

## Brand tokens (keep every page consistent)
```css
--bg:#09090B; --panel:#121216; --panel2:#17171C; --line:rgba(255,255,255,.09);
--txt:#F5F5F4; --mut:#A1A1AA; --dim:#71717A;
--blaze:#FF4D1C;  /* primary */  --volt:#E8FF3A;  /* secondary */  --ice:#5EEAD4;
font-family:'Poppins' (400–900); headings 800–900 uppercase; pill nav radius 999px;
cards 14–18px radius; kickers 11px/800/.24em uppercase blaze.
```
Apple breakpoint: `@media(max-width:440px)` — verify no horizontal overflow at 393px
before shipping any page change.

## Editing gotchas
- `pages/budget_model.html`: base-case numbers exist in BOTH the JS input `value=""`
  attributes and the baked static tables — change both or they desync.
  Current base: Option A $817,520 exp / $537,000 rev / ($280,520).
  Option B: ~$633,300 / ~$548,500 / (~$84,800); optional T2 → raise ~$52,000.
- `pages/season_schedule.html`: matchups are baked static (round-robin already generated).
  If the format changes, regenerate: circle method, 8 teams, rounds 1–7 + Week-4 rematch,
  slot rotation by week, girls/boys Thursday courts swap weekly.
- All 2027 dates are day-of-week verified — don't shift dates without rechecking the calendar
  (and the conflict map: TSSAA state tournaments, prom Saturdays, AP exams May 3–14,
  graduations May 15–23, Spring Fling, July 4 week, early-August school start).

## Voice
Confident, kinetic, short sentences. "Real Teams. Real Draft. Real Stakes." The manifesto
("The Feeling") in `site/model.html` is approved copy — reuse verbatim in pitches.
