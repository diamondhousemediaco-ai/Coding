# Diamond House Media — 8K Animation Style Guide

The house style for our AI-generated animated films (Higgsfield / Seedance and
similar image-to-video engines). This is the reusable version of the huge
"Style: …" blocks we hand-retype for every scene. Read this once, then build any
new scene from `PROMPT_TEMPLATE.md` and one of the looks in `presets.md`.

**Source of truth:** the working session log
`sessions/gouache-film-old-man-porsche.md` (the old-man-and-Porsche film), plus the
format-model prompts in `reference/` that the session studied. When this guide and
the session/reference prompts disagree, the prompts win; then fix this guide.

Last synced from Claude history: **2026-07-25** (session: "Gouache Animation — Full
Session Log & Prompt Bible").

---

## 0. The one-paragraph version

Every film is **8K, hand-made-looking, and reference-locked.** A character
reference image is law and overrides any text. Bodies stay solid and readable in
every frame — no melting, morphing, warping, or extra limbs. We shoot it like a
real DP would (Lubezki / Deakins, named lenses, off-center framing, one motivated
light), obey real physics and gravity (cause before effect, no floating, no slow
motion unless asked), and paint the world — atmosphere and effects are painted
shapes, never volumetric CGI. We forbid the tells of AI slop: gloss, chrome, lens
flare, photoreal faces, Pixar/DreamWorks/anime rendering, on-screen text, and
music. Audio is environmental SFX only. Then we generate several takes and cull.

---

## 1. The non-negotiables (house DNA — true for every look)

These hold whether the film is gouache, hand-drawn 2D, or 2.5D comic.

1. **8K, hand-made rendering.** Always specify 8K (IMAX for the 2D look). The
   image must read as painted/drawn by a human, never as a 3D render, game
   engine, or CGI.
2. **Character reference is absolute.** The reference images (`@Image N`) are the
   source of truth. Faces, outfits, gear, and locations are replicated **exactly
   1-to-1** in every frame. **Reference always overrides text.**
3. **Anatomy lock / solid drawing.** One head, two arms, two hands with correct
   fingers, two legs — every frame, every angle. Props keep their exact count and
   shape (e.g. "EXACTLY TWO revolvers, one per hand — never three guns, never a
   third arm"). Clean separated silhouette. **Nothing melts, smears, warps,
   dissolves, or merges.**
4. **The 12 principles of animation** run through everything: anticipation,
   squash & stretch, follow-through & overlapping action, slow in/slow out, arcs,
   secondary action, exaggeration, and solid drawing — applied to bodies, cloth,
   hair, props, and even debris.
5. **Shoot it like a real film.** Cinematography referenced to **Lubezki /
   Deakins**, a physical cine lens, a named focal length per shot, and
   **off-center composition** (rule of thirds + golden ratio). Respect the axis of
   action — never cross the line.
6. **One motivated light.** A single unified/motivated source lights the
   character and the world together. Flat painted shadow shapes. **No lens flare,
   no god rays, no rim glow** unless the scene explicitly motivates it.
7. **Color by 60:30:10.** State a dominant / secondary / accent split every time
   (see §5).
8. **Real physics.** Gravity and inertia respected, real weight, correct contact
   shadows, **cause before effect**. Nothing floats. **No slow motion** unless a
   deliberate, called-out speed ramp.
9. **Painted atmosphere & effects.** Snow, dust, smoke, sparks, muzzle flash —
   all **painted shapes that obey gravity**, never a volumetric simulation, never
   a photographic bloom.
10. **Environmental SFX only. No music. No subtitles.** (Dialogue is allowed when
    the scene needs it — see §7.)
11. **The negative spine.** Always forbid the AI tells (see §8).

---

## 2. Anatomy of a prompt (the block order we always use)

Build every scene in this order. Blocks with `*` are only present when relevant.

1. **`Style:`** — the look's opening paragraph (paste from `presets.md`).
2. **`DIRECTOR'S NOTES — non-negotiable for every frame:`** — a numbered list of
   the hard rules *specific to this scene* (which prop counts, what must NOT
   appear, how fast the motion is, etc.). This is where scene-specific discipline
   lives.
3. **`COMPOSITION LAW:`** — shot count, cut style, screen direction, depth
   staging, how large the subject sits in frame.
4. **`CHARACTER TAGS:`** — the mapping from each `@Image N` to a named entity and
   its exact description (see §3).
5. **`Cinematography:`** — DP reference, lens per shot, camera behavior.
6. **`The 12 principles of animation:`** — how they apply to this scene.
7. **`Lighting:`** — the single motivated source and its rules.
8. **`Emotional tone:`** — one line on the feeling.
9. **`Color:`** — the 60:30:10 split for this scene.
10. **`Physics:`** — weight, speed, what reacts to what.
11. **`Audio:`** — the specific environmental SFX list; "No music. No subtitles."
12. **`*Voice / Lip-sync direction:`** — only when characters speak (see §7).
13. **`SHOT 1 (0.0–2.0s) …` / `HARD CUT to SHOT 2 …`** — the timed shot list,
    each shot naming its lens, framing, and action, referencing entities by tag.
14. **`Constraints:`** — a single dense run-on sentence that **restates every
    hard rule** from above. This redundant recap is intentional; the engines
    respond to it. End it with the negative spine (§8).

---

## 3. The reference-image system

- Reference images are addressed as `@[Image 1](image_1)`, `@[Image 2](image_2)`,
  etc. By convention **Image 1 is usually the world/location or style plate**, and
  later images are characters and props.
- Every image gets a **CHARACTER TAG**: a `NAME = the thing from @[Image N]`
  line with the full description baked in, e.g.:

  > THE GUNSLINGER = the woman from @[Image 2] — short choppy black hair with an
  > undercut, cream shearling-collared jacket over a black t-shirt, black tactical
  > pants, two compact silver revolvers.

- Then **refer to entities by tag** in the shot list (`THE GUNSLINGER`,
  `THE BOARD`, `THE FOREST`) *and* re-cite the image (`from @[Image 2]`) inside
  the shots. Say it twice; the engines need it.
- **Reference always overrides text.** State this explicitly.
- **Strip the reference's studio framing.** If a character sheet has a white/studio
  background, forbid it: "STRICTLY FORBIDDEN: applying the studio/white background
  of the reference to the video." Same for sketch/study framing on a location.
- Props that have no reference get described as real, solid objects, never energy:
  "a REAL SOLID arrow, NOT a glowing energy bolt, never a light beam."

---

## 4. Cinematography language

- **Name the DP:** "Cinematography: Lubezki / Deakins" (or "Emmanuel Lubezki ×
  Roger Deakins").
- **Name a lens per shot:** 16mm / 24mm low tracking, 35mm medium OTS, 85mm
  extreme close-up, wide anamorphic ~35mm, etc.
- **Give the camera a job in every shot** — trucking, tracking, pushing,
  orbiting, backward-leading — and **match it to the subject's motion.** "Never
  planted, never locked-off, never slower than she is."
- **Handheld vs. rigged is a deliberate choice:**
  - Drama / action-in-the-scene → "fully handheld in human hands… never tripod,
    never dolly, never crane, never aerial," restless micro-shake, dutch tilt on
    the biggest hit.
  - Aerial / freefall → FPV drone, smooth tracking matched to the fall rate.
- **Composition is off-center, always.** Rule of thirds + golden ratio, negative
  space, "FORBIDDEN: centered or symmetric framing." Stage three depth scales
  (near subject / mid action / deep background).
- **Respect screen direction and the axis of action.** Pick a direction (e.g.
  "she moves LEFT TO RIGHT") and keep the camera on one side of the line.

---

## 5. Color — the 60:30:10 rule

State the split on every scene: **60% dominant / 30% secondary / 10% hot accent.**
Examples from our films:

- Gunslinger: `60:30:10 dominant pale white snow and fog / dark pine trunks and
  grunt visors / hot accents of muzzle-flash orange and her cream jacket.`
- Snowboarder: `60:30:10 dominant white cloud sea and peaks / cobalt sky / hot
  accents of his outfit and the burnt-orange board.`
- Blizzard: `60:30:10 dominant snow-blue / black trunks / cold accent.`

The 10% accent is almost always the character's signature color or the one hot
event (a muzzle flash, a board). Keep it rich but controlled — **not neon, not
oversaturated.**

---

## 6. Lighting & physics law

**Lighting**
- One unified/motivated source; character and world lit by the *same* light.
- Flat painted shadow shapes, not gradient CG shading.
- Forbid: rim glow, lens flare, god rays, volumetric shafts, photographic
  starbursts/bloom — unless the scene explicitly calls for a source (e.g. a
  painted sun disc with flat graphic rays).
- Faces stay readable — "never black voids."

**Physics**
- Gravity + inertia respected; real weight; correct contact shadows.
- **Cause before effect** — the arrow leaves the bow and travels *before* it
  strikes; the body is knocked back *by* the hit, not before it.
- Cloth and hair lag the body with real inertia (follow-through), never drift like
  underwater.
- **No floating. No slow motion** unless a deliberate in-camera speed ramp — and
  even then the motion never *stalls*, it only changes rate.
- Speed lives in the world: parallax blasting past, spray exploding off feet,
  fabric streaming in the airstream.

---

## 7. Audio & voice

- **Default:** environmental SFX only, listed specifically ("hard fast crunching
  snow, ragged breathing, sharp gunshots, shell casings, grunt impacts").
  **No music. No subtitles.**
- **Dialogue scenes** add two blocks:
  - **VOICE ACTING DIRECTION** — describe the performance, not a read: age, pitch,
    breath, emotional undercurrent, how each key line differs. ("child's voice not
    adult-imitating-child, never performed cute.")
  - **LIP SYNC REQUIREMENT** — the speaking face must be visible and the mouth,
    lips, and jaw must form the actual syllables frame by frame, on twos, each
    phoneme a distinct held pose. Spell out the mouth shapes for the target
    language's sounds. "Lips drive the words. No mumbling, no closed-mouth
    narration, no voice-over disconnected from the face."

---

## 8. The negative spine (paste at the end of every Constraints block)

> no Pixar or DreamWorks or anime face rendering, no photorealism, no 3D render,
> no game-engine or game-cutscene look, no CGI smoothness, matte everything with
> zero gloss and no chrome, no lens flare, no god rays, no morphing, no melting,
> no smearing, no limb distortion, no warping, no text or letters or numbers or
> logos anywhere, atmosphere as painted shapes never volumetric simulation, no
> music.

Add the look-specific tells too:
- **Gouache look:** "LINELESS painting with no outlines anywhere," "no breath
  vapor," "no gradient CG shading."
- **On-twos looks:** "NO smooth interpolation, NO motion blur, NO liquid or
  melting surfaces — surfaces stay solid, motion is the redrawing of strokes, not
  AI slop."

---

## 9. Engine / platform settings

For the Seedance / Kök Börü format:

> Seedance 2.0 · mode std · 1080p+ · bitrate high · genre action · audio on.
> Generate several takes and cull.

General workflow discipline:
- **Generate several takes and cull** — never expect one-shot perfection.
- Keep each shot short and urgent (2–5s); build sequences from **HARD CUTS**.
- If a scene keeps failing on one rule, promote that rule to the top of the
  DIRECTOR'S NOTES *and* restate it in Constraints — repetition is how these
  engines hold a rule.

---

## 10. The three looks

Full paste-ready `Style:` blocks live in `presets.md`. In brief:

| Look | Use it for | Signature |
|---|---|---|
| **A · Gouache feature** | real-time cinematic action (gunslinger, snowboarder) | matte hand-painted, **lineless**, flat color planes, clean economical rendering, no outlines |
| **B · Hand-drawn 2D IMAX (on twos)** | emotional drama, dialogue (blizzard) | **on twos @12fps**, oil-brush texture, line jitter & boil, handheld |
| **C · 2.5D painterly comic (on twos)** | stylized hero action (Ancient Champions) | Spider-Verse / Arcane / ink.industries, **bold inked linework**, on twos, smooth atmospherics over stepped figures |

Looks B and C step figures **on twos** while atmospheric motion (dust, smoke,
sparks) moves **smoothly** — that contrast is the point. Look A moves at real
cinematic speed.
