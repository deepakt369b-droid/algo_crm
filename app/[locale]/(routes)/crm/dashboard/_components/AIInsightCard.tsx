"use client";

import { useState, useEffect } from "react";
import { getOrganizationInsights } from "@/actions/ai/get-insights";
import { Bot, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AIInsightCard() {
  const [insight, setInsight] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getOrganizationInsights();
      if (response.error) {
        setError(response.error);
      } else if (response.insight) {
        setInsight(response.insight);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6 border-indigo-100 dark:border-indigo-900 shadow-sm bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
          <Bot className="h-5 w-5" />
          AI Organization Insights
        </CardTitle>
        <CardDescription>
          Get AI-powered analysis of your current CRM performance and opportunities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!insight && !error && !loading && (
          <Button 
            onClick={fetchInsights} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Generate Insights
          </Button>
        )}

        {loading && (
          <div className="flex items-center gap-3 text-muted-foreground animate-pulse">
            <Sparkles className="h-5 w-5 animate-spin" />
            <span className="text-sm">Analyzing CRM data...</span>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {insight && !loading && (
          <div className="text-sm leading-relaxed prose dark:prose-invert max-w-none">
            {insight.split('\n').map((paragraph, i) => (
              <p key={i} className="mb-2 last:mb-0">{paragraph}</p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
