

const utils = require("./Utils")

const initUtils = utils.initUtils;
const initClearAllEvent = utils.initClearAllEvent;
const setTimer = utils.setTimer;
const resetCreateFormValues = utils.resetCreateFormValues;
const initVueComponents = utils.initVueComponents
const mapAuctions = utils.mapAuctions;
const uploadImage = utils.uploadImage;
const refreshAuctions = utils.refreshAuctions;


let initVm = function (app) {

    let factoryAuction = app.factoryAuction;
    let contractAuction = app.contractAuction;
    let timers = app.timers
    let emptyAddress = app.emptyAddress;
    let auctions;

    initVueComponents(Vue);

    const vm = new Vue({
        el: "#app",
        data: {
            title: "Welcome to Auction",
            auctions: []
        },
        methods: {
            createAuction: function () {
                let duration = document.getElementById("duration").value;
                let startAmount = document.getElementById("start-auction-amount").value;

                function createContinue(imageUrl) {
                    let auctionOwner = web3.eth.accounts[0];
                    factoryAuction.createAuction(duration, web3.toWei(startAmount, "ether"), imageUrl, { from: auctionOwner })
                        .then(_ => {
                            refreshAuctions();
                            resetCreateFormValues();
                        });
                }
                
                uploadImage(createContinue); // IPFS
            },

            bid: async function (auctionAddress) {
                let auction = await contractAuction.at(auctionAddress);
                let account = web3.eth.accounts[0];

                let auctionOwner = (await auction.getOwner()).valueOf();
                if (account === auctionOwner) {
                    toastr.warning("Cannot make bid in your auctions!!")
                }
                else {
                    let bidAmount = Number(document.getElementById("bid-value-" + auctionAddress).value);
                    let oldBid = (await auction.getMaxBid()).valueOf();

                    try {
                        await auction.makeBid({ from: account, value: web3.toWei(bidAmount, "ether"), gas: 3000000 })

                        let newBid;
                        while ((newBid = await auction.getMaxBid()).valueOf() === oldBid) { }
                        let maxBidder = (await auction.getMaxBidder()).valueOf();

                        document.getElementById("max-bid-" + auctionAddress).innerHTML = newBid;
                        document.getElementById("max-bidder-" + auctionAddress).innerText = maxBidder;
                        document.getElementById("bid-value-" + auctionAddress).value = "";

                        toastr.success("You successfuly make your stake!!")
                    }
                    catch (err) {
                        console.log("ERR:", err)
                        toastr.error("This auction is already end or your bid is to low!");
                    }
                }
            },

            calculateBid: async function (auctionAddress) {
                let auction = await contractAuction.at(auctionAddress);
                let account = web3.eth.accounts[0];

                let maxBid = (await auction.getMaxBid()).valueOf();
                let currentBidderStake = (await auction.getStakeByBidder(account)).valueOf();
                let difference = ((maxBid - currentBidderStake) / 1000000000000000000) + 1;

                document.getElementById("bid-value-" + auctionAddress).value = difference;
            },

            withdraw: async function (auctionAddress) {
                let auction = await contractAuction.at(auctionAddress);
                let account = web3.eth.accounts[0];
                let hasWithdrawBefore = (await auction.withdraw.call({ from: account })).valueOf();

                await auction.withdraw({ from: account, gas: 3000000 });

                if (hasWithdrawBefore === true) {
                    toastr.success("Successfully withdraw!")
                }
                else {
                    toastr.warning("You cannot withdraw funds!")
                }
            },

            cancel: async function (auctionAddress) {
                let auction = await contractAuction.at(auctionAddress);
                let account = web3.eth.accounts[0];

                try {
                    await auction.forceEnd({ from: account, gas: 3000000 });
                    clearInterval(timers[auctionAddress]);

                    document.getElementById("timer-" + auctionAddress).innerHTML = "EXPIRED";
                    document.getElementById("timer-" + auctionAddress).removeAttribute("id");

                    document.getElementById("expired-" + auctionAddress).removeAttribute("disabled")
                    document.getElementById("expired-" + auctionAddress).removeAttribute("id");

                    toastr.success("Auction canceled: " + auctionAddress)
                }
                catch (err) {
                    toastr.error("You are not owner or Auction is already end!");
                }
            },

            destroy: async function (auctionAddress, flag = false) {
                let auction = await contractAuction.at(auctionAddress);
                let account = web3.eth.accounts[0];

                await auction.setOwner("0x0", { from: account, gas: 3000000 });

                if (flag === false) {
                    while ((await auction.getOwner()).valueOf() !== emptyAddress) { }
                    window.location.reload();
                }
            }
        },

        created: function () {
            auctions = this.auctions
            app.auctions = this.auctions

            initUtils(app)
            refreshAuctions();
        }
    });

    initClearAllEvent(vm.destroy);
}

module.exports = { initVm }