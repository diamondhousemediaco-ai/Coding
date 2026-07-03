"""Telink Mesh BLE client for the GVM PRO-SD650B (and other Telink-mesh fixtures).

The 650B Pro does NOT speak the classic GVM 4C5409 protocol — it uses Telink Mesh.
Connect over normal GATT, run an AES handshake that turns a shared mesh
(name, password) into a session key, then send AES-encrypted command packets.

Crypto ported faithfully from Matthew Garrett's python-dimond
(https://github.com/google/python-dimond, Apache-2.0) and cross-checked against
telinkpp (https://github.com/vpaeder/telinkpp). The handshake + framing are the
standard Telink scheme and are high-confidence. The two VENDOR-specific pieces
below still need to be confirmed against a real light by sniffing GVM's app:

    MESH_NAME / MESH_PASS  — GVM set these when the light was provisioned.
                             Defaults are Telink factory values; GVM likely changed them.
                             Extract from the GVM app (see telink-650b.md).
    OP_* opcodes           — first guesses from the Telink light SDK; confirm via
                             an Android HCI snoop of the GVM app (see telink-650b.md).

Usage:
    pip install bleak pycryptodome
    python telink_mesh.py <MAC>  --name <mesh> --pass <pw>  on
    python telink_mesh.py <MAC>  --name <mesh> --pass <pw>  bri 60
    python telink_mesh.py <MAC>  --name <mesh> --pass <pw>  cct 4200
"""
import argparse
import asyncio
import os
from Crypto.Cipher import AES
from bleak import BleakClient

UUID_NOTIFY  = "00010203-0405-0607-0809-0a0b0c0d1911"
UUID_CONTROL = "00010203-0405-0607-0809-0a0b0c0d1912"
UUID_PAIR    = "00010203-0405-0607-0809-0a0b0c0d1914"

MESH_NAME = "telink_mesh1"   # <-- CONFIRM: GVM's provisioned mesh name
MESH_PASS = "123"            # <-- CONFIRM: GVM's provisioned mesh password

# Vendor + opcodes — CONFIRM by sniffing (values below are Telink-SDK defaults).
VENDOR_ID = 0x0211           # Telink default vendor id
OP_LUM    = 0xD0             # brightness / on-off (luminance 0 == off)
OP_CCT    = 0xE2             # colour temperature (parameterisation varies by vendor)
DEST_ALL  = 0xFFFF           # broadcast to every node in the mesh


def _aes_ecb(key, data):
    """Telink uses AES-128-ECB on byte-reversed key and data (single block)."""
    k = bytes(bytearray(key)[::-1])
    d = bytes(bytearray(data)[::-1])
    out = bytearray(AES.new(k, AES.MODE_ECB).encrypt(d))
    out.reverse()
    return out


def _pad16(s):
    b = bytearray(s.encode())
    b += bytes(16 - len(b))
    return b[:16]


def _key_from_creds(name, password):
    n, p = _pad16(name), _pad16(password)
    return bytearray(a ^ b for a, b in zip(n, p))


def key_encrypt(name, password, challenge):
    return _aes_ecb(_key_from_creds(name, password), challenge)


def generate_sk(name, password, rand_local, rand_remote):
    data = bytearray(rand_local[:8]) + bytearray(rand_remote[:8])
    return _aes_ecb(_key_from_creds(name, password), data)


def encrypt_packet(sk, mac, packet):
    """AES-CCM-style auth+encrypt, in place. mac = 4 low bytes of BLE address."""
    anonce = bytearray(16)
    anonce[0:4] = mac[0:4]
    anonce[4] = 0x01
    anonce[5:8] = packet[0:3]
    anonce[8] = 15
    auth = _aes_ecb(sk, anonce)
    for i in range(15):
        auth[i] ^= packet[i + 5]
    mac_tag = _aes_ecb(sk, auth)
    packet[3] = mac_tag[0]
    packet[4] = mac_tag[1]

    iv = bytearray(16)
    iv[1:5] = mac[0:4]
    iv[5] = 0x01
    iv[6:9] = packet[0:3]
    stream = _aes_ecb(sk, iv)
    for i in range(15):
        packet[i + 5] ^= stream[i]
    return packet


def build_command(sk, mac, seq, dest, op, params):
    packet = bytearray(20)
    packet[0] = seq & 0xFF
    packet[1] = (seq >> 8) & 0xFF
    packet[2] = (seq >> 16) & 0xFF
    packet[5] = dest & 0xFF
    packet[6] = (dest >> 8) & 0xFF
    packet[7] = op
    packet[8] = VENDOR_ID & 0xFF
    packet[9] = (VENDOR_ID >> 8) & 0xFF
    for i, b in enumerate(params[:10]):
        packet[10 + i] = b
    return encrypt_packet(sk, mac, packet)


def mac_bytes(address):
    """BLE MAC 'AA:BB:CC:DD:EE:FF' -> low 4 bytes, LE order Telink expects."""
    parts = [int(x, 16) for x in address.replace("-", ":").split(":")]
    return bytearray(parts[::-1][:4])


async def run(address, action, value):
    mac = mac_bytes(address)
    async with BleakClient(address, timeout=20) as c:
        # --- pairing handshake ---
        challenge = bytearray(os.urandom(8))
        enc = key_encrypt(MESH_NAME, MESH_PASS, challenge + bytearray(8))
        await c.write_gatt_char(UUID_PAIR, bytes([0x0c]) + challenge + enc[:8], response=True)
        resp = bytearray(await c.read_gatt_char(UUID_PAIR))
        if not resp or resp[0] != 0x0d:
            raise RuntimeError(f"pairing rejected (resp={resp.hex() if resp else 'none'}) "
                               f"— wrong mesh name/password?")
        sk = generate_sk(MESH_NAME, MESH_PASS, challenge, resp[1:9])
        print(f"paired · session key {bytes(sk).hex()}")

        await c.start_notify(UUID_NOTIFY, lambda _h, d: print("  notify:", d.hex()))

        if action == "on":
            op, params = OP_LUM, [100]
        elif action == "off":
            op, params = OP_LUM, [0]
        elif action == "bri":
            op, params = OP_LUM, [max(0, min(100, value))]
        elif action == "cct":
            k = max(2800, min(6500, value))
            op, params = OP_CCT, [round((k - 2800) * 255 / (6500 - 2800))]
        else:
            raise SystemExit(f"unknown action {action}")

        pkt = build_command(sk, mac, seq=1, dest=DEST_ALL, op=op, params=params)
        await c.write_gatt_char(UUID_CONTROL, bytes(pkt), response=False)
        print(f"sent {action} {value if value is not None else ''} · {bytes(pkt).hex()}")
        await asyncio.sleep(1.5)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("mac", help="BLE address of the 650B (from scan_lights.py)")
    ap.add_argument("action", choices=["on", "off", "bri", "cct"])
    ap.add_argument("value", nargs="?", type=int, default=None)
    ap.add_argument("--name", help="mesh name (overrides MESH_NAME)")
    ap.add_argument("--pass", dest="password", help="mesh password (overrides MESH_PASS)")
    a = ap.parse_args()
    if a.name:
        MESH_NAME = a.name
    if a.password:
        MESH_PASS = a.password
    asyncio.run(run(a.mac, a.action, a.value))
