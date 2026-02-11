const express = require("express");
const { ethers } = require("ethers");
const router = express.Router();

const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAbi = require("../contractAbi.json");
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractAbi, wallet);

// Suscripción en cripto
router.post("/subscribe", async (req, res) => {
  const { planId, userAddress } = req.body;
  try {
    const tx = await contract.subscribeNative(planId, { value: ethers.parseEther("1") }); // ejemplo
    await tx.wait();
    res.json({ status: "success", txHash: tx.hash });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Comprar NFT
router.post("/buy-nft", async (req, res) => {
  const { listingId, price } = req.body;
  try {
    const tx = await contract.buyNFT(listingId, { value: ethers.parseEther(price) });
    await tx.wait();
    res.json({ status: "success", txHash: tx.hash });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
