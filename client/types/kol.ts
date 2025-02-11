export interface KOL {
  id: string;
  name: string;
  telegram?: string;
  youtube?: string;
  x?: string;
  followers: number;
  image: string;
  keywords: string[];
  selfIntroduction: string;
  registeredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface KOLData {
  list: KOL[];
  updatedAt: string;
}

export interface KOLResponse {
  success: boolean;
  data: KOL[];
}

export type KOLSortOption =
  | "followers-desc"
  | "followers-asc"
  | "registered-desc"
  | "registered-asc";
export type KOLSocialFilter = ("telegram" | "youtube" | "x")[];

export interface KOLFilterState {
  sort: KOLSortOption;
  socials: KOLSocialFilter;
}
