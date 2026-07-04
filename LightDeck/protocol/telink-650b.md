# GVM SD/Pro series (SD300D, PRO-SD650B, …) — control notes

## Live findings (2026-07, from the real fixtures)
The whole fleet appears to be the **SD/Pro Telink line**, NOT the classic lights the
app's `4C5409` protocol was built for. Confirmed against a real **GVM SD300D**:

- Advertises as **`BT_LED`** (so it hides among the classic lights in a scan).
- GATT map: service `180A` (Device Info) + vendor service
  `00010203-0405-0607-0809-0A0B0C0D1910` with a single control characteristic
  **`00010203-0405-0607-0809-0A0B0C0D2B10`** `[writeWithoutResponse, read, notify]`.
- **The classic `4C5409` frames do NOT drive it** — connected + wrote brightness, light
  did not respond. The SD series speaks a different (Telink-based) command language on
  `2B10` that is not publicly documented.
- **Next step: capture the GVM app driving an SD light and read the bytes it writes to
  `2B10`** (see "Capturing the SD command format" below). That unlocks the whole fleet.

The SD650B additionally exposes the full Telink-mesh characteristics (`…1911/1912/1914`);
the notes below on the mesh handshake still apply to it.

## Capturing the SD command format (the unblock)
Do this off-set — it's a 30–60 min sit-down, not a quick fix.
1. **Android phone** (cleanest): Settings → Developer Options → enable
   **Bluetooth HCI snoop log** (set to "Enabled"/"Filtered"). Reboot if prompted.
2. Install the GVM app on that phone, connect to the **SD300D**.
3. Make single, known moves: brightness **0 → 100**, then **100 → 0**; then color
   temp to its min, then max. Note each move.
4. `adb bugreport` (or pull `/data/misc/bluetooth/logs/btsnoop_hci.log`) and open the
   `btsnoop` file in **Wireshark**.
5. Filter to `btatt` writes to handle/characteristic `2B10`. The bytes in each write are
   the command; brightness moves reveal the brightness opcode+scale, CCT moves the CCT one.
6. Send me those write payloads (hex) with which slider move produced each — I decode the
   format and wire it into the app for every SD fixture.

iOS-only alternative (needs a Mac): install Apple's **Bluetooth** logging profile on the
iPad (developer.apple.com → Profiles and Logs), reproduce with the GVM app, then capture
with **PacketLogger** (Additional Tools for Xcode) on the Mac. Messier than Android; use
the Android route if you have any Android device.

---

## (Reference) Telink Mesh handshake — applies to the SD650B's `…1911/1912/1914`
The 650B Pro also exposes full **Telink Mesh**, the scheme reverse-engineered by
[python-dimond](https://github.com/google/python-dimond) and
[telinkpp](https://github.com/vpaeder/telinkpp). GVM's spec lists three control paths:
**APP (Bluetooth mesh), wired DMX-512 (8/16-bit, RDM), and mesh grouping.**

## How Telink Mesh control works
1. Connect over normal GATT. Characteristics:
   - `…1911` NOTIFY (status), `…1912` CONTROL (commands), `…1914` PAIRING (auth).
2. Handshake: `session_key = AES(name⊕password, local_random ‖ device_random)`.
3. Each command is a 20-byte packet, AES-encrypted with the session key (nonce built
   from the light's MAC + a sequence counter), written to the CONTROL characteristic.

`telink_mesh.py` in this folder implements all of that. `scan_lights.py` now flags a
fixture as `TELINK MESH` when it exposes the `…1911/1912/1914` characteristics.

## The two values we still need (both live in the GVM app)
Everything above is generic Telink. Two vendor-specific values must be confirmed
against your actual light, and neither is in any public doc — they come from GVM's app.

### 1. Mesh name + password  → fills `MESH_NAME` / `MESH_PASS`
GVM set these when the light was provisioned to your account. To extract:
- Install **JADX** and open the GVM Android APK (pull it with `adb` or from APKPure).
- Search the decompiled source for `telink`, `MeshName`, `setMeshName`, `pair`, or
  the strings `telink_mesh1` / `123` (the factory defaults GVM likely overrode).
- Or, faster: run the app under a debugger (Android Studio) and break on the Telink
  SDK `login(...)` / `setMeshInfo(...)` call to read the live name/password.
  telinkpp's README has a step-by-step for exactly this.

### 2. Command opcodes  → fills `OP_LUM` / `OP_CCT` (+ any scene/RGB ops)
Confirm which opcode byte drives brightness vs colour temperature:
- On the Android phone, enable **Developer Options → Bluetooth HCI snoop log**.
- Open the GVM app, connect to the 650B, and move brightness, then CCT, a known amount.
- Pull `btsnoop_hci.log` (`adb pull`) and open it in **Wireshark**.
- Find the writes to characteristic `…1912`; the 8th byte (index 7) of each decrypted
  packet is the opcode, byte 10+ the parameter. Map brightness-slider moves → `OP_LUM`,
  CCT moves → `OP_CCT`. (Wireshark shows the ciphertext; decrypt with the session key
  from step 1 using `telink_mesh.py`'s routines, or infer opcodes from which byte tracks
  the slider once decrypted.)

## Bring-up sequence (on set, laptop near the lights)
1. Close the GVM app completely (it holds the BLE link otherwise).
2. `pip install bleak pycryptodome`
3. `python scan_lights.py` → confirm the 650B shows `TELINK MESH` and note its MAC.
4. Try the factory defaults first — sometimes vendors don't change them:
   `python telink_mesh.py <MAC> on`
   - If it prints `paired` and the light responds: we're in; tune opcodes.
   - If it prints `pairing rejected`: the name/password differ — do extraction step 1,
     then `python telink_mesh.py <MAC> --name <mesh> --pass <pw> on`.
5. Once brightness + CCT work in Python, the same logic ports to the web app
   (browser AES via SubtleCrypto: AES-CBC with a zero IV over one block == Telink's ECB).

## Fallback if Bluetooth mesh proves account-locked
The 650B also has **wired DMX-512 in** (GVM sells a control cable). A cheap USB-DMX
interface would drive both 650Bs deterministically with no reverse engineering — worth
keeping as a backup for a paid shoot where Bluetooth uncertainty isn't acceptable.
