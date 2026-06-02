"use client";

import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle, Clock, Check, Reply, User, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { updateTicketStatus } from "@/actions/feedback/feedback-tickets";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface FeedbackTicket {
  id: string;
  ticketRef: string;
  userId: string;
  subject: string | null;
  message: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  category: string | null;
  response: string | null;
  respondedBy: string | null;
  respondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  };
  responder?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface FeedbackManagerProps {
  initialTickets: any[];
}

const PRIORITY_BADGES = {
  LOW: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  HIGH: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  CRITICAL: "bg-destructive/10 text-destructive border-destructive/20 animate-pulse",
};

const STATUS_BADGES = {
  OPEN: "bg-red-500/10 text-red-600 border-red-500/20",
  IN_PROGRESS: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  RESOLVED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  CLOSED: "bg-muted text-muted-foreground border-border",
};

export default function FeedbackManager({ initialTickets }: FeedbackManagerProps) {
  const router = useRouter();
  const [tickets, setTickets] = useState<FeedbackTicket[]>(initialTickets);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<any>("RESOLVED");
  const [isPending, startTransition] = useTransition();

  const handleUpdate = async (ticketId: string) => {
    if (!selectedStatus) {
      toast.error("Please select a status.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateTicketStatus(ticketId, selectedStatus, responseText || undefined);
        if (result.success) {
          toast.success("Feedback ticket updated successfully!");
          setExpandedTicketId(null);
          setResponseText("");
          router.refresh();
        } else {
          toast.error(result.error || "Failed to update ticket.");
        }
      } catch (err) {
        toast.error("An error occurred.");
      }
    });
  };

  const filteredTickets = initialTickets.filter((ticket) => {
    if (activeTab === "ALL") return true;
    return ticket.status === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex border-b border-border/40 gap-4 overflow-x-auto pb-px">
        {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setExpandedTicketId(null);
            }}
            className={cn(
              "pb-3 text-xs font-bold uppercase tracking-wider border-b-2 px-1 transition-all duration-200",
              activeTab === tab
                ? "border-primary text-primary font-extrabold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.replace("_", " ")} ({tab === "ALL" ? initialTickets.length : initialTickets.filter((t) => t.status === tab).length})
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <Card className="wa-card p-12 text-center border border-border/40">
            <CheckCircle2 className="w-12 h-12 text-muted-foreground/35 mx-auto mb-4" />
            <p className="font-semibold text-muted-foreground text-sm">No tickets found in this segment.</p>
            <p className="text-xs text-muted-foreground/80 mt-1">Excellent job! Everything looks resolved.</p>
          </Card>
        ) : (
          filteredTickets.map((ticket) => {
            const isExpanded = expandedTicketId === ticket.id;
            const userInitials = ticket.user.name
              ? ticket.user.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : "U";

            return (
              <Card
                key={ticket.id}
                className={cn(
                  "wa-card border border-border/40 hover:border-primary/20 transition-all duration-200 overflow-hidden relative",
                  isExpanded && "border-primary/30 ring-1 ring-primary/10"
                )}
              >
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 rounded-full border border-border/30">
                        <AvatarImage src={ticket.user.avatar || undefined} alt={ticket.user.name || "User"} />
                        <AvatarFallback className="rounded-full bg-primary/10 text-primary font-bold text-xs">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-sm leading-none text-foreground">{ticket.user.name || "Unknown User"}</p>
                        <p className="text-xs text-muted-foreground/80 mt-1 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {ticket.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 select-none self-start sm:self-auto">
                      <span className={cn("text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border tracking-wide", PRIORITY_BADGES[ticket.priority as keyof typeof PRIORITY_BADGES])}>
                        {ticket.priority}
                      </span>
                      <span className={cn("text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border tracking-wide", STATUS_BADGES[ticket.status as keyof typeof STATUS_BADGES])}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-extrabold text-base leading-tight text-foreground">{ticket.subject || "No Subject"}</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{ticket.message}</p>
                  </div>

                  {ticket.response && (
                    <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Resolved by {ticket.responder?.name || "Superadmin"}
                        </span>
                        {ticket.respondedAt && (
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(ticket.respondedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-foreground/90 whitespace-pre-line leading-relaxed italic">
                        "{ticket.response}"
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-border/40 mt-4 pt-4 gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Ref: <span className="font-mono text-[10px]">{ticket.ticketRef.substring(0, 8)}</span> • Submitted {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setExpandedTicketId(isExpanded ? null : ticket.id);
                        setSelectedStatus(ticket.status);
                        setResponseText(ticket.response || "");
                      }}
                      className="rounded-xl h-8 text-xs font-semibold gap-1.5 hover:bg-muted"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      {ticket.response ? "Edit Response" : "Respond to Ticket"}
                    </Button>
                  </div>
                </div>

                {/* Response / Expand section */}
                {isExpanded && (
                  <div className="bg-muted/15 dark:bg-slate-900/10 border-t border-border/40 p-5 space-y-4">
                    <div className="h-px bg-border/20 -mx-5 mb-4" />
                    <h4 className="text-xs font-extrabold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
                      <Reply className="w-3.5 h-3.5" />
                      Superadmin Resolution Portal
                    </h4>
                    <div className="space-y-4">
                      <div className="grid gap-1.5">
                        <Label htmlFor={`status-${ticket.id}`} className="text-[11px] font-bold">Update Status</Label>
                        <select
                          id={`status-${ticket.id}`}
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="w-full max-w-[200px] rounded-xl h-10 border border-border/60 bg-background px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        >
                          <option value="OPEN">Open</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </div>

                      <div className="grid gap-1.5">
                        <Label htmlFor={`response-${ticket.id}`} className="text-[11px] font-bold">Response Note (Optional)</Label>
                        <Textarea
                          id={`response-${ticket.id}`}
                          placeholder="Type resolution notes or replies to the client..."
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          className="rounded-xl min-h-[80px] border-border/60"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setExpandedTicketId(null)}
                          className="rounded-xl h-9 text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleUpdate(ticket.id)}
                          className="rounded-xl h-9 text-xs bg-primary text-white hover:bg-primary/95"
                        >
                          {isPending ? "Saving..." : "Submit Updates"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
