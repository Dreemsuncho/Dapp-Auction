
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

    event notifyBid(address bidder, uint amount);

    uint private dateEnd;
    uint private maxBid;
    address private maxBidder;
    address private owner;
    bool private canceled;

    mapping(address => uint) private stakeByBidder;

    function Auction(uint duration, uint startAmount) public {
        require(duration >= 1);

        owner = msg.sender;
        dateEnd = now + duration;
        maxBid = startAmount;
        canceled = false;
    }


    function makeBid() public payable isNotOwner hasNotEnded {
        uint bidAmount = stakeByBidder[msg.sender] + msg.value;
        require(maxBid < bidAmount);

        maxBid = bidAmount;
        maxBidder = msg.sender;
        stakeByBidder[msg.sender] = bidAmount;
        notifyBid(maxBidder, maxBid);
    }

    function cancel() public isOwner hasNotEnded {

    }

    function withdraw() public isNotOwner hasEnded {
     
    }
    
    function getStakeByBidder(address bidder) public view returns (uint stake) {
        stake = stakeByBidder[bidder];
        return stake;
    }
}