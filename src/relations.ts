import { relations } from "drizzle-orm/relations"
import {
  account,
  twoFactorConfirmation,
  user,
  category,
  product,
  productVariant,
  manufacturer,
  order,
  orderDetails,
  review,
  address,
  cart,
  store,
  adminStoreAccess,
  adminStoreSession,
  inventoryManagement,
  productInventory,
  discountCode,
  payment,
} from "./schema"

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  twoFactorConfirmations: many(twoFactorConfirmation),
  orders: many(order),
  reviews: many(review),
  addresses: many(address),
  cartItems: many(cart),
  adminStoreAccess: many(adminStoreAccess),
  adminStoreSessions: many(adminStoreSession),
  inventoryManagement: many(inventoryManagement),
}))

export const twoFactorConfirmationRelations = relations(
  twoFactorConfirmation,
  ({ one }) => ({
    user: one(user, {
      fields: [twoFactorConfirmation.userId],
      references: [user.id],
    }),
  })
)

export const categoryRelations = relations(category, ({ one, many }) => ({
  category: one(category, {
    fields: [category.parentId],
    references: [category.id],
    relationName: "category_parentId_category_id",
  }),
  categories: many(category, {
    relationName: "category_parentId_category_id",
  }),
  products: many(product),
}))

export const productRelations = relations(product, ({ one, many }) => ({
  category: one(category, {
    fields: [product.categoryId],
    references: [category.id],
  }),
  manufacturer: one(manufacturer, {
    fields: [product.manufacturerId],
    references: [manufacturer.id],
  }),

  reviews: many(review),
  variants: many(productVariant),
  cartItems: many(cart),
}))

export const productVariantRelations = relations(
  productVariant,
  ({ one, many }) => ({
    product: one(product, {
      fields: [productVariant.productId],
      references: [product.id],
    }),
    orderDetails: many(orderDetails),
    cartItems: many(cart),
    inventory: many(productInventory),
  })
)

export const manufacturerRelations = relations(manufacturer, ({ many }) => ({
  products: many(product),
}))

export const orderRelations = relations(order, ({ one, many }) => ({
  user: one(user, {
    fields: [order.userId],
    references: [user.id],
  }),
  orderDetails: many(orderDetails),
  address: one(address, {
    fields: [order.addressId],
    references: [address.id],
  }),
  store: one(store, {
    fields: [order.storeId],
    references: [store.id],
  }),
  discountCode: one(discountCode, {
    fields: [order.discountCodeId],
    references: [discountCode.id],
  }),
  inventoryManagement: many(inventoryManagement),
}))

export const orderDetailsRelations = relations(orderDetails, ({ one }) => ({
  order: one(order, {
    fields: [orderDetails.orderId],
    references: [order.id],
  }),
  product: one(productVariant, {
    fields: [orderDetails.productVariantId],
    references: [productVariant.id],
  }),
}))

export const reviewRelations = relations(review, ({ one }) => ({
  user: one(user, {
    fields: [review.userId],
    references: [user.id],
  }),
  product: one(product, {
    fields: [review.productId],
    references: [product.id],
  }),
}))

export const addressRelations = relations(address, ({ one, many }) => ({
  user: one(user, {
    fields: [address.userId],
    references: [user.id],
  }),
  orders: many(order, {
    relationName: "order_address",
  }),
}))

export const cartItemRelations = relations(cart, ({ one }) => ({
  user: one(user, {
    fields: [cart.userId],
    references: [user.id],
  }),
  product: one(product, {
    fields: [cart.productId],
    references: [product.id],
  }),
  variant: one(productVariant, {
    fields: [cart.variantId],
    references: [productVariant.id],
  }),
}))

// Store Relations
export const storeRelations = relations(store, ({ many }) => ({
  adminAccess: many(adminStoreAccess),
  adminSessions: many(adminStoreSession),
  orders: many(order),
  inventoryManagement: many(inventoryManagement),
  productInventory: many(productInventory),
}))

// Admin Store Access Relations
export const adminStoreAccessRelations = relations(
  adminStoreAccess,
  ({ one }) => ({
    user: one(user, {
      fields: [adminStoreAccess.userId],
      references: [user.id],
    }),
    store: one(store, {
      fields: [adminStoreAccess.storeId],
      references: [store.id],
    }),
  })
)

// Admin Store Session Relations
export const adminStoreSessionRelations = relations(
  adminStoreSession,
  ({ one }) => ({
    user: one(user, {
      fields: [adminStoreSession.userId],
      references: [user.id],
    }),
    store: one(store, {
      fields: [adminStoreSession.storeId],
      references: [store.id],
    }),
  })
)

// Inventory Management Relations
export const inventoryManagementRelations = relations(
  inventoryManagement,
  ({ one }) => ({
    productVariant: one(productVariant, {
      fields: [inventoryManagement.productVariantId],
      references: [productVariant.id],
    }),
    order: one(order, {
      fields: [inventoryManagement.orderId],
      references: [order.id],
    }),
    store: one(store, {
      fields: [inventoryManagement.storeId],
      references: [store.id],
    }),
    createdByUser: one(user, {
      fields: [inventoryManagement.createdBy],
      references: [user.id],
    }),
  })
)

// Product Inventory Relations
export const productInventoryRelations = relations(
  productInventory,
  ({ one }) => ({
    productVariant: one(productVariant, {
      fields: [productInventory.productVariantId],
      references: [productVariant.id],
    }),
    store: one(store, {
      fields: [productInventory.storeId],
      references: [store.id],
    }),
  })
)

// Discount Code Relations
export const discountCodeRelations = relations(discountCode, ({ many }) => ({
  orders: many(order),
}))

// Add payment relations
export const paymentRelations = relations(payment, ({ one }) => ({
  order: one(order, {
    fields: [payment.orderId],
    references: [order.id],
  }),
}))
