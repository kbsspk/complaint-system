'use client';

import { useActionState } from 'react';
import { createUser } from '@/actions/admin-actions';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm disabled:opacity-50"
        >
            {pending ? 'กำลังสร้าง...' : 'สร้างบัญชีผู้ใช้'}
        </button>
    );
}

export default function UsersPage() {
    const [state, formAction] = useActionState(createUser, undefined);

    return (
        <div className="p-8 max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">จัดการบัญชีผู้ใช้</h1>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-border-light">
                <h2 className="text-lg font-bold text-text-main mb-4">สร้างบัญชีผู้ใช้งานใหม่</h2>

                <form action={formAction} className="flex flex-col gap-4">
                    {state?.message && (
                        <div className={`p-3 text-sm font-medium rounded-lg text-center ${state.success ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {state.message}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-text-main">ชื่อ-นามสกุล</span>
                            <input name="fullName" className="w-full rounded-lg border border-border-light h-10 px-3" placeholder="ชื่อ-นามสกุล" required />
                        </label>
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-text-main">ชื่อผู้ใช้งาน</span>
                            <input name="username" className="w-full rounded-lg border border-border-light h-10 px-3" placeholder="Username" required />
                        </label>
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-text-main">รหัสผ่าน</span>
                            <input name="password" type="password" className="w-full rounded-lg border border-border-light h-10 px-3" placeholder="Password (min 6 chars)" required minLength={6} />
                        </label>
                    </div>

                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-text-main">บทบาท</span>
                        <select name="role" className="w-full rounded-lg border border-border-light h-10 px-3 bg-white">
                            <option value="OFFICIAL">Official (เจ้าหน้าที่ทั่วไป)</option>
                            <option value="ADMIN">Admin (ผู้ดูแลระบบ)</option>
                        </select>
                    </label>

                    <div className="flex justify-end mt-2">
                        <SubmitButton />
                    </div>
                </form>
            </div>
        </div>
    );
}
