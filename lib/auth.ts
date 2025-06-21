import { betterAuth } from "better-auth";
import { createPool } from "mysql2/promise";
 
export const auth = betterAuth({
    baseURL: process.env.BASE_URL || "http://localhost:3000",
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
        disableSignUp: false,
        requireEmailVerification: true,
        minPasswordLength: 8,
        maxPasswordLength: 128,
        autoSignIn: true,
        sendResetPassword: async ({ user, url, token }) => {
            // Logging for development/testing
            // TODO: replace with actual email service in production
            console.log('🔐 PASSWORD RESET EMAIL SENT:')
            console.log('📧 To:', user.email)
            console.log('👤 User:', user.name)
            console.log('🔗 Reset URL:', url)
            console.log('🔑 Token:', token)
            console.log('⏰ Expires in: 1 hour')
            console.log('---')
        },
        resetPasswordTokenExpiresIn: 3600,
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url, token }) => {
            // Logging for development/testing
            // TODO: replace with actual email service in production
            console.log('✅ EMAIL VERIFICATION SENT:')
            console.log('📧 To:', user.email)
            console.log('👤 User:', user.name)
            console.log('🔗 Verification URL:', url)
            console.log('🔑 Token:', token)
            console.log('⏰ Expires in: 1 hour')
            console.log('---')
        },
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        expiresIn: 3600,
        callbackURL: '/dashboard',
    },
})
