'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { OfficerPerformanceStats } from '@/actions/dashboard';

interface OfficerPerformanceChartProps {
    data: OfficerPerformanceStats[];
}

export default function OfficerPerformanceChart({ data }: OfficerPerformanceChartProps) {
    return (
        <div className="w-full h-[600px] bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-center text-lg font-bold mb-2 text-gray-800">
                ระยะเวลาการดำเนินการเฉลี่ยต่อเจ้าหน้าที่ (12 เดือนย้อนหลัง)
            </h3>
            <p className="text-center text-sm text-gray-500 mb-6">
                เรียงลำดับจากระยะเวลาเฉลี่ยมากไปน้อย (เส้นประสีแดงแสดงเกณฑ์ 50 วัน)
            </p>

            <ResponsiveContainer width="100%" height="85%">
                <BarChart
                    data={data}
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
                        unit=" วัน"
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
                        formatter={(value: number | undefined) => [value ? `${value.toFixed(1)} วัน` : '0 วัน', 'ระยะเวลาเฉลี่ย']}
                        labelStyle={{ color: '#1f2937', fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <ReferenceLine x={50} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'เกณฑ์ 50 วัน', fill: '#ef4444', fontSize: 12, position: 'top' }} />
                    <Bar
                        dataKey="avgDays"
                        name="ระยะเวลาเฉลี่ย"
                        fill="#f97316"
                        radius={[0, 4, 4, 0]}
                        barSize={30}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
