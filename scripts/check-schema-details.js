const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkSchema() {
    console.log('Connecting to database...');
    const isLocal = (process.env.DB_HOST === '127.0.0.1' || process.env.DB_HOST === 'localhost');
    const sslConfig = isLocal ? undefined : { rejectUnauthorized: false };

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'complaint_system',
        ssl: sslConfig
    });

    try {
        console.log('Connected to:', process.env.DB_HOST);

        // Check Enum
        const [rows] = await connection.query('DESCRIBE complaints');
        const legalCol = rows.find(r => r.Field === 'legal_action_status');
        console.log('legal_action_status Type:', legalCol ? legalCol.Type : 'MISSING');

        // Check Table
        const [tables] = await connection.query("SHOW TABLES LIKE 'investigation_fines'");
        console.log('investigation_fines table:', tables.length > 0 ? 'EXISTS' : 'MISSING');

    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

checkSchema();
