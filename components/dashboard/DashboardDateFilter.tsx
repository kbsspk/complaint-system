'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent } from 'react';

export default function DashboardDateFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get current value from URL or default to current month (local time)
    const currentMonth = searchParams.get('month') || new Date().toISOString().slice(0, 7);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        const params = new URLSearchParams(searchParams);
        if (newValue) {
            params.set('month', newValue);
        } else {
            params.delete('month');
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-border-light shadow-sm">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                เดือนสิ้นสุด:
            </span>
            <input
                type="month"
                value={currentMonth}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-primary focus:border-primary block p-1.5"
            />
        </div>
    );
}
