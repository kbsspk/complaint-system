import { z } from 'zod';

// Basic Thai ID validation (Checksum)
function checkID(id: string) {
    if (id.length !== 13) return false;
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += parseFloat(id.charAt(i)) * (13 - i);
    }
    const check = (11 - sum % 11) % 10;
    return check === parseFloat(id.charAt(12));
}

export const complaintSchema = z.object({
    name: z.string().min(1, 'กรุณาระบุชื่อ-นามสกุล'),
    idCard: z.string().length(13, 'กรุณาระบุเลขบัตรประชาชน 13 หลัก').regex(/^\d+$/, 'กรุณาระบุเป็นตัวเลขเท่านั้น').refine(checkID, 'เลขบัตรประชาชนไม่ถูกต้อง'),
    phone: z.string().min(9, 'กรุณาระบุเบอร์โทรศัพท์ที่ถูกต้อง'),
    email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').optional().or(z.literal('')),
    address: z.string().optional(),
    productName: z.string().optional(),
    fdaNumber: z.string().optional(),
    shopName: z.string().optional(),
    location: z.string().optional(),
    dateIncident: z.string().optional(),
    damageValue: z.string().optional(),
    details: z.string().min(1, 'กรุณาระบุรายละเอียดเรื่องร้องเรียน'),
    // evidence: z.any().optional(), // File upload requires specific handling
    acceptTerms: z.boolean().refine(val => val === true, 'กรุณายอมรับเงื่อนไข'),
    // Official Letter Request
    wantsOfficialLetter: z.boolean().optional(),
    officialLetterDeliveryMethod: z.enum(['EMAIL', 'POST']).optional(),
    officialLetterEmail: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').optional().or(z.literal('')),
    officialLetterAddress: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.wantsOfficialLetter) {
        if (!data.officialLetterDeliveryMethod) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'กรุณาเลือกช่องทางการรับหนังสือ',
                path: ['officialLetterDeliveryMethod'],
            });
        }
        if (data.officialLetterDeliveryMethod === 'EMAIL' && !data.officialLetterEmail) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'กรุณาระบุอีเมลสำหรับรับหนังสือ',
                path: ['officialLetterEmail'],
            });
        }
        if (data.officialLetterDeliveryMethod === 'POST' && !data.officialLetterAddress) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'กรุณาระบุที่อยู่สำหรับรับหนังสือ',
                path: ['officialLetterAddress'],
            });
        }
    }
});

// Schema for official complaint (after acceptance or manual entry)
export const officialComplaintSchema = z.object({
    complaintId: z.coerce.number().optional(), // For update
    complaint_number: z.string().min(1, 'กรุณาระบุเลขรับเรื่อง'),
    // original_doc_path handled separately as file
    received_date: z.string().min(1, 'กรุณาระบุวันรับเรื่อง'),
    original_doc_number: z.string().optional(),
    original_doc_date: z.string().optional(),
    channel: z.enum(['ONLINE', 'PHONE', 'LETTER', 'WALK_IN']),
    type: z.enum(['ARREST', 'GENERAL']),
    district: z.string().optional(),  // Dropdown in UI
    related_acts: z.array(z.string()).optional(), // Multiselect
    responsible_person_id: z.coerce.number().optional(),

    // Include original complaint fields if editing/manual adding
    name: z.string().min(1, 'กรุณาระบุชื่อ-นามสกุล'),
    idCard: z.string().length(13, 'กรุณาระบุเลขบัตรประชาชน 13 หลัก').regex(/^\d+$/, 'กรุณาระบุเป็นตัวเลขเท่านั้น').optional().or(z.literal('')), // Make optional/looser for manual entry? Or stick to strict? User said "Manual entry", so strict is good.
    phone: z.string().min(9, 'กรุณาระบุเบอร์โทรศัพท์ที่ถูกต้อง'),
    email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').optional().or(z.literal('')),
    address: z.string().optional(),
    productName: z.string().optional(),
    fdaNumber: z.string().optional(),
    shopName: z.string().optional(),
    location: z.string().optional(),
    dateIncident: z.string().optional(),
    damageValue: z.string().optional(),
    details: z.string().min(1, 'กรุณาระบุรายละเอียดเรื่องร้องเรียน'),

    // Official Letter Request (For Admin/Officer Form)
    wantsOfficialLetter: z.boolean().optional(),
    officialLetterDeliveryMethod: z.enum(['EMAIL', 'POST']).optional(),
    officialLetterEmail: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').optional().or(z.literal('')),
    officialLetterAddress: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.wantsOfficialLetter) {
        if (!data.officialLetterDeliveryMethod) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'กรุณาเลือกช่องทางการรับหนังสือ',
                path: ['officialLetterDeliveryMethod'],
            });
        }
        if (data.officialLetterDeliveryMethod === 'EMAIL' && !data.officialLetterEmail) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'กรุณาระบุอีเมลสำหรับรับหนังสือ',
                path: ['officialLetterEmail'],
            });
        }
        if (data.officialLetterDeliveryMethod === 'POST' && !data.officialLetterAddress) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'กรุณาระบุที่อยู่สำหรับรับหนังสือ',
                path: ['officialLetterAddress'],
            });
        }
    }
});

export type ComplaintFormData = z.infer<typeof complaintSchema>;
export type OfficialComplaintFormData = z.infer<typeof officialComplaintSchema>;

export const investigationSchema = z.object({
    complaintId: z.coerce.number(),
    investigationDate: z.string().min(1, 'กรุณาระบุวันที่ไปตรวจ'),
    isGuilty: z.enum(['true', 'false']), // Radio often sends string
    legalActionStatus: z.enum(['NONE', 'WAITING_COMMITTEE', 'IN_PROGRESS', 'COMPLETED']),
    responseDocNumber: z.string().optional(),
    responseDocDate: z.string().optional(),
    statusUpdate: z.enum(['IN_PROGRESS', 'RESOLVED']),
    investigationDetails: z.string().optional(),
});
export type InvestigationFormData = z.infer<typeof investigationSchema>;
