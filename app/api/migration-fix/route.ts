import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        try {
            await query(`ALTER TABLE complaints ADD COLUMN response_letter_file TEXT NULL`);
        } catch (e) {
            const err = e as { code?: string };
            if (err.code !== 'ER_DUP_FIELDNAME') throw e;
        }

        try {
            await query(`ALTER TABLE complaints ADD COLUMN action_evidence_file TEXT NULL`);
        } catch (e) {
            const err = e as { code?: string };
            if (err.code !== 'ER_DUP_FIELDNAME') throw e;
        }

        return NextResponse.json({ success: true, message: 'Migration completed successfully' });
    } catch (e) {
        const err = e as Error;
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
