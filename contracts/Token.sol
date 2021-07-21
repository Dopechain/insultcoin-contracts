// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

/// @title Token
/// @author cybertelx
/// @notice Insult others on the blockchain: it's the future!
contract Token is ERC20, AccessControl {
  /// @notice The Fund Manager controls InsultCoin's economy!
  /// @dev The fund manager can withdraw from the ICO and more. See config.
  bytes32 public constant FUNDMAN = keccak256("FUND_MAN");

  /// @notice The Moderator can pause/unpause accounts and pause all transactions!
  /// This is a very powerful role.
  /// @dev Moderators use the setPause and setPauseAll functions to do their job.
  /// @dev They bypass any pause restrictions, so mods can't pause each other.
  /// @dev Usually delegated to the timelock.
  bytes32 public constant MODERATOR = keccak256("MOD");

  /// @notice The Minter can mint new InsultCoins out of thin air!
  /// This is a very powerful role.
  /// @dev Minters use the mint function to... mint tokens.
  /// @dev Usually delegated to the timelock.
  bytes32 public constant MINTER = keccak256("MINTER");

  /// @notice This stores information about pausing!
  /// @dev Maps an address to a boolean (true = paused, false = normal)
  /// @dev Pause restrictions are bypassed by moderators.
  mapping(address => bool) public paused;

  /// @notice This stores information about pausing! See paused
  /// @dev A boolean, defaults to false. If this is set to true,
  /// @dev the economy is completely paused until flipped back.
  /// @dev Pause restrictions are bypassed by moderators.
  bool public pausedAll;

  /// @notice Constructor of the basic InsultCoin DApp.
  /// @dev Should be deployed alongside other separate contracts (ICO, Vesting, etc).
  /// @param _name The name of the token
  /// @param _symbol The symbol of the token
  /// @param _totalSupply The total supply of the token
  /// @param owner The owner (gets admin role)
  /// @param fundman The Fund Manager
  /// @param minters The list of minters
  /// @param moderators The list of moderators
  constructor(
    string memory _name,
    string memory _symbol,
    uint256 _totalSupply,
    address owner,
    address fundman,
    address[] memory minters,
    address[] memory moderators,
    bool usingDeployCtr
  ) ERC20(_name, _symbol) {
    _mint(address(this), _totalSupply);

    // If using the standard deploy contract, set that as the owner to smoothen the construction
    if (usingDeployCtr) {
      _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
      _setupRole(FUNDMAN, msg.sender);
    }

    _setupRole(DEFAULT_ADMIN_ROLE, owner);
    _setupRole(FUNDMAN, fundman);

    for (uint256 i = 0; i < minters.length; i++) {
      _setupRole(MINTER, minters[i]);
    }
    for (uint256 i = 0; i < moderators.length; i++) {
      _setupRole(MODERATOR, moderators[i]);
    }
  }

  /// @notice Withdraw InsultCoin tokens from the App: fund manager only!
  /// @dev There is no built-in "send to ICO" function so this serves i guess
  /// @param receiver Receiver of the tokens
  /// @param amount Amount of tokens
  function withdraw(address receiver, uint256 amount) public {
    require(hasRole(FUNDMAN, msg.sender), "Unauthorized, not fund manager");
    require(
      amount <= balanceOf(address(this)),
      "Amount higher than my balance"
    );

    this.transfer(receiver, amount);
  }

  /// @notice Mint an amount of tokens to the address addr.
  /// @notice Only executable by a minter.
  /// @param addr The address to mint to
  /// @param amount The amount to mint
  function mint(address addr, uint256 amount) public {
    require(addr != address(0), "You can't mint to 0x0!");
    require(hasRole(MINTER, msg.sender), "You aren't a minter!");
    _mint(addr, amount);
  }

  /// @notice Pause/unpause an account, rendering it incapable of transacting.
  /// @notice Only executable by a moderator.
  /// @param addr The address to pause
  /// @param toggle Paused? Yes or No
  function setPause(address addr, bool toggle) public {
    require(hasRole(MODERATOR, msg.sender), "You aren't a mod!");
    paused[addr] = toggle;
  }

  /// @notice Pause/unpause the entire
  /// @notice Only executable by a moderator.
  /// @param toggle Paused? Yes or No
  function setPauseAll(bool toggle) public {
    require(hasRole(MODERATOR, msg.sender), "You aren't a mod!");
    pausedAll = toggle;
  }

  // hooks
  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 amount // Add virtual here!
  ) internal virtual override {
    // Only moderators can bypass pausing.
    require(
      pausedAll == false && hasRole(MODERATOR, from) == false,
      "InsultCoin is paused."
    );
    require(
      paused[from] == false && hasRole(MODERATOR, from) == false,
      "Your account is paused."
    );
    super._beforeTokenTransfer(from, to, amount); // Call parent hook
  }
}
