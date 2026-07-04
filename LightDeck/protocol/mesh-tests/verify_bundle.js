const M = require('../mesh.js');
const { h2b, b2h } = M;
let pass=0, fail=0; const chk=(n,g,w)=>{const G=g instanceof Uint8Array?b2h(g):g,W=w instanceof Uint8Array?b2h(w):w;G===W?(pass++,console.log('  ✓',n)):(fail++,console.log('  ✗',n,'got',G,'want',W));};
(async()=>{
  const c=M.crypto;
  chk('CMAC', await c.cmac(h2b('2b7e151628aed2a6abf7158809cf4f3c'),h2b('6bc1bee22e409f96e93d7e117393172a')),'070a16b46b4d4144f79bdd9dd04a287c');
  const r=await c.ccmEncrypt(h2b('c0c1c2c3c4c5c6c7c8c9cacbcccdcecf'),h2b('00000003020100a0a1a2a3a4a5'),h2b('08090a0b0c0d0e0f101112131415161718191a1b1c1d1e'),h2b('0001020304050607'),8);
  chk('CCM', r.full,'588c979a61c663d2f066d0c2c0f989806d5f6b61dac38417e8d12cfdf926e0');
  const K2=await c.k2(h2b('7dd7364cd842ad18c17c2b820c84c3d6'),h2b('00')); chk('k2 NID',K2.nid.toString(16),'68');
  chk('k4 AID', (await c.k4(h2b('63964771734fbd76e3b40519d1d94a48'))).toString(16),'26');
  // messaging roundtrip
  const net=await M.net.deriveNet(h2b('7dd7364cd842ad18c17c2b820c84c3d6')); net.ivIndex=0;
  const appKey=h2b('63964771734fbd76e3b40519d1d94a48');
  const pdus=await M.net.encodeAccessMessages({...net,appKey},{appKey,src:1,dst:5,seq:7}, M.net.accOnOff(1,0));
  const d=await M.net.netDecode(pdus[0].slice(1),net); chk('net roundtrip dst', d.dst, 5);
  // provisioning two-party (reuse Provisioner + simulate device)
  const dev=await M.prov.genKeyPair(); const auth=new Uint8Array(16); let ds={};
  const inbox=[]; const prov=new M.prov.Provisioner({netKey:h2b('7dd7364cd842ad18c17c2b820c84c3d6'),unicast:5,emit:b=>inbox.push(b)});
  async function resp(pdu){const op=pdu[0],p=pdu.slice(1),out=[];
    if(op===0){ds.invite=p.slice(0,1);out.push(M.cat(h2b('01'),(ds.caps=h2b('0100010000000000000000'))));}
    else if(op===2){ds.start=p.slice(0,5);}
    else if(op===3){ds.provPub=p.slice(0,64);out.push(M.cat(h2b('03'),dev.pub64));ds.dh=await M.prov.dhKey(dev.priv,ds.provPub);ds.cSalt=await M.crypto.s1(M.prov.confInputs(ds.invite,ds.caps,ds.start,ds.provPub,dev.pub64));ds.cKey=await M.prov.confKey(ds.dh,ds.cSalt);ds.randD=h2b('8b19ac31d58b124c946209b5db1021b9');}
    else if(op===5){ds.confP=p.slice(0,16);out.push(M.cat(h2b('05'),await M.prov.confirmation(ds.cKey,ds.randD,auth)));}
    else if(op===6){ds.randP=p.slice(0,16);out.push(M.cat(h2b('06'),ds.randD));}
    else if(op===7){const ps=await M.prov.provSalt(ds.cSalt,ds.randP,ds.randD);ds.devKey=await M.prov.devKeyFn(ds.dh,ps);out.push(h2b('08'));}
    return out;}
  await prov.begin(); for(let g=0;g<20&&inbox.length;g++){const r2=await resp(inbox.shift());for(const x of r2)await prov.onPDU(x);}
  const res=await prov.finished();
  chk('provisioning devkey match', b2h(prov.devKey), b2h(ds.devKey));
  console.log(`\n${fail===0?'✅ BUNDLE VERIFIED':'❌ '+fail+' FAILED'} (${pass} passed)`);
  process.exit(fail?1:0);
})();
