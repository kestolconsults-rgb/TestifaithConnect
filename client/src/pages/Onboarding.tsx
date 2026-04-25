import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Heart, Sparkles, ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import { completeOnboardingSchema, type CompleteOnboarding } from "@shared/schema";

const FAITH_INTERESTS = [
  { id: "Healing", label: "Healing", description: "Physical, emotional, or spiritual healing" },
  { id: "Marriage", label: "Marriage", description: "Relationships and family" },
  { id: "Fruitfulness", label: "Fruitfulness", description: "Children and fertility" },
  { id: "Finance", label: "Finance", description: "Provision and prosperity" },
  { id: "Breakthrough", label: "Breakthrough", description: "Overcoming obstacles" },
  { id: "Deliverance", label: "Deliverance", description: "Freedom from bondage" },
  { id: "Career", label: "Career", description: "Work and calling" },
  { id: "Spiritual Growth", label: "Spiritual Growth", description: "Deeper walk with God" },
] as const;

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<CompleteOnboarding>({
    resolver: zodResolver(completeOnboardingSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      bio: "",
      faithInterests: [],
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (data: CompleteOnboarding) => {
      return apiRequest("POST", "/api/profile/onboarding", data);
    },
    onSuccess: async () => {
      toast({
        title: "Welcome to Testifaith!",
        description: "Your profile is all set up. Start exploring!",
      });
      
      // Invalidate and wait for queries to refetch before redirecting
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/profile"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/profile/onboarding-status"] }),
      ]);
      
      // Small delay to ensure React state updates before redirect
      setTimeout(() => {
        setLocation("/home");
      }, 100);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNext = async () => {
    if (step === 1) {
      const isValid = await form.trigger(["firstName", "lastName"]);
      if (isValid) setStep(2);
    } else if (step === 2) {
      const isValid = await form.trigger(["bio"]);
      if (isValid) setStep(3);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const onSubmit = (data: CompleteOnboarding) => {
    completeMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg rounded-2xl">
        <CardHeader className="text-center pb-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4">
            {step === 1 && <Heart className="h-8 w-8 text-primary" />}
            {step === 2 && <Sparkles className="h-8 w-8 text-primary" />}
            {step === 3 && <Check className="h-8 w-8 text-primary" />}
          </div>
          <CardTitle className="text-2xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {step === 1 && "Welcome to Testifaith!"}
            {step === 2 && "Tell Us About Yourself"}
            {step === 3 && "Your Faith Journey"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Let's set up your profile in just a few steps"}
            {step === 2 && "Share a bit about your faith journey"}
            {step === 3 && "What areas of faith are you most interested in?"}
          </CardDescription>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s === step ? "w-8 bg-primary" : s < step ? "w-2 bg-primary" : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="What should we call you?" 
                            {...field} 
                            data-testid="input-onboarding-firstname"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your last name" 
                            {...field} 
                            data-testid="input-onboarding-lastname"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 2 && (
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Share a bit about yourself and your faith journey..."
                          className="resize-none min-h-[120px]"
                          {...field}
                          data-testid="input-onboarding-bio"
                        />
                      </FormControl>
                      <FormDescription>This will be visible on your profile</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {step === 3 && (
                <FormField
                  control={form.control}
                  name="faithInterests"
                  render={() => (
                    <FormItem>
                      <FormLabel>Areas of Interest</FormLabel>
                      <FormDescription className="mb-4">
                        Select the areas where you're trusting God or interested in reading testimonies
                      </FormDescription>
                      <div className="grid grid-cols-2 gap-3">
                        {FAITH_INTERESTS.map((interest) => (
                          <FormField
                            key={interest.id}
                            control={form.control}
                            name="faithInterests"
                            render={({ field }) => (
                              <FormItem
                                key={interest.id}
                                className="flex items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(interest.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, interest.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== interest.id
                                            )
                                          )
                                    }}
                                    data-testid={`checkbox-interest-${interest.id.toLowerCase()}`}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="font-normal cursor-pointer">
                                    {interest.label}
                                  </FormLabel>
                                  <p className="text-xs text-muted-foreground">
                                    {interest.description}
                                  </p>
                                </div>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex justify-between pt-4">
                {step > 1 ? (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleBack}
                    data-testid="button-onboarding-back"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                ) : (
                  <div />
                )}
                
                {step < 3 ? (
                  <Button 
                    type="button" 
                    onClick={handleNext}
                    data-testid="button-onboarding-next"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={completeMutation.isPending}
                    data-testid="button-onboarding-complete"
                  >
                    {completeMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Complete Setup
                    <Check className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
