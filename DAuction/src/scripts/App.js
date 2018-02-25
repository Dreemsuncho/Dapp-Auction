

(async function () {
    
    if (typeof web3 === "undefined") {
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    } else {
        web3 = new Web3(web3.currentProvider);
    }
    
    
    var Contract = require("truffle-contract");
    

    var FactoryAuctionABI = require("../../build/contracts/AuctionFactory.json");
    var FactoryAuctionAbstraction = Contract(FactoryAuctionABI);
    FactoryAuctionAbstraction.setProvider(web3.currentProvider);
    
    let FactoryAuction = await FactoryAuctionAbstraction.at("0x5f3c2847b18d7cd4882ed513d1bd63d3cd37b194")
    
    
    var AuctionABI = require("../../build/contracts/Auction.json");
    let AuctionAbstraction = Contract(AuctionABI);
    AuctionAbstraction.setProvider(web3.currentProvider);
    
    let Auction;
    
    FactoryAuction.getAuctions().then(async function (arr) {
        let auctionAddress = arr[0];
        Auction = await AuctionAbstraction.at(auctionAddress);

        // must delete
        
            window.a = Auction;
            window.fa = FactoryAuction;
         
        
        const vmInit = require("./ViewModels").vmInit;
        vmInit(FactoryAuction);
    });


})();

