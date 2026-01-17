import mysql from 'mysql2/promise';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface CustomGlobal extends Global {
    mysql: mysql.Pool | undefined;
}

declare const global: CustomGlobal;

let cachedConnection: mysql.Pool | undefined = global.mysql;

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
        global.mysql = cachedConnection;
    }
}

export const db = cachedConnection;

export async function query<T = unknown>(sql: string, params: (string | number | boolean | null | undefined | Date)[] = []): Promise<T> {
    try {
        const [results] = await db.execute(sql, params);
        return results as T;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch data');
    }
}
