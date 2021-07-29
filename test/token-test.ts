import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

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

describe("Token", function() {
  it("Should create the token", async function() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    
    const Token = await ethers.getContractFactory("Token");
    const tokenContract = await Token.deploy(...await testingTokenSettings());

    await tokenContract.deployed();
  });
  it("Should be able to transfer", async function() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const tokenContract = await Token.deploy(...await testingTokenSettings());
    
    await tokenContract.deployed();
    await tokenContract.mint(owner.address, 1000000)
    await tokenContract.transfer(addr1.address, 1000)
    
    expect(await tokenContract.balanceOf(addr1.address)).to.equal("1000");
  });
});
