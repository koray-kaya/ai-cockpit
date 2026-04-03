import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Clock, CheckCircle2, Circle, Loader2 } from "lucide-react";
import type { Resource } from "@shared/schema";
import { useState } from "react";

const statusColors: Record<string, string> = {
  not_started: "text-muted-foreground",
  in_progress: "text-primary",
  completed: "text-emerald-400",
};

const statusIcons: Record<string, typeof Circle> = {
  not_started: Circle,
  in_progress: Loader2,
  completed: CheckCircle2,
};

export default function Resources() {
  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/resources");
      return res.json();
    },
  });

  const [phaseFilter, setPhaseFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [costFilter, setCostFilter] = useState("all");

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/resources/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
    },
  });

  if (isLoading || !resources) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16" />)}
      </div>
    );
  }

  const allCategories = [...new Set(resources.map(r => r.category))].sort();
  const allPhases = [...new Set(resources.map(r => r.phaseNumber))].sort();

  let filtered = resources;
  if (phaseFilter !== "all") filtered = filtered.filter(r => r.phaseNumber === parseInt(phaseFilter));
  if (categoryFilter !== "all") filtered = filtered.filter(r => r.category === categoryFilter);
  if (costFilter === "free") filtered = filtered.filter(r => r.isFree);
  if (costFilter === "paid") filtered = filtered.filter(r => !r.isFree);

  const completedCount = resources.filter(r => r.status === "completed").length;
  const totalHours = resources.reduce((s, r) => s + r.estimatedHours, 0);
  const completedHours = resources.filter(r => r.status === "completed").reduce((s, r) => s + r.estimatedHours, 0);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto" data-testid="page-resources">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Resources</h1>
          <p className="text-sm text-muted-foreground">
            {completedCount}/{resources.length} completed · {Math.round(completedHours)}/{Math.round(totalHours)} hours
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={phaseFilter} onValueChange={setPhaseFilter}>
          <SelectTrigger className="h-8 w-32 text-xs" data-testid="filter-phase">
            <SelectValue placeholder="Phase" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Phases</SelectItem>
            {allPhases.map(p => (
              <SelectItem key={p} value={String(p)}>Phase {p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-8 w-36 text-xs" data-testid="filter-category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {allCategories.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={costFilter} onValueChange={setCostFilter}>
          <SelectTrigger className="h-8 w-28 text-xs" data-testid="filter-cost">
            <SelectValue placeholder="Cost" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Resources List */}
      <div className="space-y-2">
        {filtered.map((resource) => {
          const StatusIcon = statusIcons[resource.status] || Circle;
          return (
            <Card key={resource.id} className="bg-card border-card-border" data-testid={`resource-${resource.id}`}>
              <CardContent className="p-3 flex items-center gap-3">
                <StatusIcon
                  className={`h-4 w-4 shrink-0 ${statusColors[resource.status]} ${resource.status === "in_progress" ? "animate-spin" : ""}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium hover:text-primary transition-colors inline-flex items-center gap-1"
                    >
                      {resource.name}
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </a>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{resource.platform}</Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">Phase {resource.phaseNumber}</Badge>
                    {!resource.isFree && <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-400 border-amber-400/30">Paid</Badge>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span>{resource.category}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {resource.estimatedHours}h</span>
                  </div>
                </div>
                <Select
                  value={resource.status}
                  onValueChange={(value) => updateMutation.mutate({ id: resource.id, status: value })}
                >
                  <SelectTrigger className="h-7 text-xs w-28 shrink-0" data-testid={`resource-status-${resource.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          No resources match the selected filters.
        </div>
      )}
    </div>
  );
}
