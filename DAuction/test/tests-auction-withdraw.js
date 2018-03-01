
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
        it("should owner cannot withdraw twice", async function () {
            // Arrange
            let bidder = accounts[1];
            let bidAmount = 12;
            
            await instance.makeBid({ from: bidder, value: bidAmount });
            await instance.cancel({ from: instanceOwner });

            let hasWithdraw = (await instance.withdraw.call({ from: instanceOwner })).valueOf();
            // Act Assert
            assert.isTrue(hasWithdraw)
            
            await instance.withdraw({ from: instanceOwner });

            hasWithdraw = (await instance.withdraw.call({ from: instanceOwner })).valueOf();

            assert.isFalse(hasWithdraw)
        });

        it("should max bidder has no funds when owner withdraw", async function () {
            // Arrange
            let bidder = accounts[1];
            let bidAmount = 12;
            
            await instance.makeBid({ from: bidder, value: bidAmount });
            await instance.cancel({ from: instanceOwner });
            
            let maxBidder = (await instance.getMaxBidder()).valueOf();
            let stakeBefore = (await instance.getStakeByBidder(maxBidder)).valueOf();
            // Act
            await instance.withdraw({ from: instanceOwner });
            let stakeAfter = (await instance.getStakeByBidder(maxBidder)).valueOf();

            // Assert
            assert.strictEqual(Number(stakeBefore), bidAmount);
            assert.strictEqual(Number(stakeAfter), 0);
        });

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

        it("should doesn't withdraw when withdrawler is maxBidder", async function () {
            // Arrange
            let bidder = accounts[1];
            let bidAmount = 12;

            let error = null;

            await instance.makeBid({ from: bidder, value: bidAmount });
            await instance.cancel({ from: instanceOwner });
            // Act
            try {
                await instance.withdraw.call({ from: bidder });
            } catch (err) {
                error = err;
            }

            // Assert
            assert.ok(error);
        });
    })
});