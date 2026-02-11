const express = require("express");
const paypal = require("@paypal/checkout-server-sdk");
const router = express.Router();

// Configuración PayPal
const Environment = paypal.core.SandboxEnvironment; // usar LiveEnvironment en producción
const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_SECRET)
);

// Crear orden
router.post("/create-order", async (req, res) => {
  const { amount } = req.body; // monto dinámico
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [{ amount: { currency_code: "USD", value: amount } }]
  });

  try {
    const order = await paypalClient.execute(request);
    res.json({ id: order.result.id });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Capturar orden
router.post("/capture-order", async (req, res) => {
  const { orderId } = req.body;
  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  try {
    const capture = await paypalClient.execute(request);
    res.json({ status: "success", capture: capture.result });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
