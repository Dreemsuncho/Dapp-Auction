
pragma solidity ^0.4.18;


contract Auction {
    
    modifier isOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier isNotOwner() {
        require(msg.sender != owner);
        _;
    }

    address private owner;
    uint private dateEnd;
    uint private maxBid;
    
    mapping(address => uint) private stakeByBidder;

    function Auction(uint duration, uint startAmount) {

    }


    function makeBid() public {
        
    }

    function cancel() public {

    }

    function withdraw() public {

    }


}