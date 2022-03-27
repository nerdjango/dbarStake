# dbarStake
A staking-based incentive contract system for $dbar ERC20 token

- The mechanism for realizing staking yield is providing users $xDbar(this is similar to xSushi) proportional to their share of $dbar in the staking contract account at the time of deposit.
- Whenever rewards are redeemed, $dbar will flow into the staking contract account from the reward contract without minting $xDbar. This will have the effect of increasing the ratio of $dbar:$xDbar.
- A user will be able to realize this staking yield on redemption (and burning) of their $xDbar, they will be able to withdraw proportionate $dbar after n days  

The system will be comprised of the following contracts:
1. Staking contract: The contract which manages the receipt, staking, and yield of pooled $dbar
2. Rewards contract: The contract that provides additional yield to users who deposit $dbar to the staking contract. Assume that this contract is initiated/prefilled with $dbar.

Assume emissions rate is 10 $dbar for 1 Block.

Example one:
1. User 1 deposits 100 $dbar at block 1 he/she will get 100 xDbar
2. At block 2 staking contract redeems the rewards & he/she will burn 100 xDbar & will get 110 $dbar

Example two:

1. User 1 deposits 100 $dbar at block 1 he/she will get 100 xDbar
2. At block 2 staking contract redeem the rewards & User 2 deposits 100 $dbar he/she will get 100/1.1 $xDbar
