import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Skill } from "@shared/schema";
import { useState } from "react";

const categories = [
  "All",
  "Fundamentals",
  "ML / AI",
  "LLM / GenAI",
  "MLOps",
  "Industrial AI",
  "Soft Skills",
];

const statusOptions = [
  { value: "not_started", label: "Not Started", color: "text-muted-foreground" },
  { value: "learning", label: "Learning", color: "text-primary" },
  { value: "comfortable", label: "Comfortable", color: "text-amber-400" },
  { value: "mastered", label: "Mastered", color: "text-emerald-400" },
];

const statusEmoji: Record<string, string> = {
  not_started: "○",
  learning: "◐",
  comfortable: "◑",
  mastered: "●",
};

function LevelSelector({ currentLevel, onSelect }: { currentLevel: number; onSelect: (level: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[0, 1, 2, 3, 4, 5].map((level) => (
        <button
          key={level}
          onClick={() => onSelect(level)}
          className={`h-5 w-5 rounded-sm text-[10px] font-mono transition-colors ${
            level <= currentLevel
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted-foreground/20"
          }`}
          data-testid={`level-${level}`}
        >
          {level}
        </button>
      ))}
    </div>
  );
}

export default function Skills() {
  const { data: skills, isLoading } = useQuery<Skill[]>({
    queryKey: ["/api/skills"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/skills");
      return res.json();
    },
  });

  const [filter, setFilter] = useState("All");

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Skill> }) => {
      const res = await apiRequest("PATCH", `/api/skills/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
    },
  });

  if (isLoading || !skills) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const filtered = filter === "All" ? skills : skills.filter(s => s.category === filter);

  // Stats
  const totalTarget = skills.reduce((s, sk) => s + sk.targetLevel, 0);
  const totalCurrent = skills.reduce((s, sk) => s + sk.currentLevel, 0);
  const overallPercent = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;

  // Category stats
  const categoryStats = categories.filter(c => c !== "All").map(cat => {
    const catSkills = skills.filter(s => s.category === cat);
    const catTarget = catSkills.reduce((s, sk) => s + sk.targetLevel, 0);
    const catCurrent = catSkills.reduce((s, sk) => s + sk.currentLevel, 0);
    return {
      name: cat,
      percent: catTarget > 0 ? Math.round((catCurrent / catTarget) * 100) : 0,
      count: catSkills.length,
    };
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto" data-testid="page-skills">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Skills Tracker</h1>
          <p className="text-sm text-muted-foreground">{skills.length} skills across 6 categories</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono">{overallPercent}% complete</span>
          <Progress value={overallPercent} className="h-2 w-24" />
        </div>
      </div>

      {/* Category Progress Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {categoryStats.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setFilter(cat.name === filter ? "All" : cat.name)}
            className={`p-3 rounded-lg border text-left transition-colors ${
              filter === cat.name
                ? "border-primary bg-primary/10"
                : "border-card-border bg-card hover:border-primary/30"
            }`}
            data-testid={`filter-${cat.name}`}
          >
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">{cat.name}</p>
            <p className="text-lg font-bold">{cat.percent}%</p>
            <Progress value={cat.percent} className="h-1 mt-1" />
          </button>
        ))}
      </div>

      {/* Skills Table */}
      <Card className="bg-card border-card-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left">
                <th className="p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Skill</th>
                <th className="p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Category</th>
                <th className="p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Level</th>
                <th className="p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Target</th>
                <th className="p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filtered.map((skill) => (
                <tr key={skill.id} className="hover:bg-accent/30 transition-colors" data-testid={`skill-row-${skill.id}`}>
                  <td className="p-3 font-medium">{skill.name}</td>
                  <td className="p-3 hidden sm:table-cell">
                    <Badge variant="secondary" className="text-[10px]">{skill.category}</Badge>
                  </td>
                  <td className="p-3">
                    <LevelSelector
                      currentLevel={skill.currentLevel}
                      onSelect={(level) => {
                        const status = level === 0 ? "not_started" :
                          level >= skill.targetLevel ? "mastered" :
                          level >= 3 ? "comfortable" : "learning";
                        updateMutation.mutate({ id: skill.id, data: { currentLevel: level, status } });
                      }}
                    />
                  </td>
                  <td className="p-3 font-mono text-muted-foreground">{skill.targetLevel}</td>
                  <td className="p-3">
                    <Select
                      value={skill.status}
                      onValueChange={(value) => updateMutation.mutate({ id: skill.id, data: { status: value } })}
                    >
                      <SelectTrigger className="h-7 text-xs w-28" data-testid={`status-select-${skill.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <span className={opt.color}>{statusEmoji[opt.value]} {opt.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
