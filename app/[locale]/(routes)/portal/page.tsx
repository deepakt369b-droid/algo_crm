"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Simplified Customer Portal MVP
export default function CustomerPortal() {
  const [email, setEmail] = useState("");
  const [auth, setAuth] = useState(false);

  // In a real app, this would query Convex for invoices/opportunities linked to this email
  const handleLogin = () => {
    if (email.includes("@")) setAuth(true);
  };

  if (!auth) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-zinc-50 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Client Portal</CardTitle>
            <CardDescription className="text-zinc-400">Enter your email to access your documents.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
              type="email" 
              placeholder="you@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-zinc-950 border-zinc-800 text-zinc-100"
            />
            <Button onClick={handleLogin} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
              Access Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-end border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Welcome Back</h1>
            <p className="text-zinc-400 mt-1">{email}</p>
          </div>
          <Button variant="outline" onClick={() => setAuth(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100">Open Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-500 py-4 text-center">No outstanding invoices.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100">Active Proposals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-500 py-4 text-center">No active proposals to review.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
