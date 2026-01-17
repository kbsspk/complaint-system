'use client';


import { MonthlySafetyStats } from '@/actions/dashboard';
import SafetyTrendsChart from './SafetyTrendsChart';
import SafetyStatsTable from './SafetyStatsTable';

interface SafetyDashboardClientProps {
    data: MonthlySafetyStats[];
}

export default function SafetyDashboardClient({ data }: SafetyDashboardClientProps) {
    // We get data from server component usually, but if we need to client-side fetch or filter, do it here.
    // For now, we accept data from props to support Server Component fetching.

    return (
        <div className="space-y-6">
            <h3 className="text-center text-lg font-bold text-gray-800">สถิติเรื่องร้องเรียนแยกตามความปลอดภัย/สุขภาพ</h3>

            <SafetyTrendsChart data={data} />
            <SafetyStatsTable data={data} />
        </div>
    );
}
