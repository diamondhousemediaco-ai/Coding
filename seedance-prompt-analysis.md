# Seedance Prompt Reverse-Engineering

**Source clip:** stylized JDM drift film, ~40s, 720×406 (16:9), 24 fps, watermarked `@INK.INDUSTRIES_`
**Subject:** a white Honda Integra with black "ink-splatter" livery drifting through a dusk/night New York
**Nature:** this is **not one generation** — it is a ~12-shot edited sequence. To recreate it you generate each shot separately (Seedance clips are ~5–10s) and cut them together, with music added in post.

> Note on the skill: there is no "seedance" skill installed in this environment, so this breakdown is built from a frame-by-frame analysis of the clip plus Seedance's own prompt structure (Subject → Scene → Action → Camera → Light → Mood → Style). A ready-to-run Higgsfield/Seedance MCP pipeline is available if you want to actually generate from these prompts.

---

## 1. Style DNA (the part that makes it look like *this*)

The single most important thing to carry across every shot:

- **Render style:** stylized 3D CG animation with a painterly / illustrative finish — think **Sony Pictures Animation (Spider-Verse) × Pixar character design × Forza Horizon environments**. Not photoreal. Characters are cartoon-proportioned; cars and interiors are semi-realistic with hand-painted texturing.
- **Signature art direction — "ink":** the car's graphics are **sumi-e / calligraphy brush-stroke black ink splatters** running down the panels, plus a hand-painted number **"46"**. The driver is a heavily **blackwork-tattooed** character. Ink is the brand motif — keep it in every car and character shot.
- **Color grade:** teal/blue shadows, warm amber & sunset-orange highlights, aggressive **red neon** accents (underglow, tail lights, smoke lit red). High contrast, cinematic.
- **Lighting:** volumetric — glowing tire smoke, rim light on wet surfaces, neon spill, golden-hour sky.
- **Surfaces:** wet, reflective asphalt; polished deep-dish wheels; chrome exhaust.
- **Camera language:** anamorphic-widescreen framing, shallow depth of field, motion blur, dramatic low angles and drone aerials.
- **World:** dusk-to-night New York — Brooklyn Bridge, Manhattan skyline, elevated subway tracks, brownstones, teal neon signs, yellow cabs.

---

## 2. Component breakdown

| Component | Extracted from the clip |
|---|---|
| **Subject (car)** | White Honda Integra (DC-series), stanced on polished deep-dish wheels, black sumi-e ink-splatter livery, hand-painted "46", red underglow, single chrome exhaust tip |
| **Subject (driver)** | Stylized animated man: tall dark-blond quiff, thick black square glasses, heavy blackwork tattoos on both arms/wrists, silver rings + bracelet, dark clothes, oxblood loafers |
| **Scene / setting** | Dusk→night New York — Brooklyn Bridge, Manhattan skyline at golden hour, elevated train tracks, brownstones, teal neon storefronts, yellow taxis, wet streets |
| **Action** | Approaching & entering car → ignition → POV drive → burnout → launch → drifting → aerial highway drift with red smoke trail → sunset pull-away |
| **Camera** | Foot-level tracking, interior POV, rear-view-mirror reveal, low-angle wheel macro, pedal cam, third-person chase/hood cam, top-down drone orbit |
| **Lighting & mood** | Cinematic, moody, energetic; volumetric red-lit tire smoke, neon spill, golden-hour rim light, high contrast teal/orange grade |
| **Style** | Stylized 3D animated feature-film look, painterly textures, motion blur, shallow DOF, 16:9 anamorphic |

---

## 3. Shot-by-shot timeline

| # | ~Time | Shot |
|---|---|---|
| 1 | 0–3s | Low foot-level tracking: driver walks to the car; ringed hand on the door handle |
| 2 | 4–6s | Interior — tattooed hand grips wheel, turns the ignition |
| 3 | 7–9s | Driver at the wheel, tattooed forearms; exterior rolling shot of rear + skyline |
| 4 | 10–12s | POV over the Honda gauge cluster (red backlight, needle sweep); **rear-view mirror reveals the driver's glasses/eyes** |
| 5 | 13–14s | Front of car, headlights on, ink livery, rolling down a neon street |
| 6 | 15–18s | **Hero burnout** — low side angle on the rear wheel spinning, red-lit smoke, teal neon sign behind |
| 7 | 18–20s | Pedal-cam foot flooring it; wheel spins up |
| 8 | 21–24s | Rear tracking as the car launches away, red underglow trailing |
| 9 | 25–29s | Drift near the Brooklyn Bridge at dusk; hood-cam chase past another car |
| 10 | 30–34s | **Drone top-down** — white car drifting the curl of an elevated interchange, leaving a red-lit smoke trail |
| 11 | 33s | Macro of the spinning wheel |
| 12 | 35–39s | Highway pull toward the sunset skyline; outro card |

---

## 4. Master Seedance prompt (the hero burnout shot)

Use this as your template — it contains every style token you need. Swap the action/camera lines for other shots.

```
Stylized 3D animated film still, Spider-Verse-meets-Pixar look with painterly
illustrative textures. A white Honda Integra with glossy black sumi-e ink-splatter
graphics down the doors and a hand-painted number "46", stanced low on polished
deep-dish wheels with glowing red neon underglow and a chrome exhaust tip.

Action: the car does a stationary burnout, rear tire spinning violently and
throwing up thick volumetric smoke lit red from the underglow.

Camera: low side angle close on the rear wheel, shallow depth of field, subtle
motion blur, slow push-in.

Setting: wet reflective New York street at night, teal neon storefront sign glowing
in the background, brownstone buildings.

Lighting: moody cinematic, red neon rim light, high-contrast teal shadows and warm
highlights, smoke catching the light.

Style: stylized 3D CG animation, cinematic anamorphic 16:9, film-grade color, energetic.
```

---

## 5. Full shot-by-shot prompts (to rebuild the sequence)

Each is a standalone Seedance clip. Keep the **Style DNA** line consistent across all of them.

**Shot 1 — Walk-up / door handle**
```
Stylized 3D animated film (Spider-Verse × Pixar, painterly textures). Low foot-level
tracking shot following an animated man's oxblood loafers as he walks across wet
reflective asphalt toward a white Honda Integra with black ink-splatter livery and
red underglow. His tattooed, ring-covered hand reaches for the door handle. Dusk NYC
street, teal neon, shallow depth of field, motion blur, cinematic 16:9.
```

**Shot 2 — Ignition**
```
Stylized 3D animated film, painterly. Interior close-up: a heavily blackwork-tattooed
hand with silver rings grips a Honda steering wheel and turns the ignition key. Warm
dashboard glow, dusk light through the windshield, shallow DOF, moody cinematic grade, 16:9.
```

**Shot 3 — Driver at the wheel**
```
Stylized 3D animated film. A tattooed animated man with a dark-blond quiff and thick
black square glasses drives, forearms covered in blackwork tattoos on the wheel. Handheld
interior feel, city lights streaking past the windows at dusk, teal-and-orange grade, 16:9.
```

**Shot 4 — Gauge POV + mirror reveal**
```
Stylized 3D animated film. POV over a red-backlit Honda gauge cluster, tach needle
sweeping toward redline; rack focus up to the rear-view mirror revealing the driver's
glasses and eyes, brownstones blurred behind. Volumetric dusk light, shallow DOF,
cinematic 16:9.
```

**Shot 5 — Rolling front / headlights**
```
Stylized 3D animated film. Front three-quarter rolling shot of the white Integra,
headlights on, black ink-splatter graphics and "46" on the body, cruising a neon-lit
NYC street at night. Wet road reflections, red underglow, motion blur, cinematic 16:9.
```

**Shot 6 — Hero burnout** — use the Master prompt above.

**Shot 7 — Pedal cam**
```
Stylized 3D animated film. Close interior shot of an oxblood loafer stomping the
accelerator pedal to the floor; foot-well in shadow, warm rim light. Fast, punchy,
shallow DOF, cinematic 16:9.
```

**Shot 8 — Launch / rear tracking**
```
Stylized 3D animated film. Rear tracking shot as the white ink-liveried Integra
launches away down a wet NYC avenue, red neon underglow trailing, tire smoke, streetlights
streaking. Motion blur, teal-orange grade, cinematic 16:9.
```

**Shot 9 — Bridge drift / chase**
```
Stylized 3D animated film. Hood-cam / third-person chase of the white Integra drifting
on an elevated road with the Brooklyn Bridge and Manhattan skyline glowing at golden-hour
dusk. Another car nearby, tire smoke, dynamic camera, shallow DOF, cinematic 16:9.
```

**Shot 10 — Drone aerial drift**
```
Stylized 3D animated film, painterly. Top-down drone shot of the white Integra drifting
around the sweeping curl of an elevated highway interchange at night, leaving a long
red-lit smoke trail along the curve. Glowing city grid below, tiny streetlights, cinematic
16:9, slow orbiting descent.
```

**Shot 11 — Wheel macro**
```
Stylized 3D animated film. Extreme close-up of a polished deep-dish wheel spinning,
red brake/underglow light and smoke, ink-splatter bodywork above. Heavy motion blur,
shallow DOF, cinematic 16:9.
```

**Shot 12 — Sunset pull-away (outro)**
```
Stylized 3D animated film. Low rear three-quarter shot of the white Integra cruising a
highway toward a glowing orange sunset Manhattan skyline, red underglow reflecting on the
road. Warm golden-hour grade, lens flare, cinematic 16:9, slow.
```

---

## 6. Negative prompt & settings

**Negative prompt**
```
photorealistic, live-action, low quality, blurry, distorted car body, warped wheels,
extra wheels, text artifacts, watermark, deformed hands, extra fingers, flat lighting,
washed-out colors, jitter, warping background
```

**Recommended settings**
- **Aspect ratio:** 16:9 (source is 720×406 ≈ 16:9). Use 9:16 if you want a vertical Reels cut.
- **Duration:** 5–10s per shot; edit ~10–12 shots together for the full ~40s piece.
- **Mode:** image-to-video gives the most control — render a still of the car in this exact style first, then animate it, so the livery and character stay consistent shot to shot.
- **Consistency tip:** lock the car design and character in a reference image and reuse it; Seedance holds style far better from an image than from text alone.
- **Audio:** Seedance doesn't generate the music — add the track in post.

---

*Reverse-engineered from a frame-by-frame analysis of the reference clip. The `@INK.INDUSTRIES_` watermark indicates the original creator; this document analyzes technique only.*
