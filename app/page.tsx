import ConnectButton from "@/components/wallet/ConnectButton";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">Spin Stores</h1>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                    P2P Escrow Marketplace
                </p>
                <p className="mt-4 text-sm text-gray-500">
                    Powered by WalletConnect & Reown
                </p>
                <div className="mt-8">
                    <ConnectButton />
                </div>
            </div>
        </main>
    );
}
