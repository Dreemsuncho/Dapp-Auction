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
        require(canceled == true);
        _;
    }

    modifier hasNotEnded() {
        require(now < dateEnd);
        require(canceled == false);
        _;
    }

    event NotifyBid(address bidder, uint amount);

    uint private dateEnd;
    uint private maxBid;
    address private maxBidder;
    address private owner;
    string private imageUrl;
    bool private canceled;

    mapping(address => uint) private stakeByBidder;

    function Auction(address ownerInput, uint duration, uint startAuctionAmount, string inputImageUrl) public {
        require(duration >= 1);

        owner = ownerInput;
        dateEnd = now + duration;
        maxBid = startAuctionAmount;
        imageUrl = inputImageUrl;
        canceled = false;
    }


    function makeBid() public payable isNotOwner hasNotEnded {
        uint bidAmount = stakeByBidder[msg.sender] + msg.value;
        require(maxBid < bidAmount);

        maxBid = bidAmount;
        maxBidder = msg.sender;
        stakeByBidder[msg.sender] = bidAmount;
        NotifyBid(maxBidder, maxBid);
    }

    function cancel() public isOwner hasNotEnded {
        canceled = true;
    }

    function forceEnd() public isOwner hasNotEnded {
        dateEnd = now;
    }

    function withdraw() public hasEnded {
        if (msg.sender == owner) {
            
        } else {

        }
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

    function getMaxBidder() public view returns (address) {
        return maxBidder;
    }

    function isCanceled() public view returns (bool) {
            return canceled;
    }

    function isEnd() public view returns (bool) {
        return now >= dateEnd;
    }

    function getImageUrl() public view returns (string) {
        return imageUrl;
    }
}