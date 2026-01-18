"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ComplaintForm from '@/components/ComplaintForm';
import Link from 'next/link';
import { useState } from 'react';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';

export default function SubmitComplaintPage() {
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
    return (
        <>
            <Header />

            <main className="flex-1 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-[960px] flex flex-col gap-6">

                    {/* Page Heading */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
                            <Link href="/" className="hover:underline">หน้าแรก</Link>
                            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                            <span className="text-primary">แจ้งเรื่องร้องเรียน</span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black leading-tight tracking-[-0.033em] text-text-main">แจ้งเรื่องร้องเรียน</h1>
                        <p className="text-text-secondary text-base font-normal leading-normal max-w-2xl">
                            โปรดกรอกข้อมูลให้ครบถ้วนเพื่อความรวดเร็วในการดำเนินการตรวจสอบ ข้อมูลของท่านจะถูกเก็บเป็นความลับตาม
                            <button onClick={() => setIsPrivacyOpen(true)} className="text-primary hover:underline font-medium ml-1 inline">
                                นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)
                            </button>
                        </p>
                    </div>

                    {/* Instruction Panel */}
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 size-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                                <span className="material-symbols-outlined">lightbulb</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <h3 className="text-base font-bold text-text-main">คำแนะนำก่อนร้องเรียน</h3>
                                <p className="text-sm text-text-secondary">
                                    กรุณาเตรียมเอกสารหลักฐาน เช่น ใบเสร็จรับเงิน รูปถ่ายผลิตภัณฑ์ หรือเอกสารทางการแพทย์ เพื่อประกอบการพิจารณา
                                </p>
                            </div>
                        </div>
                        <a href="https://spko.my.canva.site/chc" target="_blank" className="whitespace-nowrap text-sm font-bold text-primary hover:text-primary-dark flex items-center gap-1 group">
                            อ่านคู่มือการร้องเรียน
                            <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                        </a>
                    </div>

                    {/* Form Container */}
                    <ComplaintForm onOpenPrivacyPolicy={() => setIsPrivacyOpen(true)} />

                </div>
            </main>

            <Footer />
            <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
        </>
    );
}
