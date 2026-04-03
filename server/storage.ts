import { createClient } from "@supabase/supabase-js";
import type {
  InsertPhase, Phase,
  InsertBootcampDay, BootcampDay,
  InsertSkill, Skill,
  InsertJournalEntry, JournalEntry,
  InsertVisibilityLog, VisibilityLog,
  InsertResource, Resource,
} from "../shared/schema";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface IStorage {
  // Phases
  getPhases(): Promise<Phase[]>;
  getPhase(id: number): Promise<Phase | undefined>;
  // Bootcamp
  getBootcampDays(): Promise<BootcampDay[]>;
  updateBootcampDay(id: number, data: Partial<InsertBootcampDay>): Promise<BootcampDay | undefined>;
  // Skills
  getSkills(): Promise<Skill[]>;
  createSkill(data: InsertSkill): Promise<Skill>;
  updateSkill(id: number, data: Partial<InsertSkill>): Promise<Skill | undefined>;
  deleteSkill(id: number): Promise<void>;
  // Journal
  getJournalEntries(): Promise<JournalEntry[]>;
  createJournalEntry(data: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: number, data: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined>;
  deleteJournalEntry(id: number): Promise<void>;
  // Visibility
  getVisibilityLogs(): Promise<VisibilityLog[]>;
  createVisibilityLog(data: InsertVisibilityLog): Promise<VisibilityLog>;
  updateVisibilityLog(id: number, data: Partial<InsertVisibilityLog>): Promise<VisibilityLog | undefined>;
  // Resources
  getResources(): Promise<Resource[]>;
  updateResource(id: number, data: Partial<InsertResource>): Promise<Resource | undefined>;
}

// Map snake_case DB columns to camelCase TypeScript fields
function mapPhase(row: any): Phase {
  return {
    id: row.id,
    phaseNumber: row.phase_number,
    name: row.name,
    description: row.description,
    startDate: row.start_date,
    endDate: row.end_date,
    courses: row.courses,
    projects: row.projects,
    milestones: row.milestones,
  };
}

function mapBootcampDay(row: any): BootcampDay {
  return {
    id: row.id,
    dayNumber: row.day_number,
    date: row.date,
    theme: row.theme,
    morningSchedule: row.morning_schedule,
    afternoonSchedule: row.afternoon_schedule,
    expectedOutputs: row.expected_outputs,
    status: row.status,
  };
}

function mapSkill(row: any): Skill {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    currentLevel: row.current_level,
    targetLevel: row.target_level,
    status: row.status,
  };
}

function mapJournalEntry(row: any): JournalEntry {
  return {
    id: row.id,
    date: row.date,
    learned: row.learned,
    struggled: row.struggled,
    focusTomorrow: row.focus_tomorrow,
    hoursWorked: row.hours_worked,
    deepWork: row.deep_work,
    courseProgress: row.course_progress,
    shippedCode: row.shipped_code,
    publicWriting: row.public_writing,
    codeReview: row.code_review,
    networking: row.networking,
    tags: row.tags,
    createdAt: row.created_at,
  };
}

function mapVisibilityLog(row: any): VisibilityLog {
  return {
    id: row.id,
    weekOf: row.week_of,
    githubCommits: row.github_commits,
    githubRepos: row.github_repos,
    twitterPosts: row.twitter_posts,
    twitterFollowers: row.twitter_followers,
    linkedinPosts: row.linkedin_posts,
    linkedinConnections: row.linkedin_connections,
    substackArticles: row.substack_articles,
    substackSubscribers: row.substack_subscribers,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function mapResource(row: any): Resource {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    platform: row.platform,
    category: row.category,
    phaseNumber: row.phase_number,
    estimatedHours: row.estimated_hours,
    isFree: row.is_free,
    status: row.status,
  };
}

// Convert camelCase insert data to snake_case for DB
function toSnake(data: Record<string, any>): Record<string, any> {
  const map: Record<string, string> = {
    phaseNumber: "phase_number",
    startDate: "start_date",
    endDate: "end_date",
    dayNumber: "day_number",
    morningSchedule: "morning_schedule",
    afternoonSchedule: "afternoon_schedule",
    expectedOutputs: "expected_outputs",
    currentLevel: "current_level",
    targetLevel: "target_level",
    focusTomorrow: "focus_tomorrow",
    hoursWorked: "hours_worked",
    deepWork: "deep_work",
    courseProgress: "course_progress",
    shippedCode: "shipped_code",
    publicWriting: "public_writing",
    codeReview: "code_review",
    createdAt: "created_at",
    weekOf: "week_of",
    githubCommits: "github_commits",
    githubRepos: "github_repos",
    twitterPosts: "twitter_posts",
    twitterFollowers: "twitter_followers",
    linkedinPosts: "linkedin_posts",
    linkedinConnections: "linkedin_connections",
    substackArticles: "substack_articles",
    substackSubscribers: "substack_subscribers",
    estimatedHours: "estimated_hours",
    isFree: "is_free",
  };
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    result[map[key] || key] = value;
  }
  return result;
}

export class DatabaseStorage implements IStorage {
  // Phases
  async getPhases(): Promise<Phase[]> {
    const { data, error } = await supabase.from("phases").select("*").order("id");
    if (error) throw error;
    return (data || []).map(mapPhase);
  }
  async getPhase(id: number): Promise<Phase | undefined> {
    const { data, error } = await supabase.from("phases").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapPhase(data) : undefined;
  }

  // Bootcamp
  async getBootcampDays(): Promise<BootcampDay[]> {
    const { data, error } = await supabase.from("bootcamp_days").select("*").order("id");
    if (error) throw error;
    return (data || []).map(mapBootcampDay);
  }
  async updateBootcampDay(id: number, data: Partial<InsertBootcampDay>): Promise<BootcampDay | undefined> {
    const { data: row, error } = await supabase.from("bootcamp_days").update(toSnake(data)).eq("id", id).select().maybeSingle();
    if (error) throw error;
    return row ? mapBootcampDay(row) : undefined;
  }

  // Skills
  async getSkills(): Promise<Skill[]> {
    const { data, error } = await supabase.from("skills").select("*").order("id");
    if (error) throw error;
    return (data || []).map(mapSkill);
  }
  async createSkill(data: InsertSkill): Promise<Skill> {
    const { data: row, error } = await supabase.from("skills").insert(toSnake(data)).select().single();
    if (error) throw error;
    return mapSkill(row);
  }
  async updateSkill(id: number, data: Partial<InsertSkill>): Promise<Skill | undefined> {
    const { data: row, error } = await supabase.from("skills").update(toSnake(data)).eq("id", id).select().maybeSingle();
    if (error) throw error;
    return row ? mapSkill(row) : undefined;
  }
  async deleteSkill(id: number): Promise<void> {
    const { error } = await supabase.from("skills").delete().eq("id", id);
    if (error) throw error;
  }

  // Journal
  async getJournalEntries(): Promise<JournalEntry[]> {
    const { data, error } = await supabase.from("journal_entries").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapJournalEntry);
  }
  async createJournalEntry(data: InsertJournalEntry): Promise<JournalEntry> {
    const { data: row, error } = await supabase.from("journal_entries").insert(toSnake(data)).select().single();
    if (error) throw error;
    return mapJournalEntry(row);
  }
  async updateJournalEntry(id: number, data: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const { data: row, error } = await supabase.from("journal_entries").update(toSnake(data)).eq("id", id).select().maybeSingle();
    if (error) throw error;
    return row ? mapJournalEntry(row) : undefined;
  }
  async deleteJournalEntry(id: number): Promise<void> {
    const { error } = await supabase.from("journal_entries").delete().eq("id", id);
    if (error) throw error;
  }

  // Visibility
  async getVisibilityLogs(): Promise<VisibilityLog[]> {
    const { data, error } = await supabase.from("visibility_logs").select("*").order("week_of", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapVisibilityLog);
  }
  async createVisibilityLog(data: InsertVisibilityLog): Promise<VisibilityLog> {
    const { data: row, error } = await supabase.from("visibility_logs").insert(toSnake(data)).select().single();
    if (error) throw error;
    return mapVisibilityLog(row);
  }
  async updateVisibilityLog(id: number, data: Partial<InsertVisibilityLog>): Promise<VisibilityLog | undefined> {
    const { data: row, error } = await supabase.from("visibility_logs").update(toSnake(data)).eq("id", id).select().maybeSingle();
    if (error) throw error;
    return row ? mapVisibilityLog(row) : undefined;
  }

  // Resources
  async getResources(): Promise<Resource[]> {
    const { data, error } = await supabase.from("resources").select("*").order("id");
    if (error) throw error;
    return (data || []).map(mapResource);
  }
  async updateResource(id: number, data: Partial<InsertResource>): Promise<Resource | undefined> {
    const { data: row, error } = await supabase.from("resources").update(toSnake(data)).eq("id", id).select().maybeSingle();
    if (error) throw error;
    return row ? mapResource(row) : undefined;
  }
}

export const storage = new DatabaseStorage();
