// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./dbarToken.sol";
import "./xDbarToken.sol";
import "./RewardContract.sol";

contract StakingContract is Ownable {
    RewardContract public reward;
    DbarToken public dbar;
    XDbarToken public xDbar;

    event Staked(address indexed staker, uint256 amount);
    event Unstaked(address indexed staker, uint256 amount);

    mapping(address => uint256) public stakingBalance;
    address[] public stakers;

    struct Stake {
        address owner;
        uint256 dbarAmount;
        uint256 xDbarAmount;
        uint256 start;
        bool redeemed;
    }

    mapping(address => Stake[]) public userStakes;

    constructor(
        address _reward,
        address _dbar,
        address _xDbar
    ) {
        reward = RewardContract(_reward);
        dbar = DbarToken(_dbar);
        xDbar = XDbarToken(_xDbar);
    }

    function getTokensRatio() public view returns (uint256 totalTokensRatio) {
        for (uint256 i = 0; i < stakers.length; i++) {
            Stake[] memory stakeList = userStakes[stakers[i]];
            uint256 userTotalTokensRatio;
            for (uint256 j = 0; j < stakeList.length; j++) {
                if (!stakeList[j].redeemed) {
                    uint256 blockDifference = block.number - stakeList[j].start;
                    uint256 currentDbarAmount = stakeList[j].dbarAmount +
                        (blockDifference * 10 * stakeList[j].dbarAmount) /
                        100;
                    uint256 tokensRatio = (currentDbarAmount * 10**18) /
                        stakeList[j].xDbarAmount;
                    userTotalTokensRatio += tokensRatio;
                }
            }
            totalTokensRatio += (userTotalTokensRatio / stakeList.length);
        }
    }

    function stakeDbar(uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");
        dbar.transferFrom(msg.sender, address(this), amount);
        stakingBalance[msg.sender] += amount;
        uint256 ratio = getTokensRatio() > 0 ? getTokensRatio() : 1 * 10**18;
        uint256 xDbarAmount = (amount * 10**18) / (ratio);
        if (userStakes[msg.sender].length == 0) {
            stakers.push(msg.sender);
        }
        userStakes[msg.sender].push(
            Stake(msg.sender, amount, xDbarAmount, block.number, false)
        );
        xDbar.mint(msg.sender, xDbarAmount);
        emit Staked(msg.sender, amount);
    }

    function withdrawStakedDbar(uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");
        require(
            amount <= stakingBalance[msg.sender],
            "Amount must be less than or equal to the current staking balance"
        );
        Stake[] memory stakeList = userStakes[msg.sender];

        uint256 dbarToUnstake;
        uint256 dbarReward;
        uint256 totalXDbarAmountForUnstaked;
        for (uint256 i; i < stakeList.length; i++) {
            if (stakeList[i].redeemed == false && amount > 0) {
                uint256 blockDifference = block.number - stakeList[i].start;
                if (stakeList[i].dbarAmount >= amount) {
                    uint256 withdrawPercent = (amount * 10**18) /
                        stakeList[i].dbarAmount;
                    stakeList[i].dbarAmount -= amount;
                    dbarToUnstake += amount;
                    dbarReward += (blockDifference * 10 * amount) / 100;
                    totalXDbarAmountForUnstaked +=
                        (stakeList[i].xDbarAmount * withdrawPercent) /
                        10**18;
                    amount = 0;
                } else {
                    amount -= stakeList[i].dbarAmount;
                    dbarToUnstake += stakeList[i].dbarAmount;
                    dbarReward +=
                        (blockDifference * 10 * stakeList[i].dbarAmount) /
                        100;
                    totalXDbarAmountForUnstaked += stakeList[i].xDbarAmount;
                    stakeList[i].dbarAmount = 0;
                    stakeList[i].xDbarAmount = 0;
                    stakeList[i].redeemed = true;
                }
            }
        }
        stakingBalance[msg.sender] -= dbarToUnstake;
        reward.redeem(dbarReward);
        
        xDbar.burnFrom(msg.sender, totalXDbarAmountForUnstaked);

        dbar.transfer(msg.sender, dbarToUnstake + dbarReward);
        emit Unstaked(msg.sender, dbarToUnstake);
    }
}
