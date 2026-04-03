import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import { storage } from "../server/storage";

const app = express();
app.use(express.json());

// ─── Phases ───
app.get("/api/phases", async (_req, res) => {
  res.json(await storage.getPhases());
});

app.get("/api/phases/:id", async (req, res) => {
  const phase = await storage.getPhase(Number(req.params.id));
  if (!phase) return res.status(404).json({ error: "Phase not found" });
  res.json(phase);
});

// ─── Bootcamp ───
app.get("/api/bootcamp", async (_req, res) => {
  res.json(await storage.getBootcampDays());
});

app.patch("/api/bootcamp/:id", async (req, res) => {
  const updated = await storage.updateBootcampDay(Number(req.params.id), req.body);
  if (!updated) return res.status(404).json({ error: "Day not found" });
  res.json(updated);
});

// ─── Skills ───
app.get("/api/skills", async (_req, res) => {
  res.json(await storage.getSkills());
});

app.post("/api/skills", async (req, res) => {
  const skill = await storage.createSkill(req.body);
  res.status(201).json(skill);
});

app.patch("/api/skills/:id", async (req, res) => {
  const updated = await storage.updateSkill(Number(req.params.id), req.body);
  if (!updated) return res.status(404).json({ error: "Skill not found" });
  res.json(updated);
});

app.delete("/api/skills/:id", async (req, res) => {
  await storage.deleteSkill(Number(req.params.id));
  res.status(204).send();
});

// ─── Journal ───
app.get("/api/journal", async (_req, res) => {
  res.json(await storage.getJournalEntries());
});

app.post("/api/journal", async (req, res) => {
  const entry = await storage.createJournalEntry(req.body);
  res.status(201).json(entry);
});

app.patch("/api/journal/:id", async (req, res) => {
  const updated = await storage.updateJournalEntry(Number(req.params.id), req.body);
  if (!updated) return res.status(404).json({ error: "Entry not found" });
  res.json(updated);
});

app.delete("/api/journal/:id", async (req, res) => {
  await storage.deleteJournalEntry(Number(req.params.id));
  res.status(204).send();
});

// ─── Visibility ───
app.get("/api/visibility", async (_req, res) => {
  res.json(await storage.getVisibilityLogs());
});

app.post("/api/visibility", async (req, res) => {
  const log = await storage.createVisibilityLog(req.body);
  res.status(201).json(log);
});

app.patch("/api/visibility/:id", async (req, res) => {
  const updated = await storage.updateVisibilityLog(Number(req.params.id), req.body);
  if (!updated) return res.status(404).json({ error: "Log not found" });
  res.json(updated);
});

// ─── Resources ───
app.get("/api/resources", async (_req, res) => {
  res.json(await storage.getResources());
});

app.patch("/api/resources/:id", async (req, res) => {
  const updated = await storage.updateResource(Number(req.params.id), req.body);
  if (!updated) return res.status(404).json({ error: "Resource not found" });
  res.json(updated);
});

// ─── Dashboard Summary ───
app.get("/api/dashboard", async (_req, res) => {
  const allSkills = await storage.getSkills();
  const allJournal = await storage.getJournalEntries();
  const allPhases = await storage.getPhases();
  const allBootcamp = await storage.getBootcampDays();
  const allResources = await storage.getResources();
  const allVisibility = await storage.getVisibilityLogs();

  const startDate = new Date("2026-04-03");
  const now = new Date();
  const dayNumber = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const totalDays = 275;

  const today = now.toISOString().split("T")[0];
  let currentPhase = allPhases[0];
  for (const p of allPhases) {
    if (today >= p.startDate && today <= p.endDate) {
      currentPhase = p;
      break;
    }
  }

  const skillsCompleted = allSkills.filter(s => s.status === "mastered").length;
  const totalSkills = allSkills.length;
  const totalHours = allJournal.reduce((sum, j) => sum + (j.hoursWorked || 0), 0);

  let momentumScore = 0;
  if (allJournal.length > 0) {
    const latest = allJournal[0];
    momentumScore = (latest.deepWork ? 30 : 0) +
      (latest.courseProgress ? 20 : 0) +
      (latest.shippedCode ? 20 : 0) +
      (latest.publicWriting ? 15 : 0) +
      (latest.codeReview ? 10 : 0) +
      (latest.networking ? 5 : 0);
  }

  let streak = 0;
  const sortedEntries = [...allJournal].sort((a, b) => b.date.localeCompare(a.date));
  if (sortedEntries.length > 0) {
    const todayStr = now.toISOString().split("T")[0];
    let checkDate = new Date(todayStr);
    for (const entry of sortedEntries) {
      const entryDate = entry.date;
      const checkStr = checkDate.toISOString().split("T")[0];
      if (entryDate === checkStr) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (entryDate < checkStr) {
        break;
      }
    }
  }

  const bootcampCompleted = allBootcamp.filter(d => d.status === "completed").length;
  const resourcesCompleted = allResources.filter(r => r.status === "completed").length;

  let githubCommitsThisWeek = 0;
  let articlesPublished = 0;
  if (allVisibility.length > 0) {
    githubCommitsThisWeek = allVisibility[0].githubCommits;
    articlesPublished = allVisibility.reduce((sum, v) => sum + v.substackArticles, 0);
  }

  res.json({
    dayNumber,
    totalDays,
    currentPhase,
    momentumScore,
    streak,
    totalHours: Math.round(totalHours * 10) / 10,
    skillsCompleted,
    totalSkills,
    githubCommitsThisWeek,
    articlesPublished,
    bootcampCompleted,
    bootcampTotal: allBootcamp.length,
    resourcesCompleted,
    resourcesTotal: allResources.length,
    recentJournal: allJournal.slice(0, 3),
    phases: allPhases,
  });
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  // @ts-ignore
  app(req, res);
}
