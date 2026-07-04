# LightDeck — on-set lighting control

A single-page web app to control GVM + Godox + Viltrox lights over Bluetooth from one screen,
replacing the need to bounce between vendor apps on set.

**Live:** https://lightdeck-control.netlify.app
On iPhone/iPad, open that URL in the **Bluefy** browser (free, App Store) — it provides the
Web Bluetooth API that Safari blocks. No Mac, Xcode, or Apple Developer account needed.

## Files
- `index.html` — the app. Frosted-glass dark UI, Grid + Console views, wired to the verified
  GVM Bluetooth protocol. Self-contained (no build step).
- `protocol/gvm_proto.py` — GVM command encoder in Python (CRC16-XMODEM verified byte-for-byte
  against the real app's packets). Run it to print/verify command frames.
- `protocol/scan_lights.py` — BLE scanner (Python + bleak). Run with lights on + vendor apps
  closed to map each fixture's address and writable GATT characteristic.
- `protocol/gvm-reference/` — decompiled GVM app source + spec the protocol was reconstructed from.
- `mockup*.html`, `*.png` — design exploration / comps.

## Fleet
2× GVM PRO-SD650B, GVM SD300D, GVM PR150D, GVM PR150R.
Split across two protocol families:
- **PR series** (PR150D, PR150R) — classic `4C5409` protocol, work directly.
- **SD/Pro series** (SD300D, SD650B ×2) — same `4C5409` command set over characteristic
  `2B10`, but the device type is learned via a handshake and each command needs a CRLF.

## Status — all GVM lights controllable
Both light families use the same command frame; they differ only in delivery:
- **PR series (PR150D, PR150R): working** — classic `4C5409` over their writable char,
  hardcoded devType `0x30`. Advertise as `BT_LED`.
- **SD series (SD300D, SD650B): working** — decompiled from GVM LED v1.8.0
  (`com.gvm.cloudphone`). On connect the light reports its **devType** (byte 4) and
  **devID** (byte 3) in a `0x53` reply to the discovery query `4C5409000053000001009474`;
  commands then use that type (e.g. SD300D = **`0x21`**, not `0x30`) and append a **CRLF
  (`0D 0A`)**, written to characteristic `2B10` with notifications enabled. See
  `protocol/gvm-sd-protocol.md`.
- **Godox LA600Bi + Viltrox K60: pending** — not in the current fleet list. The K60 uses
  connectionless WeeylitePro broadcasts (channel/group), which a browser can't do.

## GVM protocol (reference)
Frame: `4C5409 | DevID(00) | DevType(30) | 5700 | CMD | 01 | PARAM | CRC16-XMODEM(2B)`
CRC computed over the preceding bytes, not byte-swapped.
Commands: `00` on/off, `02` brightness(0-100), `03` temp(K/100), `04` hue(deg/5), `05` sat(0-100),
`06` mode(1 CCT / 2 HSI / 3 scenes), `07` scene(1-8).
Applies to the **classic** lights only — the 650B Pro uses Telink Mesh (see above).

## Redeploy
Hosting is on Vercel via Git integration: the repo-root `vercel.json` copies `LightDeck/index.html`
into `out/` and serves only that. Merging to the default branch auto-deploys production —
no manual upload step.

Legacy Netlify site (manual drag-and-drop deploys, may be stale): lightdeck-control.netlify.app
(siteId 176250f8-3c9d-4a95-8e60-e12ea5d4d6c5).
