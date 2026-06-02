import ResendCard from "../_components/ResendCard";
import WorkerMailCard from "../_components/WorkerMailCard";

export default function AdminServicesPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">System Services</h2>
        <p className="text-muted-foreground mt-1">
          Manage third-party transactional mailers and API endpoints for communication delivery.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ResendCard />
        <WorkerMailCard />
      </div>
    </div>
  );
}
