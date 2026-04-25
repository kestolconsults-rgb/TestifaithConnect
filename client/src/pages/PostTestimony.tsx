import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { insertTestimonySchema, type InsertTestimony } from "@shared/schema";
import { CATEGORIES } from "@/lib/constants";
import { VideoRecorder } from "@/components/VideoRecorder";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Video, FileText, Upload, X, AlertCircle, Sparkles, PenLine, ChevronDown, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { GuidedTestimonyEditor, GuidedVideoPrompts } from "@/components/GuidedTestimonyEditor";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function PostTestimony() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [testimonyType, setTestimonyType] = useState<"text" | "video">("text");
  const [editorMode, setEditorMode] = useState<"guided" | "freeform">("guided");
  const [showRecorder, setShowRecorder] = useState(false);
  const [showVideoGuide, setShowVideoGuide] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [guidelinesAccepted, setGuidelinesAccepted] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/signin";
      }, 500);
    }
  }, [authLoading, isAuthenticated, toast]);

  const form = useForm<InsertTestimony>({
    resolver: zodResolver(insertTestimonySchema),
    defaultValues: {
      userId: "",
      title: "",
      category: "Others",
      story: "",
      isAnonymous: false,
      privacy: "public",
      videoUrl: null,
      thumbnailUrl: null,
      videoDuration: null,
    },
  });

  const handleVideoRecorded = (blob: Blob, duration: number) => {
    setVideoBlob(blob);
    setVideoDuration(duration);
    setVideoUrl(URL.createObjectURL(blob));
    setShowRecorder(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid file",
        description: "Please select a video file.",
        variant: "destructive",
      });
      return;
    }

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Video must be under 100MB.",
        variant: "destructive",
      });
      return;
    }

    setVideoBlob(file);
    setVideoUrl(URL.createObjectURL(file));
    
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      setVideoDuration(Math.floor(video.duration));
      URL.revokeObjectURL(video.src);
    };
    video.src = URL.createObjectURL(file);
  };

  const removeVideo = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoBlob(null);
    setVideoUrl(null);
    setVideoDuration(0);
  };

  const uploadVideo = async (): Promise<string | null> => {
    if (!videoBlob) return null;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const response = await fetch('/api/uploads/video-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `testimony-${Date.now()}.webm`,
          size: videoBlob.size,
          contentType: videoBlob.type || 'video/webm',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadURL, objectPath } = await response.json();
      setUploadProgress(30);

      await fetch(uploadURL, {
        method: 'PUT',
        body: videoBlob,
        headers: { 'Content-Type': videoBlob.type || 'video/webm' },
      });

      setUploadProgress(100);
      return objectPath;
    } catch (error) {
      console.error('Video upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: InsertTestimony) => {
      let videoPath = null;
      
      if (testimonyType === "video" && videoBlob) {
        videoPath = await uploadVideo();
      }

      const testimonyData = {
        ...data,
        videoUrl: videoPath,
        videoDuration: testimonyType === "video" ? videoDuration : null,
      };

      return await apiRequest("POST", "/api/testimonies", testimonyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonies"] });
      toast({
        title: "Success!",
        description: testimonyType === "video" 
          ? "Your video testimony has been submitted for review."
          : "Your testimony has been shared successfully.",
      });
      setLocation("/my-testimonies");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/signin";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to post testimony. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertTestimony) => {
    if (testimonyType === "video" && !videoBlob) {
      toast({
        title: "Video required",
        description: "Please record or upload a video for your testimony.",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate(data);
  };

  if (authLoading || !isAuthenticated) {
    return null;
  }

  if (showVideoGuide) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto">
              <div className="mb-8 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                  Prepare Your Story
                </h1>
                <p className="text-lg text-muted-foreground">
                  Review these prompts before recording to share your testimony effectively
                </p>
              </div>
              <GuidedVideoPrompts onReady={() => {
                setShowVideoGuide(false);
                setShowRecorder(true);
              }} />
              <div className="mt-4 text-center">
                <Button
                  variant="ghost"
                  onClick={() => setShowVideoGuide(false)}
                  data-testid="button-back-from-guide"
                >
                  Back to Form
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showRecorder) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                  Record Your Testimony
                </h1>
                <p className="text-lg text-muted-foreground">
                  Share your story through video (up to 3 minutes)
                </p>
              </div>
              <VideoRecorder
                onVideoRecorded={handleVideoRecorded}
                onCancel={() => setShowRecorder(false)}
                maxDurationSeconds={180}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'League Spartan', sans-serif" }} data-testid="text-page-title">
                Share Your Testimony
              </h1>
              <p className="text-lg text-muted-foreground">
                Your story could be the encouragement someone needs today
              </p>
            </div>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Tell Your Story</CardTitle>
                <CardDescription>
                  Share how God has worked in your life. Your testimony will encourage and inspire others.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={testimonyType} onValueChange={(v) => setTestimonyType(v as "text" | "video")} className="mb-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text" className="gap-2" data-testid="tab-text">
                      <FileText className="w-4 h-4" />
                      Written Testimony
                    </TabsTrigger>
                    <TabsTrigger value="video" className="gap-2" data-testid="tab-video">
                      <Video className="w-4 h-4" />
                      Video Testimony
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Give your testimony a meaningful title"
                              {...field}
                              data-testid="input-title"
                            />
                          </FormControl>
                          <FormDescription>
                            A brief, descriptive title for your testimony
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-category">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat} data-testid={`option-category-${cat.toLowerCase()}`}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose the category that best fits your testimony
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {testimonyType === "video" && (
                      <div className="space-y-4">
                        <FormLabel>Video</FormLabel>
                        {videoUrl ? (
                          <div className="space-y-4">
                            <div className="relative">
                              <VideoPlayer videoUrl={videoUrl} duration={videoDuration} />
                              <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                className="absolute top-2 right-2"
                                onClick={removeVideo}
                                data-testid="button-remove-video"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground text-center">
                              Duration: {Math.floor(videoDuration / 60)}:{(videoDuration % 60).toString().padStart(2, '0')}
                            </p>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed rounded-xl p-8 text-center space-y-4">
                            <Video className="w-12 h-12 mx-auto text-muted-foreground" />
                            <p className="text-muted-foreground">
                              Record a new video or upload an existing one
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowVideoGuide(true)}
                                data-testid="button-record-video"
                              >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Guided Recording
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setShowRecorder(true)}
                                data-testid="button-record-direct"
                              >
                                <Video className="w-4 h-4 mr-2" />
                                Record Directly
                              </Button>
                              <label>
                                <Button type="button" variant="outline" asChild>
                                  <span>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Video
                                  </span>
                                </Button>
                                <input
                                  type="file"
                                  accept="video/*"
                                  className="hidden"
                                  onChange={handleFileUpload}
                                  data-testid="input-upload-video"
                                />
                              </label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Maximum file size: 100MB. Supported formats: MP4, WebM, MOV
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-start gap-2 p-4 rounded-lg bg-muted/50">
                          <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                          <p className="text-sm text-muted-foreground">
                            Video testimonies are reviewed before being published to ensure they meet our community guidelines.
                          </p>
                        </div>
                      </div>
                    )}

                    {testimonyType === "text" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-base">Your Story</FormLabel>
                          <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
                            <Button
                              type="button"
                              variant={editorMode === "guided" ? "default" : "ghost"}
                              size="sm"
                              onClick={() => setEditorMode("guided")}
                              className="gap-1.5"
                              data-testid="button-mode-guided"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              Guided
                            </Button>
                            <Button
                              type="button"
                              variant={editorMode === "freeform" ? "default" : "ghost"}
                              size="sm"
                              onClick={() => setEditorMode("freeform")}
                              className="gap-1.5"
                              data-testid="button-mode-freeform"
                            >
                              <PenLine className="w-3.5 h-3.5" />
                              Free-form
                            </Button>
                          </div>
                        </div>

                        <FormField
                          control={form.control}
                          name="story"
                          render={({ field }) => (
                            <FormItem>
                              {editorMode === "guided" ? (
                                <GuidedTestimonyEditor
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                              ) : (
                                <>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Share your testimony in detail. How did God work in your life? What happened? How has it impacted your faith?"
                                      className="min-h-[300px] resize-none"
                                      {...field}
                                      data-testid="textarea-story"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Share the details of your testimony (minimum 10 characters)
                                  </FormDescription>
                                </>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {testimonyType === "video" && (
                      <FormField
                        control={form.control}
                        name="story"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Add a brief description of your video testimony"
                                className="min-h-[100px] resize-none"
                                {...field}
                                data-testid="textarea-story"
                              />
                            </FormControl>
                            <FormDescription>
                              A brief description to accompany your video (minimum 10 characters)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="privacy"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Keep Private</FormLabel>
                            <FormDescription>
                              Only you can see this — saved to your personal faith journal
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value === "private"}
                              onCheckedChange={(checked) => field.onChange(checked ? "private" : "public")}
                              data-testid="switch-privacy"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isAnonymous"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Post Anonymously</FormLabel>
                            <FormDescription>
                              Your name will not be displayed with this testimony
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-anonymous"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4 rounded-lg border border-red-500/30 bg-red-500/5 p-4">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="guidelines" className="border-0">
                          <AccordionTrigger className="hover:no-underline py-0" data-testid="accordion-guidelines">
                            <div className="flex items-center gap-2 text-left">
                              <BookOpen className="w-5 h-5 text-red-400 shrink-0" />
                              <span className="font-semibold text-foreground">Testimony Submission Guidelines</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-4 pb-0">
                            <div className="space-y-4 text-sm text-muted-foreground">
                              <p className="text-foreground font-medium">
                                TestiFaith exists to glorify Jesus Christ and bear witness to God's faithfulness. Every testimony shared on this platform should reflect that purpose.
                              </p>

                              <div>
                                <h4 className="font-semibold text-foreground mb-1">1. Christ Must Be the Focus</h4>
                                <p>All testimonies must clearly point to Jesus, not to an individual, ministry, brand, product, or personal achievement. Share what God did, not how impressive you are. Give glory to God alone, not to human effort. Avoid language that centers on self elevation.</p>
                                <p className="italic mt-1">"Let the redeemed of the Lord tell their story" - Psalm 107:2</p>
                              </div>

                              <div>
                                <h4 className="font-semibold text-foreground mb-1">2. Testimonies Are Not for Self Promotion</h4>
                                <p>TestiFaith is not a marketing platform. The following are not allowed:</p>
                                <ul className="list-disc list-inside mt-1 space-y-0.5">
                                  <li>Promotion of personal brands, businesses, ministries, or social media pages</li>
                                  <li>Requests for followers, donations, or support</li>
                                  <li>Mention of contact details, links, or handles</li>
                                  <li>Using testimony as a tool to build influence or visibility</li>
                                </ul>
                              </div>

                              <div>
                                <h4 className="font-semibold text-foreground mb-1">3. Speak of God's Faithfulness, Not Personal Glory</h4>
                                <p>Testimonies should highlight God's mercy, grace, power, healing, provision, or direction. His faithfulness through trials, waiting seasons, or breakthroughs. Transformation that points back to God's hand, not personal strength. Avoid exaggeration or storytelling meant to impress.</p>
                              </div>

                              <div>
                                <h4 className="font-semibold text-foreground mb-1">4. Be Honest, Reverent, and Edifying</h4>
                                <p>Share truthfully and with humility. Avoid sensationalism or dramatic exaggeration. Ensure your testimony encourages faith, hope, and trust in God. Testimonies should build up the body of Christ, not cause confusion or comparison.</p>
                              </div>

                              <div>
                                <h4 className="font-semibold text-foreground mb-1">5. Keep It Respectful and Biblically Aligned</h4>
                                <p>Language must be respectful, reverent, and clean. Content should align with biblical truth. Avoid controversial doctrines, accusations, or divisive narratives.</p>
                              </div>

                              <div>
                                <h4 className="font-semibold text-foreground mb-1">6. Protect Privacy and Dignity</h4>
                                <p>Do not expose private details of others without consent. Avoid naming individuals, organizations, or institutions in a harmful way. Keep sensitive information wise and discreet.</p>
                              </div>

                              <div>
                                <h4 className="font-semibold text-foreground mb-1">7. Testimonies Are Subject to Review</h4>
                                <p>All testimonies submitted on TestiFaith are reviewed before publishing, may be edited for clarity or alignment with platform values, and may be declined if they do not meet these guidelines. This is done to protect the spiritual purpose of the platform.</p>
                              </div>

                              <div>
                                <h4 className="font-semibold text-foreground mb-1">8. The Heart Behind the Testimony Matters</h4>
                                <p>Before submitting, ask yourself: Does this testimony glorify Jesus? Does it point people to faith in God? Would God be pleased with the motive behind this submission? If the answer is yes, you are welcome to share.</p>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      <div className="flex items-start gap-3 pt-2 border-t border-red-500/20">
                        <Checkbox
                          id="guidelines-checkbox"
                          checked={guidelinesAccepted}
                          onCheckedChange={(checked) => setGuidelinesAccepted(checked === true)}
                          className="mt-0.5 border-red-400 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                          data-testid="checkbox-guidelines"
                        />
                        <label
                          htmlFor="guidelines-checkbox"
                          className="text-sm font-medium cursor-pointer leading-relaxed"
                        >
                          I have read and agree to the Testimony Submission Guidelines. My testimony glorifies Jesus Christ and follows the community standards.
                        </label>
                      </div>
                    </div>

                    {isUploading && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Uploading video...</p>
                        <Progress value={uploadProgress} className="h-2" />
                      </div>
                    )}

                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        disabled={mutation.isPending || isUploading || !guidelinesAccepted}
                        className="flex-1"
                        data-testid="button-submit"
                      >
                        {mutation.isPending || isUploading ? "Posting..." : "Share Testimony"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setLocation("/")}
                        disabled={mutation.isPending || isUploading}
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
