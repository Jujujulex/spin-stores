'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { BrowserProvider, Contract, parseEther, type Eip1193Provider } from 'ethers';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';

// This would be imported from your deployed contract
const ESCROW_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS || '0x...';
const ESCROW_ABI = [
    'function createEscrow(address seller, string memory orderId) external payable returns (bytes32)',
    'event EscrowCreated(bytes32 indexed escrowId, address indexed buyer, address indexed seller, uint256 amount, string orderId)',
];

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const { address } = useAppKitAccount();
    const { walletProvider } = useAppKitProvider('eip155');
    const [product, setProduct] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (params.productId) {
            fetchProduct();
        }
    }, [params.productId]);

    const fetchProduct = async () => {
        try {
            const response = await fetch(`/api/products/${params.productId}`);
            const data = await response.json();
            setProduct(data);
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckout = async () => {
        if (!address || !walletProvider || !product) return;

        setIsProcessing(true);
        try {
            // Create order in database first
            const orderResponse = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    escrowAddress: ESCROW_CONTRACT_ADDRESS,
                }),
            });

            if (!orderResponse.ok) {
                throw new Error('Failed to create order');
            }

            const order = await orderResponse.json();

            // Create escrow transaction on blockchain
            const provider = new BrowserProvider(walletProvider as Eip1193Provider);
            const signer = await provider.getSigner();
            const escrowContract = new Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer);

            const tx = await escrowContract.createEscrow(
                product.seller.walletAddress,
                order.id,
                { value: parseEther(product.price.toString()) }
            );

            await tx.wait();

            // Update order with escrow transaction hash
            await fetch(`/api/orders/${order.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'PAID',
                    escrowAddress: tx.hash,
                }),
            });

            router.push(`/orders/${order.id}`);
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Failed to complete checkout. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Product not found
                    </h2>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    Checkout
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Summary */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                            <div className="flex gap-4 mb-6">
                                <div className="relative w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                                    {product.images && product.images[0] ? (
                                        <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg mb-1">{product.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Sold by: {product.seller.username || 'Anonymous'}
                                    </p>
                                    <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                        {formatPrice(product.price)}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <h3 className="font-semibold mb-3">How Escrow Works</h3>
                                <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    <li className="flex items-start">
                                        <span className="font-semibold text-primary-600 mr-2">1.</span>
                                        Your payment is locked in a smart contract
                                    </li>
                                    <li className="flex items-start">
                                        <span className="font-semibold text-primary-600 mr-2">2.</span>
                                        Seller ships the item
                                    </li>
                                    <li className="flex items-start">
                                        <span className="font-semibold text-primary-600 mr-2">3.</span>
                                        You confirm delivery
                                    </li>
                                    <li className="flex items-start">
                                        <span className="font-semibold text-primary-600 mr-2">4.</span>
                                        Funds are released to seller
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-24">
                            <h2 className="text-xl font-semibold mb-4">Payment Details</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                    <span className="font-semibold">{formatPrice(product.price)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Platform Fee (2.5%)</span>
                                    <span className="font-semibold">{formatPrice(product.price * 0.025)}</span>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between text-lg">
                                    <span className="font-bold">Total</span>
                                    <span className="font-bold text-primary-600 dark:text-primary-400">
                                        {formatPrice(product.price * 1.025)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={isProcessing || !address}
                                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
                            >
                                {isProcessing ? 'Processing...' : 'Complete Purchase'}
                            </button>

                            {!address && (
                                <p className="text-sm text-red-500 mt-2 text-center">
                                    Please connect your wallet
                                </p>
                            )}

                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                                By completing this purchase, you agree to our terms of service
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
