CREATE TABLE "exam_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"topic" text NOT NULL,
	"subtopic" text NOT NULL,
	"difficulty" text NOT NULL,
	"time_limit" integer,
	"question_count" integer NOT NULL,
	"is_premium" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" integer NOT NULL,
	"question_text" text NOT NULL,
	"options" jsonb NOT NULL,
	"correct_answer" text NOT NULL,
	"explanation" text,
	"hint" text,
	"type" text DEFAULT 'Multiple Choice' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "template_id" integer;--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "icon_url" text;--> statement-breakpoint
ALTER TABLE "template_questions" ADD CONSTRAINT "template_questions_template_id_exam_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."exam_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "template_questions_template_id_idx" ON "template_questions" USING btree ("template_id");--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_template_id_exam_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."exam_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "exams_template_id_idx" ON "exams" USING btree ("template_id");