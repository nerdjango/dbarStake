// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DbarToken is ERC20 {
    constructor() ERC20("dbar Token", "dbar") {
        _mint(msg.sender, 1000000000 * 10 ** decimals());
    }
}
