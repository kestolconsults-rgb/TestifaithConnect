import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Lock, Users, Globe, CalendarIcon, ChevronRight, ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

const CATEGORIES = [
  "Healing",
  "Marriage", 
  "Fruitfulness",
  "Finance",
  "Breakthrough",
  "Deliverance",
  "Career",
  "Spiritual Growth",
  "Others",
] as const;

const expectationFormSchema = z.object({
  title: z.string().min(5, "Please describe what you're believing God for (at least 5 characters)").max(200),
  description: z.string().max(2000).optional(),
  category: z.enum(CATEGORIES),
  privacy: z.enum(["private", "community", "public"]),
  targetDate: z.date().optional(),
});

type ExpectationFormData = z.infer<typeof expectationFormSchema>;

interface CreateExpectationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateExpectationDialog({ open, onOpenChange }: CreateExpectationDialogProps) {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const form = useForm<ExpectationFormData>({
    resolver: zodResolver(expectationFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Others",
      privacy: "private",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ExpectationFormData) => {
      const payload = {
        ...data,
        targetDate: data.targetDate?.toISOString(),
      };
      const response = await apiRequest("POST", "/api/expectations", payload);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/expectations/my"] });
      toast({
        title: "Faith expectation created!",
        description: "May God bring this to pass in His perfect timing.",
      });
      onOpenChange(false);
      form.reset();
      setStep(1);
      navigate(`/expectations/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create expectation",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: ExpectationFormData) => {
    createMutation.mutate(data);
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
    setStep(1);
  };

  const canProceedStep1 = form.watch("title")?.length >= 5 && form.watch("category");
  const canProceedStep2 = form.watch("privacy");

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl" style={{ fontFamily: "'League Spartan', sans-serif" }}>
            {step === 1 && "What are you believing God for?"}
            {step === 2 && "Privacy & Timing"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Declare your faith expectation - what you're trusting God to do"}
            {step === 2 && "Choose who can see this and set an optional target date"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {step === 1 && (
              <>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Faith Expectation</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="I am believing God for..."
                          {...field}
                          data-testid="input-expectation-title"
                        />
                      </FormControl>
                      <FormDescription>
                        Be specific about what you're believing God for
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
                          {CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Details (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share more context about your expectation, any scriptures God has given you, or specific details..."
                          className="min-h-24 resize-none"
                          {...field}
                          data-testid="input-expectation-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!canProceedStep1}
                    className="gap-2"
                    data-testid="button-next-step"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <FormField
                  control={form.control}
                  name="privacy"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel>Who can see this expectation?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="space-y-3"
                        >
                          <label className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer hover-elevate [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                            <RadioGroupItem value="private" id="private" className="mt-0.5" data-testid="radio-private" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Lock className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Private</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Only you can see this expectation. Perfect for personal prayers.
                              </p>
                            </div>
                          </label>

                          <label className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer hover-elevate [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                            <RadioGroupItem value="community" id="community" className="mt-0.5" data-testid="radio-community" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Community</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Visible to other Testifaith members who can pray with you.
                              </p>
                            </div>
                          </label>

                          <label className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer hover-elevate [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                            <RadioGroupItem value="public" id="public" className="mt-0.5" data-testid="radio-public" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Public</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Anyone can see this expectation, even without an account.
                              </p>
                            </div>
                          </label>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Target Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              data-testid="button-target-date"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>No target date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Set a date you're believing God will answer by (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="gap-2"
                    data-testid="button-back"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || !canProceedStep2}
                    className="gap-2"
                    data-testid="button-create-expectation-submit"
                  >
                    {createMutation.isPending ? "Creating..." : "Create Expectation"}
                  </Button>
                </div>
              </>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
