'use server';

import { query } from '@/lib/db';

export type MonthlyStats = {
    month: string; // Format: 'YYYY-MM'
    pending: number;
    inspected: number;
    completed: number;
};

export async function getMonthlyComplaintStats(endDateStr?: string): Promise<MonthlyStats[]> {
    try {
        // Determine End Date (last day of the specified month, or current date)
        const now = new Date();
        let endObj = now;

        if (endDateStr) {
            const [y, m] = endDateStr.split('-');
            // month is 0-indexed in Date constructor (0=Jan, 11=Dec).
            // Input '2025-12' means target month is Dec 2025.
            // new Date(2025, 12, 0) gives day before Jan 1, 2026 => Dec 31, 2025.
            endObj = new Date(parseInt(y), parseInt(m), 0, 23, 59, 59);
        }

        const statsMap = new Map<string, MonthlyStats>();
        const monthKeys: string[] = [];

        // Fix timezone issues by working with integers
        const currentY = endObj.getFullYear();
        const currentM = endObj.getMonth(); // 0-indexed (Dec = 11)

        for (let i = 0; i < 12; i++) {
            let y = currentY;
            let m = currentM - i;
            while (m < 0) {
                m += 12;
                y -= 1;
            }
            const key = `${y}-${String(m + 1).padStart(2, '0')}`;
            monthKeys.unshift(key); // Prepend to keep order ASC

            statsMap.set(key, {
                month: key,
                pending: 0,
                inspected: 0,
                completed: 0
            });
        }

        const startKey = monthKeys[0];
        const endKey = monthKeys[monthKeys.length - 1];

        const sql = `
            SELECT 
                DATE_FORMAT(COALESCE(received_date, created_at), '%Y-%m') as month,
                SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'IN_PROGRESS' AND investigation_date IS NOT NULL THEN 1 ELSE 0 END) as inspected,
                SUM(CASE WHEN status = 'PENDING' OR (status = 'IN_PROGRESS' AND investigation_date IS NULL) THEN 1 ELSE 0 END) as pending
            FROM complaints
            WHERE 
                DATE_FORMAT(COALESCE(received_date, created_at), '%Y-%m') >= ? 
                AND DATE_FORMAT(COALESCE(received_date, created_at), '%Y-%m') <= ?
                AND status != 'REJECTED'
            GROUP BY month
            ORDER BY month ASC
        `;

        const rows = await query<{ month: string; completed: number | string; inspected: number | string; pending: number | string }[]>(sql, [startKey, endKey]);

        for (const row of rows) {
            const { month, completed, inspected, pending } = row;
            if (statsMap.has(month)) {
                const entry = statsMap.get(month)!;
                entry.completed = Number(completed);
                entry.inspected = Number(inspected);
                entry.pending = Number(pending);
            }
        }

        return Array.from(statsMap.values());

    } catch (error) {
        console.error('Failed to fetch stats:', error);
        return [];
    }
}

// --- Acts Stats ---

export type MonthlyActStats = {
    month: string;
    [key: string]: number | string; // Act Name -> Count
};

export async function getMonthlyActStats(endDateStr?: string): Promise<MonthlyActStats[]> {
    try {
        const now = new Date();
        let endObj = now;

        if (endDateStr) {
            const [y, m] = endDateStr.split('-');
            endObj = new Date(parseInt(y), parseInt(m), 0, 23, 59, 59);
        }

        const monthKeys: string[] = [];
        const statsMap = new Map<string, MonthlyActStats>();

        const currentY = endObj.getFullYear();
        const currentM = endObj.getMonth();

        // Initialize map with 0 for all months
        for (let i = 0; i < 12; i++) {
            let y = currentY;
            let m = currentM - i;
            while (m < 0) {
                m += 12;
                y -= 1;
            }
            const key = `${y}-${String(m + 1).padStart(2, '0')}`;
            monthKeys.unshift(key);
            statsMap.set(key, { month: key });
        }

        const startKey = monthKeys[0];
        const endKey = monthKeys[monthKeys.length - 1];

        // Fetch all complaints in range (id, received_date/created_at, related_acts)
        const sql = `
            SELECT 
                DATE_FORMAT(COALESCE(received_date, created_at), '%Y-%m') as month,
                related_acts
            FROM complaints
            WHERE 
                DATE_FORMAT(COALESCE(received_date, created_at), '%Y-%m') >= ? 
                AND DATE_FORMAT(COALESCE(received_date, created_at), '%Y-%m') <= ?
                AND status != 'REJECTED'
        `;

        const rows = await query<{ month: string; related_acts: string | null }[]>(sql, [startKey, endKey]);

        for (const row of rows) {
            const { month, related_acts } = row;
            if (statsMap.has(month) && related_acts) {
                const entry = statsMap.get(month)!;
                let acts: string[] = [];
                try {
                    // It likely comes as a JSON string from DB if column is JSON or TEXT
                    if (typeof related_acts === 'string') {
                        acts = JSON.parse(related_acts);
                    } else if (Array.isArray(related_acts)) {
                        acts = related_acts;
                    }
                } catch {
                    // ignore parse error logic
                }

                if (Array.isArray(acts)) {
                    for (const act of acts) {
                        const currentCount = (entry[act] as number) || 0;
                        entry[act] = currentCount + 1;
                    }
                }
            }
        }

        return Array.from(statsMap.values());

    } catch (error) {
        console.error('Failed to fetch act stats:', error);
        return [];
    }
}

// --- District Stats ---

export type MonthlyDistrictStats = {
    month: string;
    [key: string]: number | string;
};

export async function getMonthlyDistrictStats(endDateStr?: string): Promise<MonthlyDistrictStats[]> {
    try {
        const now = new Date();
        let endObj = now;
        if (endDateStr) {
            const [y, m] = endDateStr.split('-');
            endObj = new Date(parseInt(y), parseInt(m), 0, 23, 59, 59);
        }

        const monthKeys: string[] = [];
        const statsMap = new Map<string, MonthlyDistrictStats>();

        const currentY = endObj.getFullYear();
        const currentM = endObj.getMonth();

        for (let i = 0; i < 12; i++) {
            let y = currentY;
            let m = currentM - i;
            while (m < 0) { m += 12; y -= 1; }
            const key = `${y}-${String(m + 1).padStart(2, '0')}`;
            monthKeys.unshift(key);
            statsMap.set(key, { month: key });
        }

        const startKey = monthKeys[0];
        const endKey = monthKeys[monthKeys.length - 1];

        const sql = `
            SELECT 
                DATE_FORMAT(COALESCE(received_date, created_at), '%Y-%m') as month,
                district,
                COUNT(*) as count
            FROM complaints
            WHERE 
                DATE_FORMAT(COALESCE(received_date, created_at), '%Y-%m') >= ? 
                AND DATE_FORMAT(COALESCE(received_date, created_at), '%Y-%m') <= ?
                AND status != 'REJECTED'
            GROUP BY month, district
        `;

        const rows = await query<{ month: string; district: string; count: number | string }[]>(sql, [startKey, endKey]);

        for (const row of rows) {
            const { month, district, count } = row;
            if (statsMap.has(month) && district) {
                const entry = statsMap.get(month)!;
                entry[district] = Number(count);
            }
        }

        return Array.from(statsMap.values());
    } catch (error) {
        console.error('Failed to fetch district stats:', error);
        return [];
    }
}

// --- Channel Stats ---

export type MonthlyChannelStats = {
    month: string;
    [key: string]: number | string;
};

export async function getMonthlyChannelStats(endDateStr?: string): Promise<MonthlyChannelStats[]> {
    try {
        const now = new Date();
        let endObj = now;
        if (endDateStr) {
            const [y, m] = endDateStr.split('-');
            endObj = new Date(parseInt(y), parseInt(m), 0, 23, 59, 59);
        }

        const monthKeys: string[] = [];
        const statsMap = new Map<string, MonthlyChannelStats>();

        const currentY = endObj.getFullYear();
        const currentM = endObj.getMonth();

        for (let i = 0; i < 12; i++) {
            let y = currentY;
            let m = currentM - i;
            while (m < 0) { m += 12; y -= 1; }
            const key = `${y}-${String(m + 1).padStart(2, '0')}`;
            monthKeys.unshift(key);
            statsMap.set(key, { month: key });
        }

        const startKey = monthKeys[0];
        const endKey = monthKeys[monthKeys.length - 1];

        const sql = `
            SELECT 
                DATE_FORMAT(COALESCE(received_date, created_at), '%Y-%m') as month,
                channel,
                COUNT(*) as count
            FROM complaints
            WHERE 
                DATE_FORMAT(COALESCE(received_date, created_at), '%Y-%m') >= ? 
                AND DATE_FORMAT(COALESCE(received_date, created_at), '%Y-%m') <= ?
                AND status != 'REJECTED'
            GROUP BY month, channel
        `;

        const rows = await query<{ month: string; channel: string; count: number | string }[]>(sql, [startKey, endKey]);

        for (const row of rows) {
            const { month, channel, count } = row;
            if (statsMap.has(month) && channel) {
                const entry = statsMap.get(month)!;
                // Use raw channel key (e.g. 'ONLINE')
                // The client component handles translation to Thai
                const current = (entry[channel] as number) || 0;
                entry[channel] = current + Number(count);
            }
        }

        return Array.from(statsMap.values());
    } catch (error) {
        console.error('Failed to fetch channel stats:', error);
        return [];
    }
}
// --- Safety Stats ---

export type MonthlySafetyStats = {
    month: string;
    safety_related: number;
    others: number;
};

export async function getMonthlySafetyStats(endDateStr?: string): Promise<MonthlySafetyStats[]> {
    try {
        const now = new Date();
        let endObj = now;
        if (endDateStr) {
            const [y, m] = endDateStr.split('-');
            endObj = new Date(parseInt(y), parseInt(m), 0, 23, 59, 59);
        }

        const monthKeys: string[] = [];
        const statsMap = new Map<string, MonthlySafetyStats>();

        const currentY = endObj.getFullYear();
        const currentM = endObj.getMonth();

        for (let i = 0; i < 12; i++) {
            let y = currentY;
            let m = currentM - i;
            while (m < 0) { m += 12; y -= 1; }
            const key = `${y}-${String(m + 1).padStart(2, '0')}`;
            monthKeys.unshift(key);
            statsMap.set(key, { month: key, safety_related: 0, others: 0 });
        }

        const startKey = monthKeys[0];
        const endKey = monthKeys[monthKeys.length - 1];

        const sql = `
            SELECT 
                DATE_FORMAT(COALESCE(received_date, created_at), '%Y-%m') as month,
                SUM(CASE WHEN is_safety_health_related = TRUE THEN 1 ELSE 0 END) as safety_count,
                 SUM(CASE WHEN is_safety_health_related = FALSE OR is_safety_health_related IS NULL THEN 1 ELSE 0 END) as other_count
            FROM complaints
            WHERE 
                DATE_FORMAT(COALESCE(received_date, created_at), '%Y-%m') >= ? 
                AND DATE_FORMAT(COALESCE(received_date, created_at), '%Y-%m') <= ?
            GROUP BY month
        `;

        const rows = await query<{ month: string; safety_count: number | string; other_count: number | string }[]>(sql, [startKey, endKey]);

        for (const row of rows) {
            const { month, safety_count, other_count } = row;
            if (statsMap.has(month)) {
                const entry = statsMap.get(month)!;
                entry.safety_related = Number(safety_count);
                entry.others = Number(other_count);
            }
        }

        return Array.from(statsMap.values());
    } catch (error) {
        console.error('Failed to fetch safety stats:', error);
        return [];
    }

}

export type MonthlyFineStats = {
    month: string;
    totalAmount: number;
    count: number;
};

export async function getMonthlyFineStats(
    endDateStr?: string,
    filterAct?: string,
    filterSection?: string
): Promise<MonthlyFineStats[]> {
    try {
        const now = new Date();
        let endObj = now;
        if (endDateStr) {
            const [y, m] = endDateStr.split('-');
            endObj = new Date(parseInt(y), parseInt(m), 0, 23, 59, 59);
        }

        const monthKeys: string[] = [];
        const statsMap = new Map<string, MonthlyFineStats>();

        const currentY = endObj.getFullYear();
        const currentM = endObj.getMonth();

        for (let i = 0; i < 12; i++) {
            let y = currentY;
            let m = currentM - i;
            while (m < 0) { m += 12; y -= 1; }
            const key = `${y}-${String(m + 1).padStart(2, '0')}`;
            monthKeys.unshift(key);
            statsMap.set(key, { month: key, totalAmount: 0, count: 0 });
        }

        const startKey = monthKeys[0];
        const endKey = monthKeys[monthKeys.length - 1];

        // Base SQL
        let sql = `
            SELECT 
                DATE_FORMAT(f.created_at, '%Y-%m') as month,
                SUM(f.amount) as total,
                COUNT(f.id) as count
            FROM investigation_fines f
            WHERE 
                DATE_FORMAT(f.created_at, '%Y-%m') >= ? 
                AND DATE_FORMAT(f.created_at, '%Y-%m') <= ?
        `;

        const params: (string | number)[] = [startKey, endKey];

        if (filterAct && filterAct !== 'ALL') {
            sql += ' AND f.act_name = ?';
            params.push(filterAct);
        }

        if (filterSection && filterSection !== 'ALL') {
            sql += ' AND f.section_name LIKE ?';
            params.push(`%${filterSection}%`);
        }

        sql += ' GROUP BY month';

        const rows = await query<{ month: string; total: number | string; count: number | string }[]>(sql, params);

        for (const row of rows) {
            const { month, total, count } = row;
            if (statsMap.has(month)) {
                const entry = statsMap.get(month)!;
                entry.totalAmount = Number(total);
                entry.count = Number(count);
            }
        }

        return Array.from(statsMap.values());
    } catch (error) {
        console.error('Failed to fetch fine stats:', error);
        return [];
    }
}

export async function getDistinctActs() {
    try {
        const rows = await query<{ act_name: string }[]>('SELECT DISTINCT act_name FROM investigation_fines ORDER BY act_name ASC');
        return rows.map(r => r.act_name as string);
    } catch (e) {
        console.error('Failed to get acts:', e);
        return [];
    }

}

export async function getDistinctSections(actName?: string) {
    try {
        let sql = 'SELECT DISTINCT section_name FROM investigation_fines';
        const params: string[] = [];

        if (actName && actName !== 'ALL') {
            sql += ' WHERE act_name = ?';
            params.push(actName);
        }

        sql += ' ORDER BY section_name ASC';

        const rows = await query<{ section_name: string }[]>(sql, params);
        return rows.map(r => r.section_name as string);
    } catch (e) {
        console.error('Failed to get sections:', e);
        return [];
    }
}

export type OfficerPerformanceStats = {
    officerId: number;
    officerName: string;
    avgDays: number;
    totalCases: number;
    pendingCount: number;
};

export async function getOfficerPerformanceStats(endDateStr?: string): Promise<OfficerPerformanceStats[]> {
    try {
        const now = new Date();
        let endObj = now;

        if (endDateStr) {
            const [y, m] = endDateStr.split('-');
            endObj = new Date(parseInt(y), parseInt(m), 0, 23, 59, 59);
        }

        // Calculate start date (12 months ago)
        const currentY = endObj.getFullYear();
        const currentM = endObj.getMonth();
        let startY = currentY;
        let startM = currentM - 11;
        while (startM < 0) {
            startM += 12;
            startY -= 1;
        }
        const startKey = `${startY}-${String(startM + 1).padStart(2, '0')}`;
        const endKey = `${currentY}-${String(currentM + 1).padStart(2, '0')}`;

        // SQL Query
        // Calculate days duration:
        // If investigation_date exists -> DATEDIFF(investigation_date, received_date)
        // If not tested yet -> DATEDIFF(NOW(), received_date)
        // Use received_date if creating report, fallback to created_at
        const sql = `
            SELECT 
                u.id as officerId,
                u.full_name as officerName,
                u.username,
                AVG(
                    CASE 
                        WHEN c.investigation_date IS NOT NULL THEN DATEDIFF(c.investigation_date, COALESCE(c.received_date, c.created_at))
                        ELSE DATEDIFF(NOW(), COALESCE(c.received_date, c.created_at))
                    END
                ) as avgDays,
                COUNT(c.id) as totalCases,
                SUM(CASE WHEN c.status = 'PENDING' OR (c.status = 'IN_PROGRESS' AND c.investigation_date IS NULL) THEN 1 ELSE 0 END) as pendingCount
            FROM complaints c
            JOIN users u ON c.responsible_person_id = u.id
            WHERE 
                DATE_FORMAT(COALESCE(c.received_date, c.created_at), '%Y-%m') >= ? 
                AND DATE_FORMAT(COALESCE(c.received_date, c.created_at), '%Y-%m') <= ?
                AND c.status != 'REJECTED'
            GROUP BY u.id, u.full_name, u.username
            ORDER BY avgDays DESC
        `;

        const rows = await query<{ officerId: number; officerName: string; username: string; avgDays: number | string | null; totalCases: number | string; pendingCount: number | string }[]>(sql, [startKey, endKey]);

        return rows.map(row => ({
            officerId: row.officerId,
            officerName: row.officerName || row.username, // Fallback if full_name is null
            avgDays: Number(row.avgDays || 0),
            totalCases: Number(row.totalCases),
            pendingCount: Number(row.pendingCount || 0)
        }));

    } catch (error) {
        console.error('Failed to fetch officer stats:', error);
        return [];
    }
}

export type GroupPerformanceStats = {
    avgDays: number;
    totalCases: number;
};

export async function getGroupPerformanceStats(timeRange: 'ALL' | '12_MONTHS'): Promise<GroupPerformanceStats> {
    try {
        let sql = `
            SELECT 
                AVG(
                    CASE 
                        WHEN investigation_date IS NOT NULL THEN DATEDIFF(investigation_date, COALESCE(received_date, created_at))
                        ELSE DATEDIFF(NOW(), COALESCE(received_date, created_at))
                    END
                ) as avgDays,
                COUNT(id) as totalCases
            FROM complaints
            WHERE status != 'REJECTED'
        `;

        const params: string[] = [];

        if (timeRange === '12_MONTHS') {
            const now = new Date();
            // 12 months ago from 1st of current month (to match other stats) or just raw Date?
            // User likely expects "Last 12 Months", let's use the same logic as other charts: past 12 full months + current partial month?
            // Or simpler: >= 1 year ago. Let's use 1 year ago for simplicity and consistency with "last 12 months" label.
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(now.getFullYear() - 1);

            sql += ` AND (COALESCE(received_date, created_at) >= ?)`;
            params.push(oneYearAgo.toISOString().split('T')[0]); // YYYY-MM-DD
        }

        const rows = await query<{ avgDays: number | string | null; totalCases: number | string }[]>(sql, params);

        if (rows.length > 0) {
            return {
                avgDays: Number(rows[0].avgDays || 0),
                totalCases: Number(rows[0].totalCases || 0)
            };
        }

        return { avgDays: 0, totalCases: 0 };

    } catch (e) {
        console.error('Failed to get group stats:', e);
        return { avgDays: 0, totalCases: 0 };
    }
}
