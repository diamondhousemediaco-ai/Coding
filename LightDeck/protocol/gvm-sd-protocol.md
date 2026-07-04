# GVM SD-series BLE protocol (SD300D, PRO-SD650B)

Reverse-engineered by decompiling **GVM LED v1.8.0** (`com.gvm.cloudphone`) with
androguard/JADX. Confirmed live against a real **GVM SD300D** (2026-07): it reports
device type `0x21` and responds to on/off, brightness, CCT.

## Transport
- Advertises as `BT_LED`. GATT: vendor service `00010203-0405-0607-0809-0A0B0C0D1910`,
  control characteristic **`00010203-0405-0607-0809-0A0B0C0D2B10`** `[read, writeWithoutResponse, notify]`.
- The app enables notifications on `2B10`, then writes commands to it. (App sets
  write-type DEFAULT/with-response; LightDeck uses writeWithoutResponse and it works.)

## Command frame (same as the classic 4C5409 family)
`4C5409 | devID(1B) | devType(1B) | 5700 | cmd(1B) | 01 | param(1B) | CRC16-XMODEM(2B)` + **`0D 0A`**

- CRC16-XMODEM over the bytes before the CRC (not byte-swapped); the `0D 0A` terminator
  is appended AFTER the CRC (not covered by it).
- Opcodes are identical to the classic protocol: `00` on/off, `02` brightness(0–100),
  `03` temp(K/100), `04` hue(deg/5), `05` sat(0–100), `06` mode(1 CCT / 2 HSI / 3 scene),
  `07` scene(1–8). Confirmed in `MainActivity.controlRGB("04", deg/5)` = hue.

## The two things classic control got wrong for SD lights
1. **devType** — must come from the light, not be hardcoded `0x30`. The SD300D is `0x21`.
2. **CRLF** — every command frame ends with `0D 0A` (`BLEService.writeData(msg, 1)`).

## Handshake (learn devType + devID)
1. Enable notifications on `2B10`.
2. Write the discovery query bytes `4C 54 09 00 00 53 00 00 01 00 94 74` (+`0D 0A`).
   (The app hardcodes `4C5409000053000001009474` as its own echo to ignore.)
3. The light replies via notify with `4C 54 09 [devID] [devType] 53 [swMin] [swMax] …`.
   Parse `devID = reply[3]`, `devType = reply[4]` (`BLEService.resloveHandData`:
   `mDevID = substr(6,8)`, `mDevType = substr(8,10)`).
4. Use that devType/devID in every command frame thereafter.

Known devTypes (from `resloveHandData`): `10, 11, 20, 21, 30, 31, 33`
(`30/31/33` = RGB, others bi-color/white variants). SD300D observed = `21`.

## Implementation
`index.html` → `BLE.sdHandshake()` runs this on linking an SD (`2B10`) light, then sets the
light's `dt`/`devid` and a CRLF terminator so the existing frame builder drives it.
Decompiler scripts used: see the session's scratchpad (`analyze_gvm.py`, `trace.py`).
