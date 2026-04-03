import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SiGithub, SiX, SiSubstack } from "react-icons/si";
import { Linkedin } from "lucide-react";
import { Plus, TrendingUp } from "lucide-react";
import type { VisibilityLog } from "@shared/schema";
import { useState } from "react";

const platforms = [
  {
    key: "github",
    label: "GitHub",
    icon: SiGithub,
    color: "text-foreground",
    targets: { commits: 7, repos: 6 },
    fields: [
      { name: "githubCommits" as const, label: "Commits this week", target: 7 },
      { name: "githubRepos" as const, label: "Total repos", target: 6 },
    ],
  },
  {
    key: "twitter",
    label: "X / Twitter",
    icon: SiX,
    color: "text-foreground",
    targets: { posts: 5, followers: 0 },
    fields: [
      { name: "twitterPosts" as const, label: "Posts this week", target: 5 },
      { name: "twitterFollowers" as const, label: "Followers", target: 0 },
    ],
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    color: "text-blue-400",
    targets: { posts: 3, connections: 0 },
    fields: [
      { name: "linkedinPosts" as const, label: "Posts this week", target: 3 },
      { name: "linkedinConnections" as const, label: "Connections", target: 0 },
    ],
  },
  {
    key: "substack",
    label: "Substack",
    icon: SiSubstack,
    color: "text-orange-400",
    targets: { articles: 1, subscribers: 0 },
    fields: [
      { name: "substackArticles" as const, label: "Articles this week", target: 1 },
      { name: "substackSubscribers" as const, label: "Subscribers", target: 0 },
    ],
  },
];

export default function Visibility() {
  const { toast } = useToast();
  const { data: logs, isLoading } = useQuery<VisibilityLog[]>({
    queryKey: ["/api/visibility"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/visibility");
      return res.json();
    },
  });

  const getMonday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split("T")[0];
  };

  const [form, setForm] = useState({
    weekOf: getMonday(),
    githubCommits: 0,
    githubRepos: 0,
    twitterPosts: 0,
    twitterFollowers: 0,
    linkedinPosts: 0,
    linkedinConnections: 0,
    substackArticles: 0,
    substackSubscribers: 0,
    notes: "",
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/visibility", {
        ...form,
        createdAt: new Date().toISOString(),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/visibility"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({ title: "Visibility log saved" });
    },
  });

  const updateField = (field: string, value: number | string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto" data-testid="page-visibility">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Visibility Tracker</h1>
        <p className="text-sm text-muted-foreground">Track your public presence across platforms</p>
      </div>

      {/* Platform Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          return (
            <Card key={platform.key} className="bg-card border-card-border" data-testid={`card-${platform.key}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${platform.color}`} />
                  {platform.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {platform.fields.map((field) => {
                  const value = form[field.name] as number;
                  const progress = field.target > 0 ? Math.min(100, Math.round((value / field.target) * 100)) : 0;
                  return (
                    <div key={field.name} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">{field.label}</Label>
                        {field.target > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            target: {field.target}/wk
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          value={value}
                          onChange={e => updateField(field.name, parseInt(e.target.value) || 0)}
                          className="h-8 w-20"
                          data-testid={`input-${field.name}`}
                        />
                        {field.target > 0 && <Progress value={progress} className="h-1.5 flex-1" />}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Notes + Save */}
      <Card className="bg-card border-card-border">
        <CardContent className="p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Week of</Label>
              <Input
                type="date"
                value={form.weekOf}
                onChange={e => updateField("weekOf", e.target.value)}
                data-testid="input-weekOf"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Notes</Label>
              <Textarea
                placeholder="Weekly reflection..."
                value={form.notes}
                onChange={e => updateField("notes", e.target.value)}
                rows={2}
                data-testid="input-notes"
              />
            </div>
          </div>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            data-testid="button-save-visibility"
          >
            <Plus className="h-4 w-4 mr-1" />
            {createMutation.isPending ? "Saving..." : "Log This Week"}
          </Button>
        </CardContent>
      </Card>

      {/* History */}
      {logs && logs.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            Weekly History
          </h2>
          <div className="space-y-2">
            {logs.map((log) => (
              <Card key={log.id} className="bg-card border-card-border" data-testid={`visibility-log-${log.id}`}>
                <CardContent className="p-3">
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="font-mono text-muted-foreground">{log.weekOf}</span>
                    <Badge variant="secondary" className="gap-1">
                      <SiGithub className="h-3 w-3" /> {log.githubCommits} commits
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <SiX className="h-3 w-3" /> {log.twitterPosts} posts
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Linkedin className="h-3 w-3" /> {log.linkedinPosts} posts
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <SiSubstack className="h-3 w-3" /> {log.substackArticles} articles
                    </Badge>
                    {log.notes && <span className="text-muted-foreground">{log.notes}</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
