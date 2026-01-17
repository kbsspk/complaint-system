'use server';

import { z } from 'zod';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';
import { uploadToCloudinary } from '@/lib/cloudinary';

async function uploadFile(file: File, folder: string = 'complaints/documents'): Promise<string | null> {
    if (!file || file.size === 0) return null;
    try {
        return await uploadToCloudinary(file, folder);
    } catch (error) {
        console.error('Upload error:', error);
        return null;
    }
}


// --- Complaints ---

// Update Status (Simple)
export async function updateComplaintStatus(id: number, status: 'PENDING' | 'RESOLVED' | 'REJECTED' | 'IN_PROGRESS') {
    const session = await getSession();
    if (!session) return { message: 'Unauthorized' };

    try {
        await query('UPDATE complaints SET status = ? WHERE id = ?', [status, id]);
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Update status error:', error);
        return { success: false, message: 'Failed to update status' };
    }
}

// Reject with Reason
export async function rejectComplaint(id: number, reason: string) {
    const session = await getSession();
    if (!session) return { message: 'Unauthorized' };

    try {
        await query('UPDATE complaints SET status = ?, rejection_reason = ? WHERE id = ?', ['REJECTED', reason, id]);
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Reject error:', error);
        return { success: false, message: 'Failed to reject complaint' };
    }
}

// Accept Complaint (and update details)
// This might handle file uploads too if "original doc" is uploaded
export async function acceptComplaint(prevState: unknown, formData: FormData) {
    const session = await getSession();
    if (!session) return { message: 'Unauthorized' };

    // Extract basic fields
    const id = formData.get('id') as string;
    const complaint_number = formData.get('complaint_number') as string;
    const received_date = formData.get('received_date') as string;
    const original_doc_number = formData.get('original_doc_number') as string;
    const original_doc_date = formData.get('original_doc_date') as string;
    const channel = formData.get('channel') as string; // Should be ONLINE if accepting web? User said "Web channel -> Online Auto", but maybe admin can correct it? User said "If via web -> Auto select Online".
    const type = formData.get('type') as string;
    const district = formData.get('district') as string;
    const responsible_person_id = formData.get('responsible_person_id') as string;

    // Related Acts (Multi-select)
    const related_acts = formData.getAll('related_acts'); // Array of strings

    // File handling for original_doc_path
    const original_doc_file = formData.get('original_doc_file') as File;
    let original_doc_path = null;
    if (original_doc_file && original_doc_file.size > 0) {
        original_doc_path = await uploadFile(original_doc_file, 'complaints/official_docs');
    }

    try {
        // If file uploaded, update validation or just update DB
        // Determine query based on file existence to avoid overwriting with null if not provided?
        // Actually, if it's "Accept", it's the first time setting it, so update.

        let updateSql = `
            UPDATE complaints SET 
                status = 'IN_PROGRESS',
                complaint_number = ?,
                received_date = ?,
                original_doc_number = ?,
                original_doc_date = ?,
                channel = ?,
                type = ?,
                district = ?,
                related_acts = ?,
                responsible_person_id = ?,
                is_safety_health_related = ?
        `;
        const params: (string | number | boolean | null)[] = [
            complaint_number, received_date || null, original_doc_number, original_doc_date || null,
            channel, type, district, JSON.stringify(related_acts), responsible_person_id || null,
            formData.get('is_safety_health_related') === 'true'
        ];

        if (original_doc_path) {
            updateSql += `, original_doc_path = ?`;
            params.push(original_doc_path);
        }

        updateSql += ` WHERE id = ?`;
        params.push(id);

        await query(updateSql, params);

        revalidatePath('/admin/dashboard');
        return { success: true, message: 'รับเรื่องเรียบร้อยแล้ว' };
    } catch (error) {
        console.error('Accept error:', error);
        return { success: false, message: `Failed to accept complaint: ${(error as Error).message}` };
    }
}

// Manual Create Complaint
export async function createManualComplaint(prevState: unknown, formData: FormData) {
    const session = await getSession();
    if (!session) return { message: 'Unauthorized' };

    // Extract fields
    const name = formData.get('name') as string;
    const idCard = formData.get('idCard') as string;
    const phone = formData.get('phone') as string;
    // For manual create, usually these are contact details.
    // If user wants to reuse them for official letter if not specified? 
    // But manual create form has specific "Requests Official Letter" section too?
    // Let's grab them all.
    const email = formData.get('email') as string;
    const address = formData.get('address') as string;

    const productName = formData.get('productName') as string;
    // const fdaNumber = formData.get('fdaNumber') as string; // Unused
    const shopName = formData.get('shopName') as string;
    const location = formData.get('location') as string;
    const dateIncident = formData.get('dateIncident') as string;
    const damageValue = formData.get('damageValue') as string;
    const details = formData.get('details') as string;

    // Official fields
    const complaint_number = formData.get('complaint_number') as string; // manually entered
    const received_date = formData.get('received_date') as string;
    const original_doc_number = formData.get('original_doc_number') as string;
    const original_doc_date = formData.get('original_doc_date') as string;
    const channel = formData.get('channel') as string;
    const type = formData.get('type') as string;
    const district = formData.get('district') as string;
    const responsible_person_id = formData.get('responsible_person_id') as string;
    const related_acts = formData.getAll('related_acts');

    // Official Letter Request
    const wantsOfficialLetter = formData.get('wantsOfficialLetter') === 'on';
    const officialLetterDeliveryMethod = formData.get('officialLetterDeliveryMethod') as string;
    const officialLetterEmail = formData.get('officialLetterEmail') as string;
    const officialLetterAddress = formData.get('officialLetterAddress') as string;

    // Files
    const original_doc_file = formData.get('original_doc_file') as File;
    const evidence_files = formData.getAll('evidence_files') as File[];

    try {
        const original_doc_path = await uploadFile(original_doc_file, 'complaints/official_docs');

        const evidencePaths: string[] = [];
        for (const file of evidence_files) {
            const path = await uploadFile(file, 'complaints/evidence');
            if (path) evidencePaths.push(path);
        }

        await query(`
            INSERT INTO complaints(
            complainant_name, id_card, phone, official_letter_email, official_letter_address,
            product_name, shop_name, location, date_incident, damage_value, details,
            status, evidence_files,
            complaint_number, received_date, original_doc_number, original_doc_date,
            channel, type, district, related_acts, responsible_person_id, original_doc_path,
            wants_official_letter, official_letter_method, is_safety_health_related
        ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'IN_PROGRESS', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
            name, idCard, phone, officialLetterEmail || email, officialLetterAddress || address, // Prioritize explicit official letter fields
            productName, shopName, location, dateIncident, damageValue, details,
            JSON.stringify(evidencePaths),
            complaint_number, received_date, original_doc_number, original_doc_date,
            channel, type, district, JSON.stringify(related_acts), responsible_person_id || null, original_doc_path,
            wantsOfficialLetter, officialLetterDeliveryMethod || null,
            formData.get('is_safety_health_related') === 'true'
        ]);

        revalidatePath('/admin/dashboard');
        return { success: true, message: 'เพิ่มเรื่องร้องเรียนเรียบร้อยแล้ว' };
    } catch (error) {
        console.error('Manual Create error:', error);
        return { success: false, message: 'Failed to create complaint' };
    }
}


// Update Complaint Details
export async function updateComplaint(id: number, formData: FormData) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return { message: 'Unauthorized' };

    // Extract fields
    const name = formData.get('name') as string;
    const idCard = formData.get('idCard') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string; // This will map to 'mail' column
    const address = formData.get('address') as string; // This will map to 'official_letter_address' column
    const productName = formData.get('productName') as string;
    const fdaNumber = formData.get('fdaNumber') as string;
    const shopName = formData.get('shopName') as string;
    const location = formData.get('location') as string;
    const dateIncident = formData.get('dateIncident') as string;
    const damageValue = formData.get('damageValue') as string;
    const details = formData.get('details') as string;

    // Official fields
    const complaint_number = formData.get('complaint_number') as string;
    const received_date = formData.get('received_date') as string;
    const original_doc_number = formData.get('original_doc_number') as string;
    const original_doc_date = formData.get('original_doc_date') as string;
    const channel = formData.get('channel') as string;
    const type = formData.get('type') as string;
    const district = formData.get('district') as string;
    const responsible_person_id = formData.get('responsible_person_id') as string;

    const related_acts = formData.getAll('related_acts').map(x => x.toString());

    // Official Letter Request
    const wantsOfficialLetter = formData.get('wantsOfficialLetter') === 'on';
    const officialLetterDeliveryMethod = formData.get('officialLetterDeliveryMethod') as string;
    const officialLetterEmail = formData.get('officialLetterEmail') as string;
    const officialLetterAddress = formData.get('officialLetterAddress') as string;

    // Files (Appended if provided)
    const original_doc_file = formData.get('original_doc_file') as File;
    const evidence_files = formData.getAll('evidence_files') as File[];

    try {
        let updateSql = `
            UPDATE complaints SET
        complainant_name = ?, id_card = ?, phone = ?, official_letter_email = ?, official_letter_address = ?,
            product_name = ?, fda_number = ?, shop_name = ?, location = ?, date_incident = ?, damage_value = ?, details = ?,
            complaint_number = ?, received_date = ?, original_doc_number = ?, original_doc_date = ?,
            channel = ?, type = ?, district = ?, related_acts = ?, responsible_person_id = ?,
            wants_official_letter = ?, official_letter_method = ?, is_safety_health_related = ?
                `;

        const params: (string | number | boolean | null)[] = [
            name, idCard, phone, officialLetterEmail || email, officialLetterAddress || address, // Prioritize officialLetter* fields
            productName, fdaNumber, shopName, location, dateIncident || null, damageValue, details,
            complaint_number, received_date || null, original_doc_number, original_doc_date || null,
            channel, type, district, JSON.stringify(related_acts), responsible_person_id || null,
            wantsOfficialLetter, officialLetterDeliveryMethod || null,
            formData.get('is_safety_health_related') === 'true'
        ];

        if (original_doc_file && original_doc_file.size > 0) {
            const original_doc_path = await uploadFile(original_doc_file, 'complaints/official_docs');
            updateSql += `, original_doc_path = ? `;
            params.push(original_doc_path);
        }

        // Evidence files
        if (evidence_files.length > 0 && evidence_files[0].size > 0) {
            const existingRows = await query<{ evidence_files: string }[]>('SELECT evidence_files FROM complaints WHERE id = ?', [id]);
            let existingFiles: string[] = [];
            if (existingRows.length > 0 && existingRows[0].evidence_files) {
                try {
                    existingFiles = JSON.parse(existingRows[0].evidence_files);
                } catch { }
            }

            for (const file of evidence_files) {
                if (file.size > 0) {
                    const path = await uploadFile(file, 'complaints/evidence');
                    if (path) existingFiles.push(path);
                }
            }
            updateSql += `, evidence_files = ? `;
            params.push(JSON.stringify(existingFiles));
        }

        updateSql += ` WHERE id = ? `;
        params.push(id);

        await query(updateSql, params);

        revalidatePath('/admin/dashboard');
        revalidatePath(`/admin/complaints/${id}`);
        return { success: true, message: 'แก้ไขข้อมูลเรียบร้อยแล้ว' };
    } catch (error) {
        console.error('Update complaint error:', error);
        return { success: false, message: 'Failed to update complaint' };
    }
}


// --- Users ---

const createUserSchema = z.object({
    username: z.string().min(1, 'Required'),
    fullName: z.string().min(1, 'Required'),
    password: z.string().min(6, 'Min 6 chars'),
    role: z.enum(['ADMIN', 'OFFICIAL']),
});

export async function createUser(prevState: unknown, formData: FormData) {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return { message: 'Unauthorized: Only Admin can create users' };

    const rawData = Object.fromEntries(formData);
    const result = createUserSchema.safeParse(rawData);

    if (!result.success) {
        return { message: 'Invalid data', errors: result.error.flatten().fieldErrors };
    }

    const { username, fullName, password, role } = result.data;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await query('INSERT INTO users (username, full_name, password_hash, role) VALUES (?, ?, ?, ?)', [username, fullName, hashedPassword, role]);
        revalidatePath('/admin/users');
        return { success: true, message: 'User created successfully' };
    } catch (error) {
        console.error('Create User Error:', error);
        const err = error as { code?: string };
        if (err.code === 'ER_DUP_ENTRY') {
            return { message: 'ชื่อผู้ใช้งานนี้มีอยู่ในระบบแล้ว' };
        }
        return { message: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน' };
    }
}

// --- Investigation ---

const investigationSchema = z.object({
    complaintId: z.coerce.number(),
    investigationDate: z.string().min(1, 'กรุณาระบุวันที่ไปตรวจ'),
    isGuilty: z.preprocess((val) => val === 'true' || val === true, z.boolean()),
    // legalActionStatus mapped to legalActionType (FINE, PROSECUTION, NONE)
    legalActionType: z.enum(['NONE', 'FINE', 'PROSECUTION']).optional(),
    // We might still receive 'legalActionStatus' from old forms or if we didn't update name attribute?
    // Use optional and handle logic. Actually, let's just add legalActionType and fallback/map.

    // Fines JSON string
    fines: z.string().optional(),

    responseDocNumber: z.string().optional(),
    responseDocDate: z.string().optional(),
    statusUpdate: z.enum(['IN_PROGRESS', 'RESOLVED']),
    investigationDetails: z.string().optional(),
});

export async function saveInvestigationResults(prevState: unknown, formData: FormData) {
    const session = await getSession();
    if (!session) return { message: 'Unauthorized' };

    const rawData = Object.fromEntries(formData);
    const validated = investigationSchema.safeParse(rawData);

    if (!validated.success) {
        return { success: false, message: 'Invalid data', errors: validated.error.flatten().fieldErrors };
    }

    const {
        complaintId, investigationDate, isGuilty, legalActionType,
        responseDocNumber, responseDocDate, statusUpdate, investigationDetails,
        fines: finesJson
    } = validated.data;

    // Handle File Uploads
    const responseLetterFile = formData.get('responseLetterFile') as File;
    const actionEvidenceFile = formData.get('actionEvidenceFile') as File;

    try {
        let responseLetterPath = null;
        let actionEvidencePath = null;

        if (responseLetterFile && responseLetterFile.size > 0) {
            try {
                responseLetterPath = await uploadFile(responseLetterFile, 'investigation/response_docs');
            } catch (uploadError) {
                console.error('Upload failed (responseLetter):', uploadError);
                // On Vercel, this fails. We might want to continue without file or throw?
                // Throwing to let user know upload failed.
                throw new Error('Upload failed: File system is read-only (Vercel limitation). Please configure Vercel Blob.');
            }
        }

        if (actionEvidenceFile && actionEvidenceFile.size > 0) {
            try {
                actionEvidencePath = await uploadFile(actionEvidenceFile, 'investigation/evidence');
            } catch (uploadError) {
                console.error('Upload failed (actionEvidence):', uploadError);
                throw new Error('Upload failed: File system is read-only (Vercel limitation). Please configure Vercel Blob.');
            }
        }

        let updateSql = `
            UPDATE complaints SET
                investigation_date = ?,
                is_guilty = ?,
                legal_action_status = ?,
                response_doc_number = ?,
                response_doc_date = ?,
                investigation_details = ?,
                status = ?
        `;
        const params: (string | number | boolean | null)[] = [
            investigationDate,
            isGuilty,
            legalActionType || 'NONE',
            responseDocNumber || null,
            responseDocDate || null, // Fix empty string date
            investigationDetails || null,
            statusUpdate
        ];

        if (responseLetterPath) {
            updateSql += `, response_letter_file = ?`;
            params.push(responseLetterPath);
        }

        if (actionEvidencePath) {
            updateSql += `, action_evidence_file = ?`;
            params.push(actionEvidencePath);
        }

        updateSql += ` WHERE id = ?`;
        params.push(complaintId);

        await query(updateSql, params);

        // Handle Fines Transaction
        try {
            // 1. Delete existing fines
            await query('DELETE FROM investigation_fines WHERE complaint_id = ?', [complaintId]);

            // 2. Insert new fines if type is FINE
            if (legalActionType === 'FINE' && finesJson) {
                const fines = JSON.parse(finesJson);
                if (Array.isArray(fines)) {
                    for (const fine of fines) {
                        if (fine.act && fine.section && fine.amount) {
                            await query(
                                'INSERT INTO investigation_fines (complaint_id, act_name, section_name, amount) VALUES (?, ?, ?, ?)',
                                [complaintId, fine.act, fine.section, parseFloat(fine.amount)]
                            );
                        }
                    }
                }
            }
        } catch (fineError) {
            console.error('Error saving fines:', fineError);
            // Don't fail the whole request for fines error, but maybe warn?
        }

        revalidatePath('/admin/dashboard');
        revalidatePath(`/admin/complaints/${complaintId}`);

        return { success: true, message: 'บันทึกผลการตรวจสอบเรียบร้อยแล้ว' };
    } catch (error) {
        console.error('Save investigation error:', error);
        return { success: false, message: `Failed to save investigation results: ${(error as Error).message}` };
    }
}

import { InvestigationFine } from '@/lib/types';
// ...

export async function getInvestigationFines(complaintId: number) {
    const session = await getSession();
    if (!session) return [];

    try {
        const rows = await query<InvestigationFine[]>('SELECT * FROM investigation_fines WHERE complaint_id = ? ORDER BY id ASC', [complaintId]);
        return rows;
    } catch (error) {
        console.error('Get fines error:', error);
        return [];
    }
}

export async function getUsedSections(actName?: string) {
    const session = await getSession();
    if (!session) return [];

    try {
        let sql = 'SELECT DISTINCT section_name FROM investigation_fines';
        const params: string[] = [];

        if (actName) {
            sql += ' WHERE act_name = ?';
            params.push(actName);
        }

        sql += ' ORDER BY section_name ASC';

        const rows = await query<{ section_name: string }[]>(sql, params);
        return rows.map(r => r.section_name as string);
    } catch (error) {
        console.error('Get used sections error:', error);
        return [];
    }
}

