import mysql from 'mysql2/promise';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cachedConnection: mysql.Pool | undefined = (global as any).mysql;

if (!cachedConnection) {
    cachedConnection = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: {
            rejectUnauthorized: false
        }
    });
    if (process.env.NODE_ENV !== 'production') {
        (global as any).mysql = cachedConnection;
    }
}

export const db = cachedConnection;

export async function query(sql: string, params: any[] = []) {
    try {
        const [results] = await db.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch data');
    }
}
