# LightDeck SIG-Mesh control (K60 · SD650 · Godox)

Three of the fleet's "won't connect" lights are **encrypted Bluetooth SIG Mesh**, confirmed by
decompiling the three vendor apps:

| Light | Vendor SDK (from decompile) | Underlying |
|---|---|---|
| Viltrox/Weeylite **K60** | Nordic nRF Mesh (`com.mesh.*`) | standard SIG mesh |
| GVM **PRO-SD650B** | Tuya SigMesh (`com.thingclips.sdk.sigmesh`) | standard SIG mesh |
| Godox **LA600Bi** | Telink mesh (`com.telink.ble.mesh`, std SIG models `SIG_MD_G_ONOFF_S`, `LightCtl/Hsl`) | standard SIG mesh |

All three are the *same* Bluetooth SIG Mesh standard underneath, so LightDeck implements **one**
mesh stack. Because the lights are already provisioned into the vendors' networks (whose keys live
only on the vendor's phone), LightDeck controls them by **re-provisioning**: you factory-reset a
light, LightDeck provisions it (becomes its owner, generating its own NetKey/AppKey/DevKey), then
drives it with the standard models. Re-provisioning resets each light's security to keys LightDeck
controls — which is why the same code works for the Nordic, Tuya, and Telink lights.

## What's implemented
`mesh.js` (injected into `index.html` at deploy time) contains:
- **crypto** — AES-CMAC, AES-CCM (built on WebCrypto AES-CBC), `s1/k1/k2/k3/k4`.
- **provisioning** — PB-GATT, algorithm `0x00` (P-256 ECDH / AES-CMAC / AES-CCM), **No-OOB**.
- **messaging** — access → upper transport (AppKey/DevKey) → lower transport (unsegmented + segmented)
  → network (encrypt + obfuscate) → proxy GATT bearer with SAR.
- **models** — Generic OnOff, Light Lightness, Light CTL (brightness + CCT), Light HSL (colour),
  plus Config `AppKey Add` + `Model App Bind`.

GATT targets (standard, confirmed in the K60 app): provisioning `0x1827` (in `0x2ADB` / out `0x2ADC`),
proxy `0x1828` (in `0x2ADD` / out `0x2ADE`).

## Why we trust it before touching hardware
Everything runs as Node tests in `mesh-tests/` and must pass before deploy:

```
cd LightDeck/protocol/mesh-tests
node mesh-crypto.js   # AES-CMAC vs RFC 4493 · AES-CCM vs RFC 3610 · s1/k1/k2/k3/k4 vs Mesh Profile §8
node mesh-net.js      # network offsets/nonce/MIC vs Nordic nRF5-SDK-for-Mesh · full roundtrip · segmentation
node mesh-prov.js     # full two-party provisioning: both sides derive the SAME DevKey
node verify_bundle.js # the browser mesh.js re-verified against the same vectors
```

Independent anchors that make this trustworthy:
- **AES-CMAC** matches RFC 4493 test vectors exactly.
- **AES-CCM** matches RFC 3610 packet vector #1 exactly.
- **k2** yields NID `0x68` and **k4** yields AID `0x26` — the published Mesh Profile §8 sample values.
- **Network layer** byte offsets, nonce, and MIC length match Nordic's own `ut_net_packet.c` expectations
  (`p_m=&pdu[7]`, `m_len=2+payload`, `mic_len=ctl?8:4`, obfuscation `pecb[5..8]=iv_index`).
- **Provisioning** — a simulated device runs the other half of the handshake; both independently derive
  an identical DevKey, and the encrypted provisioning data decrypts correctly.

## Monday test plan (one K60)
1. Open the **/deck/** URL in Bluefy (loads the injected mesh module).
2. **Factory-reset the K60** so it advertises as unprovisioned (Mesh Provisioning Service `0x1827`).
   (Vendor apps: remove/forget the light, or hold its reset per the manual, until it re-advertises.)
3. On the **K60 · Tube** card tap **Provision** → pick the light. Watch the console:
   Invite → Capabilities → PublicKey → Confirmation → Random → Provisioning Data → **Complete ✓**.
   On success LightDeck stores its DevKey + unicast (`0x0005`) locally.
4. Tap **Connect** — the light reboots as a proxy node (`0x1828`); pick it again.
5. Tap **Configure** once — sends `AppKey Add` + binds the app key to OnOff/Lightness/CTL/HSL.
6. Now the card's power toggle, brightness, CCT, and hue sliders drive the light live over mesh.

### If a step fails
The console logs every provisioning PDU and every mesh TX. Likely first-try snags and fixes:
- **Provision picker empty** — the light isn't in unprovisioned mode; factory-reset again.
- **Stalls after PublicKey** — MTU/segmentation on the device's Data Out; the bearer reassembles by SAR,
  but if the K60 fragments oddly we adjust `sarSegments` chunk size. Capture the console.
- **Complete ✓ but no response to sliders** — `Configure` didn't bind; re-run it. If still silent, the K60
  may host CTL/HSL on a secondary element (not the primary unicast) — we'll read Composition Data and
  bind at the right element address. Capture the console either way.

## Notes / limits
- The **Godox** uses a Telink **vendor model** for some effects; standard OnOff + Lightness should work,
  CCT/colour via the vendor opcodes is the next step (needs the Godox app's vendor opcode map).
- IV Index starts at 0; sequence numbers persist in `localStorage` and increment per message.
- One LightDeck mesh network (NetKey+AppKey) is generated once and reused for every light you provision.
