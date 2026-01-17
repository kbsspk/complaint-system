const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function viewData() {
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
        console.log('\nFetching last 5 complaints...');
        const [rows] = await connection.query(`
            SELECT id, complaint_number, status, created_at, is_safety_health_related 
            FROM complaints 
            ORDER BY id DESC 
            LIMIT 5
        `);
        console.table(rows);

        console.log('\nFull details of the latest complaint:');
        if (rows.length > 0) {
            console.log(JSON.stringify(rows[0], null, 2));
        }

    } catch (e) {
        console.error('Error fetching data:', e);
    } finally {
        await connection.end();
    }
}

viewData();
