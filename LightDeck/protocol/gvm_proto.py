"""GVM BLE/UDP frame encoder, reconstructed from decompiled GVM Easily app.

Frame:  4C5409 | DevID(00) | DevType(30) | 5700 | CMD(1B) | 01 | PARAM(1-2B) | CRC16-XMODEM(2B)
CRC is computed over the whole preceding hex string, NOT byte-swapped (see ControlUtil.controlDev).
"""

def crc16_xmodem(data: bytes) -> int:
    crc = 0x0000
    for b in data:
        crc ^= b << 8
        for _ in range(8):
            crc = ((crc << 1) ^ 0x1021) & 0xFFFF if (crc & 0x8000) else (crc << 1) & 0xFFFF
    return crc

def frame(cmd: int, param: bytes, dev_id=0x00, dev_type=0x30) -> bytes:
    body = bytes([0x4C, 0x54, 0x09, dev_id, dev_type, 0x57, 0x00, cmd, 0x01]) + param
    crc = crc16_xmodem(body)
    return body + bytes([(crc >> 8) & 0xFF, crc & 0xFF])

# --- command builders ---
def on():               return frame(0x00, bytes([0x01]))
def off():              return frame(0x00, bytes([0x00]))
def brightness(pct):    return frame(0x02, bytes([max(0, min(100, pct))]))
def temperature(k):     return frame(0x03, bytes([max(32, min(56, k // 100))]))  # 3200-5600K
def hue(deg):           return frame(0x04, bytes([max(0, min(360, deg)) // 5]))
def saturation(pct):    return frame(0x05, bytes([max(0, min(100, pct))]))
def mode(m):            return frame(0x06, bytes([m]))   # 1=CCT 2=HueSat 3=Scenes
def scene(s):           return frame(0x07, bytes([s]))   # 1-8

def hx(b): return b.hex().upper()

if __name__ == "__main__":
    # Known-good packets from protocol.md
    tests = [
        ("on  ", on(),  "4C540900305700000101", "22DF"),
        ("off ", off(), "4C540900305700000100", "32FE"),
    ]
    print("=== GVM encoder verification ===")
    ok = True
    for name, pkt, expect_body, expect_crc in tests:
        got = hx(pkt)
        expect = expect_body + expect_crc
        match = got == expect
        ok &= match
        print(f"{name} -> {got}   expected {expect}   {'MATCH' if match else 'MISMATCH'}")
    print()
    print("brightness 63% ->", hx(brightness(63)))
    print("temp 5600K     ->", hx(temperature(5600)))
    print("temp 3200K     ->", hx(temperature(3200)))
    print("hue 180        ->", hx(hue(180)))
    print("saturation 100 ->", hx(saturation(100)))
    print()
    print("ALL GOOD" if ok else "ENCODER BROKEN")
