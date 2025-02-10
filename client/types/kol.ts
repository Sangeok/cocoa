export interface KOL {
  name: string;
  link: string;
  followers: number;
  image: string;
  keywords: string[];
  selfIntroduction: string;
  registeredAt: string;
}

export interface KOLData {
  list: KOL[];
  updatedAt: string;
} 