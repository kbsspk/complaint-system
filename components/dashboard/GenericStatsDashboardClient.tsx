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
    // 1. Determine active data source
    const data = districtStats || channelStats || [];
    const isChannel = !!channelStats;

    // 2. Extract all unique keys (Districts or Channels)
    const allKeys = useMemo(() => {
        const keys = new Set<string>();
        data.forEach(item => {
            Object.keys(item).forEach(k => {
                if (k !== 'month') {
                    keys.add(k);
                }
            });
        });
        return Array.from(keys).sort();
    }, [data]);

    // 3. State for selection
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

    // Initialize selection when keys change
    useEffect(() => {
        if (allKeys.length > 0) {
            setSelectedKeys(allKeys);
        }
    }, [allKeys]);

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
            setSelectedKeys(prev => [...prev, key]);
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

    // Collapse logic for filter if too many items
    const [isFilterExpanded, setIsFilterExpanded] = useState(true);

    if (!data || data.length === 0) {
        return <div className="p-8 text-center text-gray-400">ไม่มีข้อมูล</div>;
    }

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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
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
                                <span className="text-sm text-gray-700 truncate" title={key}>
                                    {isChannel ? (
                                        key === 'ONLINE' ? 'ออนไลน์' :
                                            key === 'PHONE' ? 'โทรศัพท์' :
                                                key === 'LETTER' ? 'หนังสือราชการ' :
                                                    key === 'WALK_IN' ? 'Walk-in' : key
                                    ) : key}
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
                                isChannel ? (
                                    name === 'ONLINE' ? 'ออนไลน์' :
                                        name === 'PHONE' ? 'โทรศัพท์' :
                                            name === 'LETTER' ? 'หนังสือราชการ' :
                                                name === 'WALK_IN' ? 'Walk-in' : name
                                ) : name
                            ]}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />

                        {selectedKeys.map((key, index) => {
                            // Find original index from allKey to keep consistent color even if filtered
                            const colorIndex = allKeys.indexOf(key);
                            return (
                                <Bar
                                    key={key}
                                    dataKey={key}
                                    name={isChannel ? (
                                        key === 'ONLINE' ? 'ออนไลน์' :
                                            key === 'PHONE' ? 'โทรศัพท์' :
                                                key === 'LETTER' ? 'หนังสือราชการ' :
                                                    key === 'WALK_IN' ? 'Walk-in' : key
                                    ) : key}
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
        </div>
    );
}
