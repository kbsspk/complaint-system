import { Suspense } from 'react';
import {
    getMonthlyComplaintStats,
    getMonthlyActStats,
    getMonthlyDistrictStats,
    getMonthlyChannelStats,
    getMonthlySafetyStats,
    getMonthlyFineStats,
    getDistinctActs,
    getDistinctSections,
    getOfficerPerformanceStats,
    getGroupPerformanceStats,
    MonthlyStats,
    MonthlyActStats,
    MonthlyDistrictStats,
    MonthlyChannelStats,
    MonthlySafetyStats,
    MonthlyFineStats,
    OfficerPerformanceStats,
    GroupPerformanceStats
} from '@/actions/dashboard';
import ComplaintTrendsChart from '@/components/dashboard/ComplaintTrendsChart';
import ComplaintStatsTable from '@/components/dashboard/ComplaintStatsTable';
import ActsDashboardClient from '@/components/dashboard/ActsDashboardClient';
import GenericStatsDashboardClient from '@/components/dashboard/GenericStatsDashboardClient';
import SafetyDashboardClient from '@/components/dashboard/SafetyDashboardClient';
import FinesDashboardClient from '@/components/dashboard/FinesDashboardClient';
import OfficerPerformanceChart from '@/components/dashboard/OfficerPerformanceChart';
import OfficerPendingChart from '@/components/dashboard/OfficerPendingChart';
import GroupPerformanceGauge from '@/components/dashboard/GroupPerformanceGauge';
import DashboardDateFilter from '@/components/dashboard/DashboardDateFilter';
import DashboardTabs from '@/components/dashboard/DashboardTabs';

interface DashboardStatsPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DashboardStatsPage(props: DashboardStatsPageProps) {
    const searchParams = await props.searchParams;
    const month = typeof searchParams.month === 'string' ? searchParams.month : undefined;
    const view = typeof searchParams.view === 'string' ? searchParams.view : 'status';

    // Data containers
    let statusStats: MonthlyStats[] = [];
    let actStats: MonthlyActStats[] = [];
    let districtStats: MonthlyDistrictStats[] = [];
    let channelStats: MonthlyChannelStats[] = [];
    let safetyStats: MonthlySafetyStats[] = [];
    let finesStats: MonthlyFineStats[] = [];
    let officerStats: OfficerPerformanceStats[] = [];
    let groupStats12M: GroupPerformanceStats | null = null;
    let groupStatsAll: GroupPerformanceStats | null = null;
    let availableActs: string[] = [];
    let availableSections: string[] = [];

    // Fetch only needed data
    if (view === 'acts') {
        actStats = await getMonthlyActStats(month);
    } else if (view === 'district') {
        districtStats = await getMonthlyDistrictStats(month);
    } else if (view === 'channel') {
        channelStats = await getMonthlyChannelStats(month);
    } else if (view === 'safety') {
        safetyStats = await getMonthlySafetyStats(month);
    } else if (view === 'fines') {
        const actFilter = typeof searchParams.act === 'string' ? searchParams.act : undefined;
        const sectionFilter = typeof searchParams.section === 'string' ? searchParams.section : undefined;
        finesStats = await getMonthlyFineStats(month, actFilter, sectionFilter);
        availableActs = await getDistinctActs();
        availableSections = await getDistinctSections(actFilter);
    } else if (view === 'officer') {
        officerStats = await getOfficerPerformanceStats(month);
        groupStats12M = await getGroupPerformanceStats('12_MONTHS');
        groupStatsAll = await getGroupPerformanceStats('ALL');
    } else {
        statusStats = await getMonthlyComplaintStats(month);
    }

    // Constants for Generic Views
    const DISTRICTS = [
        'เมืองสมุทรปราการ', 'บางบ่อ', 'บางพลี',
        'พระประแดง', 'พระสมุทรเจดีย์', 'บางเสาธง'
    ];

    // Channel is already mapped to Thai in backend, so keys are Thai.
    const CHANNELS = ['ออนไลน์', 'โทรศัพท์', 'หนังสือราชการ', 'Walk-in'];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-gray-900">สรุปการดำเนินการ</h1>
                <p className="text-gray-500">
                    ภาพรวมสถิติเรื่องร้องเรียนและการดำเนินการในรอบ 12 เดือนที่ผ่านมา
                </p>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 gap-4 overflow-x-auto">
                    <DashboardTabs />
                    <DashboardDateFilter />
                </div>
            </div>

            {view === 'status' && (
                <div className="grid grid-cols-1 gap-6">
                    <Suspense fallback={<div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-xl" />}>
                        <ComplaintTrendsChart data={statusStats} />
                    </Suspense>
                    <Suspense fallback={<div className="h-[200px] w-full bg-gray-100 animate-pulse rounded-xl" />}>
                        <ComplaintStatsTable data={statusStats} />
                    </Suspense>
                </div>
            )}

            {view === 'acts' && (
                <div className="w-full">
                    <Suspense fallback={<div className="h-[600px] w-full bg-gray-100 animate-pulse rounded-xl" />}>
                        <ActsDashboardClient data={actStats} />
                    </Suspense>
                </div>
            )}

            {view === 'district' && (
                <div className="w-full">
                    <Suspense fallback={<div className="h-[600px] w-full bg-gray-100 animate-pulse rounded-xl" />}>
                        <GenericStatsDashboardClient
                            data={districtStats}
                            dataKeys={DISTRICTS}
                            title="สถิติเรื่องร้องเรียนแยกตามอำเภอ"
                            // Custom district colors
                            colors={{
                                'เมืองสมุทรปราการ': '#ef4444',
                                'บางพลี': '#3b82f6',
                                'บางบ่อ': '#f59e0b',
                                'พระประแดง': '#10b981',
                                'พระสมุทรเจดีย์': '#6366f1',
                                'บางเสาธง': '#ec4899'
                            }}
                        />
                    </Suspense>
                </div>
            )}

            {view === 'channel' && (
                <div className="w-full">
                    <Suspense fallback={<div className="h-[600px] w-full bg-gray-100 animate-pulse rounded-xl" />}>
                        <GenericStatsDashboardClient
                            data={channelStats}
                            dataKeys={CHANNELS}
                            title="สถิติเรื่องร้องเรียนแยกตามช่องทาง"
                            colors={{
                                'ออนไลน์': '#3b82f6',
                                'โทรศัพท์': '#f59e0b',
                                'หนังสือราชการ': '#64748b',
                                'Walk-in': '#10b981',
                            }}
                        />
                    </Suspense>
                </div>
            )}

            {view === 'safety' && (
                <div className="w-full">
                    <Suspense fallback={<div className="h-[600px] w-full bg-gray-100 animate-pulse rounded-xl" />}>
                        <SafetyDashboardClient data={safetyStats} />
                    </Suspense>
                </div>
            )}

            {view === 'fines' && (
                <div className="w-full">
                    <Suspense fallback={<div className="h-[600px] w-full bg-gray-100 animate-pulse rounded-xl" />}>
                        <FinesDashboardClient
                            data={finesStats}
                            availableActs={availableActs}
                            availableSections={availableSections}
                        />
                    </Suspense>
                </div>
            )}

            {view === 'officer' && (
                <div className="w-full">
                    <Suspense fallback={<div className="h-[200px] w-full bg-gray-100 animate-pulse rounded-xl mb-6" />}>
                        <GroupPerformanceGauge
                            stats12Months={groupStats12M || { avgDays: 0, totalCases: 0 }}
                            statsAllTime={groupStatsAll || { avgDays: 0, totalCases: 0 }}
                        />
                    </Suspense>
                    <Suspense fallback={<div className="h-[600px] w-full bg-gray-100 animate-pulse rounded-xl" />}>
                        <OfficerPerformanceChart data={officerStats} />
                        <OfficerPendingChart data={officerStats} />
                    </Suspense>
                </div>
            )}
        </div>
    );
}
