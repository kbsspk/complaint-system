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
        const col = rows.find(r => r.Field === 'is_safety_health_related');
        if (col) {
            console.log('Column FOUND:', col);
        } else {
            console.log('Column NOT FOUND');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

checkSchema();
