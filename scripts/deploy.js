// scripts/deploy.js
import hre from "hardhat";

async function main() {
  const listingFee = hre.ethers.utils.parseEther("0.01");
  const saleFee = 500;

  const Marketplace = await hre.ethers.getContractFactory("NFTMarketplaceSubscriptions");
  const marketplace = await Marketplace.deploy(listingFee, saleFee);

  await marketplace.deployed();
  console.log("NFTMarketplaceSubscriptions desplegado en:", marketplace.address);

  // Ejemplo: añadir planes iniciales
  const usdcAddress = "0x..."; // dirección USDC en Polygon
  await marketplace.addPlan(
    "Basico",
    hre.ethers.utils.parseEther("0.01"),
    hre.ethers.utils.parseUnits("3", 6),
    usdcAddress,
    30 * 24 * 60 * 60
  );
  console.log("Plan Básico añadido");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
