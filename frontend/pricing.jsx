<section class="pricing">
  <h2>Planes de Suscripción – Marketplace NFT</h2>
  <div class="plans">

    <!-- Plan Básico -->
    <div class="plan">
      <h3>Básico</h3>
      <p>Ideal para empezar</p>
      <ul>
        <li>Pago en USDC: 3 USDC → 3 NFTs/mes</li>
        <li>Pago en PayPal: 3 USD → 3 NFTs/mes</li>
        <li>Pago en DOA: 3 USDC eq. → <strong>5 NFTs/mes + descuento automático</strong></li>
      </ul>
      <button>Suscribirse</button>
    </div>

    <!-- Plan Estándar -->
    <div class="plan">
      <h3>Estándar</h3>
      <p>Más flexibilidad</p>
      <ul>
        <li>Pago en USDC: 5 USDC → 5 NFTs/mes</li>
        <li>Pago en PayPal: 5 USD → 5 NFTs/mes</li>
        <li>Pago en DOA: 5 USDC eq. → <strong>7 NFTs/mes + prioridad en listados</strong></li>
      </ul>
      <button>Suscribirse</button>
    </div>

    <!-- Plan Premium -->
    <div class="plan featured">
      <h3>Premium</h3>
      <p>Para creadores activos</p>
      <ul>
        <li>Pago en USDC: 15 USDC → 15 NFTs/mes</li>
        <li>Pago en PayPal: 15 USD → 15 NFTs/mes</li>
        <li>Pago en DOA: 15 USDC eq. → <strong>20 NFTs/mes + recompensas DAO + promoción destacada</strong></li>
      </ul>
      <button>Suscribirse</button>
    </div>

    <!-- Plan Enterprise -->
    <div class="plan">
      <h3>Enterprise</h3>
      <p>Máxima exposición</p>
      <ul>
        <li>Pago en USDC: 30 USDC → 30 NFTs/mes</li>
        <li>Pago en PayPal: 30 USD → 30 NFTs/mes</li>
        <li>Pago en DOA: 30 USDC eq. → <strong>40 NFTs/mes + acceso a gobernanza DAO + distribución automática de beneficios</strong></li>
      </ul>
      <button>Suscribirse</button>
    </div>

  </div>
</section>

<style>
  .pricing {
    text-align: center;
    padding: 50px;
    background: #f9f9f9;
    font-family: Arial, sans-serif;
  }
  .plans {
    display: flex;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;
  }
  .plan {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 20px;
    width: 250px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
  .plan.featured {
    border: 2px solid gold;
    box-shadow: 0 6px 10px rgba(0,0,0,0.15);
  }
  .plan h3 {
    margin-top: 0;
    color: #333;
  }
  .plan ul {
    list-style: none;
    padding: 0;
  }
  .plan ul li {
    margin: 10px 0;
  }
  .plan button {
    background: #333;
    color: #fff;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
  }
  .plan button:hover {
    background: #555;
  }
</style>
