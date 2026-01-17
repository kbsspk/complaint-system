'use server';

import { z } from 'zod';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createSession, deleteSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { User } from '@/lib/types'; // Moved import to the top

const loginSchema = z.object({
    username: z.string().min(1, 'กรุณาระบุชื่อผู้ใช้งาน'),
    password: z.string().min(1, 'กรุณาระบุรหัสผ่าน'),
});

export async function login(prevState: unknown, formData: FormData) {
    const result = loginSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return {
            message: 'ข้อมูลไม่ถูกต้อง',
            errors: result.error.flatten().fieldErrors,
        };
    }

    const { username, password } = result.data;

    try {
        const rows = await query<User[]>('SELECT * FROM users WHERE username = ?', [username]);

        if (rows.length === 0) {
            return { message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' };
        }

        const user = rows[0];

        if (!user.password_hash) {
            return { message: 'เกิดข้อผิดพลาด: ไม่พบรหัสผ่าน' };
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return { message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' };
        }

        if (user.role !== 'ADMIN' && user.role !== 'OFFICIAL') {
            return { message: 'ไม่มีสิทธิ์เข้าใช้งานระบบ' };
        }

        await createSession(user.id, user.username, user.full_name, user.role);
    } catch (error) {
        console.error('Login error:', error);
        return { message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' };
    }

    redirect('/admin/dashboard');
}

export async function logout() {
    await deleteSession();
    redirect('/login');
}
