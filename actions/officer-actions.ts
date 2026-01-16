'use server';

import { query } from '@/lib/db';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function getOfficers() {
    const session = await getSession();
    if (!session) return [];

    try {
        // Fetch users with role 'OFFICIAL'
        const rows = await query(`
            SELECT id, full_name, username 
            FROM users 
            WHERE role = 'OFFICIAL' 
            ORDER BY full_name ASC
        `);
        return rows as { id: number; full_name: string; username: string }[];
    } catch (error) {
        console.error('Get officers error:', error);
        return [];
    }
}

export async function assignComplaint(complaintId: number, officerId: number) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return { success: false, message: 'Unauthorized' };
    }

    try {
        await query(`
            UPDATE complaints 
            SET responsible_person_id = ? 
            WHERE id = ?
        `, [officerId, complaintId]);

        revalidatePath('/admin/dashboard');
        return { success: true, message: 'มอบหมายงานสำเร็จ' };
    } catch (error) {
        console.error('Assign complaint error:', error);
        return { success: false, message: 'Failed to assign complaint' };
    }
}
