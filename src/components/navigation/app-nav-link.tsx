"use client";

import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ComponentPropsWithoutRef } from "react";

type AppNavLinkProps = LinkProps &
  Omit<ComponentPropsWithoutRef<"a">, "href"> & {
    shouldWarm?: boolean;
  };

export function AppNavLink({
  href,
  shouldWarm = true,
  onMouseEnter,
  onFocus,
  onTouchStart,
  ...props
}: AppNavLinkProps) {
  const router = useRouter();

  function warmRoute() {
    if (!shouldWarm) {
      return;
    }

    router.prefetch(typeof href === "string" ? href : href.toString());
  }

  useEffect(() => {
    if (!shouldWarm) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const callback = () => warmRoute();
    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(callback);
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = setTimeout(callback, 250);
    return () => clearTimeout(timeoutId);
  }, [href, shouldWarm, router]);

  return (
    <Link
      {...props}
      href={href}
      prefetch
      onMouseEnter={(event) => {
        warmRoute();
        onMouseEnter?.(event);
      }}
      onFocus={(event) => {
        warmRoute();
        onFocus?.(event);
      }}
      onTouchStart={(event) => {
        warmRoute();
        onTouchStart?.(event);
      }}
    />
  );
}
