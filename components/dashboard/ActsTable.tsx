'use client';

import type { MonthlyActStats } from '@/actions/dashboard';

interface ActsTableProps {
    data: MonthlyActStats[];
    selectedActs: string[];
}

export default function ActsTable({ data, selectedActs }: ActsTableProps) {
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

    // Calculate totals per Act
    const actTotals: Record<string, number> = {};
    let grandTotal = 0;

    selectedActs.forEach(act => {
        actTotals[act] = data.reduce((sum, row) => sum + ((row[act] as number) || 0), 0);
        grandTotal += actTotals[act];
    });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">ตารางสรุปสถิติแยกตาม พรบ.</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-center">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                            <th className="px-4 py-3 text-left">เดือน / ปี</th>
                            {selectedActs.map(act => (
                                <th key={act} className="px-4 py-3 min-w-[100px] whitespace-nowrap">{act}</th>
                            ))}
                            <th className="px-4 py-3 text-gray-800 bg-gray-100">รวม</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.map((row) => {
                            const rowTotal = selectedActs.reduce((sum, act) => sum + ((row[act] as number) || 0), 0);
                            return (
                                <tr key={row.month} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-3 text-left font-medium text-gray-700 whitespace-nowrap">
                                        {formatMonth(row.month)}
                                    </td>
                                    {selectedActs.map(act => (
                                        <td key={act} className="px-4 py-3 text-gray-600">
                                            {((row[act] as number) || 0).toLocaleString()}
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
                            {selectedActs.map(act => (
                                <td key={act} className="px-4 py-3">
                                    {actTotals[act].toLocaleString()}
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
