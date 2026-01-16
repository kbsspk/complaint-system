'use client';

import { useState, useActionState, useEffect } from 'react';
import { saveInvestigationResults, getInvestigationFines, getUsedSections } from '@/actions/admin-actions';
// import { format } from 'date-fns';

const ACTS = [
    'ยา', 'อาหาร', 'เครื่องสำอาง', 'วัตถุอันตราย', 'เครื่องมือแพทย์',
    'สถานประกอบการเพื่อสุขภาพ', 'สถานพยาบาล', 'ผลิตภัณฑ์สมุนไพร',
    'พืชกระท่อม', 'สุขาภิบาลอาหาร'
];

interface InvestigationReportModalProps {
    complaintId: number;
    currentData: any; // Pass existing data if any to prefill
    onClose: () => void;
    onSuccess: () => void;
}

interface InvestigationState {
    success?: boolean;
    message: string;
    errors?: {
        investigationDate?: string[];
        [key: string]: string[] | undefined;
    } | null;
}

const initialState: InvestigationState = {
    message: '',
    errors: null,
};

export default function InvestigationReportModal({ complaintId, currentData, onClose, onSuccess }: InvestigationReportModalProps) {
    const [state, formAction, isPending] = useActionState(saveInvestigationResults, initialState);
    // Prefill logic
    // const [isGuilty, setIsGuilty] = useState(currentData?.is_guilty ? 'true' : 'false');

    const [legalActionType, setLegalActionType] = useState('NONE');
    const [fines, setFines] = useState<{ act: string; section: string; amount: string; }[]>([
        { act: ACTS[0], section: '', amount: '' }
    ]);
    const [loadingFines, setLoadingFines] = useState(false);
    const [sectionSuggestions, setSectionSuggestions] = useState<string[]>([]);

    useEffect(() => {
        // Fetch all used sections initially or when needed
        getUsedSections().then(sections => setSectionSuggestions(sections));
    }, []);

    useEffect(() => {
        if (state?.success) {
            onSuccess();
        }
    }, [state, onSuccess]);

    useEffect(() => {
        if (currentData?.legal_action_status) {
            // Basic mapping if needed, or if we stored 'FINE' directly
            // Assuming we start saving 'FINE'/'PROSECUTION' soon.
            // If old data 'COMPLETED' etc exists, map appropriately?
            // For now, let's assume if we see 'FINE' we fetch fines.
            const type = currentData.legal_action_status;
            setLegalActionType(type);

            if (type === 'FINE') {
                setLoadingFines(true);
                getInvestigationFines(complaintId).then((data: any[]) => {
                    if (data && data.length > 0) {
                        setFines(data.map((f: any) => ({
                            act: f.act_name,
                            section: f.section_name,
                            amount: f.amount.toString()
                        })));
                    }
                    setLoadingFines(false);
                });
            }
        }
    }, [currentData, complaintId]);

    const addFine = () => {
        if (fines.length < 3) {
            setFines([...fines, { act: ACTS[0], section: '', amount: '' }]);
        }
    };

    const removeFine = (index: number) => {
        const newFines = [...fines];
        newFines.splice(index, 1);
        setFines(newFines);
    };

    const updateFine = (index: number, field: keyof typeof fines[0], value: string) => {
        const newFines = [...fines];
        newFines[index][field] = value;
        setFines(newFines);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-border-light flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-800">บันทึกผลการตรวจสอบ</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form action={formAction} className="p-6 space-y-6">
                    <input type="hidden" name="complaintId" value={complaintId} />

                    {/* Investigation Date */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">วันที่ไปตรวจ <span className="text-red-500">*</span></label>
                        <input
                            type="date"
                            name="investigationDate"
                            defaultValue={currentData?.investigation_date ? new Date(currentData.investigation_date).toISOString().split('T')[0] : ''}
                            required
                            className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2.5"
                        />
                        {state?.errors?.investigationDate && <p className="text-red-500 text-xs mt-1">{state.errors.investigationDate}</p>}
                    </div>

                    {/* Guilt Finding */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ผลการตรวจสอบ <span className="text-red-500">*</span></label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="isGuilty"
                                    value="true"
                                    defaultChecked={currentData?.is_guilty === 1}
                                    className="peer sr-only"
                                />
                                <div className="px-4 py-2 rounded-lg border border-gray-200 peer-checked:bg-red-50 peer-checked:border-red-500 peer-checked:text-red-700 transition w-32 text-center text-sm font-medium">
                                    พบความผิด
                                </div>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="isGuilty"
                                    value="false"
                                    defaultChecked={currentData?.is_guilty === 0 || !currentData?.is_guilty}
                                    className="peer sr-only"
                                />
                                <div className="px-4 py-2 rounded-lg border border-gray-200 peer-checked:bg-green-50 peer-checked:border-green-500 peer-checked:text-green-700 transition w-32 text-center text-sm font-medium">
                                    ไม่พบความผิด
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Legal Action Status */}
                    <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-700">การดำเนินการทางกฎหมาย <span className="text-red-500">*</span></label>

                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="legalActionType"
                                    value="NONE"
                                    checked={legalActionType === 'NONE'}
                                    onChange={(e) => setLegalActionType(e.target.value)}
                                    className="peer sr-only"
                                />
                                <div className="px-4 py-2 rounded-lg border border-gray-200 peer-checked:bg-gray-100 peer-checked:border-gray-500 peer-checked:text-gray-900 transition text-sm font-medium">
                                    ไม่ดำเนินคดี
                                </div>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="legalActionType"
                                    value="FINE"
                                    checked={legalActionType === 'FINE'}
                                    onChange={(e) => setLegalActionType(e.target.value)}
                                    className="peer sr-only"
                                />
                                <div className="px-4 py-2 rounded-lg border border-gray-200 peer-checked:bg-amber-50 peer-checked:border-amber-500 peer-checked:text-amber-900 transition text-sm font-medium">
                                    เปรียบเทียบปรับ
                                </div>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="legalActionType"
                                    value="PROSECUTION"
                                    checked={legalActionType === 'PROSECUTION'}
                                    onChange={(e) => setLegalActionType(e.target.value)}
                                    className="peer sr-only"
                                />
                                <div className="px-4 py-2 rounded-lg border border-gray-200 peer-checked:bg-red-50 peer-checked:border-red-500 peer-checked:text-red-900 transition text-sm font-medium">
                                    ส่งดำเนินคดี
                                </div>
                            </label>
                        </div>

                        {/* Fines Section */}
                        {legalActionType === 'FINE' && (
                            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 space-y-3">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-sm font-bold text-amber-900">รายการเปรียบเทียบปรับ</h3>
                                    {fines.length < 3 && (
                                        <button
                                            type="button"
                                            onClick={addFine}
                                            className="text-xs bg-white text-amber-600 border border-amber-200 px-2 py-1 rounded hover:bg-amber-50"
                                        >
                                            + เพิ่มข้อหา
                                        </button>
                                    )}
                                </div>
                                <input type="hidden" name="fines" value={JSON.stringify(fines)} />

                                {loadingFines ? (
                                    <div className="text-center py-4 text-xs text-gray-500">กำลังโหลดข้อมูล...</div>
                                ) : (
                                    fines.map((fine, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-2 items-end bg-white p-3 rounded-lg border border-amber-100 shadow-sm relative">
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeFine(index)}
                                                    className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full p-0.5 hover:bg-red-200"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">close</span>
                                                </button>
                                            )}

                                            <div className="col-span-4">
                                                <label className="block text-xs font-medium text-gray-500 mb-1">พรบ.</label>
                                                <select
                                                    value={fine.act}
                                                    onChange={(e) => updateFine(index, 'act', e.target.value)}
                                                    className="w-full text-sm border-gray-300 rounded focus:ring-amber-500 focus:border-amber-500"
                                                >
                                                    {ACTS.map(act => <option key={act} value={act}>{act}</option>)}
                                                </select>
                                            </div>
                                            <div className="col-span-4">
                                                <label className="block text-xs font-medium text-gray-500 mb-1">มาตรา</label>
                                                <input
                                                    type="text"
                                                    list={`sections-${index}`}
                                                    value={fine.section}
                                                    onChange={(e) => updateFine(index, 'section', e.target.value)}
                                                    className="w-full text-sm border-gray-300 rounded focus:ring-amber-500 focus:border-amber-500"
                                                    placeholder="เช่น 25(1)"
                                                    autoComplete="off"
                                                />
                                                <datalist id={`sections-${index}`}>
                                                    {sectionSuggestions.map((s, i) => (
                                                        <option key={i} value={s} />
                                                    ))}
                                                </datalist>
                                            </div>
                                            <div className="col-span-4">
                                                <label className="block text-xs font-medium text-gray-500 mb-1">ค่าปรับ (บาท)</label>
                                                <input
                                                    type="number"
                                                    value={fine.amount}
                                                    onChange={(e) => updateFine(index, 'amount', e.target.value)}
                                                    className="w-full text-sm border-gray-300 rounded focus:ring-amber-500 focus:border-amber-500"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Reply Document Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">เลขที่หนังสือตอบกลับ</label>
                            <input
                                type="text"
                                name="responseDocNumber"
                                defaultValue={currentData?.response_doc_number || ''}
                                className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2.5"
                                placeholder="เลขที่หนังสือ..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">หนังสือตอบกลับ ลงวันที่</label>
                            <input
                                type="date"
                                name="responseDocDate"
                                defaultValue={currentData?.response_doc_date ? new Date(currentData.response_doc_date).toISOString().split('T')[0] : ''}
                                className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2.5"
                            />
                        </div>
                    </div>

                    {/* File Attachments */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">ไฟล์หนังสือตอบกลับผู้ร้อง (PDF)</label>
                            <input
                                type="file"
                                name="responseLetterFile"
                                accept=".pdf"
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {currentData?.response_letter_file && (
                                <a href={currentData.response_letter_file} target="_blank" className="text-xs text-blue-600 hover:underline mt-1 block flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">visibility</span> ดูไฟล์เดิม
                                </a>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">หลักฐานการดำเนินการ (PDF)</label>
                            <input
                                type="file"
                                name="actionEvidenceFile"
                                accept=".pdf"
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                กรุณาอัพโหลดรวมเป็นไฟล์เดียว หากต้องการรวมไฟล์ pdf ให้เข้าไปที่เว็ปไซต์ <a href="https://www.ilovepdf.com/th/merge_pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ilovepdf.com</a>
                            </p>
                            {currentData?.action_evidence_file && (
                                <a href={currentData.action_evidence_file} target="_blank" className="text-xs text-blue-600 hover:underline mt-1 block flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">visibility</span> ดูไฟล์เดิม
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Additional Details */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">รายละเอียดเพิ่มเติม</label>
                        <textarea
                            name="investigationDetails"
                            defaultValue={currentData?.investigation_details || ''}
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2.5"
                            placeholder="ระบุรายละเอียดเพิ่มเติม (เช่น ยอดเปรียบเทียบปรับ...)"
                        ></textarea>
                    </div>

                    {/* Status Update */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <label className="block text-sm font-semibold text-blue-800 mb-2">สรุปสถานะปัจจุบัน <span className="text-red-500">*</span></label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="statusUpdate"
                                    value="IN_PROGRESS"
                                    defaultChecked={currentData?.status === 'IN_PROGRESS' || currentData?.status === 'PENDING'}
                                    className="peer sr-only"
                                />
                                <div className="px-4 py-2 rounded-lg border border-blue-200 bg-white peer-checked:bg-blue-600 peer-checked:text-white transition text-sm font-medium">
                                    อยู่ระหว่างดำเนินการ
                                </div>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="statusUpdate"
                                    value="RESOLVED"
                                    defaultChecked={currentData?.status === 'RESOLVED'}
                                    className="peer sr-only"
                                />
                                <div className="px-4 py-2 rounded-lg border border-blue-200 bg-white peer-checked:bg-green-600 peer-checked:text-white transition text-sm font-medium">
                                    ดำเนินการเสร็จสิ้น
                                </div>
                            </label>
                        </div>
                    </div>

                    {state?.message && (
                        <div className={`p-3 rounded-lg text-sm ${state.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {state.message}
                        </div>
                    )}

                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium shadow-md disabled:opacity-50 flex items-center gap-2"
                        >
                            {isPending && <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            บันทึกข้อมูล
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
