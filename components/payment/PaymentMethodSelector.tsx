'use client';

import { useState } from 'react';
import { DollarSign } from 'lucide-react';

interface PaymentMethodSelectorProps {
    selectedToken: string;
    onSelect: (token: string) => void;
}

const SUPPORTED_TOKENS = [
    { symbol: 'ETH', name: 'Ethereum', icon: '⟠' },
    { symbol: 'USDC', name: 'USD Coin', icon: '💵' },
    { symbol: 'USDT', name: 'Tether', icon: '💲' },
    { symbol: 'DAI', name: 'Dai Stablecoin', icon: '◈' },
];

export default function PaymentMethodSelector({
    selectedToken,
    onSelect,
}: PaymentMethodSelectorProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Payment Token
            </label>
            <div className="grid grid-cols-2 gap-3">
                {SUPPORTED_TOKENS.map((token) => (
                    <button
                        key={token.symbol}
                        onClick={() => onSelect(token.symbol)}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${selectedToken === token.symbol
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                    >
                        <span className="text-2xl">{token.icon}</span>
                        <div className="text-left">
                            <div className="font-semibold text-gray-900 dark:text-white">
                                {token.symbol}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {token.name}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
