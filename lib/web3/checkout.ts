// Updated Checkout Logic for Multi-Currency Tokens
// Handles both ETH and ERC20 token payments

import { ethers } from 'ethers';
import { approveToken } from './erc20-approval';

const ESCROW_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS || '';

export async function depositToEscrow(
    orderId: string,
    amount: string,
    tokenAddress: string | null,
    signer: ethers.Signer
): Promise<{ success: boolean; txHash?: string }> {
    try {
        const escrowABI = [
            'function createOrderETH(bytes32 orderId, address seller) external payable',
            'function createOrderERC20(bytes32 orderId, address seller, address tokenAddress, uint256 amount) external',
        ];

        const escrowContract = new ethers.Contract(
            ESCROW_CONTRACT_ADDRESS,
            escrowABI,
            signer
        );

        const orderIdBytes = ethers.utils.formatBytes32String(orderId);
        const sellerAddress = '0x...'; // Get from order data

        let tx;

        if (!tokenAddress || tokenAddress === 'ETH') {
            // ETH payment
            tx = await escrowContract.createOrderETH(orderIdBytes, sellerAddress, {
                value: ethers.utils.parseEther(amount),
            });
        } else {
            // ERC20 payment
            // First approve token
            const approvalResult = await approveToken(
                tokenAddress,
                ESCROW_CONTRACT_ADDRESS,
                amount,
                signer
            );

            if (!approvalResult.success) {
                throw new Error('Token approval failed');
            }

            // Then create order
            tx = await escrowContract.createOrderERC20(
                orderIdBytes,
                sellerAddress,
                tokenAddress,
                ethers.utils.parseEther(amount)
            );
        }

        const receipt = await tx.wait();
        return { success: true, txHash: receipt.transactionHash };
    } catch (error) {
        console.error('Deposit error:', error);
        return { success: false };
    }
}
