'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ConnectButton from '../wallet/ConnectButton';
import NotificationCenter from '../notifications/NotificationCenter';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
    const pathname = usePathname();
    const { user } = useAuth();

    const navItems = [
        { name: 'Browse', href: '/products' },
        { name: 'Sell', href: '/sell' },
        { name: 'My Orders', href: '/orders' },
        { name: 'Messages', href: '/messages' },
    ];

    return (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                            Spin Stores
                        </span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`text-sm font-medium transition-colors ${pathname === item.href
                                        ? 'text-primary-600 dark:text-primary-400'
                                        : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Wallet Connect and Notifications */}
                    <div className="flex items-center gap-4">
                        {user && <NotificationCenter />}
                        <ConnectButton />
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
                <nav className="flex justify-around py-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`text-xs font-medium px-3 py-2 rounded-lg ${pathname === item.href
                                ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
                                : 'text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
}
