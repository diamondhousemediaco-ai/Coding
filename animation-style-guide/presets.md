# Presets — paste-ready `Style:` blocks

Three house looks. Paste one at the top of a scene, then continue with
`PROMPT_TEMPLATE.md`. Verbatim from our finished films so they behave identically.

---

## Look A · Gouache feature (lineless, real-time)

> Used for: the gunslinger and snowboarder scenes. Real cinematic speed.

```
Style: 8K stylized animated feature film, hand-painted gouache animation — every
frame a matte painted image with CLEAN ECONOMICAL RENDERING: simplified shapes,
confident flat color planes, no over-detailing, painted like a production film
still, not a detailed illustration. Completely matte, zero specular highlights,
zero gloss, light diffusing like dry paint on paper, no 3D render gloss, no CGI
smoothness, no Pixar or DreamWorks face rendering.
```

Its always-on laws (fold into DIRECTOR'S NOTES / Constraints):
- **LINELESS PAINTING LAW** — no outlines, no contour lines, no lineart, no dark
  eye rims, no seam lines. Every edge is one flat paint color meeting another.
- **FACE RENDER LAW** — two-tone matte painted skin, soft shadow roll-off, eyes as
  simple bold painted shapes with single-dot catchlights, no gradient CG shading,
  no gloss, no detail beyond the reference sheet.
- **Atmosphere** — snow/dust bursts as chunky painted clumps obeying gravity,
  never volumetric simulation. No breath vapor, no smoke.
- Real cinematic speed; **no slow motion** unless a called-out in-camera ramp.

---

## Look B · Hand-drawn 2D IMAX, on twos (drama / dialogue)

> Used for: the blizzard mother-and-child drama. Pairs with voice + lip-sync.

```
Style: 8K IMAX, traditional hand-drawn 2D animation, animated on twos at 12 frames
per second — each drawing held for two frames then replaced, choppy stepped motion
cadence, visible pose-to-pose timing, distinct keyframe drawings with no smooth
in-between interpolation, hand-painted oil-brush texture on every drawing,
brushstrokes shifting and redrawn from frame to frame, line jitter and boil
between frames, no 3D render, no game engine, no CGI smoothness, no high-framerate
fluidity.
```

Its always-on laws:
- Everything is **animated on twos** — figures step pose-to-pose; only atmosphere
  may move smoothly.
- Handheld in human hands, anamorphic ~24mm, eye level or below, off-center.
- Lighting is often a single motivated source (moonlight) or, for dead-of-night,
  "flat dim diffuse ambient grey glow only, no direction."
- When anyone speaks, add the **VOICE ACTING DIRECTION** and **LIP SYNC
  REQUIREMENT** blocks (see STYLE_GUIDE §7).

---

## Look C · 2.5D painterly comic, on twos (stylized hero action)

> Used for: Ancient Champions. Spider-Verse / Arcane energy. Seedance format.

```
Style: 8K, 2.5D PAINTERLY COMIC ANIMATION in the Spider-Verse / Arcane /
ink.industries look, animated on twos at 12 frames per second — each drawing held
for two frames then replaced, choppy stepped motion cadence, hand-painted matte
oil-brush texture, brushstrokes shifting and redrawn from frame to frame, line
jitter and boil between frames, bold inked linework. NO smooth interpolation, NO
motion blur, NO morphing, NO liquid or melting surfaces — surfaces stay solid,
motion is the redrawing of strokes, not AI slop. No 3D render, no game engine, no
CGI smoothness, not glossy. Style from @[Image 1](image_1) — match its rendering,
texture, palette and mood exactly. Atmospheric motion (drifting dust, smoke,
sparks, kicked-up debris, heat-shimmer) moves SMOOTHLY; figures, robots and any
drawn debris step ON TWOS with secondary action.
```

Its always-on laws:
- **Bold inked linework** (unlike Look A's lineless rule).
- **Figures on twos, atmosphere smooth** — state this contrast explicitly.
- **REAL PHYSICS AND VISIBLE CAUSALITY** — every downed enemy has an on-screen
  cause; the hit lands before the reaction.
- Aggressive handheld, horizon never level, hard **dutch tilt** on the biggest
  impact. FORBIDDEN: centered/symmetric framing.
- Uses a **STYLE PLATE** as `@Image 1` — match its rendering/palette/mood exactly.

---

## Engine settings (Seedance / Kök Börü)

```
Seedance 2.0 · mode std · 1080p+ · bitrate high · genre action · audio on.
Generate several takes and cull.
```
