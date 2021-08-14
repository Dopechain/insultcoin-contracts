// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Token.sol";
import "./InsultICO.sol";
import "./Vesting.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";
import "./Insulting.sol";

/**
 * @title Deployment
 * @author cybertelx
 * @dev This contract deploys the other contracts.
 * @dev You should not need to touch it directly, just use the config file!
 */
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

  /// @dev You should not have to touch this directly.
  /// @dev Editing the config file (insultcoin.config.ts)
  /// @dev is all you need to customize this to your heart's
  /// @dev content.
  /// @param name The name of the token
  /// @param symbol The symbol of the token
  /// @param totalSupply The total supply of the token
  /// @param funderGets The amount the fund manager gets at the start
  /// @param timelockSet Timelock settings
  /// @param roles Roles settings
  /// @param icoSet ICO settings
  /// @param vesting Vesting settings
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

    insultingContract = new Insulting(tokenContract, roles.fundManager);
  }
}
