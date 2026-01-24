import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 bg-gradient-to-b from-background-light to-white">
        <div className="w-full max-w-4xl flex flex-col items-center gap-12 text-center">

          <div className="flex flex-col gap-4 items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="size-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm mb-2">
              <span className="material-symbols-outlined text-[48px]">health_and_safety</span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-black text-text-main leading-tight tracking-tight max-w-4xl">
              ศูนย์จัดการเรื่องร้องเรียน<br className="hidden md:block" />
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">ด้านผลิตภัณฑ์และบริการสุขภาพ</span>
            </h1>
            <p className="text-text-secondary text-lg max-w-xl">
              สำนักงานสาธารณสุขจังหวัดสมุทรปราการ พร้อมดูแลและคุ้มครองสิทธิของผู้บริโภค เพื่อสุขภาพและความปลอดภัยของประชาชน
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full max-w-3xl">
            {/* Notification Box 1: Non-health related */}
            <a
              href="https://www.samutprakan.go.th/%E0%B8%A8%E0%B8%B9%E0%B8%99%E0%B8%A2%E0%B9%8C%E0%B8%94%E0%B8%B3%E0%B8%A3%E0%B8%87%E0%B8%98%E0%B8%A3%E0%B8%A3%E0%B8%A1%E0%B8%88%E0%B8%B1%E0%B8%87%E0%B8%AB%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B8%AA%E0%B8%A1/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 p-4 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors text-left flex flex-col gap-2 group"
            >
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <span className="material-symbols-outlined text-[24px]">warning</span>
                <span>ร้องเรียนกรณีที่ไม่เกี่ยวข้องกับผลิตภัณฑ์และบริการสุขภาพ</span>
              </div>
              <p className="text-amber-800 text-sm">
                ศูนย์ดำรงธรรมจังหวัดสมุทรปราการ โทร 0–2702–5021 ต่อ 33571
              </p>
              <span className="text-xs text-amber-600 group-hover:underline">คลิกเพื่อไปยังเว็บไซต์</span>
            </a>

            {/* Notification Box 2: Out of province */}
            <a
              href="https://cemc.fda.moph.go.th/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 p-4 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors text-left flex flex-col gap-2 group"
            >
              <div className="flex items-center gap-2 text-blue-900 font-bold">
                <span className="material-symbols-outlined text-[24px]">public</span>
                <span>ร้องเรียนผลิตภัณฑ์สุขภาพ นอกจังหวัดสมุทรปราการ</span>
              </div>
              <p className="text-blue-800 text-sm">
                ศูนย์จัดการเรื่องร้องเรียนและปราบปรามการกระทำผิดกฎหมายเกี่ยวกับผลิตภัณฑ์สุขภาพ (ศรป.) โทร 1556
              </p>
              <span className="text-xs text-blue-600 group-hover:underline">คลิกเพื่อไปยังเว็บไซต์</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
            {/* Card 1 */}
            <Link href="/submit" className="group flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-border-light hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
              <div className="size-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[32px]">campaign</span>
              </div>
              <h3 className="text-xl font-bold text-text-main mb-2">แจ้งเรื่องร้องเรียน</h3>
              <p className="text-sm text-text-secondary">แจ้งเรื่องร้องเรียนออนไลน์ สะดวก รวดเร็ว</p>
            </Link>

            {/* Card 2 */}
            <Link href="/track" className="group flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-border-light hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="size-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[32px]">search</span>
              </div>
              <h3 className="text-xl font-bold text-text-main mb-2">ติดตามเรื่องร้องเรียน</h3>
              <p className="text-sm text-text-secondary">ตรวจสอบสถานะการดำเนินการของเจ้าหน้าที่</p>
            </Link>

            {/* Card 3 */}
            <Link href="/login" className="group flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-border-light hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="size-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[32px]">admin_panel_settings</span>
              </div>
              <h3 className="text-xl font-bold text-text-main mb-2">จัดการเรื่องร้องเรียน</h3>
              <p className="text-sm text-text-secondary">สำหรับเจ้าหน้าที่ เพื่อบริหารจัดการข้อมูล</p>
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
