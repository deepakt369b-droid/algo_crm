"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MailIcon } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type Step = "email" | "otp";

export function LoginComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<Step>("email");
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "en";
  const dashboardUrl = `/${locale}/dashboard`;

  const loginWithGoogle = async () => {
    setIsLoading(true);
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(dashboardUrl)}`,
        },
      });
      if (error) throw error;
    } catch (error) {
      toast.error("Something went wrong with Google sign-in.");
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPassword = async () => {
    if (!email || !password) {
      toast.error("Please enter your email and password.");
      return;
    }
    setIsLoading(true);
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        toast.error(error.message || "Invalid credentials.");
        return;
      }
      toast.success("Login successful.");
      window.location.href = dashboardUrl;
    } catch (error) {
      toast.error("Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendOtp = async () => {
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    setIsLoading(true);
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        }
      });
      if (error) {
        toast.error(error.message || "Failed to send verification code.");
        return;
      }
      setStep("otp");
      toast.success("Verification code sent to your email.");
    } catch (error) {
      toast.error("Failed to send verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit code.");
      return;
    }
    setIsLoading(true);
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });
      if (error) {
        toast.error(error.message || "Invalid or expired code.");
        return;
      }
      toast.success("Login successful.");
      window.location.href = dashboardUrl;
    } catch (error) {
      toast.error("Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="wa-card shadow-2xl border border-border/40 my-5 bg-background/90 dark:bg-slate-900/90 backdrop-blur-md overflow-hidden relative group">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-primary dark:via-teal-400" />
      <CardHeader className="space-y-1 pt-6">
        <CardTitle className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-600 dark:to-teal-400 bg-clip-text text-transparent">Login</CardTitle>
        <CardDescription className="text-xs">Choose your sign-in method</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 pb-6">
        <Button
          variant="outline"
          onClick={loginWithGoogle}
          disabled={isLoading}
          className="w-full rounded-xl h-11 hover:scale-[1.01] active:scale-95 transition-all duration-200 border-border/60 hover:bg-muted"
        >
          <Icons.google className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/40" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background dark:bg-slate-900 px-2 text-muted-foreground text-[10px] font-semibold tracking-wider">
              Or continue with email
            </span>
          </div>
        </div>

        {step === "email" && (
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="email" className="text-xs font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="rounded-xl h-11 border-border/60 focus-visible:ring-primary/20"
              />
            </div>
            
            {loginMethod === "password" ? (
              <>
                <div className="grid gap-3">
                  <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    onKeyDown={(e) => e.key === "Enter" && loginWithPassword()}
                    className="rounded-xl h-11 border-border/60 focus-visible:ring-primary/20"
                  />
                </div>
                <Button onClick={loginWithPassword} disabled={isLoading || !email || !password} className="rounded-xl h-11 hover:scale-[1.01] active:scale-95 transition-all duration-200 shadow-md shadow-primary/10">
                  Sign In
                </Button>
                <div className="text-center mt-2">
                  <Button variant="link" onClick={() => setLoginMethod("otp")} className="text-xs text-muted-foreground">
                    Log in with OTP instead
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button onClick={sendOtp} disabled={isLoading || !email} className="rounded-xl h-11 hover:scale-[1.01] active:scale-95 transition-all duration-200 shadow-md shadow-primary/10">
                  <MailIcon className="mr-2 h-4 w-4" />
                  Send verification code
                </Button>
                <div className="text-center mt-2">
                  <Button variant="link" onClick={() => setLoginMethod("password")} className="text-xs text-muted-foreground">
                    Log in with Password instead
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {step === "otp" && (
          <div className="grid gap-3">
            <p className="text-xs text-muted-foreground text-center">
              Enter the 6-digit code sent to <strong className="text-foreground">{email}</strong>
            </p>
            <div className="flex justify-center my-2">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
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
            <Button onClick={verifyOtp} disabled={isLoading || otp.length !== 6} className="rounded-xl h-11 hover:scale-[1.01] active:scale-95 transition-all duration-200 shadow-md shadow-primary/10">
              Verify and sign in
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStep("email");
                setOtp("");
              }}
              disabled={isLoading}
              className="rounded-xl hover:bg-muted"
            >
              Use a different email
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
