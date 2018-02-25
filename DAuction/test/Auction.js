
var Auction = artifacts.require("./Auction.sol");


contract("Auction", function (accounts) {

    let instance;
    let instanceOwner = accounts[0];

    let durationAuction = 1000;
    let startAuctionAmount = 10;

    beforeEach(async function () {
        instance = await Auction.new(instanceOwner, durationAuction, startAuctionAmount);
    });


    describe("Initialization", function () {
        it("should owner equal to instanceOwner", async function () {
            // Arrange Act
            let owner = await instance.getOwner();
            // Assert
            assert.strictEqual(owner, instanceOwner);
        })

        it("should maxBid equal to startAuctionAmount", async function () {
            // Arrange Act
            let maxBid = await instance.getMaxBid();
            // Assert
            assert.strictEqual(maxBid.toNumber(), startAuctionAmount);
        })
    })


    describe("Make Bidding - Happy Path", function () {
        it("should have make a bid successfully", async function () {
            // Arrange
            let bidder = accounts[1];
            let bidAmount = 11;

            // Act
            await instance.makeBid({ from: bidder, value: bidAmount });

            let stake = await instance.getStakeByBidder(bidder);
            // Assert
            assert.strictEqual(stake.toNumber(), bidAmount);
        });

        it("should maxBid equal to last bid", async function () {
            // Arrange
            let bidder = accounts[1];
            let bidAmount = 11;

            // Act
            await instance.makeBid({ from: bidder, value: bidAmount });

            let maxBid = await instance.getMaxBid();
            // Assert
            assert.strictEqual(maxBid.toNumber(), bidAmount);
        });

        it("should maxBider equal to bidder", async function () {
            // Arrange
            let bidder = accounts[1];
            let bidAmount = 11;

            // Act
            await instance.makeBid({ from: bidder, value: bidAmount });

            let maxBidder = await instance.getMaxBidder();
            // Assert
            assert.strictEqual(maxBidder, bidder);
        });

        it("should calculate second bid correctly", async function () {
            // Arrange
            let bidder = accounts[1];
            let bidAmount = 11;
            let bidAmountSecond = 1;

            // Act
            await instance.makeBid({ from: bidder, value: bidAmount });
            await instance.makeBid({ from: bidder, value: bidAmountSecond });

            let bidderStake = await instance.getStakeByBidder(bidder);
            let bidderStakeExpected = bidAmount + bidAmountSecond;
            let maxBid = await instance.getMaxBid();
            // Assert
            assert.strictEqual(bidderStake.toNumber(), bidderStakeExpected);  
            
            assert.strictEqual(bidderStake.toNumber(), maxBid.toNumber())
        });

        it("should call NotifyBid event", async function () {
            // Arrange
            let bidder = accounts[1];
            let bidAmount = 11;

            // Act
            let transactionInfo = await instance.makeBid({ from: bidder, value: bidAmount });

            let eventName = transactionInfo.logs[0].event;
            // Assert
            assert.strictEqual(eventName, "NotifyBid");
        });
    });


    describe("Make Bidding - (Sad & Bad) Path", function () {
        it("should not owner be able to make a bid", async function () {
            // Arrange
            let owner = await instance.getOwner();
            let bidAmount = 11;
            let error = null;

            // Act
            try {
                await instance.makeBid({ from: owner, value: bidAmount });
            }
            catch (err) { error = err; }

            // Assert
            assert.ok(error);
        });

        it("should not be able to make bid below or equal maxBid", async function () {
            // Arrange
            let maxBidder = accounts[1];
            let maxBidAmount = 11;

            let bidder1 = accounts[2];
            let bidAmount1 = 11;
            let error1 = null;

            let bidder2 = accounts[3];
            let bidAmount2 = 10;
            let error2 = null;

            // Act
            await instance.makeBid({ from: maxBidder, value: maxBidAmount });

            try {
                await instance.makeBid({ from: bidder1, value: bidAmount1 });
            }
            catch (err) { error1 = err; }

            try {
                await instance.makeBid({ from: bidder2, value: bidAmount2 });
            }
            catch (err) { error2 = err; }

            let actualMaxBidder = await instance.getMaxBidder();
            // Assert
            assert.strictEqual(maxBidder, actualMaxBidder)
            assert.ok(error1);
            assert.ok(error2);
        });

        it("should not be able to cancel Auction when caller is not owner", async function () {
            // Arrange
            let canceler = accounts[1];

            // Act
            try {
                await instance.cancel({ from: canceler })
            }
            catch (err) { error = err; }

            // Assert
            assert.ok(error);
        });

        it("should not be able to make bid when Auction is canceled", async function () {
            // Arrange
            let bidder = accounts[1];
            let bidAmount = 11;
            let error = null;

            // Act
            await instance.cancel({ from: instanceOwner })

            try {
                await instance.makeBid({ from: bidder, value: bidAmount })
            }
            catch (err) { error = err; }

            // Assert
            assert.ok(error);
        });

        it("should not be able to force-end Auction when caller is not owner", async function () {
            // Arrange
            let forceEnder = accounts[1];

            // Act
            try {
                await instance.cancel({ from: forceEnder })
            }
            catch (err) { error = err; }

            // Assert
            assert.ok(error);
        });

        it("should not be able to make bid when Auction is end", async function () {
            // Arrange
            let bidder = accounts[1];
            let bidAmount = 11;

            await instance.forceEnd({ from: instanceOwner })
            // Act
            try {
                await instance.makeBid({ from: instanceOwner, value: bidAmount })
            }
            catch (err) { error = err; }

            // Assert
            assert.ok(error);
        });
    });
});