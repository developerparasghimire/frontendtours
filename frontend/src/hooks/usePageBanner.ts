"use client";

import { useEffect, useState } from "react";
import { getPageBanner, type PageBanner } from "@/lib/api";

export function usePageBanner(page: string) {
  const [banner, setBanner] = useState<PageBanner | null>(null);

  useEffect(() => {
    getPageBanner(page)
      .then(setBanner)
      .catch(() => {});
  }, [page]);

  return banner;
}
