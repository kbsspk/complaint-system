'use client';

import { useEffect, useState } from 'react';

interface ComplaintDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    complaint: any;
}

export default function ComplaintDetailModal({ isOpen, onClose, complaint }: ComplaintDetailModalProps) {
    const [evidenceFiles, setEvidenceFiles] = useState<string[]>([]);

    useEffect(() => {
        if (complaint?.evidence_files) {
            try {
                const files = JSON.parse(complaint.evidence_files);
                if (Array.isArray(files)) {
                    setEvidenceFiles(files);
                }
            } catch (e) {
                console.error('Failed to parse evidence files', e);
                setEvidenceFiles([]);
            }
        } else {
            setEvidenceFiles([]);
        }
    }, [complaint]);

    if (!isOpen || !complaint) return null;

    // Helper to format date
    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">รายละเอียดเรื่องร้องเรียน</h2>
                        <p className="text-sm text-gray-500 mt-1">เลขที่เอกสาร: {complaint.created_at ? new Date(complaint.created_at).getTime() : '-'}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close modal"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Section 1: Complainant Info */}
                    <section>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">
                            ข้อมูลผู้ร้องเรียน
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                            <div>
                                <span className="block text-gray-500 mb-1">ชื่อ - นามสกุล</span>
                                <span className="font-medium text-gray-900">{complaint.complainant_name || '-'}</span>
                            </div>
                            <div>
                                <span className="block text-gray-500 mb-1">เบอร์โทรศัพท์ติดต่อ</span>
                                <span className="font-medium text-gray-900">{complaint.phone || '-'}</span>
                            </div>
                            <div className="md:col-span-2">
                                <span className="block text-gray-500 mb-1">เลขบัตรประชาชน</span>
                                <span className="font-medium text-gray-900">{complaint.id_card || '-'}</span>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Product & Establishment Info */}
                    <section>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">
                            ข้อมูลผลิตภัณฑ์/สถานประกอบการ
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                            <div>
                                <span className="block text-gray-500 mb-1">ชื่อผลิตภัณฑ์</span>
                                <span className="font-medium text-gray-900">{complaint.product_name || '-'}</span>
                            </div>
                            <div>
                                <span className="block text-gray-500 mb-1">เลขทะเบียน/เลข อย.</span>
                                <span className="font-medium text-gray-900">{complaint.fda_number || '-'}</span>
                            </div>
                            <div>
                                <span className="block text-gray-500 mb-1">ชื่อร้าน/สถานประกอบการ</span>
                                <span className="font-medium text-gray-900">{complaint.shop_name || '-'}</span>
                            </div>
                            <div className="md:col-span-2">
                                <span className="block text-gray-500 mb-1">สถานที่ตั้ง</span>
                                <span className="font-medium text-gray-900">{complaint.location || '-'}</span>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Incident Details */}
                    <section>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">
                            รายละเอียดเหตุการณ์
                        </h3>
                        <div className="text-sm space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className="block text-gray-500 mb-1">วันที่เกิดเหตุ</span>
                                    <span className="font-medium text-gray-900">{formatDate(complaint.date_incident)}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 mb-1">ความเสียหายที่เกิดขึ้น</span>
                                    <span className="font-medium text-gray-900">
                                        {complaint.damage_value || '-'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <span className="block text-gray-500 mb-1">รายละเอียดเรื่องร้องเรียน</span>
                                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                                    {complaint.details || '-'}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 4: Evidence */}
                    {evidenceFiles.length > 0 && (
                        <section>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">
                                เอกสารหลักฐาน
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {evidenceFiles.map((file, idx) => (
                                    <a
                                        key={idx}
                                        href={file}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-blue-600 text-xs font-medium hover:bg-blue-50 hover:border-blue-200 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">attach_file</span>
                                        หลักฐาน #{idx + 1}
                                    </a>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Section 5: Official Letter Request */}
                    {complaint.wants_official_letter && (
                        <section className="bg-blue-50 rounded-lg p-5 border border-blue-100">
                            <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-3">
                                <span className="material-symbols-outlined align-middle mr-2 text-[18px]">mail</span>
                                ประสงค์จะรับผลการตรวจสอบเป็นหนังสือราชการ
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="block text-blue-600/70 mb-1 text-xs">ช่องทางการรับหนังสือ</span>
                                    <span className="font-medium text-blue-900">
                                        {complaint.official_letter_method === 'EMAIL' ? 'ทางอีเมล' :
                                            complaint.official_letter_method === 'POST' ? 'ทางไปรษณีย์' : '-'}
                                    </span>
                                </div>
                                {complaint.official_letter_method === 'EMAIL' && complaint.official_letter_email && (
                                    <div>
                                        <span className="block text-blue-600/70 mb-1 text-xs">ระบุอีเมล</span>
                                        <span className="font-medium text-blue-900">{complaint.official_letter_email}</span>
                                    </div>
                                )}
                                {complaint.official_letter_method === 'POST' && complaint.official_letter_address && (
                                    <div className="md:col-span-2">
                                        <span className="block text-blue-600/70 mb-1 text-xs">ระบุที่อยู่จัดส่ง</span>
                                        <span className="font-medium text-blue-900">{complaint.official_letter_address}</span>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                    >
                        ปิดหน้าต่าง
                    </button>
                </div>
            </div>
        </div>
    );
}
