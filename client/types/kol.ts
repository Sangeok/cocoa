export interface KOL {
  name: string;
  link: {
    telegram?: string;
    youtube?: string;
    x?: string;
  };
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
