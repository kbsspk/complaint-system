'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getMonthlySafetyStats, MonthlySafetyStats } from '@/actions/dashboard';
import SafetyTrendsChart from './SafetyTrendsChart';
import SafetyStatsTable from './SafetyStatsTable';

// --- Generic Types ---
interface GenericStatsDashboardClientProps {
    data: any[];
    dataKeys: string[];
    colors?: Record<string, string>;
    title: string;
}

// --- Generic Chart ---
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

function GenericStatsChart({ data, selectedKeys, colors }: { data: any[], selectedKeys: string[], colors: Record<string, string> }) {
    // Determine colors if not provided
    const defaultColors = [
        '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
        '#3b82f6', '#6366f1', '#a855f7', '#db2777', '#f43f5e'
    ];

    return (
        <div className="w-full h-[500px] bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <ResponsiveContainer width="100%" height="90%">
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
                    {selectedKeys.map((key, index) => (
                        <Bar
                            key={key}
                            dataKey={key}
                            name={key}
                            stackId="a"
                            fill={colors?.[key] || defaultColors[index % defaultColors.length]}
                            radius={[0, 0, 0, 0]}
                            barSize={40}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

// --- Generic Table ---
function GenericStatsTable({ data, selectedKeys }: { data: any[], selectedKeys: string[] }) {
    const formatMonth = (monthStr: string) => {
        const months = [
            'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];
        const [year, month] = monthStr.split('-');
        const mIndex = parseInt(month, 10) - 1;
        const thaiYear = parseInt(year, 10) + 543;
        return `${months[mIndex]} ${thaiYear}`;
    };

    const totals: Record<string, number> = {};
    let grandTotal = 0;

    selectedKeys.forEach(key => {
        totals[key] = data.reduce((sum, row) => sum + ((row[key] as number) || 0), 0);
        grandTotal += totals[key];
    });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-center">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                            <th className="px-4 py-3 text-left">เดือน / ปี</th>
                            {selectedKeys.map(key => (
                                <th key={key} className="px-4 py-3 min-w-[100px] whitespace-nowrap">{key}</th>
                            ))}
                            <th className="px-4 py-3 text-gray-800 bg-gray-100">รวม</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.map((row) => {
                            const rowTotal = selectedKeys.reduce((sum, key) => sum + ((row[key] as number) || 0), 0);
                            return (
                                <tr key={row.month} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-3 text-left font-medium text-gray-700 whitespace-nowrap">
                                        {formatMonth(row.month)}
                                    </td>
                                    {selectedKeys.map(key => (
                                        <td key={key} className="px-4 py-3 text-gray-600">
                                            {((row[key] as number) || 0).toLocaleString()}
                                        </td>
                                    ))}
                                    <td className="px-4 py-3 font-semibold text-gray-800 bg-gray-50/30">
                                        {rowTotal.toLocaleString()}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold border-t-2 border-gray-200">
                        <tr>
                            <td className="px-4 py-3 text-left">รวมทั้งหมด (12 เดือน)</td>
                            {selectedKeys.map(key => (
                                <td key={key} className="px-4 py-3">
                                    {totals[key].toLocaleString()}
                                </td>
                            ))}
                            <td className="px-4 py-3 text-gray-900">{grandTotal.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}

// --- Main Container ---
export default function GenericStatsDashboardClient({ data, dataKeys, colors = {}, title }: GenericStatsDashboardClientProps) {
    const [selectedKeys, setSelectedKeys] = useState<string[]>(dataKeys);

    const handleToggle = (key: string) => {
        if (selectedKeys.includes(key)) {
            setSelectedKeys(selectedKeys.filter(k => k !== key));
        } else {
            setSelectedKeys([...selectedKeys, key]);
        }
    };

    const handleSelectAll = () => {
        if (selectedKeys.length === dataKeys.length) setSelectedKeys([]);
        else setSelectedKeys([...dataKeys]);
    };

    return (
        <div className="space-y-6">
            {/* Filter Section */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-800">เลือกข้อมูลที่ต้องการแสดง</h3>
                    <button
                        onClick={handleSelectAll}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                        {selectedKeys.length === dataKeys.length ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {dataKeys.map((key) => (
                        <label key={key} className="flex items-center space-x-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={selectedKeys.includes(key)}
                                onChange={() => handleToggle(key)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                            />
                            <span className="text-sm text-gray-700">{key}</span>
                        </label>
                    ))}
                </div>
            </div>

            <h3 className="text-center text-lg font-bold text-gray-800">{title}</h3>

            <GenericStatsChart data={data} selectedKeys={selectedKeys} colors={colors} />
            <GenericStatsChart data={data} selectedKeys={selectedKeys} colors={colors} />
            {/* Safety Trends Section removed - moved to separate tab */}
        </div>
    );
}

function SafetySection() {
    const [safetyData, setSafetyData] = useState<MonthlySafetyStats[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMonthlySafetyStats().then(data => {
            setSafetyData(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div>Loading safety stats...</div>;

    return (
        <div className="mt-8 space-y-6">
            <SafetyTrendsChart data={safetyData} />
            <SafetyStatsTable data={safetyData} />
        </div>
    );
}
