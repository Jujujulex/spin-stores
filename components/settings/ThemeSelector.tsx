'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Sun, Moon, Monitor } from 'lucide-react';

interface ThemeSelectorProps {
    initialTheme?: string;
}

export default function ThemeSelector({ initialTheme = 'system' }: ThemeSelectorProps) {
    const router = useRouter();
    const [theme, setTheme] = useState(initialTheme);
    const [isUpdating, setIsUpdating] = useState(false);

    const themes = [
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'system', label: 'System', icon: Monitor },
    ];

    const handleThemeChange = async (newTheme: string) => {
        setIsUpdating(true);
        setTheme(newTheme);

        // Update local storage for immediate effect
        if (newTheme === 'system') {
            localStorage.removeItem('theme');
        } else {
            localStorage.setItem('theme', newTheme);
        }

        // Apply theme immediately
        applyTheme(newTheme);

        try {
            const response = await fetch('/api/users/theme', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ theme: newTheme }),
            });

            if (!response.ok) {
                throw new Error('Failed to update theme');
            }

            toast.success('Theme updated');
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update theme');
        } finally {
            setIsUpdating(false);
        }
    };

    const applyTheme = (selectedTheme: string) => {
        const root = document.documentElement;

        if (selectedTheme === 'system') {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (systemPrefersDark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        } else if (selectedTheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    };

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Theme Preference
            </label>
            <div className="grid grid-cols-3 gap-3">
                {themes.map(({ value, label, icon: Icon }) => (
                    <button
                        key={value}
                        onClick={() => handleThemeChange(value)}
                        disabled={isUpdating}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${theme === value
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Icon className={`w-6 h-6 ${theme === value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`} />
                        <span className={`text-sm font-medium ${theme === value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                            {label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
