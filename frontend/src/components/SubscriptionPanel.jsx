import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config/contract";

export default function SubscriptionPanel({ provider, account }) {
  async function subscribe(planId, price) {
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    const tx = await contract.subscribeNative(planId, { value: ethers.parseEther(price) });
    await tx.wait();
    alert("Suscripción activada!");
  }

  return (
    <div>
      <h2>Planes de Suscripción</h2>
      <button onClick={() => subscribe(0, "1")}>Premium (1 MATIC)</button>
    </div>
  );
}
