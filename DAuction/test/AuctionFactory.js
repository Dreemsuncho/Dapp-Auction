
var AuctionFactory = artifacts.require("./AuctionFactory.sol");


contract("AuctionFactory Initialization", function (accounts) {

    let instance;
    let instanceOwner = accounts[0];

    beforeEach(async function () {
        instance = await AuctionFactory.new({ from: instanceOwner });
    });


    it("should initialize new auction", async function () {
        // Arrange Act
        let auctionsBefore = await instance.getAuctions();
        await instance.createAuction(150, 10, { from: accounts[0] })
        let auctionsAfter = await instance.getAuctions();

        // Assert
        assert.equal(auctionsBefore.length, 0);
        assert.equal(auctionsAfter.length, 1);
    });
});
