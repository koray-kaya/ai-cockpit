CREATE TABLE `bootcamp_days` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`day_number` integer NOT NULL,
	`date` text NOT NULL,
	`theme` text NOT NULL,
	`morning_schedule` text NOT NULL,
	`afternoon_schedule` text NOT NULL,
	`expected_outputs` text NOT NULL,
	`status` text DEFAULT 'not_started' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `journal_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`learned` text NOT NULL,
	`struggled` text NOT NULL,
	`focus_tomorrow` text NOT NULL,
	`hours_worked` real DEFAULT 0 NOT NULL,
	`deep_work` integer DEFAULT 0 NOT NULL,
	`course_progress` integer DEFAULT 0 NOT NULL,
	`shipped_code` integer DEFAULT 0 NOT NULL,
	`public_writing` integer DEFAULT 0 NOT NULL,
	`code_review` integer DEFAULT 0 NOT NULL,
	`networking` integer DEFAULT 0 NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `phases` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`phase_number` integer NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`courses` text NOT NULL,
	`projects` text NOT NULL,
	`milestones` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `resources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`platform` text NOT NULL,
	`category` text NOT NULL,
	`phase_number` integer NOT NULL,
	`estimated_hours` real DEFAULT 0 NOT NULL,
	`is_free` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'not_started' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `skills` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`current_level` integer DEFAULT 0 NOT NULL,
	`target_level` integer DEFAULT 5 NOT NULL,
	`status` text DEFAULT 'not_started' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `visibility_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`week_of` text NOT NULL,
	`github_commits` integer DEFAULT 0 NOT NULL,
	`github_repos` integer DEFAULT 0 NOT NULL,
	`twitter_posts` integer DEFAULT 0 NOT NULL,
	`twitter_followers` integer DEFAULT 0 NOT NULL,
	`linkedin_posts` integer DEFAULT 0 NOT NULL,
	`linkedin_connections` integer DEFAULT 0 NOT NULL,
	`substack_articles` integer DEFAULT 0 NOT NULL,
	`substack_subscribers` integer DEFAULT 0 NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL
);
