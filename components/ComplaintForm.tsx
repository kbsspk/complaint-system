'use client';

import { useActionState, useState } from 'react';
import { submitComplaint } from '@/actions/submit-complaint';
import Link from 'next/link';
import Image from 'next/image';

const initialState = {
    success: false,
    message: '',
    errors: null,
};

export default function ComplaintForm() {
    const [state, formAction, isPending] = useActionState(submitComplaint, initialState);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [fileNameString, setFileNameString] = useState('');
    const [wantsOfficialLetter, setWantsOfficialLetter] = useState(false);
    const [deliveryMethod, setDeliveryMethod] = useState<'EMAIL' | 'POST' | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            if (files.length > 5) {
                alert('อัปโหลดได้สูงสุด 5 ไฟล์');
                e.target.value = '';
                setPreviewUrls([]);
                setFileNameString('');
                return;
            }

            const urls: string[] = [];
            const names: string[] = [];
            Array.from(files).forEach(file => {
                urls.push(URL.createObjectURL(file));
                names.push(file.name);
            });
            setPreviewUrls(urls);
            setFileNameString(names.join(', '));
        }
    };

    if (state.success) {
        return (
            <div className="bg-surface-light rounded-xl shadow-sm border border-border-light p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="size-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-[48px]">check_circle</span>
                </div>
                <h2 className="text-2xl font-bold text-text-main mb-2">แจ้งเรื่องร้องเรียนสำเร็จ</h2>
                <p className="text-text-secondary mb-8 max-w-md">
                    {state.message}
                </p>
                <Link href="/" onClick={() => window.location.reload()} className="px-8 py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-md transition-all hover:shadow-lg">
                    กลับสู่หน้าหลัก
                </Link>
            </div>
        );
    }

    return (
        <form action={formAction} className="bg-surface-light rounded-xl shadow-sm border border-border-light overflow-hidden">
            {state.message && !state.success && (
                <div className="p-4 bg-red-50 text-red-600 border-b border-red-100 text-sm font-medium text-center">
                    {state.message}
                </div>
            )}

            {/* Section 1: Complainant Info */}
            <div className="p-6 lg:p-8 border-b border-border-light">
                <div className="flex items-center gap-3 mb-6">
                    <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">1</div>
                    <h2 className="text-xl font-bold text-text-main">ข้อมูลผู้ร้องเรียน</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-text-main">ชื่อ - นามสกุล <span className="text-red-500">*</span></span>
                        <input name="name" className="w-full rounded-lg border border-border-light bg-background-light text-text-main focus:ring-primary focus:border-primary h-12 px-4 placeholder:text-gray-400 focus:outline-none focus:ring-2" placeholder="ระบุชื่อและนามสกุลจริง" type="text" />
                        {state.errors?.name && <span className="text-red-500 text-xs">{state.errors.name[0]}</span>}
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-text-main">เลขบัตรประชาชน <span className="text-red-500">*</span></span>
                        <input name="idCard" className="w-full rounded-lg border border-border-light bg-background-light text-text-main focus:ring-primary focus:border-primary h-12 px-4 placeholder:text-gray-400 focus:outline-none focus:ring-2" maxLength={13} placeholder="ระบุเลขบัตรประชาชน 13 หลัก" type="text" />
                        {state.errors?.idCard && <span className="text-red-500 text-xs">{state.errors.idCard[0]}</span>}
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-text-main">เบอร์โทรศัพท์ติดต่อ <span className="text-red-500">*</span></span>
                        <input name="phone" className="w-full rounded-lg border border-border-light bg-background-light text-text-main focus:ring-primary focus:border-primary h-12 px-4 placeholder:text-gray-400 focus:outline-none focus:ring-2" placeholder="08x-xxxxxxx" type="tel" />
                        {state.errors?.phone && <span className="text-red-500 text-xs">{state.errors.phone[0]}</span>}
                    </label>


                    {/* Official Letter Request */}
                    <div className="md:col-span-2 mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                name="wantsOfficialLetter"
                                type="checkbox"
                                className="size-5 rounded border-gray-300 text-primary focus:ring-primary"
                                checked={wantsOfficialLetter}
                                onChange={(e) => setWantsOfficialLetter(e.target.checked)}
                            />
                            <span className="text-text-main font-bold">ประสงค์จะรับผลการตรวจสอบเป็นหนังสือราชการ</span>
                        </label>
                        <p className="text-sm text-gray-500 mt-2 ml-8">
                            กรณีไม่ประสงค์รับหนังสือราชการ ท่านยังคงสามารถติดตามผลการดำเนินการ และดูหนังสือราชการได้ที่เมนู "ติดตามเรื่องร้องเรียน" โดยใช้เลขบัตรประชาชนที่แจ้งเรื่องเข้ามา
                        </p>

                        {wantsOfficialLetter && (
                            <div className="mt-4 pl-8 space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-text-main mb-2">ช่องทางการรับหนังสือ <span className="text-red-500">*</span></p>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                name="officialLetterDeliveryMethod"
                                                type="radio"
                                                value="EMAIL"
                                                className="text-primary focus:ring-primary"
                                                checked={deliveryMethod === 'EMAIL'}
                                                onChange={() => setDeliveryMethod('EMAIL')}
                                            />
                                            <span className="text-sm text-text-main">ทางอีเมล</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                name="officialLetterDeliveryMethod"
                                                type="radio"
                                                value="POST"
                                                className="text-primary focus:ring-primary"
                                                checked={deliveryMethod === 'POST'}
                                                onChange={() => setDeliveryMethod('POST')}
                                            />
                                            <span className="text-sm text-text-main">ทางไปรษณีย์</span>
                                        </label>
                                    </div>
                                    {state.errors?.officialLetterDeliveryMethod && <span className="text-red-500 text-xs">{state.errors.officialLetterDeliveryMethod[0]}</span>}
                                </div>

                                {deliveryMethod === 'EMAIL' && (
                                    <label className="block">
                                        <span className="text-sm font-medium text-text-main mb-1 block">ระบุอีเมล <span className="text-red-500">*</span></span>
                                        <input
                                            name="officialLetterEmail"
                                            className="w-full rounded-lg border border-border-light bg-background-light h-10 px-4 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                            placeholder="your@email.com"
                                            type="email"
                                        />
                                        {state.errors?.officialLetterEmail && <span className="text-red-500 text-xs">{state.errors.officialLetterEmail[0]}</span>}
                                    </label>
                                )}

                                {deliveryMethod === 'POST' && (
                                    <label className="block">
                                        <span className="text-sm font-medium text-text-main mb-1 block">ระบุที่อยู่จัดส่ง <span className="text-red-500">*</span></span>
                                        <textarea
                                            name="officialLetterAddress"
                                            className="w-full rounded-lg border border-border-light bg-background-light p-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                            placeholder="บ้านเลขที่ หมู่ ซอย ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                                            rows={3}
                                        ></textarea>
                                        {state.errors?.officialLetterAddress && <span className="text-red-500 text-xs">{state.errors.officialLetterAddress[0]}</span>}
                                    </label>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Section 2: Product Info */}
            <div className="p-6 lg:p-8 border-b border-border-light">
                <div className="flex items-center gap-3 mb-6">
                    <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">2</div>
                    <h2 className="text-xl font-bold text-text-main">ข้อมูลผลิตภัณฑ์/สถานประกอบการ</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-text-main">ชื่อผลิตภัณฑ์ (ถ้ามี)</span>
                        <input name="productName" className="w-full rounded-lg border border-border-light bg-background-light text-text-main focus:ring-primary focus:border-primary h-12 px-4 placeholder:text-gray-400 focus:outline-none focus:ring-2" placeholder="เช่น ผลิตภัณฑ์เสริมอาหารตราเอบีซี..." type="text" />
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-text-main">เลขทะเบียน/เลข อย. (ถ้ามี)</span>
                        <input name="fdaNumber" className="w-full rounded-lg border border-border-light bg-background-light text-text-main focus:ring-primary focus:border-primary h-12 px-4 placeholder:text-gray-400 focus:outline-none focus:ring-2" placeholder="" type="text" />
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-text-main">ชื่อร้าน/สถานประกอบการ (ถ้ามี)</span>
                        <input name="shopName" className="w-full rounded-lg border border-border-light bg-background-light text-text-main focus:ring-primary focus:border-primary h-12 px-4 placeholder:text-gray-400 focus:outline-none focus:ring-2" placeholder="เช่น ร้านยากอไก่..." type="text" />
                    </label>
                    <label className="flex flex-col gap-2 md:col-span-2">
                        <span className="text-sm font-medium text-text-main">สถานที่ตั้ง (ระบุที่ตั้งร้านพอสังเขป)</span>
                        <input name="location" className="w-full rounded-lg border border-border-light bg-background-light text-text-main focus:ring-primary focus:border-primary h-12 px-4 placeholder:text-gray-400 focus:outline-none focus:ring-2" placeholder="" type="text" />
                    </label>
                </div>
            </div>

            {/* Section 3: Details */}
            <div className="p-6 lg:p-8 border-b border-border-light">
                <div className="flex items-center gap-3 mb-6">
                    <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">3</div>
                    <h2 className="text-xl font-bold text-text-main">รายละเอียดเหตุการณ์</h2>
                </div>
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-text-main">วันที่เกิดเหตุ</span>
                            <input name="dateIncident" className="w-full rounded-lg border border-border-light bg-background-light text-text-main focus:ring-primary focus:border-primary h-12 px-4 focus:outline-none focus:ring-2" type="date" />
                        </label>
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-text-main">ความเสียหายที่เกิดขึ้น (ถ้ามี)</span>
                            <input name="damageValue" className="w-full rounded-lg border border-border-light bg-background-light text-text-main focus:ring-primary focus:border-primary h-12 px-4 focus:outline-none focus:ring-2" placeholder="เช่น ท้องเสีย, เกิดการระคายเคือง" type="text" />
                        </label>
                    </div>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-text-main">รายละเอียดเรื่องร้องเรียน <span className="text-red-500">*</span></span>
                        <textarea name="details" className="w-full rounded-lg border border-border-light bg-background-light text-text-main focus:ring-primary focus:border-primary p-4 resize-none placeholder:text-gray-400 focus:outline-none focus:ring-2" placeholder="อธิบายเหตุการณ์ที่เกิดขึ้นโดยละเอียด..." rows={6}></textarea>
                        {state.errors?.details && <span className="text-red-500 text-xs">{state.errors.details[0]}</span>}
                    </label>
                </div>
            </div>

            {/* Section 4: Evidence Upload */}
            <div className="p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">4</div>
                    <h2 className="text-xl font-bold text-text-main">เอกสารหลักฐาน</h2>
                </div>

                <div className="border-2 border-dashed border-border-light rounded-xl p-8 flex flex-col items-center justify-center text-center bg-background-light/50 hover:bg-background-light transition-colors relative">
                    <input
                        type="file"
                        name="files"
                        multiple
                        accept="image/png, image/jpeg, application/pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={handleFileChange}
                    />
                    <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 pointer-events-none">
                        <span className="material-symbols-outlined text-[32px]">cloud_upload</span>
                    </div>
                    {previewUrls.length > 0 ? (
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-primary font-bold">{previewUrls.length} ไฟล์ที่เลือก</p>
                            <p className="text-text-secondary text-xs truncate max-w-sm">{fileNameString}</p>
                            <div className="flex flex-wrap justify-center gap-2 mt-2">
                                {previewUrls.map((url, idx) => (
                                    <div key={idx} className="relative size-16 rounded-lg overflow-hidden border border-border-light">
                                        <Image src={url} alt="preview" fill className="object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            <p className="text-text-main font-bold text-lg mb-1 pointer-events-none">คลิกเพื่ออัปโหลด</p>
                            <p className="text-text-secondary text-sm mb-4 pointer-events-none">รองรับไฟล์ JPG, PNG, PDF ขนาดไม่เกิน 5MB (สูงสุด 5 ไฟล์)</p>
                            <button type="button" className="px-4 py-2 rounded-lg bg-white border border-border-light text-text-main font-medium text-sm shadow-sm pointer-events-none">
                                เลือกไฟล์จากเครื่อง
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Action Footer */}
            <div className="bg-gray-50 dark:bg-[#1a2c28] p-6 lg:p-8 border-t border-border-light flex flex-col md:flex-row items-center justify-between gap-6">
                <label className="flex items-start gap-3 cursor-pointer">
                    <div className="relative flex items-center mt-0.5">
                        <input name="acceptTerms" className="peer size-5 cursor-pointer appearance-none rounded border border-gray-300 bg-white checked:border-primary checked:bg-primary focus:ring-0" type="checkbox" />
                        <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                            <span className="material-symbols-outlined text-[16px]">check</span>
                        </span>
                    </div>
                    <span className="text-sm text-text-secondary select-none">
                        ข้าพเจ้ายอมรับ <a href="#" className="text-primary font-bold hover:underline">นโยบายความเป็นส่วนตัว</a> และยืนยันว่าข้อมูลข้างต้นเป็นความจริง
                    </span>
                </label>
                {state.errors?.acceptTerms && <span className="text-red-500 text-xs">{state.errors.acceptTerms[0]}</span>}

                <div className="flex gap-4 w-full md:w-auto">
                    <button type="button" className="flex-1 md:flex-none px-6 py-3 rounded-lg border border-border-light bg-white text-text-main font-bold text-sm hover:bg-gray-50 transition-colors">
                        ยกเลิก
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="flex-1 md:flex-none px-8 py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span>{isPending ? 'กำลังส่งข้อมูล...' : 'ยืนยันการแจ้งเรื่อง'}</span>
                        {!isPending && <span className="material-symbols-outlined text-[18px]">send</span>}
                    </button>
                </div>
            </div>
        </form>
    );
}
