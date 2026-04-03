import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc } from "drizzle-orm";
import {
  phases, insertPhaseSchema, InsertPhase, Phase,
  bootcampDays, insertBootcampDaySchema, InsertBootcampDay, BootcampDay,
  skills, insertSkillSchema, InsertSkill, Skill,
  journalEntries, insertJournalEntrySchema, InsertJournalEntry, JournalEntry,
  visibilityLogs, insertVisibilityLogSchema, InsertVisibilityLog, VisibilityLog,
  resources, insertResourceSchema, InsertResource, Resource,
} from "@shared/schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

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

export class DatabaseStorage implements IStorage {
  // Phases
  async getPhases(): Promise<Phase[]> {
    return await db.select().from(phases);
  }
  async getPhase(id: number): Promise<Phase | undefined> {
    const rows = await db.select().from(phases).where(eq(phases.id, id));
    return rows[0];
  }
  // Bootcamp
  async getBootcampDays(): Promise<BootcampDay[]> {
    return await db.select().from(bootcampDays);
  }
  async updateBootcampDay(id: number, data: Partial<InsertBootcampDay>): Promise<BootcampDay | undefined> {
    const rows = await db.update(bootcampDays).set(data).where(eq(bootcampDays.id, id)).returning();
    return rows[0];
  }
  // Skills
  async getSkills(): Promise<Skill[]> {
    return await db.select().from(skills);
  }
  async createSkill(data: InsertSkill): Promise<Skill> {
    const rows = await db.insert(skills).values(data).returning();
    return rows[0];
  }
  async updateSkill(id: number, data: Partial<InsertSkill>): Promise<Skill | undefined> {
    const rows = await db.update(skills).set(data).where(eq(skills.id, id)).returning();
    return rows[0];
  }
  async deleteSkill(id: number): Promise<void> {
    await db.delete(skills).where(eq(skills.id, id));
  }
  // Journal
  async getJournalEntries(): Promise<JournalEntry[]> {
    return await db.select().from(journalEntries).orderBy(desc(journalEntries.createdAt));
  }
  async createJournalEntry(data: InsertJournalEntry): Promise<JournalEntry> {
    const rows = await db.insert(journalEntries).values(data).returning();
    return rows[0];
  }
  async updateJournalEntry(id: number, data: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const rows = await db.update(journalEntries).set(data).where(eq(journalEntries.id, id)).returning();
    return rows[0];
  }
  async deleteJournalEntry(id: number): Promise<void> {
    await db.delete(journalEntries).where(eq(journalEntries.id, id));
  }
  // Visibility
  async getVisibilityLogs(): Promise<VisibilityLog[]> {
    return await db.select().from(visibilityLogs).orderBy(desc(visibilityLogs.weekOf));
  }
  async createVisibilityLog(data: InsertVisibilityLog): Promise<VisibilityLog> {
    const rows = await db.insert(visibilityLogs).values(data).returning();
    return rows[0];
  }
  async updateVisibilityLog(id: number, data: Partial<InsertVisibilityLog>): Promise<VisibilityLog | undefined> {
    const rows = await db.update(visibilityLogs).set(data).where(eq(visibilityLogs.id, id)).returning();
    return rows[0];
  }
  // Resources
  async getResources(): Promise<Resource[]> {
    return await db.select().from(resources);
  }
  async updateResource(id: number, data: Partial<InsertResource>): Promise<Resource | undefined> {
    const rows = await db.update(resources).set(data).where(eq(resources.id, id)).returning();
    return rows[0];
  }
}

export const storage = new DatabaseStorage();
