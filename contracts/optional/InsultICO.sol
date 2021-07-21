// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../Token.sol";
import "./IICO.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ICO is IICO, AccessControl {
  // Fund manager: can withdraw and control funds
  bytes32 public constant FUNDMAN = keccak256("FUND_MAN");

  ERC20 token;
  uint256 public RATE = 100;
  modifier icoactive {
    require(token.balanceOf(address(this)) > 0, "bro party's over");
    _;
  }

  constructor(
    address _tokenAddr,
    address fundmanager,
    uint256 _rate
  ) {
    token = ERC20(_tokenAddr);
    _setupRole(FUNDMAN, fundmanager);
    RATE = _rate;
  }

  function _getTokenAmount(uint256 _weiAmount) internal view returns (uint256) {
    return (_weiAmount / (10**18)) * RATE;
  }

  function harvestToAccount(address account) public {
    require(hasRole(FUNDMAN, msg.sender), "only fund manager can withdraw $$$");
    require(address(this).balance > 0, "I'm broke m8");
    // send money
    payable(account).transfer(address(this).balance);
  }

  function buy() external payable override icoactive {
    uint256 _amount = _getTokenAmount(msg.value);
    token.transfer(msg.sender, _amount);
  }
}
