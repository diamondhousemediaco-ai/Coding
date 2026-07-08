# Not One Lost (NØL) — Brand Kit

Every asset from the master brand sheet, separated into individual, ready-to-use
files. Each logo and mark ships in **four forms**:

| Suffix | Format | Use it for |
| --- | --- | --- |
| `--white.svg` | Vector, bone `#F2EEE9` fill | Any size, print, web — scales infinitely. On dark backgrounds. |
| `--black.svg` | Vector, black `#000000` fill | Any size, print, web. On light backgrounds. |
| `--white.png` | Transparent PNG, bone fill | Quick drops onto dark backgrounds. |
| `--black.png` | Transparent PNG, black fill | Quick drops onto light backgrounds. |

All PNGs have transparent backgrounds and are trimmed tight with a small even margin.
**Prefer the SVGs** wherever the tool accepts them — they never pixelate.

## Logos

```
logos/
├── primary/
│   └── primary-wordmark          NOT ONE LOST®  (the main lockup)
├── icon/
│   ├── icon-mark                 The Ø mark (primary)
│   └── icon-mark-alt             The Ø mark (alternate weight)
├── secondary/
│   ├── secondary-nol             NØL®  (horizontal)
│   ├── secondary-nol-stacked     N / Ø / L  (vertical)
│   └── secondary-wordmark        NOT ONE LOST®  (compact inline)
└── submarks/
    ├── submark-notonelost-stacked   NOT / ONE / LOST®  (three-line block)
    ├── submark-nol                  NØL®
    ├── submark-icon                 Ø with ®
    └── submark-wordmark             NOT ONE LOST®  (smallest inline)
```

## Colors

`colors/palette.json` and `colors/palette.css` (CSS custom properties), plus a solid
swatch PNG for each.

| Name | Hex | |
| --- | --- | --- |
| Bone | `#F2EEE9` | primary light / "white" |
| Stone | `#BEBEBE` | mid grey |
| Charcoal | `#2B2B2B` | dark neutral |
| Black | `#000000` | primary dark |

## Patterns

`patterns/topographic-dark.png` — the topographic line texture (dark, as on the sheet).
`patterns/topographic-light.png` — inverted, for dark marks on light layouts.
`patterns/topographic-bone-transparent.png` — bone lines on a **transparent** background
(overlay on any dark color).
`patterns/topographic-black-transparent.png` — black lines on a **transparent** background
(overlay on any light color).

## Typography

`typography/specimen.png` — the type specimen from the sheet.

- **Primary** — *Wide Bold / Extended.* Now delivered as a real, installable custom font:
  **NOL Display** → `typography/font/` (OTF, TTF, WOFF2, WOFF + `@font-face` CSS). Built by
  tracing the primary specimen — it's yours, not a licensed third-party font. See
  `typography/font/README.md`.
- **Secondary** — *Condensed Regular.* A narrow grotesque for supporting copy. Not built as
  a font: the specimen is too small/thin to trace into readable body text — better to
  license or commission it (details in the font README).

## Transparency

Every **logo and mark** (`logos/**`) already has a fully transparent background — both the
`.png` cutouts and the `.svg` vectors. The color swatches are solid fills (transparency
N/A), the topographic pattern has transparent-overlay versions (above), and the `usage/`
files are photographs kept as-is.

## Source

`source/brand-sheet-original.png` — the original all-in-one brand sheet everything was
cut from.

---

*Brand: Not One Lost — "Bold purpose. Timeless message." Built on a mission of purpose,
value, and identity, for those who feel unseen.*
