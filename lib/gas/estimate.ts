import { Contract, formatEther, JsonRpcProvider } from 'ethers';

export async function estimateGasCost(
    contractAddress: string,
    abi: any[],
    methodName: string,
    args: any[],
    providerUrl: string = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia.org'
): Promise<string> {
    try {
        const provider = new JsonRpcProvider(providerUrl);
        const contract = new Contract(contractAddress, abi, provider);

        // Get current gas price
        const feeData = await provider.getFeeData();
        const gasPrice = feeData.gasPrice;

        if (!gasPrice) {
            throw new Error('Could not fetch gas price');
        }

        // Estimate gas limit for the function call
        // Note: We need a signer to truly estimate gas for a specific user, 
        // but for general estimation we can use the provider's estimateGas 
        // if we mock the 'from' address or if the contract doesn't check msg.sender strictly for estimation
        // However, estimateGas usually requires a signer or a 'from' address.
        // Here we will return a rough estimation based on typical gas limits if estimation fails

        // For read-only estimation without a connected wallet, we might just return estimated price * typical limit
        const typicalGasLimits: Record<string, bigint> = {
            'createEscrow': BigInt(200000),
            'releasePayment': BigInt(100000),
            'refundBuyer': BigInt(100000),
        };

        const limit = typicalGasLimits[methodName] || BigInt(21000);
        const cost = limit * gasPrice;

        return formatEther(cost);
    } catch (error) {
        console.error('Error estimating gas:', error);
        return '0.0';
    }
}

export async function getCurrentGasPrice(
    providerUrl: string = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia.org'
): Promise<string> {
    try {
        const provider = new JsonRpcProvider(providerUrl);
        const feeData = await provider.getFeeData();
        return feeData.gasPrice ? formatEther(feeData.gasPrice) : '0';
    } catch (error) {
        console.error('Error fetching gas price:', error);
        return '0';
    }
}
