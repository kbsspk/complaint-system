'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    MonthlyStats,
    MonthlyDistrictStats,
    MonthlyChannelStats,
} from '@/actions/dashboard';

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
    // Format Month for X Axis
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

    // Aggregation Logic
    const aggregateData = (data: any[], keyName: string) => {
        if (!data || data.length === 0) return [];
        const totals: Record<string, number> = {};

        data.forEach(item => {
            Object.keys(item).forEach(key => {
                if (key !== 'month') {
                    totals[key] = (totals[key] || 0) + Number(item[key] || 0);
                }
            });
        });

        return Object.entries(totals).map(([name, count]) => ({
            [keyName]: name,
            count
        })).sort((a, b) => b.count - a.count); // Sort desc
    };

    const aggregatedDistrictData = districtStats ? aggregateData(districtStats, 'district') : [];
    const aggregatedChannelData = channelStats ? aggregateData(channelStats, 'channel') : [];

    return (
        <div className="space-y-8">
            {title && <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>}

            {/* Main Stats Chart */}
            {stats && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">สถิติเรื่องร้องเรียนรายเดือน</h3>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="month"
                                    tickFormatter={formatMonth}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#F3F4F6' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="pending" name="รอรับเรื่อง" fill="#9CA3AF" radius={[4, 4, 0, 0]} stackId="a" />
                                <Bar dataKey="in_progress" name="กำลังดำเนินการ" fill="#3B82F6" radius={[4, 4, 0, 0]} stackId="a" />
                                <Bar dataKey="resolved" name="เสร็จสิ้น" fill="#10B981" radius={[4, 4, 0, 0]} stackId="a" />
                                <Bar dataKey="rejected" name="ยุติเรื่อง" fill="#EF4444" radius={[4, 4, 0, 0]} stackId="a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Secondary Charts: District & Channel */}
            {(districtStats || channelStats) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {districtStats && (
                        <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 ${!channelStats ? 'md:col-span-2' : ''}`}>
                            <h3 className="text-lg font-bold text-gray-800 mb-6">{title || 'แยกตามอำเภอ'}</h3>
                            <div className="h-[600px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={aggregatedDistrictData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#E5E7EB" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="district" type="category" width={100} tick={{ fontSize: 12 }} />
                                        <Tooltip cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="count" name="จำนวนเรื่อง" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={20} label={{ position: 'right' }} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {channelStats && (
                        <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 ${!districtStats ? 'md:col-span-2' : ''}`}>
                            <h3 className="text-lg font-bold text-gray-800 mb-6">{title || 'แยกตามช่องทาง'}</h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={aggregatedChannelData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="count"
                                            nameKey="channel"
                                        >
                                            {aggregatedChannelData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}


