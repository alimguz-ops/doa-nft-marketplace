const hre = require("hardhat");

async function main() {
  // Dirección de tu wallet (recibe comisiones y suscripciones)
  const owner = process.env.OWNER_ADDRESS;

  // Configuración inicial de fees
  const listingFee = hre.ethers.utils.parseEther("0.01"); // 0.01 MATIC por listar
  const saleFee = 500; // 5% (base 10000)

  console.log("Deploying NFT Marketplace...");

  const Marketplace = await hre.ethers.getContractFactory("NFTMarketplaceSubscriptions");
  const marketplace = await Marketplace.deploy(listingFee, saleFee);

  await marketplace.deployed();

  console.log("Marketplace deployed to:", marketplace.address);

  // Opcional: añadir planes de suscripción iniciales
  const tx = await marketplace.addPlan(
    "Premium",
    hre.ethers.utils.parseEther("1"), // precio en MATIC
    hre.ethers.utils.parseUnits("10", 6), // precio en USDC (ejemplo)
    process.env.USDC_ADDRESS, // dirección del token USDC en Mumbai
    30 * 24 * 60 * 60 // duración: 30 días
  );
  await tx.wait();

  console.log("Plan Premium añadido.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
