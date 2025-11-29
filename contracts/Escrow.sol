// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Escrow
 * @dev Escrow contract for P2P marketplace transactions
 */
contract Escrow is ReentrancyGuard, Ownable {
    uint256 public platformFeePercent = 250; // 2.5% (basis points)
    uint256 private constant BASIS_POINTS = 10000;
    
    enum EscrowStatus {
        ACTIVE,
        RELEASED,
        REFUNDED,
        DISPUTED
    }
    
    struct EscrowTransaction {
        address buyer;
        address seller;
        uint256 amount;
        uint256 createdAt;
        EscrowStatus status;
        string orderId;
    }
    
    mapping(bytes32 => EscrowTransaction) public escrows;
    mapping(address => uint256) public pendingWithdrawals;
    
    event EscrowCreated(
        bytes32 indexed escrowId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        string orderId
    );
    
    event PaymentReleased(
        bytes32 indexed escrowId,
        address indexed seller,
        uint256 amount,
        uint256 fee
    );
    
    event RefundIssued(
        bytes32 indexed escrowId,
        address indexed buyer,
        uint256 amount
    );
    
    event DisputeRaised(
        bytes32 indexed escrowId,
        address indexed initiator
    );
    
    event DisputeResolved(
        bytes32 indexed escrowId,
        address indexed winner,
        uint256 amount
    );
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Create a new escrow transaction
     * @param seller Address of the seller
     * @param orderId Unique order identifier
     */
    function createEscrow(
        address seller,
        string memory orderId
    ) external payable nonReentrant returns (bytes32) {
        require(msg.value > 0, "Amount must be greater than 0");
        require(seller != address(0), "Invalid seller address");
        require(seller != msg.sender, "Buyer and seller cannot be the same");
        
        bytes32 escrowId = keccak256(
            abi.encodePacked(msg.sender, seller, orderId, block.timestamp)
        );
        
        require(escrows[escrowId].buyer == address(0), "Escrow already exists");
        
        escrows[escrowId] = EscrowTransaction({
            buyer: msg.sender,
            seller: seller,
            amount: msg.value,
            createdAt: block.timestamp,
            status: EscrowStatus.ACTIVE,
            orderId: orderId
        });
        
        emit EscrowCreated(escrowId, msg.sender, seller, msg.value, orderId);
        
        return escrowId;
    }
    
    /**
     * @dev Release payment to seller (called by buyer after delivery confirmation)
     * @param escrowId The escrow transaction ID
     */
    function releasePayment(bytes32 escrowId) external nonReentrant {
        EscrowTransaction storage escrow = escrows[escrowId];
        
        require(escrow.buyer == msg.sender, "Only buyer can release payment");
        require(escrow.status == EscrowStatus.ACTIVE, "Escrow not active");
        
        uint256 fee = (escrow.amount * platformFeePercent) / BASIS_POINTS;
        uint256 sellerAmount = escrow.amount - fee;
        
        escrow.status = EscrowStatus.RELEASED;
        
        pendingWithdrawals[escrow.seller] += sellerAmount;
        pendingWithdrawals[owner()] += fee;
        
        emit PaymentReleased(escrowId, escrow.seller, sellerAmount, fee);
    }
    
    /**
     * @dev Refund buyer (called by seller or admin)
     * @param escrowId The escrow transaction ID
     */
    function refundBuyer(bytes32 escrowId) external nonReentrant {
        EscrowTransaction storage escrow = escrows[escrowId];
        
        require(
            escrow.seller == msg.sender || owner() == msg.sender,
            "Only seller or owner can refund"
        );
        require(escrow.status == EscrowStatus.ACTIVE, "Escrow not active");
        
        escrow.status = EscrowStatus.REFUNDED;
        
        pendingWithdrawals[escrow.buyer] += escrow.amount;
        
        emit RefundIssued(escrowId, escrow.buyer, escrow.amount);
    }
    
    /**
     * @dev Raise a dispute
     * @param escrowId The escrow transaction ID
     */
    function raiseDispute(bytes32 escrowId) external {
        EscrowTransaction storage escrow = escrows[escrowId];
        
        require(
            escrow.buyer == msg.sender || escrow.seller == msg.sender,
            "Only buyer or seller can raise dispute"
        );
        require(escrow.status == EscrowStatus.ACTIVE, "Escrow not active");
        
        escrow.status = EscrowStatus.DISPUTED;
        
        emit DisputeRaised(escrowId, msg.sender);
    }
    
    /**
     * @dev Resolve a dispute (only owner)
     * @param escrowId The escrow transaction ID
     * @param winner Address of the dispute winner
     */
    function resolveDispute(
        bytes32 escrowId,
        address winner
    ) external onlyOwner nonReentrant {
        EscrowTransaction storage escrow = escrows[escrowId];
        
        require(escrow.status == EscrowStatus.DISPUTED, "No active dispute");
        require(
            winner == escrow.buyer || winner == escrow.seller,
            "Winner must be buyer or seller"
        );
        
        if (winner == escrow.seller) {
            uint256 fee = (escrow.amount * platformFeePercent) / BASIS_POINTS;
            uint256 sellerAmount = escrow.amount - fee;
            
            pendingWithdrawals[escrow.seller] += sellerAmount;
            pendingWithdrawals[owner()] += fee;
            escrow.status = EscrowStatus.RELEASED;
        } else {
            pendingWithdrawals[escrow.buyer] += escrow.amount;
            escrow.status = EscrowStatus.REFUNDED;
        }
        
        emit DisputeResolved(escrowId, winner, escrow.amount);
    }
    
    /**
     * @dev Withdraw pending funds
     */
    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No funds to withdraw");
        
        pendingWithdrawals[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
    
    /**
     * @dev Update platform fee (only owner)
     * @param newFeePercent New fee percentage in basis points
     */
    function updatePlatformFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 1000, "Fee cannot exceed 10%");
        platformFeePercent = newFeePercent;
    }
    
    /**
     * @dev Get escrow details
     * @param escrowId The escrow transaction ID
     */
    function getEscrow(bytes32 escrowId)
        external
        view
        returns (
            address buyer,
            address seller,
            uint256 amount,
            uint256 createdAt,
            EscrowStatus status,
            string memory orderId
        )
    {
        EscrowTransaction memory escrow = escrows[escrowId];
        return (
            escrow.buyer,
            escrow.seller,
            escrow.amount,
            escrow.createdAt,
            escrow.status,
            escrow.orderId
        );
    }
}
