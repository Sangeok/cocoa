export interface ContractSocialLinks {
  website: string;
  whitePaper: string;
  blog: string;
  reddit: string;
  slack: string;
  facebook: string;
  twitter: string;
  bitcointalk: string;
  github: string;
  telegram: string;
  wechat: string;
  linkedin: string;
  discord: string;
  email: string;
}

export interface ContractDetails extends ContractSocialLinks {
  deployedDate: string;
  lifetime: string;
  currentPrice: string;
  chain: string;
  scanned: string;
  updated: string;
  address: string;
  description: string;
  tokenType: string;
  tokenTotalSupply: string;
  tokenPriceUSD: number | null;
}

export interface RiskIndicator {
  name: string;
  severity: 'HIGH' | 'WARNING' | 'INFO';
  description: string;
  description_ko: string;
}

export interface RiskCategory {
  type: string;
  score: number;
  indicators: RiskIndicator[];
  summary: string[];
}

export interface ContractAnalysis {
  name: string;
  overallScore: number;
  maxScore: number;
  contractDetails: ContractDetails;
  riskIndicators: RiskCategory[];
}

export interface SearchParams {
  q?: string;
  page?: number;
  per_page?: number;
  lang?: 'en' | 'ko';
}

export interface ProjectSummary {
  rank: number;
  name: string;
  address: string;
  score: number;
  token: number;
  code: number;
  liquidity: number;
  sale: number;
}

export interface ContractSearchResponse {
  projects: ProjectSummary[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export type SecurityType = 'secure' | 'risky';

export interface TopProject {
  rank: number;
  name: string;
  address: string;
  score: number;
}

export interface TopResponse extends Array<TopProject> {}

export interface ExploreParams {
  page?: number;
  per_page?: number;
  type?: SecurityType;
}

export interface ExploreResponse {
  projects: ProjectSummary[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface TopParams {
  type: SecurityType;
}
