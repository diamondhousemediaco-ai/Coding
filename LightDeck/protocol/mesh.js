/*
 * mesh.js — Bluetooth SIG Mesh provisioner + client for LightDeck (browser / Bluefy).
 *
 * Pure-logic layers (crypto, net, prov) are ported verbatim from Node modules that pass:
 *   - AES-CMAC  vs RFC 4493
 *   - AES-CCM   vs RFC 3610
 *   - s1/k1/k2/k3/k4 vs Bluetooth Mesh Profile §8 sample data (NID 0x68, AID 0x26)
 *   - network layer offsets/nonce/MIC vs Nordic nRF5-SDK-for-Mesh ut_net_packet.c
 *   - full two-party provisioning handshake (both sides derive identical DevKey)
 *   - transport segmentation roundtrip (20-byte Config AppKey Add)
 * The BLE bearer (navigator.bluetooth) can only be validated on hardware.
 *
 * Targets standard GATT: provisioning 0x1827 (in 0x2ADB / out 0x2ADC),
 * proxy 0x1828 (in 0x2ADD / out 0x2ADE). Algorithm 0x00 (P-256/CMAC/CCM), No-OOB.
 */
(function (root) {
  'use strict';
  const CR = (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) ? globalThis.crypto : (typeof crypto !== 'undefined' ? crypto : null);
  const subtle = CR.subtle;

  // ---------------- byte helpers ----------------
  const h2b = h => { h = h.replace(/\s+/g, ''); const a = new Uint8Array(h.length / 2); for (let i = 0; i < a.length; i++) a[i] = parseInt(h.substr(i * 2, 2), 16); return a; };
  const b2h = b => [...b].map(x => x.toString(16).padStart(2, '0')).join('');
  const cat = (...as) => { let n = 0; for (const a of as) n += a.length; const o = new Uint8Array(n); let i = 0; for (const a of as) { o.set(a, i); i += a.length; } return o; };
  const xor = (a, b) => { const o = new Uint8Array(a.length); for (let i = 0; i < a.length; i++) o[i] = a[i] ^ b[i]; return o; };
  const eq = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
  const be16 = n => new Uint8Array([(n >> 8) & 0xff, n & 0xff]);
  const be24 = n => new Uint8Array([(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]);
  const be32 = n => new Uint8Array([(n >>> 24) & 0xff, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]);
  const be16le = n => new Uint8Array([n & 0xff, (n >> 8) & 0xff]);
  const enc = s => new TextEncoder().encode(s);

  // ---------------- AES-ECB via WebCrypto AES-CBC(IV=0) ----------------
  const importCbc = k => subtle.importKey('raw', k, { name: 'AES-CBC' }, false, ['encrypt']);
  async function ecb(key, block) { const out = new Uint8Array(await subtle.encrypt({ name: 'AES-CBC', iv: new Uint8Array(16) }, key, block)); return out.slice(0, 16); }
  async function e(kb, block) { return ecb(await importCbc(kb), block); }

  // ---------------- AES-CMAC (RFC 4493) ----------------
  function dbl(b) { const o = new Uint8Array(16); let c = 0; for (let i = 15; i >= 0; i--) { const v = (b[i] << 1) | c; o[i] = v & 0xff; c = (b[i] & 0x80) ? 1 : 0; } if (b[0] & 0x80) o[15] ^= 0x87; return o; }
  async function cmac(kb, msg) {
    const key = await importCbc(kb); const L = await ecb(key, new Uint8Array(16)); const K1 = dbl(L), K2 = dbl(K1);
    const n = Math.ceil(msg.length / 16) || 1; const complete = msg.length > 0 && msg.length % 16 === 0; let last;
    if (complete) last = xor(msg.slice((n - 1) * 16), K1);
    else { const rem = msg.slice((n - 1) * 16); const p = new Uint8Array(16); p.set(rem); p[rem.length] = 0x80; last = xor(p, K2); }
    let X = new Uint8Array(16);
    for (let i = 0; i < n - 1; i++) X = await ecb(key, xor(X, msg.slice(i * 16, i * 16 + 16)));
    return ecb(key, xor(X, last));
  }

  // ---------------- AES-CCM (RFC 3610) ----------------
  async function ccmEncrypt(kb, nonce, pt, aad = new Uint8Array(0), micLen = 4) {
    const L = 15 - nonce.length, key = await importCbc(kb);
    const B0 = new Uint8Array(16); B0[0] = (aad.length ? 0x40 : 0) | (((micLen - 2) / 2) << 3) | (L - 1); B0.set(nonce, 1);
    let lf = pt.length; for (let i = 15; i >= 16 - L; i--) { B0[i] = lf & 0xff; lf >>= 8; }
    let X = await ecb(key, B0);
    if (aad.length) { let blk = cat(new Uint8Array([aad.length >> 8, aad.length & 0xff]), aad); const pad = (16 - blk.length % 16) % 16; if (pad) blk = cat(blk, new Uint8Array(pad)); for (let i = 0; i < blk.length; i += 16) X = await ecb(key, xor(X, blk.slice(i, i + 16))); }
    { let blk = pt; const pad = (16 - blk.length % 16) % 16; if (pad) blk = cat(blk, new Uint8Array(pad)); for (let i = 0; i < blk.length; i += 16) X = await ecb(key, xor(X, blk.slice(i, i + 16))); }
    const T = X.slice(0, micLen);
    const ctr = i => { const A = new Uint8Array(16); A[0] = L - 1; A.set(nonce, 1); let c = i; for (let j = 15; j >= 16 - L; j--) { A[j] = c & 0xff; c >>= 8; } return A; };
    const S0 = await ecb(key, ctr(0)); const mic = xor(T, S0.slice(0, micLen)); const ct = new Uint8Array(pt.length);
    for (let i = 0; i < pt.length; i += 16) { const S = await ecb(key, ctr(1 + i / 16)); for (let j = 0; j < 16 && i + j < pt.length; j++) ct[i + j] = pt[i + j] ^ S[j]; }
    return { ct, mic, full: cat(ct, mic) };
  }
  async function ccmDecrypt(kb, nonce, ct, mic, aad = new Uint8Array(0)) {
    const micLen = mic.length, L = 15 - nonce.length, key = await importCbc(kb);
    const ctr = i => { const A = new Uint8Array(16); A[0] = L - 1; A.set(nonce, 1); let c = i; for (let j = 15; j >= 16 - L; j--) { A[j] = c & 0xff; c >>= 8; } return A; };
    const pt = new Uint8Array(ct.length);
    for (let i = 0; i < ct.length; i += 16) { const S = await ecb(key, ctr(1 + i / 16)); for (let j = 0; j < 16 && i + j < ct.length; j++) pt[i + j] = ct[i + j] ^ S[j]; }
    const { mic: m2 } = await ccmEncrypt(kb, nonce, pt, aad, micLen);
    return { pt, ok: eq(m2, mic) };
  }

  // ---------------- salt + k-functions ----------------
  const s1 = M => cmac(new Uint8Array(16), M);
  const s1s = s => s1(enc(s));
  async function k1(N, SALT, P) { return cmac(await cmac(SALT, N), P); }
  const k1s = (N, SALT, label) => k1(N, SALT, enc(label));
  async function k2(N, P) { const salt = await s1s('smk2'); const T = await cmac(salt, N); const T1 = await cmac(T, cat(P, h2b('01'))); const T2 = await cmac(T, cat(T1, P, h2b('02'))); const T3 = await cmac(T, cat(T2, P, h2b('03'))); const k = cat(T1, T2, T3).slice(15); return { nid: k[0] & 0x7f, enc: k.slice(1, 17), priv: k.slice(17, 33) }; }
  async function k3(N) { const T = await cmac(await s1s('smk3'), N); return (await cmac(T, cat(enc('id64'), h2b('01')))).slice(8); }
  async function k4(N) { const T = await cmac(await s1s('smk4'), N); return (await cmac(T, cat(enc('id6'), h2b('01'))))[15] & 0x3f; }

  // ---------------- network / transport / access ----------------
  async function deriveNet(netKey) { const { nid, enc, priv } = await k2(netKey, h2b('00')); return { nid, encKey: enc, privacyKey: priv, networkId: await k3(netKey) }; }
  const aid = ak => k4(ak);
  function netNonce(pdu, iv) { const n = new Uint8Array(13); n[0] = 0; n[1] = pdu[1]; n[2] = pdu[2]; n[3] = pdu[3]; n[4] = pdu[4]; n[5] = pdu[5]; n[6] = pdu[6]; n.set(be32(iv), 9); return n; }
  function appNonce({ devKey, seq, src, dst, ivIndex, aszmic = 0 }) { const n = new Uint8Array(13); n[0] = devKey ? 2 : 1; n.set(be32((seq | (aszmic << 31)) >>> 0), 1); n.set(be16(src), 5); n.set(be16(dst), 7); n.set(be32(ivIndex), 9); return n; }
  async function upperEncrypt(key, ctx, ap) { const { full } = await ccmEncrypt(key, appNonce(ctx), ap, new Uint8Array(0), ctx.aszmic ? 8 : 4); return full; }
  async function upperDecrypt(key, ctx, em) { const m = ctx.aszmic ? 8 : 4; return ccmDecrypt(key, appNonce(ctx), em.slice(0, -m), em.slice(-m), new Uint8Array(0)); }
  const unsegHdr = (akf, aidv) => new Uint8Array([((akf & 1) << 6) | (aidv & 0x3f)]);
  const SEG_SDU = 12;
  function segmentLower(up, akf, aidv, aszmic, seqZero) { const segN = Math.ceil(up.length / SEG_SDU) - 1; const out = []; for (let o = 0; o <= segN; o++) { const h = new Uint8Array(4); h[0] = 0x80 | ((akf & 1) << 6) | (aidv & 0x3f); h[1] = ((aszmic & 1) << 7) | ((seqZero >> 6) & 0x3f); h[2] = ((seqZero & 0x3f) << 2) | ((o >> 3) & 3); h[3] = ((o & 7) << 5) | (segN & 0x1f); out.push(cat(h, up.slice(o * SEG_SDU, o * SEG_SDU + SEG_SDU))); } return out; }
  async function netEncode(a) {
    const micLen = a.ctl ? 8 : 4; const hdr = new Uint8Array(9);
    hdr[0] = ((a.ivi & 1) << 7) | (a.nid & 0x7f); hdr[1] = ((a.ctl & 1) << 7) | (a.ttl & 0x7f);
    hdr.set(be24(a.seq), 2); hdr.set(be16(a.src), 5); hdr.set(be16(a.dst), 7);
    const plain = cat(hdr.slice(7), a.transportPDU); const { full: encPart } = await ccmEncrypt(a.encKey, netNonce(hdr, a.ivIndex), plain, new Uint8Array(0), micLen);
    const pdu = cat(hdr.slice(0, 7), encPart); const pecb = await e(a.privacyKey, cat(new Uint8Array(5), be32(a.ivIndex), pdu.slice(7, 14)));
    for (let i = 0; i < 6; i++) pdu[1 + i] ^= pecb[i]; return pdu;
  }
  async function netDecode(pduIn, m) {
    const pdu = pduIn.slice(); const pecb = await e(m.privacyKey, cat(new Uint8Array(5), be32(m.ivIndex), pdu.slice(7, 14)));
    for (let i = 0; i < 6; i++) pdu[1 + i] ^= pecb[i]; const ctl = (pdu[1] & 0x80) ? 1 : 0, micLen = ctl ? 8 : 4;
    const enc = pdu.slice(7); const { pt, ok } = await ccmDecrypt(m.encKey, netNonce(pdu, m.ivIndex), enc.slice(0, -micLen), enc.slice(-micLen), new Uint8Array(0));
    return { ok, ctl, ttl: pdu[1] & 0x7f, seq: (pdu[2] << 16) | (pdu[3] << 8) | pdu[4], src: (pdu[5] << 8) | pdu[6], dst: ok ? (pt[0] << 8) | pt[1] : 0, transportPDU: ok ? pt.slice(2) : new Uint8Array(0) };
  }
  const proxyWrap = (net, type = 0) => cat(new Uint8Array([(type & 0x3f)]), net);

  const OP = { ONOFF: h2b('8203'), LIGHTNESS: h2b('824d'), CTL: h2b('825f'), HSL: h2b('8277') };
  let _tid = 0; const tid = () => (_tid = (_tid + 1) & 0xff);
  const accOnOff = (on, t = tid()) => cat(OP.ONOFF, new Uint8Array([on ? 1 : 0, t]));
  const accLightness = (lvl, t = tid()) => cat(OP.LIGHTNESS, be16le(lvl), new Uint8Array([t]));
  const accCTL = (l, temp, duv, t = tid()) => cat(OP.CTL, be16le(l), be16le(temp), be16le(duv & 0xffff), new Uint8Array([t]));
  const accHSL = (l, hue, sat, t = tid()) => cat(OP.HSL, be16le(l), be16le(hue), be16le(sat), new Uint8Array([t]));

  async function encodeAccessMessages(net, { appKey, devKey, src, dst, ttl = 5, seq }, ap) {
    const key = devKey || appKey, akf = devKey ? 0 : 1, aidv = devKey ? 0 : await aid(appKey);
    const ctx = { devKey: !!devKey, seq, src, dst, ivIndex: net.ivIndex, aszmic: 0 };
    const up = await upperEncrypt(key, ctx, ap);
    const enc1 = (tp, s) => netEncode({ ivi: net.ivIndex & 1, nid: net.nid, ctl: 0, ttl, seq: s, src, dst, transportPDU: tp, encKey: net.encKey, privacyKey: net.privacyKey, ivIndex: net.ivIndex });
    if (ap.length <= 11) return [proxyWrap(await enc1(cat(unsegHdr(akf, aidv), up), seq), 0)];
    const segs = segmentLower(up, akf, aidv, 0, seq & 0x1fff); const out = [];
    for (let i = 0; i < segs.length; i++) out.push(proxyWrap(await enc1(segs[i], seq + i), 0));
    return out;
  }
  const cfg = {
    appKeyAdd: (ni, ai, ak) => { const b = new Uint8Array(3); b[0] = ni & 0xff; b[1] = ((ni >> 8) & 0x0f) | ((ai & 0x0f) << 4); b[2] = (ai >> 4) & 0xff; return cat(h2b('00'), b, ak); },
    modelAppBind: (elem, ai, model) => cat(h2b('803d'), be16le(elem), be16le(ai), be16le(model)),
  };

  // ---------------- provisioning ----------------
  async function genKeyPair() { const kp = await subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']); const raw = new Uint8Array(await subtle.exportKey('raw', kp.publicKey)); return { priv: kp.privateKey, pub64: raw.slice(1) }; }
  async function dhKey(priv, peer64) { const peer = await subtle.importKey('raw', cat(h2b('04'), peer64), { name: 'ECDH', namedCurve: 'P-256' }, false, []); return new Uint8Array(await subtle.deriveBits({ name: 'ECDH', public: peer }, priv, 256)); }
  const confInputs = (inv, caps, st, pP, pD) => cat(inv, caps, st, pP, pD);
  const confKey = (dh, cs) => k1s(dh, cs, 'prck');
  const confirmation = (ck, rand, auth) => cmac(ck, cat(rand, auth));
  const provSalt = (cs, rP, rD) => cmac(new Uint8Array(16), cat(cs, rP, rD));
  const sessionKey = (dh, ps) => k1s(dh, ps, 'prsk');
  async function sessionNonce(dh, ps) { return (await k1s(dh, ps, 'prsn')).slice(3); }
  const devKeyFn = (dh, ps) => k1s(dh, ps, 'prdk');
  const provData = ({ netKey, keyIndex = 0, flags = 0, ivIndex = 0, unicast }) => cat(netKey, new Uint8Array([keyIndex >> 8, keyIndex & 0xff, flags, (ivIndex >>> 24) & 0xff, (ivIndex >> 16) & 0xff, (ivIndex >> 8) & 0xff, ivIndex & 0xff, unicast >> 8, unicast & 0xff]));
  const PDU = { INVITE: 0, CAPS: 1, START: 2, PUBKEY: 3, CONFIRM: 5, RANDOM: 6, DATA: 7, COMPLETE: 8, FAILED: 9 };

  class Provisioner {
    constructor(o) { Object.assign(this, o); this.invite = new Uint8Array([0]); this.start = h2b('0000000000'); this.auth = new Uint8Array(16); this.log = o.log || (() => {}); }
    async begin() { this.kp = await genKeyPair(); this.log('→ Invite'); this.emit(new Uint8Array([PDU.INVITE, ...this.invite])); }
    async onPDU(pdu) {
      const op = pdu[0], p = pdu.slice(1);
      if (op === PDU.CAPS) { this.caps = p.slice(0, 11); this.log('← Capabilities'); this.emit(new Uint8Array([PDU.START, ...this.start])); this.log('→ Start'); this.emit(new Uint8Array([PDU.PUBKEY, ...this.kp.pub64])); this.log('→ PublicKey'); }
      else if (op === PDU.PUBKEY) { this.devPub = p.slice(0, 64); this.log('← Device PublicKey'); this.dh = await dhKey(this.kp.priv, this.devPub); this.cSalt = await s1(confInputs(this.invite, this.caps, this.start, this.kp.pub64, this.devPub)); this.cKey = await confKey(this.dh, this.cSalt); this.randP = CR.getRandomValues(new Uint8Array(16)); this.emit(new Uint8Array([PDU.CONFIRM, ...(await confirmation(this.cKey, this.randP, this.auth))])); this.log('→ Confirmation'); }
      else if (op === PDU.CONFIRM) { this.confD = p.slice(0, 16); this.log('← Device Confirmation'); this.emit(new Uint8Array([PDU.RANDOM, ...this.randP])); this.log('→ Random'); }
      else if (op === PDU.RANDOM) { this.randD = p.slice(0, 16); this.log('← Device Random'); if (!eq(await confirmation(this.cKey, this.randD, this.auth), this.confD)) throw new Error('device confirmation mismatch'); this.pSalt = await provSalt(this.cSalt, this.randP, this.randD); const sK = await sessionKey(this.dh, this.pSalt); const sN = await sessionNonce(this.dh, this.pSalt); this.devKey = await devKeyFn(this.dh, this.pSalt); const { full } = await ccmEncrypt(sK, sN, provData({ netKey: this.netKey, keyIndex: this.keyIndex || 0, flags: 0, ivIndex: this.ivIndex || 0, unicast: this.unicast }), new Uint8Array(0), 8); this.emit(new Uint8Array([PDU.DATA, ...full])); this.log('→ Provisioning Data'); }
      else if (op === PDU.COMPLETE) { this.log('← Complete ✓'); this.done = { devKey: this.devKey, unicast: this.unicast }; if (this._res) this._res(this.done); }
      else if (op === PDU.FAILED) { const err = new Error('Provisioning Failed 0x' + b2h(p)); if (this._rej) this._rej(err); throw err; }
    }
    finished() { return new Promise((res, rej) => { this._res = res; this._rej = rej; if (this.done) res(this.done); }); }
  }

  // ---------------- Web Bluetooth proxy bearer (browser only) ----------------
  const UUID = { PROV_SVC: '00001827-0000-1000-8000-00805f9b34fb', PROV_IN: '00002adb-0000-1000-8000-00805f9b34fb', PROV_OUT: '00002adc-0000-1000-8000-00805f9b34fb', PROXY_SVC: '00001828-0000-1000-8000-00805f9b34fb', PROXY_IN: '00002add-0000-1000-8000-00805f9b34fb', PROXY_OUT: '00002ade-0000-1000-8000-00805f9b34fb' };
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // Proxy SAR: split a proxy PDU (type + data) into GATT writes; reassemble notifications.
  function sarSegments(type, data, maxData = 19) {
    if (data.length <= maxData) return [cat(new Uint8Array([(0 << 6) | type]), data)];
    const out = []; let o = 0;
    while (o < data.length) { const chunk = data.slice(o, o + maxData); const first = o === 0, last = o + maxData >= data.length; const sar = last ? 3 : (first ? 1 : 2); out.push(cat(new Uint8Array([(sar << 6) | type]), chunk)); o += maxData; }
    return out;
  }
  class ProxyBearer {
    constructor(inChar, outChar, onMessage, log) { this.inChar = inChar; this.outChar = outChar; this.onMessage = onMessage; this.log = log || (() => {}); this._buf = null; this._type = 0; }
    async start() { await this.outChar.startNotifications(); this.outChar.addEventListener('characteristicvaluechanged', e => this._rx(new Uint8Array(e.target.value.buffer))); }
    _rx(pkt) { const sar = pkt[0] >> 6, type = pkt[0] & 0x3f, data = pkt.slice(1); if (sar === 0) { this.onMessage(type, data); } else if (sar === 1) { this._buf = data; this._type = type; } else if (sar === 2) { this._buf = cat(this._buf, data); } else if (sar === 3) { this.onMessage(this._type, cat(this._buf || new Uint8Array(0), data)); this._buf = null; } }
    async send(type, data) { for (const seg of sarSegments(type, data)) { await this._write(seg); await sleep(20); } }
    async _write(bytes) { if (this.inChar.writeValueWithoutResponse) return this.inChar.writeValueWithoutResponse(bytes); return this.inChar.writeValue(bytes); }
  }

  async function pickDevice(serviceUUID) { return navigator.bluetooth.requestDevice({ filters: [{ services: [serviceUUID] }], optionalServices: [UUID.PROV_SVC, UUID.PROXY_SVC] }); }

  // Provision an unprovisioned node. Returns { devKey, unicast }.
  async function provision({ netKey, unicast, keyIndex = 0, ivIndex = 0, log = () => {} }) {
    log('Pick the unprovisioned light (factory-reset → advertises Mesh Provisioning)…');
    const dev = await navigator.bluetooth.requestDevice({ filters: [{ services: [UUID.PROV_SVC] }], optionalServices: [UUID.PROXY_SVC] });
    const gatt = await dev.gatt.connect(); const svc = await gatt.getPrimaryService(UUID.PROV_SVC);
    const cin = await svc.getCharacteristic(UUID.PROV_IN), cout = await svc.getCharacteristic(UUID.PROV_OUT);
    const prov = new Provisioner({ netKey, unicast, keyIndex, ivIndex, log, emit: null });
    const bearer = new ProxyBearer(cin, cout, (type, data) => { if (type === 0x03) prov.onPDU(data).catch(err => log('✗ ' + err.message)); }, log);
    prov.emit = pdu => bearer.send(0x03, pdu);   // provisioning PDUs use proxy type 0x03
    await bearer.start(); await sleep(150); await prov.begin();
    const res = await prov.finished();
    log('Provisioned ✓ unicast 0x' + unicast.toString(16) + ' devKey ' + b2h(res.devKey).slice(0, 8) + '…');
    try { gatt.disconnect(); } catch (_) {}
    return res;
  }

  // A provisioned node we can control. Holds net material + node keys + seq counter.
  class Node {
    constructor(o) { Object.assign(this, o); } // {netKeyHex, appKeyHex, devKeyHex, unicast, provisionerAddr, ivIndex, seq}
    async ready() { this.net = await deriveNet(h2b(this.netKeyHex)); this.net.ivIndex = this.ivIndex || 0; this.appKey = h2b(this.appKeyHex); this.devKey = h2b(this.devKeyHex); return this; }
    async connect(log = () => {}) {
      log('Pick your light (proxy)…');
      this.device = await navigator.bluetooth.requestDevice({ filters: [{ services: [UUID.PROXY_SVC] }], optionalServices: [UUID.PROV_SVC] });
      const gatt = await this.device.gatt.connect(); const svc = await gatt.getPrimaryService(UUID.PROXY_SVC);
      this.cin = await svc.getCharacteristic(UUID.PROXY_IN); this.cout = await svc.getCharacteristic(UUID.PROXY_OUT);
      this.bearer = new ProxyBearer(this.cin, this.cout, (t, d) => this._onNet(t, d), log); await this.bearer.start(); await sleep(150);
      this.connected = true; log('Proxy connected.'); return this;
    }
    async _onNet(type, data) {
      if (type !== 0x00) return;
      try {
        const d = await netDecode(data, this.net); if (!d.ok) return;
        const t = d.transportPDU;
        if (t[0] & 0x80) { if (this._log) this._log('← segmented status from 0x' + d.src.toString(16) + ' (not decoded)'); return; }
        const akf = (t[0] >> 6) & 1, key = akf ? this.appKey : this.devKey;
        const ctx = { devKey: !akf, seq: d.seq, src: d.src, dst: d.dst, ivIndex: this.net.ivIndex, aszmic: 0 };
        const dec = await upperDecrypt(key, ctx, t.slice(1));
        if (!dec.ok) { if (this._log) this._log('← 0x' + d.src.toString(16) + ' reply (could not decrypt — key/bind issue)'); return; }
        const p = dec.pt; let op, n; if (p[0] < 0x80) { op = p[0]; n = 1; } else if (p[0] < 0xc0) { op = (p[0] << 8) | p[1]; n = 2; } else { op = (p[0] << 16) | (p[1] << 8) | p[2]; n = 3; }
        const params = p.slice(n);
        const NAMES = { 0x8003: 'AppKey Status', 0x803e: 'Model App Status', 0x8204: 'Generic OnOff Status', 0x804e: 'Light Lightness Status', 0x8260: 'Light CTL Status', 0x02: 'Composition Data Status' };
        const nm = NAMES[op] || ('op 0x' + op.toString(16));
        const st = (op === 0x8003 || op === 0x803e) ? (params[0] === 0 ? ' ✓ SUCCESS' : ' ✗ ERROR 0x' + (params[0] || 0).toString(16)) : '';
        if (this._log) this._log('← ' + nm + st + ' [' + b2h(params) + ']');
      } catch (_) {}
    }
    _seq() { const s = this.seq | 0; this.seq = s + 1; if (this.onSeq) this.onSeq(this.seq); return s; }
    async _sendAccess(o, ap) { const seq = this._seq(); const pdus = await encodeAccessMessages(this.net, { ...o, seq }, ap); if (pdus.length > 1) this.seq += pdus.length - 1; for (const p of pdus) { await this.bearer.send(0x00, p.slice(1)); await sleep(30); } }
    // one-time config: add app key, bind to the models we drive
    async configure(models = [0x1000, 0x1300, 0x1303, 0x1307], log = () => {}) {
      const src = this.provisionerAddr || 0x0001, dst = this.unicast;
      log('Config: AppKey Add…'); await this._sendAccess({ devKey: this.devKey, src, dst }, cfg.appKeyAdd(0, 0, this.appKey)); await sleep(400);
      for (const m of models) { log('Config: bind model 0x' + m.toString(16) + '…'); await this._sendAccess({ devKey: this.devKey, src, dst }, cfg.modelAppBind(this.unicast, 0, m)); await sleep(300); }
      log('Config done — app key bound.');
    }
    onOff(on) { return this._sendAccess({ appKey: this.appKey, src: this.provisionerAddr || 0x0001, dst: this.unicast }, accOnOff(on)); }
    lightness(v) { return this._sendAccess({ appKey: this.appKey, src: this.provisionerAddr || 0x0001, dst: this.unicast }, accLightness(v)); }
    ctl(l, temp, duv = 0) { return this._sendAccess({ appKey: this.appKey, src: this.provisionerAddr || 0x0001, dst: this.unicast }, accCTL(l, temp, duv)); }
    hsl(l, hue, sat) { return this._sendAccess({ appKey: this.appKey, src: this.provisionerAddr || 0x0001, dst: this.unicast }, accHSL(l, hue, sat)); }
  }

  function randomKey() { return b2h(CR.getRandomValues(new Uint8Array(16))); }

  const Mesh = {
    h2b, b2h, cat, // helpers
    crypto: { cmac, ccmEncrypt, ccmDecrypt, s1, s1s, k1, k2, k3, k4, e },
    net: { deriveNet, aid, netEncode, netDecode, encodeAccessMessages, accOnOff, accLightness, accCTL, accHSL, cfg, segmentLower, upperEncrypt, upperDecrypt },
    prov: { genKeyPair, dhKey, confInputs, confKey, confirmation, provSalt, sessionKey, sessionNonce, devKeyFn, provData, Provisioner },
    ble: { UUID, ProxyBearer, sarSegments, provision, Node, pickDevice },
    randomKey,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = Mesh;
  root.Mesh = Mesh;
})(typeof window !== 'undefined' ? window : globalThis);
