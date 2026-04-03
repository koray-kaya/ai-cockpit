import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(server: Server, app: Express) {
  // ─── Phases ───
  app.get("/api/phases", (_req, res) => {
    res.json(storage.getPhases());
  });

  app.get("/api/phases/:id", (req, res) => {
    const phase = storage.getPhase(Number(req.params.id));
    if (!phase) return res.status(404).json({ error: "Phase not found" });
    res.json(phase);
  });

  // ─── Bootcamp ───
  app.get("/api/bootcamp", (_req, res) => {
    res.json(storage.getBootcampDays());
  });

  app.patch("/api/bootcamp/:id", (req, res) => {
    const updated = storage.updateBootcampDay(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ error: "Day not found" });
    res.json(updated);
  });

  // ─── Skills ───
  app.get("/api/skills", (_req, res) => {
    res.json(storage.getSkills());
  });

  app.patch("/api/skills/:id", (req, res) => {
    const updated = storage.updateSkill(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ error: "Skill not found" });
    res.json(updated);
  });

  // ─── Journal ───
  app.get("/api/journal", (_req, res) => {
    res.json(storage.getJournalEntries());
  });

  app.post("/api/journal", (req, res) => {
    const entry = storage.createJournalEntry(req.body);
    res.status(201).json(entry);
  });

  app.patch("/api/journal/:id", (req, res) => {
    const updated = storage.updateJournalEntry(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ error: "Entry not found" });
    res.json(updated);
  });

  app.delete("/api/journal/:id", (req, res) => {
    storage.deleteJournalEntry(Number(req.params.id));
    res.status(204).send();
  });

  // ─── Visibility ───
  app.get("/api/visibility", (_req, res) => {
    res.json(storage.getVisibilityLogs());
  });

  app.post("/api/visibility", (req, res) => {
    const log = storage.createVisibilityLog(req.body);
    res.status(201).json(log);
  });

  app.patch("/api/visibility/:id", (req, res) => {
    const updated = storage.updateVisibilityLog(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ error: "Log not found" });
    res.json(updated);
  });

  // ─── Resources ───
  app.get("/api/resources", (_req, res) => {
    res.json(storage.getResources());
  });

  app.patch("/api/resources/:id", (req, res) => {
    const updated = storage.updateResource(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ error: "Resource not found" });
    res.json(updated);
  });

  // ─── Dashboard Summary ───
  app.get("/api/dashboard", (_req, res) => {
    const allSkills = storage.getSkills();
    const allJournal = storage.getJournalEntries();
    const allPhases = storage.getPhases();
    const allBootcamp = storage.getBootcampDays();
    const allResources = storage.getResources();
    const allVisibility = storage.getVisibilityLogs();

    // Calculate day number from April 3 2026
    const startDate = new Date("2026-04-03");
    const now = new Date();
    const dayNumber = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const totalDays = 275;

    // Current phase
    const today = now.toISOString().split("T")[0];
    let currentPhase = allPhases[0];
    for (const p of allPhases) {
      if (today >= p.startDate && today <= p.endDate) {
        currentPhase = p;
        break;
      }
    }

    // Skills stats
    const skillsCompleted = allSkills.filter(s => s.status === "mastered").length;
    const totalSkills = allSkills.length;

    // Total hours from journal
    const totalHours = allJournal.reduce((sum, j) => sum + (j.hoursWorked || 0), 0);

    // Latest momentum score
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

    // Streak (consecutive days with journal entries)
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

    // Bootcamp completion
    const bootcampCompleted = allBootcamp.filter(d => d.status === "completed").length;

    // Resources completed
    const resourcesCompleted = allResources.filter(r => r.status === "completed").length;

    // GitHub commits this week (from latest visibility log)
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
}
