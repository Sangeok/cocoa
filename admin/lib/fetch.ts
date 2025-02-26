import { API_ROUTE } from "./api";
import { useAuth } from "./store/use-auth";

export async function fetchWithAuth(url: string, config: RequestInit = {}) {
  try {
    const response = await fetch(url, config);
    if (response.status === 401) {
      const refreshToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("refresh_token="))
        ?.split("=")[1];

      if (!refreshToken) {
        throw new Error("로그인이 필요합니다.");
      }

      const refreshResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${API_ROUTE.ADMIN.REFRESH_TOKEN.url}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
          credentials: "include",
        }
      );

      const responseText = await refreshResponse.text();

      if (!refreshResponse.ok) {
        throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.");
      }

      let data;
      try {
        const parsedResponse = JSON.parse(responseText);
        data = parsedResponse;
      } catch (e) {
        console.error("JSON 파싱 에러:", e);
        throw new Error("토큰 응답을 파싱하는데 실패했습니다.");
      }

      if (!data?.accessToken || !data?.refreshToken) {
        console.error("Invalid token data:", data);
        throw new Error("토큰 발급에 실패했습니다.");
      }

      // 새 토큰 저장
      document.cookie = `access_token=${data.accessToken}; path=/`;
      document.cookie = `refresh_token=${data.refreshToken}; path=/`;

      // Zustand store 업데이트
      const auth = useAuth.getState();
      await auth.login({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      // 원래 요청 재시도
      const newConfig = {
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${data.accessToken}`,
        },
      };

      console.log("Final request config:", newConfig);
      return fetch(url, newConfig);
    }

    return response;
  } catch (error) {
    console.error("Fetch error:", error);
    if (
      error instanceof Error &&
      error.message === "세션이 만료되었습니다. 다시 로그인해주세요."
    ) {
      const auth = useAuth.getState();
      await auth.logout();
      window.location.href = "/login";
    }
    throw error;
  }
}
