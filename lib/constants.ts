export const categories = [
    {
        name: 'Electronics',
        icon: '📱',
        description: 'Phones, computers, and gadgets',
    },
    {
        name: 'Fashion',
        icon: '👕',
        description: 'Clothing, shoes, and accessories',
    },
    {
        name: 'Home & Garden',
        icon: '🏠',
        description: 'Furniture, decor, and tools',
    },
    {
        name: 'Sports',
        icon: '⚽',
        description: 'Equipment and sportswear',
    },
    {
        name: 'Books',
        icon: '📚',
        description: 'Books, magazines, and comics',
    },
    {
        name: 'Toys',
        icon: '🧸',
        description: 'Toys and games for all ages',
    },
    {
        name: 'Art',
        icon: '🎨',
        description: 'Artwork, crafts, and supplies',
    },
    {
        name: 'Other',
        icon: '📦',
        description: 'Everything else',
    },
];

export const orderStatuses = {
    PENDING: { label: 'Pending', color: 'yellow' },
    PAYMENT_PENDING: { label: 'Payment Pending', color: 'orange' },
    PAID: { label: 'Paid', color: 'blue' },
    PROCESSING: { label: 'Processing', color: 'purple' },
    SHIPPED: { label: 'Shipped', color: 'indigo' },
    DELIVERED: { label: 'Delivered', color: 'green' },
    COMPLETED: { label: 'Completed', color: 'green' },
    DISPUTED: { label: 'Disputed', color: 'red' },
    CANCELLED: { label: 'Cancelled', color: 'gray' },
    REFUNDED: { label: 'Refunded', color: 'gray' },
};
