import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Target, 
  CheckCircle2, 
  Archive, 
  BookOpen, 
  Calendar,
  Lock,
  Users,
  Globe,
  Sparkles,
  ChevronRight,
  Milestone,
} from "lucide-react";
import { Link } from "wouter";
import type { FaithExpectationWithDetails } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import CreateExpectationDialog from "@/components/CreateExpectationDialog";
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

const PRIVACY_ICONS = {
  private: Lock,
  community: Users,
  public: Globe,
};

function ExpectationCard({ expectation }: { expectation: FaithExpectationWithDetails }) {
  const PrivacyIcon = PRIVACY_ICONS[expectation.privacy as keyof typeof PRIVACY_ICONS] || Lock;
  const progress = expectation.totalMilestones 
    ? Math.round((expectation.completedMilestones || 0) / expectation.totalMilestones * 100)
    : 0;

  return (
    <Link href={`/expectations/${expectation.id}`}>
      <Card 
        className="expectation-card hover-elevate cursor-pointer transition-all border border-border/50"
        data-testid={`card-expectation-${expectation.id}`}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${CATEGORY_COLORS[expectation.category] || CATEGORY_COLORS.Others}`}
                >
                  {expectation.category}
                </Badge>
                <PrivacyIcon className="h-3.5 w-3.5 text-muted-foreground" />
                {expectation.status === "answered" && (
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Answered
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-lg leading-tight line-clamp-2" data-testid={`text-expectation-title-${expectation.id}`}>
                {expectation.title}
              </h3>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
          </div>

          {expectation.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {expectation.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {expectation.totalMilestones && expectation.totalMilestones > 0 ? (
              <div className="flex items-center gap-2 flex-1">
                <Milestone className="h-3.5 w-3.5" />
                <span>{expectation.completedMilestones}/{expectation.totalMilestones} milestones</span>
                <Progress value={progress} className="h-1.5 flex-1 max-w-20" />
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Milestone className="h-3.5 w-3.5" />
                <span>No milestones</span>
              </div>
            )}
            
            {expectation.scriptures && expectation.scriptures.length > 0 && (
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                <span>{expectation.scriptures.length}</span>
              </div>
            )}

            {expectation.targetDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDistanceToNow(new Date(expectation.targetDate), { addSuffix: true })}</span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Created {formatDistanceToNow(new Date(expectation.createdAt!), { addSuffix: true })}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ExpectationsList({ 
  expectations, 
  isLoading, 
  emptyMessage,
  emptyIcon: EmptyIcon = Target 
}: { 
  expectations?: FaithExpectationWithDetails[];
  isLoading: boolean;
  emptyMessage: string;
  emptyIcon?: React.ElementType;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!expectations || expectations.length === 0) {
    return (
      <Card className="expectation-empty overflow-hidden border-dashed bg-gradient-to-br from-primary/[0.035] via-card to-amber-500/[0.04]">
        <CardContent className="relative py-12 text-center sm:py-16">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <EmptyIcon className="h-7 w-7" />
          </div>
          <p className="mx-auto max-w-md text-base font-medium text-foreground">{emptyMessage}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Every journey begins with a hope. Write it down, add a promise that strengthens you, and come back to record each step.
          </p>
          <div className="mx-auto mt-8 flex max-w-sm items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-primary/70" />Hope</span>
            <span className="mx-2 h-px flex-1 bg-primary/20" />
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-primary/40" />Promise</span>
            <span className="mx-2 h-px flex-1 bg-primary/20" />
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />Remember</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {expectations.map((expectation) => (
        <ExpectationCard key={expectation.id} expectation={expectation} />
      ))}
    </div>
  );
}

export default function Expectations() {
  const { user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("active");

  const { data: activeExpectations, isLoading: activeLoading } = useQuery<FaithExpectationWithDetails[]>({
    queryKey: ["/api/expectations/my", { status: "active" }],
    queryFn: async () => {
      const res = await fetch("/api/expectations/my?status=active");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: answeredExpectations, isLoading: answeredLoading } = useQuery<FaithExpectationWithDetails[]>({
    queryKey: ["/api/expectations/my", { status: "answered" }],
    queryFn: async () => {
      const res = await fetch("/api/expectations/my?status=answered");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: allExpectations, isLoading: allLoading } = useQuery<FaithExpectationWithDetails[]>({
    queryKey: ["/api/expectations/my"],
    queryFn: async () => {
      const res = await fetch("/api/expectations/my");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const activeCount = activeExpectations?.length || 0;
  const answeredCount = answeredExpectations?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      <section className="px-4 py-8 md:py-12 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 
                className="text-4xl md:text-5xl font-bold tracking-tight mb-3"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                data-testid="text-expectations-title"
              >
                Faith Expectations
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Give your hopes a place to grow. Hold on to the promises you're praying over, notice each small step, and remember what God has done.
              </p>
            </div>
            <Button 
              size="lg" 
              className="rounded-full font-bold shadow-lg hover:shadow-xl transition-all gap-2"
              onClick={() => setCreateDialogOpen(true)}
              data-testid="button-create-expectation"
            >
              <Plus className="h-5 w-5" />
              New Expectation
            </Button>
            <div className="hidden md:block w-44 shrink-0" aria-hidden="true">
              <svg viewBox="0 0 180 140" className="expectation-art h-36 w-full" fill="none">
                <circle cx="126" cy="42" r="23" fill="hsl(var(--primary) / .12)" />
                <circle cx="126" cy="42" r="13" fill="hsl(var(--primary) / .55)" />
                <path d="M13 123c26-31 48-32 67-7 14 18 28 10 39-5 12-17 26-17 48 7" stroke="hsl(var(--primary) / .42)" strokeWidth="3" strokeLinecap="round" />
                <path d="M16 128h148" stroke="hsl(var(--primary) / .18)" strokeWidth="2" strokeLinecap="round" />
                <path d="M43 108c6-11 14-17 22-18m53 15c6-10 12-15 20-17" stroke="hsl(var(--primary) / .3)" strokeWidth="2" strokeLinecap="round" />
                <path d="M35 53l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Zm65-33 1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5 1.5-4Z" fill="hsl(var(--primary) / .55)" />
              </svg>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-6 md:mt-8">
            <Card className="flex-1 border-primary/20 bg-primary/5">
              <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-active-count">{activeCount}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </CardContent>
            </Card>
            <Card className="flex-1 border-green-500/20 bg-green-500/5">
              <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-answered-count">{answeredCount}</p>
                  <p className="text-sm text-muted-foreground">Answered</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 grid w-full max-w-xl grid-cols-3">
            <TabsTrigger value="active" className="gap-1.5 px-2 text-xs sm:gap-2 sm:px-3 sm:text-sm" data-testid="tab-active">
              <Target className="h-4 w-4" />
              Active ({activeCount})
            </TabsTrigger>
            <TabsTrigger value="answered" className="gap-1.5 px-2 text-xs sm:gap-2 sm:px-3 sm:text-sm" data-testid="tab-answered">
              <CheckCircle2 className="h-4 w-4" />
              Answered ({answeredCount})
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-1.5 px-2 text-xs sm:gap-2 sm:px-3 sm:text-sm" data-testid="tab-all">
              All
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <ExpectationsList
              expectations={activeExpectations}
              isLoading={activeLoading}
              emptyMessage="You haven't created any faith expectations yet. Start by declaring what you're believing God for!"
              emptyIcon={Target}
            />
          </TabsContent>

          <TabsContent value="answered">
            <ExpectationsList
              expectations={answeredExpectations}
              isLoading={answeredLoading}
              emptyMessage="No answered expectations yet. Keep believing - God is faithful!"
              emptyIcon={Sparkles}
            />
          </TabsContent>

          <TabsContent value="all">
            <ExpectationsList
              expectations={allExpectations}
              isLoading={allLoading}
              emptyMessage="No expectations found. Create your first one!"
              emptyIcon={Target}
            />
          </TabsContent>
        </Tabs>
      </div>

      <CreateExpectationDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}
