const dbarToken = artifacts.require("DbarToken");
const xDbarToken = artifacts.require("XDbarToken");
const RewardContract = artifacts.require("RewardContract");
const StakingContract = artifacts.require("StakingContract");

module.exports = function(deployer, network, accounts) {
    deployer.deploy(StakingContract, RewardContract.address, dbarToken.address, xDbarToken.address);
}