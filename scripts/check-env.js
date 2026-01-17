const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
    console.log('--- ENV CHECK ---');
    console.log('DB_HOST:', process.env.DB_HOST ? 'Set' : 'Unset', '(' + (process.env.DB_HOST || 'default') + ')');
    console.log('DB_USER:', process.env.DB_USER ? 'Set' : 'Unset');

    // Try without SSL
    console.log('\n--- CONNECTION TEST (NO SSL) ---');
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'complaint_system'
        });
        console.log('SUCCESS: Connected without SSL');
        await connection.end();
        return;
    } catch (e) {
        console.log('FAILED (No SSL):', e.code);
    }

    // Try with SSL
    console.log('\n--- CONNECTION TEST (WITH SSL) ---');
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'complaint_system',
            ssl: { rejectUnauthorized: false }
        });
        console.log('SUCCESS: Connected with SSL');
        await connection.end();
    } catch (e) {
        console.log('FAILED (With SSL):', e.code);
    }
}

check();
