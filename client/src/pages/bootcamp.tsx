import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, Clock, CheckCircle2, Circle, Loader2 } from "lucide-react";
import type { BootcampDay } from "@shared/schema";
import { useState } from "react";

const statusColors: Record<string, string> = {
  not_started: "bg-muted text-muted-foreground",
  in_progress: "bg-primary/20 text-primary border-primary/30",
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const statusLabels: Record<string, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
};

function ScheduleBlock({ items }: { items: Array<{ time: string; task: string; resource?: string }> }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-3 text-sm">
          <span className="font-mono text-xs text-muted-foreground w-24 shrink-0 pt-0.5">{item.time}</span>
          <div className="min-w-0">
            <p>{item.task}</p>
            {item.resource && (
              <a
                href={item.resource}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-0.5"
              >
                Open resource <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Bootcamp() {
  const { data: days, isLoading } = useQuery<BootcampDay[]>({
    queryKey: ["/api/bootcamp"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/bootcamp");
      return res.json();
    },
  });

  const [activeTab, setActiveTab] = useState("1");

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/bootcamp/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bootcamp"] });
    },
  });

  if (isLoading || !days) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const completed = days.filter(d => d.status === "completed").length;
  const progressPercent = Math.round((completed / days.length) * 100);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto" data-testid="page-bootcamp">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Bootcamp</h1>
        <p className="text-sm text-muted-foreground">6-Day Intensive · April 3-8, 2026</p>
      </div>

      {/* Overall Progress */}
      <div className="flex items-center gap-4">
        <Progress value={progressPercent} className="h-2 flex-1" />
        <span className="text-sm font-mono text-muted-foreground">{completed}/{days.length}</span>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-6 h-auto">
          {days.map((day) => (
            <TabsTrigger
              key={day.dayNumber}
              value={String(day.dayNumber)}
              className="flex flex-col py-2 text-xs data-[state=active]:text-primary"
              data-testid={`tab-day-${day.dayNumber}`}
            >
              <span className="font-bold">Day {day.dayNumber}</span>
              <span className="hidden sm:inline text-[10px] text-muted-foreground truncate max-w-full">
                {day.theme.split(" ").slice(0, 2).join(" ")}
              </span>
              {day.status === "completed" && <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5" />}
              {day.status === "in_progress" && <Loader2 className="h-3 w-3 text-primary animate-spin mt-0.5" />}
            </TabsTrigger>
          ))}
        </TabsList>

        {days.map((day) => {
          const morning = JSON.parse(day.morningSchedule || "[]");
          const afternoon = JSON.parse(day.afternoonSchedule || "[]");
          const outputs: string[] = JSON.parse(day.expectedOutputs || "[]");

          return (
            <TabsContent key={day.dayNumber} value={String(day.dayNumber)} className="mt-4">
              <Card className="bg-card border-card-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <CardTitle className="text-lg font-bold">
                        Day {day.dayNumber}: {day.theme}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{day.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[day.status]} variant="outline">
                        {statusLabels[day.status]}
                      </Badge>
                      {day.status === "not_started" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => statusMutation.mutate({ id: day.id, status: "in_progress" })}
                          data-testid={`button-start-day-${day.dayNumber}`}
                        >
                          Start
                        </Button>
                      )}
                      {day.status === "in_progress" && (
                        <Button
                          size="sm"
                          onClick={() => statusMutation.mutate({ id: day.id, status: "completed" })}
                          data-testid={`button-complete-day-${day.dayNumber}`}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> Morning
                    </h3>
                    <ScheduleBlock items={morning} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> Afternoon
                    </h3>
                    <ScheduleBlock items={afternoon} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Expected Outputs
                    </h3>
                    <div className="space-y-2">
                      {outputs.map((output, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Checkbox disabled={day.status !== "in_progress"} />
                          <span>{output}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
