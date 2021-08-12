
import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "solidity-coverage"

let config = require("./insultcoin.config")

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.address);
  }
});


// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10
      }
    }
  },
  networks: config.deployKey ? {
    hardhat: {},
    bsc: {
      url: "https://bsc-dataseed.binance.org/",
      // my contract deployment pkey
      // sshhhh
      accounts: [config.deployKey]
    },
    eth: {
      url: `https://mainnet.infura.io/v3/${config.infura_api_key}`,
      accounts: [config.deployKey]
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${config.infura_api_key}`,
      accounts: [config.deployKey]
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${config.infura_api_key}`,
      accounts: [config.deployKey]
    },
    bsctest: {
      url: `https://data-seed-prebsc-1-s1.binance.org:8545/`,
      accounts: [config.deployKey]
    },
  } : undefined,
}

