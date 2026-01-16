const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        console.log('Adding is_safety_health_related column...');
        await connection.execute(`
            ALTER TABLE complaints 
            ADD COLUMN is_safety_health_related BOOLEAN DEFAULT FALSE
        `);
        console.log('Column added successfully.');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists.');
        } else {
            console.error('Migration failed:', e);
        }
    } finally {
        await connection.end();
    }
}

migrate();
