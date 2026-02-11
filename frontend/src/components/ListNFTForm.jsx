import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config/contract";

export default function ListNFTForm({ provider }) {
  const [nftAddress, setNftAddress] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [price, setPrice] = useState("");

  async function listNFT() {
    if (!provider) {
      alert("Conecta tu wallet primero.");
      return;
    }
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    try {
      // Convertir precio a wei (MATIC)
      const tx = await contract.listNFT(
        nftAddress,
        tokenId,
        ethers.parseEther(price),
        { value: ethers.parseEther("0.01") } // comisión fija de listado
      );
      await tx.wait();
      alert(`NFT listado: ${tokenId} en contrato ${nftAddress}`);
    } catch (error) {
      alert("Error al listar NFT: " + error.message);
    }
  }

  return (
    <div style={{ border: "1px solid gold", padding: "20px", marginTop: "20px" }}>
      <h2>Listar NFT</h2>
      <input
        type="text"
        placeholder="Dirección del contrato NFT"
        value={nftAddress}
        onChange={(e) => setNftAddress(e.target.value)}
      />
      <input
        type="text"
        placeholder="Token ID"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Precio en MATIC"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <button onClick={listNFT}>Listar NFT</button>
    </div>
  );
}
