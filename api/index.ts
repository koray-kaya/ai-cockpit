import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Simple snake_case to camelCase mapper
function toCamel(rows: any[]): any[] {
  return rows.map(row => {
    const result: any = {};
    for (const [key, value] of Object.entries(row)) {
      const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      result[camelKey] = value;
    }
    return result;
  });
}

function toSnake(data: Record<string, any>): Record<string, any> {
  const result: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    const snakeKey = key.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const url = req.url || "";
  const method = req.method || "GET";

  try {
    // ─── Phases ───
    if (url.match(/^\/api\/phases\/?$/) && method === "GET") {
      const { data, error } = await supabase.from("phases").select("*").order("id");
      if (error) throw error;
      return res.json(toCamel(data || []));
    }

    const phaseMatch = url.match(/^\/api\/phases\/(\d+)/);
    if (phaseMatch && method === "GET") {
      const { data, error } = await supabase.from("phases").select("*").eq("id", Number(phaseMatch[1])).maybeSingle();
      if (error) throw error;
      if (!data) return res.status(404).json({ error: "Phase not found" });
      return res.json(toCamel([data])[0]);
    }

    // ─── Bootcamp ───
    if (url.match(/^\/api\/bootcamp\/?$/) && method === "GET") {
      const { data, error } = await supabase.from("bootcamp_days").select("*").order("id");
      if (error) throw error;
      return res.json(toCamel(data || []));
    }

    const bootcampMatch = url.match(/^\/api\/bootcamp\/(\d+)/);
    if (bootcampMatch && method === "PATCH") {
      const { data, error } = await supabase.from("bootcamp_days").update(toSnake(req.body)).eq("id", Number(bootcampMatch[1])).select().maybeSingle();
      if (error) throw error;
      if (!data) return res.status(404).json({ error: "Day not found" });
      return res.json(toCamel([data])[0]);
    }

    // ─── Skills ───
    if (url.match(/^\/api\/skills\/?$/) && method === "GET") {
      const { data, error } = await supabase.from("skills").select("*").order("id");
      if (error) throw error;
      return res.json(toCamel(data || []));
    }

    if (url.match(/^\/api\/skills\/?$/) && method === "POST") {
      const { data, error } = await supabase.from("skills").insert(toSnake(req.body)).select().single();
      if (error) throw error;
      return res.status(201).json(toCamel([data])[0]);
    }

    const skillMatch = url.match(/^\/api\/skills\/(\d+)/);
    if (skillMatch && method === "PATCH") {
      const { data, error } = await supabase.from("skills").update(toSnake(req.body)).eq("id", Number(skillMatch[1])).select().maybeSingle();
      if (error) throw error;
      if (!data) return res.status(404).json({ error: "Skill not found" });
      return res.json(toCamel([data])[0]);
    }
    if (skillMatch && method === "DELETE") {
      const { error } = await supabase.from("skills").delete().eq("id", Number(skillMatch[1]));
      if (error) throw error;
      return res.status(204).end();
    }

    // ─── Journal ───
    if (url.match(/^\/api\/journal\/?$/) && method === "GET") {
      const { data, error } = await supabase.from("journal_entries").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return res.json(toCamel(data || []));
    }

    if (url.match(/^\/api\/journal\/?$/) && method === "POST") {
      const { data, error } = await supabase.from("journal_entries").insert(toSnake(req.body)).select().single();
      if (error) throw error;
      return res.status(201).json(toCamel([data])[0]);
    }

    const journalMatch = url.match(/^\/api\/journal\/(\d+)/);
    if (journalMatch && method === "PATCH") {
      const { data, error } = await supabase.from("journal_entries").update(toSnake(req.body)).eq("id", Number(journalMatch[1])).select().maybeSingle();
      if (error) throw error;
      if (!data) return res.status(404).json({ error: "Entry not found" });
      return res.json(toCamel([data])[0]);
    }
    if (journalMatch && method === "DELETE") {
      const { error } = await supabase.from("journal_entries").delete().eq("id", Number(journalMatch[1]));
      if (error) throw error;
      return res.status(204).end();
    }

    // ─── Visibility ───
    if (url.match(/^\/api\/visibility\/?$/) && method === "GET") {
      const { data, error } = await supabase.from("visibility_logs").select("*").order("week_of", { ascending: false });
      if (error) throw error;
      return res.json(toCamel(data || []));
    }

    if (url.match(/^\/api\/visibility\/?$/) && method === "POST") {
      const { data, error } = await supabase.from("visibility_logs").insert(toSnake(req.body)).select().single();
      if (error) throw error;
      return res.status(201).json(toCamel([data])[0]);
    }

    const visMatch = url.match(/^\/api\/visibility\/(\d+)/);
    if (visMatch && method === "PATCH") {
      const { data, error } = await supabase.from("visibility_logs").update(toSnake(req.body)).eq("id", Number(visMatch[1])).select().maybeSingle();
      if (error) throw error;
      if (!data) return res.status(404).json({ error: "Log not found" });
      return res.json(toCamel([data])[0]);
    }

    // ─── Resources ───
    if (url.match(/^\/api\/resources\/?$/) && method === "GET") {
      const { data, error } = await supabase.from("resources").select("*").order("id");
      if (error) throw error;
      return res.json(toCamel(data || []));
    }

    const resMatch = url.match(/^\/api\/resources\/(\d+)/);
    if (resMatch && method === "PATCH") {
      const { data, error } = await supabase.from("resources").update(toSnake(req.body)).eq("id", Number(resMatch[1])).select().maybeSingle();
      if (error) throw error;
      if (!data) return res.status(404).json({ error: "Resource not found" });
      return res.json(toCamel([data])[0]);
    }

    // ─── Dashboard Summary ───
    if (url.match(/^\/api\/dashboard\/?$/) && method === "GET") {
      const [phasesRes, bootcampRes, skillsRes, journalRes, visRes, resourcesRes] = await Promise.all([
        supabase.from("phases").select("*").order("id"),
        supabase.from("bootcamp_days").select("*").order("id"),
        supabase.from("skills").select("*").order("id"),
        supabase.from("journal_entries").select("*").order("created_at", { ascending: false }),
        supabase.from("visibility_logs").select("*").order("week_of", { ascending: false }),
        supabase.from("resources").select("*").order("id"),
      ]);

      const allPhases = toCamel(phasesRes.data || []);
      const allBootcamp = toCamel(bootcampRes.data || []);
      const allSkills = toCamel(skillsRes.data || []);
      const allJournal = toCamel(journalRes.data || []);
      const allVisibility = toCamel(visRes.data || []);
      const allResources = toCamel(resourcesRes.data || []);

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

      const skillsCompleted = allSkills.filter((s: any) => s.status === "mastered").length;
      const totalSkills = allSkills.length;
      const totalHours = allJournal.reduce((sum: number, j: any) => sum + (j.hoursWorked || 0), 0);

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
      const sortedEntries = [...allJournal].sort((a: any, b: any) => b.date.localeCompare(a.date));
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

      const bootcampCompleted = allBootcamp.filter((d: any) => d.status === "completed").length;
      const resourcesCompleted = allResources.filter((r: any) => r.status === "completed").length;

      let githubCommitsThisWeek = 0;
      let articlesPublished = 0;
      if (allVisibility.length > 0) {
        githubCommitsThisWeek = allVisibility[0].githubCommits;
        articlesPublished = allVisibility.reduce((sum: number, v: any) => sum + v.substackArticles, 0);
      }

      return res.json({
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
    }

    // 404 for unknown routes
    return res.status(404).json({ error: "Not found" });
  } catch (err: any) {
    console.error("API Error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
