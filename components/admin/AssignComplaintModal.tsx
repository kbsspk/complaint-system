'use client';

import { useState, useEffect } from 'react';
import { getOfficers, assignComplaint } from '@/actions/officer-actions';

interface AssignComplaintModalProps {
    complaintId: number;
    currentOfficerId?: number;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AssignComplaintModal({ complaintId, currentOfficerId, onClose, onSuccess }: AssignComplaintModalProps) {
    const [officers, setOfficers] = useState<{ id: number; full_name: string }[]>([]);
    const [selectedOfficer, setSelectedOfficer] = useState<string>(currentOfficerId?.toString() || '');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getOfficers().then(setOfficers);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await assignComplaint(complaintId, parseInt(selectedOfficer));
        setLoading(false);
        if (res.success) {
            onSuccess();
        } else {
            alert(res.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">มอบหมายเจ้าหน้าที่</h3>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-700">เลือกเจ้าหน้าที่รับผิดชอบ</span>
                        <select
                            className="border rounded-lg p-2.5 bg-gray-50 focus:bg-white transition-colors"
                            value={selectedOfficer}
                            onChange={(e) => setSelectedOfficer(e.target.value)}
                            required
                        >
                            <option value="">-- กรุณาเลือก --</option>
                            {officers.map(off => (
                                <option key={off.id} value={off.id}>{off.full_name}</option>
                            ))}
                        </select>
                    </label>

                    <div className="flex gap-3 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
                            disabled={loading}
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium shadow-sm"
                            disabled={loading || !selectedOfficer}
                        >
                            {loading ? 'กำลับบันทึก...' : 'บันทึก'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
