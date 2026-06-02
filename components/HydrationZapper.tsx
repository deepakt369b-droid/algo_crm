"use client";

import { useEffect } from "react";

if (typeof window !== "undefined") {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    if (typeof args[0] === "string" && args[0].includes("A tree hydrated but some attributes of the server rendered HTML didn't match")) {
      // Specifically ignore bis_skin_checked and bis_register from Bitdefender
      if (args[0].includes("bis_skin_checked") || args[0].includes("bis_register") || args[0].includes("__processed_")) {
        return; // Suppress the hydration error
      }
      // Suppress the React 19 script tag warning for next-themes
      if (args[0].includes("Encountered a script tag while rendering React component")) {
        return;
      }
    }
    // Also suppress direct script tag warning
    if (typeof args[0] === "string" && args[0].includes("Encountered a script tag while rendering React component")) {
      return;
    }
    originalError.apply(console, args);
  };
}

export function HydrationZapper() {
  // This component doesn't render anything. It just patches console.error when the module is evaluated.
  return null;
}
