'use client';

import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { BrowserProvider } from 'ethers';
import { SiweMessage } from 'siwe';
import { useEffect, useState } from 'react';

export function useAuth() {
    const { address, isConnected } = useAppKitAccount();
    const { walletProvider } = useAppKitProvider('eip155');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        checkAuth();
    }, [address, isConnected]);

    const checkAuth = async () => {
        if (!address || !isConnected) {
            setIsAuthenticated(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setIsAuthenticated(false);
        }
    };

    const login = async () => {
        if (!address || !walletProvider) {
            throw new Error('Wallet not connected');
        }

        setIsLoading(true);
        try {
            // Get nonce from server
            const nonceResponse = await fetch('/api/auth/nonce');
            const { nonce } = await nonceResponse.json();

            // Create SIWE message
            const message = new SiweMessage({
                domain: window.location.host,
                address,
                statement: 'Sign in to Spin Stores',
                uri: window.location.origin,
                version: '1',
                chainId: 1,
                nonce,
            });

            const messageToSign = message.prepareMessage();

            // Sign message
            const provider = new BrowserProvider(walletProvider);
            const signer = await provider.getSigner();
            const signature = await signer.signMessage(messageToSign);

            // Verify signature and create session
            const verifyResponse = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: messageToSign, signature }),
            });

            if (!verifyResponse.ok) {
                throw new Error('Authentication failed');
            }

            setIsAuthenticated(true);
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return {
        address,
        isConnected,
        isAuthenticated,
        isLoading,
        login,
        logout,
    };
}
