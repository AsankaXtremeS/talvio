import dotenv from "dotenv"

dotenv.config()

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing")
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing")
}

if (!process.env.JWT_REFRESH_SECRET) {
  throw new Error("JWT_REFRESH_SECRET is missing")
}

if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  throw new Error("SMTP_HOST, SMTP_USER, and SMTP_PASS are required for email delivery")
}

export const env = {
  PORT: process.env.PORT || 8000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  NODE_ENV: process.env.NODE_ENV || "development",
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT || "587",
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM || "noreply@talvio.com",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",

  // OAuth credentials
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:8000",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID,
  LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET,
}
