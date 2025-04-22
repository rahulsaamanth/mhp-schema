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
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "public"."ProductVariant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_cart_userId" ON "Cart" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_cart_variant" ON "Cart" USING btree ("productVariantId");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_cart_unique_item" ON "Cart" USING btree ("userId","productVariantId","potency","packSize");