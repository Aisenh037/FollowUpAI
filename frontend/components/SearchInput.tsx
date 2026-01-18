'use client';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function SearchInput({ value, onChange, placeholder }: SearchInputProps) {
    return (
        <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                🔍
            </span>
            <input
                type="text"
                placeholder={placeholder || "Search..."}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm shadow-sm"
            />
        </div>
    );
}
