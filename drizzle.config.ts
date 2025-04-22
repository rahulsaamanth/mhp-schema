import { defineConfig } from "drizzle-kit"
import * as dotenv from "dotenv"

dotenv.config()

export default defineConfig({
  dialect: "postgresql",
  out: "./src/migrations",
  schema: "./src/schema.ts",
  dbCredentials: {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT!),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    ssl: true,
  },
  verbose: true,
  strict: true,
})
