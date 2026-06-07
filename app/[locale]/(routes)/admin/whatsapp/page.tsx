import { WhatsAppInstanceCard } from "./WhatsAppInstanceCard";
import { listInstances } from "@/actions/whatsapp";
import { AddWhatsAppInstanceButton } from "./AddWhatsAppInstanceButton";

export default async function WhatsAppInstancesPage() {
  let instances: any[] = [];
  let error: string | null = null;

  try {
    instances = await listInstances();
  } catch (err: any) {
    console.error("Failed to load WhatsApp instances:", err);
    error = "Failed to load WhatsApp instances.";
  }

  return (
    <div className="p-6 space-y-6 bg-zinc-950 text-zinc-50 min-h-screen">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">WhatsApp Integration</h1>
          <p className="text-zinc-400 mt-1">Manage your connected WhatsApp instances.</p>
        </div>
        <AddWhatsAppInstanceButton />
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {instances.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/50 rounded-lg border border-zinc-800">
          <p className="text-zinc-400">No WhatsApp instances connected.</p>
          <div className="mt-4">
            <AddWhatsAppInstanceButton />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instances.map((instance) => (
            <WhatsAppInstanceCard 
              key={instance.id} 
              instance={instance as any} 
              // onDelete handler is not passed, WhatsAppInstanceCard handles its own deletes via Server Action, wait... 
              // Oh! Wait! `WhatsAppInstanceCard` previously received `onDelete` as a prop!
              // I need to check how it was used!
            />
          ))}
        </div>
      )}
    </div>
  );
}
