import {
  pgTable,
  varchar,
  timestamp,
  text,
  uniqueIndex,
  boolean,
  foreignKey,
  doublePrecision,
  jsonb,
  index,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core"
import type { AdapterAccountType } from "@auth/core/adapters"

const ENTITY_PREFIX = {
  USER: "USR",
  PRODUCT: "PRD",
  ORDER: "ORD",
  CATEGORY: "CAT",
  MANUFACTURER: "MFR",
  REVIEW: "REV",
  ACCOUNT: "ACC",
  VERIFICATION: "VRF",
  PASSWORD_RESET: "PWD",
  TWO_FACTOR: "2FA",
  ORDER_DETAILS: "ODT",
  ADDRESS: "ADDR",
  PAYMENT: "PYMT",
  INVENTORY: "INV",
  STORE: "STR",
  ADMIN_STORE: "ASTR",
} as const

export const customId = (name: string, prefix: string) =>
  varchar(name, { length: 32 })
    .notNull()
    .primaryKey()
    .unique()
    .$defaultFn(() => {
      const timestamp = Date.now().toString(36)
      const random = Math.random().toString(36).substring(2, 6)
      const sequence = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")
      return `${prefix}_${timestamp}${random}${sequence}`
    })

export const orderType = pgEnum("OrderType", ["OFFLINE", "ONLINE"])

export const userRole = pgEnum("UserRole", ["ADMIN", "USER", "STORE_ADMIN"])

export const movementType = pgEnum("MovementType", ["IN", "OUT", "ADJUSTMENT"])

export const deliveryStatus = pgEnum("DeliveryStatus", [
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
])

export const paymentType = pgEnum("PaymentType", [
  "CREDIT_CARD",
  "DEBIT_CARD",
  "UPI",
  "NET_BANKING",
  "WALLET",
])

export const addressType = pgEnum("AddressType", ["SHIPPING", "BILLING"])

export const productStatus = pgEnum("ProductStatus", [
  "ACTIVE",
  "DRAFT",
  "ARCHIVED",
])

export const productForm = pgEnum("ProductForm", [
  "NONE",
  "DILUTIONS(P)",
  "MOTHER_TINCTURES(Q)",
  "TRITURATIONS",
  "TABLETS",
  "GLOBULES",
  "BIO_CHEMIC",
  "BIO_COMBINATION",
  "OINTMENT",
  "GEL",
  "CREAM",
  "SYRUP/TONIC",
  "DROPS",
  "EYE_DROPS",
  "EAR_DROPS",
  "NASAL_DROPS",
  "INJECTIONS",
])

export const paymentStatus = pgEnum("PaymentStatus", [
  "PENDING",
  "AUTHORIZED",
  "PAID",
  "FAILED",
  "REFUNDED",
])

export const unitOfMeasure = pgEnum("UnitOfMeasure", [
  "NONE",
  "TABLETS",
  "ML",
  "GM(s)",
  "DROPS",
  "AMPOULES",
])

export const potency = pgEnum("potency", [
  "NONE",
  "1X",
  "2X",
  "3X",
  "6X",
  "12X",
  "30X",
  "200X",
  "3C",
  "6C",
  "12C",
  "30C",
  "200C",
  "1M",
  "10M",
  "50M",
  "CM",
  "3CH",
  "6CH",
  "9CH",
  "12CH",
  "15CH",
  "30CH",
  "200CH",
  "1M CH",
  "10M CH",
  "50M CH",
  "CM CH",
  "Q",
  "LM1",
  "LM2",
  "LM3",
  "LM4",
  "LM5",
  "LM6",
  "LM7",
  "LM8",
  "LM9",
  "LM10",
  "LM11",
  "LM12",
  "LM13",
  "LM14",
  "LM15",
  "LM16",
  "LM17",
  "LM18",
  "LM19",
  "LM20",
  "LM21",
  "LM22",
  "LM23",
  "LM24",
  "LM25",
  "LM26",
  "LM27",
  "LM28",
  "LM29",
  "LM30",
  "LM50",
])

export const discountType = pgEnum("discountType", ["PERCENTAGE", "FIXED"])

export type UserRole = (typeof userRole.enumValues)[number]

export type User = typeof user.$inferSelect
export type Order = typeof order.$inferSelect
export type Product = typeof product.$inferSelect

export type Category = typeof category.$inferSelect
export type Variant = typeof productVariant.$inferSelect
export type Manufacturer = typeof manufacturer.$inferSelect
export type Tag = typeof tag.$inferSelect
export type Store = typeof store.$inferSelect
export type AdminStoreAccess = typeof adminStoreAccess.$inferSelect
export type AdminStoreSession = typeof adminStoreSession.$inferSelect
export type ProductInventory = typeof productInventory.$inferSelect

export const store = pgTable(
  "Store",
  {
    id: customId("id", ENTITY_PREFIX.STORE),
    name: text("name").notNull(),
    code: varchar("code", { length: 30 }).notNull().unique(),
    location: text("location").notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_store_name").on(table.name),
    index("idx_store_code").on(table.code),
    index("idx_store_active").on(table.isActive),
  ]
)

export const adminStoreAccess = pgTable(
  "AdminStoreAccess",
  {
    id: customId("id", ENTITY_PREFIX.ADMIN_STORE),
    userId: varchar("userId", { length: 32 }).notNull(),
    storeId: varchar("storeId", { length: 32 }).notNull(),
    canManageInventory: boolean("canManageInventory").default(true).notNull(),
    canManageOrders: boolean("canManageOrders").default(true).notNull(),
    canViewAnalytics: boolean("canViewAnalytics").default(true).notNull(),
    canManageProducts: boolean("canManageProducts").default(true).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "AdminStoreAccess_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.storeId],
      foreignColumns: [store.id],
      name: "AdminStoreAccess_storeId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    uniqueIndex("idx_admin_store_unique").on(table.userId, table.storeId),
    index("idx_admin_store_user").on(table.userId),
    index("idx_admin_store_store").on(table.storeId),
  ]
)

export const adminStoreSession = pgTable(
  "AdminStoreSession",
  {
    id: customId("id", "ASS"),
    userId: varchar("userId", { length: 32 }).notNull(),
    storeId: varchar("storeId", { length: 32 }).notNull(),
    lastAccessed: timestamp("lastAccessed", { mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "AdminStoreSession_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.storeId],
      foreignColumns: [store.id],
      name: "AdminStoreSession_storeId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    uniqueIndex("idx_admin_store_session_unique").on(table.userId),
  ]
)

export const verificationToken = pgTable(
  "VerificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("VerificationToken_token_key").using(
      "btree",
      table.token.asc().nullsLast()
    ),
  ]
)

export const passwordResetToken = pgTable(
  "PasswordResetToken",
  {
    id: customId("id", ENTITY_PREFIX.PASSWORD_RESET),
    email: text("email").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("PasswordResetToken_email_token_key").using(
      "btree",
      table.email.asc().nullsLast(),
      table.token.asc().nullsLast()
    ),
    uniqueIndex("PasswordResetToken_token_key").using(
      "btree",
      table.token.asc().nullsLast()
    ),
  ]
)

export const twoFactorToken = pgTable(
  "TwoFactorToken",
  {
    id: customId("id", ENTITY_PREFIX.TWO_FACTOR),
    email: text("email").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("TwoFactorToken_email_token_key").using(
      "btree",
      table.email.asc().nullsLast()
    ),
    uniqueIndex("TwoFactorToken_token_key").using(
      "btree",
      table.token.asc().nullsLast()
    ),
  ]
)

export const user = pgTable(
  "User",
  {
    id: customId("id", ENTITY_PREFIX.USER),
    name: text("name"),
    email: text("email"),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    password: text("password"),
    role: userRole("role").default("USER").notNull(),
    lastActive: timestamp("lastActive", { mode: "date" })
      .defaultNow()
      .notNull(),
    isTwoFactorEnabled: boolean("isTwoFactorEnabled").default(false).notNull(),
    phone: text("phone"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("User_email_key").using("btree", table.email.asc().nullsLast()),
  ]
)

export const account = pgTable(
  "Account",
  {
    id: customId("id", ENTITY_PREFIX.ACCOUNT),
    userId: varchar("userId", { length: 32 }).notNull(),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [
    uniqueIndex("Account_provider_providerAccountId_key").using(
      "btree",
      table.provider.asc().nullsLast(),
      table.providerAccountId.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "Account_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
)

export const session = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const twoFactorConfirmation = pgTable(
  "TwoFactorConfirmation",
  {
    id: customId("id", ENTITY_PREFIX.TWO_FACTOR),
    userId: varchar("userId", { length: 32 }).notNull(),
  },
  (table) => [
    uniqueIndex("TwoFactorConfirmation_userId_key").using(
      "btree",
      table.userId.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "TwoFactorConfirmation_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
)

export const category = pgTable(
  "Category",
  {
    id: customId("id", ENTITY_PREFIX.CATEGORY),
    name: text("name").notNull(),
    parentId: varchar("parentId", { length: 32 }),
    path: text("path").notNull().default(""),
    pathIds: text("pathIds").array(),
    depth: integer("depth").default(0).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "Category_parentId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
    index("idx_category_tree").on(table.id, table.parentId),
    index("idx_category_parent").on(table.parentId),
    index("idx_category_path").on(table.path),
    index("idx_category_depth").on(table.depth),
  ]
)

export const manufacturer = pgTable("Manufacturer", {
  id: customId("id", ENTITY_PREFIX.MANUFACTURER),
  name: text("name").notNull(),
})

export const product = pgTable(
  "Product",
  {
    id: customId("id", ENTITY_PREFIX.PRODUCT),
    name: text("name").notNull(),
    description: text("description").notNull(),
    form: productForm("form").notNull(),
    unit: unitOfMeasure("unit").notNull(),
    status: productStatus("status").default("ACTIVE").notNull(),
    tags: text("tags").array(),
    categoryId: varchar("categoryId", { length: 32 }).notNull(),
    manufacturerId: varchar("manufacturerId", { length: 32 }).notNull(),

    isFeatured: boolean("isFeatured").default(false).notNull(),

    hsnCode: varchar("hsnCode", { length: 8 }).default("30049014"),
    tax: integer("tax").default(0).notNull(),

    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [category.id],
      name: "Product_categoryId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.manufacturerId],
      foreignColumns: [manufacturer.id],
      name: "Product_manufacturerId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    index("product_name_idx").on(table.name),
    index("product_status_idx").on(table.status),
    index("product_category_idx").on(table.categoryId),
    index("product_created_at_idx").on(table.createdAt),
    index("product_form_unit_idx").on(table.unit, table.form),
    index("product_category_status_idx").on(table.categoryId, table.status),
  ]
)

export const productVariant = pgTable(
  "ProductVariant",
  {
    id: customId("id", ENTITY_PREFIX.PRODUCT + "VAR"),
    discontinued: boolean("discontinued").default(false),
    productId: varchar("productId", { length: 32 }).notNull(),
    sku: varchar("sku", { length: 50 }).notNull().unique(),
    variantName: text("variantName").notNull(),
    variantImage: text("variantImage").array(),
    potency: potency("potency").default("NONE").notNull(),
    packSize: integer("packSize"),

    costPrice: doublePrecision("costPrice"),
    mrp: doublePrecision("mrp").notNull(),

    discount: integer("discount").default(0),
    discountType: discountType("discountType").default("PERCENTAGE"),
    sellingPrice: doublePrecision("sellingPrice").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    foreignKey({
      columns: [table.productId],
      foreignColumns: [product.id],
      name: "ProductVariant_productId_fkey",
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("idx_variant_sku").on(table.sku),
    // Removing index on stockByLocation
    index("idx_variant_search").on(
      table.productId,
      table.potency,
      table.packSize
    ),
    index("idx_variant_price").on(table.sellingPrice, table.mrp),
    index("idx_variant_potency").on(table.potency),
    index("idx_variant_discount").on(table.discount),
  ]
)

export const productInventory = pgTable(
  "ProductInventory",
  {
    id: customId("id", ENTITY_PREFIX.INVENTORY + "STOCK"),
    productVariantId: varchar("productVariantId", { length: 32 }).notNull(),
    storeId: varchar("storeId", { length: 32 }).notNull(),
    stock: integer("stock").notNull().default(0),
    lowStockThreshold: integer("lowStockThreshold").default(5),
    reservedStock: integer("reservedStock").default(0),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    foreignKey({
      columns: [table.productVariantId],
      foreignColumns: [productVariant.id],
      name: "ProductInventory_variantId_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.storeId],
      foreignColumns: [store.id],
      name: "ProductInventory_storeId_fkey",
    }).onDelete("cascade"),
    uniqueIndex("idx_product_inventory_unique").on(
      table.productVariantId,
      table.storeId
    ),
    index("idx_product_inventory_variant").on(table.productVariantId),
    index("idx_product_inventory_store").on(table.storeId),
    index("idx_product_inventory_stock").on(table.stock),
    index("idx_product_inventory_lowstock").on(
      table.stock,
      table.lowStockThreshold
    ),
  ]
)

export const paymentMethod = pgTable(
  "PaymentMethod",
  {
    id: customId("id", ENTITY_PREFIX.PAYMENT),
    userId: varchar("userId", { length: 32 }).notNull(),
    paymentType: paymentType("paymentType").notNull(),
    isDefault: boolean("isDefault").default(false).notNull(),
    paymentDetails: jsonb("paymentDetails").notNull(),
    displayDetails: jsonb("displayDetails").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "PaymentMethod_userId_fkey",
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("PaymentMethod_userId_index").on(table.userId),
  ]
)

export const order = pgTable(
  "Order",
  {
    id: customId("id", ENTITY_PREFIX.ORDER),
    userId: varchar("userId", { length: 32 }),

    customerName: text("customerName"),
    customerPhone: text("customerPhone"),
    customerEmail: text("customerEmail"),
    isGuestOrder: boolean("isGuestOrder").default(false).notNull(),

    storeId: varchar("storeId", { length: 32 }),

    orderDate: timestamp("orderDate", {
      mode: "date",
    })
      .defaultNow()
      .notNull(),

    subtotal: doublePrecision("subtotal").notNull(),
    shippingCost: doublePrecision("shippingCost").default(0).notNull(),
    discount: doublePrecision("discount").default(0).notNull(),
    tax: doublePrecision("tax").default(0).notNull(),
    totalAmountPaid: doublePrecision("totalAmountPaid").notNull(),

    orderType: orderType("orderType").default("ONLINE").notNull(),
    deliveryStatus: deliveryStatus("deliveryStatus")
      .default("PROCESSING")
      .notNull(),
    shippingAddressId: varchar("shippingAddressId", { length: 32 }).notNull(),
    billingAddressId: varchar("billingAddressId", { length: 32 }).notNull(),

    paymentStatus: paymentStatus("paymentStatus").default("PENDING").notNull(),
    paymentIntentId: varchar("paymentIntentId", { length: 100 }),
    invoiceNumber: varchar("invoiceNumber", { length: 50 }),

    customerNotes: text("customerNotes"),
    adminNotes: text("adminNotes"),
    cancellationReason: text("cancellationReason"),

    estimatedDeliveryDate: timestamp("estimatedDeliveryDate", { mode: "date" }),
    deliveredAt: timestamp("deliveredAt", { mode: "date" }),
    // payment method is mandatory, but not required for now.
    paymentMethodId: varchar("paymentMethodId", { length: 32 }),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "Order_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.shippingAddressId],
      foreignColumns: [address.id],
      name: "Order_shippingAddress_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.billingAddressId],
      foreignColumns: [address.id],
      name: "Order_billingAddress_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.paymentMethodId],
      foreignColumns: [paymentMethod.id],
      name: "Order_paymentMethod_fkey",
    }),
    foreignKey({
      columns: [table.storeId],
      foreignColumns: [store.id],
      name: "Order_storeId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
    index("order_store_idx").on(table.storeId),
    index("order_date_status_idx").on(table.orderDate, table.deliveryStatus),
    index("order_user_date_idx").on(table.userId, table.orderDate),
    index("order_payment_status_idx").on(table.paymentStatus),
    index("order_invoice_number_idx").on(table.invoiceNumber),
    index("order_payment_delivery_status_idx").on(
      table.paymentStatus,
      table.deliveryStatus
    ),
  ]
)

export const orderDetails = pgTable(
  "OrderDetails",
  {
    id: customId("id", ENTITY_PREFIX.ORDER_DETAILS),
    orderId: varchar("orderId", { length: 32 }).notNull(),
    productVariantId: varchar("productVariantId", { length: 32 }).notNull(),
    originalPrice: doublePrecision("originalPrice").notNull(),
    discountAmount: doublePrecision("discountAmount").default(0).notNull(),
    taxAmount: doublePrecision("taxAmount").default(0).notNull(),
    unitPrice: doublePrecision("unitPrice").notNull(),
    quantity: integer("quantity").notNull(),

    itemStatus: deliveryStatus("itemStatus").default("PROCESSING").notNull(),
    returnReason: text("returnReason"),
    returnedAt: timestamp("returnedAt", { mode: "date" }),
    refundAmount: doublePrecision("refundAmount"),

    fulfilledFromStoreId: varchar("fulfilledFromStoreId", { length: 32 }),
  },
  (table) => [
    foreignKey({
      columns: [table.orderId],
      foreignColumns: [order.id],
      name: "OrderDetails_orderId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.productVariantId],
      foreignColumns: [productVariant.id],
      name: "OrderDetails_productVariantId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),

    index("order_details_fulfillment_idx").on(table.fulfilledFromStoreId),
  ]
)

export const review = pgTable(
  "Review",
  {
    id: customId("id", ENTITY_PREFIX.REVIEW),
    rating: doublePrecision("rating").default(0).notNull(),
    comment: text("comment"),
    userId: varchar("userId", { length: 32 }).notNull(),
    productId: varchar("productId", { length: 32 }).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "Review_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.productId],
      foreignColumns: [product.id],
      name: "Review_productId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    index("review_rating_idx").on(table.rating),
    index("review_product_date_idx").on(table.productId, table.createdAt),
  ]
)

export const address = pgTable(
  "Address",
  {
    id: customId("id", ENTITY_PREFIX.ADDRESS),
    userId: varchar("userId", { length: 32 }).notNull(),
    street: varchar("street", { length: 255 }).notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    state: varchar("state", { length: 100 }).notNull(),
    postalCode: varchar("postalCode", { length: 10 }).notNull(),
    country: varchar("country", { length: 50 }).default("India").notNull(),
    type: addressType("addressType").default("SHIPPING").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "Address_userId_fkey",
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("Adress_userId_index").on(table.userId),
  ]
)

export const inventoryManagement = pgTable(
  "InventoryManagement",
  {
    id: customId("id", ENTITY_PREFIX.INVENTORY),
    productVariantId: varchar("productVariantId", { length: 32 }).notNull(),
    orderId: varchar("orderId", { length: 32 }),
    type: movementType("type").notNull(),
    quantity: integer("quantity").notNull(),
    reason: text("reason").notNull(),
    storeId: varchar("storeId", { length: 32 }).notNull(),
    previousStock: integer("previousStock").notNull(),
    newStock: integer("newStock").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    createdBy: varchar("createdBy", { length: 32 }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.productVariantId],
      foreignColumns: [productVariant.id],
    })
      .onDelete("restrict")
      .onUpdate("cascade"),
    foreignKey({
      columns: [table.orderId],
      foreignColumns: [order.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),

    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [user.id],
    })
      .onDelete("restrict")
      .onUpdate("cascade"),

    index("idx_inventory_movement_variant").on(table.productVariantId),
    index("idx_inventory_movement_date").on(table.createdAt),
    index("idx_inventory_movement_order").on(table.orderId),
    index("idx_inventory_movement_storeId").on(table.storeId),
  ]
)

export const tag = pgTable("Tags", {
  id: customId("id", "TAG"),
  name: text("name").notNull(),
})

export const cart = pgTable(
  "Cart",
  {
    id: customId("id", "CRT"),
    userId: varchar("userId", { length: 32 }).notNull(),
    productId: varchar("productId", { length: 32 }).notNull(),
    variantId: varchar("productVariantId", { length: 32 }).notNull(),
    quantity: integer("quantity").default(1).notNull(),
    potency: text("potency"),
    packSize: text("packSize"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "Cart_userId_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.productId],
      foreignColumns: [product.id],
      name: "Cart_productId_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.variantId],
      foreignColumns: [productVariant.id],
      name: "Cart_productVariantId_fkey",
    }).onDelete("cascade"),
    index("idx_cart_userId").on(table.userId),
    index("idx_cart_variant").on(table.variantId),
    uniqueIndex("idx_cart_unique_item").on(
      table.userId,
      table.variantId,
      table.potency,
      table.packSize
    ),
  ]
)
