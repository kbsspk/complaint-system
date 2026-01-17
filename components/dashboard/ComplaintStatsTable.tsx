'use client';

import type { MonthlyStats } from '@/actions/dashboard';


interface ComplaintStatsTableProps {
    data: MonthlyStats[];
}

export default function ComplaintStatsTable({ data }: ComplaintStatsTableProps) {
    // Helper for correct Thai month conversion manually to match chart
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

    // Calculate Column Totals
    const totalPending = data.reduce((sum, item) => sum + item.pending, 0);
    const totalInspected = data.reduce((sum, item) => sum + item.inspected, 0);
    const totalCompleted = data.reduce((sum, item) => sum + item.completed, 0);
    const grandTotal = totalPending + totalInspected + totalCompleted;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">ตารางสรุปสถิติรายเดือน</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-center">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                            <th className="px-4 py-3 text-left">เดือน / ปี</th>
                            <th className="px-4 py-3 text-red-600 bg-red-50">รอดำเนินการ</th>
                            <th className="px-4 py-3 text-blue-600 bg-blue-50">ตรวจสอบแล้ว</th>
                            <th className="px-4 py-3 text-green-600 bg-green-50">ยุติเรื่อง</th>
                            <th className="px-4 py-3 text-gray-800 bg-gray-100">รวมทั้งสิ้น</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.map((item) => {
                            const rowTotal = item.pending + item.inspected + item.completed;
                            return (
                                <tr key={item.month} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-3 text-left font-medium text-gray-700 whitespace-nowrap">
                                        {formatMonth(item.month)}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{item.pending.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-gray-600">{item.inspected.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-gray-600">{item.completed.toLocaleString()}</td>
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
                            <td className="px-4 py-3 text-red-700">{totalPending.toLocaleString()}</td>
                            <td className="px-4 py-3 text-blue-700">{totalInspected.toLocaleString()}</td>
                            <td className="px-4 py-3 text-green-700">{totalCompleted.toLocaleString()}</td>
                            <td className="px-4 py-3 text-gray-900">{grandTotal.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
