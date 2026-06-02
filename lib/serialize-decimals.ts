/**
 * Convert Prisma Decimal fields to plain numbers for passing to Client Components.
 * Decimal objects are not serializable across the server/client boundary.
 *
 * This function converts Decimal fields to numbers and Date fields to ISO strings
 * while preserving the original object structure and references.
 */
import { Decimal } from "@prisma/client/runtime/client";

/**
 * Known Decimal field names in the CRM schemas.
 * Only these fields will be converted to numbers.
 */
const DECIMAL_FIELDS = new Set([
  "budget",
  "expected_revenue",
  "snapshot_rate",
  "unit_price",
  "unit_cost",
  "tax_rate",
  "discount_value",
  "line_total",
  "quantity",
  "unitPrice",
  "discountPercent",
  "taxRateSnapshot",
  "lineSubtotal",
  "lineVat",
  "lineTotal",
  "amount",
  "rate",
  "value",
  "subtotal",
  "taxTotal",
  "grandTotal",
  "paidTotal",
  "balanceDue",
  "subtotal",
  "vatTotal",
  "custom_price",
  "receivedQuantity",
  "minQuantity",
  "maxQuantity",
  "reorderPoint",
  "reorderQuantity",
]);

/**
 * Known Date field names in the CRM schemas.
 * These fields will be converted to ISO strings for proper serialization.
 */
const DATE_FIELDS = new Set([
  "close_date",
  "created_on",
  "createdAt",
  "updatedAt",
  "last_activity",
  "deletedAt",
  "due_date",
  "start_date",
  "end_date",
  "valid_until",
  "invoice_date",
  "issue_date",
  "payment_date",
  "date",
]);

function isDecimalLike(val: unknown): val is Decimal {
  return (
    val !== null &&
    val !== undefined &&
    typeof val === "object" &&
    "toNumber" in val &&
    typeof (val as { toNumber?: unknown }).toNumber === "function"
  );
}

/**
 * Serialize Decimal and Date fields in an object, preserving the original
 * structure and references to prevent React hydration issues.
 */
export function serializeDecimals<T extends object>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj;

  // Create a shallow copy with spread operator to preserve object reference structure
  const result: Record<string, unknown> = { ...obj };

  for (const key of Object.keys(result)) {
    const val = result[key];

    // Skip null/undefined values
    if (val === null || val === undefined) continue;

    // Handle Decimal fields - convert to number
    if (
      (DECIMAL_FIELDS.has(key) || val instanceof Decimal || isDecimalLike(val)) &&
      typeof val === "object"
    ) {
      if (val instanceof Decimal) {
        result[key] = val.toNumber();
      } else if (isDecimalLike(val)) {
        result[key] = (val as { toNumber: () => number }).toNumber();
      }
      continue;
    }

    // Handle Date fields - convert to ISO string
    if (val instanceof Date) {
      if (DATE_FIELDS.has(key)) {
        result[key] = val.toISOString();
      }
      // Note: We preserve Date objects for fields not in DATE_FIELDS
      // because they might need to remain as Date objects
      continue;
    }

    // Also handle Date-like objects (some drivers return dates differently)
    if (
      typeof val === "object" &&
      val !== null &&
      !Array.isArray(val) &&
      (val as object).constructor?.name === "Date"
    ) {
      const dateVal = val as unknown as Date;
      if (DATE_FIELDS.has(key) && !isNaN(dateVal.getTime())) {
        result[key] = dateVal.toISOString();
      }
    }
  }

  return result as T;
}

/**
 * Serialize Decimal and Date fields in an array of objects.
 */
export function serializeDecimalsList<T extends object>(list: T[]): T[] {
  return list.map(serializeDecimals);
}