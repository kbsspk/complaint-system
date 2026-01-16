import Link from 'next/link';

export default function Header() {
    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border-light bg-surface-light px-4 lg:px-10 py-3 sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <div className="size-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <span className="material-symbols-outlined text-[28px]">health_and_safety</span>
                </div>
                <div className="flex flex-col">
                    <h2 className="text-text-main text-base lg:text-lg font-bold leading-tight tracking-[-0.015em]">กลุ่มงานคุ้มครองผู้บริโภคฯ</h2>
                    <span className="text-xs text-text-secondary font-medium">สำนักงานสาธารณสุขจังหวัดสมุทรปราการ</span>
                </div>
            </div>

            <div className="hidden lg:flex flex-1 justify-end gap-8 items-center">
                <nav className="flex items-center gap-6">
                    <Link href="/" className="text-text-main hover:text-primary transition-colors text-sm font-medium leading-normal">หน้าแรก</Link>
                    <a href="#" className="text-text-main hover:text-primary transition-colors text-sm font-medium leading-normal">ข่าวประชาสัมพันธ์</a>
                    <Link href="/submit" className="text-primary text-sm font-bold leading-normal">แจ้งเรื่องร้องเรียน</Link>
                    <a href="#" className="text-text-main hover:text-primary transition-colors text-sm font-medium leading-normal">ติดต่อเรา</a>
                </nav>
                <Link href="/login" className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary hover:bg-primary-dark transition-colors text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-sm">
                    <span className="truncate">เข้าสู่ระบบ</span>
                </Link>
            </div>

            {/* Mobile Menu Icon (Placeholder functionality) */}
            <div className="lg:hidden">
                <button className="text-text-main p-2">
                    <span className="material-symbols-outlined">menu</span>
                </button>
            </div>
        </header>
    );
}
