// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat');
const config = require('../insultcoin.config');
import { ConfigSchema, validateConfig } from "../lib/validateConfig"
import { PureEthAddress } from '../lib/AddressType'
import parseConfigIntoParams from "../lib/parseConfigIntoParams";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  await hre.run('compile');

  // We get the contract to deploy
  const Deployment = await hre.ethers.getContractFactory('Deployment');

  // return value is a new config, now with all the blanks (optionals) filled in
  // this call throws on error
  let configParsed: ConfigSchema = validateConfig(config)

  try {
    console.log(parseConfigIntoParams(configParsed))
    await Deployment.deploy(...parseConfigIntoParams(configParsed))
  } catch (e) {
    console.error(e);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
