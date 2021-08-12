// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title TokenVesting
 * @author OpenZeppelin
 * @dev A token holder contract that can release its token balance gradually like a
 * typical vesting scheme, with a cliff and vesting period. Optionally revocable by the
 * owner.
 * @notice This was edited a bit by cybertelx.
 */
contract TokenVesting is Ownable {
  using SafeERC20 for ERC20;

  event Released(uint256 amount);
  event Revoked();

  // beneficiary of tokens after they are released
  address public beneficiary;

  uint256 public cliff;
  uint256 public start;
  uint256 public duration;

  bool public revocable;

  mapping(address => uint256) public released;
  mapping(address => bool) public revoked;

  /**
   * @dev Creates a vesting contract that vests its balance of any ERC20 token to the
   * _beneficiary, gradually in a linear fashion until _start + _duration. By then all
   * of the balance will have vested.
   * You shouldn't need to touch this, the Deploy contract will do it all for you.
   * @param _beneficiary address of the beneficiary to whom vested tokens are transferred
   * @param _cliff duration in seconds of the cliff in which tokens will begin to vest
   * @param _duration duration in seconds of the period in which the tokens will vest
   * @param _revocable whether the vesting is revocable or not
   */
  constructor(
    address _beneficiary,
    uint256 _cliff,
    uint256 _duration,
    bool _revocable
  ) Ownable() {
    require(_beneficiary != address(0));
    require(_cliff <= _duration);

    uint256 _start = block.timestamp;

    beneficiary = _beneficiary;
    revocable = _revocable;
    duration = _duration;
    cliff = _start + _cliff;
    start = _start;
  }

  /**
   * @notice Transfers vested tokens to beneficiary.
   * @param token ERC20 token which is being vested
   */
  function release(ERC20 token) public {
    uint256 unreleased = releasableAmount(token);

    require(unreleased > 0, "You can claim it later.");

    released[address(token)] = released[address(token)] + unreleased;

    emit Released(unreleased);
    token.safeTransfer(beneficiary, unreleased);
  }

  /**
   * @notice Allows the owner to revoke the vesting. Tokens already vested
   * remain in the contract, the rest are returned to the owner.
   * @param token ERC20 token which is being vested
   */
  function revoke(ERC20 token) public onlyOwner {
    require(revocable, "This can't be revoked.");
    require(!revoked[address(token)], "Already revoked");

    uint256 balance = token.balanceOf(address(this));

    uint256 unreleased = releasableAmount(token);
    uint256 refund = balance - unreleased;

    revoked[address(token)] = true;

    emit Revoked();
    token.safeTransfer(owner(), refund);
  }

  /**
   * @dev Calculates the amount that has already vested but hasn't been released yet.
   * @param token ERC20 token which is being vested
   */
  function releasableAmount(ERC20 token) public view returns (uint256) {
    return vestedAmount(token, block.timestamp) - (released[address(token)]);
  }

  /**
   * @dev Calculates the amount that has already vested.
   * @param token ERC20 token which is being vested
   */
  function vestedAmount(ERC20 token, uint256 timestamp)
    public
    view
    returns (uint256)
  {
    uint256 currentBalance = token.balanceOf(address(this));
    uint256 totalBalance = currentBalance + released[address(token)];

    if (timestamp < cliff) {
      return 0;
    } else if (timestamp >= start + duration || revoked[address(token)]) {
      return totalBalance;
    } else {
      return (totalBalance * (timestamp - start)) / duration;
    }
  }
}
