'use client';

import { useState } from 'react';
import { rejectComplaint } from '@/actions/admin-actions';

interface RejectComplaintModalProps {
    complaintId: number | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function RejectComplaintModal({ complaintId, onClose, onSuccess }: RejectComplaintModalProps) {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    if (!complaintId) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await rejectComplaint(complaintId, reason);
        setLoading(false);
        if (res.success) {
            onSuccess();
            onClose();
        } else {
            alert(res.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                <h2 className="text-xl font-bold mb-4 text-red-600">คืนเรื่องร้องเรียน</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">เหตุผลการคืนเรื่อง</label>
                        <textarea
                            className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-red-500"
                            rows={4}
                            required
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="ระบุเหตุผลการคืนเรื่องเพื่อให้ผู้ร้องทราบ..."
                        ></textarea>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                            disabled={loading}
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md"
                            disabled={loading}
                        >
                            {loading ? 'กำลังบันทึก...' : 'ยืนยันการคืนเรื่อง'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
