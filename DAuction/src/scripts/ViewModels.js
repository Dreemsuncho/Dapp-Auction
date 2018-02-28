
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

                function createContinue(imageUrl) {
                    console.log(imageUrl)

                    let auctionOwner = web3.eth.accounts[0];
                    factoryAuction.createAuction(duration, startAmount, { from: auctionOwner })
                        .then(_ => refreshAuctions(imageUrl));
                }
                uploadImage(createContinue);
            },
            bid: async function (address) {
                let auction = await contractAuction.at(address);
                let account = web3.eth.accounts[0];
                let bidAmount = Number(document.getElementById("bid-value-" + address).value);

                let oldBid = (await auction.getMaxBid()).valueOf();
                await auction.makeBid({ from: account, value: bidAmount, gas: 3000000 })

                let newBid;
                while ((newBid = await auction.getMaxBid()).valueOf() === oldBid) { }
                let maxBidder = (await auction.getMaxBidder()).valueOf();

                document.getElementById("max-bid-" + address).innerHTML = newBid;
                document.getElementById("max-bidder-" + address).innerHTML = maxBidder;
            }
        },

        beforeCreate: function () {
        },

        created: function () {
            auctions = this.auctions
            refreshAuctions();
        }
    });

    function uploadImage(createContinue) {
        const reader = new FileReader();
        let imageUrl = "";

        reader.onloadend = function () {
            const ipfs = window.IpfsApi('localhost', 5001) // Connect to IPFS
            const buf = buffer.Buffer(reader.result) // Convert data into buffer

            ipfs.files.add(buf, (err, result) => { // Upload buffer to IPFS
                if (err)
                    console.error(err)
                else
                    imageUrl = `https://ipfs.io/ipfs/${result[0].hash}`

                createContinue(imageUrl)
            })
        }

        const photo = document.getElementById("photo");
        reader.readAsArrayBuffer(photo.files[0]); // Read Provided File
    }

    async function refreshAuctions(imageUrl) {
        let newAuctions;
        while ((newAuctions = await factoryAuction.getAuctions()).length === auctions.length) { }

        newAuctions.forEach(async (addr, ind) => {
            let result = await mapAuctions(addr, ind, imageUrl);
            if (ind >= auctions.length)
                auctions.push(result)
        });
    }

    async function mapAuctions(addr, ind, imageUrl) {
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
            maxBidder: maxBidder,
            imageUrl: imageUrl
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