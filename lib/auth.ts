import { betterAuth } from "better-auth";
import { createPool } from "mysql2/promise";
 
export const auth = betterAuth({
    database: createPool({
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "notes",
        connectionLimit: 10,
        waitForConnections: true,
        queueLimit: 0,
    }),
    emailAndPassword: {
        enabled: true,
    }
})
