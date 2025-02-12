export interface CoinTalkMessageData {
  message: string;
  timestamp: number;
  nickname: string;
  userId?: number;  // 로그인 사용자의 경우에만 존재
  symbol: string;
}

export interface GlobalChatMessageData {
  message: string;
  timestamp: number;
  nickname: string;
  userId?: number;  // 로그인 사용자의 경우에만 존재
}
