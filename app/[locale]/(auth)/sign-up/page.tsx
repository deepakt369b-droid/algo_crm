"use client";

import React, { Suspense, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { type EmailOtpType } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TemplateSelector } from "@/components/onboarding/TemplateSelector";
import CustomCrmPlayground from "@/components/onboarding/CustomCrmPlayground";
import { Sparkles as SparklesIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronLeft, ChevronRight, Loader2, Rocket, Globe, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";


export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <SignUpPageContent />
    </Suspense>
  );
}

function SignUpPageContent() {
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "en";
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "free";
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [otpType, setOtpType] = useState<EmailOtpType>("magiclink");
  const [formData, setFormData] = useState({
    workspaceName: "",
    workspaceSlug: "",
    firstName: "",
    lastName: "",
    email: "",
    otp: "",
    templateId: null as string | null,
  });

  const handleNext = async () => {
    if (step === 3) {
      // Send OTP
      setIsLoading(true);
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          mode: "sign-up",
          nextPath: `/${locale}/setup-password`,
        }),
      });
      const data = await response.json();
      setIsLoading(false);
      
      if (!response.ok) {
        toast.error(data.error || "Failed to send OTP");
        return;
      }
      setOtpType((data.type || "magiclink") as EmailOtpType);
      toast.success("Verification code sent!");
      setStep(4);
    } else {
      setStep((s: number) => Math.min(s + 1, 4));
    }
  };

  const handlePrev = () => setStep((s: number) => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      await handleNext();
      return;
    }
    
    setIsLoading(true);
    // Verify OTP and Sign In
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.verifyOtp({
      email: formData.email,
      token: formData.otp,
      type: otpType,
    });

    if (signInError) {
      setIsLoading(false);
      toast.error(signInError.message || "Invalid OTP code");
      return;
    }

    // Call server action to setup workspace
    try {
      const response = await fetch("/api/auth/setup-workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceName: formData.workspaceName,
          workspaceSlug: formData.workspaceSlug,
          firstName: formData.firstName,
          lastName: formData.lastName,
          templateId: formData.templateId,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to setup workspace");
      
      toast.success("Workspace created successfully!");
      router.push(`/${locale}/setup-password`);
    } catch (err: any) {
      toast.error(err.message);
      setIsLoading(false);
    }
  };

  const stepsMeta = [
    { label: "Workspace", desc: "Define your URL", icon: Globe },
    { label: "CRM Blueprint", desc: "Select industry", icon: Rocket },
    { label: "Admin Profile", desc: "Create account", icon: ShieldCheck },
  ];

  return (
    <div className={cn(
      "w-full transition-all duration-500 ease-in-out mx-auto px-4 py-8",
      step === 2 ? "max-w-7xl" : "max-w-md"
    )}>
      {/* Premium Stepper */}
      <div className="mb-10 relative">
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-muted -translate-y-1/2 z-0 hidden sm:block" />
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-2">
          {stepsMeta.map((s, idx) => {
            const i = idx + 1;
            const StepIcon = s.icon;
            const isCompleted = step > i;
            const isActive = step === i;
            
            return (
              <div 
                key={i} 
                className="flex items-center gap-3 sm:bg-background sm:px-4 transition-all duration-300"
              >
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-300 font-bold shadow-sm",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isActive && "bg-primary/10 border-primary text-primary ring-4 ring-primary/20",
                  !isCompleted && !isActive && "bg-muted/50 border-border text-muted-foreground"
                )}>
                  {isCompleted ? <Check className="w-5 h-5 stroke-[3px]" /> : <StepIcon className="w-5 h-5" />}
                </div>
                
                <div className="text-left flex flex-col sm:block">
                  <span className={cn(
                    "text-xs font-semibold uppercase tracking-wider block sm:inline",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    {s.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground block leading-tight">
                    {s.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SignUp Card */}
      <Card className="glass-card shadow-xl shadow-primary/5 border-border/50 transition-all duration-500 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <CardHeader className="border-b border-border/30 pb-5 pt-6 bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold tracking-tight">
                  {step === 1 && "Create your workspace"}
                  {step === 2 && "Choose your industry template"}
                  {step === 3 && "Create your admin account"}
                  {step === 4 && "Verify your email"}
                </CardTitle>
                <CardDescription className="text-xs mt-1 text-muted-foreground leading-relaxed">
                  {step === 1 && "This defines where your team collaborates and hosts your subdomains."}
                  {step === 2 && "We will configure your CRM modules, pipelines, and automated templates instantly."}
                  {step === 3 && "You'll be initialized as the primary Administrator of this workspace."}
                  {step === 4 && `Enter the 6-digit code sent to ${formData.email}`}
                </CardDescription>
              </div>
              <Badge variant="outline" className="shrink-0 bg-background/50 backdrop-blur border-primary/20 text-primary font-bold text-xs px-2 py-0.5">
                Step {step} of 4
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6 pb-6 flex-1">
            {step === 1 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="workspaceName" className="font-semibold text-sm">Workspace Name</Label>
                  <Input 
                    id="workspaceName" 
                    placeholder="Acme Corporation" 
                    required 
                    value={formData.workspaceName}
                    onChange={(e: any) => setFormData({
                      ...formData, 
                      workspaceName: e.target.value, 
                      workspaceSlug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-')
                    })}
                    className="h-11 border-border/70 hover:border-primary/30 focus:border-primary transition-colors"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="workspaceSlug" className="font-semibold text-sm">Workspace URL</Label>
                  <div className="flex items-center relative rounded-md shadow-sm">
                    <span className="text-muted-foreground bg-muted/60 px-3 py-3.5 rounded-l-md border border-r-0 text-xs font-semibold font-mono h-11 flex items-center select-none">
                      flowlinepro.io/
                    </span>
                    <Input 
                      id="workspaceSlug" 
                      className="rounded-l-none h-11 border-border/70 hover:border-primary/30 focus:border-primary transition-colors font-semibold" 
                      required 
                      value={formData.workspaceSlug}
                      onChange={(e: any) => setFormData({
                        ...formData, 
                        workspaceSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                      })}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                    Only lowercase letters, numbers, and dashes allowed.
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex max-h-[72vh] flex-col gap-6 overflow-y-auto pr-1 xl:max-h-none xl:overflow-visible xl:pr-0">
                <TemplateSelector 
                  selectedTemplateId={formData.templateId} 
                  onSelect={(id) => setFormData({...formData, templateId: id})} 
                />

                {formData.templateId === "custom" && (
                  <div className="border-t border-border/40 pt-6">
                    <div className="bg-primary/5 rounded-2xl border border-primary/20 p-4 mb-4 flex gap-3 text-xs leading-relaxed text-primary">
                      <SparklesIcon className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <p className="font-extrabold">Bespoke Workspace Builder Ready</p>
                        <p className="mt-0.5 opacity-90">Toggle your modules and custom fields below. These settings will dynamically customize your CRM database instance upon initialization.</p>
                      </div>
                    </div>
                    <CustomCrmPlayground 
                      onChange={(config) => {
                        (window as any)._customCrmConfig = config;
                      }} 
                    />
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="font-semibold text-sm">First Name</Label>
                    <Input 
                      id="firstName" 
                      placeholder="Jane"
                      required 
                      value={formData.firstName}
                      onChange={(e: any) => setFormData({...formData, firstName: e.target.value})}
                      className="h-11 border-border/70 hover:border-primary/30 focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="font-semibold text-sm">Last Name</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Doe"
                      required 
                      value={formData.lastName}
                      onChange={(e: any) => setFormData({...formData, lastName: e.target.value})}
                      className="h-11 border-border/70 hover:border-primary/30 focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-semibold text-sm">Work Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="jane@acme.com"
                    required 
                    value={formData.email}
                    onChange={(e: any) => setFormData({...formData, email: e.target.value})}
                    className="h-11 border-border/70 hover:border-primary/30 focus:border-primary transition-colors"
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col items-center justify-center space-y-6 py-4">
                <div className="text-center space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">Verification Code</p>
                </div>
                <InputOTP
                  maxLength={6}
                  value={formData.otp}
                  onChange={(v) => setFormData({...formData, otp: v})}
                  disabled={isLoading}
                >
                  <InputOTPGroup className="gap-1.5">
                    <InputOTPSlot index={0} className="rounded-xl border border-border/60 w-10 h-12 text-lg font-bold focus:border-primary focus:ring-2 focus:ring-primary/20" />
                    <InputOTPSlot index={1} className="rounded-xl border border-border/60 w-10 h-12 text-lg font-bold focus:border-primary focus:ring-2 focus:ring-primary/20" />
                    <InputOTPSlot index={2} className="rounded-xl border border-border/60 w-10 h-12 text-lg font-bold focus:border-primary focus:ring-2 focus:ring-primary/20" />
                    <InputOTPSlot index={3} className="rounded-xl border border-border/60 w-10 h-12 text-lg font-bold focus:border-primary focus:ring-2 focus:ring-primary/20" />
                    <InputOTPSlot index={4} className="rounded-xl border border-border/60 w-10 h-12 text-lg font-bold focus:border-primary focus:ring-2 focus:ring-primary/20" />
                    <InputOTPSlot index={5} className="rounded-xl border border-border/60 w-10 h-12 text-lg font-bold focus:border-primary focus:ring-2 focus:ring-primary/20" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between border-t border-border/30 pt-4 pb-5 bg-muted/10">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={handlePrev}
              disabled={step === 1 || isLoading}
              className="hover:bg-muted/80 h-10 px-4 text-xs font-semibold transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 mr-1.5" /> Back
            </Button>
            
            <Button 
              type="submit" 
              disabled={isLoading || (step === 2 && !formData.templateId) || (step === 4 && formData.otp.length !== 6)}
              className="h-10 px-5 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              {step < 3 ? (
                <>Next <ChevronRight className="w-4 h-4 ml-1.5" /></>
              ) : step === 3 ? (
                <>Send OTP <ChevronRight className="w-4 h-4 ml-1.5" /></>
              ) : (
                "Verify & Create Workspace"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      {/* Muted Login Helper */}
      <div className="text-center mt-6">
        <span className="text-xs text-muted-foreground">Already have a workspace? </span>
        <Link href={`/${locale}/sign-in`} className="text-xs font-bold text-primary hover:underline hover:text-primary-foreground transition-colors ml-0.5">
          Sign In
        </Link>
      </div>
    </div>
  );
}
