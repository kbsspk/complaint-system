'use client';

import { useActionState } from 'react';
import { login } from '@/actions/auth';
import Link from 'next/link';

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, undefined);

    return (
        <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 bg-background-light">
            <div className="w-full max-w-md bg-surface-light rounded-xl shadow-lg border border-border-light overflow-hidden">
                <div className="bg-primary/5 p-6 text-center border-b border-border-light">
                    <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-[32px]">admin_panel_settings</span>
                    </div>
                    <h1 className="text-xl font-bold text-text-main">เข้าสู่ระบบเจ้าหน้าที่</h1>
                    <p className="text-sm text-text-secondary mt-1">สำนักงานสาธารณสุขจังหวัดสมุทรปราการ</p>
                </div>

                <form action={formAction} className="p-6 flex flex-col gap-6">
                    {state?.message && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center">
                            {state.message}
                        </div>
                    )}

                    <div className="flex flex-col gap-4">
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-text-main">ชื่อผู้ใช้งาน</span>
                            <input name="username" className="w-full rounded-lg border border-border-light bg-background-light text-text-main focus:ring-primary focus:border-primary h-12 px-4 placeholder:text-gray-400 focus:outline-none focus:ring-2" placeholder="Username" type="text" />
                            {state?.errors?.username && <span className="text-red-500 text-xs">{state.errors.username[0]}</span>}
                        </label>
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-text-main">รหัสผ่าน</span>
                            <input name="password" className="w-full rounded-lg border border-border-light bg-background-light text-text-main focus:ring-primary focus:border-primary h-12 px-4 placeholder:text-gray-400 focus:outline-none focus:ring-2" placeholder="Password" type="password" />
                            {state?.errors?.password && <span className="text-red-500 text-xs">{state.errors.password[0]}</span>}
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-md transition-all hover:shadow-lg disabled:opacity-50"
                    >
                        {isPending ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                    </button>

                    <Link href="/" className="text-center text-sm text-text-secondary hover:text-primary transition-colors">
                        กลับสู่หน้าหลัก
                    </Link>
                </form>
            </div>
        </div>
    );
}
