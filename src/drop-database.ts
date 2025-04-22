import { neon } from "@neondatabase/serverless"

import "dotenv/config"

const sql = neon(process.env.DATABASE_URL!)

async function dropDatabase() {
  try {
    // Drop all tables first
    await sql`
        DO $$ 
        DECLARE 
            r RECORD;
        BEGIN
            FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
            END LOOP;
        END $$;
      `

    // Drop all types
    await sql`
        DO $$ 
        DECLARE 
            r RECORD;
        BEGIN
            FOR r IN (SELECT typname FROM pg_type 
                WHERE typnamespace = 'public'::regnamespace 
                AND typtype = 'e') LOOP
                EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
            END LOOP;
        END $$;
      `

    console.log("Successfully dropped all tables and types")
  } catch (error) {
    console.error("Error dropping database:", error)
  } finally {
    process.exit(0)
  }
}

dropDatabase()
