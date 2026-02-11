const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

(async()=>{
  const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC || 'https://polygon-rpc.com');
  const addr = '0x2910C3Baa8F44F662D2401682FbA7e526Fc37A12';
  const onchain = (await provider.getCode(addr)).replace(/^0x/,'');
  console.log('Onchain length (hex chars):', onchain.length);

  const artifactsDir = path.join(process.cwd(),'artifacts','contracts');
  const hits = [];
  function walk(dir){
    for(const f of fs.readdirSync(dir)){
      const full = path.join(dir,f);
      if(fs.statSync(full).isDirectory()) walk(full);
      else if(f.endsWith('.json')){
        try{
          const j = JSON.parse(fs.readFileSync(full,'utf8'));
          const deployed = (j.deployedBytecode||j.bytecode||'').replace(/^0x/,'');
          if(!deployed) continue;
          if(onchain.includes(deployed)) hits.push({file:full, type:'deployed inside onchain', deployedLen:deployed.length});
          else if(deployed.includes(onchain)) hits.push({file:full, type:'onchain inside deployed', deployedLen:deployed.length});
        }catch(e){}
      }
    }
  }
  walk(artifactsDir);
  if(hits.length===0) console.log('No substring hits found.');
  else console.log('Hits:', JSON.stringify(hits,null,2));
})();
