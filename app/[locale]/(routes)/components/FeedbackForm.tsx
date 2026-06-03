"use client";

import React, { useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFeedbackTicket } from "@/actions/feedback/feedback-tickets";
import { FeedbackPriority } from "@/lib/prisma-types";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Icons } from "@/components/ui/icons";

const formSchema = z.object({
  subject: z.string().min(1, {
    message: "Subject is required.",
  }),
  feedback: z.string().min(1, {
    message: "Feedback must be at least 1 character.",
  }),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
});

interface FeedbackFormProps {
  setOpen: (open: boolean) => void;
}

const FeedbackForm = ({ setOpen }: FeedbackFormProps) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      feedback: "",
      priority: "MEDIUM",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const result = await createFeedbackTicket({
        subject: data.subject,
        message: data.feedback,
        priority: data.priority as FeedbackPriority,
        category: "General",
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Thank you! Your feedback ticket has been raised successfully.");
        setOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold">Subject</FormLabel>
              <FormControl>
                <Input
                  placeholder="Summary of issue or suggestion"
                  disabled={loading}
                  className="rounded-xl h-10 border-border/60"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold">Priority</FormLabel>
              <FormControl>
                <select
                  disabled={loading}
                  value={field.value}
                  onChange={field.onChange}
                  className="w-full rounded-xl h-10 border border-border/65 bg-background px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="feedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold">Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your issue or suggestion in detail..."
                  disabled={loading}
                  className="rounded-xl min-h-[100px] border-border/60"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-[10px] text-muted-foreground leading-snug">
                This will submit a support ticket directly to our product engineering team. We appreciate your valuable feedback!
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="rounded-xl h-10 text-xs px-4"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="rounded-xl h-10 text-xs px-4 bg-primary text-white hover:bg-primary/95 shadow-md shadow-primary/5 active:scale-95 transition-transform">
            {loading ? (
              <div className="flex items-center space-x-2">
                <Icons.spinner className="h-3 w-3 animate-spin" />
                <span>Sending...</span>
              </div>
            ) : (
              "Raise Ticket"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FeedbackForm;
