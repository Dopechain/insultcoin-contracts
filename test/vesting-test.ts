import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

let testingTokenSettings = async function() {
  const [owner, addr1, addr2] = await ethers.getSigners();
  return ["Token", "INSULT", ethers.BigNumber.from("23000000000000000000000000"), owner.address, owner.address, owner.address, [owner.address], [], false]
}

describe("Token Vesting", function() {
  it("Should create the contract", async function() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const tokenContract = await Token.deploy(...await testingTokenSettings());

    await tokenContract.deployed();

    const TokenVesting = await ethers.getContractFactory("TokenVesting");
    const vestingContract = await TokenVesting.deploy(addr1.address, ethers.BigNumber.from("0"), ethers.BigNumber.from("94608000"), false);

    await vestingContract.deployed()
  });
  it("Should vest for a year and have the right amount", async function() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const tokenContract = await Token.deploy(...await testingTokenSettings());

    await tokenContract.deployed();

    const TokenVesting = await ethers.getContractFactory("TokenVesting");
    const vestingContract = await TokenVesting.deploy(owner.address, ethers.BigNumber.from("0"), ethers.BigNumber.from("94608000"), false);

    await vestingContract.deployed()

    let tx = await tokenContract.mint(vestingContract.address, BigNumber.from("1000000000000000000000")) // vest 1000 tokens

    let b = await ethers.provider.getBlock(tx.blockNumber)

    let va = await vestingContract.vestedAmount(tokenContract.address, b.timestamp + 31536000)  // ~1 year later
    expect(va._hex).to.equal("0x1211edee344b2bb2dc")

    let va2 = await vestingContract.vestedAmount(tokenContract.address, b.timestamp + 94608000)  // ~3 years later
    expect(va2._hex).to.equal("0x3635c9adc5dea00000")
  });
});