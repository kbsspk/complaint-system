'use client';

import { useState, useEffect } from 'react';
import { acceptComplaint } from '@/actions/admin-actions';
import { useFormStatus } from 'react-dom';

interface AcceptComplaintModalProps {
    complaint: any | null; // Replace 'any' with proper type if available
    onClose: () => void;
    onSuccess: () => void;
}

export default function AcceptComplaintModal({ complaint, onClose, onSuccess }: AcceptComplaintModalProps) {
    const [loading, setLoading] = useState(false);
    const [officers, setOfficers] = useState<{ id: number; full_name: string }[]>([]);

    useEffect(() => {
        import('@/actions/officer-actions').then(mod => {
            mod.getOfficers().then(setOfficers);
        });
    }, []);

    // Initial state setup if needed

    if (!complaint) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        // Ensure ID is passed
        formData.append('id', complaint.id.toString());

        const res = await acceptComplaint(null, formData);
        setLoading(false);
        if (res.success) {
            onSuccess();
            onClose();
        } else {
            alert(res.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl shadow-xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b shrink-0">
                    <h2 className="text-xl font-bold text-green-700">รับเรื่องเข้าระบบ</h2>
                    <p className="text-sm text-gray-500">กรอกข้อมูลเพิ่มเติมสำหรับเรื่องร้องเรียน #{complaint.id}</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                    {/* Official Info Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">เลขรับเรื่อง (Complaint No.)</label>
                            <input name="complaint_number" type="text" required className="w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">วันรับเรื่อง (ธุรการ)</label>
                            <input name="received_date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full border rounded p-2" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                        <div className="col-span-2 text-sm font-semibold text-gray-700">เอกสารต้นเรื่อง (ถ้ามี)</div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">เลขที่หนังสือ</label>
                            <input name="original_doc_number" type="text" className="w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ลงวันที่</label>
                            <input name="original_doc_date" type="date" className="w-full border rounded p-2" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">อัพโหลดไฟล์ PDF</label>
                            <input name="original_doc_file" type="file" accept="application/pdf" className="w-full border rounded p-2 bg-white" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ช่องทาง</label>
                            <select name="channel" className="w-full border rounded p-2" defaultValue="ONLINE">
                                <option value="ONLINE">ออนไลน์ (อัตโนมัติ)</option>
                                <option value="PHONE">โทรศัพท์</option>
                                <option value="LETTER">หนังสือราชการ</option>
                                <option value="WALK_IN">Walk-in</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ประเภท</label>
                            <select name="type" className="w-full border rounded p-2" required>
                                <option value="">-- เลือกประเภท --</option>
                                <option value="ARREST">แจ้งความนำจับ</option>
                                <option value="GENERAL">เรื่องร้องเรียนทั่วไป</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">อำเภอ</label>
                            <select name="district" className="w-full border rounded p-2" required>
                                <option value="">-- เลือกอำเภอ --</option>
                                <option value="เมืองสมุทรปราการ">เมืองสมุทรปราการ</option>
                                <option value="บางบ่อ">บางบ่อ</option>
                                <option value="บางพลี">บางพลี</option>
                                <option value="พระประแดง">พระประแดง</option>
                                <option value="พระสมุทรเจดีย์">พระสมุทรเจดีย์</option>
                                <option value="บางเสาธง">บางเสาธง</option>
                            </select>
                        </div>
                        <div className="flex items-end pb-2 md:col-span-3">
                            <label className="flex items-center space-x-2 cursor-pointer bg-red-50 px-3 py-2 rounded-lg border border-red-100 w-full hover:bg-red-100 transition-colors">
                                <input
                                    type="checkbox"
                                    name="is_safety_health_related"
                                    value="true"
                                    className="rounded text-red-600 focus:ring-red-500 size-4"
                                />
                                <span className="text-sm font-medium text-red-800">เรื่องที่เกี่ยวข้องกับความปลอดภัยซึ่งมีผลต่อสุขภาพ</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">พรบ. ที่เกี่ยวข้อง (เลือกได้มากกว่า 1)</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border p-3 rounded h-32 overflow-y-auto">
                            {[
                                'ยา', 'อาหาร', 'เครื่องสำอาง', 'วัตถุอันตราย', 'เครื่องมือแพทย์',
                                'สถานประกอบการเพื่อสุขภาพ', 'สถานพยาบาล', 'ผลิตภัณฑ์สมุนไพร',
                                'พืชกระท่อม', 'สุขาภิบาลอาหาร'
                            ].map(act => (
                                <label key={act} className="flex items-center space-x-2 text-sm">
                                    <input type="checkbox" name="related_acts" value={act} className="rounded text-primary" />
                                    <span>{act}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ผู้รับผิดชอบ</label>
                        <select name="responsible_person_id" className="w-full border rounded p-2 text-gray-500">
                            <option value="">รอการมอบหมาย</option>
                            {officers.map((off: any) => (
                                <option key={off.id} value={off.id}>{off.full_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
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
                            className="px-6 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-md font-medium"
                            disabled={loading}
                        >
                            {loading ? 'กำลังบันทึก...' : 'บันทึกและรับเรื่อง'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
