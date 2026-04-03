import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Phases (0-4)
export const phases = sqliteTable("phases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  phaseNumber: integer("phase_number").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  courses: text("courses").notNull(), // JSON array
  projects: text("projects").notNull(), // JSON array
  milestones: text("milestones").notNull(), // JSON array
});

export const insertPhaseSchema = createInsertSchema(phases).omit({ id: true });
export type InsertPhase = z.infer<typeof insertPhaseSchema>;
export type Phase = typeof phases.$inferSelect;

// Bootcamp Days (1-6)
export const bootcampDays = sqliteTable("bootcamp_days", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  dayNumber: integer("day_number").notNull(),
  date: text("date").notNull(),
  theme: text("theme").notNull(),
  morningSchedule: text("morning_schedule").notNull(), // JSON array
  afternoonSchedule: text("afternoon_schedule").notNull(), // JSON array
  expectedOutputs: text("expected_outputs").notNull(), // JSON array
  status: text("status").notNull().default("not_started"), // not_started, in_progress, completed
});

export const insertBootcampDaySchema = createInsertSchema(bootcampDays).omit({ id: true });
export type InsertBootcampDay = z.infer<typeof insertBootcampDaySchema>;
export type BootcampDay = typeof bootcampDays.$inferSelect;

// Skills
export const skills = sqliteTable("skills", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  currentLevel: integer("current_level").notNull().default(0),
  targetLevel: integer("target_level").notNull().default(5),
  status: text("status").notNull().default("not_started"), // not_started, learning, comfortable, mastered
});

export const insertSkillSchema = createInsertSchema(skills).omit({ id: true });
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skills.$inferSelect;

// Journal Entries
export const journalEntries = sqliteTable("journal_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  learned: text("learned").notNull(),
  struggled: text("struggled").notNull(),
  focusTomorrow: text("focus_tomorrow").notNull(),
  hoursWorked: real("hours_worked").notNull().default(0),
  deepWork: integer("deep_work").notNull().default(0), // boolean 0/1
  courseProgress: integer("course_progress").notNull().default(0),
  shippedCode: integer("shipped_code").notNull().default(0),
  publicWriting: integer("public_writing").notNull().default(0),
  codeReview: integer("code_review").notNull().default(0),
  networking: integer("networking").notNull().default(0),
  tags: text("tags").notNull().default("[]"), // JSON array
  createdAt: text("created_at").notNull(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({ id: true });
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;

// Visibility Metrics (weekly logs)
export const visibilityLogs = sqliteTable("visibility_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  weekOf: text("week_of").notNull(),
  githubCommits: integer("github_commits").notNull().default(0),
  githubRepos: integer("github_repos").notNull().default(0),
  twitterPosts: integer("twitter_posts").notNull().default(0),
  twitterFollowers: integer("twitter_followers").notNull().default(0),
  linkedinPosts: integer("linkedin_posts").notNull().default(0),
  linkedinConnections: integer("linkedin_connections").notNull().default(0),
  substackArticles: integer("substack_articles").notNull().default(0),
  substackSubscribers: integer("substack_subscribers").notNull().default(0),
  notes: text("notes").notNull().default(""),
  createdAt: text("created_at").notNull(),
});

export const insertVisibilityLogSchema = createInsertSchema(visibilityLogs).omit({ id: true });
export type InsertVisibilityLog = z.infer<typeof insertVisibilityLogSchema>;
export type VisibilityLog = typeof visibilityLogs.$inferSelect;

// Resources
export const resources = sqliteTable("resources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  platform: text("platform").notNull(),
  category: text("category").notNull(),
  phaseNumber: integer("phase_number").notNull(),
  estimatedHours: real("estimated_hours").notNull().default(0),
  isFree: integer("is_free").notNull().default(1),
  status: text("status").notNull().default("not_started"), // not_started, in_progress, completed
});

export const insertResourceSchema = createInsertSchema(resources).omit({ id: true });
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;
