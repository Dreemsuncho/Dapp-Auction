
var AuctionFactory = artifacts.require("./AuctionFactory.sol");


contract("AuctionFactory", function (accounts) {

    let instance;

    beforeEach(async function () {
        instance = await AuctionFactory.new({ from: accounts[0] });
    })


    it("should initialize new auction", async function () {
        // Arrange Act
        let auctionsBefore = await instance.getAuctions();
        await instance.createAuction(150, 10, { from: accounts[0] })
        let auctionsAfter = await instance.getAuctions();

        // Assrt
        assert.equal(auctionsBefore.length, 0);
        assert.equal(auctionsAfter.length, 1);
    });
});
