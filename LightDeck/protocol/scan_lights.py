"""Scan BLE, find GVM/Godox lights, enumerate their GATT services + characteristics,
and flag which control protocol each fixture speaks (classic GVM BLE vs Telink Mesh).

Run with lights powered on, near this laptop, and ALL vendor apps closed
(a light already connected to a phone app will refuse this connection).

    pip install bleak
    python scan_lights.py
"""
import asyncio
from bleak import BleakScanner, BleakClient

NAME_HINTS = ("GVM", "GODOX", "LITEMONS", "LA600", "PR150", "BT_LED", "BT", "LED", "K60", "WEEYLITE", "VILTROX")

# Telink Mesh signature UUIDs (the 650B Pro speaks this).
TELINK_CHARS = {
    "00010203-0405-0607-0809-0a0b0c0d1911": "Telink NOTIFY (status out)",
    "00010203-0405-0607-0809-0a0b0c0d1912": "Telink CONTROL (command in)",
    "00010203-0405-0607-0809-0a0b0c0d1913": "Telink PAIR/OTA",
    "00010203-0405-0607-0809-0a0b0c0d1914": "Telink PAIRING (auth handshake)",
}
# Classic GVM BLE service families (PR150 / 300D etc.).
CLASSIC_HINTS = ("ae00", "fff0", "ffe0", "ffe5", "ff00", "fee0")
# Standard Bluetooth SIG mesh (would mean account-bound provisioning — harder).
SIG_MESH = {"00001827": "SIG Mesh Provisioning", "00001828": "SIG Mesh Proxy"}


def classify(uuids):
    u = [x.lower() for x in uuids]
    if any(c in TELINK_CHARS for c in u):
        return "TELINK MESH  -> use telink_mesh.py (needs mesh name+password)"
    if any(x[:8] in SIG_MESH for x in u):
        return "SIG MESH     -> account-bound provisioning, hardest path"
    if any(any(h in x for h in CLASSIC_HINTS) for x in u):
        return "CLASSIC GVM  -> use the verified 4C5409 protocol (index.html)"
    return "UNKNOWN      -> capture an HCI snoop log to identify"


async def main():
    print("Scanning 8s for BLE devices (vendor apps must be CLOSED)...\n")
    devices = await BleakScanner.discover(timeout=8.0, return_adv=True)

    candidates = []
    print(f"{'NAME':<24} {'ADDRESS':<20} {'RSSI':>5}")
    print("-" * 60)
    for addr, (dev, adv) in sorted(devices.items(), key=lambda x: -(x[1][1].rssi or -999)):
        name = (adv.local_name or dev.name or "").strip()
        looks_light = any(h in name.upper() for h in NAME_HINTS) if name else False
        mark = "  <-- LIGHT?" if looks_light else ""
        if name or looks_light:
            print(f"{name[:23]:<24} {addr:<20} {adv.rssi!s:>5}{mark}")
        if looks_light:
            candidates.append((name, addr))

    print(f"\nFound {len(candidates)} likely light(s). Enumerating each...\n")
    for name, addr in candidates:
        print(f"=== {name or '(no name)'}  [{addr}] ===")
        try:
            async with BleakClient(addr, timeout=15) as c:
                found = []
                for svc in c.services:
                    print(f"  Service {svc.uuid}")
                    for ch in svc.characteristics:
                        tag = TELINK_CHARS.get(ch.uuid.lower(), "")
                        tag = f"   << {tag}" if tag else ""
                        print(f"    Char {ch.uuid}  [{','.join(ch.properties)}]{tag}")
                        found.append(ch.uuid)
                print(f"  >> VERDICT: {classify(found)}\n")
        except Exception as e:
            print(f"  ! could not connect: {e}"
                  f"  (is a vendor app still holding it? force-quit and retry)\n")


if __name__ == "__main__":
    asyncio.run(main())
