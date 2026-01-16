'use client';

interface SafetyStats {
    month: string;
    safety_related: number;
    others: number;
}

interface SafetyStatsTableProps {
    data: SafetyStats[];
}

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

export default function SafetyStatsTable({ data }: SafetyStatsTableProps) {
    const totalSafety = data.reduce((sum, item) => sum + item.safety_related, 0);
    const totalOthers = data.reduce((sum, item) => sum + item.others, 0);
    const grandTotal = totalSafety + totalOthers;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
            <h3 className="text-lg font-bold text-gray-800 p-6 border-b border-gray-100">ตารางสรุปข้อมูล</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-center">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                            <th className="px-6 py-4 text-left">เดือน / ปี</th>
                            <th className="px-6 py-4 text-red-600">เรื่องที่ส่งผลต่อสุขภาพ</th>
                            <th className="px-6 py-4 text-gray-600">เรื่องทั่วไป / อื่นๆ</th>
                            <th className="px-6 py-4 text-gray-800 bg-gray-100">รวมทั้งหมด</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.map((row) => (
                            <tr key={row.month} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 text-left font-medium text-gray-700 whitespace-nowrap">
                                    {formatMonth(row.month)}
                                </td>
                                <td className="px-6 py-4 font-medium text-red-600 bg-red-50/30">
                                    {row.safety_related.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {row.others.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-900 bg-gray-50/50">
                                    {(row.safety_related + row.others).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold border-t-2 border-gray-200">
                        <tr>
                            <td className="px-6 py-4 text-left text-gray-900">รวมทั้งหมด (12 เดือน)</td>
                            <td className="px-6 py-4 text-red-700 bg-red-50/50">{totalSafety.toLocaleString()}</td>
                            <td className="px-6 py-4 text-gray-700">{totalOthers.toLocaleString()}</td>
                            <td className="px-6 py-4 text-gray-900 text-base">{grandTotal.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
