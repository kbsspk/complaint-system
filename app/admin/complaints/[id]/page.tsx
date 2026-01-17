import { query } from '@/lib/db';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import ComplaintEditButton from '@/components/admin/ComplaintEditButton';

import { getSession } from '@/lib/session';
import InvestigationReportButton from '@/components/admin/InvestigationReportButton';
import ComplaintPrintButton from '@/components/admin/ComplaintPrintButton';

import { Complaint } from '@/lib/types';

async function getComplaint(id: string) {
    const rows = await query<Complaint[]>('SELECT * FROM complaints WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    return rows[0];
}

// Helper to safely format dates
const formatDate = (dateString: string | Date | null | undefined, formatStr: string = 'd MMM yyyy') => {
    if (!dateString) return '-';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    // Check if date is invalid
    if (isNaN(date.getTime())) return '-';
    return format(date, formatStr, { locale: th });
};

export default async function ComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getSession();
    const complaint = await getComplaint(id);
    console.log('DEBUG COMPLAINT DATA:', complaint);

    if (!complaint) {
        notFound();
    }

    let evidenceFiles: string[] = [];
    try {
        if (complaint.evidence_files) {
            evidenceFiles = JSON.parse(complaint.evidence_files);
        }
    } catch (e) {
        console.error('Error parsing evidence files', e);
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/dashboard" className="flex items-center text-gray-500 hover:text-gray-800 transition-colors">
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">รายละเอียดเรื่องร้องเรียน #{complaint.id}</h1>
                </div>

                <div className="flex items-center gap-3">
                    {(() => {
                        if (complaint.status === 'RESOLVED') {
                            return (
                                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-green-100 text-green-800">
                                    <span className="size-2.5 rounded-full bg-current mr-2"></span>
                                    ดำเนินการเสร็จสิ้น
                                </span>
                            );
                        }
                        if (complaint.status === 'REJECTED') {
                            return (
                                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-red-100 text-red-800">
                                    <span className="size-2.5 rounded-full bg-current mr-2"></span>
                                    ถูกปฏิเสธ
                                </span>
                            );
                        }
                        if (complaint.status === 'IN_PROGRESS') {
                            if (complaint.investigation_date) {
                                return (
                                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                                        <span className="size-2.5 rounded-full bg-current mr-2"></span>
                                        ตรวจสอบแล้ว
                                    </span>
                                );
                            }
                            return (
                                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-amber-100 text-amber-800">
                                    <span className="size-2.5 rounded-full bg-current mr-2"></span>
                                    อยู่ระหว่างดำเนินการ
                                </span>
                            );
                        }
                        return (
                            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800">
                                <span className="size-2.5 rounded-full bg-current mr-2"></span>
                                รอตรวจสอบ
                            </span>
                        );
                    })()}

                    {session?.role === 'ADMIN' && (
                        <ComplaintEditButton complaint={complaint} />
                    )}



                    <InvestigationReportButton complaint={complaint} />
                    <ComplaintPrintButton complaint={complaint} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Complaint Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Rejection Reason */}
                    {complaint.status === 'REJECTED' && (
                        <div className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-6">
                            <h2 className="text-lg font-bold text-red-800 mb-2">เหตุผลการปฏิเสธ</h2>
                            <p className="text-red-700">{complaint.rejection_reason}</p>
                        </div>
                    )}

                    {/* Official Info (If Accepted/Manual) */}
                    {['IN_PROGRESS', 'RESOLVED'].includes(complaint.status) && (
                        <div className="bg-white rounded-xl shadow-sm border border-border-light p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-border-light pb-2">ข้อมูลการรับเรื่อง (Start: {formatDate(complaint.received_date)})</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-gray-500 block">เลขรับเรื่อง</span>
                                    <span className="font-bold text-green-700">{complaint.complaint_number || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500 block">ช่องทาง</span>
                                    <span className="font-medium text-gray-800">{complaint.channel}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500 block">ประเภท</span>
                                    <span className="font-medium text-gray-800">{complaint.type}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500 block">อำเภอ</span>
                                    <span className="font-medium text-gray-800">{complaint.district || '-'}</span>
                                </div>
                                {complaint.is_safety_health_related && (
                                    <div className="md:col-span-2">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 shadow-sm">
                                            <span className="material-symbols-outlined text-[16px] mr-1">health_and_safety</span>
                                            เรื่องที่เกี่ยวข้องกับความปลอดภัยซึ่งมีผลต่อสุขภาพ
                                        </span>
                                    </div>
                                )}
                                <div className="md:col-span-2">
                                    <span className="text-sm text-gray-500 block">พ.ร.บ. ที่เกี่ยวข้อง</span>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {complaint.related_acts ? (
                                            (() => {
                                                try {
                                                    if (Array.isArray(complaint.related_acts)) {
                                                        return complaint.related_acts.map((act: string, idx: number) => (
                                                            <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">{act}</span>
                                                        ));
                                                    }
                                                    if (typeof complaint.related_acts === 'string') {
                                                        const acts = JSON.parse(complaint.related_acts);
                                                        return Array.isArray(acts) ? acts.map((act: string, idx: number) => (
                                                            <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">{act}</span>
                                                        )) : <span>{complaint.related_acts}</span>;
                                                    }
                                                    return <span>{complaint.related_acts}</span>;
                                                } catch { return <span>{complaint.related_acts}</span> }
                                            })()
                                        ) : '-'}
                                    </div>
                                </div>
                                {complaint.original_doc_number && (
                                    <div className="md:col-span-2 bg-gray-50 p-3 rounded text-sm">
                                        <div className="font-semibold text-gray-700 mb-1">หนังสือต้นเรื่อง</div>
                                        <div>เลขที่: {complaint.original_doc_number} ลงวันที่: {formatDate(complaint.original_doc_date)}</div>
                                        {complaint.original_doc_path && (
                                            <a href={complaint.original_doc_path} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1 mt-1">
                                                <span className="material-symbols-outlined text-sm">attach_file</span> ดูไฟล์แนบ
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Incident Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-border-light p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-border-light pb-2">ข้อมูลเหตุการณ์</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                            <div>
                                <span className="text-sm text-gray-500 block">ข้อมูลผลิตภัณฑ์</span>
                                <span className="text-base font-medium text-gray-900">{complaint.product_name}</span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 block">ความเสียหายที่เกิดขึ้น</span>
                                <span className="text-base font-medium text-gray-900">{complaint.damage_value || '-'}</span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 block">วันที่เกิดเหตุ</span>
                                <span className="text-base font-medium text-gray-900">
                                    {formatDate(complaint.date_incident, 'd MMMM yyyy')}
                                </span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 block">ชื่อร้าน/สถานประกอบการ</span>
                                <span className="text-base font-medium text-gray-900">{complaint.shop_name || '-'}</span>
                            </div>
                            <div className="md:col-span-2">
                                <span className="text-sm text-gray-500 block">สถานที่เกิดเหตุ</span>
                                <span className="text-base font-medium text-gray-900">{complaint.location || '-'}</span>
                            </div>
                            <div className="md:col-span-2">
                                <span className="text-sm text-gray-500 block mb-1">รายละเอียด</span>
                                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg leading-relaxed text-sm">
                                    {complaint.details}
                                </p>
                            </div>
                        </div>

                        {/* Evidence Section (Integrated) */}
                        <div className="mt-6 pt-6 border-t border-border-light">
                            <h3 className="text-base font-bold text-gray-800 mb-4">หลักฐานประกอบ ({evidenceFiles.length})</h3>
                            {evidenceFiles.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {evidenceFiles.map((file, idx) => (
                                        <a key={idx} href={file} target="_blank" rel="noopener noreferrer" className="group relative aspect-square rounded-lg border border-border-light overflow-hidden bg-gray-100 flex items-center justify-center">
                                            {file.toLowerCase().endsWith('.pdf') ? (
                                                <div className="flex flex-col items-center text-red-500">
                                                    <span className="material-symbols-outlined text-4xl">picture_as_pdf</span>
                                                    <span className="text-xs font-bold mt-1">PDF File</span>
                                                </div>
                                            ) : (
                                                <Image
                                                    src={file}
                                                    alt="evidence"
                                                    fill
                                                    className="object-cover transition-transform group-hover:scale-105"
                                                />
                                            )}
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm italic">ไม่มีเอกสารหลักฐานแนบ</p>
                            )}
                        </div>
                    </div>

                    {/* Investigation Results Card */}
                    {complaint.investigation_date && (
                        <div className="bg-white rounded-xl shadow-sm border border-border-light p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-border-light pb-2">ผลการตรวจสอบ</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                <div>
                                    <span className="text-sm text-gray-500 block">วันที่ตรวจสอบ</span>
                                    <span className="text-base font-medium text-gray-900">
                                        {formatDate(complaint.investigation_date, 'd MMMM yyyy')}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500 block">ผลการตรวจสอบ</span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${complaint.is_guilty
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-green-100 text-green-800'
                                        }`}>
                                        {complaint.is_guilty ? 'พบความผิด' : 'ไม่พบความผิด'}
                                    </span>
                                </div>
                                <div className="md:col-span-2">
                                    <span className="text-sm text-gray-500 block">การดำเนินการทางกฎหมาย</span>
                                    <span className="text-base font-medium text-gray-900">
                                        {complaint.legal_action_status === 'NONE' && 'ไม่ดำเนินการทางกฎหมาย'}
                                        {complaint.legal_action_status === 'WAITING_COMMITTEE' && 'รอเข้าคณะกรรมการพิจารณาคดี'}
                                        {complaint.legal_action_status === 'IN_PROGRESS' && 'อยู่ระหว่างดำเนินการทางกฎหมาย'}
                                        {complaint.legal_action_status === 'COMPLETED' && 'ดำเนินการทางกฎหมายเสร็จสิ้น'}
                                    </span>
                                </div>
                                {(complaint.response_doc_number || complaint.response_letter_file) && (
                                    <div className="md:col-span-2 bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2">
                                        <div className="font-semibold text-blue-800 text-sm mb-1">หนังสือตอบกลับ</div>
                                        <div className="text-sm text-blue-900 flex flex-wrap gap-4 items-center">
                                            {complaint.response_doc_number && <span>เลขที่: {complaint.response_doc_number}</span>}
                                            {complaint.response_doc_date && <span>ลงวันที่: {formatDate(complaint.response_doc_date)}</span>}
                                            {complaint.response_letter_file && (
                                                <a href={complaint.response_letter_file} target="_blank" className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-blue-200 hover:bg-blue-50 transition text-blue-700">
                                                    <span className="material-symbols-outlined text-[16px]">description</span>
                                                    ดูไฟล์
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {complaint.action_evidence_file && (
                                    <div className="md:col-span-2 bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2">
                                        <div className="font-semibold text-blue-800 text-sm mb-1">หลักฐานการดำเนินการ</div>
                                        <div className="text-sm text-blue-900 flex items-center">
                                            <a href={complaint.action_evidence_file} target="_blank" className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-blue-200 hover:bg-blue-50 transition text-blue-700">
                                                <span className="material-symbols-outlined text-[16px]">file_present</span>
                                                ดูไฟล์หลักฐาน
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {complaint.investigation_details && (
                                    <div className="md:col-span-2 mt-2">
                                        <span className="text-sm text-gray-500 block mb-1">รายละเอียดเพิ่มเติม</span>
                                        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg leading-relaxed text-sm whitespace-pre-wrap">
                                            {complaint.investigation_details}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}


                </div>

                {/* Right Column: Complainant Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-border-light p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-border-light pb-2">ข้อมูลผู้ร้องเรียน</h2>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined">person</span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500 block">ชื่อ-นามสกุล</span>
                                    <span className="font-bold text-gray-900">{complaint.complainant_name}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined">id_card</span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500 block">เลขบัตรประชาชน</span>
                                    <span className="font-bold text-gray-900 font-mono tracking-wide">{complaint.id_card}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined">phone</span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500 block">เบอร์โทรศัพท์</span>
                                    <span className="font-medium text-gray-900">{complaint.phone}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined">mail</span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500 block">อีเมล</span>
                                    <span className="font-medium text-gray-900 break-all">{complaint.official_letter_email || '-'}</span>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-border-light mt-2">
                                <span className="text-sm text-gray-500 block mb-1">ที่อยู่</span>
                                <p className="text-sm text-gray-800 leading-relaxed">{complaint.official_letter_address || '-'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-border-light">
                        <span className="text-xs text-gray-500 block mb-1">วันที่แจ้งเรื่อง</span>
                        <span className="text-sm font-medium text-gray-900">
                            {formatDate(complaint.created_at, 'd MMMM yyyy เวลา HH:mm น.')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
