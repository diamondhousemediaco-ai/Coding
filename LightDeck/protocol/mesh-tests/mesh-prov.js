// mesh-prov.js — PB-GATT provisioner (algorithm 0x00: P-256 / AES-CMAC / AES-CCM, No-OOB).
// Derivations confirmed against Zephyr subsys/bluetooth/mesh/crypto.c.
'use strict';
const C = require('./mesh-crypto.js');
const { h2b, b2h, cat, eq, cmac, s1, k1, ccmEncrypt, ccmDecrypt } = C;
const _c = (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) ? globalThis.crypto : require('crypto').webcrypto;
const subtle = _c.subtle;

// ---- ECDH P-256 (Web Crypto) ----
async function genKeyPair() {
  const kp = await subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const raw = new Uint8Array(await subtle.exportKey('raw', kp.publicKey)); // 0x04||X||Y (65)
  return { priv: kp.privateKey, pub64: raw.slice(1) };                     // X||Y (64)
}
async function dhKey(privKey, peerPub64) {
  const peer = await subtle.importKey('raw', cat(h2b('04'), peerPub64), { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const bits = await subtle.deriveBits({ name: 'ECDH', public: peer }, privKey, 256);
  return new Uint8Array(bits);                                             // 32-byte X coord = mesh DHKey
}
async function k1str(N, salt, label) { return k1(N, salt, new TextEncoder().encode(label)); }

// ---- derivations ----
const confInputs = (invite, caps, start, pubP, pubD) => cat(invite, caps, start, pubP, pubD); // 1+11+5+64+64=145
const confSalt = (inputs) => s1(inputs);
const confKey = (dh, cSalt) => k1str(dh, cSalt, 'prck');
const confirmation = (cKey, rand, auth) => cmac(cKey, cat(rand, auth));
const provSalt = (cSalt, randP, randD) => cmac(new Uint8Array(16), cat(cSalt, randP, randD));
const sessionKey = (dh, pSalt) => k1str(dh, pSalt, 'prsk');
async function sessionNonce(dh, pSalt) { return (await k1str(dh, pSalt, 'prsn')).slice(3); } // last 13
const devKey = (dh, pSalt) => k1str(dh, pSalt, 'prdk');

// provisioning data (25) = NetKey(16)|KeyIdx(2)|Flags(1)|IVIndex(4)|Unicast(2), CCM mic 8
function provDataPlain({ netKey, keyIndex = 0, flags = 0, ivIndex = 0, unicast }) {
  return cat(netKey, new Uint8Array([keyIndex >> 8, keyIndex & 0xff, flags,
    (ivIndex >>> 24) & 0xff, (ivIndex >> 16) & 0xff, (ivIndex >> 8) & 0xff, ivIndex & 0xff,
    unicast >> 8, unicast & 0xff]));
}

// PDU opcodes
const PDU = { INVITE: 0x00, CAPS: 0x01, START: 0x02, PUBKEY: 0x03, CONFIRM: 0x05, RANDOM: 0x06, DATA: 0x07, COMPLETE: 0x08, FAILED: 0x09 };

// ---- Provisioner state machine ----
// emit(bytes): send a provisioning PDU payload (opcode already prepended) over the bearer.
// Returns a result object once COMPLETE.
class Provisioner {
  constructor({ netKey, unicast, provisionerAddr = 0x0001, keyIndex = 0, ivIndex = 0, emit, log = () => {} }) {
    Object.assign(this, { netKey, unicast, provisionerAddr, keyIndex, ivIndex, emit, log });
    this.invite = new Uint8Array([0x00]);   // attention 0
    this.start = h2b('0000000000');          // algo0, no-oob pubkey, no-oob auth, action0, size0
    this.auth = new Uint8Array(16);          // No-OOB auth value = zeros
  }
  async begin() { this.kp = await genKeyPair(); this.log('→ Invite'); this.emit(new Uint8Array([PDU.INVITE, ...this.invite])); this.state = 'caps'; }
  async onPDU(pdu) {
    const op = pdu[0], p = pdu.slice(1);
    if (op === PDU.CAPS) {
      this.caps = p.slice(0, 11); this.log('← Capabilities ' + b2h(this.caps));
      this.emit(new Uint8Array([PDU.START, ...this.start]));
      this.log('→ Start'); this.emit(new Uint8Array([PDU.PUBKEY, ...this.kp.pub64]));
      this.log('→ PublicKey'); this.state = 'devpub';
    } else if (op === PDU.PUBKEY) {
      this.devPub = p.slice(0, 64); this.log('← Device PublicKey');
      this.dh = await dhKey(this.kp.priv, this.devPub);
      const inputs = confInputs(this.invite, this.caps, this.start, this.kp.pub64, this.devPub);
      this.cSalt = await confSalt(inputs);
      this.cKey = await confKey(this.dh, this.cSalt);
      this.randP = _c.getRandomValues(new Uint8Array(16));
      const confP = await confirmation(this.cKey, this.randP, this.auth);
      this.log('→ Confirmation'); this.emit(new Uint8Array([PDU.CONFIRM, ...confP])); this.state = 'devconf';
    } else if (op === PDU.CONFIRM) {
      this.confD = p.slice(0, 16); this.log('← Device Confirmation');
      this.log('→ Random'); this.emit(new Uint8Array([PDU.RANDOM, ...this.randP])); this.state = 'devrand';
    } else if (op === PDU.RANDOM) {
      this.randD = p.slice(0, 16); this.log('← Device Random');
      const check = await confirmation(this.cKey, this.randD, this.auth);
      if (!eq(check, this.confD)) throw new Error('device confirmation mismatch — provisioning aborted');
      this.pSalt = await provSalt(this.cSalt, this.randP, this.randD);
      this.sKey = await sessionKey(this.dh, this.pSalt);
      this.sNonce = await sessionNonce(this.dh, this.pSalt);
      this.devKey = await devKey(this.dh, this.pSalt);
      const plain = provDataPlain({ netKey: this.netKey, keyIndex: this.keyIndex, flags: 0, ivIndex: this.ivIndex, unicast: this.unicast });
      const { full } = await ccmEncrypt(this.sKey, this.sNonce, plain, new Uint8Array(0), 8);
      this.log('→ Provisioning Data (encrypted)'); this.emit(new Uint8Array([PDU.DATA, ...full])); this.state = 'complete';
    } else if (op === PDU.COMPLETE) {
      this.log('← Complete ✓'); this.done = { devKey: this.devKey, unicast: this.unicast, netKey: this.netKey };
      if (this.resolve) this.resolve(this.done);
    } else if (op === PDU.FAILED) {
      throw new Error('device sent Provisioning Failed, code 0x' + b2h(p));
    }
  }
  finished() { return new Promise(res => { this.resolve = res; if (this.done) res(this.done); }); }
}

module.exports = { genKeyPair, dhKey, confInputs, confSalt, confKey, confirmation, provSalt, sessionKey, sessionNonce, devKey, provDataPlain, Provisioner, PDU };

// ============================ SELF TEST: full two-party provisioning ============================
if (require.main === module) (async () => {
  let pass = 0, fail = 0; const chk = (n, c) => { c ? (pass++, console.log('  ✓', n)) : (fail++, console.log('  ✗', n)); };

  // Simulated device that follows the protocol (acts like the K60).
  const devKp = await genKeyPair();
  const auth = new Uint8Array(16);
  let devState = {};
  const netKey = h2b('7dd7364cd842ad18c17c2b820c84c3d6');
  const unicast = 0x0005;

  const inbox = [];  // PDUs provisioner -> device
  const prov = new Provisioner({ netKey, unicast, emit: b => inbox.push(b), log: m => console.log('   P', m) });

  // device handler: given provisioner PDU, produce device response PDU(s)
  async function deviceRespond(pdu) {
    const op = pdu[0], p = pdu.slice(1); const out = [];
    if (op === 0x00) { devState.invite = p.slice(0, 1); out.push(cat(h2b('01'), (devState.caps = h2b('0100010000000000000000')))); } // caps: 1 elem, algo bit0
    else if (op === 0x02) { devState.start = p.slice(0, 5); }
    else if (op === 0x03) {
      devState.provPub = p.slice(0, 64);
      out.push(cat(h2b('03'), devKp.pub64));
      devState.dh = await dhKey(devKp.priv, devState.provPub);
      const inputs = confInputs(devState.invite, devState.caps, devState.start, devState.provPub, devKp.pub64);
      devState.cSalt = await confSalt(inputs);
      devState.cKey = await confKey(devState.dh, devState.cSalt);
      devState.randD = h2b('8b19ac31d58b124c946209b5db1021b9'); // fixed for reproducibility
    }
    else if (op === 0x05) { devState.confP = p.slice(0, 16); const confD = await confirmation(devState.cKey, devState.randD, auth); out.push(cat(h2b('05'), confD)); }
    else if (op === 0x06) {
      devState.randP = p.slice(0, 16);
      const checkP = await confirmation(devState.cKey, devState.randP, auth);
      chk('device verifies provisioner confirmation', eq(checkP, devState.confP));
      out.push(cat(h2b('06'), devState.randD));
    }
    else if (op === 0x07) {
      const pSalt = await provSalt(devState.cSalt, devState.randP, devState.randD);
      const sKey = await sessionKey(devState.dh, pSalt);
      const sNonce = await sessionNonce(devState.dh, pSalt);
      const dk = await devKey(devState.dh, pSalt);
      const enc = p.slice(0, 25), mic = p.slice(25, 33);
      const { pt, ok } = await ccmDecrypt(sKey, sNonce, enc, mic, new Uint8Array(0));
      chk('device decrypts provisioning data', ok);
      chk('device recovers NetKey', b2h(pt.slice(0, 16)) === b2h(netKey));
      chk('device recovers unicast 0x0005', ((pt[23] << 8) | pt[24]) === unicast);
      devState.devKey = dk;
      out.push(h2b('08')); // Complete
    }
    return out;
  }

  await prov.begin();
  // pump the exchange
  for (let guard = 0; guard < 20 && inbox.length; guard++) {
    const pdu = inbox.shift();
    const responses = await deviceRespond(pdu);
    for (const r of responses) await prov.onPDU(r);
  }
  const result = await prov.finished();
  chk('provisioner completed', !!result);
  chk('provisioner & device derived SAME DevKey', b2h(prov.devKey) === b2h(devState.devKey));
  console.log('   DevKey =', b2h(prov.devKey));

  console.log(`\n${fail === 0 ? '✅ ALL PASS' : '❌ ' + fail + ' FAILED'}  (${pass} passed)`);
  process.exit(fail === 0 ? 0 : 1);
})();
