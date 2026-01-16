'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { ComplaintPdf } from './ComplaintPdf';
import { useEffect, useState } from 'react';

export default function ComplaintPrintButton({ complaint }: { complaint: any }) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors" disabled>
                <span className="material-symbols-outlined text-[20px]">print</span>
                <span>พิมพ์รายงาน</span>
            </button>
        );
    }

    return (
        <PDFDownloadLink
            document={<ComplaintPdf complaint={complaint} />}
            fileName={`complaint-report-${complaint.complaint_number || complaint.id}.pdf`}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
            {({ blob, url, loading, error }) => (
                <>
                    <span className="material-symbols-outlined text-[20px]">print</span>
                    <span>{loading ? 'กำลังสร้าง PDF...' : 'พิมพ์รายงาน'}</span>
                </>
            )}
        </PDFDownloadLink>
    );
}
