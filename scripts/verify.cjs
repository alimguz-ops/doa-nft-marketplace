// scripts/verify.js
const hre = require("hardhat");

async function main() {
  // Dirección del contrato desplegado
  const contractAddress = process.env.CONTRACT_ADDRESS;

  // Argumentos del constructor (si tu contrato los requiere)
  // Ejemplo: ["DOA Token V2", "DOA"]
  const constructorArgs = process.env.CONSTRUCTOR_ARGS
    ? JSON.parse(process.env.CONSTRUCTOR_ARGS)
    : [];

  if (!contractAddress) {
    throw new Error("Debes definir CONTRACT_ADDRESS en tu .env");
  }

  console.log(`Verificando contrato en ${hre.network.name}...`);
  console.log(`Dirección: ${contractAddress}`);
  console.log(`Args: ${constructorArgs}`);

  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArgs,
    });
    console.log("✅ Verificación completada");
  } catch (err) {
    console.error("❌ Error en la verificación:", err);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
