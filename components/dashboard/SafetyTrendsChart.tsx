'use client';

import { useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

interface SafetyStats {
    month: string;
    safety_related: number;
    others: number;
}

interface SafetyTrendsChartProps {
    data: SafetyStats[];
}

const formatXAxis = (tick: string) => {
    if (!tick) return '';
    const months = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const [year, month] = tick.split('-');
    const mIndex = parseInt(month, 10) - 1;
    const thaiYear = parseInt(year, 10) + 543;
    const shortYear = String(thaiYear).slice(2);
    return `${months[mIndex]} ${shortYear}`;
};

export default function SafetyTrendsChart({ data }: SafetyTrendsChartProps) {
    const [showSafety, setShowSafety] = useState(true);
    const [showOthers, setShowOthers] = useState(true);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6">แนวโน้มเรื่องร้องเรียนด้านความปลอดภัยต่อสุขภาพ</h3>

            <div className="flex gap-6 mb-6">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={showSafety}
                        onChange={(e) => setShowSafety(e.target.checked)}
                        className="rounded text-red-500 focus:ring-red-500 w-4 h-4 border-gray-300"
                    />
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <span className="text-sm font-medium text-gray-700">ส่งผลต่อสุขภาพ</span>
                    </div>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={showOthers}
                        onChange={(e) => setShowOthers(e.target.checked)}
                        className="rounded text-gray-400 focus:ring-gray-400 w-4 h-4 border-gray-300"
                    />
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                        <span className="text-sm font-medium text-gray-700">ทั่วไป / อื่นๆ</span>
                    </div>
                </label>
            </div>

            <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        stackOffset="sign"
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="month"
                            tickFormatter={formatXAxis}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            axisLine={{ stroke: '#e5e7eb' }}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip
                            cursor={{ fill: '#f9fafb' }}
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                padding: '12px'
                            }}
                            labelFormatter={formatXAxis}
                        />
                        <Legend wrapperStyle={{ display: 'none' }} />

                        {showOthers && (
                            <Bar
                                dataKey="others"
                                name="ทั่วไป / อื่นๆ"
                                stackId="a"
                                fill="#9ca3af"
                                radius={[0, 0, 0, 0]}
                                barSize={40}
                                animationDuration={1000}
                            />
                        )}
                        {showSafety && (
                            <Bar
                                dataKey="safety_related"
                                name="ส่งผลต่อสุขภาพ"
                                stackId="a"
                                fill="#ef4444"
                                radius={[4, 4, 0, 0]}
                                barSize={40}
                                animationDuration={1000}
                            />
                        )}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
