"use client";

import { AuthProvider } from "@/components/AuthProvider";
import dynamic from "next/dynamic";

// Dynamically import heavy components to reduce initial bundle size
const NavigationOptimizer = dynamic(
  () => import("@/components/common/NavigationOptimizer"),
  { ssr: false }
);

const InstantNavigation = dynamic(
  () => import("@/components/common/InstantNavigation"),
  { ssr: false }
);

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <NavigationOptimizer />
      <InstantNavigation />
      {children}
    </AuthProvider>
  );
}
