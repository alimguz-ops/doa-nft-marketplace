const { ethers } = require('ethers');

(async()=>{
  try {
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC);
    const addr = '0x2910C3Baa8F44F662D2401682FbA7e526Fc37A12';

    // EIP-1967 implementation slot
    const slot = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';

    // usa eth_getStorageAt vía provider.send para compatibilidad
    const implRaw = await provider.send('eth_getStorageAt', [addr, slot, 'latest']);
    console.log('EIP-1967 impl slot raw:', implRaw);

    if (implRaw && implRaw !== '0x' && implRaw !== '0x' + '0'.repeat(64)) {
      const implAddr = '0x' + implRaw.slice(-40);
      console.log('Possible implementation address (EIP-1967):', implAddr);
    } else {
      console.log('No EIP-1967 implementation found (slot empty).');
    }

    const code = await provider.getCode(addr);
    console.log('runtime code length:', code.length);
    console.log('runtime code startsWith 0x3d602d80600a3d3981f3 ? ', code.startsWith('0x3d602d80600a3d3981f3'));
    console.log('runtime code startsWith 0x363d3d373d3d3d363d73 ? ', code.startsWith('0x363d3d373d3d3d363d73'));

  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
