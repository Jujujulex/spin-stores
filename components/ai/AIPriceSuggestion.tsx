'use client';

import { useState } from 'react';
import { DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AIPriceSuggestionProps {
    title: string;
    category: string;
    condition: string;
    onSuggested: (price: number) => void;
}

export default function AIPriceSuggestion({
    title,
    category,
    condition,
    onSuggested,
}: AIPriceSuggestionProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleSuggest = async () => {
        if (!title || !category) {
            toast.error('Please fill in title and category first');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/ai/price', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, category, condition }),
            });

            if (!response.ok) {
                throw new Error('Failed to suggest price');
            }

            const data = await response.json();
            onSuggested(data.suggestedPrice);
            toast.success(`Suggested price: ${data.suggestedPrice} ETH`);
        } catch (error) {
            console.error(error);
            toast.error('AI service unavailable');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleSuggest}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Suggesting...
                </>
            ) : (
                <>
                    <DollarSign className="w-4 h-4" />
                    Suggest Price
                </>
            )}
        </button>
    );
}
