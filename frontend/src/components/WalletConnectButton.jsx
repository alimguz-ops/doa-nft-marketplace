import { useState } from "react";
import { ethers } from "ethers";

export default function WalletConnectButton({ setProvider, setAccount }) {
  const [connected, setConnected] = useState(false);

  async function connectWallet() {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setProvider(provider);
      setAccount(accounts[0]);
      setConnected(true);
    } else {
      alert("Instala Metamask para continuar.");
    }
  }

  return (
    <button onClick={connectWallet}>
      {connected ? "Wallet conectada" : "Conectar Wallet"}
    </button>
  );
}
