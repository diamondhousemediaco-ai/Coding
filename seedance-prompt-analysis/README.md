# Seedance Prompt Breakdown — "INK.INDUSTRIES_" JDM Car Edit

Reverse-engineered prompt package for recreating the analyzed 40-second stylized
JDM car edit in **Seedance 1.0** (ByteDance text-to-video / image-to-video).

- **Source:** 39.9s clip · 720×406 (16:9 landscape) · 24 fps · watermark `@INK.INDUSTRIES_`
- **Format:** cinematic montage — ~11 micro-shots (3–5s each) + 6s branded outro
- **Method:** Seedance prompt formula = `Subject + Subject description + Scene + Motion + Camera language + Lighting/Atmosphere + Style`, with a locked **Style Anchor** + **Character Anchor** re-used on every shot for consistency.

---

## 1. What the video is (visual DNA)

| Element | Description |
|---|---|
| **Rendering style** | 3D stylized / cel-shaded animation — a *Spider-Verse × Arcane × Pixar* hybrid. Clean thick linework, hand-painted "ink-wash" textures, painterly shadows, cinematic depth of field. **Not photoreal.** |
| **Genre / vibe** | JDM (Japanese Domestic Market) street-racing culture, Initial D / Need-for-Speed energy, moody and cinematic. |
| **Hero car** | White 1990s **Honda Integra (DC2 hatchback)**, aggressive widebody stance, deep-dish silver wheels, chrome exhaust tip, **red LED underglow**. Livery is black **sumi-e ink-brush "tiger-stripe" splashes** with hand-painted racing numbers (**"46"** / **"4"**). |
| **Driver character** | Stylized young man: warm tan skin, **curly copper-blonde hair** with a loose curl on the forehead, light stubble, **thick square black-framed glasses**, confident half-lidded expression, **full black-ink sleeve tattoos** on both forearms, beaded/patterned bracelet, all-black outfit. |
| **World / setting** | Dusk-to-night city; wet asphalt with neon reflections, teal storefront signs, brownstone streets, sunset highways and elevated interchanges. |
| **Color grade** | Teal-and-orange cinematic grade; warm interior/skin vs. cool blue city; **red** as the signature accent (underglow, tail-lights, drift smoke). |
| **Texture / finish** | Volumetric haze, tire smoke, subtle film grain, light chromatic aberration, 24 fps motion blur, shallow focus. |
| **Audio (reference)** | Engine/rev SFX + tire screech over a lo-fi / phonk / hard-bass track (typical for this edit style). |

---

## 2. The Style Anchor  (paste into EVERY shot)

> **`[STYLE]`** — Stylized 3D cel-shaded animation in the look of a modern animated feature film (Spider-Verse / Arcane / Pixar hybrid), thick clean linework, hand-painted ink-wash textures, cinematic JDM anime street-racing aesthetic. Moody teal-and-orange color grade, red neon accents, volumetric haze, shallow depth of field, subtle film grain and chromatic aberration, 24fps cinematic motion blur. Highly detailed, dramatic lighting.

## 3. The Character Anchor  (paste into any shot with the driver)

> **`[DRIVER]`** — a stylized animated young man, warm tan skin, curly copper-blonde hair with a loose curl on the forehead, light stubble, thick square black-framed glasses, calm confident half-lidded expression, full black-ink sleeve tattoos on both forearms, beaded bracelet, dressed in black.

## 4. The Car Anchor  (paste into any shot with the car)

> **`[CAR]`** — a white 1990s Honda Integra DC2 hatchback, aggressive widebody stance, deep-dish silver wheels, chrome exhaust tip, red LED underglow, black sumi-e ink-brush "tiger-stripe" livery with a hand-painted racing number.

## 5. Negative prompt  (global)

```
photorealistic, live-action, realistic skin pores, low quality, blurry,
deformed hands, extra fingers, mutated limbs, warped/melting wheels,
wrong car proportions, distorted face, on-screen text, captions, watermark,
logo, flickering, oversaturated, jpeg artifacts, harsh lens flare
```

## 6. Recommended Seedance settings

| Setting | Value | Why |
|---|---|---|
| Model | **Seedance 1.0 Pro** | best motion + multi-shot coherence |
| Aspect ratio | **16:9** | source is landscape (use 9:16 if you want a Reel-native re-cut) |
| Resolution | **1080p** (or 720p to save credits) | detail on livery + reflections |
| Duration | **5s** per shot (10s for the highway/aerial hero) | matches the cut rhythm |
| Motion strength | **medium–high** | drift/smoke needs energy; keep character shots lower |
| Consistency | **Image-to-Video** with a fixed reference frame, + reuse the same **seed** | locks the car + character look shot-to-shot |
| FPS / grade | 24 fps look; apply teal-orange LUT + grain in post | recreates the cinematic finish |

> **Consistency workflow:** generate ONE hero still of the car and ONE of the driver first (in Seedance's text-to-image or any image model using the anchors above). Then drive each shot with **image-to-video** from those stills. This is what keeps the Integra's livery and the driver's face identical across all 11 cuts — pure text-to-video will drift.

---

## 7. Shot-by-shot prompts

Each prompt = camera + subject + action + scene + lighting, then append `[STYLE]`
(and `[DRIVER]` / `[CAR]` where relevant). Times are approximate from the source.

### Shot 1 — Hero arrival (0.0–1.5s)
> Low-angle ground-level shot, slow push-in. `[DRIVER]`'s legs and sneakers walk toward `[CAR]` parked on a wet city street at night, glossy asphalt mirroring red and teal neon signs, puddle reflections rippling. Cinematic, atmospheric. `[STYLE]`
- **Camera:** low dolly / push-in · **Motion:** low

### Shot 2 — Door-handle macro (1.5–3.0s)
> Extreme close-up, static with slight rack focus. A tattooed hand with a beaded bracelet grips the chrome door handle of `[CAR]`, black ink-brush livery filling the frame, thumb pressing the button. Shallow depth of field. `[STYLE]`
- **Camera:** macro / locked · **Motion:** low

### Shot 3 — Interior reveal (3.0–5.0s)
> Medium interior shot from the passenger side, slow drift. `[DRIVER]` sits in the driver's seat of the car, one tattooed hand resting on the wheel, glancing ahead, blurred city street and warm streetlights through the side window. Warm key light on the face, cool ambient fill. `[STYLE]`
- **Camera:** slow lateral drift · **Motion:** low

### Shot 4 — Tachometer close-up (5.0–6.5s)
> Tight close-up on a JDM analog gauge cluster, the tachometer needle sweeping fast across the redline, RPM numbers glowing, soft red backlight, faint reflections on the glass. `[STYLE]`
- **Camera:** locked, subtle vibration · **Motion:** medium

### Shot 5 — Street tracking (6.5–10.0s)
> Tracking shot following alongside, moving with the car. `[CAR]` drives through a busy urban intersection, crossing a crosswalk past a yellow taxi, buildings sliding by, motion blur on the background. Dusk light, long shadows. `[STYLE]`
- **Camera:** side tracking / follow · **Motion:** high

### Shot 6 — Rear-view mirror eyes (10.0–13.0s)
> Close-up of a rear-view mirror. Reflected in it are the eyes of `[DRIVER]` — thick black glasses, curly copper hair, calm focused stare — with a blurred dusk brownstone street receding behind. Warm reflected glow. `[STYLE]`
- **Camera:** locked on mirror · **Motion:** low

### Shot 7 — Burnout / overhead (13.0–17.0s)
> Low three-quarter rear shot, then the car spins its rear wheel in a smoky burnout: thick tire smoke, orange sparks, glowing red underglow spilling onto wet asphalt, a teal neon storefront sign behind. `[CAR]`, chrome exhaust venting. Dramatic night lighting. `[STYLE]`
- **Camera:** low static → slight orbit · **Motion:** high

### Shot 8 — Sunset hero + foggy POV (17.0–20.0s)
> Front three-quarter hero shot of `[CAR]` emerging through drifting smoke, red underglow, warm sunset city skyline behind; then cut to a driver-POV down a hazy street with red tail-lights glowing ahead in the fog. `[STYLE]`
- **Camera:** slow push-in → POV · **Motion:** medium

### Shot 9 — Pedal + shifter detail (20.0–23.0s)
> Interior detail shots: a red sneaker pressing the metal accelerator pedal; then a tattooed hand with a patterned bracelet gripping the manual gear shifter, center console gauges glowing. Shallow focus, warm cabin light. `[STYLE]`  *(driver's limbs only)*
- **Camera:** macro / locked · **Motion:** low–medium

### Shot 10 — Highway drift at dusk (23.0–29.0s)
> Follow/tracking shot on an elevated highway toward a glowing city skyline at sunset, a dark sports car ahead; the car drifts, throwing **pink-red tire smoke**; then driver-POV over the wheel (red gauges glowing) speeding under an overpass into sun flare. `[CAR]`. Golden-hour rim light, motion blur. `[STYLE]`
- **Camera:** tracking → POV · **Motion:** high · **Duration:** 10s

### Shot 11 — Aerial spiral interchange (29.0–34.0s)
> High aerial / drone shot looking down on a spiral highway interchange at night, city lights around it; `[CAR]` drifts around the loop leaving a glowing **red light-trail and smoke**; then a low tracking shot of the car speeding along a lit highway toward the city at dusk, red underglow reflecting on the road. `[STYLE]`
- **Camera:** top-down aerial → low tracking · **Motion:** high · **Duration:** 10s

### Outro — Brand card (34.0–39.9s)
> Not generated in Seedance — composite in post: fade to near-black, animated glowing Instagram glyph, handle `@INK.INDUSTRIES_` fading up. (Add in CapCut / After Effects.)

---

## 8. One-shot "master prompt" (if you only generate a single hero clip)

> Cinematic tracking shot of a white 1990s Honda Integra DC2 widebody with black ink-brush tiger-stripe livery, deep-dish silver wheels and red LED underglow, drifting through a neon-lit city street at dusk, throwing thick red tire smoke, wet asphalt reflecting teal and red neon, a stylized tattooed young driver with curly copper hair and black glasses at the wheel. Stylized 3D cel-shaded animation (Spider-Verse / Arcane / Pixar hybrid), thick linework, hand-painted ink textures, teal-and-orange grade, volumetric haze, shallow depth of field, film grain, 24fps cinematic motion blur, dramatic lighting.
>
> **Negative:** *(use §5)* · **16:9 · 1080p · 10s · medium-high motion**

---

## 9. Tips to match the original exactly

1. **Build the car + driver stills first**, then use **image-to-video** — text-to-video alone will not hold the livery number or the face across 11 shots.
2. **Reuse one seed** per subject so lighting/design stays stable between cuts.
3. Keep character shots at **low motion**, action/drift shots at **high motion**.
4. **Red is the signature accent** — force it into underglow, tail-lights and drift smoke every time.
5. Do the **grade + grain + chromatic aberration + Instagram outro in post** (CapCut / Premiere / After Effects); Seedance gives you the clean render, post gives you the "edit" feel.
6. Cut on the beat (~1.5–3s per shot) and layer engine-rev / tire-screech SFX under a phonk track.

---

*Generated as a reverse-engineering reference. The rendering style, car, and
character described here are an interpretation of the analyzed reference clip
(`@INK.INDUSTRIES_`) for the purpose of recreating a similar look in Seedance.*
