'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AIDescriptionGeneratorProps {
    title: string;
    category: string;
    condition: string;
    onGenerated: (description: string) => void;
}

export default function AIDescriptionGenerator({
    title,
    category,
    condition,
    onGenerated,
}: AIDescriptionGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!title || !category) {
            toast.error('Please fill in title and category first');
            return;
        }

        setIsGenerating(true);

        try {
            const response = await fetch('/api/ai/description', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, category, condition }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate description');
            }

            const data = await response.json();
            onGenerated(data.description);
            toast.success('Description generated!');
        } catch (error) {
            console.error(error);
            toast.error('AI service unavailable');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
            {isGenerating ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                </>
            ) : (
                <>
                    <Sparkles className="w-4 h-4" />
                    Generate with AI
                </>
            )}
        </button>
    );
}
