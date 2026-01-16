import { query } from '@/lib/db';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

import { getSession } from '@/lib/session';

async function getComplaints() {
    const session = await getSession();
    if (!session) return [];

    let sql = `
        SELECT c.*, u.full_name as responsible_person_name 
        FROM complaints c 
        LEFT JOIN users u ON c.responsible_person_id = u.id
    `;
    const params: any[] = [];

    // If Officer, only show assigned complaints OR complaints they created (optional, but requested req is "assigned to them")
    // User req: "officer sees only assigned to them".
    if (session.role === 'OFFICIAL') {
        sql += ' WHERE c.responsible_person_id = ?';
        params.push(session.userId);
    }

    sql += ' ORDER BY c.created_at DESC';

    const rows = await query(sql, params);
    return rows as any[];
}

export default async function DashboardPage() {
    const session = await getSession();
    const complaints = await getComplaints();

    const currentUser = session ? { id: session.userId, username: session.username, full_name: session.fullName } : null;

    return <AdminDashboardClient complaints={complaints} currentUser={currentUser} role={session?.role || ''} />;
}
