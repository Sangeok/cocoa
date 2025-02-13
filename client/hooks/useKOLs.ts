import { useState, useEffect, useMemo } from "react";
import { apiClient } from "@/lib/axios";
import { API_ROUTES } from "@/const/api";
import { KOL, KOLSortOption, KOLSocialFilter } from "@/types/kol";
import { sortKOLs, filterKOLsBySocial } from "@/lib/kol";

export function useKOLs() {
  const [data, setData] = useState<KOL[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<KOLSortOption>("followers-desc");
  const [socialFilter, setSocialFilter] = useState<KOLSocialFilter>([]);

  useEffect(() => {
    const fetchKOLs = async () => {
      try {
        const response = await apiClient.get(API_ROUTES.KOL.GET.url);
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch KOLs:", err);
        setError("KOL 목록을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchKOLs();
  }, []);

  const filteredAndSortedKOLs = useMemo(() => {
    if (!data) return null;
    const filtered = filterKOLsBySocial(data, socialFilter);
    return sortKOLs(filtered, sortOption);
  }, [data, sortOption, socialFilter]);

  return {
    kols: filteredAndSortedKOLs,
    isLoading,
    error,
    sortOption,
    setSortOption,
    socialFilter,
    setSocialFilter,
  };
} 