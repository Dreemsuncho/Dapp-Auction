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
}