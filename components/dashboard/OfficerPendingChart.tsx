'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { OfficerPerformanceStats } from '@/actions/dashboard';
import { useMemo } from 'react';

interface OfficerPendingChartProps {
    data: OfficerPerformanceStats[];
}

export default function OfficerPendingChart({ data }: OfficerPendingChartProps) {
    // Sort data by pendingCount descending
    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => b.pendingCount - a.pendingCount);
    }, [data]);

    return (
        <div className="w-full h-[600px] bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
            <h3 className="text-center text-lg font-bold mb-2 text-gray-800">
                จำนวนเรื่องร้องเรียนรอดำเนินการ (คงค้าง)
            </h3>
            <p className="text-center text-sm text-gray-500 mb-6">
                เรียงลำดับจากจำนวนคงค้างมากไปน้อย
            </p>

            <ResponsiveContainer width="100%" height="85%">
                <BarChart
                    data={sortedData}
                    layout="vertical"
                    margin={{
                        top: 20,
                        right: 50,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                    <XAxis
                        type="number"
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                        tickLine={false}
                        allowDecimals={false}
                        unit=" เรื่อง"
                    />
                    <YAxis
                        dataKey="officerName"
                        type="category"
                        tick={{ fontSize: 12, fill: '#4b5563', fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                        width={150}
                    />
                    <Tooltip
                        cursor={{ fill: '#f9fafb' }}
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            padding: '12px'
                        }}
                        formatter={(value: number | undefined) => [`${value} เรื่อง`, 'รอการดำเนินการ']}
                        labelStyle={{ color: '#1f2937', fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <Bar
                        dataKey="pendingCount"
                        name="รอการดำเนินการ"
                        fill="#eab308"
                        radius={[0, 4, 4, 0]}
                        barSize={30}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
