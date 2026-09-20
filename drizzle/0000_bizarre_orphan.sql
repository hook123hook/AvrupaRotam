CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`job_title` text NOT NULL,
	`country` text NOT NULL,
	`profession` text NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`cv_key` text NOT NULL,
	`cv_name` text NOT NULL,
	`cv_type` text NOT NULL,
	`cv_size` integer NOT NULL,
	`status` text DEFAULT 'received' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_applications_user_created` ON `applications` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`full_name` text NOT NULL,
	`phone` text NOT NULL,
	`occupation` text NOT NULL,
	`locale` text DEFAULT 'tr' NOT NULL,
	`cv_key` text NOT NULL,
	`cv_name` text NOT NULL,
	`cv_type` text NOT NULL,
	`cv_size` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
