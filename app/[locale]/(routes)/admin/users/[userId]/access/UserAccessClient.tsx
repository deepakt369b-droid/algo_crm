"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { updateUserAccess } from "@/actions/update-user-access";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

interface UserAccessClientProps {
  userId: string;
  userName: string;
  initialTabs: string[];
}

const AVAILABLE_TABS = [
  "Dashboard",
  "CRM",
  "Campaigns",
  "Projects",
  "Emails",
  "Reports",
  "Documents",
  "Invoices",
  "Inventory",
  "Purchases",
];

export function UserAccessClient({ userId, userName, initialTabs }: UserAccessClientProps) {
  const [selectedTabs, setSelectedTabs] = useState<string[]>(initialTabs);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const toggleTab = (tab: string) => {
    setSelectedTabs((prev) =>
      prev.includes(tab) ? prev.filter((t) => t !== tab) : [...prev, tab]
    );
  };

  const selectAll = () => {
    setSelectedTabs([...AVAILABLE_TABS]);
  };

  const deselectAll = () => {
    setSelectedTabs([]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserAccess(userId, selectedTabs);
      toast.success("User access updated successfully");
      router.refresh();
      router.push("/admin/users");
    } catch (error) {
      toast.error("Failed to update user access");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mt-4">
      <CardHeader>
        <CardTitle>Manage Module Access for {userName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <Button variant="outline" size="sm" onClick={selectAll}>Select All</Button>
          <Button variant="outline" size="sm" onClick={deselectAll}>Deselect All</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AVAILABLE_TABS.map((tab) => (
            <div key={tab} className="flex items-center space-x-2">
              <Checkbox
                id={`tab-${tab}`}
                checked={selectedTabs.includes(tab)}
                onCheckedChange={() => toggleTab(tab)}
              />
              <label
                htmlFor={`tab-${tab}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {tab}
              </label>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push("/admin/users")}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  );
}
