import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Flame,
  Clock,
  Brain,
  Target,
  TrendingUp,
  Calendar,
  BookOpen,
} from "lucide-react";
import { Link } from "wouter";

interface Skill {
  id: number;
  name: string;
  category: string;
  currentLevel: number;
  targetLevel: number;
  status: string;
}

interface JournalEntry {
  id: number;
  date: string;
  learned: string;
  struggled: string;
  focusTomorrow: string;
  hoursWorked: number;
  deepWork: number;
  courseProgress: number;
  shippedCode: number;
  publicWriting: number;
  codeReview: number;
  networking: number;
  tags: string;
}

interface DashboardData {
  dayNumber: number;
  totalDays: number;
  currentPhase: { phaseNumber: number; name: string; description: string };
  momentumScore: number;
  streak: number;
  totalHours: number;
  skillsCompleted: number;
  totalSkills: number;
  recentJournal: JournalEntry[];
}

const categoryColors: Record<string, string> = {
  "Fundamentals": "bg-blue-500",
  "ML / AI": "bg-violet-500",
  "LLM / GenAI": "bg-emerald-500",
  "MLOps": "bg-orange-500",
  "Industrial AI": "bg-rose-500",
  "Soft Skills": "bg-amber-500",
};

const categoryBgColors: Record<string, string> = {
  "Fundamentals": "bg-blue-500/10 text-blue-400",
  "ML / AI": "bg-violet-500/10 text-violet-400",
  "LLM / GenAI": "bg-emerald-500/10 text-emerald-400",
  "MLOps": "bg-orange-500/10 text-orange-400",
  "Industrial AI": "bg-rose-500/10 text-rose-400",
  "Soft Skills": "bg-amber-500/10 text-amber-400",
};

function MomentumRing({ score }: { score: number }) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "text-emerald-400" : score >= 40 ? "text-primary" : "text-amber-400";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="120" height="120" className="-rotate-90">
        <circle
          cx="60" cy="60" r={radius}
          className="stroke-muted"
          strokeWidth="7" fill="none"
        />
        <circle
          cx="60" cy="60" r={radius}
          className={`stroke-current ${color}`}
          strokeWidth="7" fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold tracking-tight">{score}</span>
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Momentum</span>
      </div>
    </div>
  );
}

function CategoryProgress({ name, percent, current, target, count }: { name: string; percent: number; current: number; target: number; count: number }) {
  const barColor = categoryColors[name] || "bg-primary";
  const badgeColor = categoryBgColors[name] || "bg-primary/10 text-primary";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${badgeColor}`}>
            {name}
          </span>
          <span className="text-[10px] text-muted-foreground">{count} skills</span>
        </div>
        <span className="text-xs font-mono text-muted-foreground">{current}/{target}</span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-700 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/dashboard");
      return res.json();
    },
  });

  const { data: skills, isLoading: skillsLoading } = useQuery<Skill[]>({
    queryKey: ["/api/skills"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/skills");
      return res.json();
    },
  });

  if (isLoading || !data || skillsLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Category stats from skills
  const categories = ["Fundamentals", "ML / AI", "LLM / GenAI", "MLOps", "Industrial AI", "Soft Skills"];
  const categoryStats = categories.map(cat => {
    const catSkills = (skills || []).filter(s => s.category === cat);
    const catTarget = catSkills.reduce((s, sk) => s + sk.targetLevel, 0);
    const catCurrent = catSkills.reduce((s, sk) => s + sk.currentLevel, 0);
    return {
      name: cat,
      percent: catTarget > 0 ? Math.round((catCurrent / catTarget) * 100) : 0,
      current: catCurrent,
      target: catTarget,
      count: catSkills.length,
    };
  });

  const overallTarget = (skills || []).reduce((s, sk) => s + sk.targetLevel, 0);
  const overallCurrent = (skills || []).reduce((s, sk) => s + sk.currentLevel, 0);
  const overallPercent = overallTarget > 0 ? Math.round((overallCurrent / overallTarget) * 100) : 0;

  // Active skills (currently learning)
  const activeSkills = (skills || []).filter(s => s.status === "learning" || s.status === "comfortable");

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto" data-testid="page-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Day {data.dayNumber} of {data.totalDays}
          </h1>
          <p className="text-sm text-muted-foreground">
            Your AI Engineering Journey
          </p>
        </div>
        <Badge variant="outline" className="w-fit text-xs font-mono">
          <Calendar className="h-3 w-3 mr-1" />
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
        </Badge>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-card border-card-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Skills Progress</p>
                <p className="text-lg font-bold leading-tight">{overallPercent}%</p>
                <p className="text-[10px] text-muted-foreground">{overallCurrent}/{overallTarget} points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-card-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Hours</p>
                <p className="text-lg font-bold leading-tight">{data.totalHours}</p>
                <p className="text-[10px] text-muted-foreground">invested</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-card-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                <Flame className="h-4 w-4 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Streak</p>
                <p className="text-lg font-bold leading-tight">{data.streak} days</p>
                <p className="text-[10px] text-muted-foreground">keep going</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-card-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Skills</p>
                <p className="text-lg font-bold leading-tight">{activeSkills.length}</p>
                <p className="text-[10px] text-muted-foreground">learning now</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Skill Progress + Momentum */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Skill Progress — Main Focus */}
        <Card className="bg-card border-card-border lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                Skill Progress by Category
              </CardTitle>
              <Link
                href="/skills"
                className="text-xs text-primary hover:underline"
                data-testid="link-all-skills"
              >
                View all →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall progress */}
            <div className="pb-3 border-b border-border/50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Overall Progress</span>
                <span className="text-sm font-bold font-mono">{overallPercent}%</span>
              </div>
              <Progress value={overallPercent} className="h-3" />
            </div>

            {/* Category bars */}
            <div className="space-y-3.5">
              {categoryStats.map(cat => (
                <CategoryProgress key={cat.name} {...cat} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Momentum Score */}
        <Card className="bg-card border-card-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Momentum
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 pb-5">
            <MomentumRing score={data.momentumScore} />
            <div className="w-full space-y-1.5">
              {[
                { label: "Deep Work", pts: 30, color: "bg-primary" },
                { label: "Courses", pts: 20, color: "bg-chart-2" },
                { label: "Shipped Code", pts: 20, color: "bg-chart-3" },
                { label: "Public Writing", pts: 15, color: "bg-chart-4" },
                { label: "Code Review", pts: 10, color: "bg-chart-5" },
                { label: "Networking", pts: 5, color: "bg-emerald-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  <div className={`h-2 w-2 rounded-full ${item.color} shrink-0`} />
                  <span className="text-muted-foreground flex-1">{item.label}</span>
                  <span className="font-mono text-muted-foreground">{item.pts}pt</span>
                </div>
              ))}
            </div>

            {/* Active Skills List */}
            {activeSkills.length > 0 && (
              <div className="w-full pt-3 border-t border-border/50">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Currently Learning
                </p>
                <div className="space-y-1">
                  {activeSkills.slice(0, 5).map(skill => (
                    <div key={skill.id} className="flex items-center gap-2 text-xs">
                      <div className={`h-1.5 w-1.5 rounded-full ${categoryColors[skill.category] || "bg-primary"} shrink-0`} />
                      <span className="truncate">{skill.name}</span>
                      <span className="ml-auto text-[10px] font-mono text-muted-foreground">
                        {skill.currentLevel}/{skill.targetLevel}
                      </span>
                    </div>
                  ))}
                  {activeSkills.length > 5 && (
                    <p className="text-[10px] text-muted-foreground">+{activeSkills.length - 5} more</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Journal */}
      <Card className="bg-card border-card-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              Recent Journal
            </CardTitle>
            <Link
              href="/journal"
              className="text-xs text-primary hover:underline"
              data-testid="link-journal"
            >
              Write entry →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {data.recentJournal.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No journal entries yet. Start writing today!
            </p>
          ) : (
            <div className="divide-y divide-border/50">
              {data.recentJournal.map((entry) => {
                const tags: string[] = JSON.parse(entry.tags || "[]");
                const score = (entry.deepWork ? 30 : 0) + (entry.courseProgress ? 20 : 0) +
                  (entry.shippedCode ? 20 : 0) + (entry.publicWriting ? 15 : 0) +
                  (entry.codeReview ? 10 : 0) + (entry.networking ? 5 : 0);
                return (
                  <div key={entry.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">{entry.date}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{entry.hoursWorked}h</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className={`text-xs font-mono font-bold ${score >= 70 ? "text-emerald-400" : score >= 40 ? "text-primary" : "text-amber-400"}`}>
                        {score}pt
                      </span>
                    </div>
                    <p className="text-sm line-clamp-2">{entry.learned}</p>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {tags.map(t => (
                          <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
