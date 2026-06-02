"use server";

import { prismadb } from "@/lib/prisma";

export interface ProductOption {
  id: string;
  name: string;
  sku: string | null;
}

export async function getProductsForSelect(): Promise<ProductOption[]> {
  const products = await prismadb.crm_Products.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, sku: true },
    orderBy: { name: "asc" },
  });
  return products;
}
