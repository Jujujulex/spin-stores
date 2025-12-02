// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SpinStoresEscrow
 * @dev Enhanced escrow contract with ERC20 token support
 */
contract SpinStoresEscrow is ReentrancyGuard {
    address public owner;
    
    struct Order {
        address buyer;
        address seller;
        uint256 amount;
        address tokenAddress; // address(0) for ETH, otherwise ERC20 token
        bool isCompleted;
        bool isDisputed;
    }
    
    mapping(bytes32 => Order) public orders;
    
    event OrderCreated(bytes32 indexed orderId, address buyer, address seller, uint256 amount, address token);
    event OrderCompleted(bytes32 indexed orderId);
    event OrderDisputed(bytes32 indexed orderId);
    event OrderRefunded(bytes32 indexed orderId);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    /**
     * @dev Create order with ETH
     */
    function createOrderETH(bytes32 orderId, address seller) external payable nonReentrant {
        require(orders[orderId].buyer == address(0), "Order exists");
        require(msg.value > 0, "Amount must be > 0");
        
        orders[orderId] = Order({
            buyer: msg.sender,
            seller: seller,
            amount: msg.value,
            tokenAddress: address(0),
            isCompleted: false,
            isDisputed: false
        });
        
        emit OrderCreated(orderId, msg.sender, seller, msg.value, address(0));
    }
    
    /**
     * @dev Create order with ERC20 token
     */
    function createOrderERC20(
        bytes32 orderId,
        address seller,
        address tokenAddress,
        uint256 amount
    ) external nonReentrant {
        require(orders[orderId].buyer == address(0), "Order exists");
        require(amount > 0, "Amount must be > 0");
        require(tokenAddress != address(0), "Invalid token");
        
        IERC20 token = IERC20(tokenAddress);
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        orders[orderId] = Order({
            buyer: msg.sender,
            seller: seller,
            amount: amount,
            tokenAddress: tokenAddress,
            isCompleted: false,
            isDisputed: false
        });
        
        emit OrderCreated(orderId, msg.sender, seller, amount, tokenAddress);
    }
    
    /**
     * @dev Complete order and release funds to seller
     */
    function completeOrder(bytes32 orderId) external nonReentrant {
        Order storage order = orders[orderId];
        require(order.buyer == msg.sender || msg.sender == owner, "Not authorized");
        require(!order.isCompleted, "Already completed");
        require(!order.isDisputed, "Order disputed");
        
        order.isCompleted = true;
        
        if (order.tokenAddress == address(0)) {
            // Transfer ETH
            payable(order.seller).transfer(order.amount);
        } else {
            // Transfer ERC20
            IERC20 token = IERC20(order.tokenAddress);
            require(token.transfer(order.seller, order.amount), "Transfer failed");
        }
        
        emit OrderCompleted(orderId);
    }
    
    /**
     * @dev Dispute order
     */
    function disputeOrder(bytes32 orderId) external {
        Order storage order = orders[orderId];
        require(order.buyer == msg.sender || order.seller == msg.sender, "Not authorized");
        require(!order.isCompleted, "Already completed");
        
        order.isDisputed = true;
        emit OrderDisputed(orderId);
    }
    
    /**
     * @dev Refund order (owner only)
     */
    function refundOrder(bytes32 orderId) external onlyOwner nonReentrant {
        Order storage order = orders[orderId];
        require(!order.isCompleted, "Already completed");
        
        order.isCompleted = true;
        
        if (order.tokenAddress == address(0)) {
            payable(order.buyer).transfer(order.amount);
        } else {
            IERC20 token = IERC20(order.tokenAddress);
            require(token.transfer(order.buyer, order.amount), "Transfer failed");
        }
        
        emit OrderRefunded(orderId);
    }
}
