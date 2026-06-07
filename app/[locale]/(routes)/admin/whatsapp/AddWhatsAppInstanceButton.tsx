"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createInstance } from "@/actions/whatsapp";

export function AddWhatsAppInstanceButton() {
  const [loading, setLoading] = useState(false);

  const handleAddInstance = async () => {
    setLoading(true);
    try {
      const result = await createInstance({
        instanceName: `Instance ${Math.floor(Math.random() * 1000)}`,
      });
      
      if (result && "error" in result && result.error) {
        alert(result.error);
      }
      // The server action calls revalidatePath, which will refresh the instances list
    } catch (err: any) {
      alert(err.message || "Failed to add instance. Check tier limits.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleAddInstance} 
      disabled={loading} 
      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md"
    >
      {loading ? "Adding..." : "+ Add Instance"}
    </Button>
  );
}
