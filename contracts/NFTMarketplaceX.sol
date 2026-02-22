// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract NFTMarketplaceX_MegaMonster is ReentrancyGuard, Pausable, Ownable {

    // 🏛️ WALLETS DEFINIDAS
    address public constant TREASURY = address(bytes20(hex"cfaF9706A96Bf75B2D40B600cdA0605A77671Bcb"));

    // 💰 CONFIGURACIÓN MONETARIA COMPLETA (Puntos 1, 2, 3, 6, 7)
    uint256 public saleFeeBps = 500;              // 5% comisión venta
    uint256 public listingFee = 0.01 ether;       // Tarifa por listar
    uint256 public cancelFee = 0.005 ether;       // Punto #2: Tarifa cancelación
    uint256 public featuredFee = 0.02 ether;      // Punto #1: Tarifa destacados
    uint256 public verificationFee = 0.05 ether;  // Punto #3: Tarifa check azul
    uint256 public referralRewardBps = 100;       // Punto #6: 1% Referidos
    uint256 public subscriptionPriceUSDC = 50e6;  // Suscripción en Stablecoin (50 USDC)
    uint256 public constant SUB_DURATION = 30 days;

    // 🏗️ ESTRUCTURAS DE DATOS (Punto #5)
    struct Listing {
        address seller;
        address nft;
        uint256 tokenId;
        uint256 price;
        address paymentToken; // address(0) = MATIC, else = USDC/USDT (Punto #4)
        bool active;
        bool isFeatured;
    }

    struct Bundle { // Punto #5: Bundles
        address seller;
        address[] nfts;
        uint256[] ids;
        uint256 price;
        bool active;
    }

    // 📊 MAPPINGS
    mapping(uint256 => Listing) public listings;
    uint256 public listingCount;
    mapping(uint256 => Bundle) public bundles;
    uint256 public bundleCount;
    mapping(address => uint256) public subscriptionEnd;
    mapping(address => bool) public allowedTokens;
    mapping(address => bool) public verifiedCollections;
    mapping(address => uint256) public pendingReturns; // Para subastas seguras

    // 📣 EVENTOS PARA TU WEB
    event SubscriptionBought(address indexed user, uint256 expiration, string method);
    event NFTSold(uint256 indexed id, address buyer, uint256 price);
    event BundleSold(uint256 indexed id, address buyer, uint256 price);

    constructor() Ownable(0xD1f7a79CE44b267Dfe51B6F84008208550a30562) {
        allowedTokens[0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174] = true;  // USDC Polygon
    }

    // --- 💎 SISTEMA DE SUSCRIPCIÓN & FIAT ---
    function buySubWithUSDC() external nonReentrant {
        IERC20(0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174).transferFrom(msg.sender, TREASURY, subscriptionPriceUSDC);
        _activateSub(msg.sender, "USDC");
    }

    function grantSubFromPayPal(address user, uint256 daysCount) external onlyOwner {
        subscriptionEnd[user] = block.timestamp + (daysCount * 1 days);
        emit SubscriptionBought(user, subscriptionEnd[user], "PAYPAL_CARD");
    }

    // --- 🚀 LISTINGS & BUNDLES (Punto #5) ---
    function listNFT(address nft, uint256 tokenId, uint256 price, address token) external payable whenNotPaused {
        if (subscriptionEnd[msg.sender] < block.timestamp) {
            require(msg.value == listingFee, "Paga tarifa");
            _payable(TREASURY, msg.value);
        }
        IERC721(nft).transferFrom(msg.sender, address(this), tokenId);
        listings[listingCount] = Listing(msg.sender, nft, tokenId, price, token, true, false);
        listingCount++;
    }

    function createBundle(address[] calldata nfts, uint256[] calldata ids, uint256 price) external payable {
        require(nfts.length == ids.length, "Data mismatch");
        if (subscriptionEnd[msg.sender] < block.timestamp) {
            _payable(TREASURY, msg.value);
        }
        for(uint i=0; i < nfts.length; i++) {
            IERC721(nfts[i]).transferFrom(msg.sender, address(this), ids[i]);
        }
        bundles[bundleCount] = Bundle(msg.sender, nfts, ids, price, true);
        bundleCount++;
    }

    // --- 💰 MONETIZACIÓN ACTIVA (Puntos #1, #2, #3) ---
    function featureMyNFT(uint256 id) external payable {
        require(msg.value == featuredFee, "Paga Featured");
        listings[id].isFeatured = true;
        _payable(TREASURY, msg.value);
    }

    function verifyCollection(address nft) external payable {
        require(msg.value == verificationFee, "Paga Verification");
        verifiedCollections[nft] = true;
        _payable(TREASURY, msg.value);
    }

    function cancelMyListing(uint256 id) external payable nonReentrant {
        require(msg.value == cancelFee, "Paga Cancel Fee");
        Listing storage item = listings[id];
        require(item.seller == msg.sender);
        item.active = false;
        _payable(TREASURY, msg.value);
        IERC721(item.nft).safeTransferFrom(address(this), msg.sender, item.tokenId);
    }

    // --- 🤝 VENTAS CON REFERIDOS (Punto #6) ---
    function buyNFT(uint256 id, address referrer) external payable nonReentrant {
        Listing storage item = listings[id];
        require(item.active, "No activo");
        
        uint256 fee = (item.price * saleFeeBps) / 10000;
        
        if (referrer != address(0) && referrer != item.seller) {
            uint256 refPay = (item.price * referralRewardBps) / 10000;
            fee -= refPay;
            _payable(referrer, refPay);
        }

        _payable(TREASURY, fee);
        _payable(item.seller, item.price - (item.price * saleFeeBps / 10000));
        IERC721(item.nft).safeTransferFrom(address(this), msg.sender, item.tokenId);
        item.active = false;
    }

    // --- ⚙️ FUNCIONES INTERNAS ---
    function _activateSub(address user, string memory m) internal {
        subscriptionEnd[user] = (subscriptionEnd[user] > block.timestamp) 
            ? subscriptionEnd[user] + SUB_DURATION : block.timestamp + SUB_DURATION;
        emit SubscriptionBought(user, subscriptionEnd[user], m);
    }

    function _payable(address rec, uint256 val) internal {
        (bool s,) = payable(rec).call{value: val}("");
        require(s);
    }

    function setParams(uint256 _s, uint256 _l, uint256 _c, uint256 _f, uint256 _v) external onlyOwner {
        saleFeeBps = _s; listingFee = _l; cancelFee = _c; featuredFee = _f; verificationFee = _v;
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
