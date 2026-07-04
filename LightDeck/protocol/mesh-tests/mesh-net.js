// mesh-net.js — SIG-mesh access/transport/network/proxy layers.
// Byte layouts mirror Zephyr subsys/bluetooth/mesh/crypto.c + transport.c exactly.
'use strict';
const C = require('./mesh-crypto.js');
const { h2b, b2h, cat, xor, ccmEncrypt, ccmDecrypt, k2, k3, k1, e } = C;

const be16 = n => new Uint8Array([(n >> 8) & 0xff, n & 0xff]);
const be24 = n => new Uint8Array([(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]);
const be32 = n => new Uint8Array([(n >>> 24) & 0xff, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]);

// ---- key material from a NetKey ----
async function deriveNet(netKey) {
  const { nid, enc, priv } = await k2(netKey, h2b('00'));
  const networkId = await k3(netKey);
  return { nid, encKey: enc, privacyKey: priv, networkId };
}
const aid = (appKey) => C.k4(appKey);

// ---- nonces (Zephyr create_net_nonce / create_app_nonce) ----
function netNonce(pdu, ivIndex) {          // pdu = plaintext net header bytes 0..8
  const n = new Uint8Array(13);
  n[0] = 0x00; n[1] = pdu[1];
  n[2] = pdu[2]; n[3] = pdu[3]; n[4] = pdu[4];
  n[5] = pdu[5]; n[6] = pdu[6];
  n.set(be32(ivIndex), 9);
  return n;
}
function appNonce({ devKey, seq, src, dst, ivIndex, aszmic = 0 }) {
  const n = new Uint8Array(13);
  n[0] = devKey ? 0x02 : 0x01;
  n.set(be32((seq | (aszmic << 31)) >>> 0), 1);
  n.set(be16(src), 5); n.set(be16(dst), 7);
  n.set(be32(ivIndex), 9);
  return n;
}

// ---- upper transport (app or device key) ----
async function upperEncrypt(key, ctx, accessPayload) {
  const nonce = appNonce(ctx);
  const micLen = ctx.aszmic ? 8 : 4;
  const { full } = await ccmEncrypt(key, nonce, accessPayload, new Uint8Array(0), micLen);
  return full;                              // encrypted access + TransMIC
}
async function upperDecrypt(key, ctx, encryptedWithMic) {
  const nonce = appNonce(ctx);
  const micLen = ctx.aszmic ? 8 : 4;
  const ct = encryptedWithMic.slice(0, -micLen), mic = encryptedWithMic.slice(-micLen);
  return ccmDecrypt(key, nonce, ct, mic, new Uint8Array(0));
}

// ---- lower transport, unsegmented ----
const unsegHdr = (akf, aidVal) => new Uint8Array([((akf & 1) << 6) | (aidVal & 0x3f)]);

// ---- network encrypt + obfuscate (returns full network PDU) ----
async function netEncode({ ivi, nid, ctl, ttl, seq, src, dst, transportPDU, encKey, privacyKey, ivIndex }) {
  const micLen = ctl ? 8 : 4;
  const hdr = new Uint8Array(9);
  hdr[0] = ((ivi & 1) << 7) | (nid & 0x7f);
  hdr[1] = ((ctl & 1) << 7) | (ttl & 0x7f);
  hdr.set(be24(seq), 2); hdr.set(be16(src), 5); hdr.set(be16(dst), 7);
  // plaintext to encrypt = dst(2) + transportPDU, at offset 7
  const plain = cat(hdr.slice(7), transportPDU);
  const nonce = netNonce(hdr, ivIndex);
  const { full: encPart } = await ccmEncrypt(encKey, nonce, plain, new Uint8Array(0), micLen);
  // assemble pdu: [0..6 header] + encPart(enc dst+transport + NetMIC)
  const pdu = cat(hdr.slice(0, 7), encPart);
  // obfuscate bytes 1..6 using privacy key
  const privRand = cat(new Uint8Array(5), be32(ivIndex), pdu.slice(7, 14));
  const pecb = await e(privacyKey, privRand);
  for (let i = 0; i < 6; i++) pdu[1 + i] ^= pecb[i];
  return pdu;
}
async function netDecode(pdu, { encKey, privacyKey, ivIndex }) {
  pdu = pdu.slice();
  const privRand = cat(new Uint8Array(5), be32(ivIndex), pdu.slice(7, 14));
  const pecb = await e(privacyKey, privRand);
  for (let i = 0; i < 6; i++) pdu[1 + i] ^= pecb[i];
  const ctl = (pdu[1] & 0x80) ? 1 : 0, micLen = ctl ? 8 : 4;
  const hdr = pdu.slice(0, 9);              // note: bytes 7,8 here are still ciphertext; nonce only uses 1..6
  const nonce = netNonce(pdu, ivIndex);     // uses pdu[1..6] (now deobfuscated) + zeros + iv
  const enc = pdu.slice(7);
  const ct = enc.slice(0, -micLen), mic = enc.slice(-micLen);
  const { pt, ok } = await ccmDecrypt(encKey, nonce, ct, mic, new Uint8Array(0));
  return { ok, ctl, ttl: pdu[1] & 0x7f, seq: (pdu[2] << 16) | (pdu[3] << 8) | pdu[4], src: (pdu[5] << 8) | pdu[6], dst: (pt[0] << 8) | pt[1], transportPDU: pt.slice(2) };
}

// ---- proxy GATT bearer (single-segment) ----
const proxyWrap = (netPdu, type = 0x00) => cat(new Uint8Array([(0 << 6) | (type & 0x3f)]), netPdu);

// ---- access-layer message builders ----
const OP = {
  GENERIC_ONOFF_SET: h2b('8202'), GENERIC_ONOFF_SET_UNACK: h2b('8203'),
  LIGHT_LIGHTNESS_SET: h2b('824c'), LIGHT_LIGHTNESS_SET_UNACK: h2b('824d'),
  LIGHT_CTL_SET: h2b('825e'), LIGHT_CTL_SET_UNACK: h2b('825f'),
  LIGHT_HSL_SET: h2b('8276'), LIGHT_HSL_SET_UNACK: h2b('8277'),
};
let _tid = 0; const tid = () => (_tid = (_tid + 1) & 0xff);
const accOnOff = (on, t = tid()) => cat(OP.GENERIC_ONOFF_SET_UNACK, new Uint8Array([on ? 1 : 0, t]));
const accLightness = (lvl, t = tid()) => cat(OP.LIGHT_LIGHTNESS_SET_UNACK, be16le(lvl), new Uint8Array([t]));
const accCTL = (lightness, temp, duv, t = tid()) => cat(OP.LIGHT_CTL_SET_UNACK, be16le(lightness), be16le(temp), be16le(duv & 0xffff), new Uint8Array([t]));
const accHSL = (lightness, hue, sat, t = tid()) => cat(OP.LIGHT_HSL_SET_UNACK, be16le(lightness), be16le(hue), be16le(sat), new Uint8Array([t]));
// mesh multi-byte access fields are little-endian
function be16le(n) { return new Uint8Array([n & 0xff, (n >> 8) & 0xff]); }

// ---- lower transport, SEGMENTED (Zephyr seg_tx_buf_build) ----
const SEG_SDU = 12;                          // access-message segment data size
function segmentLower(upperPDU, akf, aidVal, aszmic, seqZero) {
  const segN = Math.ceil(upperPDU.length / SEG_SDU) - 1;
  const segs = [];
  for (let o = 0; o <= segN; o++) {
    const hdr = new Uint8Array(4);
    hdr[0] = 0x80 | ((akf & 1) << 6) | (aidVal & 0x3f);
    hdr[1] = ((aszmic & 1) << 7) | ((seqZero >> 6) & 0x3f);
    hdr[2] = ((seqZero & 0x3f) << 2) | ((o >> 3) & 0x03);
    hdr[3] = ((o & 0x07) << 5) | (segN & 0x1f);
    segs.push(cat(hdr, upperPDU.slice(o * SEG_SDU, o * SEG_SDU + SEG_SDU)));
  }
  return segs;
}

// ---- full pipeline: access payload -> proxy PDU to write to 2ADD ----
async function encodeAccessMessage(net, ctx, accessPayload) {
  return (await encodeAccessMessages(net, ctx, accessPayload))[0];
}
// Returns an ARRAY of proxy PDUs. Unsegmented when the access payload fits (≤11 bytes
// with a 4-byte TransMIC); otherwise transport-segmented across consecutive network seqs.
// Caller must advance its seq counter by the returned array length.
async function encodeAccessMessages(net, { appKey, devKey, src, dst, ttl = 5, seq }, accessPayload) {
  const key = devKey || appKey;
  const akf = devKey ? 0 : 1;
  const aidVal = devKey ? 0 : await aid(appKey);
  const seg = accessPayload.length > 11;                 // > unseg access max -> segment
  const aszmic = 0;
  const ctx = { devKey: !!devKey, seq, src, dst, ivIndex: net.ivIndex, aszmic };
  const upper = await upperEncrypt(key, ctx, accessPayload);
  const enc = async (transportPDU, s) => netEncode({ ivi: net.ivIndex & 1, nid: net.nid, ctl: 0, ttl, seq: s, src, dst, transportPDU, encKey: net.encKey, privacyKey: net.privacyKey, ivIndex: net.ivIndex });
  if (!seg) return [proxyWrap(await enc(cat(unsegHdr(akf, aidVal), upper), seq), 0x00)];
  const seqZero = seq & 0x1fff;
  const segs = segmentLower(upper, akf, aidVal, aszmic, seqZero);
  const out = [];
  for (let i = 0; i < segs.length; i++) out.push(proxyWrap(await enc(segs[i], seq + i), 0x00));
  return out;
}

// ---- Config messages (device-key, for post-provisioning setup) ----
const cfg = {
  appKeyAdd: (netIdx, appIdx, appKey) => { const b = new Uint8Array(3); b[0] = netIdx & 0xff; b[1] = ((netIdx >> 8) & 0x0f) | ((appIdx & 0x0f) << 4); b[2] = (appIdx >> 4) & 0xff; return cat(h2b('00'), b, appKey); },
  modelAppBind: (elemAddr, appIdx, modelId) => cat(h2b('803d'), be16le(elemAddr), be16le(appIdx), be16le(modelId)),   // SIG model (2-byte id)
};

module.exports = { deriveNet, aid, netNonce, appNonce, upperEncrypt, upperDecrypt, unsegHdr, segmentLower, netEncode, netDecode, proxyWrap, OP, accOnOff, accLightness, accCTL, accHSL, encodeAccessMessage, encodeAccessMessages, cfg, be16le, tid };

// ============================ SELF TESTS ============================
if (require.main === module) (async () => {
  let pass = 0, fail = 0;
  const chk = (n, c) => { if (c) { pass++; console.log('  ✓', n); } else { fail++; console.log('  ✗', n); } };

  const netKey = h2b('7dd7364cd842ad18c17c2b820c84c3d6');
  const net = await deriveNet(netKey);
  net.ivIndex = 0;
  console.log('Derived: NID=0x' + net.nid.toString(16), 'enc=' + b2h(net.encKey).slice(0, 12) + '…');
  chk('k2 NID matches spec (0x68)', net.nid === 0x68);

  const appKey = h2b('63964771734fbd76e3b40519d1d94a48');
  const aidv = await aid(appKey);
  console.log('AID = 0x' + aidv.toString(16));

  // roundtrip an OnOff message
  const src = 0x0001, dst = 0x0005, seq = 0x000007;
  const access = accOnOff(1, 0x00);
  console.log('access OnOff =', b2h(access));
  const proxyPDU = await encodeAccessMessage({ ...net, appKey }, { appKey, src, dst, ttl: 5, seq }, access);
  console.log('proxy PDU =', b2h(proxyPDU));
  chk('proxy PDU type byte 0x00', proxyPDU[0] === 0x00);

  // decode network back
  const dec = await netDecode(proxyPDU.slice(1), net);
  chk('net decrypt ok', dec.ok);
  chk('net src', dec.src === src);
  chk('net dst', dec.dst === dst);
  chk('net seq', dec.seq === seq);
  // strip lower transport hdr, decrypt upper
  const akf = (dec.transportPDU[0] >> 6) & 1, aidBack = dec.transportPDU[0] & 0x3f;
  chk('akf=1 (app key)', akf === 1);
  chk('aid roundtrip', aidBack === aidv);
  const upperPDU = dec.transportPDU.slice(1);
  const up = await upperDecrypt(appKey, { devKey: false, seq, src, dst, ivIndex: 0, aszmic: 0 }, upperPDU);
  chk('upper decrypt ok', up.ok);
  chk('access payload roundtrip', b2h(up.pt) === b2h(access));

  // device-key (config) roundtrip
  const devKey = h2b('9d6dd0e96eb25dc19a40ed9914f8f03f');
  const cfgOp = h2b('8009'); // sample config opcode (short, unsegmented)
  const proxyCfg = await encodeAccessMessage({ ...net }, { devKey, src, dst: 0x0005, ttl: 5, seq: 8 }, cfgOp);
  const decc = await netDecode(proxyCfg.slice(1), net);
  const upc = await upperDecrypt(devKey, { devKey: true, seq: 8, src, dst: 0x0005, ivIndex: 0, aszmic: 0 }, decc.transportPDU.slice(1));
  chk('device-key config roundtrip', upc.ok && b2h(upc.pt) === b2h(cfgOp));

  // segmented Config AppKey Add (20-byte access payload -> 2 segments) roundtrip
  const appKeyToAdd = h2b('63964771734fbd76e3b40519d1d94a48');
  const cfgPayload = cfg.appKeyAdd(0, 0, appKeyToAdd);
  chk('AppKey Add is 20 bytes (needs segmentation)', cfgPayload.length === 20);
  const segSeq = 0x000010;
  const pdus = await encodeAccessMessages({ ...net }, { devKey, src, dst: 0x0005, ttl: 5, seq: segSeq }, cfgPayload);
  chk('produced 2 segments', pdus.length === 2);
  // reassemble
  let reasm = new Uint8Array(0); let segOK = true, aszmicR = 0;
  for (let i = 0; i < pdus.length; i++) {
    const d = await netDecode(pdus[i].slice(1), net); if (!d.ok) segOK = false;
    const t = d.transportPDU; aszmicR = (t[1] >> 7) & 1;
    reasm = cat(reasm, t.slice(4)); // strip 4-byte seg header
  }
  chk('all segments decrypt at network layer', segOK);
  const upCfg = await upperDecrypt(devKey, { devKey: true, seq: segSeq, src, dst: 0x0005, ivIndex: 0, aszmic: aszmicR }, reasm);
  chk('segmented AppKey Add reassembles + decrypts', upCfg.ok && b2h(upCfg.pt) === b2h(cfgPayload));

  console.log(`\n${fail === 0 ? '✅ ALL PASS' : '❌ ' + fail + ' FAILED'}  (${pass} passed)`);
  process.exit(fail === 0 ? 0 : 1);
})();
