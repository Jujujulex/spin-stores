// Gasless Deposit Integration
// Integrates Biconomy for gasless escrow deposits

import { executeGaslessDeposit, isBiconomyEnabled } from './gasless';

export async function depositWithGaslessOption(
    userAddress: string,
    amount: string,
    orderId: string,
    useGasless: boolean = false
): Promise<{ success: boolean; txHash?: string; gasless?: boolean }> {

    if (useGasless && isBiconomyEnabled()) {
        console.log('Attempting gasless deposit...');
        const result = await executeGaslessDeposit(userAddress, amount, orderId);

        if (result.success) {
            return { ...result, gasless: true };
        }

        console.log('Gasless deposit failed, falling back to regular deposit');
    }

    // Fallback to regular deposit
    // This would call the standard escrow deposit function
    console.log('Using regular deposit');

    return { success: false, gasless: false };
}

export function shouldOfferGaslessDeposit(): boolean {
    return isBiconomyEnabled();
}
