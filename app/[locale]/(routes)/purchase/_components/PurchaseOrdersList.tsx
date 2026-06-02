"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ArrowUpDown } from "lucide-react";
import type { PurchaseOrderListItem } from "@/actions/purchase-orders/get-purchase-orders";

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "secondary",
  PENDING_APPROVAL: "outline",
  APPROVED: "default",
  REJECTED: "destructive",
  ORDERED: "default",
  PARTIALLY_RECEIVED: "secondary",
  RECEIVED: "default",
  CANCELLED: "destructive",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_APPROVAL: "Pending Approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  ORDERED: "Ordered",
  PARTIALLY_RECEIVED: "Partially Received",
  RECEIVED: "Received",
  CANCELLED: "Cancelled",
};

const columns: ColumnDef<PurchaseOrderListItem>[] = [
  {
    accessorKey: "orderNumber",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Order #
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Link href={`/purchase/${row.original.id}`} className="font-medium text-primary hover:underline">
        {row.original.orderNumber}
      </Link>
    ),
  },
  {
    accessorKey: "vendor",
    header: "Vendor",
    cell: ({ row }) => row.original.vendor?.name || "—",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={statusVariants[status] || "outline"}>
          {statusLabels[status] || status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "orderDate",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Order Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => new Date(row.original.orderDate).toLocaleDateString(),
  },
  {
    accessorKey: "lineItemCount",
    header: "Items",
    cell: ({ row }) => row.original.lineItemCount,
  },
  {
    accessorKey: "grandTotal",
    header: "Total",
    cell: ({ row }) => {
      const total = row.original.grandTotal;
      const symbol = row.original.currency === "EUR" ? "€" :
        row.original.currency === "USD" ? "$" :
        row.original.currency === "GBP" ? "£" :
        row.original.currency;
      return `${symbol} ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/purchase/${row.original.id}`}>
          <Eye className="h-4 w-4 mr-1" />
          View
        </Link>
      </Button>
    ),
  },
];

interface PurchaseOrdersListProps {
  orders: PurchaseOrderListItem[];
}

export function PurchaseOrdersList({ orders }: PurchaseOrdersListProps) {
  return (
    <DataTable
      columns={columns}
      data={orders}
      search="orderNumber"
    />
  );
}
