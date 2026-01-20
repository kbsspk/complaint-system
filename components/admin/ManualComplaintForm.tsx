'use client';

import { useState, useEffect } from 'react';
import { createManualComplaint } from '@/actions/admin-actions';

interface ManualComplaintFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function ManualComplaintForm({ onClose, onSuccess }: ManualComplaintFormProps) {
    const [loading, setLoading] = useState(false);

    const [officers, setOfficers] = useState<{ id: number; full_name: string }[]>([]);
    const [wantsOfficialLetter, setWantsOfficialLetter] = useState(false);
    const [deliveryMethod, setDeliveryMethod] = useState<'EMAIL' | 'POST' | null>(null);

    useEffect(() => {
        // Dynamic import or separate action call? We can assume getOfficers is available from officer-actions
        import('@/actions/officer-actions').then(mod => {
            mod.getOfficers().then(setOfficers);
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const res = await createManualComplaint(null, formData);
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
                <div className="p-6 border-b flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold text-gray-900">เพิ่มเรื่องร้องเรียนใหม่ (Admin/Officer)</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8 overflow-y-auto">

                    {/* Section 1: Official Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">1. ข้อมูลการรับเรื่อง</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">เลขรับเรื่อง *</label>
                                <input name="complaint_number" type="text" required className="w-full border rounded p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">วันรับเรื่อง *</label>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">ช่องทาง *</label>
                                <select name="channel" className="w-full border rounded p-2" required>
                                    <option value="">-- เลือก --</option>
                                    <option value="ONLINE">ออนไลน์</option>
                                    <option value="PHONE">โทรศัพท์</option>
                                    <option value="LETTER">หนังสือราชการ</option>
                                    <option value="WALK_IN">Walk-in</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ประเภท *</label>
                                <select name="type" className="w-full border rounded p-2" required>
                                    <option value="">-- เลือก --</option>
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
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">พรบ. ที่เกี่ยวข้อง</label>
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
                            <label className="flex items-center space-x-2 text-sm font-medium text-red-600 mb-4 bg-red-50 p-2 rounded border border-red-100">
                                <input type="checkbox" name="is_safety_health_related" className="rounded text-red-600 focus:ring-red-500" />
                                <span>เป็นเรื่องที่มีผลต่อความปลอดภัยหรือสุขภาพร้ายแรง</span>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ผู้รับผิดชอบ</label>
                            <select name="responsible_person_id" className="w-full border rounded p-2 text-gray-500">
                                <option value="">รอการมอบหมาย</option>
                                {officers.map(off => (
                                    <option key={off.id} value={off.id}>{off.full_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Section 2: Complaint Details */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">2. รายละเอียดเรื่องร้องเรียน</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ร้อง *</label>
                                <input name="name" className="w-full border rounded p-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">เลขบัตรประชาชน (ถ้ามี)</label>
                                <input name="idCard" maxLength={13} className="w-full border rounded p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                                <input name="phone" className="w-full border rounded p-2" />
                            </div>
                        </div>


                        {/* Official Letter Request */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    name="wantsOfficialLetter"
                                    type="checkbox"
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={wantsOfficialLetter}
                                    onChange={(e) => setWantsOfficialLetter(e.target.checked)}
                                />
                                <span className="font-semibold text-gray-800">ประสงค์จะรับผลการตรวจสอบเป็นหนังสือราชการ</span>
                            </label>
                            <p className="text-sm text-gray-500 mt-2 ml-8">
                                กรณีไม่ประสงค์รับหนังสือราชการ ท่านยังคงสามารถติดตามผลการดำเนินการ และดูหนังสือราชการได้ที่เมนู &quot;ติดตามเรื่องร้องเรียน&quot; โดยใช้เลขบัตรประชาชนที่แจ้งเรื่องเข้ามา
                            </p>

                            {wantsOfficialLetter && (
                                <div className="mt-3 pl-6 space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ช่องทางการรับหนังสือ *</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    name="officialLetterDeliveryMethod"
                                                    type="radio"
                                                    value="EMAIL"
                                                    className="text-blue-600 focus:ring-blue-500"
                                                    checked={deliveryMethod === 'EMAIL'}
                                                    onChange={() => setDeliveryMethod('EMAIL')}
                                                />
                                                <span className="text-sm text-gray-700">ทางอีเมล</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    name="officialLetterDeliveryMethod"
                                                    type="radio"
                                                    value="POST"
                                                    className="text-blue-600 focus:ring-blue-500"
                                                    checked={deliveryMethod === 'POST'}
                                                    onChange={() => setDeliveryMethod('POST')}
                                                />
                                                <span className="text-sm text-gray-700">ทางไปรษณีย์</span>
                                            </label>
                                        </div>
                                    </div>

                                    {deliveryMethod === 'EMAIL' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ระบุอีเมล *</label>
                                            <input
                                                name="officialLetterEmail"
                                                type="email"
                                                className="w-full border rounded p-2"
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                    )}

                                    {deliveryMethod === 'POST' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ระบุที่อยู่จัดส่ง *</label>
                                            <textarea
                                                name="officialLetterAddress"
                                                rows={2}
                                                className="w-full border rounded p-2"
                                                placeholder="ที่อยู่สำหรับจัดส่งเอกสาร"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผลิตภัณฑ์ (ถ้ามี)</label>
                                <input name="productName" className="w-full border rounded p-2" placeholder="เช่น ผลิตภัณฑ์เสริมอาหารตราเอบีซี..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">เลขทะเบียน/เลข อย. (ถ้ามี)</label>
                                <input name="fdaNumber" className="w-full border rounded p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อร้าน/สถานประกอบการ (ถ้ามี)</label>
                                <input name="shopName" className="w-full border rounded p-2" placeholder="เช่น ร้านยากอไก่..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">สถานที่ตั้ง/แหล่งที่พบ/ช่องทางที่พบ (ระบุตำแหน่งที่ตั้งพอสังเขป หรือ ลิงค์ที่พบ เพื่อให้เจ้าหน้าที่สามารถเข้าตรวจสอบได้) *</label>
                                <input name="location" className="w-full border rounded p-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เกิดเหตุ</label>
                                <input name="dateIncident" type="date" className="w-full border rounded p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ความเสียหายที่เกิดขึ้น (ถ้ามี)</label>
                                <input name="damageValue" className="w-full border rounded p-2" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดเหตุการณ์ *</label>
                            <textarea name="details" rows={4} className="w-full border rounded p-2" required />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">หลักฐานเพิ่มเติม (รูปภาพ/ไฟล์)</label>
                            <input name="evidence_files" type="file" multiple className="w-full border rounded p-2" />
                        </div>
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
                            className="px-6 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md font-medium"
                            disabled={loading}
                        >
                            {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
}
