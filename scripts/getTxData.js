const { ethers } = require('ethers');
(async()=>{
  const txHash = process.argv[2];
  if(!txHash){ console.error('Usage: node getTxData.js <TX_HASH>'); process.exit(1); }
  const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC);
  const tx = await provider.getTransaction(txHash);
  if(!tx){ console.error('Transaction not found for', txHash); process.exit(1); }
  console.log('tx.data length:', tx.data.length);
  console.log('tx.data (start 0..200):', tx.data.slice(0,200));
  console.log('tx.data (end -200..end):', tx.data.slice(-200));
  // print full data only if small; otherwise user can copy from console
  // console.log(tx.data);
})();
