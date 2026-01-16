'use client';

import { GroupPerformanceStats } from '@/actions/dashboard';
import { useState } from 'react';

interface GroupPerformanceGaugeProps {
    stats12Months: GroupPerformanceStats;
    statsAllTime: GroupPerformanceStats;
}

export default function GroupPerformanceGauge({ stats12Months, statsAllTime }: GroupPerformanceGaugeProps) {
    const [view, setView] = useState<'ALL' | '12_MONTHS'>('12_MONTHS');

    const currentStats = view === '12_MONTHS' ? stats12Months : statsAllTime;
    const avg = currentStats.avgDays || 0;

    // Scale: 0 to 100 days. If > 100, cap it visually but show number.
    const percentage = Math.min((avg / 100) * 100, 100);

    // Colors based on value
    // < 30: Green, 30-50: Orange, > 50: Red
    let statusColor = "text-green-600";
    if (avg > 50) statusColor = "text-red-600";
    else if (avg > 30) statusColor = "text-amber-600";

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 relative overflow-hidden">

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600">speed</span>
                        ระเวลาการดำเนินการเฉลี่ย (ภาพรวม)
                    </h3>
                    <p className="text-sm text-gray-500">
                        จากจำนวนเรื่องร้องเรียนทั้งหมด {currentStats.totalCases.toLocaleString()} เรื่อง
                    </p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setView('12_MONTHS')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === '12_MONTHS' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        12 เดือนย้อนหลัง
                    </button>
                    <button
                        onClick={() => setView('ALL')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'ALL' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        ทั้งหมด (All Time)
                    </button>
                </div>
            </div>

            {/* Gauge / Power Bar Visualization */}
            <div className="relative pt-6 pb-2">
                {/* Scale Markers */}
                <div className="flex justify-between text-xs text-gray-400 mb-1 px-1 font-mono">
                    <span>0 วัน</span>
                    <span>25 วัน</span>
                    <span>50 วัน</span>
                    <span>75 วัน</span>
                    <span>100+ วัน</span>
                </div>

                {/* The Bar Container */}
                <div className="h-6 w-full bg-gray-200 rounded-full overflow-hidden relative shadow-inner">
                    {/* The Fill Bar */}
                    <div
                        className="h-full transition-all duration-1000 ease-out rounded-full relative"
                        style={{
                            width: `${percentage}%`,
                            background: `linear-gradient(90deg, #22c55e 0%, #f59e0b 50%, #ef4444 100%)`
                        }}
                    >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>

                    {/* 50 Day Marker Line */}
                    <div
                        className="absolute top-0 bottom-0 w-0.5 bg-red-600 z-10"
                        style={{ left: '50%' }}
                    />
                </div>

                {/* 50 Day Label */}
                <div
                    className="absolute top-0 text-xs font-bold text-red-600 z-10 -translate-x-1/2 flex flex-col items-center"
                    style={{ left: '50%' }}
                >
                    <span>เกณฑ์ 50 วัน</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
                </div>

                {/* Valid Scale Ticks underneath (optional, simplified to top scale above) */}
            </div>

            {/* Big Number Display */}
            <div className="text-center mt-2">
                <span className={`text-4xl font-black ${statusColor} tabular-nums tracking-tight`}>
                    {avg.toFixed(1)}
                </span>
                <span className="text-gray-500 ml-2 font-medium">วัน/เรื่อง</span>
            </div>

            {/* Status Text */}
            <div className="text-center mt-1">
                {avg <= 40 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        อยู่ในเกณฑ์ดี
                    </span>
                ) : avg <= 50 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                        ควรเฝ้าระวัง
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        เกินเกณฑ์กำหนด
                    </span>
                )}
            </div>

        </div>
    );
}
