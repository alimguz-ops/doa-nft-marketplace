const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

(async()=>{
  const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC || 'https://polygon-rpc.com');
  const addr = '0x2910C3Baa8F44F662D2401682FbA7e526Fc37A12';
  const onchain = await provider.getCode(addr);
  console.log('Onchain code length:', onchain.length);
  const onHash = ethers.keccak256(onchain);
  console.log('Onchain keccak:', onHash);

  const artifactsDir = path.join(process.cwd(), 'artifacts', 'contracts');
  const results = [];
  function walk(dir){
    for(const f of fs.readdirSync(dir)){
      const full = path.join(dir,f);
      if(fs.statSync(full).isDirectory()) walk(full);
      else if(f.endsWith('.json')){
        try{
          const j = JSON.parse(fs.readFileSync(full,'utf8'));
          const deployed = (j.deployedBytecode || j.bytecode || '').replace(/^0x/,'');
          if(!deployed) return;
          const deployedHex = '0x' + deployed;
          const h = ethers.keccak256(deployedHex);
          if(h === onHash){
            console.log('MATCH artifact:', full);
            process.exit(0);
          }
          // store some metadata for manual inspection
          results.push({file: full, len: deployed.length, keccak: h});
        }catch(e){}
      }
    }
  }
  walk(artifactsDir);
  console.log('No exact match found among local artifacts. Showing top 10 closest by length difference:');
  results.sort((a,b)=> Math.abs(a.len - onchain.length) - Math.abs(b.len - onchain.length));
  results.slice(0,10).forEach(r=> console.log(r.file, 'len:', r.len, 'keccak:', r.keccak));
  process.exit(0);
})();
