export interface Complaint {
    id: number;
    complaint_number?: string;
    received_date?: string | Date; // Date from DB
    original_doc_number?: string;
    original_doc_date?: string | Date;
    original_doc_path?: string; // Attachment path
    channel?: string;
    type?: string;
    district?: string;
    created_at: string | Date;
    status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
    responsible_person_id?: number | null;
    responsible_person_name?: string; // Joined field

    // Complainant
    complainant_name: string;
    id_card?: string;
    phone: string;
    mail?: string; // DB column is 'mail' but form calls it 'email'

    // Incident
    product_name: string;
    location?: string;
    details: string;
    date_incident?: string | Date;
    damage_value?: string;
    fda_number?: string;
    shop_name?: string;

    // Official Letter Request
    wants_official_letter?: boolean | number; // Tinyint
    official_letter_method?: string;
    official_letter_email?: string;
    official_letter_address?: string; // Add this

    // Investigation
    investigation_date?: string | Date;
    is_guilty?: boolean | number;
    legal_action_status?: 'NONE' | 'WAITING_COMMITTEE' | 'IN_PROGRESS' | 'COMPLETED' | 'FINE';
    investigation_details?: string;
    response_doc_number?: string;
    response_doc_date?: string | Date;
    response_letter_file?: string;
    action_evidence_file?: string;
    evidence_files?: string; // JSON string from DB

    related_acts?: string | string[]; // JSON string or array if parsed
    is_safety_health_related?: boolean | number; // Add this

    rejection_reason?: string;
}

export interface User {
    id: number;
    username: string;
    password_hash?: string; // Optional because session might not have it
    role?: 'ADMIN' | 'OFFICIAL' | string; // Optional for session usage
    full_name: string;
    created_at?: string | Date;
}

export interface InvestigationFine {
    id: number;
    complaint_id: number;
    act_name: string;
    section_name: string;
    amount: number;
    created_at?: string | Date;
}
