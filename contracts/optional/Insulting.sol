// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../Token.sol";
import "./IICO.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title Insulting
 * @dev A smart contract that accepts InsultCoin and allows people to insult each other.
 */
contract Insulting is AccessControl {
  using Counters for Counters.Counter;

  uint256 tokensRequired = 10 * 10**18;

  ERC20 public insultCoin;
  Counters.Counter public insultIdCount;

  bytes32 public constant FUNDMAN = keccak256("FUND_MAN");

  /// @notice This variable maps insults to senders.
  mapping(address => Insult[]) public mySentInsults;
  /// @notice This variable maps insults to receivers.
  mapping(address => Insult[]) public myReceivedInsults;
  /// @notice This variable maps IDs to insults.
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

  constructor(ERC20 token, address fundman) {
    insultCoin = token;
    _setupRole(FUNDMAN, fundman);
  }

  /// @notice Insult a target.
  /// User must approve at least {tokensRequired} INSULT to insult someone.
  /// You have to approve this before you insult
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
  }

  /// @notice Adjusts the amount you need to burn to insult: fund manager only!
  /// @param newAmount The new minimum amount needed.
  function adjustCost(uint256 newAmount) public {
    require(hasRole(FUNDMAN, msg.sender), "Unauthorized, not fund manager");
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
