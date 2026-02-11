const fs = require('fs');
const { ethers } = require('ethers');

(async () => {
  try {
    const addr = '0x2910C3Baa8F44F662D2401682FbA7e526Fc37A12';
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC);
    console.log('Fetching on-chain bytecode for', addr);
    const onchain = await provider.getCode(addr);
    console.log('On-chain bytecode length:', onchain.length);

    const artifactPath = './artifacts/contracts/NFTMarketplaceSubscriptions.sol/NFTMarketplaceSubscriptions.json';
    if (!fs.existsSync(artifactPath)) {
      console.error('Artifact not found at', artifactPath);
      process.exit(1);
    }
    const artifact = require(artifactPath);
    const local = artifact.deployedBytecode || artifact.bytecode;
    console.log('Local deployedBytecode length:', local.length);

    const headOn = onchain.slice(0, 200);
    const tailOn = onchain.slice(-200);
    const headLocal = local.slice(0, 200);
    const tailLocal = local.slice(-200);

    console.log('onchain head:', headOn);
    console.log('local head  :', headLocal);
    console.log('onchain tail:', tailOn);
    console.log('local tail  :', tailLocal);

    const keccakOn = ethers.keccak256(onchain);
    const keccakLocal = ethers.keccak256(local);
    console.log('keccak onchain:', keccakOn);
    console.log('keccak local  :', keccakLocal);

    if (keccakOn === keccakLocal) {
      console.log('MATCH: bytecode on-chain coincide con el artifact local.');
    } else {
      console.log('MISMATCH: bytecode NO coincide. Posibles causas: proxy, constructor args, librerías linkeadas, compilador/optimizer distinto, o dirección equivocada.');
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
