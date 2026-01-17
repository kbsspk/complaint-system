import { query } from '@/lib/db';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

import { getSession } from '@/lib/session';
import { Complaint } from '@/lib/types';

async function getComplaints() {
    const session = await getSession();
    if (!session) return [];

    let sql = `
        SELECT c.*, u.full_name as responsible_person_name 
        FROM complaints c 
        LEFT JOIN users u ON c.responsible_person_id = u.id
    `;
    const params: (string | number)[] = [];

    // If Officer, only show assigned complaints OR complaints they created (optional, but requested req is "assigned to them")
    // User req: "officer sees only assigned to them".
    if (session.role === 'OFFICIAL') {
        sql += ' WHERE c.responsible_person_id = ?';
        params.push(session.userId);
    }

    sql += ' ORDER BY c.created_at DESC';

    const rows = await query<Complaint[]>(sql, params);

    // Serialize dates to strings for Client Component
    return rows.map(row => ({
        ...row,
        received_date: row.received_date ? new Date(row.received_date).toISOString() : undefined,
        original_doc_date: row.original_doc_date ? new Date(row.original_doc_date).toISOString() : undefined,
        created_at: new Date(row.created_at).toISOString(),
        date_incident: row.date_incident ? new Date(row.date_incident).toISOString() : undefined,
        investigation_date: row.investigation_date ? new Date(row.investigation_date).toISOString() : undefined,
        response_doc_date: row.response_doc_date ? new Date(row.response_doc_date).toISOString() : undefined,
    }));
}

export default async function DashboardPage() {
    const session = await getSession();
    const complaints = await getComplaints();

    const currentUser = session ? { id: session.userId, username: session.username, full_name: session.fullName } : null;

    return <AdminDashboardClient complaints={complaints} currentUser={currentUser} role={session?.role || ''} />;
}
