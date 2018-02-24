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

    modifier hasEnded() {
        require(now >= dateEnd);
        _;
    }

    modifier hasNotEnded() {
        require(now < dateEnd);
        _;
    }

    modifier isCanceled() {
        require(canceled == true);
        _;
    }

    modifier isNotCanceled() {
        require(canceled == false);
        _;
    }

    event NotifyBid(address bidder, uint amount);

    uint private dateEnd;
    uint private maxBid;
    address private maxBidder;
    address private owner;
    bool private canceled;

    mapping(address => uint) private stakeByBidder;

    function Auction(address ownerInput, uint duration, uint startAuctionAmount) public {
        require(duration >= 1);

        owner = ownerInput;
        dateEnd = now + duration;
        maxBid = startAuctionAmount;
        canceled = false;
    }


    function makeBid() public payable isNotOwner isNotCanceled hasNotEnded {
        uint bidAmount = stakeByBidder[msg.sender] + msg.value;
        require(maxBid < bidAmount);

        maxBid = bidAmount;
        maxBidder = msg.sender;
        stakeByBidder[msg.sender] = bidAmount;
        NotifyBid(maxBidder, maxBid);
    }

    function cancel() public isOwner hasNotEnded {

    }

    function withdraw() public isNotOwner hasEnded {
     
    }
    
 
    function getStakeByBidder(address bidder) public view returns (uint stake) {
        stake = stakeByBidder[bidder];
        return stake;
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function getMaxBid() public view returns(uint) {
        return maxBid;
    }
}