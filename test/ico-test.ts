import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

let testingTokenSettings = async function() {
  const [owner, addr1, addr2] = await ethers.getSigners();
  return ["InsultCoin", "INSULT", ethers.BigNumber.from("23000000000000000000000000"), owner.address, owner.address, owner.address, [owner.address], [owner.address], true]
}

describe("ICO", function() {
  it("Should create ICO as fund manager", async function() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    const ICO = await ethers.getContractFactory("ICO");

    const tokenContract = await Token.deploy(...await testingTokenSettings());
    await tokenContract.deployed();

    const icoContract = await ICO.deploy(tokenContract.address, owner.address, 1000);
    await icoContract.deployed()

    await tokenContract.withdraw(icoContract.address, tokenContract.balanceOf(tokenContract.address))
  });
  it("Shouldn't create ICO, as it is using a normal account (permission check test)", async function() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    const ICO = await ethers.getContractFactory("ICO");

    const tokenContract = await Token.deploy(...await testingTokenSettings());
    await tokenContract.deployed();

    // .connect() changes the signer
    const icoContract = await ICO.deploy(tokenContract.address,owner.address, 1000);
    await icoContract.deployed()

    try {
        await tokenContract.connect(addr1).withdraw(icoContract.address, tokenContract.balanceOf(tokenContract.address))
    } catch(e) {
        return true
    }
    return false
  });
  it("Should buy tokens from ICO", async function() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    const ICO = await ethers.getContractFactory("ICO");

    const tokenContract = await Token.deploy(...await testingTokenSettings());
    await tokenContract.deployed();

    const icoContract = await ICO.deploy(tokenContract.address,owner.address, 1000);
    await icoContract.deployed()

    await tokenContract.withdraw(icoContract.address, tokenContract.balanceOf(tokenContract.address))

    // now it's all deployed, all fine and dandy
    // time to buy: 0.001 (native currency) should equal 1 token (1 native = 1000 tokens)
    let overrides = {
        // To convert Ether to Wei:
        value: ethers.utils.parseEther("1.0") // ether in this case MUST be a string
    };
    await icoContract.connect(addr1).buy(overrides)
    let balance = await tokenContract.balanceOf(addr1.address)
    
    expect(balance._hex).to.equal('0x03e8');
  });
  it("Should harvest the ETH inside the ICO as fund manager", async function() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    const ICO = await ethers.getContractFactory("ICO");

    const tokenContract = await Token.deploy(...await testingTokenSettings());
    await tokenContract.deployed();

    const icoContract = await ICO.deploy(tokenContract.address,owner.address, 1000);
    await icoContract.deployed()

    await tokenContract.withdraw(icoContract.address, tokenContract.balanceOf(tokenContract.address))

    // now it's all deployed, all fine and dandy
    // time to buy: 0.001 (native currency) should equal 1 token (1 native = 1000 tokens)
    let overrides = {
        // To convert Ether to Wei:
        value: ethers.utils.parseEther("1.0") // ether in this case MUST be a string
    };
    await icoContract.connect(addr1).buy(overrides)

    // harvest eth as fund manager
    await icoContract.harvestToAccount(owner.address);
  })
  it("Should fail harvest the ETH inside the ICO as user (permission check)", async function() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    const ICO = await ethers.getContractFactory("ICO");

    const tokenContract = await Token.deploy(...await testingTokenSettings());
    await tokenContract.deployed();

    const icoContract = await ICO.deploy(tokenContract.address,owner.address, 1000);
    await icoContract.deployed()

    await tokenContract.withdraw(icoContract.address, tokenContract.balanceOf(tokenContract.address))

    // now it's all deployed, all fine and dandy
    // time to buy: 0.001 (native currency) should equal 1 token (1 native = 1000 tokens)
    let overrides = {
        // To convert Ether to Wei:
        value: ethers.utils.parseEther("1.0") // ether in this case MUST be a string
    };
    await icoContract.connect(addr1).buy(overrides)

    // try to harvest eth as user
    try {
      await icoContract.connect(addr1).harvestToAccount(addr1.address);
    } catch(e) {
        return true
    }
    return false
  })
});
