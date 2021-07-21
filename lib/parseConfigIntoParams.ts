import { ConfigSchema } from './validateConfig'

export default function(config: ConfigSchema) {
    return [
        config.name,
        config.symbol,
        config.totalSupply,
        config.tokenomics.funderSupply,
        {
            enabled: config.timelock.enabled,
            minDelay: config.timelock.minDelay,
            proposers: config.timelock.proposers.map(a => a.get()),
            executors: config.timelock.executors.map(a => a.get()),
        },
        {
            owner: config.roles.owner.get(),
            wordKeeper: config.roles.wordKeeper.get(),
            fundManager: config.roles.fundManager.get(),
            minters: config.roles.minters.map(a => a.get()),
            moderators: config.roles.moderators.map(a => a.get()),
        },
        config.tokenomics.ico,
        config.tokenomics.vesting,
    ]
}