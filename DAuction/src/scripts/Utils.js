
let initUtils = function (auctions, callback) {

    let contractAuction = app.contractAuction;

    document.getElementById("clear-all").addEventListener("click", function () {
        auctions.forEach(auc => {
            callback(auc.address, true);
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
                checkOwners();
            }
        }
    })
}

module.exports = { initUtils }