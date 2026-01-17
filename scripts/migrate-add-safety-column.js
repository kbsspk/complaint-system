const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    console.log('Starting migration: Add is_safety_health_related column...');

    const isLocal = (process.env.DB_HOST === '127.0.0.1' || process.env.DB_HOST === 'localhost');
    const sslConfig = isLocal ? undefined : { rejectUnauthorized: false };

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        ssl: sslConfig
    });

    try {
        await connection.query(`USE \`${process.env.DB_NAME || 'complaint_system'}\``);
        await connection.query(`
            ALTER TABLE complaints 
            ADD COLUMN is_safety_health_related tinyint(1) DEFAULT 0;
        `);
        console.log('Migration successful: Column added.');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Migration skipped: Column already exists.');
        } else {
            console.error('Migration failed:', error);
        }
    } finally {
        await connection.end();
    }
}

migrate();
