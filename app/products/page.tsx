'use client';

import { useEffect, useState } from 'react';
import ProductGrid from '@/components/products/ProductGrid';
import CategoryFilter from '@/components/products/CategoryFilter';
import PriceRangeFilter from '@/components/products/PriceRangeFilter';
import ConditionFilter from '@/components/products/ConditionFilter';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ProductsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [subcategory, setSubcategory] = useState(searchParams.get('subcategory') || '');
    const [minPrice, setMinPrice] = useState(Number(searchParams.get('minPrice')) || 0);
    const [maxPrice, setMaxPrice] = useState(Number(searchParams.get('maxPrice')) || 10000);
    const [conditions, setConditions] = useState<string[]>(
        searchParams.get('conditions')?.split(',').filter(Boolean) || []
    );
    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');

    useEffect(() => {
        fetchProducts();
    }, [search, category, subcategory, minPrice, maxPrice, conditions, sortBy]);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (category) params.append('category', category);
            if (subcategory) params.append('subcategory', subcategory);
            if (minPrice > 0) params.append('minPrice', minPrice.toString());
            if (maxPrice < 10000) params.append('maxPrice', maxPrice.toString());
            if (conditions.length > 0) params.append('conditions', conditions.join(','));
            if (sortBy) params.append('sortBy', sortBy);

            const response = await fetch(`/api/products?${params}`);
            const data = await response.json();
            setProducts(data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCategoryChange = (cat: string, sub: string) => {
        setCategory(cat);
        setSubcategory(sub);
    };

    const handlePriceChange = (min: number, max: number) => {
        setMinPrice(min);
        setMaxPrice(max);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Mobile Filter Toggle */}
                    <button
                        className="md:hidden bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center justify-between"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <span className="font-semibold">Filters</span>
                        <svg
                            className={`w-5 h-5 transform transition-transform ${showFilters ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Sidebar Filters */}
                    <div className={`md:w-64 space-y-6 ${showFilters ? 'block' : 'hidden md:block'}`}>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                            <h3 className="font-semibold mb-4">Categories</h3>
                            <CategoryFilter
                                selectedCategory={category}
                                selectedSubcategory={subcategory}
                                onChange={handleCategoryChange}
                            />
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                            <h3 className="font-semibold mb-4">Price Range</h3>
                            <PriceRangeFilter
                                min={0}
                                max={10000}
                                currentMin={minPrice}
                                currentMax={maxPrice}
                                onChange={handlePriceChange}
                            />
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                            <ConditionFilter
                                selectedConditions={conditions}
                                onConditionChange={setConditions}
                                sortBy={sortBy}
                                onSortChange={setSortBy}
                            />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white shadow-sm"
                            />
                        </div>

                        <ProductGrid products={products} isLoading={isLoading} />
                    </div>
                </div>
            </div>
        </div>
    );
}
