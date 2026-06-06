"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { listInstances } from "@/actions/whatsapp";

interface SendWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactName: string;
  contactPhone: string;
}

export function SendWhatsAppModal({ isOpen, onClose, contactName, contactPhone }: SendWhatsAppModalProps) {
  const [instances, setInstances] = useState<any[] | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<string>("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      listInstances().then(setInstances).catch(console.error);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!selectedInstance) {
      toast.error("Please select a WhatsApp instance");
      return;
    }
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instanceId: selectedInstance,
          to: contactPhone,
          message: message.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to send message");
      }

      toast.success("Message sent successfully!");
      onClose();
      setMessage("");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setSending(false);
    }
  };

  const connectedInstances = instances?.filter(i => i.status === "CONNECTED") || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send WhatsApp Message</DialogTitle>
          <DialogDescription>
            Send a message to {contactName} ({contactPhone})
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">From WhatsApp Account</label>
            <Select value={selectedInstance} onValueChange={setSelectedInstance}>
              <SelectTrigger>
                <SelectValue placeholder="Select an instance..." />
              </SelectTrigger>
              <SelectContent>
                {connectedInstances.length === 0 ? (
                  <SelectItem value="none" disabled>No connected instances available</SelectItem>
                ) : (
                  connectedInstances.map((inst: any) => (
                    <SelectItem key={inst.id} value={inst.id}>{inst.instanceName}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={sending}>Cancel</Button>
          <Button onClick={handleSend} disabled={sending || !selectedInstance || connectedInstances.length === 0}>
            {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
