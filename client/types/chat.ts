export interface CoinTalkMessageData {
  message: string;
  timestamp: number;
  nickname: string;
  symbol: string;
  userId?: number;
}

export interface GlobalChatMessageData {
  message: string;
  timestamp: number;
  nickname: string;
  userId?: number;
}

interface GuestbookWithComments extends Guestbook {
  comments?: GuestbookComment[];
  isCommentsOpen?: boolean;
  hasMoreComments?: boolean;
} 