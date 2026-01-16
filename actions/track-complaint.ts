'use server';

import { query } from '@/lib/db';
import { z } from 'zod';

const SearchSchema = z.object({
    keyword: z.string().min(1, 'กรุณาระบุเลขบัตรประชาชน'),
});

export async function trackComplaint(prevState: any, formData: FormData) {
    const keyword = formData.get('keyword') as string;

    const validatedFields = SearchSchema.safeParse({ keyword });

    if (!validatedFields.success) {
        return {
            success: false,
            message: validatedFields.error.flatten().fieldErrors.keyword?.[0] || 'ข้อมูลไม่ถูกต้อง',
            data: null,
        };
    }

    try {
        // Search by ID Card ONLY
        const rows = await query(
            `SELECT id, complainant_name, id_card, phone, product_name, fda_number, shop_name, location, date_incident, damage_value, details, status, evidence_files, 
            wants_official_letter, official_letter_method, official_letter_email, official_letter_address, rejection_reason, response_letter_file, response_doc_number, created_at
       FROM complaints 
       WHERE id_card = ? 
       ORDER BY created_at DESC`,
            [keyword]
        ) as any[];

        if (rows.length === 0) {
            return {
                success: false,
                message: 'ไม่พบข้อมูลเรื่องร้องเรียนในระบบ',
                data: null,
            };
        }

        // Convert dates to string for serialization
        const data = rows.map((row) => ({
            ...row,
            created_at: row.created_at.toISOString(),
        }));

        return {
            success: true,
            message: `พบข้อมูล ${rows.length} รายการ`,
            data: data,
        };

    } catch (error) {
        console.error('Tracking Error:', error);
        return {
            success: false,
            message: 'เกิดข้อผิดพลาดในการเชื่อมต่อระบบ',
            data: null,
        };
    }
}
