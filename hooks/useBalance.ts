import { useBalance as useWagmiBalance, useAccount } from 'wagmi';
import { useEffect, useState } from 'react';

export function useBalance() {
    const { address } = useAccount();
    const { data, isError, isLoading, refetch } = useWagmiBalance({
        address,
    });

    const [isLowBalance, setIsLowBalance] = useState(false);
    const LOW_BALANCE_THRESHOLD = 0.01; // ETH

    useEffect(() => {
        if (data) {
            const balance = parseFloat(data.formatted);
            setIsLowBalance(balance < LOW_BALANCE_THRESHOLD);
        }
    }, [data]);

    return {
        balance: data?.formatted || '0',
        symbol: data?.symbol || 'ETH',
        isLoading,
        isError,
        isLowBalance,
        refetch,
        formatted: data ? `${parseFloat(data.formatted).toFixed(4)} ${data.symbol}` : '0.0000 ETH'
    };
}
