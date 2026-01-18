const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: process.env.DB_HOST !== '127.0.0.1' ? { rejectUnauthorized: false } : undefined
    });

    try {
        console.log('Updating NULL channels to ONLINE...');
        const [result] = await connection.query(`
            UPDATE complaints 
            SET channel = 'ONLINE' 
            WHERE channel IS NULL OR channel = ''
        `);
        console.log(`Updated ${result.affectedRows} rows.`);
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await connection.end();
    }
}

migrate();
