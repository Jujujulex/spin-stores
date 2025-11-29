'use client';

import { useState, useEffect } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { useDisconnect } from 'wagmi';
import { SiweMessage } from 'siwe';

interface User {
    id: string;
    walletAddress: string;
    username?: string;
    bio?: string;
    avatar?: string;
}

export function useAuth() {
    const { address, isConnected } = useAppKitAccount();
    const { disconnect } = useDisconnect();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        checkAuth();
    }, [address]);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setIsAuthenticated(true);
                setUser(data.user);
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async () => {
        try {
            if (!address) throw new Error('No wallet connected');

            const nonceRes = await fetch('/api/auth/nonce');
            const { nonce } = await nonceRes.json();

            const message = new SiweMessage({
                domain: window.location.host,
                address,
                statement: 'Sign in with Ethereum to the app.',
                uri: window.location.origin,
                version: '1',
                chainId: 1,
                nonce,
            });

            if (!window.ethereum) throw new Error('No crypto wallet found');

            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [message.prepareMessage(), address],
            });

            const verifyRes = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message, signature }),
            });

            if (!verifyRes.ok) throw new Error('Verification failed');

            const data = await verifyRes.json();
            setIsAuthenticated(true);
            setUser(data.user);
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            await disconnect();
            setIsAuthenticated(false);
            setUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return {
        isAuthenticated,
        isLoading,
        user,
        login,
        logout,
        address,
        isConnected
    };
}
