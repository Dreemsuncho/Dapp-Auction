
var AuctionFactory = artifacts.require("./AuctionFactory.sol");
var Auction = artifacts.require("./Auction.sol");


contract("Initialization", function (accounts) {

    let instance;
    let instanceOwner = accounts[0];

    beforeEach(async function () {
        instance = await AuctionFactory.new({ from: instanceOwner });
    });


    describe("Happy Path", function () {
        it("should have zero auctions", async function () {
            // Arrange Act
            let auctions = await instance.getAuctions();
            // Assert
            assert.strictEqual(auctions.length, 0);
        });
    });
});
