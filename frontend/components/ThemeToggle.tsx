'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="p-2 w-10 h-10" />;

    return (
        <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg border border-gray-200 dark:border-slate-700">
            <button
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-md transition-all ${theme === 'light' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-900'
                    }`}
                title="Light Mode"
            >
                <Sun size={18} />
            </button>
            <button
                onClick={() => setTheme('system')}
                className={`p-1.5 rounded-md transition-all ${theme === 'system' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100'
                    }`}
                title="System Preference"
            >
                <Laptop size={18} />
            </button>
            <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-md transition-all ${theme === 'dark' ? 'bg-slate-700 shadow-sm text-primary-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100'
                    }`}
                title="Dark Mode"
            >
                <Moon size={18} />
            </button>
        </div>
    );
}
