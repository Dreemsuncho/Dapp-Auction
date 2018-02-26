
const Contract = require("truffle-contract");
const vmInit = require("./ViewModels").vmInit;


(async function () {

    if (typeof web3 === "undefined") {
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
    } else {
        web3 = new Web3(web3.currentProvider);
    }

    var JSON_FactoryAuction = require("../../build/contracts/AuctionFactory.json");
    var JSON_Auction = require("../../build/contracts/Auction.json");

    var FactoryAuctionAbstraction = Contract(JSON_FactoryAuction);
    let AuctionAbstraction = Contract(JSON_Auction);

    FactoryAuctionAbstraction.setProvider(web3.currentProvider);
    AuctionAbstraction.setProvider(web3.currentProvider);

    let FactoryAuction;
    let Auction;

    let env = "";

    switch (web3.version.network) {
        // Ganache || TestRpc
        case "5777":
        case "1519633464752":
            env = "development"
            break;

        // Ropsten Test Net
        case "3":
            env = "production"
            break;
    }
    ({ FactoryAuction, Auction } = await initFactoryAndAuctionProduction(
        env,
        FactoryAuction,
        FactoryAuctionAbstraction,
        Auction,
        AuctionAbstraction
    ));
})();

async function initFactoryAndAuctionProduction(env, FactoryAuction, FactoryAuctionAbstraction, Auction, AuctionAbstraction) {

    const addresses = require("../Addresses.json");
    const addressFactoryAuction = addresses[env].FactoryAuction;

    FactoryAuctionAbstraction.at(addressFactoryAuction)
        .then(function(instance) {
            FactoryAuction = instance
            
            FactoryAuction.getAuctions().then(async function (arr) {
                let auctionAddress = arr[0];
                Auction = await AuctionAbstraction.at(auctionAddress);
                // must delete
                window.a = Auction;
                window.fa = FactoryAuction;
                vmInit(FactoryAuction);
            });
        })
        .catch(function(err) {
            console.log("Error!");
        });


    return { FactoryAuction, Auction };
}

