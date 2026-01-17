'use server';


import { complaintSchema } from '@/lib/schemas';
import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { uploadToCloudinary } from '@/lib/cloudinary';
// import { writeFile } from 'fs/promises';
// import { join } from 'path';
import { sendLineNotification } from '@/lib/line';

export type ActionState = {
    success?: boolean;
    message?: string;
    errors?: { [key: string]: string[] } | null;
};

export async function submitComplaint(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const rawData: Record<string, unknown> = {};
    const files: File[] = [];

    // Extract data
    for (const [key, value] of formData.entries()) {
        if (key === 'acceptTerms') {
            rawData[key] = value === 'on';
        } else if (key === 'wantsOfficialLetter') {
            rawData[key] = value === 'on';
        } else if (key === 'files') {
            if (value instanceof File && value.size > 0) {
                files.push(value);
            }
        } else {
            rawData[key] = value;
        }
    }

    // Validate fields
    const validatedFields = complaintSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            success: false,
            message: 'กรุณาตรวจสอบข้อมูลให้ถูกต้อง',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const data = validatedFields.data;
    const filePaths: string[] = [];

    try {
        // Handle File Uploads
        if (files.length > 0) {
            for (const file of files) {
                // Simple validation: check type
                if (!file.type.startsWith('image/') && file.type !== 'application/pdf') continue;
                if (file.size > 5 * 1024 * 1024) continue; // Skip > 5MB

                try {
                    const url = await uploadToCloudinary(file, 'complaints/evidence');
                    filePaths.push(url);
                } catch (error) {
                    console.error('Failed to upload file to Cloudinary:', error);
                    // Decide whether to fail the whole request or just skip the file.
                    // Let's skip the file but warn.
                }
            }
        }

        const evidenceJson = JSON.stringify(filePaths);

        await query(`
      INSERT INTO complaints 
      (complainant_name, id_card, phone, product_name, fda_number, shop_name, location, date_incident, damage_value, details, status, evidence_files,
       wants_official_letter, official_letter_method, official_letter_email, official_letter_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, ?)
    `, [
            data.name,
            data.idCard,
            data.phone,
            data.productName,
            data.fdaNumber || null,
            data.shopName || null,
            data.location || null,
            data.dateIncident || null,
            data.damageValue || null,
            data.details,
            evidenceJson,
            data.wantsOfficialLetter || false,
            data.officialLetterDeliveryMethod || null,
            data.officialLetterEmail || null,
            data.officialLetterAddress || null
        ]);

        // Send Line Notification (Fire and forget)
        const message = `🔔 แจ้งเตือน: มีเรื่องร้องเรียนใหม่\n\nมีผู้ยื่นเรื่องร้องเรียนผ่านช่องทางเว็บไซต์\nAdmin กรุณาตรวจสอบข้อมูลในระบบ\n\nขอบคุณค่ะ 🙏`;
        sendLineNotification(message).catch(err => console.error('BG Notification Error:', err));

        revalidatePath('/admin/dashboard');

        return {
            success: true,
            message: 'ส่งเรื่องร้องเรียนเรียบร้อยแล้ว เจ้าหน้าที่จะดำเนินการตรวจสอบโดยเร็วที่สุด',
            errors: null,
        };
    } catch (error) {
        console.error('Submission error:', error);
        return {
            success: false,
            message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง',
        };
    }
}
