// Product Categories
export const CATEGORIES = {
    ELECTRONICS: {
        name: 'Electronics',
        slug: 'electronics',
        subcategories: ['Phones', 'Laptops', 'Tablets', 'Accessories', 'Gaming', 'Audio'],
    },
    FASHION: {
        name: 'Fashion',
        slug: 'fashion',
        subcategories: ['Men', 'Women', 'Kids', 'Shoes', 'Accessories', 'Bags'],
    },
    HOME: {
        name: 'Home & Garden',
        slug: 'home-garden',
        subcategories: ['Furniture', 'Decor', 'Kitchen', 'Bedding', 'Garden', 'Tools'],
    },
    SPORTS: {
        name: 'Sports & Outdoors',
        slug: 'sports-outdoors',
        subcategories: ['Fitness', 'Camping', 'Cycling', 'Water Sports', 'Team Sports'],
    },
    TOYS: {
        name: 'Toys & Games',
        slug: 'toys-games',
        subcategories: ['Action Figures', 'Board Games', 'Puzzles', 'Educational', 'Outdoor'],
    },
    BOOKS: {
        name: 'Books & Media',
        slug: 'books-media',
        subcategories: ['Fiction', 'Non-Fiction', 'Comics', 'Music', 'Movies'],
    },
    AUTOMOTIVE: {
        name: 'Automotive',
        slug: 'automotive',
        subcategories: ['Parts', 'Accessories', 'Tools', 'Care', 'Electronics'],
    },
    OTHER: {
        name: 'Other',
        slug: 'other',
        subcategories: ['Collectibles', 'Art', 'Crafts', 'Antiques', 'Miscellaneous'],
    },
} as const;

export const PRODUCT_CONDITIONS = [
    { value: 'new', label: 'New' },
    { value: 'like-new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
] as const;

export const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'most-liked', label: 'Most Liked' },
] as const;

export function getCategoryBySlug(slug: string) {
    return Object.values(CATEGORIES).find(cat => cat.slug === slug);
}

export function getAllCategories() {
    return Object.values(CATEGORIES);
}
