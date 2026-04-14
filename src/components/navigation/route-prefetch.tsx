"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function RoutePrefetch({ routes }: { routes: string[] }) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const uniqueRoutes = Array.from(new Set(routes.filter(Boolean)));
    const callback = () => {
      for (const route of uniqueRoutes) {
        router.prefetch(route);
      }
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(callback);
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = setTimeout(callback, 250);
    return () => clearTimeout(timeoutId);
  }, [routes, router]);

  return null;
}
