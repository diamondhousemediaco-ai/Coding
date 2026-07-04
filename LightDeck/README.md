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
- **SD/Pro series** (SD650B ×2, SD300D) — Telink-based, control channel `2B10`; command
  protocol not yet captured. Staged in the app (link = inspect only). See `protocol/telink-650b.md`.
- **PR series** (PR150D, PR150R) — the candidates for the classic `4C5409` protocol the app
  already implements; test these first.

## Status
Two different GVM protocols — the fleet is split:
- **Classic GVM BLE (PR150, PR150R, 300D): solved & wired** — the verified `4C5409`
  protocol in `index.html`. These advertise as `BT_LED` and link directly in the app.
- **GVM Pro 650B (Key + Fill): Telink Mesh, NOT classic** — different chipset, different
  protocol. Does not speak `4C5409` and has no "APP mode". See `protocol/telink-650b.md`
  and `protocol/telink_mesh.py`. Blocked on two vendor values (mesh name/password +
  command opcodes) that must be extracted from the GVM app.
- **Godox LA600Bi + Viltrox K60: pending** — render in the UI but staged. The K60 uses
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
