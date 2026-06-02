"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";

// Single KPI card in the demo dashboard with sample inputs
export default function StorageQuota({
  actual,
  title,
}: {
  actual: number;
  title: string;
}) {
  const percent = parseFloat((100 * (actual / 2000)).toFixed(2));

  return (
    <Card className="wa-card wa-hover-lift border border-border/40 overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-purple-500/0 dark:to-teal-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{title}</CardTitle>
        <div className="p-2 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
          <Database className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="text-3xl font-extrabold tracking-tight">{actual} MB</div>
        <div className="flex justify-between mt-4">
          <p className="truncate text-xs text-muted-foreground">
            {percent}% ({actual} MB used)
          </p>
          <p className="text-xs text-muted-foreground font-semibold">2,000 MB quota</p>
        </div>
        <div className="mt-2 h-2.5 w-full rounded-full bg-muted dark:bg-muted/30 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500 dark:to-teal-400 transition-all duration-500"
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
