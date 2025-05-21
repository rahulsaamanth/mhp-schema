ALTER TABLE "Order" RENAME COLUMN "orderDate" TO "createdAt";--> statement-breakpoint
DROP INDEX "order_date_status_idx";--> statement-breakpoint
DROP INDEX "order_user_date_idx";--> statement-breakpoint
ALTER TABLE "Order" ADD COLUMN "updatedAt" timestamp DEFAULT now();--> statement-breakpoint
CREATE INDEX "order_date_status_idx" ON "Order" USING btree ("createdAt","deliveryStatus");--> statement-breakpoint
CREATE INDEX "order_user_date_idx" ON "Order" USING btree ("userId","createdAt");