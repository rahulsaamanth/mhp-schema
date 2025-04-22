import { neon, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"
import * as relations from "./relations"
import dotenv from "dotenv"

// Load environment variables from .env file
dotenv.config()

// Configure neon

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

// Create SQL client
const sql = neon(process.env.DATABASE_URL)

// Create drizzle database instance with your schema
export const db = drizzle(sql, {
  schema: { ...schema, ...relations },
  // logger: true,
})

export { sql }
