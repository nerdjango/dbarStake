const dbarToken = artifacts.require("DbarToken");
const RewardContract = artifacts.require("RewardContract");

module.exports = function(deployer, network, accounts) {
    deployer.deploy(RewardContract, dbarToken.address);
}