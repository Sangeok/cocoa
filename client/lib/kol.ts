import { KOL, KOLSortOption, KOLSocialFilterType } from "@/types/kol";

export function sortKOLs(kols: KOL[], sortOption: KOLSortOption): KOL[] {
  return [...kols].sort((a, b) => {
    switch (sortOption) {
      case "followers-desc":
        return b.followers - a.followers;
      case "followers-asc":
        return a.followers - b.followers;
      case "registered-desc":
        return b.id.localeCompare(a.id);
      case "registered-asc":
        return a.id.localeCompare(b.id);
      default:
        return 0;
    }
  });
}

export function filterKOLsBySocial(kols: KOL[], socialFilter: KOLSocialFilterType): KOL[] {
  if (socialFilter.length === 0) return kols;
  return kols.filter((kol) => socialFilter.every((social) => kol[social]));
} 