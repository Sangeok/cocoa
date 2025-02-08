export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    limit: number;
    page: number;
    total?: number;
  };
}

export interface SocketResponse<T> {
  event: string;
  data: T;
}

export interface ExchangeRateData {
  rate: number;
  timestamp: number;
}

export interface ActiveUsersData {
  count: number;
} 