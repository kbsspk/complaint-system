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
        console.log('Creating investigation_fines table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS investigation_fines (
                id INT AUTO_INCREMENT PRIMARY KEY,
                complaint_id INT NOT NULL,
                act_name VARCHAR(255) NOT NULL,
                section_name VARCHAR(255) NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
            )
        `);
        console.log('Table investigation_fines created successfully.');
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        await connection.end();
    }
}

migrate();
