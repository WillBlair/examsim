CREATE TABLE "subscription_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"event_type" text NOT NULL,
	"stripe_event_id" text NOT NULL,
	"data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "subscription_tier" text DEFAULT 'free';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "subscription_status" text DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "stripe_subscription_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "subscription_period_end" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ip_addresses" jsonb;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "device_fingerprints" jsonb;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "subscription_events_user_id_idx" ON "subscription_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscription_events_stripe_event_idx" ON "subscription_events" USING btree ("stripe_event_id");