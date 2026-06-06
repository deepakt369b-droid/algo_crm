"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { WhatsAppInstanceCard } from "./WhatsAppInstanceCard";
import { listInstances, createInstance, deleteInstance } from "@/actions/whatsapp";

export default function WhatsAppInstancesPage() {
  // Hardcoding tenantId for demo purposes. In reality, this comes from context/auth.
  const tenantId = "demo-tenant-123";

  const [instances, setInstances] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInstances = async () => {
    try {
      const data = await listInstances(tenantId);
      setInstances(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load WhatsApp instances.");
      setInstances([]);
    }
  };

  useEffect(() => {
    fetchInstances();
  }, [tenantId]);

  const handleAddInstance = async () => {
    setLoading(true);
    setError(null);
    try {
      await createInstance({
        tenantId,
        instanceName: `Instance ${Math.floor(Math.random() * 1000)}`,
      });
      await fetchInstances();
    } catch (err: any) {
      setError(err.message || "Failed to add instance. Check tier limits.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInstance = async (id: string) => {
    try {
      await deleteInstance({ id, tenantId });
      await fetchInstances();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-zinc-950 text-zinc-50 min-h-screen">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">WhatsApp Integration</h1>
          <p className="text-zinc-400 mt-1">Manage your connected WhatsApp instances.</p>
        </div>
        <Button onClick={handleAddInstance} disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md">
          {loading ? "Adding..." : "+ Add Instance"}
        </Button>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {!instances ? (
        <div className="text-zinc-500 animate-pulse">Loading instances...</div>
      ) : instances.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/50 rounded-lg border border-zinc-800">
          <p className="text-zinc-400">No WhatsApp instances connected.</p>
          <Button onClick={handleAddInstance} variant="outline" className="mt-4 border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            Connect your first number
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instances.map((instance) => (
            <WhatsAppInstanceCard 
              key={instance.id} 
              instance={instance as any} 
              tenantId={tenantId} 
              onDelete={(id) => handleDeleteInstance(id)} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
