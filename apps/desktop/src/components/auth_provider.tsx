"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getStorageItem } from "../lib/storage";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const token = await getStorageItem<string>("token");

      if (!token) {
        router.replace("/login");
      } else {
        setIsReady(true);
      }
    }
    checkAuth();
  }, [pathname, router]);

  if (!isReady) return null;

  return <>{children}</>;
}