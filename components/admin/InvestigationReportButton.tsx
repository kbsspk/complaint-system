'use client';

import { useState } from 'react';
import InvestigationReportModal from './InvestigationReportModal';

interface InvestigationReportButtonProps {
    complaint: any;
}

export default function InvestigationReportButton({ complaint }: InvestigationReportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 rounded-lg font-medium text-sm transition-colors border bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-sm flex items-center gap-2"
            >
                <span className="material-symbols-outlined text-[18px]">fact_check</span>
                บันทึกผลการตรวจสอบ
            </button>

            {isOpen && (
                <InvestigationReportModal
                    complaintId={complaint.id}
                    currentData={complaint}
                    onClose={() => setIsOpen(false)}
                    onSuccess={() => {
                        setIsOpen(false);
                        // Optional: trigger refresh if not handled by action revalidate
                        window.location.reload();
                    }}
                />
            )}
        </>
    );
}
