import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, BookOpen, Clock, Flame } from "lucide-react";
import type { JournalEntry } from "@shared/schema";
import { useState } from "react";

const allTags = ["Python", "ML", "DL", "RAG", "LLM", "Industrial AI", "Portfolio", "Networking", "PyTorch", "Docker", "MLOps"];

function MomentumBadge({ entry }: { entry: JournalEntry }) {
  const score = (entry.deepWork ? 30 : 0) + (entry.courseProgress ? 20 : 0) +
    (entry.shippedCode ? 20 : 0) + (entry.publicWriting ? 15 : 0) +
    (entry.codeReview ? 10 : 0) + (entry.networking ? 5 : 0);
  const color = score >= 70 ? "text-emerald-400" : score >= 40 ? "text-primary" : "text-amber-400";
  return <span className={`font-mono font-bold ${color}`}>{score}</span>;
}

export default function Journal() {
  const { toast } = useToast();
  const { data: entries, isLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/journal");
      return res.json();
    },
  });

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    learned: "",
    struggled: "",
    focusTomorrow: "",
    hoursWorked: 1,
    deepWork: false,
    courseProgress: false,
    shippedCode: false,
    publicWriting: false,
    codeReview: false,
    networking: false,
    tags: [] as string[],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/journal", {
        ...form,
        deepWork: form.deepWork ? 1 : 0,
        courseProgress: form.courseProgress ? 1 : 0,
        shippedCode: form.shippedCode ? 1 : 0,
        publicWriting: form.publicWriting ? 1 : 0,
        codeReview: form.codeReview ? 1 : 0,
        networking: form.networking ? 1 : 0,
        tags: JSON.stringify(form.tags),
        createdAt: new Date().toISOString(),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setForm({
        date: new Date().toISOString().split("T")[0],
        learned: "", struggled: "", focusTomorrow: "",
        hoursWorked: 1, deepWork: false, courseProgress: false,
        shippedCode: false, publicWriting: false, codeReview: false,
        networking: false, tags: [],
      });
      toast({ title: "Entry saved", description: "Keep the momentum going!" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/journal/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });

  const toggleTag = (tag: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }));
  };

  const momentumComponents = [
    { key: "deepWork" as const, label: "Deep Work", pts: 30 },
    { key: "courseProgress" as const, label: "Course Progress", pts: 20 },
    { key: "shippedCode" as const, label: "Shipped Code", pts: 20 },
    { key: "publicWriting" as const, label: "Public Writing", pts: 15 },
    { key: "codeReview" as const, label: "Code Review", pts: 10 },
    { key: "networking" as const, label: "Networking", pts: 5 },
  ];

  const currentScore = momentumComponents.reduce((sum, c) => sum + (form[c.key] ? c.pts : 0), 0);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto" data-testid="page-journal">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Daily Journal</h1>
        <p className="text-sm text-muted-foreground">Reflect, track, improve</p>
      </div>

      {/* New Entry Form */}
      <Card className="bg-card border-card-border border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Today's Entry
            <span className="ml-auto text-xs font-mono text-muted-foreground">
              Momentum: <span className={`font-bold ${currentScore >= 70 ? "text-emerald-400" : currentScore >= 40 ? "text-primary" : "text-amber-400"}`}>{currentScore}/100</span>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                data-testid="input-date"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Hours Worked</Label>
              <Input
                type="number"
                min={0}
                max={16}
                step={0.5}
                value={form.hoursWorked}
                onChange={e => setForm(p => ({ ...p, hoursWorked: parseFloat(e.target.value) || 0 }))}
                data-testid="input-hours"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">What I learned today</Label>
            <Textarea
              placeholder="Describe what you learned..."
              value={form.learned}
              onChange={e => setForm(p => ({ ...p, learned: e.target.value }))}
              rows={3}
              data-testid="input-learned"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">What I struggled with</Label>
            <Textarea
              placeholder="Any challenges or blockers..."
              value={form.struggled}
              onChange={e => setForm(p => ({ ...p, struggled: e.target.value }))}
              rows={2}
              data-testid="input-struggled"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Focus for tomorrow</Label>
            <Textarea
              placeholder="What will you tackle next..."
              value={form.focusTomorrow}
              onChange={e => setForm(p => ({ ...p, focusTomorrow: e.target.value }))}
              rows={2}
              data-testid="input-focus"
            />
          </div>

          {/* Momentum Checkboxes */}
          <div className="space-y-2">
            <Label className="text-xs">Momentum Score Components</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {momentumComponents.map(c => (
                <label key={c.key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={form[c.key]}
                    onCheckedChange={(checked) => setForm(p => ({ ...p, [c.key]: !!checked }))}
                    data-testid={`checkbox-${c.key}`}
                  />
                  <span>{c.label}</span>
                  <span className="text-[10px] text-muted-foreground">({c.pts}pt)</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-xs">Tags</Label>
            <div className="flex flex-wrap gap-1.5">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2 py-0.5 rounded-full text-xs border transition-colors ${
                    form.tags.includes(tag)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-muted-foreground border-border hover:border-primary/50"
                  }`}
                  data-testid={`tag-${tag}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => createMutation.mutate()}
            disabled={!form.learned || createMutation.isPending}
            className="w-full sm:w-auto"
            data-testid="button-save-journal"
          >
            {createMutation.isPending ? "Saving..." : "Save Entry"}
          </Button>
        </CardContent>
      </Card>

      {/* Previous Entries */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          Previous Entries ({entries?.length || 0})
        </h2>
        {entries && entries.length === 0 ? (
          <Card className="bg-card border-card-border">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No entries yet. Your first journal entry will appear here.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {entries?.map((entry) => {
              const tags: string[] = JSON.parse(entry.tags || "[]");
              return (
                <Card key={entry.id} className="bg-card border-card-border" data-testid={`journal-entry-${entry.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-mono text-muted-foreground">{entry.date}</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" /> {entry.hoursWorked}h
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Flame className="h-3 w-3" /> <MomentumBadge entry={entry} />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => deleteMutation.mutate(entry.id)}
                        data-testid={`delete-entry-${entry.id}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="space-y-2 text-sm">
                      {entry.learned && (
                        <div>
                          <span className="text-xs font-semibold text-muted-foreground">Learned:</span>
                          <p className="mt-0.5">{entry.learned}</p>
                        </div>
                      )}
                      {entry.struggled && (
                        <div>
                          <span className="text-xs font-semibold text-muted-foreground">Struggled:</span>
                          <p className="mt-0.5">{entry.struggled}</p>
                        </div>
                      )}
                      {entry.focusTomorrow && (
                        <div>
                          <span className="text-xs font-semibold text-muted-foreground">Tomorrow:</span>
                          <p className="mt-0.5">{entry.focusTomorrow}</p>
                        </div>
                      )}
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {tags.map(t => (
                          <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0">{t}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
