const truffleAssert = require("truffle-assertions")

const dbarToken = artifacts.require("DbarToken");
const xDbarToken = artifacts.require("XDbarToken");
const RewardContract = artifacts.require("RewardContract");
const StakingContract = artifacts.require("StakingContract");

const Web3 = require("web3")
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"))

const advanceBlock = () => {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send({
            jsonrpc: "2.0",
            method: "evm_mine",
            id: new Date().getTime()
        }, (err, result) => {
            if (err) { return reject(err) }
            const newBlockHash = web3.eth.getBlock('latest').hash

            return resolve(newBlockHash)
        })
    })
}

contract("StakingContract", accounts => {
    it("should allow users to stake dbar token.", async() => {
        let dbar = await dbarToken.deployed()
        let staking = await StakingContract.deployed()

        let amount = web3.utils.toWei("1", "ether")

        await dbar.approve(staking.address, amount) //approve staking contract to spend dbar token
        await staking.stakeDbar(amount) //stake dbar token
        assert.equal(await staking.stakingBalance(accounts[0]), amount)
    })
    it("should accurately get pool ratio.", async() => {
        let dbar = await dbarToken.deployed()
        let staking = await StakingContract.deployed()

        let amount = web3.utils.toWei("1", "ether")

        let ratio = await staking.getTokensRatio()
        await advanceBlock() //advance block to get new block hash
        let ratioNewBlock = await staking.getTokensRatio() //get ratio with new block hash

        assert.equal(parseFloat(ratio) + parseFloat(ratio) * 0.1, parseFloat(ratioNewBlock))

        await dbar.approve(staking.address, amount, { from: accounts[1] }) //approve staking contract to spend dbar token
        await staking.stakeDbar(amount, { from: accounts[1] }) //stake dbar token with account 1
    })
    it("should confirm that the second user gets the right amount of $xDbar based on the block number on staking", async() => {
        let dbar = await dbarToken.deployed()
        let staking = await StakingContract.deployed()

        let firstUserStake = await staking.userStakes(accounts[0], 0)
        let secondUserStake = await staking.userStakes(accounts[1], 0)

        let firstUserStakeBlock = parseInt(firstUserStake.start) //get first user stake block
        let secondUserStakeBlock = parseInt(secondUserStake.start) //get second user stake block
        let blockDifference = secondUserStakeBlock - firstUserStakeBlock //get block difference

        /*
         * for every block the user stakes, the $dbar amount increases by 10%
         * affecting the $xDbar amount
         * for example: after 1 block of stake, 100 $dbar == 100/1.1 $xDbar
         */

        let firstUserStakeAmountXDbar = web3.utils.fromWei(firstUserStake.xDbarAmount, "ether") //get first user stake $xDbar amount
        let secondUserStakeAmountXDbar = web3.utils.fromWei(secondUserStake.xDbarAmount, "ether") //get second user stake $xDbar amount

        assert.equal((parseFloat(firstUserStakeAmountXDbar) / (1 + (blockDifference / 10))).toFixed(10), (parseFloat(secondUserStakeAmountXDbar)).toFixed(10))

        let amount = web3.utils.toWei("1", "ether")
        await dbar.approve(staking.address, amount, { from: accounts[0] }) //approve staking contract to spend dbar token
        await staking.stakeDbar(amount, { from: accounts[0] }) //stake dbar token with account 0
    })
    it("should allow users to withdraw staked dbar token.", async() => {
        let xDbar = await xDbarToken.deployed()
        let staking = await StakingContract.deployed()

        userXDbarBalance = await xDbar.balanceOf(accounts[0]) //get user $xDbar balance

        await xDbar.approve(staking.address, userXDbarBalance, { from: accounts[0] }) //approve staking contract to spend xDbar token
        await advanceBlock() //advance block to get new block hash

        let stakingBalanceBefore = await staking.stakingBalance(accounts[0]) //get staking balance

        let amount = web3.utils.toWei("1.5", "ether")
        truffleAssert.passes(await staking.withdrawStakedDbar(amount, { from: accounts[0] })) //withdraw staked dbar token

        let stakingBalanceAfter = await staking.stakingBalance(accounts[0]) //get staking balance

        assert.equal(parseFloat(stakingBalanceAfter) + parseFloat(amount), parseFloat(stakingBalanceBefore))
    })
})