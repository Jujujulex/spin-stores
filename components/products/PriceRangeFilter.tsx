'use client';

import { useState, useEffect } from 'react';

interface PriceRangeFilterProps {
    minPrice: number;
    maxPrice: number;
    onPriceChange: (min: number, max: number) => void;
}

export default function PriceRangeFilter({ minPrice, maxPrice, onPriceChange }: PriceRangeFilterProps) {
    const [min, setMin] = useState(minPrice);
    const [max, setMax] = useState(maxPrice);

    useEffect(() => {
        const timer = setTimeout(() => {
            onPriceChange(min, max);
        }, 500); // Debounce

        return () => clearTimeout(timer);
    }, [min, max]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <h3 className="font-semibold text-lg mb-4">Price Range</h3>

            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Min</label>
                        <input
                            type="number"
                            value={min}
                            onChange={(e) => setMin(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                            placeholder="0"
                            min="0"
                        />
                    </div>
                    <span className="text-gray-400 mt-5">-</span>
                    <div className="flex-1">
                        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Max</label>
                        <input
                            type="number"
                            value={max}
                            onChange={(e) => setMax(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                            placeholder="Any"
                            min="0"
                        />
                    </div>
                </div>

                {/* Visual Range Slider */}
                <div className="relative pt-2">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div
                            className="h-2 bg-primary-600 rounded-full"
                            style={{
                                marginLeft: `${(min / (max || 1000)) * 100}%`,
                                width: `${((max - min) / (max || 1000)) * 100}%`,
                            }}
                        />
                    </div>
                </div>

                {/* Clear Button */}
                {(min > 0 || max < 10000) && (
                    <button
                        onClick={() => {
                            setMin(0);
                            setMax(10000);
                        }}
                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                    >
                        Clear Price Filter
                    </button>
                )}
            </div>
        </div>
    );
}
