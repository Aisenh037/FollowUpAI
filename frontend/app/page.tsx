'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated()) {
            router.push('/dashboard');
        } else {
            router.push('/login');
        }
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="text-center animate-pulse">
                <h1 className="text-6xl font-black bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-4 tracking-tighter">
                    FollowUpAI
                </h1>
                <p className="text-lg text-slate-500 font-bold uppercase tracking-[0.2em]">Initializing Systems...</p>
            </div>
        </div>
    );
}
