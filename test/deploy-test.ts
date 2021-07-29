import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { PureEthAddress } from "../lib/AddressType"
let Web3EthABI = require('web3-eth-abi')
let keccak256 = require("keccak256")

let testingTokenSettings = async function() {
  const [owner, addr1, addr2] = await ethers.getSigners();
  return [
    "InsultCoin",
    "INSULT",
    ethers.BigNumber.from("23000000000000000000000000"),
    ethers.BigNumber.from("0"),
    {
      enabled: true,
      minDelay: ethers.BigNumber.from("1000"),
      proposers: [owner.address],
      executors: [new PureEthAddress("0").get()]
    },
    {
      owner: owner.address,
      fundManager: owner.address,
      minters: [owner.address],
      moderators: [owner.address]
    },
    {
      enabled: true,
      amount: ethers.BigNumber.from("13000000000000000000000000"),
      rate: ethers.BigNumber.from("1000")
    },
    {
      enabled: false,
      cliff: 0,
      duration: ethers.BigNumber.from("31556952")
    }
  ]
}

describe("Deployment Contract", function() {
  it("Should deploy the contracts", async function() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const Deploy = await ethers.getContractFactory("Deployment");

    let settings = await testingTokenSettings()

    const deployContract = await Deploy.deploy(...settings);
    await deployContract.deployed();
  });
  it("Timelock should work when deployed", async function() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const Deploy = await ethers.getContractFactory("Deployment")
    const Timelock = await ethers.getContractFactory("TimelockController")
    const Token = await ethers.getContractFactory("Token")

    let settings = await testingTokenSettings()

    const deployContract = await Deploy.deploy(...settings);
    await deployContract.deployed();

    let tlContract = Timelock.attach(await deployContract.controllerContract())
    let tokenContract = Token.attach(await deployContract.tokenContract())

    await tokenContract.mint(tlContract.address, 1000)
    
    expect(await tokenContract.balanceOf(owner.address)).to.equal(0)
    expect(await tokenContract.balanceOf(tlContract.address)).to.equal(1000)

    let funcCall = Web3EthABI.encodeFunctionCall({
      name: "transfer",
      type: 'function',
      inputs: [{
          type: 'address',
          name: 'recipient'
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
