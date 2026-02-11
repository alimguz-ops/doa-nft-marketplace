const fs = require('fs');
const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function base58Encode(buffer) {
  let digits = [0];
  for (let i = 0; i < buffer.length; ++i) {
    let carry = buffer[i];
    for (let j = 0; j < digits.length; ++j) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  let str = '';
  for (let k = 0; k < buffer.length && buffer[k] === 0; ++k) str += ALPHABET[0];
  for (let q = digits.length - 1; q >= 0; --q) str += ALPHABET[digits[q]];
  return str;
}
try {
  const hex = fs.readFileSync('onchain_code.hex','utf8').trim();
  const marker = 'a26469706673';
  const idx = hex.indexOf(marker);
  if (idx === -1) { console.log('No se encontró metadata a26469706673'); process.exit(1); }
  const after = hex.slice(idx + marker.length);
  if (after.slice(0,2).toLowerCase() === '58') {
    const len = parseInt(after.slice(2,4),16);
    const dataHex = after.slice(4, 4 + len*2);
    if (dataHex.length < len*2) { console.log('Datos IPFS incompletos'); process.exit(1); }
    const buf = Buffer.from(dataHex,'hex');
    const cid = base58Encode(buf);
    console.log('Found multihash (hex):', '0x' + dataHex);
    console.log('CID (base58):', cid);
    console.log('');
    console.log('Fetch with:');
    console.log('curl "https://ipfs.io/ipfs/' + cid + '" -o downloaded_from_ipfs.txt');
  } else {
    console.log('Formato inesperado tras el marcador. Muestra 200 hex:');
    console.log(after.slice(0,200));
    process.exit(1);
  }
} catch(e) { console.error('Error:', e.message); process.exit(1); }
