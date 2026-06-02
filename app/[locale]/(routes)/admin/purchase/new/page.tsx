import { prismadb } from "@/lib/prisma";
import { CreatePurchaseOrderForm } from "./_components/CreatePurchaseOrderForm";

export default async function NewPurchaseOrderPage() {
  const [vendors, currencies] = await Promise.all([
    prismadb.crm_Accounts.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, email: true, website: true },
      orderBy: { name: "asc" },
    }),
    prismadb.currency.findMany({
      where: { isEnabled: true },
      select: { code: true, name: true, symbol: true },
    }),
  ]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">New Purchase Order</h2>
        <p className="text-muted-foreground mt-1">
          Create a new purchase order to order products and services from vendors.
        </p>
      </div>
      <CreatePurchaseOrderForm
        vendors={vendors.map((v) => ({ id: v.id, name: v.name, email: v.email, website: v.website }))}
        currencies={currencies.map((c) => ({ code: c.code, name: c.name, symbol: c.symbol }))}
      />
    </div>
  );
}
