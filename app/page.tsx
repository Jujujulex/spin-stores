import Link from 'next/link';

export default function Home() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-primary-50 to-white dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                        Spin Stores
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-4">
                        P2P Escrow Marketplace
                    </p>
                    <p className="text-lg text-gray-500 dark:text-gray-500 mb-12">
                        Buy and sell with confidence using blockchain-powered escrow
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                        <Link
                            href="/products"
                            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                        >
                            Browse Products
                        </Link>
                        <Link
                            href="/sell"
                            className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-primary-600 dark:text-primary-400 font-semibold py-3 px-8 rounded-lg border-2 border-primary-600 dark:border-primary-400 transition-colors"
                        >
                            Start Selling
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                            <div className="text-4xl mb-4">🔒</div>
                            <h3 className="text-xl font-semibold mb-2">Secure Escrow</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Funds held safely in smart contracts until delivery confirmed
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                            <div className="text-4xl mb-4">💰</div>
                            <h3 className="text-xl font-semibold mb-2">Low Fees</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Only 2.5% platform fee, no hidden charges
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                            <div className="text-4xl mb-4">🌐</div>
                            <h3 className="text-xl font-semibold mb-2">Decentralized</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Wallet-based authentication, no passwords needed
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
