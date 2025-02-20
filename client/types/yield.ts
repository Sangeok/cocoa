export interface Yield {
  id: string;
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: string;
  apyBase: string | null;
  apyReward: string | null;
  apy: string | null;
  rewardTokens: string[] | null;
  pool: string;
  apyPct1D: string | null;
  apyPct7D: string | null;
  apyPct30D: string | null;
  stablecoin: boolean;
  ilRisk: string | null;
  exposure: string | null;
  predictedClass: string | null;
  predictedProbability: string | null;
  binnedConfidence: string | null;
  poolMeta: string | null;
  mu: string | null;
  sigma: string | null;
  count: string | null;
  outlier: boolean;
  underlyingTokens: string[] | null;
  il7d: string | null;
  apyBase7d: string | null;
  apyMean30d: string | null;
  volumeUsd1d: string | null;
  volumeUsd7d: string | null;
  apyBaseInception: string | null;
}

export interface PaginatedYields {
  data: Yield[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface ProjectSummary {
  project: string;
  chains: string[];
  symbols: string[];
  totalTvl: number;
  avgApy: number;
  yields: Yield[];
} 