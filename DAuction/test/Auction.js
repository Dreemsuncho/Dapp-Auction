
var Auction = artifacts.require("./Auction.sol");


contract("Auction Initialization", function (accounts) {

    let instance;
    let instanceOwner = accounts[0];

    let durationAuction = 1000;
    let startAuctionAmount = 10;

    beforeEach(async function () {
        instance = await Auction.new(instanceOwner, durationAuction, startAuctionAmount);
    });


    it("should owner equal to instanceOwner", async function () {
        // Arrange Act
        let owner = await instance.getOwner();
        // Assert
        assert.equal(owner, instanceOwner);
    })

    it("should maxBid equal to startAuctionAmount", async function () {
        // Arrange Act
        let maxBid = await instance.getMaxBid();
        // Assert
        assert.equal(maxBid.toNumber(), startAuctionAmount);
    })
})