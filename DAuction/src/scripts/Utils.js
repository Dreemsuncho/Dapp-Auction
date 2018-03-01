
let contractAuction;
let emptyAddress;
let timers;
let factoryAuction;
let auctions;


let initUtils = function (app) {
    contractAuction = app.contractAuction;
    emptyAddress = app.emptyAddress;
    timers = app.timers;
    factoryAuction = app.factoryAuction;
    auctions = app.auctions;
}

let initClearAllEvent = function (destroy) {
    document.getElementById("clear-all").addEventListener("click", function () {
        auctions.forEach(auc => {
            if (auc.owner !== emptyAddress) {
                destroy(auc.address, true);
            }
        });
    });
}

let setTimer = function setTimer(auctionAddress, endDate) {
    var countDownDate = new Date(endDate * 1000).getTime();

    let timer = setInterval(function () {
        var now = new Date().getTime();

        var distance = countDownDate - now;

        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        try {
            if (distance < 0) {
                clearInterval(timer);
                document.getElementById("timer-" + auctionAddress).innerHTML = "EXPIRED";
                document.getElementById("expired-" + auctionAddress).removeAttribute("disabled")
            }
            else {
                document.getElementById("timer-" + auctionAddress).innerHTML = days + "d " + hours + "h " + minutes + "m " + seconds + "s Left:";
                document.getElementById("expired-" + auctionAddress).setAttribute("disabled", "disabled")
            }
        } catch (err) {
            clearInterval(timer);
        }
    }, 1000);

    timers[auctionAddress] = timer;
}

async function mapAuctions(addr, ind) {
    let currentAuction = await contractAuction.at(addr);

    let maxBid = (await currentAuction.getMaxBid()).valueOf();
    let owner = (await currentAuction.getOwner()).valueOf();
    let maxBidder = (await currentAuction.getMaxBidder()).valueOf();
    let imageUrl = (await currentAuction.getImageUrl()).valueOf();
    let endDate = (await currentAuction.getEndDate()).valueOf();
    setTimer(addr, endDate);

    if (maxBidder === emptyAddress) {
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

let uploadImage = function (createContinue) {
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

let initVueComponents = function (vue) {
    component = vue.component('list-auction', {
        props: ["item"],
        template: "#template-list-auction",
    })

    component = vue.component('create-auction', {
        template: "#template-create-auction",
    })
}

let resetCreateFormValues = function () {
    document.getElementById("duration").value = "";
    document.getElementById("start-auction-amount").value = "";
    document.getElementById("photo").value = "";
}

module.exports = {
    initUtils,
    initClearAllEvent,
    setTimer,
    initVueComponents,
    resetCreateFormValues,
    mapAuctions,
    uploadImage,
    refreshAuctions
}