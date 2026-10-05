import { useEffect, useState, type FormEvent } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation, useRoute } from "wouter";
import type { TestimonyWithUser, UpdateTestimony } from "@shared/schema";
import { updateTestimonySchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, LockKeyhole, Users, Video } from "lucide-react";

const emptyEntry: UpdateTestimony = {
  title: "",
  category: "General",
  story: "",
  privacy: "private",
  isAnonymous: false,
};

export default function EditJournalEntry() {
  const [, params] = useRoute("/journal/:id/edit");
  const id = params?.id;
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [values, setValues] = useState<UpdateTestimony>(emptyEntry);

  const { data: entry, isLoading, isError } = useQuery<TestimonyWithUser>({
    queryKey: [`/api/testimonies/${id}`],
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (entry) {
      setValues({
        title: entry.title,
        category: entry.category as UpdateTestimony["category"],
        story: entry.story,
        privacy: entry.privacy as UpdateTestimony["privacy"],
        isAnonymous: entry.isAnonymous,
      });
    }
  }, [entry]);

  const saveMutation = useMutation({
    mutationFn: async (payload: UpdateTestimony) =>
      apiRequest("PATCH", `/api/testimonies/${id}`, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [`/api/testimonies/${id}`] }),
        queryClient.invalidateQueries({ queryKey: ["/api/testimonies/my"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/testimonies"] }),
      ]);
      toast({ title: "Entry updated", description: "Your journal entry has been saved." });
      navigate(`/testimony/${id}`);
    },
    onError: () => toast({
      title: "Couldn't save your entry",
      description: "Please check your connection and try again.",
      variant: "destructive",
    }),
  });

  const owned = Boolean(entry && user?.id === entry.userId);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = updateTestimonySchema.safeParse(values);
    if (!parsed.success) {
      toast({ title: "Check your entry", description: parsed.error.issues[0]?.message || "Please review the fields.", variant: "destructive" });
      return;
    }
    saveMutation.mutate(parsed.data);
  };

  if (isLoading) return <main className="mx-auto max-w-2xl px-5 py-12 text-center text-muted-foreground">Opening your entry…</main>;
  if (isError || !entry || !owned) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16 text-center">
        <h1 className="text-2xl font-semibold">Entry unavailable</h1>
        <p className="mt-2 text-muted-foreground">This entry may have been removed or may not belong to your account.</p>
        <Link href="/my-testimonies" className="mt-6 inline-flex text-primary underline">Back to My Faith</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 pb-28 pt-6 sm:px-6">
      <Link href={`/testimony/${entry.id}`} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to entry
      </Link>
      <header className="mb-7">
        <p className="text-sm font-medium text-primary">Your Faith Journal</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Edit your entry</h1>
        <p className="mt-2 text-muted-foreground">Update your memory or change who can see it. Private entries remain visible only to you.</p>
      </header>

      <form onSubmit={submit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="entry-title">Title</Label>
          <Input id="entry-title" value={values.title} maxLength={200} required minLength={5}
            onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="entry-category">Category</Label>
          <select id="entry-category" value={values.category}
            onChange={(event) => setValues((current) => ({ ...current, category: event.target.value as UpdateTestimony["category"] }))}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            {["Healing", "Marriage", "Fruitfulness", "Finance", "Breakthrough", "Deliverance", "General", "Others"].map((category) =>
              <option key={category} value={category}>{category}</option>
            )}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="entry-story">Your story</Label>
          <Textarea id="entry-story" value={values.story} required minLength={10} maxLength={10000} rows={10}
            onChange={(event) => setValues((current) => ({ ...current, story: event.target.value }))} />
          <p className="text-right text-xs text-muted-foreground">{values.story.length}/10,000</p>
        </div>
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Visibility</legend>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
            <input type="radio" name="privacy" value="private" checked={values.privacy === "private"}
              onChange={() => setValues((current) => ({ ...current, privacy: "private" }))} className="mt-1 accent-primary" />
            <span><span className="flex items-center gap-2 font-medium"><LockKeyhole className="h-4 w-4" /> Private journal</span><span className="mt-1 block text-sm text-muted-foreground">Only you can see this entry.</span></span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
            <input type="radio" name="privacy" value="public" checked={values.privacy === "public"}
              onChange={() => setValues((current) => ({ ...current, privacy: "public" }))} className="mt-1 accent-primary" />
            <span><span className="flex items-center gap-2 font-medium"><Users className="h-4 w-4" /> Share with the community</span><span className="mt-1 block text-sm text-muted-foreground">Your story can encourage others.</span></span>
          </label>
        </fieldset>
        {values.privacy === "public" && (
          <label className="flex items-start gap-3 text-sm text-muted-foreground">
            <input type="checkbox" checked={values.isAnonymous} onChange={(event) => setValues((current) => ({ ...current, isAnonymous: event.target.checked }))} className="mt-1 accent-primary" />
            Share anonymously
          </label>
        )}
        {entry.videoUrl && (
          <div className="flex items-start gap-3 rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
            <Video className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Your attached video will stay with this entry. To change the video, please contact support.</p>
          </div>
        )}
        <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => navigate(`/testimony/${entry.id}`)}>Cancel</Button>
          <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving…" : "Save changes"}</Button>
        </div>
      </form>
    </main>
  );
}
