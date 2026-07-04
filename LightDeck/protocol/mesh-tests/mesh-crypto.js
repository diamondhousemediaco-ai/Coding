// mesh-crypto.js — Bluetooth SIG Mesh crypto primitives.
// Runs in Node (crypto.webcrypto) and in the browser (window.crypto) unchanged.
// Verified against RFC 4493 (AES-CMAC), RFC 3610 (AES-CCM) and Mesh Profile §8.
'use strict';
const _c = (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle)
  ? globalThis.crypto : require('crypto').webcrypto;
const subtle = _c.subtle;

// ---------- hex / byte helpers ----------
const h2b = h => { h = h.replace(/\s+/g, ''); const a = new Uint8Array(h.length / 2); for (let i = 0; i < a.length; i++) a[i] = parseInt(h.substr(i * 2, 2), 16); return a; };
const b2h = b => [...b].map(x => x.toString(16).padStart(2, '0')).join('');
const cat = (...arrs) => { let n = 0; for (const a of arrs) n += a.length; const o = new Uint8Array(n); let i = 0; for (const a of arrs) { o.set(a, i); i += a.length; } return o; };
const xor = (a, b) => { const o = new Uint8Array(a.length); for (let i = 0; i < a.length; i++) o[i] = a[i] ^ b[i]; return o; };
const eq = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

// ---------- AES-ECB single block via WebCrypto AES-CBC (IV=0) ----------
async function importCbc(keyBytes) { return subtle.importKey('raw', keyBytes, { name: 'AES-CBC' }, false, ['encrypt']); }
// key: CryptoKey. block: 16 bytes -> AES-ECB(block). C1 of CBC with IV=0 is E(P1).
async function ecb(key, block) {
  const iv = new Uint8Array(16);
  const out = new Uint8Array(await subtle.encrypt({ name: 'AES-CBC', iv }, key, block));
  return out.slice(0, 16);
}
// raw AES (single block) e(key,plain)
async function e(keyBytes, block) { return ecb(await importCbc(keyBytes), block); }

// ---------- AES-CMAC (RFC 4493) ----------
function dbl(b) {
  const o = new Uint8Array(16);
  let carry = 0;
  for (let i = 15; i >= 0; i--) { const v = (b[i] << 1) | carry; o[i] = v & 0xff; carry = (b[i] & 0x80) ? 1 : 0; }
  if (b[0] & 0x80) o[15] ^= 0x87;
  return o;
}
async function cmac(keyBytes, msg) {
  const key = await importCbc(keyBytes);
  const L = await ecb(key, new Uint8Array(16));
  const K1 = dbl(L), K2 = dbl(K1);
  const n = Math.ceil(msg.length / 16) || 1;
  const complete = msg.length > 0 && msg.length % 16 === 0;
  let last;
  if (complete) last = xor(msg.slice((n - 1) * 16), K1);
  else {
    const rem = msg.slice((n - 1) * 16);
    const padded = new Uint8Array(16); padded.set(rem); padded[rem.length] = 0x80;
    last = xor(padded, K2);
  }
  let X = new Uint8Array(16);
  for (let i = 0; i < n - 1; i++) X = await ecb(key, xor(X, msg.slice(i * 16, i * 16 + 16)));
  return ecb(key, xor(X, last));
}

// ---------- AES-CCM (RFC 3610), parameterizable MIC size + L ----------
// nonce length = 15 - L. mesh uses 13-byte nonce -> L=2.
async function ccmEncrypt(keyBytes, nonce, plaintext, aad = new Uint8Array(0), micLen = 4) {
  const L = 15 - nonce.length;
  const key = await importCbc(keyBytes);
  // --- CBC-MAC (authentication) ---
  const flags0 = (aad.length > 0 ? 0x40 : 0) | (((micLen - 2) / 2) << 3) | (L - 1);
  const B0 = new Uint8Array(16);
  B0[0] = flags0; B0.set(nonce, 1);
  let lenField = plaintext.length;
  for (let i = 15; i >= 16 - L; i--) { B0[i] = lenField & 0xff; lenField >>= 8; }
  let X = await ecb(key, B0);
  if (aad.length > 0) {
    let a; // length-prefixed AAD
    if (aad.length < 0xff00) { a = new Uint8Array(2); a[0] = aad.length >> 8; a[1] = aad.length & 0xff; }
    else throw new Error('aad too long');
    let block = cat(a, aad);
    const pad = (16 - block.length % 16) % 16;
    block = cat(block, new Uint8Array(pad));
    for (let i = 0; i < block.length; i += 16) X = await ecb(key, xor(X, block.slice(i, i + 16)));
  }
  { // payload into MAC
    let block = plaintext;
    const pad = (16 - block.length % 16) % 16;
    if (pad) block = cat(block, new Uint8Array(pad));
    for (let i = 0; i < block.length; i += 16) X = await ecb(key, xor(X, block.slice(i, i + 16)));
  }
  const T = X.slice(0, micLen);
  // --- CTR encryption ---
  const ctrBlock = (i) => { const A = new Uint8Array(16); A[0] = L - 1; A.set(nonce, 1); let c = i; for (let j = 15; j >= 16 - L; j--) { A[j] = c & 0xff; c >>= 8; } return A; };
  const S0 = await ecb(key, ctrBlock(0));
  const mic = xor(T, S0.slice(0, micLen));
  const ct = new Uint8Array(plaintext.length);
  for (let i = 0; i < plaintext.length; i += 16) {
    const S = await ecb(key, ctrBlock(1 + i / 16));
    for (let j = 0; j < 16 && i + j < plaintext.length; j++) ct[i + j] = plaintext[i + j] ^ S[j];
  }
  return { ct, mic, full: cat(ct, mic) };
}
async function ccmDecrypt(keyBytes, nonce, ct, mic, aad = new Uint8Array(0)) {
  const micLen = mic.length, L = 15 - nonce.length;
  const key = await importCbc(keyBytes);
  const ctrBlock = (i) => { const A = new Uint8Array(16); A[0] = L - 1; A.set(nonce, 1); let c = i; for (let j = 15; j >= 16 - L; j--) { A[j] = c & 0xff; c >>= 8; } return A; };
  const pt = new Uint8Array(ct.length);
  for (let i = 0; i < ct.length; i += 16) { const S = await ecb(key, ctrBlock(1 + i / 16)); for (let j = 0; j < 16 && i + j < ct.length; j++) pt[i + j] = ct[i + j] ^ S[j]; }
  // recompute MAC
  const { mic: mic2 } = await ccmEncrypt(keyBytes, nonce, pt, aad, micLen);
  return { pt, ok: eq(mic2, mic) };
}

// ---------- Mesh salt + k-functions ----------
const s1 = (M) => cmac(new Uint8Array(16), M);                 // salt
const s1str = (str) => s1(new TextEncoder().encode(str));
async function k1(N, SALT, P) { const T = await cmac(SALT, N); return cmac(T, P); }
async function k2(N, P) {
  const salt = await s1str('smk2');
  const T = await cmac(salt, N);
  const T1 = await cmac(T, cat(P, h2b('01')));
  const T2 = await cmac(T, cat(T1, P, h2b('02')));
  const T3 = await cmac(T, cat(T2, P, h2b('03')));
  const full = cat(T1, T2, T3);                                 // 48 bytes
  // result = (T1||T2||T3) mod 2^263  -> low 33 bytes with top bit of byte[15] masked
  const k = full.slice(15);                                     // 33 bytes
  const nid = k[0] & 0x7f;
  const enc = k.slice(1, 17);
  const priv = k.slice(17, 33);
  return { nid, enc, priv };
}
async function k3(N) {
  const salt = await s1str('smk3');
  const T = await cmac(salt, N);
  const r = await cmac(T, cat(new TextEncoder().encode('id64'), h2b('01')));
  return r.slice(8);                                            // low 64 bits
}
async function k4(N) {
  const salt = await s1str('smk4');
  const T = await cmac(salt, N);
  const r = await cmac(T, cat(new TextEncoder().encode('id6'), h2b('01')));
  return r[15] & 0x3f;                                          // low 6 bits (AID)
}

module.exports = { h2b, b2h, cat, xor, eq, e, cmac, ccmEncrypt, ccmDecrypt, s1, s1str, k1, k2, k3, k4 };

// ============================ SELF TESTS ============================
if (require.main === module) (async () => {
  let pass = 0, fail = 0;
  const chk = (name, got, want) => { const g = got instanceof Uint8Array ? b2h(got) : got; const w = want instanceof Uint8Array ? b2h(want) : want; if (g === w) { pass++; console.log('  ✓', name); } else { fail++; console.log('  ✗', name, '\n      got ', g, '\n      want', w); } };

  console.log('RFC 4493 — AES-CMAC:');
  const K = h2b('2b7e151628aed2a6abf7158809cf4f3c');
  chk('CMAC len0', await cmac(K, h2b('')), 'bb1d6929e95937287fa37d129b756746');
  chk('CMAC len16', await cmac(K, h2b('6bc1bee22e409f96e93d7e117393172a')), '070a16b46b4d4144f79bdd9dd04a287c');
  chk('CMAC len40', await cmac(K, h2b('6bc1bee22e409f96e93d7e117393172aae2d8a571e03ac9c9eb76fac45af8e5130c81c46a35ce411')), 'dfa66747de9ae63030ca32611497c827');

  console.log('RFC 3610 — AES-CCM (packet vector #1, M=8, L=2):');
  const ck = h2b('c0c1c2c3c4c5c6c7c8c9cacbcccdcecf');
  const nonce = h2b('00000003020100a0a1a2a3a4a5');
  const aad = h2b('0001020304050607');
  const pt = h2b('08090a0b0c0d0e0f101112131415161718191a1b1c1d1e');
  const r = await ccmEncrypt(ck, nonce, pt, aad, 8);
  chk('CCM ct+mic', r.full, '588c979a61c663d2f066d0c2c0f989806d5f6b61dac38417e8d12cfdf926e0');
  const d = await ccmDecrypt(ck, nonce, r.ct, r.mic, aad);
  chk('CCM decrypt ok', d.ok ? 'ok' : 'BAD', 'ok');

  console.log('Mesh Profile §8 — salt & k-functions:');
  chk('s1("test")', await s1str('test'), 'b73cefbd641ef2ea598c2b6efb62f79c');
  chk('k1', await k1(h2b('3216d1509884b533248541792b877f98'), h2b('2ba14ffa0df84a2831938d57d276cab4'), h2b('5a09d60797eeb4478aada59db3352a0d')), 'f6ed15a8934afbe7d83e8dcb57fcf5d7');
  const K2 = await k2(h2b('7dd7364cd842ad18c17c2b820c84c3d6'), h2b('00'));
  chk('k2 NID', K2.nid.toString(16), '68');
  chk('k2 EncryptionKey', K2.enc, '0953fa93e7caac9638f58820220a398e');
  chk('k2 PrivacyKey', K2.priv, '8b84eedec100067d670971dd2aa700cf');
  chk('k3', await k3(h2b('f7a2a44f8e8a8029064f173ddc1e2b00')), 'ff046958233db014');
  chk('k4', (await k4(h2b('3216d1509884b533248541792b877f98'))).toString(16), '38');

  console.log(`\n${fail === 0 ? '✅ ALL PASS' : '❌ ' + fail + ' FAILED'}  (${pass} passed)`);
  process.exit(fail === 0 ? 0 : 1);
})();
