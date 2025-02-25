export const API_ROUTES = {
  NEWS: {
    GET: {
      url: "/news",
      method: "GET",
    },
    RECENT: {
      url: "/news/recent",
      method: "GET",
    },
    READ: {
      url: "/news/read/:id",
      method: "GET",
    },
  },
  EXCHANGE: {
    MARKETS: {
      url: "/exchange/markets",
      method: "GET",
    },
    USD_PRICE: {
      url: "/exchange/usd-price",
      method: "GET",
    },
    GLOBAL_METRICS: {
      url: "/exchange/global-metrics",
      method: "GET",
    },
    FEAR_GREED_INDEX: {
      url: "/exchange/fear-greed-index",
      method: "GET",
    },
  },
  WITHDRAW: {
    PATH: {
      url: "/withdraw/path",
      method: "GET",
    },
  },
  KOL: {
    GET: {
      url: "/kols",
      method: "GET",
    },
  },
  CHAT: {
    GET: {
      url: "/chat",
      method: "GET",
    },
    GET_GLOBAL: {
      url: "/chat/global",
      method: "GET",
    },
  },
  USER: {
    PROFILE: {
      url: "/user/profile",
      method: "GET",
    },
    UPDATE_NAME: {
      url: "/user/name",
      method: "PATCH",
    },
    UPDATE: {
      url: "/user/profile",
      method: "PUT",
    },
    UPDATE_PHONE: {
      url: "/user/phone",
      method: "PATCH",
    },
    PUBLIC_PROFILE: {
      url: "/user/:userId",
      method: "GET",
    },
  },
  PREDICT: {
    GET: {
      url: "/predict",
      method: "GET",
    },
    POST: {
      url: "/predict",
      method: "POST",
    },
    RANKINGS: {
      url: "/predict/rankings",
      method: "GET",
    },
    STATS: {
      url: "/predict/stats",
      method: "GET",
    },
    LOGS: {
      url: "/predict/logs",
      method: "GET",
    },
    CHECK_IN: {
      url: "/predict/check-in",
      method: "POST",
    },
  },
  SCAMSCANNER: {
    CONTRACT_DETAIL: {
      url: "/scamscanner/contract/:address",
      method: "GET",
    },
    CONTRACT_SEARCH: {
      url: "/scamscanner/search",
      method: "GET",
    },
    EXPLORE: {
      url: "/scamscanner/explore",
      method: "GET",
    },
    TOP: {
      url: "/scamscanner/top",
      method: "GET",
    },
  },
  YIELDS: {
    GET: {
      url: "/yields",
      method: "GET",
    },
    PROJECT: {
      url: "/yields/project/:name",
      method: "GET",
    },
  },
  PROFILE_STATS: {
    GET: {
      url: "/profile-stats/:userId",
      method: "GET",
    },
    RECORD_VISIT: {
      url: "/profile-stats/:userId/visit",
      method: "POST",
    },
  },
  GUESTBOOK: {
    GET_GUESTBOOK: {
      url: "/guestbook/get/:guestbookId",
      method: "GET",
    },
    LIST: {
      url: "/guestbook",
      method: "GET",
    },
    CREATE: {
      url: "/guestbook",
      method: "POST",
    },
    GET_COMMENTS: {
      url: "/guestbook/:guestbookId/comments",
      method: "GET",
    },
    CREATE_COMMENT: {
      url: "/guestbook/:guestbookId/comments",
      method: "POST",
    },
    DELETE: {
      url: "/guestbook/:guestbookId",
      method: "DELETE",
    },
    DELETE_COMMENT: {
      url: "/guestbook/comments/:commentId",
      method: "DELETE",
    },
    UPDATE_COMMENT: {
      url: "/guestbook/comments/:commentId",
      method: "PATCH",
    },
  },
  NOTIFICATIONS: {
    GET: {
      url: "/notifications",
      method: "GET",
    },
    UNREAD: {
      url: "/notifications/unread",
      method: "GET",
    },
    MARK_AS_READ: {
      url: "/notifications/read/:id",
      method: "PATCH",
    },
    MARK_ALL_AS_READ: {
      url: "/notifications/read-all",
      method: "POST",
    },
    DELETE: {
      url: "/notifications/:id",
      method: "DELETE",
    },
  },
  STOCK_DISCUSSION: {
    LIST: {
      url: "/stock-discussion",
      method: "GET",
    },
    GET: {
      url: "/stock-discussion/get/:discussionId",
      method: "GET",
    },
    CREATE: {
      url: "/stock-discussion",
      method: "POST",
    },
    DELETE: {
      url: "/stock-discussion/:discussionId",
      method: "DELETE",
    },
    GET_COMMENTS: {
      url: "/stock-discussion/:discussionId/comments",
      method: "GET",
    },
    CREATE_COMMENT: {
      url: "/stock-discussion/:discussionId/comments",
      method: "POST",
    },
    UPDATE_COMMENT: {
      url: "/stock-discussion/comments/:commentId",
      method: "PATCH",
    },
    DELETE_COMMENT: {
      url: "/stock-discussion/comments/:commentId",
      method: "DELETE",
    },
  },
} as const;
