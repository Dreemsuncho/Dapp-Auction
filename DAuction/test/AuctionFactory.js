
var AuctionFactory = artifacts.require("./AuctionFactory.sol");
var Auction = artifacts.require("./Auction.sol");


contract("AuctionFactory", function (accounts) {

    let instance;
    let instanceOwner = accounts[0];

    beforeEach(async function () {
        instance = await AuctionFactory.new({ from: instanceOwner });
    });


    describe("Initialization", function () {
        it("should have zero auctions", async function () {
            // Arrange Act
            let auctions = await instance.getAuctions();
            // Assert
            assert.strictEqual(auctions.length, 0);
        });
    });

    
    describe("Create Auction", function () {
        it("should initialize new auction", async function () {
            // Arrange Act
            let auctionsBefore = await instance.getAuctions();
            await instance.createAuction(150, 10, { from: accounts[1] })
            let auctionsAfter = await instance.getAuctions();

            // Assert
            assert.strictEqual(auctionsBefore.length, 0);
            assert.strictEqual(auctionsAfter.length, 1);
        });

        it("should auction owner be set correctly", async function () {
            // Arrange
            let auctionOwner = accounts[1];

            // Act
            await instance.createAuction(150, 10, { from: auctionOwner })

            let auctions = await instance.getAuctions();
            let auctionAddress = auctions[0];
            let auction = Auction.at(auctionAddress); // get deployed auction
            let actualAuctionOwner = await auction.getOwner();
            // Assert
            assert.strictEqual(actualAuctionOwner, auctionOwner);
        });
    });
});
