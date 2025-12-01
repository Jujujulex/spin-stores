'use client';

import { PRODUCT_CONDITIONS, SORT_OPTIONS } from '@/lib/constants/categories';

interface ConditionFilterProps {
    selectedConditions: string[];
    onConditionChange: (conditions: string[]) => void;
}

export function ConditionFilter({ selectedConditions, onConditionChange }: ConditionFilterProps) {
    const toggleCondition = (condition: string) => {
        if (selectedConditions.includes(condition)) {
            onConditionChange(selectedConditions.filter(c => c !== condition));
        } else {
            onConditionChange([...selectedConditions, condition]);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <h3 className="font-semibold text-lg mb-4">Condition</h3>
            <div className="space-y-2">
                {PRODUCT_CONDITIONS.map((condition) => (
                    <label key={condition.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={selectedConditions.includes(condition.value)}
                            onChange={() => toggleCondition(condition.value)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm">{condition.label}</span>
                    </label>
                ))}
            </div>
            {selectedConditions.length > 0 && (
                <button
                    onClick={() => onConditionChange([])}
                    className="mt-3 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                    Clear Condition Filter
                </button>
            )}
        </div>
    );
}

interface SortSelectProps {
    sortBy: string;
    onSortChange: (sort: string) => void;
}

export function SortSelect({ sortBy, onSortChange }: SortSelectProps) {
    return (
        <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</label>
            <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primary-500"
            >
                {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
