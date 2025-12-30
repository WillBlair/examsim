ALTER TABLE "exams" ADD COLUMN "guest_id" text;--> statement-breakpoint
CREATE INDEX "exams_guest_id_idx" ON "exams" USING btree ("guest_id");