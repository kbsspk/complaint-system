'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface FinesDashboardClientProps {
    data: any[];
    availableActs: string[]; // Pass these in from server for filter dropdown
    availableSections: string[];
}

export default function FinesDashboardClient({ data, availableActs, availableSections }: FinesDashboardClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Local state for filters, synced with URL params
    const [actFilter, setActFilter] = useState(searchParams.get('act') || 'ALL');
    const [sectionFilter, setSectionFilter] = useState(searchParams.get('section') || 'ALL');

    // Debounce for section input to avoid too many refreshes
    useEffect(() => {
        if (sectionFilter !== (searchParams.get('section') || 'ALL')) {
            updateParams('section', sectionFilter);
        }
    }, [sectionFilter]);

    const updateParams = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value && value !== 'ALL') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`?${params.toString()}`);
    };

    const handleActChange = (val: string) => {
        setActFilter(val);
        setSectionFilter('ALL'); // Reset section when act changes

        const params = new URLSearchParams(searchParams);
        if (val && val !== 'ALL') {
            params.set('act', val);
        } else {
            params.delete('act');
        }
        params.delete('section'); // Always reset section param

        router.push(`?${params.toString()}`);
    };

    const totalFines = data.reduce((acc, curr) => acc + curr.totalAmount, 0);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">สรุปยอดเงินค่าปรับ</h2>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-3xl font-bold text-amber-600">฿{totalFines.toLocaleString()}</span>
                            <span className="text-sm text-gray-500">ยอดรวมทั้งหมดในรอบ 12 เดือน</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <select
                            value={actFilter}
                            onChange={(e) => handleActChange(e.target.value)}
                            className="px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none min-w-[200px]"
                        >
                            <option value="ALL">ทุกพรบ.</option>
                            {availableActs.map(act => (
                                <option key={act} value={act}>{act}</option>
                            ))}
                        </select>
                        <select
                            value={sectionFilter}
                            onChange={(e) => setSectionFilter(e.target.value)}
                            className="px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none w-[180px]"
                        >
                            <option value="ALL">ทุกมาตรา</option>
                            {availableSections.map(sec => (
                                <option key={sec} value={sec}>{sec}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                tickFormatter={(value) => `฿${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: '#F3F4F6' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: any) => [`฿${Number(value).toLocaleString()}`, 'ยอดค่าปรับ']}
                                labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '4px' }}
                            />
                            <Bar
                                dataKey="totalAmount"
                                name="ยอดค่าปรับ"
                                fill="#d97706"
                                radius={[4, 4, 0, 0]}
                                barSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">รายละเอียดรายเดือน</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">เดือน</th>
                                <th className="px-6 py-4 text-right">จำนวนคดี (ราย)</th>
                                <th className="px-6 py-4 text-right">ยอดเงินค่าปรับ (บาท)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {[...data].reverse().map((item) => (
                                <tr key={item.month} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.month}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{item.count}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-amber-600 text-right">฿{item.totalAmount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
