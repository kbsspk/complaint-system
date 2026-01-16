const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function setup() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Creating database if not exists...');
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'complaint_system'}\``);
        await connection.query(`USE \`${process.env.DB_NAME || 'complaint_system'}\``);

        console.log('Creating users table...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id int(11) NOT NULL AUTO_INCREMENT,
        username varchar(255) NOT NULL,
        full_name varchar(255) DEFAULT NULL,
        password_hash varchar(255) NOT NULL,
        role enum('ADMIN','OFFICIAL') NOT NULL,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        UNIQUE KEY username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);

        console.log('Creating complaints table...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id int(11) NOT NULL AUTO_INCREMENT,
        complainant_name varchar(255) NOT NULL,
        id_card varchar(13) NOT NULL,
        phone varchar(20) NOT NULL,
        product_name varchar(255) DEFAULT NULL,
        fda_number varchar(255) DEFAULT NULL,
        shop_name varchar(255) DEFAULT NULL,
        location text DEFAULT NULL,
        date_incident date DEFAULT NULL,
        damage_value varchar(255) DEFAULT NULL,
        details text NOT NULL,
        evidence_files text DEFAULT NULL,
        status enum('PENDING','RESOLVED','REJECTED','IN_PROGRESS') DEFAULT 'PENDING',
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        complaint_number varchar(100) DEFAULT NULL,
        original_doc_path varchar(255) DEFAULT NULL,
        received_date date DEFAULT NULL,
        original_doc_number varchar(100) DEFAULT NULL,
        original_doc_date date DEFAULT NULL,
        channel varchar(50) DEFAULT NULL,
        type varchar(50) DEFAULT NULL,
        district varchar(100) DEFAULT NULL,
        related_acts text DEFAULT NULL,
        responsible_person_id int(11) DEFAULT NULL,
        rejection_reason text DEFAULT NULL,
        wants_official_letter tinyint(1) DEFAULT 0,
        official_letter_method enum('EMAIL','POST') DEFAULT NULL,
        official_letter_email varchar(255) DEFAULT NULL,
        official_letter_address text DEFAULT NULL,
        investigation_date date DEFAULT NULL,
        is_guilty tinyint(1) DEFAULT NULL,
        legal_action_status enum('NONE','WAITING_COMMITTEE','IN_PROGRESS','COMPLETED') DEFAULT NULL,
        response_doc_number varchar(100) DEFAULT NULL,
        response_doc_date date DEFAULT NULL,
        investigation_details text DEFAULT NULL,
        response_letter_file text DEFAULT NULL,
        action_evidence_file text DEFAULT NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);

        // Seed Admin
        const adminPassword = 'password123';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Check if admin exists
        const [rows] = await connection.query('SELECT * FROM users WHERE username = ?', ['admin']);
        if (rows.length === 0) {
            console.log('Seeding admin user...');
            await connection.query('INSERT INTO users (username, full_name, password_hash, role) VALUES (?, ?, ?, ?)',
                ['admin', 'System Admin', hashedPassword, 'ADMIN']);
            console.log(`Admin user created. Username: admin, Password: ${adminPassword}`);
        } else {
            console.log('Admin user already exists.');
        }

        console.log('Database setup complete.');

    } catch (error) {
        console.error('Setup failed:', error);
    } finally {
        await connection.end();
    }
}

setup();
