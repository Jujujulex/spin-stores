export interface User {
    id: string;
    walletAddress: string;
    username?: string | null;
    email?: string | null;
    bio?: string | null;
    avatar?: string | null;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    condition: 'new' | 'used' | 'refurbished';
    quantity: number;
    isActive: boolean;
    sellerId: string;
    createdAt: Date;
    updatedAt: Date;
}

export enum OrderStatus {
    PENDING = 'PENDING',
    PAYMENT_PENDING = 'PAYMENT_PENDING',
    PAID = 'PAID',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    COMPLETED = 'COMPLETED',
    DISPUTED = 'DISPUTED',
    CANCELLED = 'CANCELLED',
    REFUNDED = 'REFUNDED',
}

export interface Order {
    id: string;
    status: OrderStatus;
    totalAmount: number;
    escrowAddress?: string | null;
    trackingNumber?: string | null;
    disputeReason?: string | null;
    buyerId: string;
    sellerId: string;
    productId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Message {
    id: string;
    content: string;
    attachments: string[];
    read: boolean;
    senderId: string;
    receiverId: string;
    orderId?: string | null;
    createdAt: Date;
}

export enum NotificationType {
    ORDER_CREATED = 'ORDER_CREATED',
    ORDER_PAID = 'ORDER_PAID',
    ORDER_SHIPPED = 'ORDER_SHIPPED',
    ORDER_DELIVERED = 'ORDER_DELIVERED',
    ORDER_COMPLETED = 'ORDER_COMPLETED',
    ORDER_DISPUTED = 'ORDER_DISPUTED',
    MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
    PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
    PRODUCT_SOLD = 'PRODUCT_SOLD',
}

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    content: string;
    read: boolean;
    userId: string;
    createdAt: Date;
}

// Escrow types
export interface EscrowTransaction {
    orderId: string;
    buyer: string;
    seller: string;
    amount: number;
    status: 'locked' | 'released' | 'refunded';
    createdAt: number;
}

export interface EscrowContractData {
    address: string;
    abi: any[];
}
