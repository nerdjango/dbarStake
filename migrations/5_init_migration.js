const dbarToken = artifacts.require("DbarToken");
const xDbarToken = artifacts.require("XDbarToken");
const RewardContract = artifacts.require("RewardContract");
const StakingContract = artifacts.require("StakingContract");

const Web3 = require("web3")

let REDEEMER = Web3.utils.keccak256("REDEEMER_ROLE")
let MINTER = Web3.utils.keccak256("MINTER_ROLE")

module.exports = async function(deployer, network, accounts) {
    let dbar = await dbarToken.deployed()
    let xDbar = await xDbarToken.deployed()
    let staking = await StakingContract.deployed()
    let reward = await RewardContract.deployed()

    await xDbar.grantRole(MINTER, staking.address) //make staking smart contract minter
    await reward.grantRole(REDEEMER, staking.address) //make staking smart contract redeemer

    let rewardAmount = web3.utils.toWei("500000000", "ether")
    let otherUserAmount = web3.utils.toWei("100000000", "ether")
    await dbar.transfer(reward.address, rewardAmount)
    await dbar.transfer(accounts[1], otherUserAmount)
    await dbar.transfer(accounts[2], otherUserAmount)
    await dbar.transfer(accounts[3], otherUserAmount)
    await dbar.transfer(accounts[4], otherUserAmount)
}