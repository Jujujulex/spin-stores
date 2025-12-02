'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Sparkles, Loader2 } from 'lucide-react';

interface ReferralDashboardProps {
    initialCode?: string;
    initialUses?: number;
}

export default function ReferralDashboard({ initialCode, initialUses = 0 }: ReferralDashboardProps) {
    const router = useRouter();
    const [code, setCode] = useState(initialCode || '');
    const [uses, setUses] = useState(initialUses);
    const [isLoading, setIsLoading] = useState(false);
    const [inputCode, setInputCode] = useState('');

    const handleApplyCode = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!inputCode.trim()) {
            toast.error('Please enter a referral code');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/referral', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: inputCode }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to apply code');
            }

            toast.success('Referral code applied! Points awarded.');
            setInputCode('');
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyCode = () => {
        if (code) {
            navigator.clipboard.writeText(code);
            toast.success('Referral code copied!');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-6 h-6" />
                    <h2 className="text-2xl font-bold">Your Referral Code</h2>
                </div>

                {code ? (
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <code className="text-3xl font-mono font-bold">{code}</code>
                            <button
                                onClick={handleCopyCode}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-md transition-colors"
                            >
                                Copy
                            </button>
                        </div>
                        <p className="text-white/80">
                            Share this code with friends to earn 500 points per referral!
                        </p>
                        <p className="text-sm text-white/60 mt-2">
                            Total uses: {uses}
                        </p>
                    </div>
                ) : (
                    <p className="text-white/80">Loading your referral code...</p>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Have a referral code?
                </h3>
                <form onSubmit={handleApplyCode} className="flex gap-3">
                    <input
                        type="text"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Applying...
                            </>
                        ) : (
                            'Apply'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
