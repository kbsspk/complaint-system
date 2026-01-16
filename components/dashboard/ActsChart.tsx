'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { MonthlyActStats } from '@/actions/dashboard';

interface ActsChartProps {
    data: MonthlyActStats[];
    selectedActs: string[];
    colors: Record<string, string>;
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

export default function ActsChart({ data, selectedActs, colors }: ActsChartProps) {
    return (
        <div className="w-full h-[500px] bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-center text-lg font-bold mb-6 text-gray-800">
                สถิติเรื่องร้องเรียนแยกตาม พรบ.
            </h3>
            <ResponsiveContainer width="100%" height="85%">
                <BarChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
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
                        label={{
                            value: 'จำนวนเรื่อง (เรื่อง)',
                            angle: -90,
                            position: 'insideLeft',
                            style: { fill: '#6b7280', fontSize: 12 },
                            dx: 10
                        }}
                    />
                    <Tooltip
                        cursor={{ fill: '#f9fafb' }}
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            padding: '12px'
                        }}
                        labelFormatter={(label) => formatXAxis(label)}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        iconSize={10}
                        wrapperStyle={{ paddingTop: '20px' }}
                    />

                    {selectedActs.map((act) => (
                        <Bar
                            key={act}
                            dataKey={act}
                            name={act}
                            stackId="a"
                            fill={colors[act] || '#cbd5e1'}
                            radius={[0, 0, 0, 0]}
                            // Note: Recharts doesn't apply top-radius to top-stack only automatically well with dynamic keys
                            // Keep square for now to be safe
                            barSize={40}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
