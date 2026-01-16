'use client';

import { useState } from 'react';
import type { MonthlyActStats } from '@/actions/dashboard';
import ActsChart from './ActsChart';
import ActsTable from './ActsTable';
import ActsFilter from './ActsFilter';

interface ActsDashboardClientProps {
    data: MonthlyActStats[];
}

const ALL_ACTS = [
    'ยา', 'อาหาร', 'เครื่องสำอาง', 'วัตถุอันตราย', 'เครื่องมือแพทย์',
    'สถานประกอบการเพื่อสุขภาพ', 'สถานพยาบาล', 'ผลิตภัณฑ์สมุนไพร',
    'พืชกระท่อม', 'สุขาภิบาลอาหาร'
];

const ACT_COLORS: Record<string, string> = {
    'ยา': '#ef4444', // Red
    'อาหาร': '#f97316', // Orange
    'เครื่องสำอาง': '#db2777', // Pink
    'วัตถุอันตราย': '#a855f7', // Purple
    'เครื่องมือแพทย์': '#3b82f6', // Blue
    'สถานประกอบการเพื่อสุขภาพ': '#06b6d4', // Cyan
    'สถานพยาบาล': '#10b981', // Emerald
    'ผลิตภัณฑ์สมุนไพร': '#84cc16', // Lime
    'พืชกระท่อม': '#eab308', // Yellow
    'สุขาภิบาลอาหาร': '#6366f1' // Indigo
};

export default function ActsDashboardClient({ data }: ActsDashboardClientProps) {
    const [selectedActs, setSelectedActs] = useState<string[]>(ALL_ACTS);

    return (
        <div className="space-y-6">
            <ActsFilter
                allActs={ALL_ACTS}
                selectedActs={selectedActs}
                onChange={setSelectedActs}
            />

            <ActsChart
                data={data}
                selectedActs={selectedActs}
                colors={ACT_COLORS}
            />

            <ActsTable
                data={data}
                selectedActs={selectedActs}
            />
        </div>
    );
}
