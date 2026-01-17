const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    console.log('Testing connection...');
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USER);
    console.log('DB Name:', process.env.DB_NAME);

    const config = {
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'complaint_system',
        ssl: {
            rejectUnauthorized: false
        }
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log('Connection successful!');
        await connection.end();
    } catch (error) {
        console.error('Connection failed!');
        console.error(JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    }
}

testConnection();
