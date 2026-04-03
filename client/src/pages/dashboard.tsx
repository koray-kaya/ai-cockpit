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
  GitCommit,
  FileText,
  Target,
  TrendingUp,
  Calendar,
} from "lucide-react";

interface DashboardData {
  dayNumber: number;
  totalDays: number;
  currentPhase: { phaseNumber: number; name: string; startDate: string; endDate: string; description: string; milestones: string };
  momentumScore: number;
  streak: number;
  totalHours: number;
  skillsCompleted: number;
  totalSkills: number;
  githubCommitsThisWeek: number;
  articlesPublished: number;
  bootcampCompleted: number;
  bootcampTotal: number;
  resourcesCompleted: number;
  resourcesTotal: number;
  recentJournal: Array<{ id: number; date: string; learned: string; hoursWorked: number; tags: string }>;
  phases: Array<{ phaseNumber: number; name: string; startDate: string; endDate: string }>;
}

function MomentumRing({ score }: { score: number }) {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "text-emerald-400" : score >= 40 ? "text-primary" : "text-amber-400";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle
          cx="70" cy="70" r={radius}
          className="stroke-muted"
          strokeWidth="8" fill="none"
        />
        <circle
          cx="70" cy="70" r={radius}
          className={`stroke-current ${color}`}
          strokeWidth="8" fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold tracking-tight">{score}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Momentum</span>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) {
  return (
    <Card className="bg-card border-card-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            <p className="text-lg font-bold leading-tight">{value}</p>
            {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
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

  if (isLoading || !data) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const phaseProgress = (() => {
    const now = new Date();
    const start = new Date(data.currentPhase.startDate);
    const end = new Date(data.currentPhase.endDate);
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  })();

  const milestones: string[] = JSON.parse(data.currentPhase.milestones || "[]");

  const momentumBreakdown = [
    { label: "Deep Work", pts: 30, color: "bg-primary" },
    { label: "Courses", pts: 20, color: "bg-chart-2" },
    { label: "Shipped Code", pts: 20, color: "bg-chart-3" },
    { label: "Public Writing", pts: 15, color: "bg-chart-4" },
    { label: "Code Review", pts: 10, color: "bg-chart-5" },
    { label: "Networking", pts: 5, color: "bg-emerald-500" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto" data-testid="page-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Day {data.dayNumber} of {data.totalDays}
          </h1>
          <p className="text-sm text-muted-foreground">
            Phase {data.currentPhase.phaseNumber}: {data.currentPhase.name}
          </p>
        </div>
        <Badge variant="outline" className="w-fit text-xs font-mono">
          <Calendar className="h-3 w-3 mr-1" />
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
        </Badge>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Clock} label="Total Hours" value={data.totalHours} />
        <StatCard icon={Brain} label="Skills" value={`${data.skillsCompleted}/${data.totalSkills}`} sub="mastered" />
        <StatCard icon={GitCommit} label="Commits" value={data.githubCommitsThisWeek} sub="this week" />
        <StatCard icon={FileText} label="Articles" value={data.articlesPublished} sub="published" />
      </div>

      {/* Momentum + Phase */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Momentum Score */}
        <Card className="bg-card border-card-border lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Momentum Score
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 pb-5">
            <MomentumRing score={data.momentumScore} />
            <div className="w-full space-y-1.5">
              {momentumBreakdown.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  <div className={`h-2 w-2 rounded-full ${item.color} shrink-0`} />
                  <span className="text-muted-foreground flex-1">{item.label}</span>
                  <span className="font-mono text-muted-foreground">{item.pts}pt</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Phase */}
        <Card className="bg-card border-card-border lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Phase {data.currentPhase.phaseNumber}: {data.currentPhase.name}
              </CardTitle>
              <span className="text-xs font-mono text-muted-foreground">{phaseProgress}%</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={phaseProgress} className="h-2" />
            <p className="text-sm text-muted-foreground">{data.currentPhase.description}</p>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Key Milestones</h4>
              <div className="space-y-1.5">
                {milestones.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-semibold">{data.streak} day streak</span>
              <span className="text-xs text-muted-foreground">Keep it going!</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Journal */}
      <Card className="bg-card border-card-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Recent Journal Entries</CardTitle>
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
                return (
                  <div key={entry.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">{entry.date}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{entry.hoursWorked}h</span>
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
