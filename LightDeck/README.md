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
2× GVM Pro 650B, GVM 300D, GVM PR150, GVM PR150R, Godox LITEMONS LA600Bi, 2× Viltrox/Weeylite K60.

## Status
- **GVM protocol: solved & wired** — on/off, brightness, color temp, hue, saturation, scenes.
- **Godox + K60: pending** — render in the UI but staged until their BLE protocols are sniffed.
- **Open TODO:** fill the BLE service/characteristic UUIDs in `index.html` (BLE.SERVICE / BLE.WRITE)
  after running `scan_lights.py` against the real lights.

## GVM protocol (reference)
Frame: `4C5409 | DevID(00) | DevType(30) | 5700 | CMD | 01 | PARAM | CRC16-XMODEM(2B)`
CRC computed over the preceding bytes, not byte-swapped.
Commands: `00` on/off, `02` brightness(0-100), `03` temp(K/100), `04` hue(deg/5), `05` sat(0-100),
`06` mode(1 CCT / 2 HSI / 3 scenes), `07` scene(1-8).

## Redeploy
Hosting is on Vercel via Git integration: the repo-root `vercel.json` copies `LightDeck/index.html`
into `out/` and serves only that. Merging to the default branch auto-deploys production —
no manual upload step.

Legacy Netlify site (manual drag-and-drop deploys, may be stale): lightdeck-control.netlify.app
(siteId 176250f8-3c9d-4a95-8e60-e12ea5d4d6c5).
