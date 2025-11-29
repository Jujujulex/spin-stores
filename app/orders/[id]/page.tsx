'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice, formatDate, formatAddress } from '@/lib/utils';
import OrderTimeline from '@/components/orders/OrderTimeline';
import Image from 'next/image';
import Link from 'next/link';
import { BrowserProvider, Contract } from 'ethers';

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchOrder();
        }
    }, [params.id]);

    const fetchOrder = async () => {
        try {
            const response = await fetch(`/api/orders/${params.id}`);
            if (!response.ok) throw new Error('Failed to fetch order');
            const data = await response.json();
            setOrder(data);
        } catch (error) {
            console.error('Error fetching order:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (newStatus: string) => {
        if (!confirm(`Are you sure you want to update status to ${newStatus}?`)) return;

        setIsUpdating(true);
        try {
            // If releasing funds or refunding, interact with smart contract first
            if (newStatus === 'COMPLETED' || newStatus === 'REFUNDED') {
                if (!window.ethereum) throw new Error('No wallet found');

                const provider = new BrowserProvider(window.ethereum as any);
                const signer = await provider.getSigner();
                const contract = new Contract(
                    process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS!,
                    [
                        'function releasePayment(bytes32 _escrowId) external',
                        'function refundBuyer(bytes32 _escrowId) external'
                    ],
                    signer
                );

                // We need the escrowId (transaction hash of creation or stored ID)
                // In this simple implementation, we assume escrowId is stored or derived
                // For now, we'll use the order.escrowAddress as the ID if it's a bytes32,
                // but typically you'd store the actual bytes32 ID returned by createEscrow.
                // Let's assume order.escrowAddress holds the ID for this demo.
                const escrowId = order.escrowAddress;

                let tx;
                if (newStatus === 'COMPLETED') {
                    tx = await contract.releasePayment(escrowId);
                } else {
                    tx = await contract.refundBuyer(escrowId);
                }

                await tx.wait();
            }

            const response = await fetch(`/api/orders/${params.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                fetchOrder();
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status: ' + (error as Error).message);
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order not found</h2>
                    <Link href="/orders" className="text-primary-600 hover:underline mt-2 block">
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    const isBuyer = user?.id === order.buyerId;
    const isSeller = user?.id === order.sellerId;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Order #{order.id.slice(0, 8)}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Placed on {formatDate(order.createdAt)}
                        </p>
                    </div>
                    <Link
                        href="/orders"
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                        ← Back to Orders
                    </Link>
                </div>

                {/* Timeline */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-lg font-semibold mb-4">Order Status</h2>
                    <OrderTimeline status={order.status} createdAt={order.createdAt} updatedAt={order.updatedAt} />

                    {/* Action Buttons */}
                    <div className="mt-8 flex justify-end gap-4">
                        {isSeller && order.status === 'PAID' && (
                            <button
                                onClick={() => updateStatus('SHIPPED')}
                                disabled={isUpdating}
                                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
                            >
                                Mark as Shipped
                            </button>
                        )}
                        {isBuyer && order.status === 'SHIPPED' && (
                            <button
                                onClick={() => updateStatus('DELIVERED')}
                                disabled={isUpdating}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
                            >
                                Confirm Delivery
                            </button>
                        )}
                        {isBuyer && order.status === 'DELIVERED' && (
                            <button
                                onClick={() => updateStatus('COMPLETED')}
                                disabled={isUpdating}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
                            >
                                Release Funds & Complete
                            </button>
                        )}
                        {['PAID', 'SHIPPED'].includes(order.status) && (
                            <button
                                onClick={() => updateStatus('DISPUTED')}
                                disabled={isUpdating}
                                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-6 py-2 rounded-lg font-semibold border border-red-200 dark:border-red-800 disabled:opacity-50"
                            >
                                Raise Dispute
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Product Details */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                            <h2 className="text-lg font-semibold mb-4">Product Details</h2>
                            <div className="flex gap-4">
                                <div className="relative w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                                    {order.product.images && order.product.images[0] ? (
                                        <Image src={order.product.images[0]} alt={order.product.title} fill className="object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{order.product.title}</h3>
                                    <p className="text-primary-600 dark:text-primary-400 font-bold text-xl mt-1">
                                        {formatPrice(order.product.price)}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">Quantity: 1</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages Preview */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">Messages</h2>
                                <Link href="/messages" className="text-primary-600 hover:underline text-sm">
                                    View All
                                </Link>
                            </div>
                            {order.messages && order.messages.length > 0 ? (
                                <div className="space-y-4">
                                    {order.messages.slice(0, 3).map((msg: any) => (
                                        <div key={msg.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                            <p className="text-sm font-semibold mb-1">
                                                {msg.sender.username || formatAddress(msg.sender.walletAddress)}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">{msg.content}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No messages yet</p>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-8">
                        {/* Payment Info */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                            <h2 className="text-lg font-semibold mb-4">Payment Info</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span>{formatPrice(order.product.price)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Platform Fee</span>
                                    <span>{formatPrice(order.product.price * 0.025)}</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between font-bold">
                                    <span>Total</span>
                                    <span className="text-primary-600">{formatPrice(order.totalAmount)}</span>
                                </div>
                            </div>
                            {order.escrowAddress && (
                                <div className="mt-4 pt-4 border-t">
                                    <p className="text-xs text-gray-500 mb-1">Escrow Transaction</p>
                                    <a
                                        href={`https://sepolia.etherscan.io/tx/${order.escrowAddress}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-500 hover:underline truncate block"
                                    >
                                        {order.escrowAddress}
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Other Party Info */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                            <h2 className="text-lg font-semibold mb-4">
                                {isBuyer ? 'Seller' : 'Buyer'} Info
                            </h2>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                                    {(isBuyer ? order.seller.username : order.buyer.username)?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className="font-semibold">
                                        {(isBuyer ? order.seller.username : order.buyer.username) || 'Anonymous'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatAddress((isBuyer ? order.seller.walletAddress : order.buyer.walletAddress))}
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/messages"
                                className="mt-4 w-full block text-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Send Message
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
