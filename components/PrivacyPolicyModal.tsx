import { useEffect } from 'react';

interface PrivacyPolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="relative z-[100]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="fixed inset-0 z-10 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                        <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold leading-6 text-gray-900" id="modal-title">
                                    นโยบายคุ้มครองข้อมูลส่วนบุคคล (Privacy Policy)
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="rounded-full p-1 hover:bg-gray-100 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-gray-500">close</span>
                                </button>
                            </div>

                            <div className="mt-2 text-sm text-gray-600 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                <p>
                                    กลุ่มงานคุ้มครองผู้บริโภคและเภสัชสาธารณสุข สำนักงานสาธารณสุขจังหวัดสมุทรปราการ ("เรา") ตระหนักถึงความสำคัญของการคุ้มครองข้อมูลส่วนบุคคลของท่าน และมุ่งมั่นที่จะรักษาความปลอดภัยของข้อมูลตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
                                </p>

                                <div className="space-y-2">
                                    <h4 className="font-bold text-gray-800">1. การเก็บรวบรวมข้อมูลส่วนบุคคล</h4>
                                    <p>
                                        เราจะเก็บรวบรวมข้อมูลส่วนบุคคลของท่านที่จำเป็นต่อการดำเนินงานรับเรื่องร้องเรียนและการติดต่อประสานงาน ได้แก่ ชื่อ-นามสกุล, ที่อยู่, เบอร์โทรศัพท์, อีเมล และข้อมูลอื่นๆ ที่ท่านระบุในแบบฟอร์มร้องเรียน
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-bold text-gray-800">2. วัตถุประสงค์การใช้ข้อมูล</h4>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>เพื่อการรับเรื่อง ตรวจสอบ และดำเนินการแก้ไขปัญหาข้อร้องเรียนของท่าน</li>
                                        <li>เพื่อการติดต่อกลับ แจ้งผลความคืบหน้า หรือขอข้อมูลเพิ่มเติม</li>
                                        <li>เพื่อการรวบรวมสถิติและรายงานผลการดำเนินงาน (โดยไม่เปิดเผยตัวตน)</li>
                                    </ul>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-bold text-gray-800">3. การเปิดเผยและการรักษาความลับ</h4>
                                    <p>
                                        <span className="font-bold text-primary">เจ้าหน้าที่จะไม่เผยแพร่ข้อมูลผู้ร้องเรียนต่อสาธารณะ หรือคู่กรณีโดยเด็ดขาด</span> เว้นแต่จะได้รับความยินยอมจากท่าน หรือเป็นไปตามคำสั่งของกฎหมาย โดยข้อมูลจะถูกเก็บรักษาไว้อย่างปลอดภัยและเข้าถึงได้เฉพาะเจ้าหน้าที่ที่เกี่ยวข้องเท่านั้น
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-bold text-gray-800">4. ระยะเวลาการจัดเก็บ</h4>
                                    <p>
                                        เราจะจัดเก็บข้อมูลของท่านไว้เป็นระยะเวลาเท่าที่จำเป็นต่อการดำเนินการตามวัตถุประสงค์ หรือตามระยะเวลาที่กฎหมายกำหนด
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-bold text-gray-800">5. สิทธิของเจ้าของข้อมูล</h4>
                                    <p>
                                        ท่านมีสิทธิในการขอเข้าถึง แก้ไข ลบ หรือระงับการใช้ข้อมูลส่วนบุคคลของท่าน โดยสามารถติดต่อเราได้ตามช่องทางการติดต่อที่ระบุไว้
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <p className="text-xs text-gray-500">
                                        หากมีข้อสงสัยเกี่ยวกับนโยบายความเป็นส่วนตัว สามารถติดต่อได้ที่ สำนักงานสาธารณสุขจังหวัดสมุทรปราการ โทร. 0 2389 5980
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            <button
                                type="button"
                                className="inline-flex w-full justify-center rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark sm:ml-3 sm:w-auto"
                                onClick={onClose}
                            >
                                รับทราบและตกลง
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
