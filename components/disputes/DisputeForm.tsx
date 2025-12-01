'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface DisputeFormProps {
    orderId: string;
    onSuccess: () => void;
}

const DISPUTE_REASONS = [
    'Item not as described',
    'Item not received',
    'Item damaged',
    'Wrong item sent',
    'Quality issues',
    'Other',
];

export default function DisputeForm({ orderId, onSuccess }: DisputeFormProps) {
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!reason || !description) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/disputes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    reason,
                    description,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create dispute');
            }

            toast.success('Dispute raised successfully');
            onSuccess();
        } catch (error) {
            console.error('Error creating dispute:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create dispute');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">Reason for Dispute</label>
                <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    required
                >
                    <option value="">Select a reason...</option>
                    {DISPUTE_REASONS.map((r) => (
                        <option key={r} value={r}>
                            {r}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 min-h-[120px]"
                    placeholder="Please provide details about the issue..."
                    required
                />
            </div>

            <div className="flex justify-end gap-3">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
                >
                    {isSubmitting ? 'Submitting...' : 'Raise Dispute'}
                </button>
            </div>
        </form>
    );
}
