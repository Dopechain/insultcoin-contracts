// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./Token.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title Insulting
 * @author cybertelx
 * @dev A smart contract that accepts InsultCoin and allows people to insult each other.
 */
contract Insulting is AccessControl {
  using Counters for Counters.Counter;

  uint256 public tokensRequired = 1 * 10**18;

  ERC20 public insultCoin;
  Counters.Counter public insultIdCount;

  bytes32 public constant FUNDMAN = keccak256("FUND_MAN");

  /// @notice Fired whenever someone sends an insult.
  event InsultSent(Insult insult);

  /// @notice This variable maps insults to senders.
  /// @dev This is intentionally optimized for smart
  /// @dev contracts reading the insult data,
  /// @dev so they don't have to do expensive
  /// @dev for-loops. Incurs a bigger gas cost for
  /// @dev the insult-er... insulter?
  mapping(address => Insult[]) public mySentInsults;

  /// @notice This variable maps insults to receivers.
  /// @dev This is intentionally optimized for smart
  /// @dev contracts reading the insult data,
  /// @dev so they don't have to do expensive
  /// @dev for-loops. Incurs a bigger gas cost for
  /// @dev the insult-er... insulter?
  mapping(address => Insult[]) public myReceivedInsults;

  /// @notice This variable maps IDs to insults.
  /// @dev This is intentionally optimized for smart
  /// @dev contracts reading the insult data,
  /// @dev so they don't have to do expensive
  /// @dev for-loops. Incurs a bigger gas cost for
  /// @dev the insult-er... insulter?
  mapping(uint256 => Insult[]) public idToInsult;

  using SafeERC20 for ERC20;

  /// @dev This is the basic insult type.
  /// @dev Stores information like ID, sender, receiver, message and amount spent.
  struct Insult {
    uint256 id;
    address sender;
    address receiver;
    string message;
    uint256 cost;
    uint256 timestamp;
  }

  /// @dev You should not have to touch this directly.
  /// @dev Editing the config file (insultcoin.config.ts)
  /// @dev is all you need to customize this to your heart's
  /// @dev content.
  constructor(ERC20 token, address fundman) {
    insultCoin = token;
    _setupRole(FUNDMAN, fundman);
  }

  /// @notice Insult a target.
  /// User must approve at least 1 INSULT to insult someone.
  /// @param target receiver of the insult
  /// @param message the insult
  /// @param cost the amount to burn
  function insult(
    address target,
    string memory message,
    uint256 cost
  ) public {
    require(cost <= insultCoin.balanceOf(msg.sender), "cost > your balance");
    require(cost >= (tokensRequired), "Too little $$");

    // The token contract owns all "burnt" INSULT
    // This may be useful for future things
    insultCoin.transferFrom(msg.sender, address(insultCoin), cost);

    // solhint-disable not-rely-on-time
    _makeInsult(msg.sender, target, message, cost, block.timestamp);
  }

  /// @dev The internal function with insulting logic.
  /// User must approve at least 1 INSULT to insult someone.
  /// @param sender The sender of the insult.
  /// @param receiver The receiver of the insult
  /// @param message The insult message.
  /// @param cost The amount to burn.
  /// @param time The timestamp.
  function _makeInsult(
    address sender,
    address receiver,
    string memory message,
    uint256 cost,
    uint256 time
  ) internal {
    uint256 newid = insultIdCount.current();
    insultIdCount.increment();

    Insult memory ins = Insult(newid, sender, receiver, message, cost, time);
    mySentInsults[sender].push(ins);
    myReceivedInsults[receiver].push(ins);
    idToInsult[newid].push(ins);
    emit InsultSent(ins);
  }

  /// @notice Adjusts the amount you need to burn to insult: fund manager only!
  /// @param newAmount The new minimum amount needed.
  function adjustCost(uint256 newAmount) public {
    require(hasRole(FUNDMAN, msg.sender), "Unauthorized, not fund manager");
    tokensRequired = newAmount;
  }

  // @notice This returns all the insults that a user has sent.
  // @dev Getter for MySentInsults.
  // @param user the address of the user to check
  // @return the list of insults sent by that user
  function getSentInsults(address user) public view returns (Insult[] memory) {
    return mySentInsults[user];
  }

  // @notice This returns all the insults that a user has received.
  // @dev Getter for MyReceivedInsults.
  // @param user the address of the user to check
  // @return the list of insults received by that user
  function getReceivedInsults(address user)
    public
    view
    returns (Insult[] memory)
  {
    return myReceivedInsults[user];
  }
}
