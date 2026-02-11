// scripts/verifyMarketplace.js
const { run } = require("hardhat");

async function main() {
  // Dirección del contrato ya desplegado en Polygon
  const contractAddress = "0x2910C3Baa8F44F662D2401682FbA7e526Fc37A12";

  // Argumentos del constructor usados en el deploy
  const constructorArgs = [
    "10000000000000000", // listingFee
    "500"                // saleFee
  ];

  console.log("Verificando contrato en Polygonscan...");

  await run("verify:verify", {
    address: contractAddress,
    constructorArguments: constructorArgs,
    contract: "contracts/NFTMarketplaceSubscriptions.sol:NFTMarketplaceSubscriptions"
  });

  console.log("Verificación enviada correctamente.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
