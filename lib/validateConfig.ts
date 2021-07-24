import { BigNumber, BigNumberish, ethers } from "ethers";
import { PureEthAddress } from './AddressType'
import { privateToAddress } from 'ethereumjs-util'

let Legalize = require("legalize")

export interface ConfigSchema {
    infura_api_key: string,
    name: string,
    symbol: string,
    totalSupply: BigNumberish,
    deployKey: string,
    timelock?: {
        enabled: boolean,
        minDelay: BigNumberish,
        proposers: PureEthAddress[],
        executors: PureEthAddress[]
    },
    roles?: {
        owner?: PureEthAddress,
        wordKeeper?: PureEthAddress,
        fundManager?: PureEthAddress,
        minters?: PureEthAddress[],
        moderators?: PureEthAddress[]
    },
    tokenomics?: {
        funderSupply?: BigNumberish,
        vesting?: {
            enabled: boolean,
            cliff: BigNumberish,
            duration: BigNumberish
        },
        ico?: {
            enabled: boolean,
            amount: BigNumberish|"remainder",
            rate: BigNumberish
        }
    }
}

export function validateConfig(config: ConfigSchema) {
    try {

        // Roles
        if (!config.roles) config.roles = {}
        if (!config.roles.owner) config.roles.owner = new PureEthAddress(privateToAddress(Buffer.from(config.deployKey, 'utf8')).toString())
        if (!config.roles.wordKeeper) config.roles.wordKeeper = config.roles.owner
        if (!config.roles.fundManager) config.roles.fundManager = config.roles.owner
        if (!config.roles.minters) config.roles.minters = [config.roles.owner]
        if (!config.roles.moderators) config.roles.moderators = [config.roles.owner]

        if (!config.timelock) config.timelock = {
            enabled: true,
            minDelay: 3600,
            executors: [
                new PureEthAddress("0")
            ],
            proposers: [
                config.roles.owner,
            ]
        }

        if (!config.tokenomics) config.tokenomics = {
            funderSupply: BigNumber.from("92000000000000000000000000"),
            vesting: {
                enabled: false,
                cliff: BigNumber.from("0"),
                duration: BigNumber.from("31556952") // 1 year
            },
            ico: {
                enabled: false,
                amount: "remainder",
                rate: 1000
            }
        }
        if (!config.tokenomics.funderSupply) config.tokenomics.funderSupply = BigNumber.from(0)
        if (!config.tokenomics.vesting) config.tokenomics.vesting = {
            enabled: false,
            cliff: BigNumber.from("0"),
            duration: BigNumber.from("31556952") // 1 year
        }
        if (!config.tokenomics.ico) {
            config.tokenomics.ico = {
                amount: "remainder",
                enabled: true,
                rate: 1000,
            }
        }
        

        if (BigNumber.from(config.tokenomics.funderSupply).gt(config.totalSupply)) {
            throw "Config: tokenomics.funderSupply bigger than totalSupply"
        }
        if (config.tokenomics.ico.amount == "remainder") {
            config.tokenomics.ico.amount = BigNumber.from(config.totalSupply).sub(config.tokenomics.funderSupply)
        }
        
        if (BigNumber.from(config.tokenomics.ico.amount).gt(BigNumber.from(config.totalSupply).sub(config.tokenomics.funderSupply))) {
            throw "Config: tokenomics.ico.amount bigger than remainder left (totalSupply - tokenomics.funderSupply)"
        }

        return config
    } catch(e) {
        console.warn("Config: Validation unsuccessful, please check out your config for mistakes!")
        throw e
    }
}

export default validateConfig;