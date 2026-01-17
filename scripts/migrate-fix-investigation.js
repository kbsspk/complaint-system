const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    console.log('Starting migration: Fix Investigation Tables and Enums...');

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
        console.log('1. Creating investigation_fines table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS investigation_fines (
                id int(11) NOT NULL AUTO_INCREMENT,
                complaint_id int(11) NOT NULL,
                act_name varchar(255) DEFAULT NULL,
                section_name varchar(255) DEFAULT NULL,
                amount decimal(10,2) DEFAULT NULL,
                created_at timestamp NOT NULL DEFAULT current_timestamp(),
                PRIMARY KEY (id),
                KEY complaint_id (complaint_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);
        console.log('   - Table investigation_fines created/verified.');

        console.log('2. Updating legal_action_status ENUM...');
        // The error "Data truncated" happens because 'FINE' or 'PROSECUTION' are not in the old ENUM.
        // Old: enum('NONE','WAITING_COMMITTEE','IN_PROGRESS','COMPLETED')
        // New: enum('NONE','FINE','PROSECUTION','WAITING_COMMITTEE','IN_PROGRESS','COMPLETED')
        // We preserve old values just in case data exists, but add new ones.
        await connection.query(`
            ALTER TABLE complaints 
            MODIFY COLUMN legal_action_status 
            enum('NONE','FINE','PROSECUTION','WAITING_COMMITTEE','IN_PROGRESS','COMPLETED') 
            DEFAULT NULL;
        `);
        console.log('   - Column legal_action_status updated.');

        console.log('Migration successful!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await connection.end();
    }
}

migrate();
