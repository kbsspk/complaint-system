'use client';

import { useState } from 'react';
import EditComplaintModal from './EditComplaintModal';

export default function ComplaintEditButton({ complaint }: { complaint: any }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSuccess = () => {
        // The modal calls updateComplaint which does revalidatePath.
        // But client-side state might not update immediately if we don't refresh or provided updated data.
        // Ideally, revalidatePath on server causes the parent page to re-render with new data.
        // So we just close the modal.
        setIsOpen(false);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 rounded-lg font-medium text-sm transition-colors border bg-white text-gray-600 border-gray-300 hover:bg-gray-50 flex items-center gap-2"
            >
                <span className="material-symbols-outlined text-lg">edit</span>
                แก้ไขข้อมูล
            </button>

            {isOpen && (
                <EditComplaintModal
                    complaint={complaint}
                    onClose={() => setIsOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </>
    );
}
