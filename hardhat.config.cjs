require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,   // activa optimización
        runs: 200        // número de ejecuciones
      }
    }
  },
  networks: {
    polygon: {
      url: process.env.POLYGON_RPC || "https://polygon-rpc.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      sepolia: process.env.SEPOLIA_API_KEY || ""
    }
  }
};
