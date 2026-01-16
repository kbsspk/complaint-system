export default function Footer() {
    return (
        <footer className="bg-surface-light border-t border-border-light py-10 px-4 mt-auto">
            <div className="layout-container max-w-[960px] mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="flex flex-col gap-4 max-w-sm">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px]">health_and_safety</span>
                        </div>
                        <h2 className="text-text-main text-lg font-bold">กลุ่มงานคุ้มครองผู้บริโภคฯ</h2>
                    </div>
                    <p className="text-text-secondary text-sm leading-relaxed">
                        สำนักงานสาธารณสุขจังหวัดสมุทรปราการ<br />
                        1029 หมู่ 2 ถนนท้ายบ้าน ตำบลปากน้ำ อำเภอเมือง จังหวัดสมุทรปราการ 10270
                    </p>
                </div>
                <div className="flex flex-wrap gap-8 md:gap-16">
                    <div className="flex flex-col gap-3">
                        <h4 className="text-text-main font-bold text-sm">เมนูลัด</h4>
                        <a href="#" className="text-text-secondary hover:text-primary text-sm">หน้าแรก</a>
                        <a href="#" className="text-text-secondary hover:text-primary text-sm">ตรวจสอบเลข อย.</a>
                        <a href="#" className="text-text-secondary hover:text-primary text-sm">บทความสุขภาพ</a>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h4 className="text-text-main font-bold text-sm">ติดต่อเรา</h4>
                        <a href="#" className="text-text-secondary hover:text-primary text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">call</span>
                            02-384-0094
                        </a>
                        <a href="#" className="text-text-secondary hover:text-primary text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">mail</span>
                            consumer.sp@gmail.com
                        </a>
                    </div>
                </div>
            </div>
            <div className="max-w-[960px] mx-auto pt-8 mt-8 border-t border-border-light text-center">
                <p className="text-text-secondary text-xs">© 2024 Samut Prakan Provincial Public Health Office. All rights reserved.</p>
            </div>
        </footer>
    );
}
