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
      url: "/chat/:symbol",
      method: "GET",
    },
  },
} as const;
