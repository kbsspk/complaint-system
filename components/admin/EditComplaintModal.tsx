'use client';

import { useState, useEffect } from 'react';
import { updateComplaint } from '@/actions/admin-actions';
import { getOfficers } from '@/actions/officer-actions';
import { format } from 'date-fns';

import { Complaint } from '@/lib/types';


interface EditComplaintModalProps {
    complaint: Complaint;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditComplaintModal({ complaint, onClose, onSuccess }: EditComplaintModalProps) {
    const [loading, setLoading] = useState(false);
    const [officers, setOfficers] = useState<{ id: number; full_name: string }[]>([]);
    const [wantsOfficialLetter, setWantsOfficialLetter] = useState(false);
    const [deliveryMethod, setDeliveryMethod] = useState<'EMAIL' | 'POST' | null>(null);
    const [isSafetyRelated, setIsSafetyRelated] = useState(false);

    useEffect(() => {
        getOfficers().then(setOfficers);
        setWantsOfficialLetter(!!complaint.wants_official_letter);
        setDeliveryMethod((complaint.official_letter_method as 'EMAIL' | 'POST' | undefined) || null);
        setIsSafetyRelated(!!complaint.is_safety_health_related);
    }, [complaint]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const res = await updateComplaint(complaint.id, formData);
        setLoading(false);
        if (res.success) {
            onSuccess();
            onClose();
        } else {
            alert(res.message);
        }
    };

    // Helper to check if act is selected
    const isActSelected = (act: string) => {
        if (!complaint.related_acts) return false;
        try {
            const acts = typeof complaint.related_acts === 'string'
                ? JSON.parse(complaint.related_acts)
                : complaint.related_acts;
            return Array.isArray(acts) && acts.includes(act);
        } catch {
            return complaint.related_acts === act;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl shadow-xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold text-gray-900">แก้ไขข้อมูลเรื่องร้องเรียน #{complaint.id}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8 overflow-y-auto">

                    {/* Section 1: Official Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">1. ข้อมูลการรับเรื่อง</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">เลขรับเรื่อง</label>
                                <input name="complaint_number" type="text" defaultValue={complaint.complaint_number} className="w-full border rounded p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">วันรับเรื่อง</label>
                                <input name="received_date" type="date" defaultValue={complaint.received_date ? format(new Date(complaint.received_date), 'yyyy-MM-dd') : ''} className="w-full border rounded p-2" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                            <div className="col-span-2 text-sm font-semibold text-gray-700">เอกสารต้นเรื่อง (ถ้ามี)</div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">เลขที่หนังสือ</label>
                                <input name="original_doc_number" type="text" defaultValue={complaint.original_doc_number} className="w-full border rounded p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ลงวันที่</label>
                                <input name="original_doc_date" type="date" defaultValue={complaint.original_doc_date ? format(new Date(complaint.original_doc_date), 'yyyy-MM-dd') : ''} className="w-full border rounded p-2" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">อัพโหลดไฟล์ PDF (หากต้องการเปลี่ยน/เพิ่ม)</label>
                                <input name="original_doc_file" type="file" accept="application/pdf" className="w-full border rounded p-2 bg-white" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ช่องทาง</label>
                                <select name="channel" defaultValue={complaint.channel} className="w-full border rounded p-2">
                                    <option value="">-- เลือก --</option>
                                    <option value="ONLINE">ออนไลน์</option>
                                    <option value="PHONE">โทรศัพท์</option>
                                    <option value="LETTER">หนังสือราชการ</option>
                                    <option value="WALK_IN">Walk-in</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ประเภท</label>
                                <select name="type" defaultValue={complaint.type} className="w-full border rounded p-2">
                                    <option value="">-- เลือก --</option>
                                    <option value="ARREST">แจ้งความนำจับ</option>
                                    <option value="GENERAL">เรื่องร้องเรียนทั่วไป</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">อำเภอ</label>
                                <select name="district" defaultValue={complaint.district} className="w-full border rounded p-2">
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
                                        checked={isSafetyRelated}
                                        onChange={(e) => setIsSafetyRelated(e.target.checked)}
                                        className="rounded text-red-600 focus:ring-red-500 size-4"
                                    />
                                    <span className="text-sm font-medium text-red-800">เรื่องที่เกี่ยวข้องกับความปลอดภัยซึ่งมีผลต่อสุขภาพ</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">พรบ. ที่เกี่ยวข้อง</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border p-3 rounded h-32 overflow-y-auto">
                                {[
                                    'ยา', 'อาหาร', 'เครื่องสำอาง', 'วัตถุอันตราย', 'เครื่องมือแพทย์',
                                    'สถานประกอบการเพื่อสุขภาพ', 'สถานพยาบาล', 'ผลิตภัณฑ์สมุนไพร',
                                    'พืชกระท่อม', 'สุขาภิบาลอาหาร', 'อื่นๆ'
                                ].map(act => (
                                    <label key={act} className="flex items-center space-x-2 text-sm">
                                        <input
                                            type="checkbox"
                                            name="related_acts"
                                            value={act}
                                            defaultChecked={isActSelected(act)}
                                            className="rounded text-primary"
                                        />
                                        <span>{act}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ผู้รับผิดชอบ</label>
                            <select
                                name="responsible_person_id"
                                key={officers.length}
                                defaultValue={complaint.responsible_person_id?.toString() || ''}
                                className="w-full border rounded p-2 text-gray-500"
                            >
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
                                <input name="name" defaultValue={complaint.complainant_name} className="w-full border rounded p-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">เลขบัตรประชาชน</label>
                                <input name="idCard" maxLength={13} defaultValue={complaint.id_card} className="w-full border rounded p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                                <input name="phone" defaultValue={complaint.phone} className="w-full border rounded p-2" />
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
                                                defaultValue={complaint.official_letter_email || ''}
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
                                                defaultValue={complaint.official_letter_address || ''}
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
                                <input name="productName" defaultValue={complaint.product_name} className="w-full border rounded p-2" placeholder="เช่น ผลิตภัณฑ์เสริมอาหารตราเอบีซี..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">เลขทะเบียน/เลข อย. (ถ้ามี)</label>
                                <input name="fdaNumber" defaultValue={complaint.fda_number} className="w-full border rounded p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อร้าน/สถานประกอบการ (ถ้ามี)</label>
                                <input name="shopName" defaultValue={complaint.shop_name} className="w-full border rounded p-2" placeholder="เช่น ร้านยากอไก่..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">สถานที่ตั้ง (ระบุที่ตั้งร้านพอสังเขป)</label>
                                <input name="location" defaultValue={complaint.location} className="w-full border rounded p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เกิดเหตุ</label>
                                <input name="dateIncident" type="date" defaultValue={complaint.date_incident ? format(new Date(complaint.date_incident), 'yyyy-MM-dd') : ''} className="w-full border rounded p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ความเสียหายที่เกิดขึ้น (ถ้ามี)</label>
                                <input name="damageValue" defaultValue={complaint.damage_value} className="w-full border rounded p-2" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดเหตุการณ์ *</label>
                            <textarea name="details" rows={4} defaultValue={complaint.details} className="w-full border rounded p-2" required />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">หลักฐานเพิ่มเติม (เพิ่มไฟล์ใหม่)</label>
                            <input name="evidence_files" type="file" multiple className="w-full border rounded p-2" />
                            <p className="text-xs text-gray-500 mt-1">ไฟล์ใหม่จะถูกเพิ่มต่อจากไฟล์เดิม</p>
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
                            {loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
