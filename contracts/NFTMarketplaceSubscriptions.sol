// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

interface IERC721 {
    function transferFrom(address from, address to, uint256 tokenId) external;
    function getApproved(uint256 tokenId) external view returns (address);
}

contract NFTMarketplaceSubscriptions {
    address public owner;
    uint256 public listingFee;       // comisión fija por listar
    uint256 public saleFee;          // porcentaje por venta (ej. 500 = 5%)

    struct SubscriptionPlan {
        string name;
        uint256 priceNative;   // precio en ETH/MATIC
        uint256 priceERC20;    // precio en token ERC20
        address tokenAddress;  // dirección del token ERC20 (ej. USDC)
        uint256 duration;      // duración en segundos
    }

    struct Subscription {
        uint256 planId;
        uint256 expiry;
    }

    mapping(uint256 => SubscriptionPlan) public plans;
    uint256 public planCount;

    mapping(address => Subscription) public subscriptions;

    event Subscribed(address indexed user, uint256 planId, uint256 expiry);
    event NFTListed(uint256 indexed listingId, address indexed seller, address nft, uint256 tokenId, uint256 price);
    event NFTSold(uint256 indexed listingId, address indexed buyer, address nft, uint256 tokenId, uint256 price);
    event NFTCancelled(uint256 indexed listingId, address indexed seller);
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);
    event FeesUpdated(uint256 newListingFee, uint256 newSaleFee);

    constructor(uint256 _listingFee, uint256 _saleFee) {
        owner = msg.sender;
        listingFee = _listingFee;
        saleFee = _saleFee; // ej. 500 = 5% (base 10000)
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // --- Administración ---
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function updateFees(uint256 _listingFee, uint256 _saleFee) external onlyOwner {
        listingFee = _listingFee;
        saleFee = _saleFee;
        emit FeesUpdated(_listingFee, _saleFee);
    }

    // --- Suscripciones ---
    function addPlan(
        string memory name,
        uint256 priceNative,
        uint256 priceERC20,
        address tokenAddress,
        uint256 duration
    ) external onlyOwner {
        plans[planCount] = SubscriptionPlan(name, priceNative, priceERC20, tokenAddress, duration);
        planCount++;
    }

    function subscribeNative(uint256 planId) external payable {
        require(planId < planCount, "Invalid plan");
        SubscriptionPlan memory plan = plans[planId];
        require(msg.value == plan.priceNative, "Incorrect payment");

        payable(owner).transfer(msg.value);

        subscriptions[msg.sender] = Subscription(planId, block.timestamp + plan.duration);
        emit Subscribed(msg.sender, planId, block.timestamp + plan.duration);
    }

    function subscribeERC20(uint256 planId) external {
        require(planId < planCount, "Invalid plan");
        SubscriptionPlan memory plan = plans[planId];
        require(plan.tokenAddress != address(0), "ERC20 not supported");

        IERC20(plan.tokenAddress).transferFrom(msg.sender, owner, plan.priceERC20);

        subscriptions[msg.sender] = Subscription(planId, block.timestamp + plan.duration);
        emit Subscribed(msg.sender, planId, block.timestamp + plan.duration);
    }

    function isActive(address user) public view returns (bool) {
        return subscriptions[user].expiry > block.timestamp;
    }

    // --- Marketplace ---
    struct Listing {
        address seller;
        address nft;
        uint256 tokenId;
        uint256 price;
        bool active;
    }

    mapping(uint256 => Listing) public listings;
    uint256 public listingCount;

    function listNFT(address nft, uint256 tokenId, uint256 price) external payable {
        require(msg.value == listingFee, "Listing fee required");
        require(price > 0, "Price must be > 0");
        require(IERC721(nft).getApproved(tokenId) == address(this), "Marketplace not approved");

        payable(owner).transfer(msg.value);

        listings[listingCount] = Listing(msg.sender, nft, tokenId, price, true);
        emit NFTListed(listingCount, msg.sender, nft, tokenId, price);
        listingCount++;
    }

    function cancelListing(uint256 listingId) external {
        Listing storage item = listings[listingId];
        require(item.active, "Listing not active");
        require(item.seller == msg.sender, "Not seller");

        item.active = false;
        emit NFTCancelled(listingId, msg.sender);
    }

    function buyNFT(uint256 listingId) external payable {
        Listing storage item = listings[listingId];
        require(item.active, "Listing not active");
        require(msg.value == item.price, "Incorrect price");

        uint256 fee = (msg.value * saleFee) / 10000;
        uint256 sellerAmount = msg.value - fee;

        payable(owner).transfer(fee);
        payable(item.seller).transfer(sellerAmount);

        IERC721(item.nft).transferFrom(item.seller, msg.sender, item.tokenId);

        item.active = false;
        emit NFTSold(listingId, msg.sender, item.nft, item.tokenId, msg.value);
    }
}
