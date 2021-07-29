import { expect } from "chai";
import { keccak } from "ethereumjs-util";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
let Web3EthABI = require('web3-eth-abi')
let keccak256 = require("keccak256")

let testingTokenSettings = async function() {
  const [owner, addr1, addr2] = await ethers.getSigners();
  return [
    "InsultCoin",
    "INSULT",
    ethers.BigNumber.from("23000000000000000000000000"),
    owner.address,
    owner.address,
    [owner.address],
    [owner.address], 
    true
  ]
}

describe("Timelock Controller", function() {
  it("Should create the contract", async function() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const tokenContract = await Token.deploy(...await testingTokenSettings());

    await tokenContract.deployed();

    const Timelock = await ethers.getContractFactory("TimelockController");
    const tlContract = await Timelock.deploy(1000, [owner.address], [addr1.address]);

    await tlContract.deployed()
  });
  it("Should mint tokens through timelock", async function() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const tokenContract = await Token.deploy(...await testingTokenSettings());

    await tokenContract.deployed();

    const Timelock = await ethers.getContractFactory("TimelockController");
    const tlContract = await Timelock.deploy(1000, [owner.address], [owner.address]);
    await tlContract.deployed()

    await tokenContract.grantRole(await tokenContract.MINTER(), tlContract.address)
    
    let funcCall = Web3EthABI.encodeFunctionCall({
      name: "mint",
      type: 'function',
      inputs: [{
          type: 'address',
          name: 'addr'
      },{
          type: 'uint256',
          name: 'amount'
      }]
  }, [owner.address, 1000]);

    await tlContract.schedule(tokenContract.address, 0, funcCall, "0".repeat(64).padStart(66,"0x"), ethers.utils.formatBytes32String("0"), ethers.utils.hexlify(1000))

    await ethers.provider.send("evm_increaseTime", [2000])

    await tlContract.execute(tokenContract.address, 0, funcCall, "0".repeat(64).padStart(66,"0x"), ethers.utils.formatBytes32String("0"))

    expect(await tokenContract.balanceOf(owner.address)).to.equal(1000)
  });

});