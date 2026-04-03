import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, MapPin, CheckCircle2, Clock, Circle } from "lucide-react";
import type { Phase } from "@shared/schema";
import { useState } from "react";

const phaseColors = [
  "border-l-amber-400",
  "border-l-primary",
  "border-l-violet-400",
  "border-l-emerald-400",
  "border-l-rose-400",
];

export default function Roadmap() {
  const { data: phases, isLoading } = useQuery<Phase[]>({
    queryKey: ["/api/phases"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/phases");
      return res.json();
    },
  });

  const [openPhases, setOpenPhases] = useState<Set<number>>(new Set([0]));

  if (isLoading || !phases) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20" />)}
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  const togglePhase = (idx: number) => {
    setOpenPhases(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // Total timeline
  const timelineStart = new Date("2026-04-03");
  const timelineEnd = new Date("2027-01-01");
  const totalMs = timelineEnd.getTime() - timelineStart.getTime();
  const now = new Date();
  const currentPosition = Math.min(100, Math.max(0, ((now.getTime() - timelineStart.getTime()) / totalMs) * 100));

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto" data-testid="page-roadmap">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Roadmap</h1>
        <p className="text-sm text-muted-foreground">April 2026 → January 2027 · 5 Phases</p>
      </div>

      {/* Timeline Bar */}
      <div className="relative">
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-primary to-violet-400 rounded-full transition-all"
            style={{ width: `${currentPosition}%` }}
          />
        </div>
        <div
          className="absolute top-0 h-3 w-0.5 bg-foreground"
          style={{ left: `${currentPosition}%` }}
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-muted-foreground">Apr 2026</span>
          <span className="text-[10px] text-muted-foreground">Jan 2027</span>
        </div>
      </div>

      {/* Phase blocks */}
      <div className="space-y-3">
        {phases.map((phase, idx) => {
          const isCurrent = today >= phase.startDate && today <= phase.endDate;
          const isPast = today > phase.endDate;
          const courses: string[] = JSON.parse(phase.courses || "[]");
          const projects: string[] = JSON.parse(phase.projects || "[]");
          const milestones: string[] = JSON.parse(phase.milestones || "[]");

          const phaseStart = new Date(phase.startDate);
          const phaseEnd = new Date(phase.endDate);
          const phaseDuration = phaseEnd.getTime() - phaseStart.getTime();
          const phaseElapsed = Math.min(phaseDuration, Math.max(0, now.getTime() - phaseStart.getTime()));
          const phaseProgress = isPast ? 100 : isCurrent ? Math.round((phaseElapsed / phaseDuration) * 100) : 0;

          const isOpen = openPhases.has(idx);

          return (
            <Collapsible key={phase.id} open={isOpen} onOpenChange={() => togglePhase(idx)}>
              <Card className={`bg-card border-card-border border-l-4 ${phaseColors[idx]} ${isCurrent ? "ring-1 ring-primary/30" : ""}`}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer pb-2 hover:bg-accent/30 transition-colors rounded-t-lg"
                    data-testid={`phase-trigger-${phase.phaseNumber}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                        <div>
                          <CardTitle className="text-sm font-bold flex items-center gap-2">
                            Phase {phase.phaseNumber}: {phase.name}
                            {isCurrent && (
                              <Badge className="bg-primary/20 text-primary text-[10px]" variant="outline">
                                <MapPin className="h-3 w-3 mr-0.5" /> Current
                              </Badge>
                            )}
                            {isPast && (
                              <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]" variant="outline">
                                <CheckCircle2 className="h-3 w-3 mr-0.5" /> Done
                              </Badge>
                            )}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(phase.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} — {new Date(phase.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">{phaseProgress}%</span>
                        <Progress value={phaseProgress} className="h-1.5 w-16" />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-4">
                    <p className="text-sm text-muted-foreground">{phase.description}</p>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Courses</h4>
                        <div className="space-y-1.5">
                          {courses.map((c, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <Circle className="h-3 w-3 text-muted-foreground shrink-0" />
                              <span>{c}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Projects</h4>
                        <div className="space-y-1.5">
                          {projects.map((p, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <Circle className="h-3 w-3 text-muted-foreground shrink-0" />
                              <span>{p}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Milestones</h4>
                        <div className="space-y-1.5">
                          {milestones.map((m, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                              <span>{m}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}
