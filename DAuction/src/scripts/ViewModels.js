
let vmInit = function (app) {

    let factoryAuction = app.factoryAuction;
    let contractAuction = app.contractAuction;
    let auctions;

    initComponents();

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

                let auctionOwner = web3.eth.accounts[0];
                factoryAuction.createAuction(duration, startAmount, { from: auctionOwner })
                    .then(_ => refreshAuctions());
            },
            bid: async function (addressAuction) {
                let auction = await contractAuction.at(addressAuction);
                let account = web3.eth.accounts[0];
                let bidAmount = Number(document.getElementById(addressAuction).value);

                let oldBid = (await auction.getMaxBid()).valueOf();
                auction.makeBid({ from: account, value: bidAmount, gas: 3000000 })
                    .then(async _ => {
                        console.log("SUCCESS")

                        let newBid;
                        while ((newBid = await auction.getMaxBid()).valueOf() === oldBid) { }
                        
                        document.getElementById("max-bid-" + addressAuction).innerHTML = newBid;
                    })
                    .catch(_ => console.log("ERR"));
            }
        },

        beforeCreate: function () {
        },

        created: function () {
            auctions = this.auctions
            refreshAuctions();
        }
    });


    async function refreshAuctions(flag) {
        let newAuctions;
        while ((newAuctions = await factoryAuction.getAuctions()).length === auctions.length) { }

        newAuctions.forEach(async (addr, ind) => {
            let result = await mapAuctions(addr, ind);
            if (ind >= auctions.length)
                auctions.push(result)
        });
    }

    async function mapAuctions(addr, ind) {

        let currentAuction = await contractAuction.at(addr);

        let maxBid = (await currentAuction.getMaxBid()).valueOf();
        let owner = (await currentAuction.getOwner()).valueOf();
        let maxBidder = (await currentAuction.getMaxBidder()).valueOf();

        if (maxBidder === "0x0000000000000000000000000000000000000000") {
            maxBidder = "None"
        }
        let result = {
            id: ind,
            address: addr,
            maxBid: maxBid,
            owner: owner,
            maxBidder: maxBidder
        }

        return result
    }

    function initComponents() {
        component = Vue.component('list-auction', {
            props: ["item"],
            template: "#template-list-auction",
        })

        component = Vue.component('create-auction', {
            template: "#template-create-auction",
        })
    }
}

module.exports = { vmInit }