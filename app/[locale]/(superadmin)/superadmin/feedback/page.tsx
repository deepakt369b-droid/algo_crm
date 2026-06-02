import React from "react";
import { getSuperadminFeedbackTickets } from "@/actions/feedback/feedback-tickets";
import FeedbackManager from "./_components/FeedbackManager";

export default async function SuperAdminFeedbackPage() {
  const tickets = await getSuperadminFeedbackTickets();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Support & Feedback Tickets
        </h2>
        <p className="text-muted-foreground mt-1">
          Review issues, debug reports, and feature requests submitted by the platform's client team members.
        </p>
      </div>
      <FeedbackManager initialTickets={tickets} />
    </div>
  );
}
