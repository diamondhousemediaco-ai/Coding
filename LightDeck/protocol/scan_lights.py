"""Scan BLE, find GVM/Godox lights, enumerate their GATT services + characteristics.
Run with lights powered on and near this laptop."""
import asyncio
from bleak import BleakScanner, BleakClient

NAME_HINTS = ("GVM", "GODOX", "LITEMONS", "LA600", "PR150", "BT", "LED")

async def main():
    print("Scanning 8s for BLE devices...\n")
    devices = await BleakScanner.discover(timeout=8.0, return_adv=True)

    candidates = []
    print(f"{'NAME':<28} {'ADDRESS':<20} RSSI")
    print("-" * 60)
    for addr, (dev, adv) in sorted(devices.items(), key=lambda x: -(x[1][1].rssi or -999)):
        name = (adv.local_name or dev.name or "").strip()
        rssi = adv.rssi
        looks_light = any(h in name.upper() for h in NAME_HINTS) if name else False
        mark = "  <-- LIGHT?" if looks_light else ""
        if name or looks_light:
            print(f"{name[:27]:<28} {addr:<20} {rssi}{mark}")
        if looks_light:
            candidates.append((name, addr))

    print(f"\nFound {len(candidates)} likely light(s).")
    for name, addr in candidates:
        print(f"\n=== Enumerating {name} ({addr}) ===")
        try:
            async with BleakClient(addr, timeout=15) as c:
                for svc in c.services:
                    print(f"  Service {svc.uuid}")
                    for ch in svc.characteristics:
                        print(f"    Char {ch.uuid}  props={','.join(ch.properties)}")
        except Exception as e:
            print(f"  ! could not connect: {e}")

if __name__ == "__main__":
    asyncio.run(main())
