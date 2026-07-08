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

## Typography

`typography/specimen.png` — the type specimen from the sheet.

- **Primary** — *Wide Bold / Extended.* A wide, bold, extended grotesque. Used for the
  wordmark and headlines.
- **Secondary** — *Condensed Regular.* A narrow grotesque for supporting copy.

> The font files themselves are **not** included — the sheet only names the styles.
> See the repo history / notes for how to license or rebuild them into an installable font.

## Source

`source/brand-sheet-original.png` — the original all-in-one brand sheet everything was
cut from.

---

*Brand: Not One Lost — "Bold purpose. Timeless message." Built on a mission of purpose,
value, and identity, for those who feel unseen.*
