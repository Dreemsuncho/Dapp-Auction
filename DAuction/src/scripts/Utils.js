
let initUtils = function (auctions, destroy) {

    let contractAuction = app.contractAuction;

    document.getElementById("clear-all").addEventListener("click", function () {
        auctions.forEach(auc => {
            if (auc.owner !== "0x0000000000000000000000000000000000000000")
                destroy(auc.address, true);
        });


        function checkOwners() {
            let owners = [];

            auctions.forEach(async auc => {
                let auction = await contractAuction.at(auc.address);
                let auctionOwner = (await auction.getOwner()).valueOf();
                owners.push(auctionOwner);
            });

            if (owners.every(owner => owner === "0x0000000000000000000000000000000000000000")) {
                window.location.reload();
            }
            else {
                // setTimeout(() => {
                //     checkOwners();
                // }, 1000)
            }
        }
    })
}

module.exports = { initUtils }