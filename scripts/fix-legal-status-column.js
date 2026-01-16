const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function fixSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        console.log('Modifying legal_action_status column to VARCHAR(50)...');
        // Altering column to VARCHAR to accommodate 'FINE', 'PROSECUTION' and existing values
        await connection.query("ALTER TABLE complaints MODIFY COLUMN legal_action_status VARCHAR(50) DEFAULT 'NONE'");
        console.log('Success: Column modified.');

        // Verify
        const [cols] = await connection.query('SHOW COLUMNS FROM complaints LIKE "legal_action_status"');
        console.log('New Column Definition:', cols);

    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        await connection.end();
    }
}

fixSchema();
