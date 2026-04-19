import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import { updateProfileSchema, updateSettingsSchema, addPasswordSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, User as UserIcon, Bell, Shield, Loader2, Lock, Check, Eye, EyeOff } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { Link } from "wouter";
import { z } from "zod";

type ProfileWithStats = User & {
  stats: {
    testimoniesCount: number;
    amenReceived: number;
    encourageReceived: number;
  };
};

const profileFormSchema = updateProfileSchema.extend({
  firstName: z.string().min(1, "First name is required").max(50),
});

type PasswordStatus = {
  hasPassword: boolean;
  hasGoogleLinked: boolean;
  authProvider: string;
};

export default function Settings() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: profile, isLoading } = useQuery<ProfileWithStats>({
    queryKey: ["/api/profile"],
    enabled: !!currentUser,
  });

  const { data: passwordStatus } = useQuery<PasswordStatus>({
    queryKey: ["/api/profile/has-password"],
    enabled: !!currentUser,
  });

  const profileForm = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
      website: profile?.website || "",
    },
    values: {
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
      website: profile?.website || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileFormSchema>) => {
      return apiRequest("PATCH", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof updateSettingsSchema>) => {
      return apiRequest("PATCH", "/api/profile/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Settings updated",
        description: "Your settings have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(addPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = passwordForm.watch("password");
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const addPasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof addPasswordSchema>) => {
      return apiRequest("POST", "/api/profile/add-password", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile/has-password"] });
      passwordForm.reset();
      toast({
        title: "Password added",
        description: "You can now sign in with your email and password.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSettingToggle = (key: string, value: boolean) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  const handleVisibilityChange = (visibility: "public" | "private") => {
    updateSettingsMutation.mutate({ profileVisibility: visibility });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const displayName = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || "Anonymous";
  const initials = [profile?.firstName?.[0], profile?.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/profile">
            <Button variant="ghost" size="icon" data-testid="button-back-to-profile">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'League Spartan', sans-serif" }}>
              Settings
            </h1>
            <p className="text-muted-foreground">Manage your profile and preferences</p>
          </div>
        </div>

        {/* Profile Section */}
        <Card className="rounded-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <UserIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mb-8">
              <Avatar className="w-20 h-20 border-2 border-primary/20">
                <AvatarImage src={profile?.profileImageUrl || undefined} alt={displayName} />
                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm text-muted-foreground">
                <p>Your profile picture is synced from your Google account.</p>
              </div>
            </div>

            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={profileForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your first name" {...field} data-testid="input-first-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your last name" {...field} data-testid="input-last-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={profileForm.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell others about yourself and your faith journey..." 
                          className="resize-none min-h-[100px]"
                          {...field} 
                          data-testid="input-bio"
                        />
                      </FormControl>
                      <FormDescription>Max 500 characters</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, Country" {...field} data-testid="input-location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://yourwebsite.com" {...field} data-testid="input-website" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-profile"
                >
                  {updateProfileMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="rounded-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Bell className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Choose what updates you receive</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notify-amen">Amen Notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified when someone says Amen to your testimony</p>
              </div>
              <Switch
                id="notify-amen"
                checked={profile?.notifyOnAmen ?? true}
                onCheckedChange={(checked) => handleSettingToggle("notifyOnAmen", checked)}
                disabled={updateSettingsMutation.isPending}
                data-testid="switch-notify-amen"
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notify-encourage">Encouragement Notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified when someone encourages your testimony</p>
              </div>
              <Switch
                id="notify-encourage"
                checked={profile?.notifyOnEncourage ?? true}
                onCheckedChange={(checked) => handleSettingToggle("notifyOnEncourage", checked)}
                disabled={updateSettingsMutation.isPending}
                data-testid="switch-notify-encourage"
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notify-comment">Comment Notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified when someone comments on your testimony</p>
              </div>
              <Switch
                id="notify-comment"
                checked={profile?.notifyOnComment ?? true}
                onCheckedChange={(checked) => handleSettingToggle("notifyOnComment", checked)}
                disabled={updateSettingsMutation.isPending}
                data-testid="switch-notify-comment"
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notify-verse">Daily Verse</Label>
                <p className="text-sm text-muted-foreground">Receive daily encouragement verses</p>
              </div>
              <Switch
                id="notify-verse"
                checked={profile?.notifyDailyVerse ?? true}
                onCheckedChange={(checked) => handleSettingToggle("notifyDailyVerse", checked)}
                disabled={updateSettingsMutation.isPending}
                data-testid="switch-notify-verse"
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="rounded-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <CardTitle>Privacy</CardTitle>
                <CardDescription>Control who can see your profile</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Profile Visibility</Label>
                <p className="text-sm text-muted-foreground">
                  {profile?.profileVisibility === 'public' 
                    ? "Anyone can view your profile and testimonies" 
                    : "Only you can see your profile details"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={profile?.profileVisibility === 'public' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleVisibilityChange('public')}
                  disabled={updateSettingsMutation.isPending}
                  data-testid="button-visibility-public"
                >
                  Public
                </Button>
                <Button
                  variant={profile?.profileVisibility === 'private' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleVisibilityChange('private')}
                  disabled={updateSettingsMutation.isPending}
                  data-testid="button-visibility-private"
                >
                  Private
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card className="rounded-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Lock className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>Manage your sign-in methods</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current sign-in methods status */}
            <div className="space-y-4">
              <Label className="text-base">Sign-in Methods</Label>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <SiGoogle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Google</p>
                    <p className="text-sm text-muted-foreground">
                      {passwordStatus?.hasGoogleLinked ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                {passwordStatus?.hasGoogleLinked && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Check className="h-4 w-4" />
                    <span className="text-sm">Active</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Email & Password</p>
                    <p className="text-sm text-muted-foreground">
                      {passwordStatus?.hasPassword ? "Password set" : "No password set"}
                    </p>
                  </div>
                </div>
                {passwordStatus?.hasPassword && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Check className="h-4 w-4" />
                    <span className="text-sm">Active</span>
                  </div>
                )}
              </div>
            </div>

            {/* Add password form - only show if user doesn't have a password */}
            {!passwordStatus?.hasPassword && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div>
                    <Label className="text-base">Add Email & Password Sign-in</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Set a password to sign in with your email address as an alternative to Google
                    </p>
                  </div>
                  
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit((data) => addPasswordMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Create a password"
                                  className="pr-12"
                                  data-testid="input-new-password"
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                                  onClick={() => setShowPassword(!showPassword)}
                                  data-testid="button-toggle-password"
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {password.length > 0 && (
                        <div className="space-y-2 text-sm">
                          <div className={`flex items-center gap-2 ${hasMinLength ? "text-green-600" : "text-muted-foreground"}`}>
                            <Check className={`h-4 w-4 ${hasMinLength ? "opacity-100" : "opacity-40"}`} />
                            At least 8 characters
                          </div>
                          <div className={`flex items-center gap-2 ${hasLetter ? "text-green-600" : "text-muted-foreground"}`}>
                            <Check className={`h-4 w-4 ${hasLetter ? "opacity-100" : "opacity-40"}`} />
                            Contains a letter
                          </div>
                          <div className={`flex items-center gap-2 ${hasNumber ? "text-green-600" : "text-muted-foreground"}`}>
                            <Check className={`h-4 w-4 ${hasNumber ? "opacity-100" : "opacity-40"}`} />
                            Contains a number
                          </div>
                        </div>
                      )}

                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showConfirmPassword ? "text" : "password"}
                                  placeholder="Confirm your password"
                                  className="pr-12"
                                  data-testid="input-confirm-new-password"
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  data-testid="button-toggle-confirm-password"
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        disabled={addPasswordMutation.isPending}
                        data-testid="button-add-password"
                      >
                        {addPasswordMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Add Password
                      </Button>
                    </form>
                  </Form>
                </div>
              </>
            )}

            {/* Show success message if both methods are active */}
            {passwordStatus?.hasPassword && passwordStatus?.hasGoogleLinked && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-600 font-medium">
                  Your account is fully linked! You can sign in with either Google or your email and password.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
