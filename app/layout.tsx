import type { Metadata } from "next";
import "./globals.css";
import { AppKitProvider } from "@/components/providers/AppKitProvider";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
    title: "Spin Stores - P2P Escrow Marketplace",
    description: "Decentralized peer-to-peer marketplace with built-in escrow functionality",
};

import NotificationProvider from '@/components/providers/NotificationProvider';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AppKitProvider>
                    <NotificationProvider>
                        <Header />
                        <main>{children}</main>
                        <Toaster position="top-right" />
                    </NotificationProvider>
                </AppKitProvider>
            </body>
        </html>
    );
}
