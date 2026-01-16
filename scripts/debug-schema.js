const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkSchema() {
    console.log('Connecting to DB...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        console.log('\n--- complaints table ---');
        const [complaintsCols] = await connection.query('SHOW COLUMNS FROM complaints LIKE "legal_action_status"');
        console.log(complaintsCols);

        console.log('\n--- investigation_fines table ---');
        try {
            const [finesCols] = await connection.query('SHOW COLUMNS FROM investigation_fines');
            console.log(finesCols);

            const [rows] = await connection.query('SELECT * FROM investigation_fines');
            console.log('\nFines Data Count:', rows.length);
        } catch (e) {
            console.log('Error checking investigation_fines:', e.message);
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await connection.end();
    }
}

checkSchema();
