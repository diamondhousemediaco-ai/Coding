# Diamond House Media — 8K Animation Style Guide

The reusable version of the huge cinematic "Style: …" prompts we write for
AI-generated animated films (Higgsfield / Seedance and similar image-to-video
engines). Instead of hand-retyping a 1,500-word style block for every scene,
build from this.

## Start here

1. **`STYLE_GUIDE.md`** — the house DNA: the non-negotiables that hold across
   every look, plus the anatomy of a prompt and the rules for reference images,
   cinematography, lighting, color (60:30:10), physics, audio, and the negative
   spine.
2. **`presets.md`** — three paste-ready `Style:` blocks (the three looks).
3. **`PROMPT_TEMPLATE.md`** — a fill-in-the-blanks scene skeleton + a pre-flight
   checklist.
4. **`reference/`** — the finished, field-tested prompts this was distilled from.
   The source of truth; when the guide and a reference disagree, the reference
   wins.

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

Synced from Diamond House Media's Claude history / Google Drive on **2026-07-25**
(latest doc: "Tim prompts"). Drive links are in `reference/README.md`. This folder
is the version-controlled, continuously-editable home for the style system — edit
the guide whenever a new scene teaches us a better rule.
