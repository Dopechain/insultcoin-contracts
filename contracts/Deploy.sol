// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Token.sol";
import "./optional/InsultICO.sol";
import "./optional/Vesting.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";
import "./optional/Insulting.sol";

contract Deployment {
  Token public tokenContract;
  ICO public icoContract;
  TimelockController public controllerContract;
  TokenVesting public vestingContract;
  Insulting public insultingContract;

  struct TimeLockSettings {
    bool enabled;
    uint256 minDelay;
    address[] proposers;
    address[] executors;
  }
  struct RoleSettings {
    address owner;
    address wordKeeper;
    address fundManager;
    address[] minters;
    address[] moderators;
  }
  struct VestingSettings {
    bool enabled;
    uint256 cliff;
    uint256 duration;
  }
  struct ICOSettings {
    bool enabled;
    uint256 amount;
    uint256 rate;
  }
  struct InsultingSettings {
    bool enabled;
  }

  constructor(
    string memory name,
    string memory symbol,
    uint256 totalSupply,
    uint256 funderGets,
    TimeLockSettings memory timelockSet,
    RoleSettings memory roles,
    ICOSettings memory icoSet,
    VestingSettings memory vesting
  ) {
    require(
      funderGets <= totalSupply,
      "The amount the fund manager gets must be lower than the total supply, duh"
    );
    require(
      icoSet.amount <= (totalSupply - funderGets),
      "You can't allocate more than the total supply (excluding fund manager's portion) to the icoSet!"
    );

    if (timelockSet.enabled) {
      controllerContract = new TimelockController(
        timelockSet.minDelay,
        timelockSet.proposers,
        timelockSet.executors
      );

      tokenContract = new Token(
        name,
        symbol,
        totalSupply,
        address(controllerContract),
        roles.fundManager,
        roles.minters,
        roles.moderators,
        true
      );
    } else {
      tokenContract = new Token(
        name,
        symbol,
        totalSupply,
        roles.owner,
        roles.fundManager,
        roles.minters,
        roles.moderators,
        true
      );
    }

    if (vesting.enabled) {
      vestingContract = new TokenVesting(
        roles.fundManager,
        vesting.cliff,
        vesting.duration,
        false
      );
      tokenContract.withdraw(address(vestingContract), funderGets);
    } else {
      tokenContract.withdraw(roles.fundManager, funderGets);
    }

    if (icoSet.enabled) {
      icoContract = new ICO(
        address(tokenContract),
        roles.fundManager,
        icoSet.rate
      );
      tokenContract.withdraw(address(icoContract), icoSet.amount);
    }

    insultingContract = new Insulting(tokenContract, roles.wordKeeper);
  }
}
