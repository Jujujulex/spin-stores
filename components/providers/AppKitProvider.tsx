'use client';

import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';
import { sepolia, mainnet } from '@reown/appkit/networks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { ReactNode } from 'react';

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Get projectId from https://cloud.reown.com
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '';

if (!projectId) {
    throw new Error('Project ID is not defined');
}

// 2. Create a metadata object
const metadata = {
    name: 'Spin Stores',
    description: 'P2P Escrow Marketplace powered by blockchain',
    url: 'https://spin-stores.com', // origin must match your domain & subdomain
    icons: ['https://avatars.githubusercontent.com/u/37784886']
};

// 3. Set the networks
const networks = [mainnet, sepolia] as const;

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
    networks,
    projectId,
    ssr: true
});

// 5. Create modal
createAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId,
    metadata,
    features: {
        analytics: true,
    }
});

export function AppKitProvider({ children }: { children: ReactNode }) {
    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}
