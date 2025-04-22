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
  paymentMethod,
  cart,
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
  shippingAddres: one(address, {
    fields: [order.shippingAddressId],
    references: [address.id],
  }),
  billingAddress: one(address, {
    fields: [order.billingAddressId],
    references: [address.id],
  }),
  paymentMethod: one(paymentMethod, {
    fields: [order.paymentMethodId],
    references: [paymentMethod.id],
  }),
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
  shippingOrders: many(order, {
    relationName: "order_shipping_address",
  }),
  billingOrders: many(order, {
    relationName: "order_billing_address",
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
