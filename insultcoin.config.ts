const { ethers } = require("ethers")
import {validateConfig, ConfigSchema} from "./lib/validateConfig"
import EthAddress from "./lib/AddressType"

require("dotenv").config()

/*
FAQ
===========

I want to mint myself some tokens at the start! How do I do that?
--- Change the option "tokenomics.funderStarts" to a value you like, such as 1000.


How do I put some of the tokens in a vesting contract thingy?
--- Set "tokenomics.vesting.enabled" to true, and make sure you have "tokenomics.funderStarts"
    as a value you like.


I want to test it/deploy it on a network, how?
--- If you're using one of the networks below, then tada! Shorthand forms
    have already been made!

    * Local Development: npm test/npm run deploy-rpc
    * Ethereum Mainnet: npm run deploy-mainnet
    * Ethereum Ropsten Testnet: npm run deploy-ropsten
    * Ethereum Rinkeby Testnet: npm run deploy-rinkeby
    * Binance Smart Chain Mainnet: npm run deploy-bsc
    * BSC Testnet: npm run deploy-bsctest
    
    If it's not listed there, you have to write the normal command to connect with
    that node over JSON-RPC.
    Run the command below and replace <BLOCKCHAIN_NODE_URI> with your blockchain node.
    An example of such is Infura (https://mainnet.infura.io/v3/$API_KEY_HERE)
        > npx hardhat run --network <BLOCKCHAIN_NODE_URI> scripts/deploy.js
    Make sure you trust this node!
*/

let config: ConfigSchema = {
    // Infura API Key
    // This is for deploying it to a supported network.
    // Keep this safe, and don't commit it to GitHub!
    infura_api_key: process.env.INFURA_KEY,
    
    // Metadata
    name: "InsultCoin",
    symbol: "INSULT",
    totalSupply: "23000000000000000000000000",

    // A timelock controller prevents the "owner" user from wrecking
    // things too quickly. It delays execution for a specified
    // amount of time, allowing the community to react.
    // More info: https://docs.openzeppelin.com/contracts/4.x/api/governance#TimelockController
    timelock: {
        // If timelock is enabled, the timelock will get the
        // "owner" role for all of the smart contracts here,
        // and the owner role will be ignored.
        //
        // NOTE: The roles.owner value will NOT automatically become
        // a proposer, but can be added with: new EthAddress("owner address here").
        enabled: true,

        // The amount of seconds until a proposal can be executed.
        // This may not be hyper accurate (~5 mins max difference),
        // as the EVM does not have a central time system.
        minDelay: 3600,

        // The proposers. These people can create "proposals",
        // transactions which get delayed for minDelay seconds.
        // You need to super-duper-trust these people!
        proposers: [
            new EthAddress("0x6Df36b3718a18795f75f3b094432c0D755789d72")
        ],

        // The executors. They can call the execute() function,
        // which causes a proposal to be executed.
        // It's safe to allow everyone to do this (by setting to 0x0)
        executors: [
            new EthAddress("0")
        ],
    },

    // The private key to deploy the contracts from.
    // You should use environment variables and NEVER commit it to repos.
    deployKey: process.env.PKEY,

    roles: {
        // Initially gets all roles and DEFAULT_ADMIN_ROLE. Keep this address safe!
        owner: new EthAddress("0x6Df36b3718a18795f75f3b094432c0D755789d72"),

        // Most financial things go to this role
        // This is the recipient of the initial dev amount (if specified),
        // can withdraw ETH from the ICO contract, etc.
        // NOTE: The fund manager is NOT a minter by default. Add them in the minter list.
        fundManager: new EthAddress("0x6Df36b3718a18795f75f3b094432c0D755789d72"),

        /*
        INCREDIBLY OP ROLES, DO NOT GRANT TO RANDOM PEOPLE
        ========================
        Make sure you trust who has these roles, they can make or break your token.
        
        Minters: Can mint unlimited INSULT, causing huge price fluctuation
        Moderators: Can censor and block any address they want
        */

        // Minters: allows member to mint coins.
        minters: [
            //new EthAddress("0x6Df36b3718a18795f75f3b094432c0D755789d72")
        ],
        // Moderators: block certain addresses from transacting.
        moderators: [
            //new EthAddress("0x6Df36b3718a18795f75f3b094432c0D755789d72")
        ],
    },

    tokenomics: {
        // The fund manager gets this amount at the beginning.
        // Remember to add 18 decimals after your number.
        // MAY be a string, an ethers.BigNumber, a JS BigNumber or a number.
        // (Note that if using number, you may have issues with the 64-bit limit,
        // EVM platforms like Ethereum use 256 bit numbers. Use strings.)
        funderSupply: "6900000000000000000000000",

        /*
        Vesting is where it gradually pays the devs a fixed amount of tokens (funderStarts in this case)
        over time, until the duration date.
        This is to keep the devs and community's interests aligned, to protect the
        community against pump-and-dump, LP drain, etc.
        A normal vest duration for most projects is ~1-3 years.

        Note that the Fund Manager role is automatically the receiver of vesting.
        */

        vesting: {
            enabled: true,

            // The cliff (how long in seconds after deployment will it start vesting?)
            // Defaults to 0 seconds
            cliff: "0",

            // The duration (how long in seconds will it be vesting for?)
            // Defaults to 1 year
            duration: "31556952",
        },

        // Auto-ICO: Create an ICO smart contract?
        ico: {
            enabled: true,
            // Amount may be the string "remainder" OR any value that can be coerced into
            // an ethers.BigNumber. If set to remainder, it will subtract the amount received
            // by the fund manager from the total supply, and then put them up for sale.
            amount: "remainder",

            // Rate: how many tokens per native token?
            // Change this based on your blockchain.
            rate: 1000
        }
    }
}

// Validate the config

try {
    validateConfig(config)
} catch(e) {
    throw e
}
module.exports = config