const dbarToken = artifacts.require("DbarToken");
const xDbarToken = artifacts.require("XDbarToken");

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(dbarToken);
    await deployer.deploy(xDbarToken);
};