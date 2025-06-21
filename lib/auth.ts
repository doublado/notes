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
            console.log('🔐 PASSWORD RESET EMAIL SENT:')
            console.log('📧 To:', user.email)
            console.log('👤 User:', user.name)
            console.log('🔗 Reset URL:', url)
            console.log('🔑 Token:', token)
            console.log('⏰ Expires in: 1 hour')
            console.log('---')
            // In a real implementation, you would send an email here
            // For testing, we'll just log the details
            // Example: await sendEmail({
            //   to: user.email,
            //   subject: "Reset your password",
            //   text: `Click the link to reset your password: ${url}`,
            // });
        },
        resetPasswordTokenExpiresIn: 3600,
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url, token }) => {
            console.log('✅ EMAIL VERIFICATION SENT:')
            console.log('📧 To:', user.email)
            console.log('👤 User:', user.name)
            console.log('🔗 Verification URL:', url)
            console.log('🔑 Token:', token)
            console.log('⏰ Expires in: 1 hour')
            console.log('---')
            // In a real implementation, you would send an email here
            // For testing, we'll just log the details
            // Example: await sendEmail({
            //   to: user.email,
            //   subject: "Verify your email address",
            //   text: `Click the link to verify your email: ${url}`,
            // });
        },
        sendOnSignUp: true,
		autoSignInAfterVerification: true,
        expiresIn: 3600,
    },
})
