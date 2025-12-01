'use client';

import { useState } from 'react';
import { CATEGORIES } from '@/lib/constants/categories';

interface CategoryFilterProps {
    selectedCategory: string | null;
    selectedSubcategory: string | null;
    onCategoryChange: (category: string | null) => void;
    onSubcategoryChange: (subcategory: string | null) => void;
}

export default function CategoryFilter({
    selectedCategory,
    selectedSubcategory,
    onCategoryChange,
    onSubcategoryChange,
}: CategoryFilterProps) {
    const [expandedCategory, setExpandedCategory] = useState<string | null>(selectedCategory);

    const handleCategoryClick = (categorySlug: string) => {
        if (selectedCategory === categorySlug) {
            onCategoryChange(null);
            onSubcategoryChange(null);
            setExpandedCategory(null);
        } else {
            onCategoryChange(categorySlug);
            onSubcategoryChange(null);
            setExpandedCategory(categorySlug);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <h3 className="font-semibold text-lg mb-4">Categories</h3>
            <div className="space-y-2">
                {Object.values(CATEGORIES).map((category) => (
                    <div key={category.slug}>
                        <button
                            onClick={() => handleCategoryClick(category.slug)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === category.slug
                                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-semibold'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span>{category.name}</span>
                                {category.subcategories.length > 0 && (
                                    <svg
                                        className={`w-4 h-4 transition-transform ${expandedCategory === category.slug ? 'rotate-180' : ''
                                            }`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                )}
                            </div>
                        </button>

                        {/* Subcategories */}
                        {expandedCategory === category.slug && category.subcategories.length > 0 && (
                            <div className="ml-4 mt-2 space-y-1">
                                {category.subcategories.map((subcategory) => (
                                    <button
                                        key={subcategory}
                                        onClick={() => onSubcategoryChange(subcategory)}
                                        className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${selectedSubcategory === subcategory
                                                ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                            }`}
                                    >
                                        {subcategory}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Clear Filter */}
            {(selectedCategory || selectedSubcategory) && (
                <button
                    onClick={() => {
                        onCategoryChange(null);
                        onSubcategoryChange(null);
                        setExpandedCategory(null);
                    }}
                    className="mt-4 w-full text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                    Clear Category Filter
                </button>
            )}
        </div>
    );
}
