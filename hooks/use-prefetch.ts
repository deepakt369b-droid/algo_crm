"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function usePrefetch() {
  const router = useRouter();

  const prefetch = useCallback(
    (url: string) => {
      // Prefetch the route
      router.prefetch(url);
    },
    [router]
  );

  return prefetch;
}
