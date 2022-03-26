// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./dbarToken.sol";

contract RewardContract is AccessControl {
    bytes32 public constant REDEEMER_ROLE = keccak256("REDEEMER_ROLE");
    DbarToken public dbar;
    event Redeemed(address indexed redeemer, uint256 amount);

    constructor(address _dbar) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        dbar = DbarToken(_dbar);
    }

    function redeem(uint amount) public onlyRole(REDEEMER_ROLE) {
        dbar.transfer(msg.sender, amount);
        emit Redeemed(msg.sender, amount);
    }
}