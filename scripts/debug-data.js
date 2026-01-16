const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function debugData() {
    console.log('Connecting to DB...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        console.log('\n--- Schema Check ---');
        try {
            const [cols] = await connection.query('SHOW COLUMNS FROM complaints LIKE "legal_action_status"');
            console.log('legal_action_status column definition:', cols);
        } catch (e) {
            console.log('Could not check schema:', e.message);
        }

        console.log('\n--- Recent Complaints (last 1) ---');
        const [complaints] = await connection.query('SELECT id, legal_action_status, is_guilty FROM complaints ORDER BY id DESC LIMIT 1');
        console.log(complaints);

        if (complaints.length > 0) {
            const id = complaints[0].id;
            console.log(`\n--- Fines for Complaint #${id} ---`);
            const [fines] = await connection.query('SELECT * FROM investigation_fines WHERE complaint_id = ?', [id]);
            console.log(fines);
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await connection.end();
    }
}

debugData();
