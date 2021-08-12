# InsultCoin

~~InsultCoin is a high-tech state-of-the-art blockchain platform for seamlessly and securely managing insults.~~

## Sorry for overhyping

Sorry for overhyping. InsultCoin is a project that lets you send and receive insults to anybody
on the blockchain. Currently only available on BSC, but when I get the money, it will come to Ethereum,
a bunch of random layer-2 networks, probably Polygon, HECO? It'll go cross-chain one day, ok?

## Mission

We want to allow all people from around the world with an Internet connection to be able to insult each other in an uncensored and secure way, in a really fun and idiotic way. This is basically just a shitcoin.

## Disclaimer

This is basically a homebrew token project with spaghetti code slathered around.  
No audits, no secure-lock-insurance-whatever, cuz I'm not able to afford it with my budget.

## Tokenomics

75% of the total supply goes towards the ICO, while 25% stays with me.
These tokens will be vested over 3 years.

## Governance

Sadly it will not have a built-in token voting DAO whatever governance system
cuz I'm too lazy to make one.
However, there is by default a timelock controller from OpenZeppelin that
forces me to wait a couple hours before making changes. If you have
a good idea, contact me!

In the InsultCoin code, there are multiple roles:

- Owner: Administrator of all roles, bound by the timelock if enabled.
- Funds Manager: Controls all contracts' funds and some aspects of tokenomics.
- Minters: Can mint tokens at any time, and as much as they wish.
- Moderators: Can freeze accounts and the entire InsultCoin network.

## To-Do

To be honest, I think I'm going to be giving up on a couple of these,
so don't consider them promises.

### Stage 1

- Deploy the insulting, token, ICO and other basic contracts to BSC
- Improve upon the tokenomics
- An InsultCoin lottery
- ~~Market manipulation to pump the price~~
- Bridge INSULT across different chains
- Create a native Insult Chain for high-speed insulting

## Testing

To run unit tests, do "npm test".

To run your own local version, run "npm run rpc", open a new command window,
then run "npm run deploy-rpc" in the new window.
After that, go to your local copy of insultcoin-app, then run "npm start".
Please make sure you have a "local development" network in MetaMask connected to
localhost:8545.

## License

I license this source code under the MIT license, no backsies. This is
gonna be open source code, and [if you find this funny, please buy a couple
InsultCoins, because I want money money!](https://buy.insultcoin.ml)
