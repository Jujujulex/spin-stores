// ERC20 Approval Flow for Token Payments
// Handles token approvals before escrow deposits

import { ethers } from 'ethers';

const ERC20_ABI = [
    'function approve(address spender, uint256 amount) public returns (bool)',
    'function allowance(address owner, address spender) public view returns (uint256)',
];

export async function approveToken(
    tokenAddress: string,
    spenderAddress: string,
    amount: string,
    signer: ethers.Signer
): Promise<{ success: boolean; txHash?: string }> {
    try {
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

        const tx = await tokenContract.approve(spenderAddress, ethers.utils.parseEther(amount));
        const receipt = await tx.wait();

        return { success: true, txHash: receipt.transactionHash };
    } catch (error) {
        console.error('Token approval error:', error);
        return { success: false };
    }
}

export async function checkAllowance(
    tokenAddress: string,
    ownerAddress: string,
    spenderAddress: string,
    provider: ethers.providers.Provider
): Promise<string> {
    try {
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const allowance = await tokenContract.allowance(ownerAddress, spenderAddress);
        return ethers.utils.formatEther(allowance);
    } catch (error) {
        console.error('Allowance check error:', error);
        return '0';
    }
}
