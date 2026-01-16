'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function DashboardTabs() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentView = searchParams.get('view') || 'status';

    const handleTabChange = (view: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('view', view);
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex border-b border-gray-200 mb-6">
            <button
                onClick={() => handleTabChange('status')}
                className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${currentView === 'status'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
            >
                สถานะการดำเนินการ
            </button>
            <button
                onClick={() => handleTabChange('acts')}
                className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${currentView === 'acts'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
            >
                แยกตาม พรบ.
            </button>
            <button
                onClick={() => handleTabChange('district')}
                className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${currentView === 'district'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
            >
                แยกตามอำเภอ
            </button>
            <button
                onClick={() => handleTabChange('channel')}
                className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${currentView === 'channel'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
            >
                แยกตามช่องทาง
            </button>
            <button
                onClick={() => handleTabChange('safety')}
                className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${currentView === 'safety'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
            >
                แยกตามความปลอดภัย/สุขภาพ
            </button>
            <button
                onClick={() => handleTabChange('fines')}
                className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${currentView === 'fines'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
            >
                ยอดเงินค่าปรับ
            </button>
            <button
                onClick={() => handleTabChange('officer')}
                className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${currentView === 'officer'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
            >
                ข้อมูลเจ้าหน้าที่
            </button>
        </div>
    );
}
