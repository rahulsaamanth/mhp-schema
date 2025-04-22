import { db, sql } from "./db"
import * as schema from "./schema"
import fs from "fs"
import path from "path"

async function exportTable(tableName: string, tableSchema: any) {
  try {
    const data = await db.select().from(tableSchema)
    console.log(`Exported ${data.length} records from ${tableName}`)
    return data
  } catch (error) {
    console.error(`Error exporting ${tableName}:`, error)
    return []
  }
}

async function createBackup() {
  console.log("Starting database backup export...")

  // Create a container for all data
  const exportData: Record<string, any[]> = {}

  try {
    // Export tables in dependency order

    // Tables with no dependencies
    exportData.categories = await exportTable("category", schema.category)
    exportData.manufacturers = await exportTable(
      "manufacturer",
      schema.manufacturer
    )
    exportData.users = await exportTable("user", schema.user)

    // Tables with simple dependencies
    exportData.products = await exportTable("product", schema.product)
    exportData.addresses = await exportTable("address", schema.address)
    exportData.paymentMethods = await exportTable(
      "paymentMethod",
      schema.paymentMethod
    )

    // Tables with more complex dependencies
    exportData.productVariants = await exportTable(
      "productVariant",
      schema.productVariant
    )
    exportData.orders = await exportTable("order", schema.order)

    // Tables dependent on orders or other complex tables
    exportData.orderDetails = await exportTable(
      "orderDetails",
      schema.orderDetails
    )
    exportData.reviews = await exportTable("review", schema.review)

    // Additional tables if they exist
    if (schema.cart) {
      exportData.carts = await exportTable("cart", schema.cart)
    }

    if (schema.inventoryManagement) {
      exportData.inventoryManagement = await exportTable(
        "inventoryManagement",
        schema.inventoryManagement
      )
    }

    if (schema.account) {
      exportData.accounts = await exportTable("account", schema.account)
    }

    if (schema.verificationToken) {
      exportData.verificationTokens = await exportTable(
        "verificationToken",
        schema.verificationToken
      )
    }

    if (schema.passwordResetToken) {
      exportData.passwordResetTokens = await exportTable(
        "passwordResetToken",
        schema.passwordResetToken
      )
    }

    // Create backup directory if it doesn't exist
    const backupDir = path.join(process.cwd(), "backups")
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir)
    }

    // Save the data to a JSON file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const backupPath = path.join(backupDir, `db-backup-${timestamp}.json`)

    fs.writeFileSync(backupPath, JSON.stringify(exportData, null, 2))

    console.log(`Database backup completed successfully!`)
    console.log(`Data saved to ${backupPath}`)

    return exportData
  } catch (error) {
    console.error("Error during export process:", error)
    throw error
  }
}

/**
 * Restores database from a backup file
 * @param backupFilePath - Path to the backup JSON file (optional, uses latest if not specified)
 */
async function restoreFromBackup(backupFilePath?: string) {
  try {
    // Find the backup file
    let backupData: Record<string, any[]>

    if (!backupFilePath) {
      // If no file specified, use the latest backup
      const backupDir = path.join(process.cwd(), "backups")
      if (!fs.existsSync(backupDir)) {
        throw new Error("No backups directory found")
      }

      const backupFiles = fs
        .readdirSync(backupDir)
        .filter((file) => file.startsWith("db-backup-"))
        .sort()
        .reverse()

      if (backupFiles.length === 0) {
        throw new Error("No backup files found")
      }

      backupFilePath = path.join(backupDir, backupFiles[0])
      console.log(`Using latest backup: ${backupFilePath}`)
    }

    // Load the backup data
    backupData = JSON.parse(fs.readFileSync(backupFilePath, "utf8"))

    await seedDatabase(backupData)
    console.log("Restore completed successfully!")
  } catch (error) {
    console.error("Failed to restore from backup:", error)
    throw error
  }
}

/**
 * Seeds the database with provided data
 */
async function seedDatabase(data: Record<string, any[]>) {
  try {
    console.log("Starting database seeding...")

    // Disable foreign key constraints (for PostgreSQL)
    await db.execute("SET session_replication_role = 'replica'")

    // Insert data in the correct order to handle dependencies

    // Core tables first
    await insertTableData("users", schema.user, data.users)
    await insertTableData("categories", schema.category, data.categories)
    await insertTableData(
      "manufacturers",
      schema.manufacturer,
      data.manufacturers
    )

    // Product-related tables
    await insertTableData("products", schema.product, data.products)
    await insertTableData(
      "productVariants",
      schema.productVariant,
      data.productVariants
    )

    // User-related tables
    await insertTableData("addresses", schema.address, data.addresses)
    await insertTableData(
      "paymentMethods",
      schema.paymentMethod,
      data.paymentMethods
    )

    // Order and related tables
    await insertTableData("orders", schema.order, data.orders)
    await insertTableData(
      "orderDetails",
      schema.orderDetails,
      data.orderDetails
    )

    // Additional tables
    await insertTableData("reviews", schema.review, data.reviews)

    if (schema.cart && data.carts) {
      await insertTableData("carts", schema.cart, data.carts)
    }

    if (schema.inventoryManagement && data.inventoryManagement) {
      await insertTableData(
        "inventoryManagement",
        schema.inventoryManagement,
        data.inventoryManagement
      )
    }

    if (schema.account && data.accounts) {
      await insertTableData("accounts", schema.account, data.accounts)
    }

    if (schema.verificationToken && data.verificationTokens) {
      await insertTableData(
        "verificationTokens",
        schema.verificationToken,
        data.verificationTokens
      )
    }

    if (schema.passwordResetToken && data.passwordResetTokens) {
      await insertTableData(
        "passwordResetTokens",
        schema.passwordResetToken,
        data.passwordResetTokens
      )
    }

    console.log("Database seeding completed successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
    throw error
  } finally {
    // Re-enable foreign key constraints
    await db.execute("SET session_replication_role = 'origin'")
  }
}

/**
 * Helper function to insert data into a table with batch processing
 */
async function insertTableData(
  tableName: string,
  tableSchema: any,
  data: any[] | undefined
) {
  if (!data || data.length === 0) {
    console.log(`No data to insert for ${tableName}`)
    return
  }

  try {
    console.log(`Seeding ${tableName} (${data.length} records)...`)

    // Insert in batches to prevent memory issues
    const batchSize = 100
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize)
      await db.insert(tableSchema).values(batch)
      console.log(
        `  - Inserted batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(
          data.length / batchSize
        )}`
      )
    }
  } catch (error) {
    console.error(`Error seeding ${tableName}:`, error)
    throw error
  }
}

// Command-line interface
const [command, ...args] = process.argv.slice(2)

if (command === "backup") {
  createBackup()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Backup failed:", error)
      process.exit(1)
    })
} else if (command === "restore") {
  restoreFromBackup(args[0])
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Restore failed:", error)
      process.exit(1)
    })
} else {
  console.log(`
Database Backup and Restore Utility

Usage:
  npx tsx src/seed.ts backup        # Create a new backup
  npx tsx src/seed.ts restore       # Restore from the latest backup
  npx tsx src/seed.ts restore FILE  # Restore from a specific backup file
  `)
  process.exit(0)
}

// Export functions for programmatic use
export { createBackup, restoreFromBackup, seedDatabase }
