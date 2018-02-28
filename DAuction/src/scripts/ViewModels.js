
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
                    let auctionOwner = web3.eth.accounts[0];
                    factoryAuction.createAuction(duration, startAmount, imageUrl, { from: auctionOwner })
                        .then(_ => {
                            refreshAuctions();
                            resetFormValues();
                        });
                }

                uploadImage(createContinue);
            },
            bid: async function (auctionAddress) {
                let auction = await contractAuction.at(auctionAddress);
                let account = web3.eth.accounts[0];
                let bidAmount = Number(document.getElementById("bid-value-" + auctionAddress).value);

                let oldBid = (await auction.getMaxBid()).valueOf();
                await auction.makeBid({ from: account, value: bidAmount, gas: 3000000 })

                let newBid;
                while ((newBid = await auction.getMaxBid()).valueOf() === oldBid) { }
                let maxBidder = (await auction.getMaxBidder()).valueOf();

                document.getElementById("max-bid-" + auctionAddress).innerHTML = newBid;
                document.getElementById("max-bidder-" + auctionAddress).innerText = maxBidder;
            },
            calculateBid: async function (auctionAddress) {
                let auction = await contractAuction.at(auctionAddress);
                let account = web3.eth.accounts[0];

                let maxBid = (await auction.getMaxBid()).valueOf();
                let currentBidderStake = (await auction.getStakeByBidder(account)).valueOf();

                let difference = (maxBid - currentBidderStake + 1);
                document.getElementById("bid-value-" + auctionAddress).value = difference;
            }
        },

        beforeCreate: function () {
        },

        created: function () {
            auctions = this.auctions
            refreshAuctions();
        }
    });

    function setTimer(auctionAddress, endDate) {
        var countDownDate = new Date("Mar 7, 2018 15:37:25").getTime();

        let timer = setInterval(function () {
            var now = new Date().getTime();

            var distance = countDownDate - now;

            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            if (distance < 0) {
                clearInterval(timer);
                document.getElementById("timer-" + auctionAddress).innerHTML = "EXPIRED";
            }
            else {
                document.getElementById("timer-" + auctionAddress).innerHTML =
                    days + "d " + hours + "h " + minutes + "m " + seconds + "s Left:";
            }
        }, 1000);
    }

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

    async function refreshAuctions() {
        let newAuctions;
        while ((newAuctions = await factoryAuction.getAuctions()).length === auctions.length) { }

        newAuctions.forEach(async (addr, ind) => {
            let result = await mapAuctions(addr, ind);
            if (ind >= auctions.length)
                // auctions.push(result)
                auctions.splice(0, 0, result)
        });
    }

    async function mapAuctions(addr, ind) {
        let currentAuction = await contractAuction.at(addr);

        let maxBid = (await currentAuction.getMaxBid()).valueOf();
        let owner = (await currentAuction.getOwner()).valueOf();
        let maxBidder = (await currentAuction.getMaxBidder()).valueOf();
        let imageUrl = (await currentAuction.getImageUrl()).valueOf();
        let endDate = (await currentAuction.getEndDate()).valueOf();
        setTimer(addr, endDate);


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

    function resetFormValues() {
        document.getElementById("duration").value = "";
        document.getElementById("start-auction-amount").value = "";
        document.getElementById("photo").value = "";
    }
}

module.exports = { vmInit }