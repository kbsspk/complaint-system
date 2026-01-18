'use client';

import { useState, useMemo, useEffect } from 'react';
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
import {
    MonthlyStats,
    MonthlyDistrictStats,
    MonthlyChannelStats,
} from '@/actions/dashboard';
// import { ChevronDown, ChevronUp } from 'lucide-react'; 
// Use inline SVG instead to avoid dependency issues

export default function GenericStatsDashboardClient({
    stats,
    districtStats,
    channelStats,
    title
}: {
    stats?: MonthlyStats[];
    districtStats?: MonthlyDistrictStats[];
    channelStats?: MonthlyChannelStats[];
    title?: string;
}) {
    // 1. Constants
    const ALL_DISTRICTS = [
        'เมืองสมุทรปราการ',
        'บางบ่อ',
        'บางพลี',
        'พระประแดง',
        'พระสมุทรเจดีย์',
        'บางเสาธง'
    ];

    const ALL_CHANNELS = [
        'ONLINE',
        'PHONE',
        'LETTER',
        'WALK_IN'
    ];

    // 2. Determine active keys based on prop type
    const isChannel = !!channelStats;
    const allKeys = isChannel ? ALL_CHANNELS : ALL_DISTRICTS;
    const data = districtStats || channelStats || [];

    // 3. State for selection (Default to allKeys)
    const [selectedKeys, setSelectedKeys] = useState<string[]>(allKeys);

    // 4. Color Palette
    const COLORS = [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
        '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6',
        '#f43f5e', '#a855f7', '#d946ef', '#eab308', '#2dd4bf'
    ];

    const getColor = (index: number) => COLORS[index % COLORS.length];

    // Filter Logic
    const handleToggle = (key: string) => {
        if (selectedKeys.includes(key)) {
            setSelectedKeys(prev => prev.filter(k => k !== key));
        } else {
            // Sort to keep order consistent
            setSelectedKeys(prev => {
                const newKeys = [...prev, key];
                return allKeys.filter(k => newKeys.includes(k));
            });
        }
    };

    const handleSelectAll = () => {
        if (selectedKeys.length === allKeys.length) setSelectedKeys([]);
        else setSelectedKeys([...allKeys]);
    };

    // Format X Axis
    const formatMonth = (tick: string) => {
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

    const formatFullMonth = (tick: string) => {
        if (!tick) return '';
        const months = [
            'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];
        const [year, month] = tick.split('-');
        const mIndex = parseInt(month, 10) - 1;
        const thaiYear = parseInt(year, 10) + 543;
        return `${months[mIndex]} ${thaiYear}`;
    };

    const getDisplayName = (key: string) => {
        if (!isChannel) return key;
        switch (key) {
            case 'ONLINE': return 'ออนไลน์';
            case 'PHONE': return 'โทรศัพท์';
            case 'LETTER': return 'หนังสือราชการ';
            case 'WALK_IN': return 'Walk-in';
            default: return key;
        }
    };

    // Calculate Table Totals
    const columnTotals: Record<string, number> = {};
    let grandTotal = 0;

    selectedKeys.forEach(key => {
        const sum = data.reduce((acc, row) => acc + ((row[key] as number) || 0), 0);
        columnTotals[key] = sum;
        grandTotal += sum;
    });

    // Collapse logic for filter if too many items (only relevant for districts maybe?)
    const [isFilterExpanded, setIsFilterExpanded] = useState(true);

    return (
        <div className="space-y-6">
            {/* Filter Section */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800">
                        {title} (เลือกเพื่อกรองข้อมูล)
                    </h3>
                    <div className="flex gap-4">
                        <button
                            onClick={handleSelectAll}
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                            {selectedKeys.length === allKeys.length ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
                        </button>
                        <button
                            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            {isFilterExpanded ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            )}
                        </button>
                    </div>
                </div>

                {isFilterExpanded && (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                        {allKeys.map((key, index) => (
                            <label key={key} className="flex items-center space-x-2 cursor-pointer select-none hover:bg-gray-50 p-1 rounded">
                                <div
                                    className="w-4 h-4 rounded border flex items-center justify-center shrink-0"
                                    style={{
                                        borderColor: selectedKeys.includes(key) ? getColor(index) : '#D1D5DB',
                                        backgroundColor: selectedKeys.includes(key) ? getColor(index) : 'white'
                                    }}
                                >
                                    {selectedKeys.includes(key) && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={selectedKeys.includes(key)}
                                    onChange={() => handleToggle(key)}
                                    className="hidden" // Custom checkbox
                                />
                                <span className="text-sm text-gray-700 truncate" title={getDisplayName(key)}>
                                    {getDisplayName(key)}
                                </span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Chart Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[500px]">
                <h3 className="text-center text-lg font-bold mb-6 text-gray-800">
                    กราฟแสดง{title}
                </h3>
                <ResponsiveContainer width="100%" height="85%">
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="month"
                            tickFormatter={formatMonth}
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
                                value: 'จำนวนเรื่อง',
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
                            labelFormatter={(label) => formatMonth(label)}
                            formatter={(value: any, name: any) => [
                                value,
                                getDisplayName(name)
                            ]}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />

                        {selectedKeys.map((key) => {
                            const colorIndex = allKeys.indexOf(key);
                            return (
                                <Bar
                                    key={key}
                                    dataKey={key}
                                    name={getDisplayName(key)}
                                    stackId="a"
                                    fill={getColor(colorIndex)}
                                    radius={[0, 0, 0, 0]}
                                    barSize={40}
                                />
                            );
                        })}
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">ตารางสรุป{title}</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-center">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                                <th className="px-4 py-3 text-left">เดือน / ปี</th>
                                {selectedKeys.map(key => (
                                    <th key={key} className="px-4 py-3 min-w-[100px] whitespace-nowrap">
                                        {getDisplayName(key)}
                                    </th>
                                ))}
                                <th className="px-4 py-3 text-gray-800 bg-gray-100">รวม</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data && data.length > 0 ? (
                                data.map((row) => {
                                    const rowTotal = selectedKeys.reduce((sum, key) => sum + ((row[key] as number) || 0), 0);
                                    return (
                                        <tr key={row.month} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3 text-left font-medium text-gray-700 whitespace-nowrap">
                                                {formatFullMonth(row.month)}
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
                                })
                            ) : (
                                <tr>
                                    <td colSpan={selectedKeys.length + 2} className="px-4 py-8 text-center text-gray-400">
                                        ไม่มีข้อมูล
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-gray-100 font-bold border-t-2 border-gray-200">
                            <tr>
                                <td className="px-4 py-3 text-left">รวมทั้งหมด (12 เดือน)</td>
                                {selectedKeys.map(key => (
                                    <td key={key} className="px-4 py-3">
                                        {columnTotals[key]?.toLocaleString() || 0}
                                    </td>
                                ))}
                                <td className="px-4 py-3 text-gray-900">{grandTotal.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}
