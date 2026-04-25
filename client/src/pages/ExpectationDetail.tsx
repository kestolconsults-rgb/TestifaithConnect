import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Target,
  Lock,
  Users,
  Globe,
  Calendar,
  BookOpen,
  Plus,
  MoreVertical,
  CheckCircle2,
  Circle,
  Loader2,
  Trash2,
  Archive,
  Sparkles,
  PartyPopper,
  Edit,
  X,
  Search,
} from "lucide-react";
import type { FaithExpectationWithDetails, ExpectationMilestone, ExpectationScripture } from "@shared/schema";
import { formatDistanceToNow, format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

const CATEGORY_COLORS: Record<string, string> = {
  Healing: "bg-green-500/10 text-green-500 border-green-500/20",
  Marriage: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  Fruitfulness: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Finance: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Breakthrough: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  Deliverance: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  Career: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  "Spiritual Growth": "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  Others: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const PRIVACY_CONFIG = {
  private: { icon: Lock, label: "Private" },
  community: { icon: Users, label: "Community" },
  public: { icon: Globe, label: "Public" },
};

function MilestoneItem({ 
  milestone, 
  isOwner,
  onStatusChange 
}: { 
  milestone: ExpectationMilestone;
  isOwner: boolean;
  onStatusChange: (id: string, status: string) => void;
}) {
  const isCompleted = milestone.status === "completed";

  return (
    <div 
      className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
        isCompleted ? "bg-green-500/5" : "hover-elevate"
      }`}
      data-testid={`milestone-${milestone.id}`}
    >
      {isOwner ? (
        <Checkbox
          checked={isCompleted}
          onCheckedChange={(checked) => {
            onStatusChange(milestone.id, checked ? "completed" : "pending");
          }}
          className="mt-0.5"
          data-testid={`checkbox-milestone-${milestone.id}`}
        />
      ) : (
        isCompleted ? (
          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
        )
      )}
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
          {milestone.title}
        </p>
        {milestone.notes && (
          <p className="text-sm text-muted-foreground mt-1">{milestone.notes}</p>
        )}
        {milestone.completedAt && (
          <p className="text-xs text-green-500 mt-1">
            Completed {formatDistanceToNow(new Date(milestone.completedAt), { addSuffix: true })}
          </p>
        )}
      </div>
    </div>
  );
}

function ScriptureItem({ 
  scripture,
  isOwner,
  onDelete 
}: { 
  scripture: ExpectationScripture;
  isOwner: boolean;
  onDelete: (id: string) => void;
}) {
  return (
    <div 
      className="p-4 rounded-lg bg-primary/5 border border-primary/10"
      data-testid={`scripture-${scripture.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="font-medium text-primary">{scripture.reference}</span>
            {scripture.translation && (
              <Badge variant="outline" className="text-xs">{scripture.translation}</Badge>
            )}
            {scripture.isPrimary && (
              <Badge className="bg-primary/10 text-primary text-xs">Primary</Badge>
            )}
          </div>
          {scripture.passageText && (
            <p className="text-sm text-muted-foreground italic">"{scripture.passageText}"</p>
          )}
        </div>
        {isOwner && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onDelete(scripture.id)}
            data-testid={`button-delete-scripture-${scripture.id}`}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default function ExpectationDetail() {
  const [, params] = useRoute("/expectations/:id");
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const expectationId = params?.id;

  const [celebrateDialogOpen, setCelebrateDialogOpen] = useState(false);
  const [celebrationNote, setCelebrationNote] = useState("");
  const [addMilestoneOpen, setAddMilestoneOpen] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [addScriptureOpen, setAddScriptureOpen] = useState(false);
  const [newScriptureRef, setNewScriptureRef] = useState("");
  const [newScriptureText, setNewScriptureText] = useState("");
  const [isSearchingBible, setIsSearchingBible] = useState(false);

  const { data: expectation, isLoading } = useQuery<FaithExpectationWithDetails>({
    queryKey: ["/api/expectations", expectationId],
    queryFn: async () => {
      const res = await fetch(`/api/expectations/${expectationId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!expectationId,
  });

  const isOwner = user?.id === expectation?.userId;

  const updateMilestoneStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/milestones/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expectations", expectationId] });
    },
  });

  const addMilestone = useMutation({
    mutationFn: async (title: string) => {
      const sortOrder = (expectation?.milestones?.length || 0);
      const res = await apiRequest("POST", `/api/expectations/${expectationId}/milestones`, {
        title,
        sortOrder,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expectations", expectationId] });
      setAddMilestoneOpen(false);
      setNewMilestoneTitle("");
      toast({ title: "Milestone added!" });
    },
  });

  const addScripture = useMutation({
    mutationFn: async ({ reference, passageText }: { reference: string; passageText?: string }) => {
      const res = await apiRequest("POST", `/api/expectations/${expectationId}/scriptures`, {
        reference,
        passageText,
        translation: "NIV",
        isPrimary: !expectation?.scriptures?.length,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expectations", expectationId] });
      setAddScriptureOpen(false);
      setNewScriptureRef("");
      setNewScriptureText("");
      toast({ title: "Scripture added!" });
    },
  });

  const deleteScripture = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/scriptures/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expectations", expectationId] });
      toast({ title: "Scripture removed" });
    },
  });

  const markAnswered = useMutation({
    mutationFn: async (note: string) => {
      const res = await apiRequest("POST", `/api/expectations/${expectationId}/answer`, {
        celebrationNote: note,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expectations", expectationId] });
      queryClient.invalidateQueries({ queryKey: ["/api/expectations/my"] });
      setCelebrateDialogOpen(false);
      setCelebrationNote("");
      toast({ 
        title: "Praise God!", 
        description: "Your faith expectation has been marked as answered!" 
      });
    },
  });

  const archiveExpectation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/expectations/${expectationId}/archive`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expectations/my"] });
      toast({ title: "Expectation archived" });
      navigate("/expectations");
    },
  });

  const deleteExpectation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/expectations/${expectationId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expectations/my"] });
      toast({ title: "Expectation deleted" });
      navigate("/expectations");
    },
  });

  const searchBibleVerse = async () => {
    if (!newScriptureRef.trim()) {
      toast({ title: "Please enter a scripture reference", variant: "destructive" });
      return;
    }
    
    setIsSearchingBible(true);
    try {
      const response = await fetch(`https://bible-api.com/${encodeURIComponent(newScriptureRef)}?translation=kjv`);
      if (!response.ok) {
        throw new Error("Verse not found");
      }
      const data = await response.json();
      if (data.text) {
        setNewScriptureText(data.text.trim());
        toast({ title: "Verse found!", description: data.reference });
      } else {
        throw new Error("No text found");
      }
    } catch (error) {
      toast({ 
        title: "Verse not found", 
        description: "Please check the reference format (e.g., John 3:16 or Romans 8:28)",
        variant: "destructive" 
      });
    } finally {
      setIsSearchingBible(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!expectation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Expectation Not Found</h2>
            <p className="text-muted-foreground mb-4">This expectation may have been deleted or is private.</p>
            <Link href="/expectations">
              <Button>Back to Expectations</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const PrivacyIcon = PRIVACY_CONFIG[expectation.privacy as keyof typeof PRIVACY_CONFIG]?.icon || Lock;
  const privacyLabel = PRIVACY_CONFIG[expectation.privacy as keyof typeof PRIVACY_CONFIG]?.label || "Private";
  const progress = expectation.totalMilestones 
    ? Math.round((expectation.completedMilestones || 0) / expectation.totalMilestones * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/expectations">
            <Button variant="ghost" className="gap-2" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>

          {isOwner && expectation.status === "active" && (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setCelebrateDialogOpen(true)}
                className="gap-2 bg-green-500 hover:bg-green-600"
                data-testid="button-celebrate"
              >
                <PartyPopper className="h-4 w-4" />
                Celebrate Answer
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-more-actions">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => archiveExpectation.mutate()}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => deleteExpectation.mutate()}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge 
              variant="outline" 
              className={CATEGORY_COLORS[expectation.category] || CATEGORY_COLORS.Others}
            >
              {expectation.category}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <PrivacyIcon className="h-3 w-3" />
              {privacyLabel}
            </Badge>
            {expectation.status === "answered" && (
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20 gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Answered
              </Badge>
            )}
            {expectation.status === "archived" && (
              <Badge variant="secondary" className="gap-1">
                <Archive className="h-3 w-3" />
                Archived
              </Badge>
            )}
          </div>

          <h1 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            data-testid="text-expectation-title"
          >
            {expectation.title}
          </h1>

          {expectation.description && (
            <p className="text-lg text-muted-foreground mb-4">{expectation.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>Created {formatDistanceToNow(new Date(expectation.createdAt!), { addSuffix: true })}</span>
            {expectation.targetDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Target: {format(new Date(expectation.targetDate), "PPP")}
              </span>
            )}
            {expectation.answeredAt && (
              <span className="flex items-center gap-1 text-green-500">
                <Sparkles className="h-4 w-4" />
                Answered {formatDistanceToNow(new Date(expectation.answeredAt), { addSuffix: true })}
              </span>
            )}
          </div>

          {expectation.celebrationNote && (
            <Card className="mt-4 border-green-500/20 bg-green-500/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <PartyPopper className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-500 mb-1">Celebration Note</p>
                    <p className="text-muted-foreground">{expectation.celebrationNote}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {expectation.totalMilestones && expectation.totalMilestones > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">
                  {expectation.completedMilestones}/{expectation.totalMilestones} milestones
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
              <CardTitle className="text-lg">Milestones</CardTitle>
              {isOwner && expectation.status === "active" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddMilestoneOpen(true)}
                  data-testid="button-add-milestone"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              {expectation.milestones && expectation.milestones.length > 0 ? (
                <div className="space-y-2">
                  {expectation.milestones.map((milestone) => (
                    <MilestoneItem
                      key={milestone.id}
                      milestone={milestone}
                      isOwner={isOwner}
                      onStatusChange={(id, status) => updateMilestoneStatus.mutate({ id, status })}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Circle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No milestones yet</p>
                  {isOwner && expectation.status === "active" && (
                    <Button
                      variant="ghost"
                      onClick={() => setAddMilestoneOpen(true)}
                      className="mt-2 text-primary"
                    >
                      Add your first milestone
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
              <CardTitle className="text-lg">Scriptures</CardTitle>
              {isOwner && expectation.status === "active" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddScriptureOpen(true)}
                  data-testid="button-add-scripture"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              {expectation.scriptures && expectation.scriptures.length > 0 ? (
                <div className="space-y-3">
                  {expectation.scriptures.map((scripture) => (
                    <ScriptureItem
                      key={scripture.id}
                      scripture={scripture}
                      isOwner={isOwner}
                      onDelete={(id) => deleteScripture.mutate(id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No scriptures linked yet</p>
                  {isOwner && expectation.status === "active" && (
                    <Button
                      variant="ghost"
                      onClick={() => setAddScriptureOpen(true)}
                      className="mt-2 text-primary"
                    >
                      Link a scripture
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={celebrateDialogOpen} onOpenChange={setCelebrateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PartyPopper className="h-5 w-5 text-green-500" />
              Celebrate God's Answer!
            </DialogTitle>
            <DialogDescription>
              God has answered your faith expectation! Share how He moved in your situation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Share your testimony of God's faithfulness... (optional)"
              value={celebrationNote}
              onChange={(e) => setCelebrationNote(e.target.value)}
              className="min-h-32"
              data-testid="input-celebration-note"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCelebrateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => markAnswered.mutate(celebrationNote)}
              disabled={markAnswered.isPending}
              className="bg-green-500 hover:bg-green-600 gap-2"
              data-testid="button-confirm-celebrate"
            >
              {markAnswered.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Mark as Answered
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addMilestoneOpen} onOpenChange={setAddMilestoneOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Milestone</DialogTitle>
            <DialogDescription>
              Track your progress by adding steps toward your faith expectation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="e.g., Started praying daily for this..."
              value={newMilestoneTitle}
              onChange={(e) => setNewMilestoneTitle(e.target.value)}
              data-testid="input-milestone-title"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMilestoneOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => addMilestone.mutate(newMilestoneTitle)}
              disabled={!newMilestoneTitle.trim() || addMilestone.isPending}
              data-testid="button-confirm-add-milestone"
            >
              {addMilestone.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Milestone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addScriptureOpen} onOpenChange={setAddScriptureOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link a Scripture</DialogTitle>
            <DialogDescription>
              Add a Bible verse that supports your faith expectation. Enter a reference and click "Lookup" to auto-fill the verse text.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Scripture Reference</label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Jeremiah 29:11"
                  value={newScriptureRef}
                  onChange={(e) => setNewScriptureRef(e.target.value)}
                  className="flex-1"
                  data-testid="input-scripture-reference"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={searchBibleVerse}
                  disabled={isSearchingBible || !newScriptureRef.trim()}
                  data-testid="button-lookup-verse"
                >
                  {isSearchingBible ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-1" />
                  )}
                  {isSearchingBible ? "Looking..." : "Lookup"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Formats: John 3:16, Romans 8:28-30, Psalm 23:1-3
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Passage Text</label>
              <Textarea
                placeholder="Click 'Lookup' to auto-fill, or enter manually..."
                value={newScriptureText}
                onChange={(e) => setNewScriptureText(e.target.value)}
                className="min-h-24"
                data-testid="input-scripture-text"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddScriptureOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => addScripture.mutate({ 
                reference: newScriptureRef, 
                passageText: newScriptureText || undefined 
              })}
              disabled={!newScriptureRef.trim() || addScripture.isPending}
              data-testid="button-confirm-add-scripture"
            >
              {addScripture.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Scripture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
