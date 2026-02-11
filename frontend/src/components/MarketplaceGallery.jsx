import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config/contract";

export default function MarketplaceGallery({ provider }) {
  const nfts = [
    { id: 0, name: "NFT #1", price: "0.5", image: "https://via.placeholder.com/200" },
    { id: 1, name: "NFT #2", price: "1", image: "https://via.placeholder.com/200" }
  ];

  async function buyNFT(listingId, price) {
    if (!provider) {
      alert("Conecta tu wallet primero.");
      return;
    }
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    try {
      const tx = await contract.buyNFT(listingId, { value: ethers.parseEther(price) });
      await tx.wait();
      alert(`Compra realizada: NFT #${listingId}`);
    } catch (error) {
      alert("Error en la compra: " + error.message);
    }
  }

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      {nfts.map((nft) => (
        <div key={nft.id} style={{ border: "1px solid gold", padding: "10px" }}>
          <img src={nft.image} alt={nft.name} />
          <h3>{nft.name}</h3>
          <p>Precio: {nft.price} MATIC</p>
          <button onClick={() => buyNFT(nft.id, nft.price)}>Comprar</button>
        </div>
      ))}
    </div>
  );
}
