import { AdminUsersSkeleton } from "@/components/skeletons/admin-users-skeleton";
import Container from "@/app/[locale]/(routes)/components/ui/Container";

export default function Loading() {
  return (
    <Container title="Loading Users" description="Please wait while we load the user directory">
      <AdminUsersSkeleton />
    </Container>
  );
}
