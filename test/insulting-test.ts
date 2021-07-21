import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

let testingTokenSettings = async function() {
  const [owner, addr1, addr2] = await ethers.getSigners();
  return ["InsultCoin", "INSULT", ethers.BigNumber.from("23000000000000000000000000"), owner.address, owner.address, owner.address, [owner.address], [], false]
}

describe("Insulting", function() {
  it("Shouldn't insult with less than 10 tokens", async function() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const Insulting = await ethers.getContractFactory("Insulting");

    const tokenContract = await Token.deploy(...await testingTokenSettings());
    const insultContract = await Insulting.deploy(tokenContract.address, owner.address);
    await tokenContract.deployed();
    await insultContract.deployed();

    // Make sure it insults properly
    try {
      await tokenContract.approve(insultContract.address, "115792089237316195423570985008687907853269984​665640564039457")
      await insultContract.insult(addr1.address, "You suck!", ethers.BigNumber.from("9000000000000000000"))
    } catch(e) {
      return true
    }
    return false
  });
  it("Should insult with 10 tokens", async function() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const Insulting = await ethers.getContractFactory("Insulting");
    
    const tokenContract = await Token.deploy(...await testingTokenSettings());
    const insultContract = await Insulting.deploy(tokenContract.address, owner.address);
    await tokenContract.deployed();
    await insultContract.deployed();

    await tokenContract.mint(owner.address, ethers.BigNumber.from("10000000000000000000"))

    // Make sure it insults properly
    await tokenContract.approve(insultContract.address, "115792089237316195423570985008687907853269984​665640564039457")
    await insultContract.insult(addr1.address, "You suck!", ethers.BigNumber.from("9000000000000000000"))

    let sentInsults = await tokenContract.getSentInsults(owner.address)
    expect(sentInsults[0].id._hex).to.equal('0x01');

    let recInsults = await tokenContract.getReceivedInsults(addr1.address)
    expect(recInsults[0].id._hex).to.equal('0x01');
  });
  it("Should insult with more than 10 tokens (1000)", async function() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const tokenContract = await Token.deploy(...await testingTokenSettings());
    
    await tokenContract.deployed();

    await tokenContract.mint(owner.address, ethers.BigNumber.from("1000000000000000000000"))

    // Make sure it insults properly
    await tokenContract.insult(addr1.address, "You suck!", ethers.BigNumber.from("1000000000000000000000"))

    let sentInsults = await tokenContract.getSentInsults(owner.address)
    expect(sentInsults[0].id._hex).to.equal('0x01');

    let recInsults = await tokenContract.getReceivedInsults(addr1.address)
    expect(recInsults[0].id._hex).to.equal('0x01');
  });
});