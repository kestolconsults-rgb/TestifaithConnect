import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, LogOut, Star, StarOff, Plus, Trash2, Check, Video, X, CheckCircle,
  BarChart3, Users, MessageSquare, BookOpen, Shield, History,
  UserX, UserCheck, Eye, EyeOff, Calendar, Heart, HandHeart, Upload, Play,
  Headphones, ChevronDown, ChevronUp, Mail, Clock
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { TestimonyWithUser, FaithDeclaration, EncouragementVerse, User, Comment } from "@shared/schema";
import { format } from "date-fns";

interface AdminSession {
  authenticated: boolean;
  adminId?: string;
  adminUsername?: string;
}

interface Analytics {
  totalUsers: number;
  totalTestimonies: number;
  totalComments: number;
  totalAmens: number;
  totalEncouragements: number;
  monthlyUsers: number;
  monthlyTestimonies: number;
  pendingVideos: number;
  suspendedUsers: number;
}

interface AdminUser {
  id: string;
  username: string;
  displayName?: string;
  createdAt: Date;
}

interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: Date;
  admin?: { username: string };
}

type UserWithStats = User;

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await apiRequest("POST", "/api/admin/login", { username, password });
      toast({ title: "Login successful" });
      onLogin();
    } catch (error: any) {
      toast({ 
        title: "Login failed", 
        description: error.message || "Invalid credentials",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white font-['Space_Grotesk']">Admin Login</CardTitle>
          <CardDescription className="text-zinc-400">
            Testifaith Administration Panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                data-testid="input-admin-username"
              />
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white pr-10"
                data-testid="input-admin-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                tabIndex={-1}
                data-testid="button-toggle-admin-password"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-red-500 hover:bg-red-600"
              disabled={isLoading}
              data-testid="button-admin-login"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function AnalyticsDashboard() {
  const { data: analytics, isLoading } = useQuery<Analytics>({
    queryKey: ["/api/admin/analytics"],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!analytics) return null;

  const stats = [
    { label: "Total Users", value: analytics.totalUsers, icon: Users, color: "text-blue-400" },
    { label: "Total Testimonies", value: analytics.totalTestimonies, icon: BookOpen, color: "text-green-400" },
    { label: "Total Comments", value: analytics.totalComments, icon: MessageSquare, color: "text-purple-400" },
    { label: "Total Amens", value: analytics.totalAmens, icon: Heart, color: "text-red-400" },
    { label: "Total Encouragements", value: analytics.totalEncouragements, icon: HandHeart, color: "text-yellow-400" },
    { label: "This Month Users", value: analytics.monthlyUsers, icon: Calendar, color: "text-cyan-400" },
    { label: "This Month Testimonies", value: analytics.monthlyTestimonies, icon: Calendar, color: "text-emerald-400" },
    { label: "Pending Videos", value: analytics.pendingVideos, icon: Video, color: "text-orange-400" },
    { label: "Suspended Users", value: analytics.suspendedUsers, icon: UserX, color: "text-red-500" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-zinc-800 border-zinc-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-zinc-400">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function UserManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [suspendReason, setSuspendReason] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: users, isLoading } = useQuery<UserWithStats[]>({
    queryKey: ["/api/admin/users"],
  });

  const filteredUsers = users?.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      (u.email ?? "").toLowerCase().includes(q)
    );
  }) ?? [];

  const suspendMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiRequest("POST", `/api/admin/users/${id}/suspend`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
      toast({ title: "User suspended successfully" });
      setDialogOpen(false);
      setSuspendReason("");
      setSelectedUserId(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const unsuspendMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/admin/users/${id}/unsuspend`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
      toast({ title: "User unsuspended successfully" });
    },
  });

  const handleSuspend = () => {
    if (selectedUserId && suspendReason.trim()) {
      suspendMutation.mutate({ id: selectedUserId, reason: suspendReason.trim() });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-2 flex-wrap">
        <h3 className="text-lg font-semibold text-white">All Users</h3>
        <Badge className="bg-zinc-700">{filteredUsers.length}/{users?.length || 0} users</Badge>
      </div>

      <Input
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-zinc-800 border-zinc-700 text-white"
        data-testid="input-search-users"
      />

      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className={`flex items-center justify-between p-3 rounded-lg ${
              user.isSuspended ? "bg-red-900/20 border border-red-500/30" : "bg-zinc-800"
            }`}
            data-testid={`user-admin-${user.id}`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {user.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt={user.firstName || "User"}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
                  <Users className="w-5 h-5 text-zinc-400" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-white font-medium truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-zinc-400 text-sm truncate">{user.email}</p>
                {user.isSuspended && (
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="destructive" className="text-xs">Suspended</Badge>
                    {user.suspensionReason && (
                      <span className="text-xs text-red-400 truncate">{user.suspensionReason}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                asChild
                data-testid={`button-view-profile-${user.id}`}
              >
                <a href={`/profile/${user.id}`} target="_blank" rel="noopener noreferrer">
                  <Eye className="w-4 h-4 text-zinc-400" />
                </a>
              </Button>
              {user.isSuspended ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => unsuspendMutation.mutate(user.id)}
                  disabled={unsuspendMutation.isPending}
                  className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                  data-testid={`button-unsuspend-${user.id}`}
                >
                  <UserCheck className="w-4 h-4 mr-1" />
                  Unsuspend
                </Button>
              ) : (
                <Dialog open={dialogOpen && selectedUserId === user.id} onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) {
                    setSelectedUserId(null);
                    setSuspendReason("");
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUserId(user.id)}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      data-testid={`button-suspend-${user.id}`}
                    >
                      <UserX className="w-4 h-4 mr-1" />
                      Suspend
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-900 border-zinc-800">
                    <DialogHeader>
                      <DialogTitle className="text-white">Suspend User</DialogTitle>
                      <DialogDescription className="text-zinc-400">
                        Please provide a reason for suspending {user.firstName} {user.lastName}.
                      </DialogDescription>
                    </DialogHeader>
                    <Textarea
                      placeholder="Reason for suspension..."
                      value={suspendReason}
                      onChange={(e) => setSuspendReason(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      data-testid="input-suspend-reason"
                    />
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                        className="border-zinc-700 text-zinc-300"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleSuspend}
                        disabled={!suspendReason.trim() || suspendMutation.isPending}
                        data-testid="button-confirm-suspend"
                      >
                        {suspendMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Suspend User"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TestimonyModeration() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: testimonies, isLoading } = useQuery<TestimonyWithUser[]>({
    queryKey: ["/api/admin/testimonies"],
  });

  const filteredTestimonies = testimonies?.filter((t) => {
    const matchesSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) ?? [];

  const featureMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/admin/testimonies/${id}/feature`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonies"] });
      toast({ title: "Testimony featured successfully" });
    },
  });

  const clearFeaturedMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/testimonies/clear-featured"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonies"] });
      toast({ title: "Featured testimony cleared" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/testimonies/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
      toast({ title: "Testimony deleted" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  const featuredTestimony = testimonies?.find(t => t.isFeatured);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-2 flex-wrap">
        <h3 className="text-lg font-semibold text-white">All Testimonies</h3>
        <div className="flex gap-2 flex-wrap">
          <Badge className="bg-zinc-700">{filteredTestimonies.length}/{testimonies?.length || 0}</Badge>
          {featuredTestimony && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearFeaturedMutation.mutate()}
              disabled={clearFeaturedMutation.isPending}
              className="border-zinc-700 text-zinc-300"
              data-testid="button-clear-featured"
            >
              <StarOff className="w-4 h-4 mr-1" />
              Clear Featured
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Input
          placeholder="Search title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-zinc-800 border-zinc-700 text-white flex-1 min-w-[160px]"
          data-testid="input-search-testimonies"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white w-[140px]" data-testid="select-category-filter">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="all" className="text-white">All categories</SelectItem>
            {TESTIMONY_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat} className="text-white">{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {featuredTestimony && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-sm text-yellow-400 mb-1">Currently Featured:</p>
          <p className="text-white font-medium">{featuredTestimony.title}</p>
        </div>
      )}

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filteredTestimonies.map((testimony) => (
          <div
            key={testimony.id}
            className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg gap-2"
            data-testid={`testimony-mod-${testimony.id}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-white font-medium truncate">{testimony.title}</p>
                {testimony.isFeatured && (
                  <Badge className="bg-yellow-500 text-black">Featured</Badge>
                )}
                {testimony.videoUrl && (
                  <Badge className="bg-purple-500">Video</Badge>
                )}
              </div>
              <p className="text-zinc-400 text-sm">
                {testimony.category} | {testimony.user?.firstName} {testimony.user?.lastName}
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => featureMutation.mutate(testimony.id)}
                disabled={featureMutation.isPending || testimony.isFeatured}
                className={testimony.isFeatured ? "text-yellow-500" : "text-zinc-400 hover:text-yellow-500"}
                data-testid={`button-feature-${testimony.id}`}
              >
                <Star className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this testimony?")) {
                    deleteMutation.mutate(testimony.id);
                  }
                }}
                disabled={deleteMutation.isPending}
                className="text-red-400 hover:text-red-300"
                data-testid={`button-delete-testimony-${testimony.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommentModeration() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const { data: comments, isLoading } = useQuery<(Comment & { user?: { firstName: string; lastName: string } })[]>({
    queryKey: ["/api/admin/comments"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/comments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
      toast({ title: "Comment deleted" });
    },
  });

  const filteredComments = (comments ?? []).filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = `${c.user?.firstName ?? ""} ${c.user?.lastName ?? ""}`.toLowerCase();
    return c.content.toLowerCase().includes(q) || name.includes(q);
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-2">
        <h3 className="text-lg font-semibold text-white">All Comments</h3>
        <Badge className="bg-zinc-700">{filteredComments.length}/{comments?.length || 0} comments</Badge>
      </div>

      <Input
        placeholder="Search by content or author..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-zinc-800 border-zinc-700 text-white"
        data-testid="input-search-comments"
      />

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filteredComments.map((comment) => (
          <div
            key={comment.id}
            className="p-3 bg-zinc-800 rounded-lg"
            data-testid={`comment-mod-${comment.id}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-zinc-400 text-xs mb-1">
                  {comment.user?.firstName} {comment.user?.lastName} | {comment.createdAt ? format(new Date(comment.createdAt), 'MMM d, yyyy') : 'Unknown'}
                </p>
                <p className="text-white text-sm">{comment.content}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this comment?")) {
                    deleteMutation.mutate(comment.id);
                  }
                }}
                disabled={deleteMutation.isPending}
                className="text-red-400 hover:text-red-300 shrink-0"
                data-testid={`button-delete-comment-${comment.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {filteredComments.length === 0 && (
          <p className="text-zinc-500 text-center py-4">
            {search.trim() ? "No comments match your search" : "No comments yet"}
          </p>
        )}
      </div>
    </div>
  );
}

function VideoModerationQueue() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: pendingVideos, isLoading } = useQuery<TestimonyWithUser[]>({
    queryKey: ["/api/admin/testimonies/pending-videos"],
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/admin/testimonies/${id}/approve-video`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonies/pending-videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
      toast({ title: "Video approved successfully" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/admin/testimonies/${id}/reject-video`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonies/pending-videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
      toast({ title: "Video rejected" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!pendingVideos || pendingVideos.length === 0) {
    return (
      <div className="text-center py-8">
        <Video className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
        <p className="text-zinc-500">No videos pending moderation</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-2">
        <h3 className="text-lg font-semibold text-white">Pending Videos</h3>
        <Badge className="bg-yellow-500 text-black">{pendingVideos.length} pending</Badge>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {pendingVideos.map((testimony) => (
          <div
            key={testimony.id}
            className="p-4 bg-zinc-800 rounded-lg space-y-3"
            data-testid={`video-moderation-${testimony.id}`}
          >
            <div>
              <p className="text-white font-medium">{testimony.title}</p>
              <p className="text-zinc-400 text-sm">
                {testimony.category} | {testimony.user?.firstName} {testimony.user?.lastName}
              </p>
            </div>

            {testimony.videoUrl && (
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  src={testimony.videoUrl}
                  controls
                  className="w-full h-full object-contain"
                  data-testid={`video-preview-${testimony.id}`}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => approveMutation.mutate(testimony.id)}
                disabled={approveMutation.isPending || rejectMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
                data-testid={`button-approve-${testimony.id}`}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => rejectMutation.mutate(testimony.id)}
                disabled={approveMutation.isPending || rejectMutation.isPending}
                className="flex-1"
                data-testid={`button-reject-${testimony.id}`}
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FaithDeclarationManagement() {
  const [newDeclaration, setNewDeclaration] = useState("");
  const [newBibleVerse, setNewBibleVerse] = useState("");
  const [newBibleReference, setNewBibleReference] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: declarations, isLoading } = useQuery<FaithDeclaration[]>({
    queryKey: ["/api/admin/faith-declarations"],
  });

  const createMutation = useMutation({
    mutationFn: (data: { declaration: string; bibleVerse: string; bibleReference: string; scheduledDate?: string }) =>
      apiRequest("POST", "/api/admin/faith-declarations", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faith-declarations"] });
      setNewDeclaration("");
      setNewBibleVerse("");
      setNewBibleReference("");
      setScheduledDate("");
      toast({ title: "Faith declaration created" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/admin/faith-declarations/${id}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faith-declarations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/faith-declaration/active"] });
      toast({ title: "Faith declaration activated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/faith-declarations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faith-declarations"] });
      toast({ title: "Faith declaration deleted" });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeclaration.trim() || !newBibleVerse.trim() || !newBibleReference.trim()) return;
    createMutation.mutate({
      declaration: newDeclaration.trim(),
      bibleVerse: newBibleVerse.trim(),
      bibleReference: newBibleReference.trim(),
      scheduledDate: scheduledDate || undefined,
    });
  };

  // Format a YYYY-MM-DD string for display
  const formatDate = (d: string) => {
    const [y, m, day] = d.split("-");
    const date = new Date(Number(y), Number(m) - 1, Number(day));
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  };

  // Today in local time for min-date on picker
  const todayStr = new Date().toLocaleDateString("en-CA"); // gives YYYY-MM-DD

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Faith Declarations</h3>

      <form onSubmit={handleCreate} className="space-y-3 p-4 bg-zinc-800 rounded-lg">
        <Textarea
          placeholder="Enter the faith declaration text..."
          value={newDeclaration}
          onChange={(e) => setNewDeclaration(e.target.value)}
          className="bg-zinc-900 border-zinc-700 text-white resize-none"
          rows={2}
          data-testid="input-declaration-text"
        />
        <Textarea
          placeholder="Enter the Bible verse text..."
          value={newBibleVerse}
          onChange={(e) => setNewBibleVerse(e.target.value)}
          className="bg-zinc-900 border-zinc-700 text-white resize-none"
          rows={2}
          data-testid="input-declaration-verse"
        />
        <Input
          placeholder="Bible reference (e.g., Romans 8:28)"
          value={newBibleReference}
          onChange={(e) => setNewBibleReference(e.target.value)}
          className="bg-zinc-900 border-zinc-700 text-white"
          data-testid="input-declaration-reference"
        />
        <div className="space-y-1">
          <label className="text-xs text-zinc-400 font-medium">
            Schedule for a specific date <span className="text-zinc-600">(optional — leave blank to set manually)</span>
          </label>
          <Input
            type="date"
            min={todayStr}
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="bg-zinc-900 border-zinc-700 text-white"
            data-testid="input-declaration-date"
          />
          {scheduledDate && (
            <p className="text-xs text-green-400">
              Will automatically go live on {formatDate(scheduledDate)} in each user's local timezone
            </p>
          )}
        </div>
        <Button
          type="submit"
          disabled={createMutation.isPending || !newDeclaration.trim() || !newBibleVerse.trim() || !newBibleReference.trim()}
          className="bg-red-500 hover:bg-red-600"
          data-testid="button-create-declaration"
        >
          {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
          {scheduledDate ? "Schedule Declaration" : "Add Declaration"}
        </Button>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-red-500" />
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {declarations?.map((declaration) => {
            const isScheduled = !!declaration.scheduledDate;
            const isPast = isScheduled && declaration.scheduledDate! < todayStr;
            return (
            <div
              key={declaration.id}
              className={`p-3 rounded-lg border ${
                declaration.isActive
                  ? "bg-green-500/10 border-green-500/30"
                  : isScheduled && !isPast
                  ? "bg-blue-500/10 border-blue-500/30"
                  : "bg-zinc-800 border-zinc-700"
              }`}
              data-testid={`declaration-${declaration.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm">{declaration.declaration}</p>
                  <p className="text-zinc-400 text-xs mt-1">"{declaration.bibleVerse}" — {declaration.bibleReference}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {declaration.isActive && (
                      <Badge className="bg-green-500 text-white text-[10px]">Active (fallback)</Badge>
                    )}
                    {isScheduled && !isPast && (
                      <Badge className="bg-blue-500 text-white text-[10px]">
                        Scheduled: {formatDate(declaration.scheduledDate!)}
                      </Badge>
                    )}
                    {isScheduled && isPast && (
                      <Badge className="bg-zinc-600 text-zinc-300 text-[10px]">
                        Was scheduled: {formatDate(declaration.scheduledDate!)}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 items-end">
                  {!declaration.isActive ? (
                    <Button
                      size="sm"
                      onClick={() => activateMutation.mutate(declaration.id)}
                      disabled={activateMutation.isPending}
                      className="bg-green-600 hover:bg-green-500 text-white text-xs px-3"
                      data-testid={`button-activate-${declaration.id}`}
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Set as Fallback
                    </Button>
                  ) : (
                    <span className="text-[11px] text-green-400 font-medium px-2">Fallback active</span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(declaration.id)}
                    disabled={deleteMutation.isPending}
                    className="text-red-400 hover:text-red-300 text-xs"
                    data-testid={`button-delete-${declaration.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          );})}
          {declarations?.length === 0 && (
            <p className="text-zinc-500 text-center py-4">No faith declarations yet</p>
          )}
        </div>
      )}
    </div>
  );
}

const TESTIMONY_CATEGORIES = [
  'Healing',
  'Marriage', 
  'Fruitfulness',
  'Finance',
  'Breakthrough',
  'Deliverance',
  'General'
] as const;

function UploadTestimony() {
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [category, setCategory] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: (data: { title: string; story: string; category: string; videoUrl?: string }) =>
      apiRequest("POST", "/api/admin/testimonies/upload", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonies/approved"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonies/pending-videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
      setTitle("");
      setStory("");
      setCategory("");
      setVideoUrl("");
      toast({ title: "Testimony uploaded successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    },
  });

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast({ title: "Error", description: "Please select a video file", variant: "destructive" });
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast({ title: "Error", description: "Video must be under 100MB", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const response = await fetch("/api/admin/uploads/proxy-video", {
        method: "POST",
        headers: {
          "Content-Type": file.type || "video/mp4",
          "X-Content-Type": file.type || "video/mp4",
        },
        credentials: "include",
        body: file,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }

      const { objectPath } = await response.json();
      setVideoUrl(objectPath);
      toast({ title: "Video uploaded successfully" });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !story.trim() || !category) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    uploadMutation.mutate({ title, story, category, videoUrl: videoUrl || undefined });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-zinc-300">Title *</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter testimony title"
            className="bg-zinc-800 border-zinc-700 text-white"
            data-testid="input-upload-title"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-300">Category *</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white" data-testid="select-upload-category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {TESTIMONY_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat} className="text-white hover:bg-zinc-700">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-300">Story *</Label>
          <Textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="Share the testimony story..."
            rows={6}
            className="bg-zinc-800 border-zinc-700 text-white resize-none"
            data-testid="input-upload-story"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-300">Video (Optional)</Label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
              id="video-upload"
              disabled={isUploading}
              data-testid="input-upload-video-file"
            />
            <label
              htmlFor="video-upload"
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md cursor-pointer hover:bg-zinc-700 transition-colors text-zinc-300"
              data-testid="button-upload-video"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {isUploading ? "Uploading..." : "Upload Video"}
            </label>
            {videoUrl && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <Check className="w-3 h-3 mr-1" />
                Video Ready
              </Badge>
            )}
          </div>
          {videoUrl && (
            <div className="mt-3 rounded-lg overflow-hidden bg-zinc-800 p-2">
              <video 
                src={videoUrl} 
                controls 
                className="w-full max-h-[200px] rounded"
                data-testid="video-preview"
              />
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-red-500 hover:bg-red-600"
          disabled={uploadMutation.isPending || isUploading}
          data-testid="button-submit-upload"
        >
          {uploadMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          Upload Testimony
        </Button>
      </form>
    </div>
  );
}

type FeaturedScheduleEntry = { id: string; testimonyId: string; scheduledDate: string; createdAt?: string | null; testimony?: any };

function FeaturedTestimonyManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [view, setView] = useState<"fallback" | "schedule">("fallback");
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");

  const todayStr = new Date().toLocaleDateString("en-CA");

  const formatDate = (d: string) => {
    const [y, m, day] = d.split("-");
    const date = new Date(Number(y), Number(m) - 1, Number(day));
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  };

  const { data: approvedTestimonies, isLoading } = useQuery<TestimonyWithUser[]>({
    queryKey: ["/api/admin/testimonies/approved"],
  });

  const { data: featuredScheduleData, isLoading: scheduleLoading } = useQuery<FeaturedScheduleEntry[]>({
    queryKey: ["/api/admin/featured-schedule"],
  });

  const featureMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/admin/testimonies/${id}/feature`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonies/approved"] });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonies/featured"] });
      toast({ title: "Set as fallback Stone of the Day" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const clearFeaturedMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/testimonies/clear-featured"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonies/approved"] });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonies/featured"] });
      toast({ title: "Fallback cleared" });
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: ({ testimonyId, scheduledDate }: { testimonyId: string; scheduledDate: string }) =>
      apiRequest("POST", "/api/admin/featured-schedule", { testimonyId, scheduledDate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/featured-schedule"] });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonies/featured"] });
      setSchedulingId(null);
      setScheduleDate("");
      toast({ title: "Stone of the Day scheduled" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/featured-schedule/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/featured-schedule"] });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonies/featured"] });
      toast({ title: "Schedule entry removed" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  const featuredTestimony = approvedTestimonies?.find(t => t.isFeatured);
  const allTestimonies = approvedTestimonies || [];

  const upcomingSchedule = (featuredScheduleData || []).filter(e => e.scheduledDate >= todayStr);
  const pastSchedule = (featuredScheduleData || []).filter(e => e.scheduledDate < todayStr);

  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setView("fallback")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${view === "fallback" ? "bg-yellow-500 text-black" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
          data-testid="tab-fallback"
        >
          Set Fallback
        </button>
        <button
          onClick={() => setView("schedule")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${view === "schedule" ? "bg-blue-500 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
          data-testid="tab-schedule"
        >
          Schedule Ahead ({upcomingSchedule.length})
        </button>
      </div>

      {view === "fallback" && (
        <div className="space-y-4">
          <p className="text-xs text-zinc-500">
            The fallback is shown on any day that doesn't have a scheduled Stone of the Day.
          </p>

          {featuredTestimony && (
            <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm text-yellow-400 font-medium">Current Fallback</span>
                  </div>
                  <h4 className="text-white font-semibold">{featuredTestimony.title}</h4>
                  <p className="text-zinc-400 text-xs mt-1 line-clamp-2">{featuredTestimony.story}</p>
                  <Badge className="bg-zinc-700 text-xs mt-2">{featuredTestimony.category}</Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => clearFeaturedMutation.mutate()}
                  disabled={clearFeaturedMutation.isPending}
                  className="border-zinc-700 text-zinc-300 shrink-0"
                  data-testid="button-clear-featured-main"
                >
                  <StarOff className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-[360px] overflow-y-auto">
            {allTestimonies.map((testimony) => (
              <div
                key={testimony.id}
                className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg gap-3"
                data-testid={`featured-select-${testimony.id}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h5 className="text-white font-medium text-sm truncate">{testimony.title}</h5>
                    {testimony.videoUrl && <Video className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs border-zinc-600">{testimony.category}</Badge>
                    <span className="text-zinc-500 text-xs">{testimony.amenCount || 0} amens</span>
                    {testimony.isFeatured && <Badge className="bg-yellow-500 text-black text-xs">Fallback</Badge>}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => featureMutation.mutate(testimony.id)}
                  disabled={featureMutation.isPending || testimony.isFeatured}
                  className={testimony.isFeatured ? "bg-yellow-500/30 text-yellow-400 text-xs shrink-0" : "bg-yellow-500 hover:bg-yellow-600 text-black shrink-0"}
                  data-testid={`button-feature-${testimony.id}`}
                >
                  <Star className="w-3.5 h-3.5 mr-1" />
                  {testimony.isFeatured ? "Current" : "Set Fallback"}
                </Button>
              </div>
            ))}
            {allTestimonies.length === 0 && (
              <p className="text-zinc-500 text-center py-4">No approved testimonies available</p>
            )}
          </div>
        </div>
      )}

      {view === "schedule" && (
        <div className="space-y-4">
          <p className="text-xs text-zinc-500">
            Schedule a specific testimony as Stone of the Day for any future date. It will switch automatically at midnight in each user's local timezone.
          </p>

          {/* Schedule an entry */}
          <div className="p-3 bg-zinc-800 rounded-lg space-y-2">
            <p className="text-white text-sm font-medium">Schedule a new date</p>
            <Input
              type="date"
              min={todayStr}
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="bg-zinc-900 border-zinc-700 text-white"
              data-testid="input-schedule-date"
            />
            {scheduleDate && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <p className="text-xs text-zinc-400">Pick the testimony for {formatDate(scheduleDate)}:</p>
                {allTestimonies.map((testimony) => (
                  <div
                    key={testimony.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg gap-2 cursor-pointer border transition-colors ${schedulingId === testimony.id ? "bg-blue-500/20 border-blue-500/40" : "bg-zinc-900 border-zinc-700 hover:border-zinc-500"}`}
                    onClick={() => setSchedulingId(schedulingId === testimony.id ? null : testimony.id)}
                    data-testid={`schedule-select-${testimony.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{testimony.title}</p>
                      <Badge variant="outline" className="text-[10px] border-zinc-600 mt-0.5">{testimony.category}</Badge>
                    </div>
                    {schedulingId === testimony.id && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
                  </div>
                ))}
              </div>
            )}
            <Button
              size="sm"
              disabled={!schedulingId || !scheduleDate || scheduleMutation.isPending}
              onClick={() => schedulingId && scheduleMutation.mutate({ testimonyId: schedulingId, scheduledDate: scheduleDate })}
              className="bg-blue-600 hover:bg-blue-500 text-white w-full"
              data-testid="button-confirm-schedule"
            >
              {scheduleMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Star className="w-4 h-4 mr-2" />}
              Confirm Schedule
            </Button>
          </div>

          {/* Upcoming schedule */}
          {scheduleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-zinc-500 mx-auto" />
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-300">Upcoming ({upcomingSchedule.length})</p>
              {upcomingSchedule.length === 0 && (
                <p className="text-zinc-500 text-xs text-center py-3">No upcoming scheduled entries</p>
              )}
              {upcomingSchedule.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg gap-2" data-testid={`schedule-entry-${entry.id}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-blue-300 text-xs font-semibold">{formatDate(entry.scheduledDate)}</p>
                    <p className="text-white text-sm font-medium truncate mt-0.5">{entry.testimony?.title || "Unknown testimony"}</p>
                    <Badge variant="outline" className="text-[10px] border-zinc-600 mt-0.5">{entry.testimony?.category || ""}</Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteScheduleMutation.mutate(entry.id)}
                    disabled={deleteScheduleMutation.isPending}
                    className="text-red-400 hover:text-red-300 shrink-0"
                    data-testid={`button-delete-schedule-${entry.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}

              {pastSchedule.length > 0 && (
                <>
                  <p className="text-sm font-medium text-zinc-500 mt-3">Past ({pastSchedule.length})</p>
                  {pastSchedule.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-zinc-800/60 border border-zinc-700 rounded-lg gap-2 opacity-60">
                      <div className="flex-1 min-w-0">
                        <p className="text-zinc-400 text-xs font-semibold">{formatDate(entry.scheduledDate)}</p>
                        <p className="text-zinc-300 text-sm truncate mt-0.5">{entry.testimony?.title || "Unknown"}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteScheduleMutation.mutate(entry.id)}
                        disabled={deleteScheduleMutation.isPending}
                        className="text-red-400 hover:text-red-300 shrink-0"
                        data-testid={`button-delete-past-${entry.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EncouragementVersesManagement() {
  const [newVerse, setNewVerse] = useState("");
  const [newReference, setNewReference] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: verses, isLoading } = useQuery<EncouragementVerse[]>({
    queryKey: ["/api/admin/encouragement-verses"],
  });

  const createMutation = useMutation({
    mutationFn: (data: { verse: string; reference: string }) =>
      apiRequest("POST", "/api/admin/encouragement-verses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/encouragement-verses"] });
      setNewVerse("");
      setNewReference("");
      toast({ title: "Encouragement verse created" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/admin/encouragement-verses/${id}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/encouragement-verses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/encouragement-verse"] });
      toast({ title: "Encouragement verse activated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/encouragement-verses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/encouragement-verses"] });
      toast({ title: "Encouragement verse deleted" });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVerse.trim() || !newReference.trim()) return;
    createMutation.mutate({ verse: newVerse.trim(), reference: newReference.trim() });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Encouragement Verses</h3>

      <form onSubmit={handleCreate} className="space-y-3 p-4 bg-zinc-800 rounded-lg">
        <Textarea
          placeholder="Enter the encouragement verse..."
          value={newVerse}
          onChange={(e) => setNewVerse(e.target.value)}
          className="bg-zinc-900 border-zinc-700 text-white resize-none"
          rows={2}
          data-testid="input-encouragement-verse"
        />
        <Input
          placeholder="Reference (e.g., Jeremiah 29:11)"
          value={newReference}
          onChange={(e) => setNewReference(e.target.value)}
          className="bg-zinc-900 border-zinc-700 text-white"
          data-testid="input-encouragement-reference"
        />
        <Button
          type="submit"
          disabled={createMutation.isPending || !newVerse.trim() || !newReference.trim()}
          className="bg-red-500 hover:bg-red-600"
          data-testid="button-create-verse"
        >
          {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
          Add Verse
        </Button>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-red-500" />
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {verses?.map((verse) => (
            <div
              key={verse.id}
              className={`p-3 rounded-lg border ${
                verse.isActive
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-zinc-800 border-zinc-700"
              }`}
              data-testid={`verse-${verse.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm">{verse.verse}</p>
                  <p className="text-zinc-400 text-xs mt-1">— {verse.reference}</p>
                  {verse.isActive && (
                    <Badge className="mt-2 bg-green-500 text-white">Active</Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  {!verse.isActive && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => activateMutation.mutate(verse.id)}
                      disabled={activateMutation.isPending}
                      className="text-green-400 hover:text-green-300"
                      data-testid={`button-activate-verse-${verse.id}`}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(verse.id)}
                    disabled={deleteMutation.isPending}
                    className="text-red-400 hover:text-red-300"
                    data-testid={`button-delete-verse-${verse.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {verses?.length === 0 && (
            <p className="text-zinc-500 text-center py-4">No encouragement verses yet</p>
          )}
        </div>
      )}
    </div>
  );
}

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { toast } = useToast();

  const changeMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      apiRequest("POST", "/api/admin/change-password", data),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Password changed successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    changeMutation.mutate({ currentPassword, newPassword });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Change Your Password</h3>
      <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-zinc-800 rounded-lg max-w-sm">
        <div className="relative">
          <Input
            type={showCurrent ? "text" : "password"}
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="bg-zinc-900 border-zinc-700 text-white pr-10"
            data-testid="input-current-password"
          />
          <button type="button" onClick={() => setShowCurrent((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200" tabIndex={-1}>
            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <div className="relative">
          <Input
            type={showNew ? "text" : "password"}
            placeholder="New password (min 8 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="bg-zinc-900 border-zinc-700 text-white pr-10"
            data-testid="input-new-password"
          />
          <button type="button" onClick={() => setShowNew((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200" tabIndex={-1}>
            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <div className="relative">
          <Input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-zinc-900 border-zinc-700 text-white pr-10"
            data-testid="input-confirm-password"
          />
          <button type="button" onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200" tabIndex={-1}>
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <Button
          type="submit"
          disabled={changeMutation.isPending || !currentPassword || !newPassword || !confirmPassword}
          className="bg-red-500 hover:bg-red-600"
          data-testid="button-change-password"
        >
          {changeMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Change Password
        </Button>
      </form>
    </div>
  );
}

function EmailDiagnostics() {
  const [toEmail, setToEmail] = useState("");
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const testMutation = useMutation({
    mutationFn: (email: string) =>
      apiRequest("POST", "/api/admin/test-email", { to: email }),
    onSuccess: (data: any) => {
      setResult(data);
    },
    onError: (error: any) => {
      toast({ title: "Request failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-4">
      <p className="text-zinc-400 text-sm">
        Send a test welcome email to any address to verify Resend is configured and the domain is working.
      </p>
      <div className="flex gap-2">
        <input
          type="email"
          placeholder="test@example.com"
          value={toEmail}
          onChange={(e) => setToEmail(e.target.value)}
          className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm"
        />
        <button
          onClick={() => testMutation.mutate(toEmail)}
          disabled={!toEmail || testMutation.isPending}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          {testMutation.isPending ? "Sending…" : "Send Test"}
        </button>
      </div>
      {result && (
        <div className={`rounded-lg p-4 text-sm font-mono space-y-1 ${result.success ? "bg-green-900/40 border border-green-700" : "bg-red-900/40 border border-red-700"}`}>
          {Object.entries(result).map(([k, v]) => (
            <div key={k}>
              <span className="text-zinc-400">{k}: </span>
              <span className="text-white">{String(v)}</span>
            </div>
          ))}
        </div>
      )}
      <p className="text-zinc-500 text-xs">
        If <code className="text-zinc-300">success: false</code> — check that: (1) RESEND_API_KEY is set in your Koyeb env vars, (2) the sending domain <code className="text-zinc-300">testifaith.com</code> is verified in your Resend dashboard, and (3) your Resend account is not in test-only mode.
      </p>
    </div>
  );
}

function AdminUserManagement() {
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [showNewAdminPwd, setShowNewAdminPwd] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: admins, isLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/admins"],
  });

  const createMutation = useMutation({
    mutationFn: (data: { username: string; password: string; displayName?: string }) =>
      apiRequest("POST", "/api/admin/admins", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/admins"] });
      setNewUsername("");
      setNewPassword("");
      setNewDisplayName("");
      toast({ title: "Admin created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/admins/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/admins"] });
      toast({ title: "Admin deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) return;
    createMutation.mutate({
      username: newUsername.trim(),
      password: newPassword,
      displayName: newDisplayName.trim() || undefined,
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Admin Users</h3>

      <form onSubmit={handleCreate} className="space-y-3 p-4 bg-zinc-800 rounded-lg">
        <Input
          placeholder="Username"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          className="bg-zinc-900 border-zinc-700 text-white"
          data-testid="input-admin-new-username"
        />
        <div className="relative">
          <Input
            type={showNewAdminPwd ? "text" : "password"}
            placeholder="Password (min 8 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="bg-zinc-900 border-zinc-700 text-white pr-10"
            data-testid="input-admin-new-password"
          />
          <button type="button" onClick={() => setShowNewAdminPwd((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200" tabIndex={-1}>
            {showNewAdminPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <Input
          placeholder="Display Name (optional)"
          value={newDisplayName}
          onChange={(e) => setNewDisplayName(e.target.value)}
          className="bg-zinc-900 border-zinc-700 text-white"
          data-testid="input-admin-new-displayname"
        />
        <Button
          type="submit"
          disabled={createMutation.isPending || !newUsername.trim() || newPassword.length < 8}
          className="bg-red-500 hover:bg-red-600"
          data-testid="button-create-admin"
        >
          {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
          Add Admin
        </Button>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-red-500" />
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {admins?.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
              data-testid={`admin-user-${admin.id}`}
            >
              <div>
                <p className="text-white font-medium">{admin.displayName || admin.username}</p>
                <p className="text-zinc-400 text-sm">@{admin.username}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete admin "${admin.username}"?`)) {
                    deleteMutation.mutate(admin.id);
                  }
                }}
                disabled={deleteMutation.isPending}
                className="text-red-400 hover:text-red-300"
                data-testid={`button-delete-admin-${admin.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {admins?.length === 0 && (
            <p className="text-zinc-500 text-center py-4">No admin users</p>
          )}
        </div>
      )}
    </div>
  );
}

function AuditLogs() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const { data: logs, isLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/admin/audit-logs"],
  });

  const getActionColor = (action: string) => {
    if (action.includes('delete') || action.includes('suspend')) return 'text-red-400';
    if (action.includes('create') || action.includes('approve') || action.includes('unsuspend')) return 'text-green-400';
    return 'text-blue-400';
  };

  const formatAction = (action: string) => {
    return action.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const filteredLogs = (logs ?? []).filter((log) => {
    if (actionFilter !== "all") {
      if (actionFilter === "create" && !log.action.includes("create")) return false;
      if (actionFilter === "delete" && !log.action.includes("delete")) return false;
      if (actionFilter === "suspend" && !log.action.includes("suspend")) return false;
      if (actionFilter === "approve" && !log.action.includes("approve")) return false;
      if (actionFilter === "feature" && !log.action.includes("feature")) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const adminName = (log.admin?.username ?? "").toLowerCase();
      const action = formatAction(log.action).toLowerCase();
      const details = (log.details ?? "").toLowerCase();
      if (!adminName.includes(q) && !action.includes(q) && !details.includes(q) && !log.targetType.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-2 flex-wrap">
        <h3 className="text-lg font-semibold text-white">Audit Logs</h3>
        <Badge className="bg-zinc-700">{filteredLogs.length}/{logs?.length || 0} entries</Badge>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Input
          placeholder="Search by action, admin, or details..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-zinc-800 border-zinc-700 text-white flex-1 min-w-0"
          data-testid="input-search-logs"
        />
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white w-40 shrink-0" data-testid="select-log-filter">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="all" className="text-white">All actions</SelectItem>
            <SelectItem value="create" className="text-white">Creates</SelectItem>
            <SelectItem value="delete" className="text-white">Deletes</SelectItem>
            <SelectItem value="suspend" className="text-white">Suspensions</SelectItem>
            <SelectItem value="approve" className="text-white">Approvals</SelectItem>
            <SelectItem value="feature" className="text-white">Featured</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="p-3 bg-zinc-800 rounded-lg"
            data-testid={`audit-log-${log.id}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-medium ${getActionColor(log.action)}`}>
                    {formatAction(log.action)}
                  </span>
                  <Badge variant="outline" className="text-xs border-zinc-600">
                    {log.targetType}
                  </Badge>
                </div>
                <p className="text-zinc-400 text-xs mt-1">
                  by {log.admin?.username || 'Unknown'} | {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm')}
                </p>
                {log.details && (
                  <p className="text-zinc-500 text-xs mt-1 truncate">
                    {log.details}
                  </p>
                )}
                {log.ipAddress && (
                  <p className="text-zinc-600 text-xs">IP: {log.ipAddress}</p>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredLogs.length === 0 && (
          <p className="text-zinc-500 text-center py-4">
            {search.trim() || actionFilter !== "all" ? "No logs match your filters" : "No audit logs yet"}
          </p>
        )}
      </div>
    </div>
  );
}

type SupportMsg = {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  adminNote: string | null;
  createdAt: string | null;
  resolvedAt: string | null;
  user: { firstName: string | null; lastName: string | null; email: string | null } | null;
};

function SupportMessages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteId, setNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const { data: messages = [], isLoading } = useQuery<SupportMsg[]>({
    queryKey: ["/api/admin/support-messages"],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, update }: { id: string; update: Record<string, string | null> }) =>
      apiRequest("PATCH", `/api/admin/support-messages/${id}`, update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support-messages"] });
      setNoteId(null);
      setNoteText("");
    },
    onError: () => toast({ variant: "destructive", title: "Update failed" }),
  });

  const statusColor: Record<string, string> = {
    open: "bg-red-500/20 text-red-400 border-red-500/30",
    read: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    resolved: "bg-green-500/20 text-green-400 border-green-500/30",
  };

  const openCount = messages.filter((m) => m.status === "open").length;

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Headphones className="w-5 h-5" />
              Support Messages
              {openCount > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-500 text-white">
                  {openCount} new
                </span>
              )}
            </CardTitle>
            <CardDescription className="text-zinc-400 mt-1">
              Messages submitted by users through the Help &amp; Support form
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No support messages yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusColor[msg.status] ?? statusColor.open}`}>
                        {msg.status}
                      </span>
                      <span className="text-white font-medium text-sm truncate">{msg.subject}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 flex-wrap">
                      <span className="font-medium text-zinc-400">{msg.name}</span>
                      <span>·</span>
                      <span>{msg.email}</span>
                      <span>·</span>
                      <Clock className="w-3 h-3" />
                      <span>{msg.createdAt ? new Date(msg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
                    className="text-zinc-400 hover:text-white transition-colors shrink-0 mt-0.5"
                    data-testid={`button-expand-message-${msg.id}`}
                  >
                    {expandedId === msg.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded content */}
                {expandedId === msg.id && (
                  <div className="border-t border-zinc-800 px-4 pb-4 pt-3 space-y-4">
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{msg.message}</p>

                    {/* Admin note */}
                    {noteId === msg.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Add an internal note…"
                          className="bg-zinc-900 border-zinc-700 text-white text-sm min-h-[80px] resize-none"
                          data-testid={`input-admin-note-${msg.id}`}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateMutation.mutate({ id: msg.id, update: { adminNote: noteText } })}
                            disabled={updateMutation.isPending}
                            data-testid={`button-save-note-${msg.id}`}
                          >
                            {updateMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            Save note
                          </Button>
                          <Button size="sm" variant="ghost" className="text-zinc-400" onClick={() => setNoteId(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {msg.adminNote && (
                          <div className="text-xs text-zinc-500 bg-zinc-900 rounded p-2 mb-2 italic">
                            Note: {msg.adminNote}
                          </div>
                        )}
                        <button
                          onClick={() => { setNoteId(msg.id); setNoteText(msg.adminNote ?? ""); }}
                          className="text-xs text-zinc-500 hover:text-zinc-300 underline"
                          data-testid={`button-add-note-${msg.id}`}
                        >
                          {msg.adminNote ? "Edit note" : "Add internal note"}
                        </button>
                      </div>
                    )}

                    {/* Status actions */}
                    <div className="flex gap-2 flex-wrap pt-1">
                      {msg.status === "open" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10"
                          onClick={() => updateMutation.mutate({ id: msg.id, update: { status: "read" } })}
                          disabled={updateMutation.isPending}
                          data-testid={`button-mark-read-${msg.id}`}
                        >
                          <Eye className="w-3 h-3 mr-1" /> Mark as read
                        </Button>
                      )}
                      {msg.status !== "resolved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-400 border-green-500/30 hover:bg-green-500/10"
                          onClick={() => updateMutation.mutate({ id: msg.id, update: { status: "resolved" } })}
                          disabled={updateMutation.isPending}
                          data-testid={`button-resolve-${msg.id}`}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" /> Mark as resolved
                        </Button>
                      )}
                      {msg.status === "resolved" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-zinc-500"
                          onClick={() => updateMutation.mutate({ id: msg.id, update: { status: "open" } })}
                          disabled={updateMutation.isPending}
                          data-testid={`button-reopen-${msg.id}`}
                        >
                          Reopen
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { toast } = useToast();

  const { data: supportMsgs = [] } = useQuery<{ id: string; status: string }[]>({
    queryKey: ["/api/admin/support-messages"],
    refetchInterval: 60000,
  });
  const openSupportCount = supportMsgs.filter((m) => m.status === "open").length;

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/admin/logout");
      toast({ title: "Logged out successfully" });
      onLogout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-['Space_Grotesk']">Admin Dashboard</h1>
            <p className="text-zinc-400">Manage users, content, and platform settings</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-zinc-700 text-zinc-300"
            data-testid="button-admin-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="analytics" className="w-full">
          <div className="overflow-x-auto hide-scrollbar">
            <TabsList className="flex w-max bg-zinc-900 border border-zinc-800 h-auto p-1 gap-1">
              <TabsTrigger value="analytics" className="whitespace-nowrap data-[state=active]:bg-red-500 data-[state=active]:text-white" data-testid="tab-analytics">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="users" className="whitespace-nowrap data-[state=active]:bg-red-500 data-[state=active]:text-white" data-testid="tab-users">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="content" className="whitespace-nowrap data-[state=active]:bg-red-500 data-[state=active]:text-white" data-testid="tab-content">
                <BookOpen className="w-4 h-4 mr-2" />
                Testimonies
              </TabsTrigger>
              <TabsTrigger value="comments" className="whitespace-nowrap data-[state=active]:bg-red-500 data-[state=active]:text-white" data-testid="tab-comments">
                <MessageSquare className="w-4 h-4 mr-2" />
                Comments
              </TabsTrigger>
              <TabsTrigger value="upload" className="whitespace-nowrap data-[state=active]:bg-red-500 data-[state=active]:text-white" data-testid="tab-upload">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="featured" className="whitespace-nowrap data-[state=active]:bg-red-500 data-[state=active]:text-white" data-testid="tab-featured">
                <Star className="w-4 h-4 mr-2" />
                Featured
              </TabsTrigger>
              <TabsTrigger value="videos" className="whitespace-nowrap data-[state=active]:bg-red-500 data-[state=active]:text-white" data-testid="tab-videos">
                <Video className="w-4 h-4 mr-2" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="declarations" className="whitespace-nowrap data-[state=active]:bg-red-500 data-[state=active]:text-white" data-testid="tab-declarations">
                <Heart className="w-4 h-4 mr-2" />
                Declarations
              </TabsTrigger>
              <TabsTrigger value="admins" className="whitespace-nowrap data-[state=active]:bg-red-500 data-[state=active]:text-white" data-testid="tab-admins">
                <Shield className="w-4 h-4 mr-2" />
                Admins
              </TabsTrigger>
              <TabsTrigger value="support" className="whitespace-nowrap data-[state=active]:bg-red-500 data-[state=active]:text-white" data-testid="tab-support">
                <Headphones className="w-4 h-4 mr-2" />
                Support
                {openSupportCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 data-[state=active]:bg-white data-[state=active]:text-red-500 text-white text-[9px] font-bold" data-testid="badge-support-count">
                    {openSupportCount > 9 ? "9+" : openSupportCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="logs" className="whitespace-nowrap data-[state=active]:bg-red-500 data-[state=active]:text-white" data-testid="tab-logs">
                <History className="w-4 h-4 mr-2" />
                Logs
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="analytics" className="mt-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Platform Analytics</CardTitle>
                <CardDescription className="text-zinc-400">Overview of platform statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
                <CardDescription className="text-zinc-400">Manage user accounts and suspensions</CardDescription>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="mt-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Testimony Moderation</CardTitle>
                <CardDescription className="text-zinc-400">Manage and feature testimonies</CardDescription>
              </CardHeader>
              <CardContent>
                <TestimonyModeration />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="mt-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Comment Moderation</CardTitle>
                <CardDescription className="text-zinc-400">Review and moderate comments</CardDescription>
              </CardHeader>
              <CardContent>
                <CommentModeration />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="mt-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Upload Testimony</CardTitle>
                <CardDescription className="text-zinc-400">Create a new testimony with optional video</CardDescription>
              </CardHeader>
              <CardContent>
                <UploadTestimony />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="featured" className="mt-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Testimony of the Day</CardTitle>
                <CardDescription className="text-zinc-400">Select which testimony appears on the homepage</CardDescription>
              </CardHeader>
              <CardContent>
                <FeaturedTestimonyManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos" className="mt-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Video Moderation Queue</CardTitle>
                <CardDescription className="text-zinc-400">Review and approve video testimonies</CardDescription>
              </CardHeader>
              <CardContent>
                <VideoModerationQueue />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="declarations" className="mt-6 space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Faith Declarations</CardTitle>
                <CardDescription className="text-zinc-400">Manage daily faith declarations</CardDescription>
              </CardHeader>
              <CardContent>
                <FaithDeclarationManagement />
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Encouragement Verses</CardTitle>
                <CardDescription className="text-zinc-400">Manage encouragement verses shown to users</CardDescription>
              </CardHeader>
              <CardContent>
                <EncouragementVersesManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admins" className="mt-6 space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Change Password</CardTitle>
                <CardDescription className="text-zinc-400">Update your admin account password</CardDescription>
              </CardHeader>
              <CardContent>
                <ChangePassword />
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Admin User Management</CardTitle>
                <CardDescription className="text-zinc-400">Manage admin accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminUserManagement />
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Email Diagnostics</CardTitle>
                <CardDescription className="text-zinc-400">Test that welcome emails are being delivered</CardDescription>
              </CardHeader>
              <CardContent>
                <EmailDiagnostics />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="mt-6">
            <SupportMessages />
          </TabsContent>

          <TabsContent value="logs" className="mt-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Audit Logs</CardTitle>
                <CardDescription className="text-zinc-400">Track admin actions for accountability</CardDescription>
              </CardHeader>
              <CardContent>
                <AuditLogs />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function Admin() {
  const { data: session, isLoading, refetch } = useQuery<AdminSession>({
    queryKey: ["/api/admin/session"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!session?.authenticated) {
    return <AdminLogin onLogin={() => refetch()} />;
  }

  return <AdminDashboard onLogout={() => refetch()} />;
}
