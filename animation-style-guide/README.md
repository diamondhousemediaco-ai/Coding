# Diamond House Media — 8K Animation Style Guide

The reusable version of the huge cinematic "Style: …" prompts we write for
AI-generated animated films (Higgsfield / Seedance and similar image-to-video
engines). Instead of hand-retyping a 1,500-word style block for every scene,
build from this.

## Start here

0. **`sessions/`** — the synced session logs (the actual Claude working sessions).
   **`sessions/gouache-film-old-man-porsche.md`** is the primary one: the full
   "old man fixes his Porsche, then drives it in the desert" gouache short film —
   house style, the 1978 Porsche 911 SC, the desert garage, the red-sand desert,
   the 5-generation blocking, and every prompt verbatim. **This is the source of
   truth.**
1. **`STYLE_GUIDE.md`** — the house DNA: the non-negotiables that hold across
   every look, plus the anatomy of a prompt and the rules for reference images,
   cinematography, lighting, color (60:30:10), physics, audio, and the negative
   spine.
2. **`presets.md`** — three paste-ready `Style:` blocks (the three looks).
3. **`PROMPT_TEMPLATE.md`** — a fill-in-the-blanks scene skeleton + a pre-flight
   checklist.
4. **`reference/`** — the four gouache action-scene prompts (gunslinger,
   snowboarder) the Porsche session **studied to establish the format and house
   laws**. A different world, same house style — kept verbatim as format models.

## The three looks

- **A · Gouache feature** (lineless, real-time) — gunslinger, snowboarder.
- **B · Hand-drawn 2D IMAX on twos** (drama, dialogue) — the blizzard.
- **C · 2.5D painterly comic on twos** (Spider-Verse / Arcane) — Ancient Champions.

## How to make a new scene

1. Pick a look → paste its `Style:` block from `presets.md`.
2. Fill `PROMPT_TEMPLATE.md`: map every `@Image N` to a CHARACTER TAG, put the
   scene's hardest rule at DIRECTOR'S NOTE #1, name a lens per shot, write the
   60:30:10 color split, list the SFX.
3. End with the `Constraints:` run-on restating the rules + the negative spine.
4. Generate several takes and cull.

## Provenance

Synced from Diamond House Media's Claude history on **2026-07-25**. The primary
source is the working session **"Gouache Animation — Full Session Log & Prompt
Bible"** (the old-man-and-Porsche short film), saved verbatim in
`sessions/gouache-film-old-man-porsche.md`. The `reference/` prompts are the four
gouache action scenes that session studied to lock the format (Drive links in
`reference/README.md`). This folder is the version-controlled, continuously-editable
home for the style system — edit the guide whenever a new scene teaches us a better
rule.

## The Porsche film — where it stands (from the session)

Story arc: **dawn → the work → pride → firing it up → the release.** Condensed to
**5 generations × 3 cuts**: (1) Dawn/the garage · (2) The work (under the car) ·
(3) Pride · (4) Ignition/roll-out · (5) The drive (road + aerial + old man at the
wheel). The session has the full single-beat prompts for Shots 1–3 written out
(plus GPT-Image still versions); the **open next step is combining them into the 5
multi-cut generation prompts**, then generating. Reference library and per-prompt
upload keys are in the session log §7.
