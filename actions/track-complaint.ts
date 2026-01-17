'use server';

import { query } from '@/lib/db';
import { z } from 'zod';

const SearchSchema = z.object({
    keyword: z.string().min(1, 'กรุณาระบุเลขบัตรประชาชน'),
});

import { Complaint } from '@/lib/types';

// ...

export async function trackComplaint(prevState: unknown, formData: FormData) {
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
        const rows = await query<Complaint[]>(
            `SELECT id, complainant_name, id_card, phone, product_name, fda_number, shop_name, location, date_incident, damage_value, details, status, evidence_files, 
            wants_official_letter, official_letter_method, official_letter_email, official_letter_address, rejection_reason, response_letter_file, response_doc_number, created_at
       FROM complaints 
       WHERE id_card = ? 
       ORDER BY created_at DESC`,
            [keyword]
        );

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
            created_at: new Date(row.created_at).toISOString(),
        }));

        return {
            success: true,
            message: `พบข้อมูล ${rows.length} รายการ`,
            data: data,
        };

    } catch (error) {
        console.error('Track complaint error:', error);
        return {
            success: false,
            message: 'เกิดข้อผิดพลาดในการค้นหา',
            data: null,
        };
    }
}
