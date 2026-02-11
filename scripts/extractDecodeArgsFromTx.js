const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

(async()=>{
  const txHash = process.argv[2];
  if(!txHash){ console.error('Usage: node extractDecodeArgsFromTx.js <TX_HASH>'); process.exit(1); }

  const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC);
  const tx = await provider.getTransaction(txHash);
  if(!tx){ console.error('Transaction not found for', txHash); process.exit(1); }

  const txData = tx.data.startsWith('0x') ? tx.data.slice(2) : tx.data;
  console.log('tx.data length:', tx.data.length);

  // ruta absoluta al artifact usando cwd
  const artifactPath = path.join(process.cwd(), 'artifacts', 'contracts', 'NFTMarketplaceSubscriptions.sol', 'NFTMarketplaceSubscriptions.json');
  if(!fs.existsSync(artifactPath)){
    console.error('Artifact not found at', artifactPath);
    process.exit(1);
  }

  // leer el JSON directamente para evitar resolver módulos con PnP
  const artifactRaw = fs.readFileSync(artifactPath, 'utf8');
  const artifact = JSON.parse(artifactRaw);

  const creationBytecode = (artifact.bytecode || '').replace(/^0x/,'');
  const deployedBytecode = (artifact.deployedBytecode || '').replace(/^0x/,'');
  console.log('artifact.bytecode length:', creationBytecode.length);
  console.log('artifact.deployedBytecode length:', deployedBytecode.length);

  let argsHex = null;

  if(creationBytecode && txData.startsWith(creationBytecode)){
    argsHex = txData.slice(creationBytecode.length);
    console.log('Found creationBytecode as prefix; extracted argsHex by removing creation bytecode prefix.');
  } else if(deployedBytecode && txData.endsWith(deployedBytecode)){
    argsHex = txData.slice(0, txData.length - deployedBytecode.length);
    console.log('Fallback: removed deployedBytecode from tx.data end; remaining assumed args.');
  } else {
    console.log('Could not match artifact.bytecode as prefix nor deployedBytecode as suffix.');
    console.log('Will attempt to heuristically take the last 1024 hex chars as candidate args.');
    argsHex = txData.slice(-1024);
  }

  if(!argsHex || argsHex.length === 0){
    console.error('No constructor args found (argsHex empty).');
    process.exit(1);
  }

  argsHex = argsHex.replace(/^0+/, '');
  console.log('argsHex (preview, first/last 200 chars):', argsHex.slice(0,200), '...', argsHex.slice(-200));

  const constructorAbi = artifact.abi.find(x => x.type === 'constructor') || { inputs: [] };
  const types = constructorAbi.inputs.map(i => i.type);
  console.log('Constructor types inferred from ABI:', types);

  if(types.length === 0){
    console.log('Constructor has no inputs according to ABI; printing argsHex for manual use.');
    console.log('argsHex:', argsHex);
    process.exit(0);
  }

  try {
    const decoded = ethers.AbiCoder.defaultAbiCoder.decode(types, '0x' + argsHex);
    console.log('Decoded constructor args:');
    const out = [];
    for (let idx = 0; idx < constructorAbi.inputs.length; idx++) {
      const inp = constructorAbi.inputs[idx];
      const val = decoded[idx];
      let printable = val;
      if (val && typeof val === 'object' && val._isBigNumber) printable = val.toString();
      console.log('#' + idx + ' ' + (inp.name || '') + ' (' + inp.type + '):', printable);
      out.push(printable);
    }
    console.log('Array for scripts/args.js (JSON):', JSON.stringify(out));
  } catch(e){
    console.error('Error decoding args. Possibly mismatched types or argsHex extraction failed.');
    console.error(e);
    console.log('argsHex (for manual decoding):', argsHex);
    process.exit(1);
  }
})();
