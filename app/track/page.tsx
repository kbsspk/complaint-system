'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useActionState } from 'react';
import { trackComplaint } from '@/actions/track-complaint';
import { useState } from 'react';
import ComplaintDetailModal from '@/components/ComplaintDetailModal';
import { Complaint } from '@/lib/types';

const initialState = {
    success: false,
    message: '',
    data: null,
};

export default function TrackPage() {
    const [state, formAction, isPending] = useActionState(trackComplaint, initialState);
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleViewDetails = (complaint: Complaint) => {
        setSelectedComplaint(complaint);
        setIsModalOpen(true);
    };

    return (
        <>
            <Header />
            <main className="flex-1 flex flex-col items-center py-16 px-4">
                <div className="w-full max-w-xl flex flex-col gap-6">

                    {/* Search Box */}
                    <div className="bg-surface-light rounded-xl shadow-sm border border-border-light p-8 text-center">
                        <div className="size-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-[32px]">search</span>
                        </div>
                        <h1 className="text-2xl font-bold text-text-main mb-2">ติดตามเรื่องร้องเรียน</h1>
                        <p className="text-text-secondary mb-6 text-sm">กรอกเลขบัตรประชาชน 13 หลัก เพื่อตรวจสอบสถานะ</p>

                        <form action={formAction} className="flex flex-col gap-3">
                            <input
                                name="keyword"
                                type="text"
                                placeholder="ระบุเลขบัตรประชาชน"
                                className="w-full h-12 rounded-lg border border-border-light px-4 focus:ring-2 focus:ring-primary focus:outline-none bg-background-light text-text-main"
                                required
                            />
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isPending ? 'กำลังตรวจสอบ...' : 'ตรวจสอบสถานะ'}
                                {!isPending && <span className="material-symbols-outlined text-[20px]">search</span>}
                            </button>
                            {state.message && !state.success && (
                                <p className="text-red-500 text-sm mt-2">{state.message}</p>
                            )}
                        </form>

                        <div className="mt-6 pt-6 border-t border-border-light">
                            <Link href="/" className="text-sm text-text-secondary hover:text-primary">กลับสู่หน้าหลัก</Link>
                        </div>
                    </div>

                    {/* Results List */}
                    {state.success && state.data && (
                        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4">
                            <h3 className="text-lg font-bold text-text-main px-2">ผลการค้นหา ({state.data.length} รายการ)</h3>
                            {state.data.map((item: Complaint) => (
                                <div key={item.id} className="bg-white rounded-lg border border-border-light p-5 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
                                    <div className="flex flex-col gap-1 min-w-0 flex-1 mr-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs text-gray-400">
                                                {new Date(item.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-text-main text-lg">
                                            <span className="text-gray-500 font-medium text-base mr-2">ผลิตภัณฑ์:</span>
                                            {item.product_name || '-'}
                                        </h4>
                                        {item.shop_name && (
                                            <div className="text-sm text-gray-600 font-medium mb-1">
                                                <span className="opacity-75">สถานประกอบการ:</span> {item.shop_name}
                                            </div>
                                        )}
                                        <p className="text-sm text-text-secondary truncate">{item.details}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <button
                                            onClick={() => handleViewDetails(item)}
                                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 hover:text-primary hover:border-primary/30 transition-colors flex items-center gap-2 shadow-sm"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                                            ดูรายละเอียด
                                        </button>
                                        <span className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${item.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                                            item.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                                item.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            <span className="size-2 rounded-full bg-current"></span>
                                            {item.status === 'RESOLVED' ? 'ดำเนินการแล้ว' :
                                                item.status === 'IN_PROGRESS' ? 'อยู่ระหว่างดำเนินการ' :
                                                    item.status === 'REJECTED' ? 'ถูกคืนเรื่อง' :
                                                        'รอการตรวจสอบ'}
                                        </span>
                                        {item.status === 'REJECTED' && item.rejection_reason && (
                                            <div className="text-right max-w-xs">
                                                <span className="text-xs text-red-600 font-medium block">เหตุผลการคืนเรื่อง:</span>
                                                <span className="text-xs text-red-500">{item.rejection_reason}</span>
                                            </div>
                                        )}
                                        {item.status === 'RESOLVED' && item.response_letter_file && (
                                            <a
                                                href={item.response_letter_file}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-2 text-xs bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-blue-100 transition"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">description</span>
                                                หนังสือตอบกลับ
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />

            <ComplaintDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                complaint={selectedComplaint}
            />
        </>
    );
}
