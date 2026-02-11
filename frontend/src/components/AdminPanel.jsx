import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config/contract";

export default function AdminPanel({ provider }) {
  const [name, setName] = useState("");
  const [priceNative, setPriceNative] = useState("");
  const [duration, setDuration] = useState("");

  async function addPlan() {
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    try {
      const tx = await contract.addPlan(
        name,
        ethers.parseEther(priceNative),
        0, // precio ERC20 opcional
        "0x0000000000000000000000000000000000000000", // sin token ERC20
        duration * 24 * 60 * 60 // duración en días
      );
      await tx.wait();
      alert("Plan añadido correctamente!");
    } catch (error) {
      alert("Error al añadir plan: " + error.message);
    }
  }

  return (
    <div style={{ border: "1px solid gold", padding: "20px", marginTop: "20px" }}>
      <h2>Panel de Administración</h2>
      <input type="text" placeholder="Nombre del plan" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="text" placeholder="Precio en MATIC" value={priceNative} onChange={(e) => setPriceNative(e.target.value)} />
      <input type="number" placeholder="Duración en días" value={duration} onChange={(e) => setDuration(e.target.value)} />
      <button onClick={addPlan}>Añadir Plan</button>
    </div>
  );
}
