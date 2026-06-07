import { Skeleton } from "@/components/ui/skeleton";

import { InvoicesSkeleton } from "@/components/skeletons/invoices-skeleton";
import Container from "@/app/[locale]/(routes)/components/ui/Container";

export default function Loading() {
  return (
    <Container title="Loading Invoices" description="Please wait...">
      <InvoicesSkeleton />
    </Container>
  );
}
