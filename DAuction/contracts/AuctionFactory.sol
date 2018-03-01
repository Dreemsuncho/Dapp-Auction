pragma solidity ^0.4.18;


import "./Auction.sol";

contract AuctionFactory {
    Auction[] private auctions;

    event AuctionCreated(address owner, address auction);

    function AuctionFactory() public {

    }

    function createAuction(uint duration, uint startAuctionAmount, string imageUrl) public {
        Auction auction = new Auction(msg.sender, duration, startAuctionAmount, imageUrl);
        auctions.push(auction);
        AuctionCreated(msg.sender, auction);
    }

    function getAuctions() public view returns (Auction[]) {
        return auctions;
    }

    function destroy(address auctionAddress) public returns (bool) {
        for (uint i = 0; i < auctions.length; i += 1) {
            if (auctionAddress == address(auctions[i])) {
                delete auctions[i];
                return true;
            }
        }

        return false;
    }
}