import type { Metadata } from "next";
import "./globals.css";
import { AppKitProvider } from "@/components/providers/AppKitProvider";

export const metadata: Metadata = {
    title: "Spin Stores - P2P Escrow Marketplace",
    description: "Decentralized peer-to-peer marketplace with built-in escrow functionality",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <AppKitProvider>
                    {children}
                </AppKitProvider>
            </body>
        </html>
    );
}
