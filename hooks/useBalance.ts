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
            const balance = Number(data.value) / Math.pow(10, data.decimals);
            setIsLowBalance(balance < LOW_BALANCE_THRESHOLD);
        }
    }, [data]);

    const formatBalance = (value: bigint, decimals: number) => {
        return (Number(value) / Math.pow(10, decimals)).toFixed(4);
    };

    return {
        balance: data ? formatBalance(data.value, data.decimals) : '0',
        symbol: data?.symbol || 'ETH',
        isLoading,
        isError,
        isLowBalance,
        refetch,
        formatted: data ? `${formatBalance(data.value, data.decimals)} ${data.symbol}` : '0.0000 ETH'
    };
}
