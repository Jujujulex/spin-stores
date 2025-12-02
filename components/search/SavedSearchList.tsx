'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Bookmark, Trash2, Search } from 'lucide-react';
import Link from 'next/link';

interface SavedSearch {
    id: string;
    name: string;
    query?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    createdAt: Date;
}

export default function SavedSearchList() {
    const router = useRouter();
    const [searches, setSearches] = useState<SavedSearch[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSavedSearches();
    }, []);

    const fetchSavedSearches = async () => {
        try {
            const response = await fetch('/api/saved-searches');
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setSearches(data.savedSearches);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load saved searches');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this saved search?')) return;

        try {
            const response = await fetch(`/api/saved-searches/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete');

            toast.success('Saved search deleted');
            setSearches(searches.filter((s) => s.id !== id));
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete saved search');
        }
    };

    const buildSearchUrl = (search: SavedSearch) => {
        const params = new URLSearchParams();
        if (search.query) params.set('q', search.query);
        if (search.category) params.set('category', search.category);
        if (search.minPrice) params.set('minPrice', search.minPrice.toString());
        if (search.maxPrice) params.set('maxPrice', search.maxPrice.toString());
        if (search.condition) params.set('condition', search.condition);
        return `/products?${params.toString()}`;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (searches.length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <Bookmark className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No saved searches yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Save your searches to quickly find items you're looking for
                </p>
                <Link
                    href="/products"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {searches.map((search) => (
                <div
                    key={search.id}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                {search.name}
                            </h3>
                            <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
                                {search.query && (
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                        Query: {search.query}
                                    </span>
                                )}
                                {search.category && (
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                        Category: {search.category}
                                    </span>
                                )}
                                {(search.minPrice || search.maxPrice) && (
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                        Price: {search.minPrice || 0} - {search.maxPrice || '∞'} ETH
                                    </span>
                                )}
                                {search.condition && (
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                        Condition: {search.condition}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                            <Link
                                href={buildSearchUrl(search)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                                title="Run search"
                            >
                                <Search className="w-5 h-5" />
                            </Link>
                            <button
                                onClick={() => handleDelete(search.id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
