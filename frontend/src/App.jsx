import { useState } from "react";
import WalletConnectButton from "./components/WalletConnectButton";
import SubscriptionPanel from "./components/SubscriptionPanel";
import MarketplaceGallery from "./components/MarketplaceGallery";
import ListNFTForm from "./components/ListNFTForm";
import AdminPanel from "./components/AdminPanel";

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);

  // Dirección del OWNER (tu wallet)
  const OWNER_ADDRESS = "0x97bef44a9986f64360a295aaf741d6fdd05efba1";

  return (
    <div style={{ backgroundColor: "black", color: "gold", minHeight: "100vh", padding: "20px" }}>
      <h1>DOA NFT Marketplace</h1>
      
      {/* Botón conectar wallet */}
      <WalletConnectButton setProvider={setProvider} setAccount={setAccount} />
      
      {/* Mostrar wallet conectada */}
      {account && <p>Wallet conectada: {account}</p>}
      
      {/* Panel de suscripciones */}
      {provider && <SubscriptionPanel provider={provider} account={account} />}
      
      {/* Galería NFT con botón de compra */}
      <MarketplaceGallery provider={provider} />
      
      {/* Formulario para listar NFTs */}
      {provider && <ListNFTForm provider={provider} />}
      
      {/* Panel de administración solo visible para OWNER */}
      {provider && account === OWNER_ADDRESS && <AdminPanel provider={provider} />}
    </div>
  );
}

export default App;
