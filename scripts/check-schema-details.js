const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'complaint_system'
    });

    console.log('Connected to:', process.env.DB_HOST);
    try {
        const [rows] = await connection.query('DESCRIBE complaints');
        const fields = ['investigation_date', 'is_guilty', 'legal_action_status', 'response_doc_number', 'response_doc_date'];

        console.log('--- Checking Investigation Columns ---');
        fields.forEach(field => {
            const found = rows.find(r => r.Field === field);
            console.log(`${field}: ${found ? 'FOUND' : 'MISSING'}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

checkSchema();
