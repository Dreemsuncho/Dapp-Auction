
const contract = require("truffle-contract");
const vmInit = require("./ViewModels").vmInit;


(async function () {

    if (typeof web3 === "undefined") {
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
    } else {
        web3 = new Web3(web3.currentProvider);
    }

    var JSON_FactoryAuction = require("../../build/contracts/AuctionFactory.json");
    var JSON_Auction = require("../../build/contracts/Auction.json");

    var contractFactoryAuction = contract(JSON_FactoryAuction);
    let contractAuction = contract(JSON_Auction);

    contractFactoryAuction.setProvider(web3.currentProvider);
    contractAuction.setProvider(web3.currentProvider);

    let env = Number(web3.version.network) === 3
        ? "production"
        : "development";

    let factoryAuction = await initFactoryAuction(env, contractFactoryAuction);

    vmInit(contractAuction, factoryAuction);
})();

async function initFactoryAuction(env, contractFactoryAuction) {
    const addresses = require("../Addresses.json");
    const addressFactoryAuction = addresses[env].FactoryAuction;
    let factoryAuction = await contractFactoryAuction.at(addressFactoryAuction);

    return factoryAuction;
}