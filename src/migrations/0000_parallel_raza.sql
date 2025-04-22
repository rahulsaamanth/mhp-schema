CREATE TYPE "public"."AddressType" AS ENUM('SHIPPING', 'BILLING');--> statement-breakpoint
CREATE TYPE "public"."DeliveryStatus" AS ENUM('PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED');--> statement-breakpoint
CREATE TYPE "public"."discountType" AS ENUM('PERCENTAGE', 'FIXED');--> statement-breakpoint
CREATE TYPE "public"."MovementType" AS ENUM('IN', 'OUT', 'ADJUSTMENT');--> statement-breakpoint
CREATE TYPE "public"."OrderType" AS ENUM('OFFLINE', 'ONLINE');--> statement-breakpoint
CREATE TYPE "public"."PaymentStatus" AS ENUM('PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."PaymentType" AS ENUM('CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'WALLET');--> statement-breakpoint
CREATE TYPE "public"."potency" AS ENUM('NONE', '1X', '2X', '3X', '6X', '12X', '30X', '200X', '3C', '6C', '12C', '30C', '200C', '1M', '10M', '50M', 'CM', '3CH', '6CH', '9CH', '12CH', '15CH', '30CH', '200CH', '1M CH', '10M CH', '50M CH', 'CM CH', 'Q', 'LM1', 'LM2', 'LM3', 'LM4', 'LM5', 'LM6', 'LM7', 'LM8', 'LM9', 'LM10', 'LM11', 'LM12', 'LM13', 'LM14', 'LM15', 'LM16', 'LM17', 'LM18', 'LM19', 'LM20', 'LM21', 'LM22', 'LM23', 'LM24', 'LM25', 'LM26', 'LM27', 'LM28', 'LM29', 'LM30', 'LM50');--> statement-breakpoint
CREATE TYPE "public"."ProductForm" AS ENUM('NONE', 'DILUTIONS(P)', 'MOTHER_TINCTURES(Q)', 'TRITURATIONS', 'TABLETS', 'GLOBULES', 'BIO_CHEMIC', 'BIO_COMBINATION', 'OINTMENT', 'GEL', 'CREAM', 'SYRUP/TONIC', 'DROPS', 'EYE_DROPS', 'EAR_DROPS', 'NASAL_DROPS', 'INJECTIONS');--> statement-breakpoint
CREATE TYPE "public"."ProductStatus" AS ENUM('ACTIVE', 'DRAFT', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."UnitOfMeasure" AS ENUM('NONE', 'TABLETS', 'ML', 'GM(s)', 'DROPS', 'AMPOULES');--> statement-breakpoint
CREATE TYPE "public"."UserRole" AS ENUM('ADMIN', 'USER', 'STORE_ADMIN');--> statement-breakpoint
CREATE TABLE "Account" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"userId" varchar(32) NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "Account_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "Address" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"userId" varchar(32) NOT NULL,
	"street" varchar(255) NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"postalCode" varchar(10) NOT NULL,
	"country" varchar(50) DEFAULT 'India' NOT NULL,
	"addressType" "AddressType" DEFAULT 'SHIPPING' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "Address_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "AdminStoreAccess" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"userId" varchar(32) NOT NULL,
	"storeId" varchar(32) NOT NULL,
	"canManageInventory" boolean DEFAULT true NOT NULL,
	"canManageOrders" boolean DEFAULT true NOT NULL,
	"canViewAnalytics" boolean DEFAULT true NOT NULL,
	"canManageProducts" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "AdminStoreAccess_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "AdminStoreSession" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"userId" varchar(32) NOT NULL,
	"storeId" varchar(32) NOT NULL,
	"lastAccessed" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "AdminStoreSession_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "Cart" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"userId" varchar(32) NOT NULL,
	"productId" varchar(32) NOT NULL,
	"productVariantId" varchar(32) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"potency" text,
	"packSize" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "Cart_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "Category" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"parentId" varchar(32),
	"path" text DEFAULT '' NOT NULL,
	"pathIds" text[],
	"depth" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "Category_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "InventoryManagement" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"productVariantId" varchar(32) NOT NULL,
	"orderId" varchar(32),
	"type" "MovementType" NOT NULL,
	"quantity" integer NOT NULL,
	"reason" text NOT NULL,
	"storeId" varchar(32) NOT NULL,
	"previousStock" integer NOT NULL,
	"newStock" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"createdBy" varchar(32) NOT NULL,
	CONSTRAINT "InventoryManagement_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "Manufacturer" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "Manufacturer_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "Order" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"userId" varchar(32),
	"customerName" text,
	"customerPhone" text,
	"customerEmail" text,
	"isGuestOrder" boolean DEFAULT false NOT NULL,
	"storeId" varchar(32),
	"orderDate" timestamp DEFAULT now() NOT NULL,
	"subtotal" double precision NOT NULL,
	"shippingCost" double precision DEFAULT 0 NOT NULL,
	"discount" double precision DEFAULT 0 NOT NULL,
	"tax" double precision DEFAULT 0 NOT NULL,
	"totalAmountPaid" double precision NOT NULL,
	"orderType" "OrderType" DEFAULT 'ONLINE' NOT NULL,
	"deliveryStatus" "DeliveryStatus" DEFAULT 'PROCESSING' NOT NULL,
	"shippingAddressId" varchar(32) NOT NULL,
	"billingAddressId" varchar(32) NOT NULL,
	"paymentStatus" "PaymentStatus" DEFAULT 'PENDING' NOT NULL,
	"paymentIntentId" varchar(100),
	"invoiceNumber" varchar(50),
	"customerNotes" text,
	"adminNotes" text,
	"cancellationReason" text,
	"estimatedDeliveryDate" timestamp,
	"deliveredAt" timestamp,
	"paymentMethodId" varchar(32),
	CONSTRAINT "Order_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "OrderDetails" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"orderId" varchar(32) NOT NULL,
	"productVariantId" varchar(32) NOT NULL,
	"originalPrice" double precision NOT NULL,
	"discountAmount" double precision DEFAULT 0 NOT NULL,
	"taxAmount" double precision DEFAULT 0 NOT NULL,
	"unitPrice" double precision NOT NULL,
	"quantity" integer NOT NULL,
	"itemStatus" "DeliveryStatus" DEFAULT 'PROCESSING' NOT NULL,
	"returnReason" text,
	"returnedAt" timestamp,
	"refundAmount" double precision,
	"fulfilledFromStoreId" varchar(32),
	CONSTRAINT "OrderDetails_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "PasswordResetToken" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "PasswordResetToken_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "PaymentMethod" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"userId" varchar(32) NOT NULL,
	"paymentType" "PaymentType" NOT NULL,
	"isDefault" boolean DEFAULT false NOT NULL,
	"paymentDetails" jsonb NOT NULL,
	"displayDetails" jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "PaymentMethod_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "Product" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"form" "ProductForm" NOT NULL,
	"unit" "UnitOfMeasure" NOT NULL,
	"status" "ProductStatus" DEFAULT 'ACTIVE' NOT NULL,
	"tags" text[],
	"categoryId" varchar(32) NOT NULL,
	"manufacturerId" varchar(32) NOT NULL,
	"isFeatured" boolean DEFAULT false NOT NULL,
	"hsnCode" varchar(8) DEFAULT '30049014',
	"tax" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "Product_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "ProductVariant" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"discontinued" boolean DEFAULT false,
	"productId" varchar(32) NOT NULL,
	"sku" varchar(50) NOT NULL,
	"variantName" text NOT NULL,
	"variantImage" text[],
	"potency" "potency" DEFAULT 'NONE' NOT NULL,
	"packSize" integer,
	"stockByLocation" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"costPrice" double precision,
	"mrp" double precision NOT NULL,
	"discount" integer DEFAULT 0,
	"discountType" "discountType" DEFAULT 'PERCENTAGE',
	"sellingPrice" double precision NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "ProductVariant_id_unique" UNIQUE("id"),
	CONSTRAINT "ProductVariant_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "Review" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"rating" double precision DEFAULT 0 NOT NULL,
	"comment" text,
	"userId" varchar(32) NOT NULL,
	"productId" varchar(32) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "Review_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Store" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" varchar(30) NOT NULL,
	"location" text NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "Store_id_unique" UNIQUE("id"),
	CONSTRAINT "Store_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "Tags" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "Tags_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "TwoFactorConfirmation" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"userId" varchar(32) NOT NULL,
	CONSTRAINT "TwoFactorConfirmation_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "TwoFactorToken" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "TwoFactorToken_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"emailVerified" timestamp,
	"image" text,
	"password" text,
	"role" "UserRole" DEFAULT 'USER' NOT NULL,
	"lastActive" timestamp DEFAULT now() NOT NULL,
	"isTwoFactorEnabled" boolean DEFAULT false NOT NULL,
	"phone" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "User_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "VerificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "AdminStoreAccess" ADD CONSTRAINT "AdminStoreAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "AdminStoreAccess" ADD CONSTRAINT "AdminStoreAccess_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "AdminStoreSession" ADD CONSTRAINT "AdminStoreSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "AdminStoreSession" ADD CONSTRAINT "AdminStoreSession_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "public"."ProductVariant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Category"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "InventoryManagement" ADD CONSTRAINT "InventoryManagement_productVariantId_ProductVariant_id_fk" FOREIGN KEY ("productVariantId") REFERENCES "public"."ProductVariant"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "InventoryManagement" ADD CONSTRAINT "InventoryManagement_orderId_Order_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "InventoryManagement" ADD CONSTRAINT "InventoryManagement_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Order" ADD CONSTRAINT "Order_shippingAddress_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "public"."Address"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Order" ADD CONSTRAINT "Order_billingAddress_fkey" FOREIGN KEY ("billingAddressId") REFERENCES "public"."Address"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Order" ADD CONSTRAINT "Order_paymentMethod_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "public"."PaymentMethod"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Order" ADD CONSTRAINT "Order_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "OrderDetails" ADD CONSTRAINT "OrderDetails_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "OrderDetails" ADD CONSTRAINT "OrderDetails_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "public"."ProductVariant"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Product" ADD CONSTRAINT "Product_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "public"."Manufacturer"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TwoFactorConfirmation" ADD CONSTRAINT "TwoFactorConfirmation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account" USING btree ("provider","provider_account_id");--> statement-breakpoint
CREATE INDEX "Adress_userId_index" ON "Address" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_admin_store_unique" ON "AdminStoreAccess" USING btree ("userId","storeId");--> statement-breakpoint
CREATE INDEX "idx_admin_store_user" ON "AdminStoreAccess" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_admin_store_store" ON "AdminStoreAccess" USING btree ("storeId");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_admin_store_session_unique" ON "AdminStoreSession" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_cart_userId" ON "Cart" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_cart_variant" ON "Cart" USING btree ("productVariantId");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_cart_unique_item" ON "Cart" USING btree ("userId","productVariantId","potency","packSize");--> statement-breakpoint
CREATE INDEX "idx_category_tree" ON "Category" USING btree ("id","parentId");--> statement-breakpoint
CREATE INDEX "idx_category_parent" ON "Category" USING btree ("parentId");--> statement-breakpoint
CREATE INDEX "idx_category_path" ON "Category" USING btree ("path");--> statement-breakpoint
CREATE INDEX "idx_category_depth" ON "Category" USING btree ("depth");--> statement-breakpoint
CREATE INDEX "idx_inventory_movement_variant" ON "InventoryManagement" USING btree ("productVariantId");--> statement-breakpoint
CREATE INDEX "idx_inventory_movement_date" ON "InventoryManagement" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "idx_inventory_movement_order" ON "InventoryManagement" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "idx_inventory_movement_storeId" ON "InventoryManagement" USING btree ("storeId");--> statement-breakpoint
CREATE INDEX "order_store_idx" ON "Order" USING btree ("storeId");--> statement-breakpoint
CREATE INDEX "order_date_status_idx" ON "Order" USING btree ("orderDate","deliveryStatus");--> statement-breakpoint
CREATE INDEX "order_user_date_idx" ON "Order" USING btree ("userId","orderDate");--> statement-breakpoint
CREATE INDEX "order_payment_status_idx" ON "Order" USING btree ("paymentStatus");--> statement-breakpoint
CREATE INDEX "order_invoice_number_idx" ON "Order" USING btree ("invoiceNumber");--> statement-breakpoint
CREATE INDEX "order_payment_delivery_status_idx" ON "Order" USING btree ("paymentStatus","deliveryStatus");--> statement-breakpoint
CREATE INDEX "order_details_fulfillment_idx" ON "OrderDetails" USING btree ("fulfilledFromStoreId");--> statement-breakpoint
CREATE UNIQUE INDEX "PasswordResetToken_email_token_key" ON "PasswordResetToken" USING btree ("email","token");--> statement-breakpoint
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken" USING btree ("token");--> statement-breakpoint
CREATE INDEX "PaymentMethod_userId_index" ON "PaymentMethod" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "product_name_idx" ON "Product" USING btree ("name");--> statement-breakpoint
CREATE INDEX "product_status_idx" ON "Product" USING btree ("status");--> statement-breakpoint
CREATE INDEX "product_category_idx" ON "Product" USING btree ("categoryId");--> statement-breakpoint
CREATE INDEX "product_created_at_idx" ON "Product" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "product_form_unit_idx" ON "Product" USING btree ("unit","form");--> statement-breakpoint
CREATE INDEX "product_category_status_idx" ON "Product" USING btree ("categoryId","status");--> statement-breakpoint
CREATE INDEX "idx_variant_sku" ON "ProductVariant" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "idx_variant_stock_location" ON "ProductVariant" USING btree ("stockByLocation");--> statement-breakpoint
CREATE INDEX "idx_variant_search" ON "ProductVariant" USING btree ("productId","potency","packSize");--> statement-breakpoint
CREATE INDEX "idx_variant_price" ON "ProductVariant" USING btree ("sellingPrice","mrp");--> statement-breakpoint
CREATE INDEX "idx_variant_potency" ON "ProductVariant" USING btree ("potency");--> statement-breakpoint
CREATE INDEX "idx_variant_discount" ON "ProductVariant" USING btree ("discount");--> statement-breakpoint
CREATE INDEX "review_rating_idx" ON "Review" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "review_product_date_idx" ON "Review" USING btree ("productId","createdAt");--> statement-breakpoint
CREATE INDEX "idx_store_name" ON "Store" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_store_code" ON "Store" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_store_active" ON "Store" USING btree ("isActive");--> statement-breakpoint
CREATE UNIQUE INDEX "TwoFactorConfirmation_userId_key" ON "TwoFactorConfirmation" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "TwoFactorToken_email_token_key" ON "TwoFactorToken" USING btree ("email","token");--> statement-breakpoint
CREATE UNIQUE INDEX "TwoFactorToken_token_key" ON "TwoFactorToken" USING btree ("token");--> statement-breakpoint
CREATE UNIQUE INDEX "User_email_key" ON "User" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken" USING btree ("token");