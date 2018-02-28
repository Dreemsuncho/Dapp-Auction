
var Auction = artifacts.require("./Auction.sol");

contract("Auction - Withdraw", function (accounts) {

    let instance;
    let instanceOwner = accounts[0];

    let durationAuction = 1000;
    let startAuctionAmount = 10;

    beforeEach(async function () {
        instance = await Auction.new(instanceOwner, durationAuction, startAuctionAmount, "ipfs.imageUrl");
    });


    describe("Happy Path", function () {
        it("should withdraw when auction is end", async function () {
            // Arrange
            let withDrawler = accounts[2];
            let bidAmount = 11;

            let maxBidder = accounts[1];
            let maxBidAmount = 12;

            await instance.makeBid({ from: withDrawler, value: bidAmount });
            await instance.makeBid({ from: maxBidder, value: maxBidAmount });
            await instance.cancel({ from: instanceOwner });
            // Act
            let hasWithdraw = await instance.withdraw.call({ from: withDrawler });

            // Assert
            assert.isTrue(hasWithdraw);
        });

        it("should owner withdraw when auction is end", async function () {
            // Arrange
            let bidder = accounts[1];
            let bidAmount = 12;

            await instance.makeBid({ from: bidder, value: bidAmount });
            await instance.cancel({ from: instanceOwner });
            // Act
            let hasWithdraw = await instance.withdraw.call({ from: instanceOwner });

            // Assert
            assert.isTrue(hasWithdraw);
        });
    });

    describe("(Sad & Bad) Path", async function () {
        it("should doesn't withdraw before auction is end", async function () {
            // Arrange
            let withDrawler = accounts[2];
            let bidAmount = 11;

            let maxBidder = accounts[1];
            let maxBidAmount = 12;

            let error = null;

            await instance.makeBid({ from: withDrawler, value: bidAmount });
            await instance.makeBid({ from: maxBidder, value: maxBidAmount });
            // Act
            try {
                await instance.withdraw.call({ from: withDrawler });
            } catch (err) {
                error = err;
            }

            // Assert
            assert.ok(error);
        });
    })
});