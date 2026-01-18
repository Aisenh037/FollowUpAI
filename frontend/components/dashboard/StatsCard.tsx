import { DashboardStats } from '@/types';

interface StatsCardProps {
    title: string;
    value: number;
    icon: string;
    color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
};

export default function StatsCard({ title, value, icon, color }: StatsCardProps) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-800 p-6 transition-all duration-300 group">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">{title}</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white group-hover:scale-105 transition-transform origin-left">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12 ${colorClasses[color]}`}>
                    <span className="text-2xl">{icon}</span>
                </div>
            </div>
        </div>
    );
}
