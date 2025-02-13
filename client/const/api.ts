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
  },
} as const;
