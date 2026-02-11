const express = require("express");
const paypal = require("@paypal/checkout-server-sdk");
const { ethers } = require("ethers");
require("dotenv").config();

const app = express();
app.use(express.json());

// Configuración PayPal
const Environment = paypal.core.SandboxEnvironment; // usar LiveEnvironment en producción
const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_SECRET)
);

// Configuración blockchain
const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAbi = require("./contractAbi.json");
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractAbi, wallet);

// Crear orden PayPal
app.post("/paypal/create-order", async (req, res) => {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [{
      amount: { currency_code: "USD", value: "10.00" } // precio de suscripción
    }]
  });

  try {
    const order = await paypalClient.execute(request);
    res.json({ id: order.result.id });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Capturar pago y sincronizar con contrato
app.post("/paypal/capture-order", async (req, res) => {
  const { orderId, userAddress } = req.body;
  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  try {
    const capture = await paypalClient.execute(request);

    // Aquí sincronizamos con el contrato en blockchain
    const tx = await contract.subscribeERC20(0); // planId = 0 (ejemplo)
    await tx.wait();

    res.json({ status: "success", capture: capture.result });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(3000, () => console.log("Backend PayPal escuchando en puerto 3000"));
