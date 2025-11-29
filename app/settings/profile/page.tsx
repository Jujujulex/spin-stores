'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import ProfileForm from '@/components/settings/ProfileForm';

export default function ProfileSettingsPage() {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Settings
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Please connect your wallet to access settings
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    Profile Settings
                </h1>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Personal Information
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Update your public profile details.
                        </p>
                    </div>

                    <div className="p-6">
                        {/* Profile Form will be injected here in next commit */}
                        <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
